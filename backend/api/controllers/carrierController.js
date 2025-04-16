/**
 * Carrier Controller
 *
 * Handles integration with shipping carrier APIs:
 * - UPS, FedEx, USPS, DHL, and LTL Freight
 * - Rate calculation, label generation, tracking
 * - Address validation
 */
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const UPSService = require('../../services/carriers/upsService');
const FedExService = require('../../services/carriers/fedexService');
const USPSService = require('../../services/carriers/uspsService');
const DHLService = require('../../services/carriers/dhlService');
const LTLFreightService = require('../../services/carriers/ltlFreightService');
const Shipment = require('../../models/shipmentModel');
const Order = require('../../models/orderModel');
const notificationService = require('../../utils/notificationService');

// Carrier service mapping
const carrierServices = {
  'UPS': UPSService,
  'FedEx': FedExService,
  'USPS': USPSService,
  'DHL': DHLService,
  'LTL Freight': LTLFreightService
};

/**
 * @desc    Get shipping rates from carriers
 * @route   POST /api/carriers/rates
 * @access  Private/Admin/Vendor
 */
exports.getShippingRates = asyncHandler(async (req, res, next) => {
  const { carrier, shipFrom, shipTo, packages, services, residential, negotiatedRates } = req.body;

  // Validate required fields
  if (!carrier || !shipFrom || !shipTo || !packages) {
    return next(new ErrorResponse('Missing required shipping information', 400));
  }

  try {
    let rates = [];

    // If carrier is specified, only get rates from that carrier
    if (carrier && carrier !== 'ALL') {
      if (!carrierServices[carrier]) {
        return next(new ErrorResponse(`Carrier ${carrier} not supported`, 400));
      }

      const carrierService = carrierServices[carrier];
      const carrierRates = await carrierService.getRates({
        shipFrom,
        shipTo,
        packages,
        services,
        residential,
        negotiatedRates
      });

      rates = carrierRates.map(rate => ({
        ...rate,
        carrierCode: carrier
      }));
    } else {
      // Get rates from all carriers
      const ratePromises = Object.entries(carrierServices).map(async ([carrierCode, service]) => {
        try {
          const carrierRates = await service.getRates({
            shipFrom,
            shipTo,
            packages,
            services,
            residential,
            negotiatedRates
          });

          return carrierRates.map(rate => ({
            ...rate,
            carrierCode
          }));
        } catch (error) {
          console.error(`Error getting rates from ${carrierCode}:`, error);
          return []; // Return empty array if carrier fails
        }
      });

      const results = await Promise.all(ratePromises);
      rates = results.flat();
    }

    // Sort rates by price
    rates.sort((a, b) => a.totalAmount - b.totalAmount);

    res.status(200).json({
      success: true,
      count: rates.length,
      rates
    });
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    return next(new ErrorResponse('Error getting shipping rates', 500));
  }
});

/**
 * @desc    Generate shipping label
 * @route   POST /api/carriers/labels
 * @access  Private/Admin/Vendor
 */
exports.generateLabel = asyncHandler(async (req, res, next) => {
  const {
    carrier,
    service,
    shipFrom,
    shipTo,
    packages,
    packageType,
    signature,
    insurance,
    returnLabel,
    saturdayDelivery,
    containsAlcohol,
    orderId
  } = req.body;

  // Validate required fields
  if (!carrier || !service || !shipFrom || !shipTo || !packages || packages.length === 0) {
    return next(new ErrorResponse('Missing required shipping information', 400));
  }

  // Check if carrier is supported
  if (!carrierServices[carrier]) {
    return next(new ErrorResponse(`Carrier ${carrier} not supported`, 400));
  }

  try {
    // Generate label with carrier service
    const carrierService = carrierServices[carrier];
    const labelResult = await carrierService.generateLabel({
      service,
      shipFrom,
      shipTo,
      packages,
      packageType,
      signature,
      insurance,
      returnLabel,
      saturdayDelivery,
      containsAlcohol
    });

    // If associated with an order, create a shipment record
    if (orderId) {
      const order = await Order.findById(orderId);

      if (!order) {
        return next(new ErrorResponse(`Order not found with id of ${orderId}`, 404));
      }

      // Create shipment record
      const shipment = await Shipment.create({
        order: orderId,
        carrier,
        serviceLevel: service,
        trackingNumber: labelResult.trackingNumber,
        trackingUrl: labelResult.trackingUrl,
        shippingLabelUrl: labelResult.labelUrl,
        shippingDate: new Date(),
        estimatedDeliveryDate: labelResult.estimatedDelivery,
        status: 'created',
        cost: labelResult.cost,
        dimensions: packages[0].dimensions, // Store first package dimensions for now
        isReturn: !!returnLabel
      });

      // Update order's tracking information and status
      order.trackingNumber = labelResult.trackingNumber;
      order.trackingUrl = labelResult.trackingUrl;

      if (!order.isShipped) {
        order.isShipped = true;
        order.shippedAt = Date.now();
        order.status = 'Shipped';
      }

      await order.save();

      // Send notifications
      await notificationService.createShipmentCreatedNotification(order, shipment);
    }

    res.status(200).json({
      success: true,
      data: labelResult
    });
  } catch (error) {
    console.error('Error generating shipping label:', error);
    return next(new ErrorResponse('Error generating shipping label', 500));
  }
});

/**
 * @desc    Validate shipping address
 * @route   POST /api/carriers/validate-address
 * @access  Private/Admin/Vendor
 */
exports.validateAddress = asyncHandler(async (req, res, next) => {
  const { carrier, address } = req.body;

  // Validate required fields
  if (!carrier || !address) {
    return next(new ErrorResponse('Missing carrier or address information', 400));
  }

  // Check if carrier is supported
  if (!carrierServices[carrier]) {
    return next(new ErrorResponse(`Carrier ${carrier} not supported`, 400));
  }

  try {
    // Validate address with carrier service
    const carrierService = carrierServices[carrier];
    const validationResult = await carrierService.validateAddress(address);

    res.status(200).json({
      success: true,
      data: validationResult
    });
  } catch (error) {
    console.error('Error validating address:', error);
    return next(new ErrorResponse('Error validating address', 500));
  }
});

/**
 * @desc    Get tracking info from carrier
 * @route   GET /api/carriers/tracking/:carrier/:trackingNumber
 * @access  Private
 */
exports.getTrackingInfo = asyncHandler(async (req, res, next) => {
  const { carrier, trackingNumber } = req.params;

  // Check if carrier is supported
  if (!carrierServices[carrier]) {
    return next(new ErrorResponse(`Carrier ${carrier} not supported`, 400));
  }

  try {
    // Get tracking info from carrier service
    const carrierService = carrierServices[carrier];
    const trackingInfo = await carrierService.getTracking(trackingNumber);

    res.status(200).json({
      success: true,
      data: trackingInfo
    });
  } catch (error) {
    console.error('Error getting tracking info:', error);
    return next(new ErrorResponse('Error getting tracking information', 500));
  }
});

/**
 * @desc    Cancel shipment with carrier
 * @route   DELETE /api/carriers/shipments/:carrier/:shipmentId
 * @access  Private/Admin/Vendor
 */
exports.cancelShipment = asyncHandler(async (req, res, next) => {
  const { carrier, shipmentId } = req.params;

  // Check if carrier is supported
  if (!carrierServices[carrier]) {
    return next(new ErrorResponse(`Carrier ${carrier} not supported`, 400));
  }

  try {
    // Cancel shipment with carrier service
    const carrierService = carrierServices[carrier];
    const cancellationResult = await carrierService.cancelShipment(shipmentId);

    // If we have a tracking number reference, update the shipment record
    if (req.body.trackingNumber) {
      const shipment = await Shipment.findOne({ trackingNumber: req.body.trackingNumber });

      if (shipment) {
        shipment.status = 'cancelled';
        await shipment.save();

        // Also update the order if needed
        const order = await Order.findById(shipment.order);
        if (order && order.status === 'Shipped' && order.trackingNumber === req.body.trackingNumber) {
          order.status = 'Processing'; // Revert to processing
          order.isShipped = false;
          order.trackingNumber = null;
          order.trackingUrl = null;
          await order.save();
        }
      }
    }

    res.status(200).json({
      success: true,
      data: cancellationResult
    });
  } catch (error) {
    console.error('Error canceling shipment:', error);
    return next(new ErrorResponse('Error canceling shipment', 500));
  }
});

/**
 * @desc    Get available carrier services
 * @route   GET /api/carriers/services/:carrier
 * @access  Private/Admin/Vendor
 */
exports.getCarrierServices = asyncHandler(async (req, res, next) => {
  const { carrier } = req.params;

  // Check if carrier is supported
  if (!carrierServices[carrier]) {
    return next(new ErrorResponse(`Carrier ${carrier} not supported`, 400));
  }

  try {
    // Get services from carrier
    const carrierService = carrierServices[carrier];
    const services = await carrierService.getServices();

    res.status(200).json({
      success: true,
      services
    });
  } catch (error) {
    console.error('Error getting carrier services:', error);
    return next(new ErrorResponse('Error getting carrier services', 500));
  }
});

/**
 * @desc    Get available package types
 * @route   GET /api/carriers/package-types/:carrier
 * @access  Private/Admin/Vendor
 */
exports.getPackageTypes = asyncHandler(async (req, res, next) => {
  const { carrier } = req.params;

  // Check if carrier is supported
  if (!carrierServices[carrier]) {
    return next(new ErrorResponse(`Carrier ${carrier} not supported`, 400));
  }

  try {
    // Get package types from carrier
    const carrierService = carrierServices[carrier];
    const packageTypes = await carrierService.getPackageTypes();

    res.status(200).json({
      success: true,
      packageTypes
    });
  } catch (error) {
    console.error('Error getting package types:', error);
    return next(new ErrorResponse('Error getting package types', 500));
  }
});

/**
 * Shipment Controller
 *
 * Handles API endpoints for shipment management including
 * carrier integration and tracking information
 */
const Shipment = require('../../models/shipmentModel');
const Order = require('../../models/orderModel');
const User = require('../../models/userModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const notificationService = require('../../utils/notificationService');

/**
 * @desc    Get all shipments
 * @route   GET /api/shipments
 * @access  Private/Admin/Vendor
 */
exports.getShipments = asyncHandler(async (req, res, next) => {
  let filter = {};

  // If vendor, only show shipments for their orders
  if (req.user.role === 'vendor') {
    // Find orders associated with this vendor
    const vendorOrders = await Order.find({ vendor: req.user.id }).select('_id');
    filter.order = { $in: vendorOrders.map(order => order._id) };
  }

  // Add filter for order ID if provided
  if (req.query.order) {
    filter.order = req.query.order;
  }

  // Add filter for carrier if provided
  if (req.query.carrier) {
    filter.carrier = req.query.carrier;
  }

  // Add filter for status if provided
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Add filter for tracking number if provided
  if (req.query.trackingNumber) {
    filter.trackingNumber = { $regex: req.query.trackingNumber, $options: 'i' };
  }

  // Add date range filters if provided
  if (req.query.from) {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$gte = new Date(req.query.from);
  }

  if (req.query.to) {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$lte = new Date(req.query.to);
  }

  // Get pagination parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Count total for pagination
  const total = await Shipment.countDocuments(filter);

  // Get shipments with populated order and return information
  const shipments = await Shipment.find(filter)
    .populate({
      path: 'order',
      select: 'orderNumber user status',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: shipments.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: shipments
  });
});

/**
 * @desc    Get shipment by ID
 * @route   GET /api/shipments/:id
 * @access  Private
 */
exports.getShipment = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id)
    .populate({
      path: 'order',
      populate: {
        path: 'user',
        select: 'firstName lastName email'
      }
    });

  if (!shipment) {
    return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
  }

  // Make sure user owns the order, is admin, or is the vendor
  if (
    shipment.order.user.id !== req.user.id &&
    req.user.role !== 'admin' &&
    shipment.order.vendor !== req.user.id
  ) {
    return next(new ErrorResponse(`Not authorized to access this shipment`, 403));
  }

  res.status(200).json({
    success: true,
    data: shipment
  });
});

/**
 * @desc    Create new shipment
 * @route   POST /api/orders/:orderId/shipments
 * @access  Private/Admin/Vendor
 */
exports.createShipment = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(new ErrorResponse(`Order not found with id of ${req.params.orderId}`, 404));
  }

  // Make sure user is admin or vendor
  if (req.user.role !== 'admin' && order.vendor !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to create shipments for this order`, 403));
  }

  // Add order to request body
  req.body.order = req.params.orderId;

  // Create the shipment
  const shipment = await Shipment.create(req.body);

  // Update order's tracking information and status
  order.trackingNumber = shipment.trackingNumber;
  order.trackingUrl = shipment.trackingUrl;

  if (!order.isShipped) {
    order.isShipped = true;
    order.shippedAt = Date.now();
    order.status = 'Shipped';
  }

  await order.save();

  // Send shipment notification
  await notificationService.createShipmentCreatedNotification(order, shipment);

  res.status(201).json({
    success: true,
    data: shipment
  });
});

/**
 * @desc    Update shipment
 * @route   PUT /api/shipments/:id
 * @access  Private/Admin/Vendor
 */
exports.updateShipment = asyncHandler(async (req, res, next) => {
  let shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
  }

  // Get the associated order
  const order = await Order.findById(shipment.order);

  // Make sure user is admin or vendor
  if (req.user.role !== 'admin' && order.vendor !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this shipment`, 403));
  }

  // Update the shipment
  shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // If tracking number or URL was updated, also update the order
  if (req.body.trackingNumber || req.body.trackingUrl) {
    order.trackingNumber = req.body.trackingNumber || order.trackingNumber;
    order.trackingUrl = req.body.trackingUrl || order.trackingUrl;
    await order.save();
  }

  // If status was updated to delivered, update order status
  if (req.body.status === 'delivered' && order.status !== 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'Delivered';
    await order.save();

    // Send delivery notification
    await notificationService.createOrderDeliveredNotification(order);
  }

  res.status(200).json({
    success: true,
    data: shipment
  });
});

/**
 * @desc    Add tracking event to shipment
 * @route   POST /api/shipments/:id/events
 * @access  Private/Admin/Vendor
 */
exports.addTrackingEvent = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
  }

  // Get the associated order
  const order = await Order.findById(shipment.order);

  // Make sure user is admin or vendor
  if (req.user.role !== 'admin' && order.vendor !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this shipment`, 403));
  }

  // Add the event
  const updatedShipment = await shipment.addTrackingEvent({
    eventDate: req.body.eventDate || new Date(),
    location: req.body.location,
    description: req.body.description,
    status: req.body.status
  });

  // If event status is delivered, update order status
  if (req.body.status === 'delivered' && order.status !== 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date(req.body.eventDate) || Date.now();
    order.status = 'Delivered';
    await order.save();

    // Send delivery notification
    await notificationService.createOrderDeliveredNotification(order);
  }

  res.status(200).json({
    success: true,
    data: updatedShipment
  });
});

/**
 * @desc    Add note to shipment
 * @route   POST /api/shipments/:id/notes
 * @access  Private
 */
exports.addShipmentNote = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
  }

  // Get the associated order
  const order = await Order.findById(shipment.order);

  // Check authorization based on note type
  if (req.body.noteType === 'vendor' && req.user.role !== 'admin' && order.vendor !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to add vendor notes`, 403));
  }

  if (req.body.noteType === 'customer' &&
      req.user.role !== 'admin' &&
      order.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to add customer notes`, 403));
  }

  // Add the note
  const updatedShipment = await shipment.addNote({
    noteType: req.body.noteType,
    text: req.body.text,
    createdBy: req.user.id
  });

  res.status(200).json({
    success: true,
    data: updatedShipment
  });
});

/**
 * @desc    Report shipping damage
 * @route   POST /api/shipments/:id/report-damage
 * @access  Private
 */
exports.reportDamage = asyncHandler(async (req, res, next) => {
  const shipment = await Shipment.findById(req.params.id);

  if (!shipment) {
    return next(new ErrorResponse(`Shipment not found with id of ${req.params.id}`, 404));
  }

  // Get the associated order
  const order = await Order.findById(shipment.order);

  // Make sure user owns the order or is admin
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to report damage for this shipment`, 403));
  }

  // Update shipment with damage information
  shipment.damagedReported = true;

  // Add a tracking event for the damage report
  await shipment.addTrackingEvent({
    eventDate: new Date(),
    description: `Damage reported: ${req.body.description}`,
    status: 'exception'
  });

  // Add a note with damage details
  await shipment.addNote({
    noteType: 'customer',
    text: `Damage reported: ${req.body.description}`,
    createdBy: req.user.id
  });

  // Save the shipment
  await shipment.save();

  // Send damage notification to vendor/admin
  await notificationService.createShipmentDamageNotification(order, shipment, req.body.description);

  res.status(200).json({
    success: true,
    data: shipment
  });
});

/**
 * @desc    Create return shipment
 * @route   POST /api/shipments/:id/return
 * @access  Private/Admin
 */
exports.createReturnShipment = asyncHandler(async (req, res, next) => {
  // Only admin can create return shipments
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse(`Not authorized to create return shipments`, 403));
  }

  const originalShipment = await Shipment.findById(req.params.id);

  if (!originalShipment) {
    return next(new ErrorResponse(`Original shipment not found with id of ${req.params.id}`, 404));
  }

  // Get the associated order
  const order = await Order.findById(originalShipment.order);

  if (!order) {
    return next(new ErrorResponse(`Associated order not found`, 404));
  }

  // Create the return shipment
  const returnShipment = await Shipment.create({
    order: order._id,
    carrier: req.body.carrier || originalShipment.carrier,
    serviceLevel: req.body.serviceLevel || originalShipment.serviceLevel,
    trackingNumber: req.body.trackingNumber,
    trackingUrl: req.body.trackingUrl,
    shippingLabelUrl: req.body.shippingLabelUrl,
    status: 'created',
    isReturn: true,
    returnReason: req.body.returnReason,
    returnAuthorizedBy: req.user.id,
    returnAuthorizedAt: new Date(),
    packagingInstructions: req.body.packagingInstructions
  });

  // Send return shipment notification
  await notificationService.createReturnShipmentNotification(order, returnShipment);

  res.status(201).json({
    success: true,
    data: returnShipment
  });
});

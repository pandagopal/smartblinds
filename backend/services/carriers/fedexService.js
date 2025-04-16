/**
 * FedEx Shipping Service
 *
 * This module provides integration with FedEx API for
 * shipping rates, label generation, and tracking.
 *
 * NOTE: This is a stub implementation that returns mock data.
 */

/**
 * Get shipping rates from FedEx
 * @param {Object} data - Shipping details
 * @returns {Promise<Array>} Array of rate objects
 */
const getRates = async (data) => {
  console.log('FedEx getRates called with data:', JSON.stringify(data, null, 2));

  // Mock response with sample rates
  return [
    {
      serviceCode: 'FEDEX_GROUND',
      serviceName: 'FedEx Ground',
      totalAmount: 12.75,
      transitDays: 3,
      currency: 'USD',
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      serviceCode: 'FEDEX_2_DAY',
      serviceName: 'FedEx 2Day',
      totalAmount: 28.50,
      transitDays: 2,
      currency: 'USD',
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      serviceCode: 'FEDEX_PRIORITY_OVERNIGHT',
      serviceName: 'FedEx Priority Overnight',
      totalAmount: 54.25,
      transitDays: 1,
      currency: 'USD',
      deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    }
  ];
};

/**
 * Generate shipping label with FedEx
 * @param {Object} data - Shipping details
 * @returns {Promise<Object>} Label information
 */
const generateLabel = async (data) => {
  console.log('FedEx generateLabel called with data:', JSON.stringify(data, null, 2));

  // Generate unique tracking number
  const trackingNumber = `FX${Date.now().toString().substring(4)}US`;

  // Mock response with label data
  return {
    trackingNumber,
    trackingUrl: `https://www.fedex.com/track?numbers=${trackingNumber}`,
    labelUrl: 'https://mock-fedex-api.com/labels/sample.pdf',
    cost: data.service.includes('PRIORITY') ? 54.25 : (data.service.includes('2_DAY') ? 28.50 : 12.75),
    estimatedDelivery: new Date(Date.now() +
      (data.service.includes('PRIORITY') ? 1 : (data.service.includes('2_DAY') ? 2 : 3)) * 24 * 60 * 60 * 1000)
  };
};

/**
 * Validate address with FedEx
 * @param {Object} address - Address to validate
 * @returns {Promise<Object>} Validation results
 */
const validateAddress = async (address) => {
  console.log('FedEx validateAddress called with data:', JSON.stringify(address, null, 2));

  // Mock response with validation results
  return {
    valid: true,
    normalized: {
      name: address.name,
      company: address.company,
      street1: address.street1,
      street2: address.street2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode.replace(/-\d{4}$/, ''), // Strip ZIP+4 extension
      country: address.country || 'US',
      phone: address.phone
    },
    messages: []
  };
};

/**
 * Get tracking information from FedEx
 * @param {String} trackingNumber - Tracking number
 * @returns {Promise<Object>} Tracking information
 */
const getTracking = async (trackingNumber) => {
  console.log('FedEx getTracking called with tracking number:', trackingNumber);

  // Generate random status
  const statuses = ['picked_up', 'in_transit', 'out_for_delivery', 'delivered'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

  // Calculate random dates for events
  const now = Date.now();
  const pickupDate = new Date(now - 3 * 24 * 60 * 60 * 1000);
  const transitDate = new Date(now - 2 * 24 * 60 * 60 * 1000);
  const outForDeliveryDate = new Date(now - 1 * 24 * 60 * 60 * 1000);
  const deliveredDate = new Date(now);

  // Mock response with tracking data
  return {
    trackingNumber,
    carrier: 'FedEx',
    service: 'FedEx Ground',
    status: randomStatus,
    estimatedDelivery: deliveredDate,
    events: [
      {
        timestamp: pickupDate,
        status: 'picked_up',
        description: 'Picked up by carrier',
        location: 'Shipping facility, CA'
      },
      {
        timestamp: transitDate,
        status: 'in_transit',
        description: 'In transit',
        location: 'Distribution center, IL'
      },
      {
        timestamp: outForDeliveryDate,
        status: 'out_for_delivery',
        description: 'Out for delivery',
        location: 'Local facility, NY'
      },
      ...(randomStatus === 'delivered' ? [{
        timestamp: deliveredDate,
        status: 'delivered',
        description: 'Delivered',
        location: 'Front door, NY'
      }] : [])
    ].filter(event => {
      // Only include events that have happened based on random status
      switch (randomStatus) {
        case 'picked_up': return event.status === 'picked_up';
        case 'in_transit': return ['picked_up', 'in_transit'].includes(event.status);
        case 'out_for_delivery': return ['picked_up', 'in_transit', 'out_for_delivery'].includes(event.status);
        case 'delivered': return true;
        default: return true;
      }
    })
  };
};

/**
 * Cancel shipment with FedEx
 * @param {String} shipmentId - Shipment identifier
 * @returns {Promise<Object>} Cancellation results
 */
const cancelShipment = async (shipmentId) => {
  console.log('FedEx cancelShipment called with shipment ID:', shipmentId);

  // Mock response with cancellation result
  return {
    cancelled: true,
    message: 'Shipment successfully cancelled',
    refundAmount: 12.75,
    refundCurrency: 'USD'
  };
};

/**
 * Get available FedEx services
 * @returns {Promise<Array>} Array of available services
 */
const getServices = async () => {
  return [
    { code: 'FEDEX_GROUND', name: 'FedEx Ground', transitDays: 3, domestic: true, international: false },
    { code: 'FEDEX_HOME_DELIVERY', name: 'FedEx Home Delivery', transitDays: 3, domestic: true, international: false },
    { code: 'FEDEX_2_DAY', name: 'FedEx 2Day', transitDays: 2, domestic: true, international: false },
    { code: 'FEDEX_2_DAY_AM', name: 'FedEx 2Day AM', transitDays: 2, domestic: true, international: false },
    { code: 'STANDARD_OVERNIGHT', name: 'FedEx Standard Overnight', transitDays: 1, domestic: true, international: false },
    { code: 'PRIORITY_OVERNIGHT', name: 'FedEx Priority Overnight', transitDays: 1, domestic: true, international: false },
    { code: 'FIRST_OVERNIGHT', name: 'FedEx First Overnight', transitDays: 1, domestic: true, international: false },
    { code: 'INTERNATIONAL_ECONOMY', name: 'FedEx International Economy', transitDays: 5, domestic: false, international: true },
    { code: 'INTERNATIONAL_PRIORITY', name: 'FedEx International Priority', transitDays: 3, domestic: false, international: true }
  ];
};

/**
 * Get available FedEx package types
 * @returns {Promise<Array>} Array of package types
 */
const getPackageTypes = async () => {
  return [
    { code: 'FEDEX_ENVELOPE', name: 'FedEx Envelope', maxWeight: 1, dimensions: {} },
    { code: 'FEDEX_PAK', name: 'FedEx Pak', maxWeight: 5, dimensions: {} },
    { code: 'FEDEX_BOX', name: 'FedEx Box', maxWeight: 20, dimensions: {} },
    { code: 'FEDEX_TUBE', name: 'FedEx Tube', maxWeight: 20, dimensions: {} },
    { code: 'FEDEX_10KG_BOX', name: 'FedEx 10kg Box', maxWeight: 22, dimensions: {} },
    { code: 'FEDEX_25KG_BOX', name: 'FedEx 25kg Box', maxWeight: 55, dimensions: {} },
    { code: 'YOUR_PACKAGING', name: 'Your Packaging', maxWeight: 150, dimensions: {} }
  ];
};

module.exports = {
  getRates,
  generateLabel,
  validateAddress,
  getTracking,
  cancelShipment,
  getServices,
  getPackageTypes
};

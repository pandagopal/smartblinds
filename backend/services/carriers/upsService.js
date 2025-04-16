/**
 * UPS Shipping Service
 *
 * This module provides integration with UPS API for
 * shipping rates, label generation, and tracking.
 *
 * NOTE: This is a stub implementation that returns mock data.
 */

/**
 * Get shipping rates from UPS
 * @param {Object} data - Shipping details
 * @returns {Promise<Array>} Array of rate objects
 */
const getRates = async (data) => {
  console.log('UPS getRates called with data:', JSON.stringify(data, null, 2));

  // Mock response with sample rates
  return [
    {
      serviceCode: 'GND',
      serviceName: 'UPS Ground',
      totalAmount: 11.95,
      transitDays: 3,
      currency: 'USD',
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      serviceCode: '3DS',
      serviceName: 'UPS 3 Day Select',
      totalAmount: 23.75,
      transitDays: 3,
      currency: 'USD',
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      serviceCode: '2DA',
      serviceName: 'UPS 2nd Day Air',
      totalAmount: 29.95,
      transitDays: 2,
      currency: 'USD',
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      serviceCode: '1DP',
      serviceName: 'UPS Next Day Air',
      totalAmount: 52.50,
      transitDays: 1,
      currency: 'USD',
      deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    }
  ];
};

/**
 * Generate shipping label with UPS
 * @param {Object} data - Shipping details
 * @returns {Promise<Object>} Label information
 */
const generateLabel = async (data) => {
  console.log('UPS generateLabel called with data:', JSON.stringify(data, null, 2));

  // Generate unique tracking number
  const trackingNumber = `1Z${generateRandomString(16)}`;

  // Mock response with label data
  return {
    trackingNumber,
    trackingUrl: `https://www.ups.com/track?tracknum=${trackingNumber}`,
    labelUrl: 'https://mock-ups-api.com/labels/sample.pdf',
    cost: data.service === '1DP' ? 52.50 :
          (data.service === '2DA' ? 29.95 :
          (data.service === '3DS' ? 23.75 : 11.95)),
    estimatedDelivery: new Date(Date.now() +
      (data.service === '1DP' ? 1 :
      (data.service === '2DA' ? 2 : 3)) * 24 * 60 * 60 * 1000)
  };
};

/**
 * Validate address with UPS
 * @param {Object} address - Address to validate
 * @returns {Promise<Object>} Validation results
 */
const validateAddress = async (address) => {
  console.log('UPS validateAddress called with data:', JSON.stringify(address, null, 2));

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
 * Get tracking information from UPS
 * @param {String} trackingNumber - Tracking number
 * @returns {Promise<Object>} Tracking information
 */
const getTracking = async (trackingNumber) => {
  console.log('UPS getTracking called with tracking number:', trackingNumber);

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
    carrier: 'UPS',
    service: 'UPS Ground',
    status: randomStatus,
    estimatedDelivery: deliveredDate,
    events: [
      {
        timestamp: pickupDate,
        status: 'picked_up',
        description: 'Picked up',
        location: 'UPS facility, Los Angeles, CA'
      },
      {
        timestamp: transitDate,
        status: 'in_transit',
        description: 'Departed UPS facility',
        location: 'UPS hub, Chicago, IL'
      },
      {
        timestamp: outForDeliveryDate,
        status: 'out_for_delivery',
        description: 'Out for delivery',
        location: 'Local UPS facility, New York, NY'
      },
      ...(randomStatus === 'delivered' ? [{
        timestamp: deliveredDate,
        status: 'delivered',
        description: 'Delivered',
        location: 'Residential, New York, NY'
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
 * Cancel shipment with UPS
 * @param {String} shipmentId - Shipment identifier
 * @returns {Promise<Object>} Cancellation results
 */
const cancelShipment = async (shipmentId) => {
  console.log('UPS cancelShipment called with shipment ID:', shipmentId);

  // Mock response with cancellation result
  return {
    cancelled: true,
    message: 'Shipment successfully voided',
    refundAmount: 11.95,
    refundCurrency: 'USD'
  };
};

/**
 * Get available UPS services
 * @returns {Promise<Array>} Array of available services
 */
const getServices = async () => {
  return [
    { code: 'GND', name: 'UPS Ground', transitDays: 3, domestic: true, international: false },
    { code: '3DS', name: 'UPS 3 Day Select', transitDays: 3, domestic: true, international: false },
    { code: '2DA', name: 'UPS 2nd Day Air', transitDays: 2, domestic: true, international: false },
    { code: '2DM', name: 'UPS 2nd Day Air A.M.', transitDays: 2, domestic: true, international: false },
    { code: '1DA', name: 'UPS Next Day Air', transitDays: 1, domestic: true, international: false },
    { code: '1DP', name: 'UPS Next Day Air Saver', transitDays: 1, domestic: true, international: false },
    { code: '1DM', name: 'UPS Next Day Air Early', transitDays: 1, domestic: true, international: false },
    { code: 'INT', name: 'UPS Worldwide Express', transitDays: 3, domestic: false, international: true },
    { code: 'STD', name: 'UPS Standard', transitDays: 5, domestic: false, international: true }
  ];
};

/**
 * Get available UPS package types
 * @returns {Promise<Array>} Array of package types
 */
const getPackageTypes = async () => {
  return [
    { code: '01', name: 'UPS Letter', maxWeight: 0.5, dimensions: {} },
    { code: '02', name: 'UPS Package', maxWeight: 150, dimensions: {} },
    { code: '03', name: 'UPS Tube', maxWeight: 30, dimensions: {} },
    { code: '04', name: 'UPS Pak', maxWeight: 10, dimensions: {} },
    { code: '21', name: 'UPS Express Box', maxWeight: 30, dimensions: {} },
    { code: '24', name: 'UPS 25KG Box', maxWeight: 55, dimensions: {} },
    { code: '25', name: 'UPS 10KG Box', maxWeight: 22, dimensions: {} }
  ];
};

/**
 * Generate a random alphanumeric string
 * @param {Number} length - Length of the string
 * @returns {String} Random string
 */
function generateRandomString(length) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

module.exports = {
  getRates,
  generateLabel,
  validateAddress,
  getTracking,
  cancelShipment,
  getServices,
  getPackageTypes
};

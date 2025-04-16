/**
 * USPS Shipping Service
 *
 * This module provides integration with USPS API for
 * shipping rates, label generation, and tracking.
 *
 * NOTE: This is a stub implementation that returns mock data.
 */

/**
 * Get shipping rates from USPS
 * @param {Object} data - Shipping details
 * @returns {Promise<Array>} Array of rate objects
 */
const getRates = async (data) => {
  console.log('USPS getRates called with data:', JSON.stringify(data, null, 2));

  // Mock response with sample rates
  return [
    {
      serviceCode: 'PRIORITY',
      serviceName: 'Priority Mail',
      totalAmount: 8.95,
      transitDays: 2,
      currency: 'USD',
      deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    },
    {
      serviceCode: 'FIRST_CLASS',
      serviceName: 'First Class Mail',
      totalAmount: 4.50,
      transitDays: 3,
      currency: 'USD',
      deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    },
    {
      serviceCode: 'EXPRESS',
      serviceName: 'Priority Mail Express',
      totalAmount: 26.35,
      transitDays: 1,
      currency: 'USD',
      deliveryDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
    },
    {
      serviceCode: 'MEDIA',
      serviceName: 'Media Mail',
      totalAmount: 3.19,
      transitDays: 8,
      currency: 'USD',
      deliveryDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
    }
  ];
};

/**
 * Generate shipping label with USPS
 * @param {Object} data - Shipping details
 * @returns {Promise<Object>} Label information
 */
const generateLabel = async (data) => {
  console.log('USPS generateLabel called with data:', JSON.stringify(data, null, 2));

  // Generate unique tracking number
  const trackingNumber = `9400${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`;

  // Mock response with label data
  return {
    trackingNumber,
    trackingUrl: `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    labelUrl: 'https://mock-usps-api.com/labels/sample.pdf',
    cost: data.service === 'EXPRESS' ? 26.35 :
          (data.service === 'PRIORITY' ? 8.95 :
          (data.service === 'FIRST_CLASS' ? 4.50 : 3.19)),
    estimatedDelivery: new Date(Date.now() +
      (data.service === 'EXPRESS' ? 1 :
      (data.service === 'PRIORITY' ? 2 :
      (data.service === 'FIRST_CLASS' ? 3 : 8))) * 24 * 60 * 60 * 1000)
  };
};

/**
 * Validate address with USPS
 * @param {Object} address - Address to validate
 * @returns {Promise<Object>} Validation results
 */
const validateAddress = async (address) => {
  console.log('USPS validateAddress called with data:', JSON.stringify(address, null, 2));

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
      postalCode: address.postalCode.replace(/-\d{4}$/, '') + '-0000', // Standardize with ZIP+4
      country: 'US', // USPS only validates US addresses
      phone: address.phone
    },
    messages: []
  };
};

/**
 * Get tracking information from USPS
 * @param {String} trackingNumber - Tracking number
 * @returns {Promise<Object>} Tracking information
 */
const getTracking = async (trackingNumber) => {
  console.log('USPS getTracking called with tracking number:', trackingNumber);

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
    carrier: 'USPS',
    service: 'Priority Mail',
    status: randomStatus,
    estimatedDelivery: deliveredDate,
    events: [
      {
        timestamp: pickupDate,
        status: 'picked_up',
        description: 'Accepted at USPS Origin Facility',
        location: 'LOS ANGELES, CA 90001'
      },
      {
        timestamp: transitDate,
        status: 'in_transit',
        description: 'In Transit to Next Facility',
        location: 'IN TRANSIT'
      },
      {
        timestamp: outForDeliveryDate,
        status: 'out_for_delivery',
        description: 'Out for Delivery',
        location: 'NEW YORK, NY 10001'
      },
      ...(randomStatus === 'delivered' ? [{
        timestamp: deliveredDate,
        status: 'delivered',
        description: 'Delivered, In/At Mailbox',
        location: 'NEW YORK, NY 10001'
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
 * Cancel shipment with USPS
 * @param {String} shipmentId - Shipment identifier
 * @returns {Promise<Object>} Cancellation results
 */
const cancelShipment = async (shipmentId) => {
  console.log('USPS cancelShipment called with shipment ID:', shipmentId);

  // Mock response with cancellation result
  return {
    cancelled: true,
    message: 'Shipping label cancelled successfully',
    refundAmount: 8.95,
    refundCurrency: 'USD'
  };
};

/**
 * Get available USPS services
 * @returns {Promise<Array>} Array of available services
 */
const getServices = async () => {
  return [
    { code: 'FIRST_CLASS', name: 'First Class Mail', transitDays: 3, domestic: true, international: false },
    { code: 'PRIORITY', name: 'Priority Mail', transitDays: 2, domestic: true, international: true },
    { code: 'EXPRESS', name: 'Priority Mail Express', transitDays: 1, domestic: true, international: true },
    { code: 'MEDIA', name: 'Media Mail', transitDays: 8, domestic: true, international: false },
    { code: 'PARCEL_SELECT', name: 'USPS Parcel Select', transitDays: 5, domestic: true, international: false },
    { code: 'FIRST_CLASS_INTERNATIONAL', name: 'First Class Package International', transitDays: 7, domestic: false, international: true },
    { code: 'PRIORITY_INTERNATIONAL', name: 'Priority Mail International', transitDays: 6, domestic: false, international: true },
    { code: 'EXPRESS_INTERNATIONAL', name: 'Priority Mail Express International', transitDays: 3, domestic: false, international: true }
  ];
};

/**
 * Get available USPS package types
 * @returns {Promise<Array>} Array of package types
 */
const getPackageTypes = async () => {
  return [
    { code: 'LETTER', name: 'Letter', maxWeight: 3.5, dimensions: {} },
    { code: 'FLAT_RATE_ENVELOPE', name: 'Flat Rate Envelope', maxWeight: 70, dimensions: {} },
    { code: 'FLAT_RATE_BOX_SMALL', name: 'Small Flat Rate Box', maxWeight: 70, dimensions: {} },
    { code: 'FLAT_RATE_BOX_MEDIUM', name: 'Medium Flat Rate Box', maxWeight: 70, dimensions: {} },
    { code: 'FLAT_RATE_BOX_LARGE', name: 'Large Flat Rate Box', maxWeight: 70, dimensions: {} },
    { code: 'REGIONAL_RATE_BOX_A', name: 'Regional Rate Box A', maxWeight: 15, dimensions: {} },
    { code: 'REGIONAL_RATE_BOX_B', name: 'Regional Rate Box B', maxWeight: 20, dimensions: {} },
    { code: 'PACKAGE', name: 'Package/Thick Envelope', maxWeight: 70, dimensions: {} }
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

/**
 * SMS Service Module
 *
 * This module provides functions for sending SMS notifications to users.
 * For now, this is a stub implementation that only logs messages.
 * In a production environment, this would connect to an SMS provider API.
 */

// Fake configuration - in a real app this would be in env vars
const config = {
  enabled: process.env.SMS_ENABLED === 'true' || false,
  defaultFrom: process.env.SMS_FROM || '+14155551234'
};

/**
 * Send a general notification via SMS
 * @param {string} phone - User's phone number
 * @param {string} title - Notification title
 * @param {string} content - Message content
 */
const sendNotification = async (phone, title, content) => {
  if (!phone) {
    console.log('SMS: No phone number provided for notification');
    return { success: false, error: 'No phone number provided' };
  }

  console.log(`SMS would be sent to ${phone}: ${title} - ${content}`);
  return { success: true };
};

/**
 * Send a notification about order status changes
 * @param {Object} order - The order object
 * @param {string} status - The new status
 */
const sendOrderStatusNotification = async (order, status) => {
  try {
    // In a real implementation, we would get the user's phone from the order
    // or from a user service
    const phone = '123-456-7890'; // Placeholder

    // Skip if no phone number is available
    if (!phone) return { success: false, error: 'No phone number' };

    const message = `Your order #${order.orderNumber} status has been updated to: ${status}`;
    console.log(`SMS would be sent to ${phone}: ${message}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending order status SMS:', error);
    return { success: false, error };
  }
};

/**
 * Send a notification about shipment status changes
 * @param {string} userId - User ID
 * @param {Object} shipment - The shipment object
 * @param {string} eventType - Type of shipping event
 */
const sendShipmentNotification = async (userId, shipment, eventType) => {
  try {
    // In a real implementation, we would get the user's phone from a user service
    const phone = '123-456-7890'; // Placeholder

    // Skip if no phone number is available
    if (!phone) return { success: false, error: 'No phone number' };

    let message;
    switch (eventType) {
      case 'created':
        message = `Your shipment for order #${shipment.orderNumber} has been created. Tracking: ${shipment.trackingNumber || 'Not available yet'}`;
        break;
      case 'out_for_delivery':
        message = `Your order #${shipment.orderNumber} is out for delivery today!`;
        break;
      case 'delivered':
        message = `Your order #${shipment.orderNumber} has been delivered. Thank you for shopping with us!`;
        break;
      case 'returned':
        message = `Return for order #${shipment.orderNumber} has been processed. Tracking: ${shipment.trackingNumber || 'Not available'}`;
        break;
      default:
        message = `Update for your shipment (order #${shipment.orderNumber}): ${eventType}`;
    }

    console.log(`SMS would be sent to ${phone}: ${message}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending shipment SMS:', error);
    return { success: false, error };
  }
};

/**
 * Send an acknowledgement when a damage report is received
 * @param {string} userId - User ID
 * @param {Object} shipment - The shipment object
 */
const sendDamageReportAcknowledgement = async (userId, shipment) => {
  try {
    // In a real implementation, we would get the user's phone from a user service
    const phone = '123-456-7890'; // Placeholder

    // Skip if no phone number is available
    if (!phone) return { success: false, error: 'No phone number' };

    const message = `We've received your damage report for order #${shipment.orderNumber}. Our team will contact you within 24 hours.`;
    console.log(`SMS would be sent to ${phone}: ${message}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending damage report SMS:', error);
    return { success: false, error };
  }
};

// Export the functions
module.exports = {
  sendNotification,
  sendOrderStatusNotification,
  sendShipmentNotification,
  sendDamageReportAcknowledgement
};

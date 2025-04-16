/**
 * Notification Service
 *
 * Provides functions for creating and sending notifications to users,
 * including in-app notifications and emails.
 */
const { Notification, NotificationType, UserNotificationPreference } = require('../models/notificationModel');
const User = require('../models/userModel');

// For sending emails
const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');

// Email configuration - would use env variables in production
const mailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: process.env.SMTP_PORT || 2525,
  auth: {
    user: process.env.SMTP_USER || 'your_mailtrap_username',
    pass: process.env.SMTP_PASS || 'your_mailtrap_password'
  }
});

// Add import for SMS service
const smsService = require('../services/smsService');

/**
 * Create a notification and send it to specified users
 *
 * @param {string} notificationTypeName - The name of the notification type
 * @param {Object} templateData - Data to populate the template
 * @param {Object} sourceInfo - Source information (type and id)
 * @param {Array<string>} userIds - Array of user IDs to notify
 * @returns {Promise<Notification>} - The created notification
 */
const createNotification = async (notificationTypeName, templateData, sourceInfo, userIds) => {
  try {
    // Find the notification type
    const notificationType = await NotificationType.findOne({ name: notificationTypeName });
    if (!notificationType) {
      throw new Error(`Notification type '${notificationTypeName}' not found`);
    }

    // Compile the templates
    const compiledTemplate = Handlebars.compile(notificationType.template);
    const content = compiledTemplate(templateData);

    let compiledEmailTemplate = null;
    if (notificationType.emailTemplate) {
      compiledEmailTemplate = Handlebars.compile(notificationType.emailTemplate);
    }

    // Create notification
    const notification = new Notification({
      type: notificationType._id,
      title: generateTitle(notificationTypeName, templateData),
      content,
      sourceType: sourceInfo.type,
      sourceId: sourceInfo.id,
      recipients: []
    });

    // Add recipients
    const users = await User.find({ _id: { $in: userIds } });

    // Get notification preferences for all users at once
    const userPreferences = await UserNotificationPreference.find({
      user: { $in: userIds },
      notificationType: notificationType._id
    });

    // Create a map of preferences by user ID for quick lookup
    const preferencesMap = {};
    userPreferences.forEach(pref => {
      preferencesMap[pref.user.toString()] = pref;
    });

    // Process each user
    for (const user of users) {
      const userId = user._id.toString();

      // Get user preferences, use defaults if not specified
      const preferences = preferencesMap[userId] || {
        inAppEnabled: true,
        emailEnabled: true,
        smsEnabled: false // Default SMS preference
      };

      // Skip users who opted out of in-app notifications
      if (!preferences.inAppEnabled) continue;

      // Add recipient
      notification.recipients.push({
        user: user._id,
        isRead: false,
        isEmailed: false,
        emailStatus: preferences.emailEnabled ? 'pending' : undefined
      });

      // Send email if enabled
      if (preferences.emailEnabled && compiledEmailTemplate) {
        // Include user-specific data in email template
        const emailData = {
          ...templateData,
          name: user.firstName || user.email.split('@')[0]
        };

        const emailContent = compiledEmailTemplate(emailData);

        // Send email asynchronously (don't wait)
        sendEmail(user.email, notification.title, emailContent)
          .then(result => {
            // Mark as emailed in the notification document
            updateEmailStatus(notification._id, user._id, result.success ? 'sent' : 'failed');
          })
          .catch(err => {
            console.error(`Error sending email to ${user.email}:`, err);
            updateEmailStatus(notification._id, user._id, 'failed');
          });
      }

      // Send SMS if enabled
      if (preferences.smsEnabled) {
        await smsService.sendNotification(user.phone, notification.title, notification.content);
      }
    }

    // Only save if we have recipients
    if (notification.recipients.length > 0) {
      await notification.save();
      return notification;
    }

    return null;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Generate a title from the notification type and template data
 */
const generateTitle = (notificationType, templateData) => {
  switch (notificationType) {
    case 'new_order':
      return `New Order #${templateData.orderNumber}`;
    case 'order_confirmation':
      return `Order Confirmation: #${templateData.orderNumber}`;
    case 'order_status_update':
      return `Order Status Update: #${templateData.orderNumber}`;
    case 'order_shipped':
      return `Order Shipped: #${templateData.orderNumber}`;
    case 'order_delivered':
      return `Order Delivered: #${templateData.orderNumber}`;
    case 'low_inventory':
      return `Low Inventory Alert: ${templateData.productName}`;
    case 'out_of_stock':
      return `Out of Stock: ${templateData.productName}`;
    case 'new_question':
      return `New Question: ${templateData.subject}`;
    case 'question_reply':
      return `New Reply: ${templateData.subject}`;
    case 'system_announcement':
      return templateData.title || 'System Announcement';
    case 'policy_update':
      return `Policy Update: ${templateData.title}`;
    case 'return_created':
      return `Return Shipment Created: ${templateData.orderNumber}`;
    case 'damage_report':
      return `Damage Reported for Order: ${templateData.orderNumber}`;
    case 'shipping_update':
      return `Shipping Update for Order: ${templateData.orderNumber}`;
    default:
      return `SmartBlinds Notification`;
  }
};

/**
 * Send an email
 */
const sendEmail = async (email, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'notifications@smartblinds.com',
      to: email,
      subject,
      html: htmlContent
    };

    await mailTransport.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
};

/**
 * Update email status for a notification recipient
 */
const updateEmailStatus = async (notificationId, userId, status) => {
  try {
    await Notification.updateOne(
      {
        _id: notificationId,
        'recipients.user': userId
      },
      {
        $set: {
          'recipients.$.isEmailed': status === 'sent',
          'recipients.$.emailedAt': status === 'sent' ? new Date() : undefined,
          'recipients.$.emailStatus': status
        }
      }
    );
  } catch (error) {
    console.error('Error updating email status:', error);
  }
};

/**
 * Mark a notification as read for a user
 */
const markAsRead = async (notificationId, userId) => {
  try {
    const result = await Notification.updateOne(
      {
        _id: notificationId,
        'recipients.user': userId,
        'recipients.isRead': false
      },
      {
        $set: {
          'recipients.$.isRead': true,
          'recipients.$.readAt': new Date()
        }
      }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      {
        'recipients.user': userId,
        'recipients.isRead': false
      },
      {
        $set: {
          'recipients.$.isRead': true,
          'recipients.$.readAt': new Date()
        }
      }
    );
    return result.modifiedCount;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return 0;
  }
};

/**
 * Get unread notifications count for a user
 */
const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({
      'recipients.user': userId,
      'recipients.isRead': false
    });
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

/**
 * Create special notification for new orders
 */
const createNewOrderNotification = async (order) => {
  // Get vendor user IDs related to the products in the order
  const vendorIds = await getOrderVendors(order);
  if (!vendorIds || vendorIds.length === 0) return null;

  // Prepare data for the template
  const templateData = {
    orderNumber: order.orderNumber,
    total: order.totalPrice,
    itemCount: order.orderItems.length,
    orderDate: order.createdAt.toLocaleString()
  };

  // Create notification
  return createNotification(
    'new_order',
    templateData,
    { type: 'order', id: order._id.toString() },
    vendorIds
  );
};

/**
 * Create order confirmation notification for customer
 */
const createOrderConfirmationNotification = async (order) => {
  // Prepare data for the template
  const templateData = {
    orderNumber: order.orderNumber,
    total: order.totalPrice,
    estimatedDelivery: order.estimatedDeliveryDate
      ? order.estimatedDeliveryDate.toLocaleDateString()
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() // 7 days from now
  };

  // Create notification
  return createNotification(
    'order_confirmation',
    templateData,
    { type: 'order', id: order._id.toString() },
    [order.user.toString()]
  );
};

/**
 * Create order status update notification
 */
const createOrderStatusUpdateNotification = async (order, previousStatus, additionalInfo = '') => {
  // Don't notify if status didn't change
  if (previousStatus === order.status) return null;

  // Prepare data for the template
  const templateData = {
    orderNumber: order.orderNumber,
    status: order.status,
    previousStatus,
    additionalInfo
  };

  // Create notification
  return createNotification(
    'order_status_update',
    templateData,
    { type: 'order', id: order._id.toString() },
    [order.user.toString()]
  );
};

/**
 * Create shipped order notification
 */
const createOrderShippedNotification = async (order) => {
  // Prepare data for the template
  const templateData = {
    orderNumber: order.orderNumber,
    trackingNumber: order.trackingNumber || 'Not available',
    trackingUrl: order.trackingUrl || '#',
    carrier: 'Shipping Provider',
    estimatedDelivery: order.estimatedDeliveryDate
      ? order.estimatedDeliveryDate.toLocaleDateString()
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString() // 3 days from now
  };

  // Create notification
  return createNotification(
    'order_shipped',
    templateData,
    { type: 'order', id: order._id.toString() },
    [order.user.toString()]
  );
};

/**
 * Create delivered order notification
 */
const createOrderDeliveredNotification = async (order) => {
  // Prepare data for the template
  const templateData = {
    orderNumber: order.orderNumber,
    name: '', // Will be populated by the createNotification function
    deliveryDate: order.deliveredAt
      ? order.deliveredAt.toLocaleDateString()
      : new Date().toLocaleDateString()
  };

  // Create notification
  return createNotification(
    'order_delivered',
    templateData,
    { type: 'order', id: order._id.toString() },
    [order.user.toString()]
  );
};

/**
 * Create low inventory alert notification
 */
const createLowInventoryNotification = async (inventoryAlert, vendorIds) => {
  // Populate the product, material, and color info
  await inventoryAlert.populate('product material color');

  // Prepare data for the template
  const templateData = {
    productName: inventoryAlert.product.name,
    materialName: inventoryAlert.material ? inventoryAlert.material.name : 'N/A',
    colorName: inventoryAlert.color ? inventoryAlert.color.name : 'N/A',
    currentLevel: inventoryAlert.currentLevel,
    threshold: inventoryAlert.threshold
  };

  // Create notification
  return createNotification(
    'low_inventory',
    templateData,
    { type: 'inventory', id: inventoryAlert._id.toString() },
    vendorIds
  );
};

/**
 * Create out of stock notification
 */
const createOutOfStockNotification = async (inventoryAlert, vendorIds) => {
  // Populate the product, material, and color info
  await inventoryAlert.populate('product material color');

  // Prepare data for the template
  const templateData = {
    productName: inventoryAlert.product.name,
    materialName: inventoryAlert.material ? inventoryAlert.material.name : 'N/A',
    colorName: inventoryAlert.color ? inventoryAlert.color.name : 'N/A'
  };

  // Create notification
  return createNotification(
    'out_of_stock',
    templateData,
    { type: 'inventory', id: inventoryAlert._id.toString() },
    vendorIds
  );
};

/**
 * Create a notification when a shipment is created
 * @param {Object} order - The order associated with the shipment
 * @param {Object} shipment - The shipment object
 */
const createShipmentCreatedNotification = async (order, shipment) => {
  try {
    const userId = order.user;
    const title = 'Order Shipped';
    const message = `Your order ${order.orderNumber} has been shipped`;
    const detailsUrl = `/account/orders/${order._id}`;
    const additionalData = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      shipmentId: shipment._id,
      carrier: shipment.carrier,
      trackingNumber: shipment.trackingNumber,
      trackingUrl: shipment.trackingUrl
    };

    await createNotification({
      user: userId,
      title,
      message,
      type: 'order_shipped',
      detailsUrl,
      additionalData
    });

    // Also send an email notification
    await sendEmail(
      userId,
      title,
      `
        <h2>Your Order Has Shipped!</h2>
        <p>Good news! Your order ${order.orderNumber} is on its way.</p>
        <p><strong>Carrier:</strong> ${shipment.carrier}</p>
        <p><strong>Tracking Number:</strong> ${shipment.trackingNumber || 'Not available'}</p>
        ${shipment.trackingUrl ? `<p><a href="${shipment.trackingUrl}">Track Your Package</a></p>` : ''}
        <p>Expected delivery: ${shipment.estimatedDeliveryDate ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString() : 'To be determined'}</p>
        <p><a href="${process.env.FRONTEND_URL}${detailsUrl}">View Order Details</a></p>
      `
    );

    // Send SMS notification if enabled
    await smsService.sendShipmentNotification(userId, shipment, 'created');
  } catch (error) {
    console.error('Error creating shipment notification:', error);
  }
};

/**
 * Create notification for shipping update
 * @param {Object} order - The order
 * @param {Object} shipment - The shipment
 * @param {Object} event - The shipping event
 */
const createShippingUpdateNotification = async (order, shipment, event) => {
  try {
    const userId = order.user;
    const title = 'Shipping Update';
    const message = `Update for your order ${order.orderNumber}: ${event.description}`;
    const detailsUrl = `/account/shipments/${shipment._id}`;
    const additionalData = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      shipmentId: shipment._id,
      eventDate: event.eventDate,
      eventDescription: event.description,
      eventStatus: event.status
    };

    await createNotification({
      user: userId,
      title,
      message,
      type: 'shipping_update',
      detailsUrl,
      additionalData
    });

    // Send email for important status changes only
    if (['out_for_delivery', 'delivered', 'exception'].includes(event.status)) {
      await sendEmail(
        userId,
        title,
        `
          <h2>Shipping Update for Order ${order.orderNumber}</h2>
          <p>${event.description}</p>
          <p><strong>Status:</strong> ${formatStatus(event.status)}</p>
          <p><strong>Date:</strong> ${new Date(event.eventDate).toLocaleString()}</p>
          ${event.location ? `<p><strong>Location:</strong> ${event.location}</p>` : ''}
          <p><a href="${process.env.FRONTEND_URL}${detailsUrl}">View Tracking Details</a></p>
        `
      );

      // Send SMS notification if enabled
      await smsService.sendShipmentNotification(userId, shipment, event.status);
    }
  } catch (error) {
    console.error('Error creating shipping update notification:', error);
  }
};

/**
 * Create notification for shipping damage report
 * @param {Object} order - The order
 * @param {Object} shipment - The shipment
 * @param {string} description - Damage description
 */
const createShipmentDamageNotification = async (order, shipment, description) => {
  try {
    // First, notify the vendor or admin
    const vendorIds = await getVendorsForOrder(order);
    if (vendorIds.length > 0) {
      for (const vendorId of vendorIds) {
        await createNotification({
          user: vendorId,
          title: 'Shipping Damage Reported',
          message: `Customer reported damage for order ${order.orderNumber}`,
          type: 'damage_report',
          priority: 'high',
          detailsUrl: `/vendor/orders/${order._id}`,
          additionalData: {
            orderId: order._id,
            orderNumber: order.orderNumber,
            shipmentId: shipment._id,
            description
          }
        });

        // Send email to vendor
        await sendEmail(
          vendorId,
          'Shipping Damage Reported',
          `
            <h2>Damage Report for Order ${order.orderNumber}</h2>
            <p>A customer has reported damage to their shipment.</p>
            <p><strong>Order:</strong> ${order.orderNumber}</p>
            <p><strong>Description:</strong> ${description}</p>
            <p><a href="${process.env.FRONTEND_URL}/vendor/orders/${order._id}">View Order Details</a></p>
          `
        );
      }
    }

    // Then, send acknowledgement to the customer
    const userId = order.user;
    await createNotification({
      user: userId,
      title: 'Damage Report Received',
      message: `We've received your damage report for order ${order.orderNumber}`,
      type: 'damage_report_confirmation',
      detailsUrl: `/account/orders/${order._id}`,
      additionalData: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        shipmentId: shipment._id
      }
    });

    // Send email to customer
    await sendEmail(
      userId,
      'Damage Report Received',
      `
        <h2>We've Received Your Damage Report</h2>
        <p>Thank you for reporting the damage to your order ${order.orderNumber}.</p>
        <p>Our customer service team will review your report and contact you within 24 hours to resolve this issue.</p>
        <p><a href="${process.env.FRONTEND_URL}/account/orders/${order._id}">View Order Details</a></p>
      `
    );

    // Send SMS acknowledgement if enabled
    await smsService.sendDamageReportAcknowledgement(userId, shipment);
  } catch (error) {
    console.error('Error creating damage notification:', error);
  }
};

/**
 * Create notification for return shipment
 * @param {Object} order - The order
 * @param {Object} returnShipment - The return shipment
 */
const createReturnShipmentNotification = async (order, returnShipment) => {
  try {
    const userId = order.user;
    const title = 'Return Shipment Created';
    const message = `A return shipment has been created for your order ${order.orderNumber}`;
    const detailsUrl = `/account/shipments/${returnShipment._id}`;
    const additionalData = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      shipmentId: returnShipment._id,
      returnReason: returnShipment.returnReason,
      trackingNumber: returnShipment.trackingNumber,
      trackingUrl: returnShipment.trackingUrl
    };

    await createNotification({
      user: userId,
      title,
      message,
      type: 'return_created',
      detailsUrl,
      additionalData
    });

    // Send email notification
    await sendEmail(
      userId,
      title,
      `
        <h2>Return Shipment Created</h2>
        <p>A return shipment has been created for your order ${order.orderNumber}.</p>
        <p><strong>Return Reason:</strong> ${returnShipment.returnReason || 'Not specified'}</p>
        ${returnShipment.trackingNumber ? `<p><strong>Tracking Number:</strong> ${returnShipment.trackingNumber}</p>` : ''}
        ${returnShipment.trackingUrl ? `<p><a href="${returnShipment.trackingUrl}">Track Your Return</a></p>` : ''}
        <p><a href="${process.env.FRONTEND_URL}${detailsUrl}">View Return Details</a></p>
      `
    );

    // Send SMS notification if enabled
    await smsService.sendShipmentNotification(userId, returnShipment, 'returned');
  } catch (error) {
    console.error('Error creating return shipment notification:', error);
  }
};

// Helper function to get vendors related to an order
const getOrderVendors = async (order) => {
  // This would need to be implemented based on your product-vendor relationship
  // For now, we'll return a mock vendor ID
  return ['vendor1', 'vendor2'];
};

// Helper function to get vendors for an order
const getVendorsForOrder = async (order) => {
  // This would query the database for vendors related to products in the order
  // For now, return a mock array of vendor IDs
  return ['vendor1', 'vendor2'];
};

/**
 * Format status for display
 * @param {string} status - The status code
 * @returns {string} Formatted status
 */
function formatStatus(status) {
  if (!status) return '';

  // Replace underscores with spaces and capitalize each word
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

module.exports = {
  createNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createNewOrderNotification,
  createOrderConfirmationNotification,
  createOrderStatusUpdateNotification,
  createOrderShippedNotification,
  createOrderDeliveredNotification,
  createLowInventoryNotification,
  createOutOfStockNotification,
  createShipmentCreatedNotification,
  createShippingUpdateNotification,
  createShipmentDamageNotification,
  createReturnShipmentNotification
};

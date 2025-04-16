/**
 * Notification Controller
 *
 * Handles API endpoints related to notifications and user preferences
 */
const { Notification, NotificationType, UserNotificationPreference } = require('../../models/notificationModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const notificationService = require('../../utils/notificationService');

/**
 * @desc    Get user's notifications
 * @route   GET /api/notifications
 * @access  Private
 */
exports.getUserNotifications = asyncHandler(async (req, res, next) => {
  // Get pagination parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Filter by read status if specified
  const filter = { 'recipients.user': req.user.id };
  if (req.query.read === 'true') {
    filter['recipients.isRead'] = true;
  } else if (req.query.read === 'false') {
    filter['recipients.isRead'] = false;
  }

  // Count total matching documents for pagination
  const total = await Notification.countDocuments(filter);

  // Get notifications with populated notification type
  const notifications = await Notification.find(filter)
    .populate('type')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Process notifications to include recipient-specific fields
  const processedNotifications = notifications.map(notification => {
    const recipientInfo = notification.recipients.find(
      r => r.user.toString() === req.user.id
    );

    return {
      id: notification._id,
      title: notification.title,
      content: notification.content,
      type: notification.type.name,
      sourceType: notification.sourceType,
      sourceId: notification.sourceId,
      createdAt: notification.createdAt,
      isRead: recipientInfo ? recipientInfo.isRead : false,
      readAt: recipientInfo ? recipientInfo.readAt : null
    };
  });

  res.status(200).json({
    success: true,
    count: processedNotifications.length,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    data: processedNotifications
  });
});

/**
 * @desc    Get notification by ID
 * @route   GET /api/notifications/:id
 * @access  Private
 */
exports.getNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    'recipients.user': req.user.id
  }).populate('type');

  if (!notification) {
    return next(new ErrorResponse(`Notification not found with id of ${req.params.id}`, 404));
  }

  // Get recipient-specific info
  const recipientInfo = notification.recipients.find(
    r => r.user.toString() === req.user.id
  );

  // Mark as read if not already read
  if (recipientInfo && !recipientInfo.isRead) {
    await notificationService.markAsRead(notification._id, req.user.id);
    recipientInfo.isRead = true;
    recipientInfo.readAt = new Date();
  }

  const processedNotification = {
    id: notification._id,
    title: notification.title,
    content: notification.content,
    type: notification.type.name,
    sourceType: notification.sourceType,
    sourceId: notification.sourceId,
    createdAt: notification.createdAt,
    isRead: recipientInfo ? recipientInfo.isRead : false,
    readAt: recipientInfo ? recipientInfo.readAt : null
  };

  res.status(200).json({
    success: true,
    data: processedNotification
  });
});

/**
 * @desc    Mark notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
exports.markAsRead = asyncHandler(async (req, res, next) => {
  const result = await notificationService.markAsRead(req.params.id, req.user.id);

  if (!result) {
    return next(new ErrorResponse(`Notification not found or already read`, 404));
  }

  res.status(200).json({
    success: true,
    data: { message: 'Notification marked as read' }
  });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
exports.markAllAsRead = asyncHandler(async (req, res, next) => {
  const count = await notificationService.markAllAsRead(req.user.id);

  res.status(200).json({
    success: true,
    data: { message: `${count} notifications marked as read` }
  });
});

/**
 * @desc    Get unread notification count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await notificationService.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    data: { count }
  });
});

/**
 * @desc    Get user notification preferences
 * @route   GET /api/notifications/preferences
 * @access  Private
 */
exports.getNotificationPreferences = asyncHandler(async (req, res, next) => {
  // Get all notification types
  const notificationTypes = await NotificationType.find();

  // Get user's existing preferences
  const userPreferences = await UserNotificationPreference.find({
    user: req.user.id
  }).populate('notificationType');

  // Map user preferences by notification type ID for easier lookup
  const preferencesMap = {};
  userPreferences.forEach(pref => {
    preferencesMap[pref.notificationType._id.toString()] = {
      inAppEnabled: pref.inAppEnabled,
      emailEnabled: pref.emailEnabled
    };
  });

  // Combine all types with user preferences
  const preferences = notificationTypes.map(type => {
    const userPref = preferencesMap[type._id.toString()] || {
      inAppEnabled: true,
      emailEnabled: true
    };

    return {
      id: type._id,
      name: type.name,
      description: type.description,
      inAppEnabled: userPref.inAppEnabled,
      emailEnabled: userPref.emailEnabled
    };
  });

  res.status(200).json({
    success: true,
    data: preferences
  });
});

/**
 * @desc    Update notification preferences
 * @route   PUT /api/notifications/preferences
 * @access  Private
 */
exports.updateNotificationPreferences = asyncHandler(async (req, res, next) => {
  const { preferences } = req.body;

  if (!preferences || !Array.isArray(preferences)) {
    return next(new ErrorResponse('Please provide an array of preferences', 400));
  }

  const results = [];

  // Process each preference update
  for (const pref of preferences) {
    if (!pref.id || (pref.inAppEnabled === undefined && pref.emailEnabled === undefined)) {
      continue; // Skip invalid entries
    }

    // Find notification type to ensure it exists
    const notificationType = await NotificationType.findById(pref.id);
    if (!notificationType) {
      results.push({
        id: pref.id,
        success: false,
        message: 'Notification type not found'
      });
      continue;
    }

    try {
      // Find or create user preference
      let userPref = await UserNotificationPreference.findOne({
        user: req.user.id,
        notificationType: pref.id
      });

      if (userPref) {
        // Update existing preference
        if (pref.inAppEnabled !== undefined) {
          userPref.inAppEnabled = pref.inAppEnabled;
        }
        if (pref.emailEnabled !== undefined) {
          userPref.emailEnabled = pref.emailEnabled;
        }
        await userPref.save();
      } else {
        // Create new preference
        userPref = await UserNotificationPreference.create({
          user: req.user.id,
          notificationType: pref.id,
          inAppEnabled: pref.inAppEnabled !== undefined ? pref.inAppEnabled : true,
          emailEnabled: pref.emailEnabled !== undefined ? pref.emailEnabled : true
        });
      }

      results.push({
        id: pref.id,
        success: true,
        data: {
          inAppEnabled: userPref.inAppEnabled,
          emailEnabled: userPref.emailEnabled
        }
      });
    } catch (error) {
      console.error(`Error updating preference for ${pref.id}:`, error);
      results.push({
        id: pref.id,
        success: false,
        message: 'Error updating preference'
      });
    }
  }

  res.status(200).json({
    success: true,
    data: results
  });
});

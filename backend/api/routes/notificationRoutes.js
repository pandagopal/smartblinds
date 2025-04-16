const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getNotificationPreferences,
  updateNotificationPreferences
} = require('../controllers/notificationController');

// Notification controller stub
const notificationController = {
  getNotifications: (req, res) => {
    res.status(200).json({ success: true, message: 'Get notifications endpoint - stub implementation', data: [] });
  },
  getNotification: (req, res) => {
    res.status(200).json({ success: true, message: 'Get notification endpoint - stub implementation', data: {} });
  },
  markAsRead: (req, res) => {
    res.status(200).json({ success: true, message: 'Mark notification as read endpoint - stub implementation', data: {} });
  },
  markAllAsRead: (req, res) => {
    res.status(200).json({ success: true, message: 'Mark all notifications as read endpoint - stub implementation', data: {} });
  },
  getUnreadCount: (req, res) => {
    res.status(200).json({ success: true, message: 'Get unread count endpoint - stub implementation', data: { count: 0 } });
  }
};

// Get unread count and mark all as read
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/read-all', notificationController.markAllAsRead);

// Notification preferences
router.route('/preferences')
  .get(getNotificationPreferences)
  .put(updateNotificationPreferences);

// Individual notifications
router.route('/:id')
  .get(notificationController.getNotification);

router.route('/:id/read')
  .put(notificationController.markAsRead);

// Get all user notifications
router.route('/')
  .get(notificationController.getNotifications);

module.exports = router;

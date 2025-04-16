/**
 * Notification models
 */
const mongoose = require('mongoose');

/**
 * NotificationType Schema
 * Defines the types of notifications the system can send
 */
const NotificationTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  template: {
    type: String,
    required: true
  },
  emailTemplate: {
    type: String
  },
  smsTemplate: {
    type: String
  },
  category: {
    type: String,
    enum: ['order', 'product', 'account', 'system'],
    default: 'system'
  },
  icon: {
    type: String,
    default: 'bell'
  },
  color: {
    type: String,
    default: 'blue'
  },
  isUserConfigurable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

/**
 * Notification Schema
 * Individual notifications to users
 */
const NotificationSchema = new mongoose.Schema({
  type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotificationType',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  sourceType: {
    type: String
  },
  sourceId: {
    type: String
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    isEmailed: {
      type: Boolean,
      default: false
    },
    emailedAt: {
      type: Date
    },
    emailStatus: {
      type: String,
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    }
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

/**
 * UserNotificationPreference Schema
 * User preferences for receiving notifications
 */
const UserNotificationPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notificationType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NotificationType',
    required: true
  },
  inAppEnabled: {
    type: Boolean,
    default: true
  },
  emailEnabled: {
    type: Boolean,
    default: true
  },
  smsEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create unique compound index
UserNotificationPreferenceSchema.index({ user: 1, notificationType: 1 }, { unique: true });

// Pre-save hook to ensure notification doesn't get persisted if it has no recipients
NotificationSchema.pre('save', function(next) {
  if (!this.recipients || this.recipients.length === 0) {
    const error = new Error('Notification must have at least one recipient');
    return next(error);
  }
  next();
});

// Create the models
const NotificationType = mongoose.model('NotificationType', NotificationTypeSchema);
const Notification = mongoose.model('Notification', NotificationSchema);
const UserNotificationPreference = mongoose.model('UserNotificationPreference', UserNotificationPreferenceSchema);

module.exports = {
  NotificationType,
  Notification,
  UserNotificationPreference
};

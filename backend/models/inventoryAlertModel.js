const mongoose = require('mongoose');

const InventoryAlertSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material'
  },
  color: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Color'
  },
  alertType: {
    type: String,
    enum: ['low_stock', 'out_of_stock', 'restock'],
    required: true
  },
  threshold: {
    type: Number
  },
  currentLevel: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isResolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }
}, {
  timestamps: true
});

// Create indexes for performance
InventoryAlertSchema.index({ product: 1 });
InventoryAlertSchema.index({ material: 1 });
InventoryAlertSchema.index({ color: 1 });
InventoryAlertSchema.index({ alertType: 1 });
InventoryAlertSchema.index({ isActive: 1 });
InventoryAlertSchema.index({ isResolved: 1 });

const InventoryAlert = mongoose.model('InventoryAlert', InventoryAlertSchema);

module.exports = InventoryAlert;

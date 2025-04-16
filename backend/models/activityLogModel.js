const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    activityType: {
      type: String,
      enum: [
        'ORDER_STATUS_CHANGE',
        'PRODUCT_PRICE_UPDATE',
        'PRODUCT_CREATED',
        'PRODUCT_UPDATED',
        'PRODUCT_DELETED',
        'INVENTORY_UPDATED',
        'USER_ADDED',
        'USER_REMOVED',
        'PERMISSION_CHANGED',
        'BULK_UPLOAD',
        'SETTINGS_CHANGED',
        'CHAT_MESSAGE_SENT'
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: Object,
      default: {},
    },
    entityId: {
      type: String,
    },
    entityType: {
      type: String,
      enum: ['product', 'order', 'user', 'inventory', 'team-member', null],
    },
    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
ActivityLogSchema.index({ vendorId: 1, createdAt: -1 });
ActivityLogSchema.index({ userId: 1 });
ActivityLogSchema.index({ activityType: 1 });
ActivityLogSchema.index({ entityId: 1, entityType: 1 });

// SQL table creation statement for PostgreSQL
const createActivityLogTableSQL = `
CREATE TABLE IF NOT EXISTS activity_logs (
  log_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  vendor_id INTEGER NOT NULL REFERENCES users(id),
  activity_type VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  entity_id VARCHAR(255),
  entity_type VARCHAR(50),
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_vendor_date ON activity_logs(vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_id, entity_type);
`;

// Function to create activity log in SQL database
const createActivityLogSQL = `
INSERT INTO activity_logs (
  user_id, vendor_id, activity_type, description, details, entity_id, entity_type, ip_address
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;
`;

// Function to retrieve activity logs for a vendor
const getVendorActivityLogsSQL = `
SELECT
  al.*,
  u.name AS user_name,
  u.email AS user_email
FROM activity_logs al
JOIN users u ON al.user_id = user_id
WHERE al.vendor_id = $1
ORDER BY al.created_at DESC
LIMIT $2 OFFSET $3;
`;

// Function to retrieve filtered activity logs
const getFilteredActivityLogsSQL = `
SELECT
  al.*,
  u.name AS user_name,
  u.email AS user_email
FROM activity_logs al
JOIN users u ON al.user_id = user_id
WHERE al.vendor_id = $1
  ${/* Additional filter params will be added dynamically */ ''}
ORDER BY al.created_at DESC
LIMIT $2 OFFSET $3;
`;

// Function to delete activity logs (admin only)
const deleteActivityLogsSQL = `
DELETE FROM activity_logs
WHERE log_id = ANY($1::int[]);
`;

module.exports = {
  // MongoDB model if using MongoDB
  model: mongoose.model('ActivityLog', ActivityLogSchema),

  // SQL queries for PostgreSQL
  createActivityLogTableSQL,
  createActivityLogSQL,
  getVendorActivityLogsSQL,
  getFilteredActivityLogsSQL,
  deleteActivityLogsSQL
};

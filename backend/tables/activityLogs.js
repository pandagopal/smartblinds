/**
 * PostgreSQL schema and queries for activity_logs table
 * This tracks all actions performed by vendor team members
 */

// Table creation SQL
const createTableSQL = `
CREATE TABLE IF NOT EXISTS blinds.activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  vendor_id INTEGER NOT NULL REFERENCES users(id),
  activity_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  entity_id VARCHAR(255),
  entity_type VARCHAR(50),
  ip_address VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS blinds.idx_activity_logs_vendor_date ON activity_logs(vendor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS blinds.idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS blinds.idx_activity_logs_type ON activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS blinds.idx_activity_logs_entity ON activity_logs(entity_id, entity_type);
`;

// Insert a new activity log entry
const createLogSQL = `
INSERT INTO blinds.activity_logs (
  user_id, vendor_id, activity_type, description, details, entity_id, entity_type, ip_address
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;
`;

// Get all logs for a vendor, paginated
const getVendorLogsSQL = `
SELECT
  al.*,
  u.name AS user_name,
  u.email AS user_email
FROM activity_logs al
JOIN blinds.users u ON al.user_id = user_id
WHERE al.vendor_id = $1
ORDER BY al.created_at DESC
LIMIT $2 OFFSET $3;
`;

// Get count of logs for a vendor (for pagination)
const getVendorLogCountSQL = `
SELECT COUNT(*) FROM blinds.activity_logs
WHERE vendor_id = $1;
`;

// Get filtered logs with dynamic WHERE conditions
const getFilteredLogsSQL = (filters) => {
  const conditions = ['al.vendor_id = $1'];
  const params = [];
  let paramIndex = 2;

  if (filters.startDate) {
    conditions.push(`al.created_at >= $${paramIndex}`);
    params.push(filters.startDate);
    paramIndex++;
  }

  if (filters.endDate) {
    conditions.push(`al.created_at <= $${paramIndex}`);
    params.push(filters.endDate);
    paramIndex++;
  }

  if (filters.activityTypes?.length) {
    conditions.push(`al.activity_type = ANY($${paramIndex}::varchar[])`);
    params.push(filters.activityTypes);
    paramIndex++;
  }

  if (filters.userId) {
    conditions.push(`al.user_id = $${paramIndex}`);
    params.push(filters.userId);
    paramIndex++;
  }

  if (filters.entityId) {
    conditions.push(`al.entity_id = $${paramIndex}`);
    params.push(filters.entityId);
    paramIndex++;
  }

  if (filters.entityType) {
    conditions.push(`al.entity_type = $${paramIndex}`);
    params.push(filters.entityType);
    paramIndex++;
  }

  if (filters.search) {
    conditions.push(`(al.description ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const sql = `
    SELECT
      al.*,
      u.name AS user_name,
      u.email AS user_email
    FROM activity_logs al
    JOIN blinds.users u ON al.user_id = user_id
    WHERE ${conditions.join(' AND ')}
    ORDER BY al.created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
  `;

  params.push(filters.limit || 20, filters.offset || 0);
  return { sql, params };
};

// Get filtered logs count with dynamic WHERE conditions
const getFilteredLogCountSQL = (filters) => {
  const conditions = ['al.vendor_id = $1'];
  const params = [];
  let paramIndex = 2;

  if (filters.startDate) {
    conditions.push(`al.created_at >= $${paramIndex}`);
    params.push(filters.startDate);
    paramIndex++;
  }

  if (filters.endDate) {
    conditions.push(`al.created_at <= $${paramIndex}`);
    params.push(filters.endDate);
    paramIndex++;
  }

  if (filters.activityTypes?.length) {
    conditions.push(`al.activity_type = ANY($${paramIndex}::varchar[])`);
    params.push(filters.activityTypes);
    paramIndex++;
  }

  if (filters.userId) {
    conditions.push(`al.user_id = $${paramIndex}`);
    params.push(filters.userId);
    paramIndex++;
  }

  if (filters.entityId) {
    conditions.push(`al.entity_id = $${paramIndex}`);
    params.push(filters.entityId);
    paramIndex++;
  }

  if (filters.entityType) {
    conditions.push(`al.entity_type = $${paramIndex}`);
    params.push(filters.entityType);
    paramIndex++;
  }

  if (filters.search) {
    conditions.push(`(al.description ILIKE $${paramIndex} OR u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const sql = `
    SELECT COUNT(*)
    FROM blinds.activity_logs al
    JOIN blinds.users u ON al.user_id = user_id
    WHERE ${conditions.join(' AND ')};
  `;

  return { sql, params };
};

// Delete activity logs (admin only)
const deleteLogsSQL = `
DELETE FROM blinds.activity_logs
WHERE id = ANY($1::int[]);
`;

module.exports = {
  createTableSQL,
  createLogSQL,
  getVendorLogsSQL,
  getVendorLogCountSQL,
  getFilteredLogsSQL,
  getFilteredLogCountSQL,
  deleteLogsSQL
};

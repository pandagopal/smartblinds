/**
 * PostgreSQL schema and queries for admin_actions table
 * Logs administrative actions for audit purposes
 */

// Table creation SQL
const createTableSQL = `
CREATE TABLE IF NOT EXISTS admin_actions (
  action_id SERIAL PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES users(id),
  action_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_type ON admin_actions(action_type, entity_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_entity ON admin_actions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created ON admin_actions(created_at);
`;

// Add a new admin action
const createActionSQL = `
INSERT INTO admin_actions (
  admin_id, action_type, entity_type, entity_id, details
) VALUES ($1, $2, $3, $4, $5)
RETURNING *;
`;

// Get admin actions with pagination
const getAdminActionsSQL = `
SELECT aa.*, u.name as admin_name, u.email as admin_email
FROM blinds.admin_actions aa
JOIN blinds.users u ON aa.admin_id = user_id
ORDER BY aa.created_at DESC
LIMIT $1 OFFSET $2;
`;

// Get admin actions by admin id
const getActionsByAdminSQL = `
SELECT aa.*, u.name as admin_name, u.email as admin_email
FROM blinds.admin_actions aa
JOIN blinds.users u ON aa.admin_id = u.user_id
WHERE aa.admin_id = $1
ORDER BY aa.created_at DESC
LIMIT $2 OFFSET $3;
`;

// Get admin actions by entity
const getActionsByEntitySQL = `
SELECT aa.*, u.name as admin_name, u.email as admin_email
FROM blinds.admin_actions aa
JOIN blinds.users u ON aa.admin_id = u.user_id
WHERE aa.entity_type = $1 AND aa.entity_id = $2
ORDER BY aa.created_at DESC
LIMIT $3 OFFSET $4;
`;

// Get admin actions count
const getActionsCountSQL = `
SELECT COUNT(*) FROM blinds.admin_actions
`;

module.exports = {
  createTableSQL,
  createActionSQL,
  getAdminActionsSQL,
  getActionsByAdminSQL,
  getActionsByEntitySQL,
  getActionsCountSQL
};

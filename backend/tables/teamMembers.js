/**
 * PostgreSQL schema and queries for team_members table
 * This manages vendor team members and their permissions
 */

// Table creation SQL
const createTableSQL = `
CREATE TABLE IF NOT EXISTS blinds.team_members (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  vendor_id INTEGER NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL,
  permissions JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'invited',
  invited_by VARCHAR(255),
  last_login TIMESTAMP,
  invite_token VARCHAR(255),
  invite_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email, vendor_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS blinds.idx_team_members_vendor ON team_members(vendor_id);
CREATE INDEX IF NOT EXISTS blinds.idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS blinds.idx_team_members_token ON team_members(invite_token);
`;

// Default permissions by role
const defaultPermissions = {
  'vendor-admin': [
    { category: 'orders', level: 'full' },
    { category: 'products', level: 'full' },
    { category: 'inventory', level: 'full' },
    { category: 'analytics', level: 'full' },
    { category: 'team', level: 'full' },
    { category: 'settings', level: 'full' },
    { category: 'chat', level: 'full' },
    { category: 'billing', level: 'full' }
  ],
  'factory-manager': [
    { category: 'orders', level: 'edit' },
    { category: 'products', level: 'view' },
    { category: 'inventory', level: 'edit' },
    { category: 'analytics', level: 'view' },
    { category: 'team', level: 'none' },
    { category: 'settings', level: 'none' },
    { category: 'chat', level: 'edit' },
    { category: 'billing', level: 'none' }
  ],
  'customer-support': [
    { category: 'orders', level: 'view' },
    { category: 'products', level: 'view' },
    { category: 'inventory', level: 'none' },
    { category: 'analytics', level: 'none' },
    { category: 'team', level: 'none' },
    { category: 'settings', level: 'none' },
    { category: 'chat', level: 'edit' },
    { category: 'billing', level: 'none' }
  ],
  'sales-associate': [
    { category: 'orders', level: 'view' },
    { category: 'products', level: 'edit' },
    { category: 'inventory', level: 'view' },
    { category: 'analytics', level: 'view' },
    { category: 'team', level: 'none' },
    { category: 'settings', level: 'none' },
    { category: 'chat', level: 'edit' },
    { category: 'billing', level: 'none' }
  ],
  'viewer': [
    { category: 'orders', level: 'view' },
    { category: 'products', level: 'view' },
    { category: 'inventory', level: 'view' },
    { category: 'analytics', level: 'view' },
    { category: 'team', level: 'view' },
    { category: 'settings', level: 'view' },
    { category: 'chat', level: 'view' },
    { category: 'billing', level: 'view' }
  ]
};

// Create a team member
const createTeamMemberSQL = `
INSERT INTO blinds.team_members (
  user_id, vendor_id, name, email, phone, role, permissions, status, invited_by, invite_token, invite_token_expires
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *;
`;

// Get all team members for a vendor
const getVendorTeamMembersSQL = `
SELECT tm.*, u.name as user_name, u.email as user_email
FROM blinds.team_members tm
LEFT JOIN blinds.users u ON tm.user_id = user_id
WHERE tm.vendor_id = $1
ORDER BY
  CASE WHEN tm.role = 'vendor-admin' THEN 1
       WHEN tm.role = 'factory-manager' THEN 2
       WHEN tm.role = 'sales-associate' THEN 3
       WHEN tm.role = 'customer-support' THEN 4
       ELSE 5 END,
  tm.created_at;
`;

// Get a specific team member
const getTeamMemberSQL = `
SELECT tm.*, u.name as user_name, u.email as user_email
FROM blinds.team_members tm
LEFT JOIN blinds.users u ON tm.user_id = user_id
WHERE tm.id = $1 AND tm.vendor_id = $2;
`;

// Get a team member by email (for checking if already exists)
const getTeamMemberByEmailSQL = `
SELECT * FROM blinds.team_members
WHERE email = $1 AND vendor_id = $2;
`;

// Check if team member exists in vendor team
const checkTeamMemberExistsSQL = `
SELECT COUNT(*) FROM blinds.team_members
WHERE id = $1 AND vendor_id = $2;
`;

// Update a team member
const updateTeamMemberSQL = `
UPDATE blinds.team_members
SET
  name = COALESCE($3, name),
  role = COALESCE($4, role),
  permissions = COALESCE($5, permissions),
  status = COALESCE($6, status),
  phone = COALESCE($7, phone),
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1 AND vendor_id = $2
RETURNING *;
`;

// Update team member last login
const updateTeamMemberLastLoginSQL = `
UPDATE blinds.team_members
SET last_login = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
`;

// Delete a team member
const deleteTeamMemberSQL = `
DELETE FROM blinds.team_members
WHERE id = $1 AND vendor_id = $2
RETURNING id;
`;

// Verify team member invitation
const verifyInvitationSQL = `
SELECT tm.*, v.name as vendor_name, v.email as vendor_email
FROM blinds.team_members tm
JOIN blinds.users v ON tm.vendor_id = v.id
WHERE tm.invite_token = $1 AND tm.invite_token_expires > CURRENT_TIMESTAMP;
`;

// Accept team member invitation
const acceptInvitationSQL = `
UPDATE blinds.team_members
SET
  user_id = $2,
  status = 'active',
  invite_token = NULL,
  invite_token_expires = NULL,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
`;

// Check if user has permission
const checkPermissionSQL = `
SELECT
  (permissions->$2->>'level') as permission_level
FROM blinds.team_members
WHERE (user_id = $1 OR id = $1) AND status = 'active';
`;

// Search team members
const searchTeamMembersSQL = `
SELECT tm.*, u.name as user_name, u.email as user_email
FROM blinds.team_members tm
LEFT JOIN blinds.users u ON tm.user_id = user_id
WHERE tm.vendor_id = $1
  AND (tm.name ILIKE $2 OR tm.email ILIKE $2
    OR u.name ILIKE $2 OR u.email ILIKE $2)
ORDER BY tm.created_at DESC
LIMIT $3 OFFSET $4;
`;

module.exports = {
  createTableSQL,
  defaultPermissions,
  createTeamMemberSQL,
  getVendorTeamMembersSQL,
  getTeamMemberSQL,
  getTeamMemberByEmailSQL,
  checkTeamMemberExistsSQL,
  updateTeamMemberSQL,
  updateTeamMemberLastLoginSQL,
  deleteTeamMemberSQL,
  verifyInvitationSQL,
  acceptInvitationSQL,
  checkPermissionSQL,
  searchTeamMembersSQL
};

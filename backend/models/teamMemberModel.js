const mongoose = require('mongoose');

// Permission schema for team members
const PermissionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        'orders',
        'products',
        'inventory',
        'analytics',
        'team',
        'settings',
        'chat',
        'billing'
      ],
      required: true,
    },
    level: {
      type: String,
      enum: ['none', 'view', 'edit', 'full'],
      default: 'none',
      required: true,
    },
  },
  { _id: false }
);

// Team member schema
const TeamMemberSchema = new mongoose.Schema(
  {
    // Reference to user if they exist in the system
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // The vendor this team member belongs to
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: [
        'vendor-admin',      // Full access to all vendor features
        'factory-manager',   // Can manage production, inventory, and orders
        'customer-support',  // Can view orders and communicate with customers
        'sales-associate',   // Can manage products and pricing
        'viewer'             // Read-only access to dashboards and reports
      ],
      required: true,
    },
    permissions: {
      type: [PermissionSchema],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'invited', 'disabled'],
      default: 'invited',
    },
    invitedBy: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
    inviteToken: {
      type: String,
    },
    inviteTokenExpires: {
      type: Date,
    }
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
TeamMemberSchema.index({ vendorId: 1 });
TeamMemberSchema.index({ email: 1, vendorId: 1 }, { unique: true });
TeamMemberSchema.index({ userId: 1 }, { sparse: true });
TeamMemberSchema.index({ inviteToken: 1 }, { sparse: true });

// SQL table creation statement for PostgreSQL
const createTeamMemberTableSQL = `
CREATE TABLE IF NOT EXISTS team_members (
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

CREATE INDEX IF NOT EXISTS idx_team_members_vendor ON team_members(vendor_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_token ON team_members(invite_token);
`;

// Function to create team member in SQL database
const createTeamMemberSQL = `
INSERT INTO team_members (
  user_id, vendor_id, name, email, phone, role, permissions, status, invited_by, invite_token, invite_token_expires
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *;
`;

// Function to get all team members for a vendor
const getVendorTeamMembersSQL = `
SELECT tm.*, u.name as user_name, u.email as user_email
FROM blinds.team_members tm
LEFT JOIN blinds.users u ON tm.user_id = u.user_id
WHERE tm.vendor_id = $1
ORDER BY tm.created_at DESC;
`;

// Function to get a specific team member
const getTeamMemberSQL = `
SELECT tm.*, u.name as user_name, u.email as user_email
FROM blinds.team_members tm
LEFT JOIN blinds.users u ON tm.user_id = u.user_id
WHERE tm.id = $1 AND tm.vendor_id = $2;
`;

// Function to update a team member
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

// Function to delete a team member
const deleteTeamMemberSQL = `
DELETE FROM blinds.team_members
WHERE id = $1 AND vendor_id = $2
RETURNING id;
`;

// Function to verify invitation
const verifyInvitationSQL = `
SELECT * FROM blinds.team_members
WHERE invite_token = $1 AND invite_token_expires > CURRENT_TIMESTAMP;
`;

// Function to accept invitation
const acceptInvitationSQL = `
UPDATE team_members
SET
  user_id = $2,
  status = 'active',
  invite_token = NULL,
  invite_token_expires = NULL,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
`;

module.exports = {
  // MongoDB model if using MongoDB
  model: mongoose.model('TeamMember', TeamMemberSchema),

  // SQL queries for PostgreSQL
  createTeamMemberTableSQL,
  createTeamMemberSQL,
  getVendorTeamMembersSQL,
  getTeamMemberSQL,
  updateTeamMemberSQL,
  deleteTeamMemberSQL,
  verifyInvitationSQL,
  acceptInvitationSQL
};

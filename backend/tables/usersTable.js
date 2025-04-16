/**
 * PostgreSQL schema and queries for users table
 */

// Table creation SQL
const createTableSQL = `
CREATE TABLE IF NOT EXISTS blinds.users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'customer',
  phone VARCHAR(50),
  social_provider VARCHAR(50),
  social_id VARCHAR(255),
  profile_image VARCHAR(255),
  reset_password_token VARCHAR(255),
  reset_password_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS blinds.idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS blinds.idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS blinds.idx_users_social ON users(social_provider, social_id);
`;

// Table creation SQL for vendor_info
const createVendorInfoTableSQL = `
CREATE TABLE IF NOT EXISTS blinds.vendor_info (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255),
  business_description TEXT,
  website VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  categories JSONB DEFAULT '[]',
  join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS blinds.idx_vendor_info_user ON vendor_info(user_id);
CREATE INDEX IF NOT EXISTS blinds.idx_vendor_info_verified ON vendor_info(is_verified);
`;

// Table creation SQL for addresses
const createAddressesTableSQL = `
CREATE TABLE IF NOT EXISTS blinds.addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(255) NOT NULL,
  state VARCHAR(255) NOT NULL,
  postal_code VARCHAR(50) NOT NULL,
  country VARCHAR(255) DEFAULT 'USA',
  is_default BOOLEAN DEFAULT false,
  address_type VARCHAR(50) DEFAULT 'shipping',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS blinds.idx_addresses_user ON addresses(user_id);
`;

// Insert a new user
const createUserSQL = `
INSERT INTO blinds.users (
  name, email, password, role, phone, social_provider, social_id, profile_image
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;
`;

// Get a user by email
const getUserByEmailSQL = `
SELECT u.user_id ,u.email,u.password_hash,u.first_name,u.last_name,u.phone,u.is_admin,u.is_active,u.last_login,u.auth_token,u.reset_token,u.reset_token_expires,u.verification_token,u.is_verified,u.is_listing_active,
  json_build_object(
    'businessName', vi.business_name,
    'businessDescription', vi.business_description,
    'website', vi.website_url,
    'isVerified', vi.is_verified,
    'categories', vi.approval_status,
    'joinDate', vi.created_at
  ) as vendor_info
FROM blinds.users u
LEFT JOIN blinds.vendor_info vi ON u.user_id = vi.user_id
WHERE u.email = $1;
`;

// Get user by email (simple version)
const getUserByEmailSimpleSQL = `
SELECT * FROM blinds.users WHERE email = $1;
`;

// Get a user by ID
const getUserByIdSQL = `
SELECT u.user_id ,u.email,u.password_hash,u.first_name,u.last_name,u.phone,u.is_admin,u.is_active,u.last_login,u.auth_token,u.reset_token,u.reset_token_expires,u.verification_token,u.is_verified,u.is_listing_active,
  json_build_object(
    'businessName', vi.business_name,
    'businessDescription', vi.business_description,
    'website', vi.website_url,
    'isVerified', vi.is_verified,
    'categories', vi.approval_status,
    'joinDate', vi.created_at
  ) as vendor_info
FROM blinds.users u
LEFT JOIN blinds.vendor_info vi ON u.user_id = vi.user_id
WHERE user_id = $1;
`;

// Get user by reset token
const getUserByResetTokenSQL = `
SELECT * FROM blinds.users WHERE reset_password_token = $1 AND reset_password_expires > NOW();
`;

// Update a user
const updateUserSQL = `
UPDATE blinds.users
SET
  name = COALESCE($2, name),
  email = COALESCE($3, email),
  password = COALESCE($4, password),
  role = COALESCE($5, role),
  phone = COALESCE($6, phone),
  profile_image = COALESCE($7, profile_image),
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
`;

// Create or update vendor info
const upsertVendorInfoSQL = `
INSERT INTO blinds.vendor_info (
  user_id, business_name, business_description, website, is_verified, categories
) VALUES ($1, $2, $3, $4, $5, $6)
ON CONFLICT (user_id)
DO UPDATE SET
  business_name = EXCLUDED.business_name,
  business_description = EXCLUDED.business_description,
  website = EXCLUDED.website,
  is_verified = EXCLUDED.is_verified,
  categories = EXCLUDED.categories,
  updated_at = CURRENT_TIMESTAMP
RETURNING *;
`;

// Create an address
const createAddressSQL = `
INSERT INTO blinds.addresses (
  user_id, address_line1, address_line2, city, state, postal_code, country, is_default, address_type
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;
`;

// Get user addresses
const getUserAddressesSQL = `
SELECT * FROM blinds.addresses
WHERE user_id = $1
ORDER BY is_default DESC, created_at DESC;
`;

// Set password reset token
const setPasswordResetTokenSQL = `
UPDATE blinds.users
SET
  reset_password_token = $2,
  reset_password_expires = $3,
  updated_at = CURRENT_TIMESTAMP
WHERE email = $1
RETURNING *;
`;

// Reset password
const resetPasswordSQL = `
UPDATE blinds.users
SET
  password = $2,
  reset_password_token = NULL,
  reset_password_expires = NULL,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
`;

// Change password
const changePasswordSQL = `
UPDATE blinds.users
SET
  password = $1,
  updated_at = CURRENT_TIMESTAMP
WHERE id = $2
RETURNING *;
`;

module.exports = {
  createTableSQL,
  createVendorInfoTableSQL,
  createAddressesTableSQL,
  createUserSQL,
  getUserByEmailSQL,
  getUserByEmailSimpleSQL,
  getUserByIdSQL,
  updateUserSQL,
  upsertVendorInfoSQL,
  createAddressSQL,
  getUserAddressesSQL,
  setPasswordResetTokenSQL,
  resetPasswordSQL,
  changePasswordSQL,
  getUserByResetTokenSQL
};

-- Migration to align with application expectations

-- Users table (application expects 'id' instead of 'user_id')
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'customer', -- Add role column to users table
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
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role); -- Create an index on the role column for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_social ON users(social_provider, social_id);

-- Vendor information
CREATE TABLE IF NOT EXISTS vendor_info (
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
CREATE INDEX IF NOT EXISTS idx_vendor_info_user ON vendor_info(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_info_verified ON vendor_info(is_verified);

-- Addresses
CREATE TABLE IF NOT EXISTS addresses (
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
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- Create default admin user if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@smartblindshub.com') THEN
    INSERT INTO users (name, email, password, role)
    VALUES ('Admin User', 'admin@smartblindshub.com', '$2b$10$X/4aCzKT0vTLgJHv5XmHzuBDVDPiGSgPCgMcH2DZ7t7N4Qrz9kDJu', 'admin');
  END IF;
END
$$;

-- Update existing admin users
UPDATE users
SET role = 'admin'
WHERE is_admin = TRUE;

-- Add additional roles as needed (you will need to identify these users separately)
-- Example for vendor users (you might need to adjust criteria)
UPDATE users
SET role = 'vendor'
WHERE id IN (SELECT vendor_id FROM vendor_profiles);

-- Example for sales_person users (you will need to identify them with appropriate criteria)
-- UPDATE users
-- SET role = 'sales_person'
-- WHERE id IN (SELECT user_id FROM sales_team);

-- Example for installer users (you will need to identify them with appropriate criteria)
-- UPDATE users
-- SET role = 'installer'
-- WHERE id IN (SELECT user_id FROM installer_profiles);

-- Create a role checking function to make authorization easier
CREATE OR REPLACE FUNCTION check_user_role(user_id INTEGER, required_roles TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM users WHERE id = $1;
    RETURN user_role = ANY(required_roles);
END;
$$ LANGUAGE plpgsql;

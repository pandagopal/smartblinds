-- 1. Add role column to users table
ALTER TABLE blinds.users
ADD COLUMN role VARCHAR(50) DEFAULT 'customer';

-- 2. Migrate existing admin users to have admin role
UPDATE blinds.users
SET role = 'admin'
WHERE is_admin = TRUE;

-- 3. Migrate regular users to have customer role
UPDATE blinds.users
SET role = 'customer'
WHERE is_admin = FALSE AND role IS NULL;

-- 4. Create a roles table for better role management
CREATE TABLE blinds.roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Insert default roles
INSERT INTO blinds.roles (role_name, description) VALUES
('admin', 'Administrator with full system access'),
('customer', 'Regular customer account'),
('vendor', 'Vendor/supplier account'),
('sales_person', 'Sales team member'),
('installer', 'Installation professional');

-- 6. Create a user_roles junction table for users with multiple roles (optional)
CREATE TABLE blinds.user_roles (
  user_role_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES blinds.users(user_id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES blinds.roles(role_id) ON DELETE CASCADE,
  assigned_by INTEGER REFERENCES blinds.users(user_id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, role_id)
);

-- 7. Add indexes for better performance
CREATE INDEX idx_users_role ON blinds.users(role);
CREATE INDEX idx_user_roles_user_id ON blinds.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON blinds.user_roles(role_id);

-- 8. Populate the user_roles table with existing roles from users table
INSERT INTO blinds.user_roles (user_id, role_id, assigned_at)
SELECT u.user_id, r.role_id, CURRENT_TIMESTAMP
FROM blinds.users u
JOIN blinds.roles r ON u.role = r.role_name;

-- 9. Create functions to check roles
CREATE OR REPLACE FUNCTION blinds.has_role(p_user_id INTEGER, p_role_name VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  -- First check the role column in users table
  IF EXISTS (SELECT 1 FROM blinds.users WHERE user_id = p_user_id AND role = p_role_name) THEN
    RETURN TRUE;
  END IF;

  -- Then check the user_roles table
  RETURN EXISTS (
    SELECT 1
    FROM blinds.user_roles ur
    JOIN blinds.roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = p_user_id AND r.role_name = p_role_name
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION blinds.has_any_role(p_user_id INTEGER, VARIADIC p_roles VARCHAR[])
RETURNS BOOLEAN AS $$
BEGIN
  -- First check the role column in users table
  IF EXISTS (SELECT 1 FROM blinds.users WHERE user_id = p_user_id AND role = ANY(p_roles)) THEN
    RETURN TRUE;
  END IF;

  -- Then check the user_roles table
  RETURN EXISTS (
    SELECT 1
    FROM blinds.user_roles ur
    JOIN blinds.roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = p_user_id AND r.role_name = ANY(p_roles)
  );
END;
$$ LANGUAGE plpgsql;

-- 10. Add procedures to manage roles
CREATE OR REPLACE PROCEDURE blinds.assign_role(p_user_id INTEGER, p_role_name VARCHAR, p_assigned_by INTEGER DEFAULT NULL)
LANGUAGE plpgsql
AS $$
DECLARE
  v_role_id INTEGER;
BEGIN
  -- Get role ID
  SELECT role_id INTO v_role_id FROM blinds.roles WHERE role_name = p_role_name;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role % does not exist', p_role_name;
  END IF;

  -- Update the user's primary role in users table
  UPDATE blinds.users SET role = p_role_name WHERE user_id = p_user_id;

  -- Also add to the user_roles table (if not exists)
  INSERT INTO blinds.user_roles (user_id, role_id, assigned_by, assigned_at)
  VALUES (p_user_id, v_role_id, p_assigned_by, CURRENT_TIMESTAMP)
  ON CONFLICT (user_id, role_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE PROCEDURE blinds.remove_role(p_user_id INTEGER, p_role_name VARCHAR)
LANGUAGE plpgsql
AS $$
DECLARE
  v_role_id INTEGER;
  v_primary_role VARCHAR(50);
BEGIN
  -- Get role ID
  SELECT role_id INTO v_role_id FROM blinds.roles WHERE role_name = p_role_name;

  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role % does not exist', p_role_name;
  END IF;

  -- Remove from user_roles table
  DELETE FROM blinds.user_roles
  WHERE user_id = p_user_id AND role_id = v_role_id;

  -- If this was the user's primary role, set it to their next role or 'customer' as default
  SELECT role INTO v_primary_role FROM blinds.users WHERE user_id = p_user_id;

  IF v_primary_role = p_role_name THEN
    -- Try to find another role for this user
    SELECT r.role_name INTO v_primary_role
    FROM blinds.user_roles ur
    JOIN blinds.roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = p_user_id
    LIMIT 1;

    -- If no other role, default to customer
    IF v_primary_role IS NULL THEN
      v_primary_role := 'customer';
    END IF;

    -- Update user's primary role
    UPDATE blinds.users SET role = v_primary_role WHERE user_id = p_user_id;
  END IF;
END;
$$;

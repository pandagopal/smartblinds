const { pool } = require('../config/db.js');
require('colors');

const users = require('../tables/usersTable.js');
const activityLogs = require('../tables/activityLogs.js');
const teamMembers = require('../tables/teamMembers.js');
const vendorChats = require('../tables/vendorChats.js');
const bulkUploads = require('../tables/bulkUploads.js');
const categories = require('../tables/categoriesTable.js');
const products = require('../tables/productsTable.js');
const vendorProducts = require('../tables/vendorProductsTable.js');
const orders = require('../tables/ordersTable.js');
const bcrypt = require('bcrypt');

/**
 * Database Initialization Utility
 *
 * This module handles the initial setup of database tables and default data.
 * It's a stub implementation that logs actions but doesn't actually perform
 * database operations in development mode.
 */
const initializeDatabase = async () => {
  console.log('Initializing database tables...'.blue);
  // In a real implementation, this would create tables if they don't exist
  // For development, we'll just return success
  return { success: true };
};

// Create default roles and permissions
const createDefaultRolesAndPermissions = async () => {
  console.log('Setting up default roles and permissions...'.blue);
  // In a real implementation, this would create default roles and permissions
  // For development, we'll just return success
  return { success: true };
};

// Create default admin user
const createDefaultAdmin = async () => {
  console.log('Checking for default admin user...'.blue);
  // In a real implementation, this would create a default admin if none exists
  // For development, we'll just return success
  return { success: true };
};

const checkPermission = async (userId, resource, action) => {
  const client = await pool.connect();

  try {
    const userResult = await client.query('SELECT role FROM blinds.users WHERE id = $1', [userId]);

    if (userResult.rows.length === 0) return false;

    const userRole = userResult.rows[0].role;

    if (userRole === 'admin') return true;

    if (userRole === 'vendor') {
      const basicVendorResources = ['products', 'profile', 'dashboard', 'analytics', 'orders'];
      if (basicVendorResources.includes(resource)) return true;
      if (resource === 'team') return true;
    }

    if (userRole === 'team_member') {
      const permissionResult = await client.query(`
        SELECT 1
        FROM blinds.team_members tm
        JOIN blinds.role_permissions rp ON tm.role_id = rp.role_id
        JOIN blinds.permissions p ON rp.permission_id = p.permission_id
        WHERE tm.user_id = $1 AND p.resource = $2 AND p.action = $3
      `, [userId, resource, action]);

      return permissionResult.rows.length > 0;
    }

    return false;
  } finally {
    client.release();
  }
};

module.exports = {
  initializeDatabase,
  checkPermission,
  createDefaultRolesAndPermissions,
  createDefaultAdmin
};

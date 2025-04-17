/**
 * User Model
 *
 * PostgreSQL implementation for user operations
 */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your_jwt_secret_for_dev',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// SQL Queries for user operations
const userQueries = {
  findById: 'SELECT * FROM blinds.users WHERE user_id = $1',

  findByEmail: 'SELECT * FROM blinds.users WHERE email = $1',

  createUser: `
    INSERT INTO blinds.users (
      email, password_hash, first_name, last_name, phone, is_admin
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,

  createVendorInfo: `
    INSERT INTO blinds.vendor_info (
      user_id, business_name, business_description, website_url, is_verified, approval_status
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,

  updateUser: `
    UPDATE blinds.users
    SET
      first_name = COALESCE($2, first_name),
      last_name = COALESCE($3, last_name),
      email = COALESCE($4, email),
      phone = COALESCE($5, phone),
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    RETURNING *
  `,

  updatePassword: `
    UPDATE blinds.users
    SET
      password_hash = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    RETURNING *
  `,

  setResetToken: `
    UPDATE blinds.users
    SET
      reset_token = $2,
      reset_token_expires = $3,
      updated_at = CURRENT_TIMESTAMP
    WHERE email = $1
    RETURNING *
  `,

  findByResetToken: `
    SELECT * FROM blinds.users
    WHERE reset_token = $1 AND reset_token_expires > CURRENT_TIMESTAMP
  `,

  clearResetToken: `
    UPDATE blinds.users
    SET
      reset_token = NULL,
      reset_token_expires = NULL,
      updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
    RETURNING *
  `
};

const User = {
  /**
   * Find a user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  findById: async (id) => {
    console.log(`[UserModel] Finding user by ID: ${id}`);

    try {
      const result = await db.query(userQueries.findById, [id]);

      if (result.rows.length > 0) {
        const user = result.rows[0];
        // Add virtual property for fullName
        user.fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        return user;
      }

      return null;
    } catch (error) {
      console.error('[UserModel] Error finding user by ID:', error);
      throw error;
    }
  },

  /**
   * Find a user by email
   * @param {Object} criteria - Search criteria with email
   * @returns {Promise<Object|null>} User object or null
   */
  findOne: async (criteria) => {
    console.log(`[UserModel] Finding user with criteria:`, criteria);

    try {
      // Check if we're searching by email
      if (criteria.email) {
        const email = criteria.email.toLowerCase();
        console.log(`[UserModel] Searching for user with email: ${email}`);

        const result = await db.query(userQueries.findByEmail, [email]);

        if (result.rows.length > 0) {
          const user = result.rows[0];
          // Add virtual property for fullName
          user.fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
          return user;
        }
      } else {
        console.log('[UserModel] Unsupported search criteria');
        throw new Error('Unsupported search criteria');
      }

      return null;
    } catch (error) {
      console.error('[UserModel] Error finding user:', error);
      throw error;
    }
  },

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  create: async (userData) => {
    console.log('[UserModel] Creating new user:', userData.email);
    let client;

    try {
      // Get client for transaction
      client = await db.getClient();

      // Start transaction
      await client.query('BEGIN');

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Extract user properties
      const { firstName, lastName, email, role, phone } = userData;
      const isAdmin = role === 'admin';

      // Insert user
      const userResult = await client.query(
        userQueries.createUser,
        [
          email.toLowerCase(),
          hashedPassword,
          firstName,
          lastName,
          phone || null,
          isAdmin
        ]
      );

      // If this is a vendor, create vendor info
      if (role === 'vendor' && userData.vendorInfo) {
        await client.query(
          userQueries.createVendorInfo,
          [
            userResult.rows[0].user_id,
            userData.vendorInfo.businessName || '',
            userData.vendorInfo.businessDescription || '',
            userData.vendorInfo.website || '',
            false, // is_verified (new vendors start unverified)
            JSON.stringify(userData.vendorInfo.categories || [])
          ]
        );
      }

      // Commit transaction
      await client.query('COMMIT');

      const user = userResult.rows[0];
      // Add virtual property for fullName
      user.fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
      user.role = isAdmin ? 'admin' : (role || 'customer');

      return user;
    } catch (error) {
      // Rollback transaction on error
      if (client) {
        await client.query('ROLLBACK');
      }
      console.error('[UserModel] Error creating user:', error);
      throw error;
    } finally {
      // Always release the client
      if (client) {
        client.release();
      }
    }
  },

  /**
   * Match password
   * @param {string} enteredPassword - Password to check
   * @param {string} hashedPassword - Stored hashed password
   * @returns {Promise<boolean>} True if password matches
   */
  matchPassword: async (enteredPassword, hashedPassword) => {
    console.log('[UserModel] Matching password');
    try {
      return await bcrypt.compare(String(enteredPassword), String(hashedPassword));
    } catch (error) {
      console.error('[UserModel] Error comparing passwords:', error);
      return false;
    }
  },

  /**
   * Set password reset token
   * @param {string} email - User email
   * @param {string} token - Reset token
   * @param {Date} expires - Token expiration date
   * @returns {Promise<Object|null>} Updated user or null
   */
  setPasswordResetToken: async (email, token, expires) => {
    console.log(`[UserModel] Setting password reset token for: ${email}`);

    try {
      const result = await db.query(
        userQueries.setResetToken,
        [email.toLowerCase(), token, expires]
      );

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      return null;
    } catch (error) {
      console.error('[UserModel] Error setting password reset token:', error);
      throw error;
    }
  },

  /**
   * Find user by reset token
   * @param {string} token - Reset token
   * @returns {Promise<Object|null>} User object or null
   */
  findByResetToken: async (token) => {
    console.log(`[UserModel] Finding user by reset token`);

    try {
      const result = await db.query(userQueries.findByResetToken, [token]);

      if (result.rows.length > 0) {
        return result.rows[0];
      }

      return null;
    } catch (error) {
      console.error('[UserModel] Error finding user by reset token:', error);
      throw error;
    }
  },

  /**
   * Generate a signed JWT token for a user
   * @param {string} userId - User ID
   * @returns {string} JWT token
   */
  getSignedJwtToken: (userId) => {
    return generateToken(userId);
  }
};

module.exports = User;

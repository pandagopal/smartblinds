const db = require('../config/db');
const users = require('../tables/usersTable');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
exports.register = async (req, res, next) => {
  console.log('[AuthController] register() function called');
  try {
    const { name, email, password, role = 'customer', vendorInfo } = req.body;
    console.log(`[AuthController] Attempting registration for email: ${email}`);

    // Validate
    if (!name || !email || !password) {
      console.log('[AuthController] Validation failed - missing required fields');
      return next(
        new ErrorResponse('Please provide all required fields', 400)
      );
    }

    // Real registration logic
    console.log('[AuthController] Connecting to database pool');

    try {
      // Use the db.query helper to execute SQL
      const userResult = await db.query(
        users.getUserByEmailSimpleSQL,
        [email.toLowerCase()]
      );

      if (userResult.rows.length > 0) {
        return next(
          new ErrorResponse('User with that email already exists', 400)
        );
      }

      // Validate role
      const validRoles = ['customer', 'vendor', 'admin'];
      if (!validRoles.includes(role)) {
        return next(
          new ErrorResponse('Invalid role - must be customer, vendor, or admin', 400)
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Begin transaction
      await db.query('BEGIN');

      // Create user
      const newUserResult = await db.query(
        users.createUserSQL,
        [
          name,
          email.toLowerCase(),
          hashedPassword,
          role,
          null, // phone
          null, // social_provider
          null, // social_id
          null  // profile_image
        ]
      );

      const user = newUserResult.rows[0];

      // If vendor role, create vendor info
      if (role === 'vendor' && vendorInfo) {
        await db.query(
          users.upsertVendorInfoSQL,
          [
            user.id,
            vendorInfo.businessName || null,
            vendorInfo.businessDescription || null,
            vendorInfo.website || null,
            false, // isVerified (defaults to false for new vendors)
            JSON.stringify(vendorInfo.categories || [])
          ]
        );
      }

      // Commit transaction
      await db.query('COMMIT');

      // Generate token
      const token = generateToken(user.id);

      res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
exports.login = async (req, res, next) => {
  console.log('[AuthController] login() function called');
  try {
    const { email, password } = req.body;
    console.log(`[AuthController] Attempting login for email: ${email}`);

    // Validate
    if (!email || !password) {
      console.log('[AuthController] Validation failed - missing email or password');
      return next(
        new ErrorResponse('Please provide email and password', 400)
      );
    }

    // Real database authentication logic
    console.log('[AuthController] Connecting to database pool');

    try {
      // Get user with vendor info
      console.log('[AuthController] Executing query to find user by email');
      console.log('[AuthController] SQL query:', users.getUserByEmailSQL.replace(/\s+/g, ' ').trim());
      const userResult = await db.query(
        users.getUserByEmailSQL,
        [email.toLowerCase()]
      );
      console.log(`[AuthController] Query completed, found ${userResult.rows.length} rows`);

      const user = userResult.rows[0];

      if (!user) {
        console.log('[AuthController] No user found with this email');
        return next(
          new ErrorResponse('Invalid credentials', 401)
        );
      }
      console.log(`[AuthController] User found with ID: ${user.id}`);

      // Check if password matches
      console.log('[AuthController] Comparing passwords');
      const isMatch = await bcrypt.compare(String(password), String(user.password));
      console.log(`[AuthController] Password match result: ${isMatch}`);

      if (!isMatch) {
        console.log('[AuthController] Password does not match');
        return next(
          new ErrorResponse('Invalid credentials', 401)
        );
      }

      // Generate token
      console.log('[AuthController] Generating JWT token');
      const token = generateToken(user.id);
      console.log('[AuthController] Token generated successfully');

      console.log('[AuthController] Sending success response');
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          vendorInfo: user.vendor_info,
          phone: user.phone,
          profileImage: user.profile_image
        }
      });
      console.log('[AuthController] Response sent');
    } finally {
      console.log('[AuthController] Releasing database client');
      console.log('[AuthController] Database client released');
    }
  } catch (error) {
    console.error(`[AuthController] Error in login: ${error.message}`);
    console.error(error.stack);
    next(error);
  }
  console.log('[AuthController] login() function completed');
};

// @desc   Get current logged in user
// @route  GET /api/auth/me
// @access Private
exports.getMe = async (req, res, next) => {
  try {
    const client = await db.pool.connect();

    try {
      // Get user with vendor info
      const userResult = await db.query(
        users.getUserByIdSQL,
        [req.user.id]
      );

      const user = userResult.rows[0];

      if (!user) {
        return next(
          new ErrorResponse('User not found', 404)
        );
      }

      // Get user addresses
      const addressesResult = await db.query(
        users.getUserAddressesSQL,
        [user.id]
      );

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profile_image,
          vendorInfo: user.vendor_info,
          addresses: addressesResult.rows
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// @desc   Forgot password
// @route  POST /api/auth/forgotpassword
// @access Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(
        new ErrorResponse('Please provide an email', 400)
      );
    }

    const client = await db.pool.connect();

    try {
      // Begin transaction
      await db.query('BEGIN');

      // Get user
      const userResult = await db.query(
        users.getUserByEmailSimpleSQL,
        [email.toLowerCase()]
      );

      const user = userResult.rows[0];

      if (!user) {
        return next(
          new ErrorResponse('No user found with that email', 404)
        );
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(20).toString('hex');

      // Hash token and set expiry
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // Set expiry to 10 minutes
      const expiry = new Date(Date.now() + 10 * 60 * 1000);

      // Update user with reset token
      await db.query(
        users.setPasswordResetTokenSQL,
        [email.toLowerCase(), hashedToken, expiry]
      );

      // Commit transaction
      await db.query('COMMIT');

      // Create reset URL
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

      // In a real app, send email with reset URL
      console.log(`Password reset link: ${resetUrl}`);

      res.status(200).json({
        success: true,
        message: 'Password reset email sent',
        resetUrl // Only included for development/testing
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// @desc   Reset password
// @route  PUT /api/auth/resetpassword/:resettoken
// @access Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { resettoken } = req.params;

    if (!password) {
      return next(
        new ErrorResponse('Please provide a new password', 400)
      );
    }

    // Hash the reset token from the URL
    const hashedToken = crypto
      .createHash('sha256')
      .update(resettoken)
      .digest('hex');

    const client = await db.pool.connect();

    try {
      // Begin transaction
      await db.query('BEGIN');

      // Find user with valid token
      const userResult = await db.query(
        users.getUserByResetTokenSQL,
        [hashedToken]
      );

      const user = userResult.rows[0];

      if (!user) {
        return next(
          new ErrorResponse('Invalid or expired token', 400)
        );
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update user with new password and clear reset token
      await db.query(
        users.resetPasswordSQL,
        [user.id, hashedPassword]
      );

      // Commit transaction
      await db.query('COMMIT');

      // Generate new token for auto-login
      const token = generateToken(user.id);

      res.status(200).json({
        success: true,
        message: 'Password reset successful',
        token
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// @desc   Update user profile
// @route  PUT /api/auth/updateprofile
// @access Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, vendorInfo } = req.body;
    const userId = req.user.id;

    const client = await db.pool.connect();

    try {
      // Begin transaction
      await db.query('BEGIN');

      // Update user
      const userResult = await db.query(
        users.updateUserSQL,
        [
          userId,
          name || null,
          email ? email.toLowerCase() : null,
          null, // password not updated here
          null, // role not updated here
          phone || null,
          null  // profile_image not updated here
        ]
      );

      const updatedUser = userResult.rows[0];

      // If user is a vendor, update vendor info
      if (updatedUser.role === 'vendor' && vendorInfo) {
        await db.query(
          users.upsertVendorInfoSQL,
          [
            userId,
            vendorInfo.businessName || null,
            vendorInfo.businessDescription || null,
            vendorInfo.website || null,
            null, // isVerified (admin control only)
            JSON.stringify(vendorInfo.categories || [])
          ]
        );
      }

      // Get updated user with vendor info
      const fullUserResult = await db.query(
        users.getUserByIdSQL,
        [userId]
      );

      // Commit transaction
      await db.query('COMMIT');

      res.status(200).json({
        success: true,
        data: {
          id: fullUserResult.rows[0].id,
          name: fullUserResult.rows[0].name,
          email: fullUserResult.rows[0].email,
          role: fullUserResult.rows[0].role,
          phone: fullUserResult.rows[0].phone,
          profileImage: fullUserResult.rows[0].profile_image,
          vendorInfo: fullUserResult.rows[0].vendor_info
        }
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// @desc   Change password
// @route  PUT /api/auth/changepassword
// @access Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return next(
        new ErrorResponse('Please provide current and new password', 400)
      );
    }

    const client = await db.pool.connect();

    try {
      // Begin transaction
      await db.query('BEGIN');

      // Get user
      const userResult = await db.query(
        users.getUserByIdSQL,
        [userId]
      );

      const user = userResult.rows[0];

      if (!user) {
        return next(
          new ErrorResponse('User not found', 404)
        );
      }

      // Check if current password matches
      const isMatch = await bcrypt.compare(String(currentPassword), String(user.password));

      if (!isMatch) {
        return next(
          new ErrorResponse('Current password is incorrect', 401)
        );
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user with new password
      await db.query(
        users.changePasswordSQL,
        [hashedPassword, userId]
      );

      // Commit transaction
      await db.query('COMMIT');

      res.status(200).json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

// @desc   Logout user
// @route  GET /api/auth/logout
// @access Public
exports.logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

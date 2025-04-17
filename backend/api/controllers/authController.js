/**
 * Auth Controller
 *
 * Handles API endpoints for user authentication
 */

const User = require('../../models/userModel');
const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const oauthService = require('../../services/oauthService');
const db = require('../../config/db');

// Helper function to generate signed JWT token
const getSignedJwtToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your_jwt_secret_for_dev',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Helper function to generate refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

// Helper function to save session information
const saveSession = async (userId, token, refreshToken, req) => {
  try {
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Save session
    await db.query(
      `INSERT INTO blinds.sessions (user_id, token, refresh_token, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        userId,
        token,
        refreshToken,
        ipAddress,
        userAgent,
        new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      ]
    );
  } catch (error) {
    console.error('[AuthController] Error saving session:', error);
  }
};

// @desc   Register user
// @route  POST /api/auth/register
// @access Public
const register = asyncHandler(async (req, res, next) => {
  console.log('[AuthController] register() function called');

  const { name, email, password, role = 'customer', vendorInfo } = req.body;
  console.log(`[AuthController] Attempting registration for email: ${email}`);

  // Validate
  if (!name || !email || !password) {
    console.log('[AuthController] Validation failed - missing required fields');
    return next(
      new ErrorResponse('Please provide all required fields', 400)
    );
  }

  try {
    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
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

    // Create new user with name split into firstName and lastName
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    const userData = {
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role,
      vendorInfo
    };

    // Create new user
    const user = await User.create(userData);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Store verification token in database
    await db.query(
      `UPDATE blinds.users
       SET email_verification_token = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [verificationToken, user.user_id]
    );

    // In a real application, we would send an email with verification link
    // sendVerificationEmail(user.email, verificationToken);
    console.log(`[AuthController] Verification token for ${user.email}: ${verificationToken}`);

    // Generate tokens
    const token = getSignedJwtToken(user.user_id);
    const refreshToken = generateRefreshToken();

    // Save session
    await saveSession(user.user_id, token, refreshToken, req);

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.user_id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email,
        role: user.is_admin ? 'admin' : (role || 'customer'),
        emailVerified: false
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = asyncHandler(async (req, res, next) => {
  console.log('[AuthController] login() function called');

  const { email, password } = req.body;
  console.log(`[AuthController] Attempting login for email: ${email}`);

  // Validate
  if (!email || !password) {
    console.log('[AuthController] Validation failed - missing email or password');
    return next(
      new ErrorResponse('Please provide email and password', 400)
    );
  }

  try {
    // Get user
    console.log('[AuthController] Finding user by email');

    // Get user with password
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('[AuthController] No user found with this email');
      return next(
        new ErrorResponse('Invalid credentials', 401)
      );
    }

    console.log(`[AuthController] User found with ID: ${user.user_id}`);

    // Check for account lockout
    if (user.account_locked && user.account_locked_until) {
      const lockUntil = new Date(user.account_locked_until);
      if (lockUntil > new Date()) {
        return next(
          new ErrorResponse('Account is temporarily locked due to multiple failed login attempts. Please try again later.', 401)
        );
      } else {
        // Reset login attempts if lock period has expired
        await db.query(
          'UPDATE blinds.users SET login_attempts = 0, account_locked = false WHERE user_id = $1',
          [user.user_id]
        );
      }
    }

    // Check if password matches - note we now pass both parameters to the method
    console.log('[AuthController] Comparing passwords');
    const isMatch = await User.matchPassword(password, user.password_hash);
    console.log(`[AuthController] Password match result: ${isMatch}`);

    if (!isMatch) {
      console.log('[AuthController] Password does not match');

      // Increment login attempts
      await db.query(
        'UPDATE blinds.users SET login_attempts = login_attempts + 1 WHERE user_id = $1',
        [user.user_id]
      );

      // Check if we need to lock the account (after 5 failed attempts)
      const updatedUser = await User.findById(user.user_id);
      if (updatedUser.login_attempts >= 5) {
        // Lock for 30 minutes
        const lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        await db.query(
          'UPDATE blinds.users SET account_locked = true, account_locked_until = $1 WHERE user_id = $2',
          [lockUntil, user.user_id]
        );

        return next(
          new ErrorResponse('Account locked due to multiple failed login attempts. Please try again later or reset your password.', 401)
        );
      }

      return next(
        new ErrorResponse('Invalid credentials', 401)
      );
    }

    // Reset login attempts on successful login
    await db.query(
      'UPDATE blinds.users SET login_attempts = 0, account_locked = false, last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Generate token
    console.log('[AuthController] Generating JWT token');
    const token = getSignedJwtToken(user.user_id);
    const refreshToken = generateRefreshToken();

    // Save session
    await saveSession(user.user_id, token, refreshToken, req);

    console.log('[AuthController] Token generated successfully');

    console.log('[AuthController] Sending success response');
    res.status(200).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user.user_id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email,
        role: user.is_admin ? 'admin' : (user.role || 'customer'),
        phone: user.phone,
        profileImage: user.profile_image,
        emailVerified: user.email_verified || false
      }
    });

    console.log('[AuthController] Response sent');
  } catch (error) {
    console.error(`[AuthController] Error in login: ${error.message}`);
    console.error(error.stack);
    next(error);
  }

  console.log('[AuthController] login() function completed');
});

// @desc   Social login (Google, Facebook, Apple)
// @route  POST /api/auth/social/:provider
// @access Public
const socialLogin = asyncHandler(async (req, res, next) => {
  const { provider } = req.params;
  const { token, authorizationCode } = req.body; // authorizationCode is only needed for Apple

  console.log(`[AuthController] Social login with ${provider}`);

  if (!token) {
    return next(new ErrorResponse('No authentication token provided', 400));
  }

  try {
    let oauthUserData;

    // Verify the token with the appropriate provider
    switch (provider.toLowerCase()) {
      case 'google':
        oauthUserData = await oauthService.verifyGoogleToken(token);
        break;
      case 'facebook':
        oauthUserData = await oauthService.verifyFacebookToken(token);
        break;
      case 'apple':
        if (!authorizationCode) {
          return next(new ErrorResponse('Authorization code is required for Apple sign in', 400));
        }
        oauthUserData = await oauthService.verifyAppleToken(token, authorizationCode);
        break;
      default:
        return next(new ErrorResponse(`Unsupported provider: ${provider}`, 400));
    }

    // Process the OAuth user data
    const { user, isNewUser } = await oauthService.processOAuthUser(
      oauthUserData,
      token,
      oauthUserData.refreshToken || null
    );

    // Generate JWT token and refresh token
    const jwtToken = getSignedJwtToken(user.user_id);
    const refreshToken = generateRefreshToken();

    // Save session
    await saveSession(user.user_id, jwtToken, refreshToken, req);

    // Return the user and tokens
    res.status(200).json({
      success: true,
      token: jwtToken,
      refreshToken,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role || 'customer',
        profileImage: user.profile_image,
        emailVerified: true,
        isNewUser
      }
    });
  } catch (error) {
    console.error(`[AuthController] Social login error: ${error.message}`);
    return next(new ErrorResponse(`Authentication with ${provider} failed`, 401));
  }
});

// @desc   Get current logged in user
// @route  GET /api/auth/me
// @access Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.user_id);

  if (!user) {
    return next(
      new ErrorResponse('User not found', 404)
    );
  }

  // Get user's linked social accounts
  const socialAccounts = await db.query(
    `SELECT provider FROM blinds.user_oauth_accounts WHERE user_id = $1`,
    [user.user_id]
  );

  // Extract just the provider names
  const linkedProviders = socialAccounts.rows.map(account => account.provider);

  res.status(200).json({
    success: true,
    data: {
      id: user.user_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email,
      role: user.is_admin ? 'admin' : (user.role || 'customer'),
      phone: user.phone,
      profileImage: user.profile_image,
      emailVerified: user.email_verified || false,
      linkedProviders
    }
  });
});

// @desc   Refresh token
// @route  POST /api/auth/refresh
// @access Public
const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ErrorResponse('Refresh token is required', 400));
  }

  try {
    // Find the session with this refresh token
    const sessionResult = await db.query(
      'SELECT * FROM blinds.sessions WHERE refresh_token = $1 AND expires_at > $2',
      [refreshToken, new Date()]
    );

    if (sessionResult.rows.length === 0) {
      return next(new ErrorResponse('Invalid or expired refresh token', 401));
    }

    const session = sessionResult.rows[0];

    // Get the user
    const user = await User.findById(session.user_id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Generate new tokens
    const newToken = getSignedJwtToken(user.user_id);
    const newRefreshToken = generateRefreshToken();

    // Update the session
    await db.query(
      `UPDATE blinds.sessions
       SET token = $1, refresh_token = $2, expires_at = $3
       WHERE id = $4`,
      [
        newToken,
        newRefreshToken,
        new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        session.id
      ]
    );

    res.status(200).json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('[AuthController] Token refresh error:', error);
    next(error);
  }
});

// @desc   Logout
// @route  POST /api/auth/logout
// @access Public
const logout = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    // Invalidate the session
    try {
      await db.query('DELETE FROM blinds.sessions WHERE token = $1', [token]);
    } catch (error) {
      console.error('[AuthController] Error during logout:', error);
      // Continue regardless of error
    }
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc   Forgot password
// @route  POST /api/auth/forgotpassword
// @access Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(
      new ErrorResponse('Please provide an email', 400)
    );
  }

  // Find the user
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    return next(
      new ErrorResponse('No user found with that email', 404)
    );
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set expiry - now 10 minutes from now
  const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

  // Update user with reset token
  await User.setPasswordResetToken(email, resetToken, resetTokenExpiry);

  // Create reset URL
  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

  // In a real app, send email with reset URL
  console.log(`Password reset link: ${resetUrl}`);

  res.status(200).json({
    success: true,
    message: 'Password reset email sent',
    resetUrl // Only included for development/testing
  });
});

// @desc   Reset password
// @route  PUT /api/auth/resetpassword/:resettoken
// @access Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const { resettoken } = req.params;

  if (!password) {
    return next(
      new ErrorResponse('Please provide a new password', 400)
    );
  }

  // Find user with token
  const user = await User.findByResetToken(resettoken);

  if (!user) {
    return next(
      new ErrorResponse('Invalid or expired token', 400)
    );
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Update user's password and clear reset token
  await db.query(
    `UPDATE blinds.users
     SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL,
     updated_at = CURRENT_TIMESTAMP, login_attempts = 0, account_locked = false
     WHERE user_id = $2`,
    [hashedPassword, user.user_id]
  );

  // Generate tokens
  const token = getSignedJwtToken(user.user_id);
  const newRefreshToken = generateRefreshToken();

  // Save session
  await saveSession(user.user_id, token, newRefreshToken, req);

  res.status(200).json({
    success: true,
    token,
    refreshToken: newRefreshToken,
    message: 'Password reset successful'
  });
});

// @desc   Update user profile
// @route  PUT /api/auth/updateprofile
// @access Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email, phone } = req.body;
  const userId = req.user.user_id;

  try {
    // Split name into first and last name
    let firstName, lastName;
    if (name) {
      const nameParts = name.split(' ');
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    }

    // Check if email is being changed and if it's already in use
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser && existingUser.user_id !== userId) {
        return next(
          new ErrorResponse('Email already in use', 400)
        );
      }
    }

    // Update the user
    const result = await db.query(
      `UPDATE blinds.users
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $5
       RETURNING *`,
      [firstName, lastName, email?.toLowerCase(), phone, userId]
    );

    if (result.rows.length === 0) {
      return next(
        new ErrorResponse('User not found', 404)
      );
    }

    const updatedUser = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        id: updatedUser.user_id,
        name: `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim(),
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.is_admin ? 'admin' : (updatedUser.role || 'customer')
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc   Change password
// @route  PUT /api/auth/changepassword
// @access Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.user_id;

  if (!currentPassword || !newPassword) {
    return next(
      new ErrorResponse('Please provide current and new password', 400)
    );
  }

  // Get user
  const user = await User.findById(userId);

  // Check current password
  const isMatch = await User.matchPassword(currentPassword, user.password_hash);
  if (!isMatch) {
    return next(
      new ErrorResponse('Current password is incorrect', 401)
    );
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update password
  await db.query(
    `UPDATE blinds.users
     SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $2`,
    [hashedPassword, userId]
  );

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc   Verify email
// @route  GET /api/auth/verify/:token
// @access Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  if (!token) {
    return next(
      new ErrorResponse('Verification token is required', 400)
    );
  }

  try {
    // Find user with token
    const result = await db.query(
      'SELECT * FROM blinds.users WHERE email_verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return next(
        new ErrorResponse('Invalid verification token', 400)
      );
    }

    // Update user - mark as verified and clear token
    await db.query(
      `UPDATE blinds.users
       SET email_verified = true, email_verification_token = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $1`,
      [result.rows[0].user_id]
    );

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc   Link social account to existing user
// @route  POST /api/auth/link/:provider
// @access Private
const linkSocialAccount = asyncHandler(async (req, res, next) => {
  const { provider } = req.params;
  const { token, authorizationCode } = req.body;
  const userId = req.user.user_id;

  if (!token) {
    return next(new ErrorResponse('No authentication token provided', 400));
  }

  try {
    let oauthUserData;

    // Verify the token with the appropriate provider
    switch (provider.toLowerCase()) {
      case 'google':
        oauthUserData = await oauthService.verifyGoogleToken(token);
        break;
      case 'facebook':
        oauthUserData = await oauthService.verifyFacebookToken(token);
        break;
      case 'apple':
        if (!authorizationCode) {
          return next(new ErrorResponse('Authorization code is required for Apple sign in', 400));
        }
        oauthUserData = await oauthService.verifyAppleToken(token, authorizationCode);
        break;
      default:
        return next(new ErrorResponse(`Unsupported provider: ${provider}`, 400));
    }

    // Check if this social account is already linked to another user
    const existingLinkResult = await db.query(
      `SELECT * FROM blinds.user_oauth_accounts
       WHERE provider = $1 AND provider_user_id = $2`,
      [provider, oauthUserData.providerId]
    );

    if (existingLinkResult.rows.length > 0 && existingLinkResult.rows[0].user_id !== userId) {
      return next(
        new ErrorResponse('This social account is already linked to another user', 400)
      );
    }

    // Create or update the OAuth link
    if (existingLinkResult.rows.length > 0) {
      // Update existing link
      await db.query(
        `UPDATE blinds.user_oauth_accounts
         SET access_token = $1, refresh_token = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [token, oauthUserData.refreshToken || null, existingLinkResult.rows[0].id]
      );
    } else {
      // Create new link
      await db.query(
        `INSERT INTO blinds.user_oauth_accounts
         (user_id, provider, provider_user_id, access_token, refresh_token)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, provider, oauthUserData.providerId, token, oauthUserData.refreshToken || null]
      );
    }

    // Get all linked providers for this user
    const socialAccounts = await db.query(
      `SELECT provider FROM blinds.user_oauth_accounts WHERE user_id = $1`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: `Successfully linked ${provider} account`,
      linkedProviders: socialAccounts.rows.map(account => account.provider)
    });
  } catch (error) {
    console.error(`[AuthController] Link social account error: ${error.message}`);
    return next(new ErrorResponse(`Failed to link ${provider} account`, 400));
  }
});

// @desc   Unlink social account from user
// @route  DELETE /api/auth/link/:provider
// @access Private
const unlinkSocialAccount = asyncHandler(async (req, res, next) => {
  const { provider } = req.params;
  const userId = req.user.user_id;

  try {
    // Check if user has more than one authentication method (either password or other social providers)
    const hasPasswordResult = await db.query(
      'SELECT password_hash FROM blinds.users WHERE user_id = $1 AND password_hash IS NOT NULL',
      [userId]
    );

    const socialAccountsResult = await db.query(
      'SELECT provider FROM blinds.user_oauth_accounts WHERE user_id = $1',
      [userId]
    );

    const socialProviders = socialAccountsResult.rows.map(row => row.provider);
    const hasPassword = hasPasswordResult.rows.length > 0;
    const socialCount = socialProviders.length;

    // Prevent removing the last authentication method
    if (!hasPassword && socialCount <= 1 && socialProviders.includes(provider)) {
      return next(
        new ErrorResponse('Cannot remove the only authentication method. Please add a password or link another social account first.', 400)
      );
    }

    // Delete the OAuth link
    const result = await db.query(
      `DELETE FROM blinds.user_oauth_accounts
       WHERE user_id = $1 AND provider = $2
       RETURNING id`,
      [userId, provider]
    );

    if (result.rows.length === 0) {
      return next(
        new ErrorResponse(`No linked ${provider} account found`, 404)
      );
    }

    // Get updated list of linked providers
    const updatedSocialAccounts = await db.query(
      `SELECT provider FROM blinds.user_oauth_accounts WHERE user_id = $1`,
      [userId]
    );

    res.status(200).json({
      success: true,
      message: `Successfully unlinked ${provider} account`,
      linkedProviders: updatedSocialAccounts.rows.map(account => account.provider)
    });
  } catch (error) {
    console.error(`[AuthController] Unlink social account error: ${error.message}`);
    return next(new ErrorResponse(`Failed to unlink ${provider} account`, 400));
  }
});

module.exports = {
  register,
  login,
  socialLogin,
  getMe,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
  verifyEmail,
  linkSocialAccount,
  unlinkSocialAccount
};

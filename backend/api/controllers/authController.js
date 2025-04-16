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

    // Generate token
    const token = User.getSignedJwtToken(user.user_id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.user_id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email,
        role: user.is_admin ? 'admin' : 'customer'
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

    // Check if password matches - note we now pass both parameters to the method
    console.log('[AuthController] Comparing passwords');
    const isMatch = await User.matchPassword(password, user.password_hash);
    console.log(`[AuthController] Password match result: ${isMatch}`);

    if (!isMatch) {
      console.log('[AuthController] Password does not match');
      return next(
        new ErrorResponse('Invalid credentials', 401)
      );
    }

    // Generate token
    console.log('[AuthController] Generating JWT token');
    const token = User.getSignedJwtToken(user.user_id);
    console.log('[AuthController] Token generated successfully');

    console.log('[AuthController] Sending success response');
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.user_id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        email: user.email,
        role: user.is_admin ? 'admin' : 'customer',
        phone: user.phone,
        profileImage: user.profile_image
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

  res.status(200).json({
    success: true,
    data: {
      id: user.user_id,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
      email: user.email,
      role: user.is_admin ? 'admin' : 'customer',
      phone: user.phone,
      profileImage: user.profile_image
    }
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

  // Update with new password and remove reset token
  await User.findByIdAndUpdate(user.user_id, {
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpire: null
  });

  // Generate token for automatic login
  const token = User.getSignedJwtToken(user.user_id);

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    token
  });
});

// @desc   Update user profile
// @route  PUT /api/auth/updateprofile
// @access Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email, phone } = req.body;
  const userId = req.user.user_id;

  // Find and update the user
  const updatedUser = await User.findByIdAndUpdate(userId, {
    name,
    email,
    phone
  });

  if (!updatedUser) {
    return next(
      new ErrorResponse('User not found', 404)
    );
  }

  res.status(200).json({
    success: true,
    data: {
      id: updatedUser.user_id,
      name: `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim(),
      email: updatedUser.email,
      role: updatedUser.is_admin ? 'admin' : 'customer',
      phone: updatedUser.phone,
      profileImage: updatedUser.profile_image
    }
  });
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

  if (!user) {
    return next(
      new ErrorResponse('User not found', 404)
    );
  }

  // Check if current password matches
  const isMatch = await User.matchPassword(currentPassword, user.password_hash);

  if (!isMatch) {
    return next(
      new ErrorResponse('Current password is incorrect', 401)
    );
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update user password
  await User.findByIdAndUpdate(userId, {
    password: hashedPassword
  });

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc   Logout user
// @route  GET /api/auth/logout
// @access Public
const logout = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Handle social login (optional)
const socialLogin = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Social login endpoint - not implemented yet'
  });
});

module.exports = {
  register,
  login,
  socialLogin,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};

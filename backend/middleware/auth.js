const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const db = require('../config/db');

/**
 * Authentication and Authorization Middleware
 */

// Protect routes - verifies JWT and adds user to req
exports.protect = asyncHandler(async (req, res, next) => {
  console.log('[Auth] Protect middleware called');
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Get user from PostgreSQL
    const result = await db.query('SELECT * FROM blinds.users WHERE user_id = $1', [decoded.id]);

    if (result.rows.length === 0) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    req.user = result.rows[0];

    // Log user role information
    console.log(`[Auth Debug] User ID: ${req.user.user_id}, role: ${req.user.role}`);

    // No fallback to is_admin - role field is required after migration
    if (!req.user.role) {
      console.error(`[Auth Error] User ${req.user.user_id} has no role assigned. Please run the database migration.`);
      req.user.role = 'customer'; // Default to customer if somehow no role exists
    }

    next();
  } catch (err) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
});

// Authorize certain roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log(`[Auth] Authorize middleware called for roles: ${roles.join(', ')}`);

    if (!req.user) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    // Use the role field directly - no need to remap
    console.log(`[Auth Debug] User role: ${req.user.role}, Required roles: ${roles.join(', ')}`);
    console.log(`[Auth Debug] Role check result: ${roles.includes(req.user.role)}`);

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403)
      );
    }

    next();
  };
};

// Optional auth - doesn't require auth but attaches user if token exists
exports.optionalAuth = asyncHandler(async (req, res, next) => {
  let token;
  let isImpersonation = false;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Check for token in cookies
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // Check for impersonation token in headers
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Impersonate')
  ) {
    token = req.headers.authorization.split(' ')[1];
    isImpersonation = true;
  }

  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

    // Handle impersonation tokens
    if (isImpersonation || decoded.impersonatedBy) {
      // Get vendor user
      const vendorResult = await db.query(
        'SELECT * FROM blinds.users WHERE user_id = $1',
        [decoded.id]
      );

      if (vendorResult.rows.length > 0) {
        // Get admin user
        const adminResult = await db.query(
          'SELECT * FROM blinds.users WHERE user_id = $1 AND is_admin = true',
          [decoded.impersonatedBy]
        );

        if (adminResult.rows.length > 0) {
          req.user = vendorResult.rows[0];
          // Map PostgreSQL field is_admin to role for compatibility
          req.user.role = req.user.is_admin ? 'admin' : 'vendor';

          req.impersonator = adminResult.rows[0];
          req.isImpersonation = true;
        }
      }
    } else {
      // Normal token handling
      const result = await db.query(
        'SELECT * FROM blinds.users WHERE user_id = $1',
        [decoded.id]
      );

      if (result.rows.length > 0) {
        req.user = result.rows[0];
        // Map PostgreSQL field is_admin to role for compatibility
        req.user.role = req.user.is_admin ? 'admin' : 'customer';
      }
    }

    next();
  } catch (err) {
    // Just continue without setting user
    next();
  }
});

// Add a middleware for logging impersonation actions
exports.logImpersonation = asyncHandler(async (req, res, next) => {
  if (req.isImpersonation && req.impersonator && req.user) {
    try {
      // Log the impersonation action
      await db.query(
        'INSERT INTO blinds.admin_actions (admin_id, action_type, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
        [
          req.impersonator.user_id,
          'using_impersonation',
          'vendor',
          req.user.user_id,
          JSON.stringify({
            route: req.originalUrl,
            method: req.method,
            timestamp: new Date()
          })
        ]
      );
    } catch (error) {
      console.error('Failed to log impersonation:', error);
      // Don't block the request if logging fails
    }
  }

  next();
});

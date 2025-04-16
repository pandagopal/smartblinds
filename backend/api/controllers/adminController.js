/**
 * Admin Controller
 * Handles admin-specific operations like vendor management and impersonation
 */
const { pool } = require('../../config/db');
const ErrorResponse = require('../../utils/errorResponse');
const users = require('../../tables/usersTable');
const jwt = require('jsonwebtoken');

/**
 * @desc    Get all vendors
 * @route   GET /api/admin/vendors
 * @access  Private/Admin
 */
const getAllVendors = async (req, res, next) => {
  try {
    const {
      search,
      status,
      verified,
      listingStatus,
      page = 1,
      limit = 10
    } = req.query;

    const client = await pool.connect();

    try {
      // Build query with filters
      let query = `
        SELECT u.user_id, u.name, u.email, u.role, u.created_at, u.is_active, u.is_listing_active,
          json_build_object(
            'businessName', vi.business_name,
            'businessDescription', vi.business_description,
            'website', vi.website_url,
            'isVerified', vi.is_verified,
            'categories', vi.approval_status,
            'joinDate', vi.created_at
          ) as vendor_info
        FROM blinds.users u
        LEFT JOIN blinds.vendor_info vi ON user_id = vi.user_id
        WHERE u.role = 'vendor'
      `;

      const queryParams = [];

      // Add search filter
      if (search) {
        queryParams.push(`%${search}%`);
        query += ` AND (u.name ILIKE $${queryParams.length} OR u.email ILIKE $${queryParams.length})`;
      }

      // Add account status filter
      if (status === 'active') {
        query += ` AND u.is_active = true`;
      } else if (status === 'inactive') {
        query += ` AND u.is_active = false`;
      }

      // Add verification status filter
      if (verified === 'verified') {
        query += ` AND vi.is_verified = true`;
      } else if (verified === 'unverified') {
        query += ` AND (vi.is_verified = false OR vi.is_verified IS NULL)`;
      }

      // Add listing status filter
      if (listingStatus === 'listed') {
        query += ` AND u.is_listing_active = true`;
      } else if (listingStatus === 'unlisted') {
        query += ` AND u.is_listing_active = false`;
      }

      // Add order and pagination
      query += ` ORDER BY u.created_at DESC`;

      // Get count for pagination
      const countQuery = query.replace(
        'SELECT user_id, u.name, u.email, u.role, u.created_at, u.is_active, u.is_listing_active,',
        'SELECT COUNT(*)'
      ).replace(
        'json_build_object(\n' +
        '            \'businessName\', vi.business_name,\n' +
        '            \'businessDescription\', vi.business_description,\n' +
        '            \'website\', vi.website_url,\n' +
        '            \'isVerified\', vi.is_verified,\n' +
        '            \'categories\', vi.approval_status,\n' +
        '            \'joinDate\', vi.created_at\n' +
        '          ) as vendor_info',
        '1'
      );

      const countResult = await client.query(countQuery, queryParams);
      const totalVendors = parseInt(countResult.rows[0].count);

      // Add pagination to main query
      queryParams.push(parseInt(limit));
      query += ` LIMIT $${queryParams.length}`;

      queryParams.push((parseInt(page) - 1) * parseInt(limit));
      query += ` OFFSET $${queryParams.length}`;

      // Execute the main query
      const result = await client.query(query, queryParams);

      res.status(200).json({
        success: true,
        count: result.rows.length,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalVendors / parseInt(limit)),
          total: totalVendors
        },
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get vendor details
 * @route   GET /api/admin/vendors/:id
 * @access  Private/Admin
 */
const getVendorDetails = async (req, res, next) => {
  try {
    const vendorId = req.params.id;

    const client = await pool.connect();

    try {
      // Get vendor details
      const query = `
        SELECT u.user_id, u.name, u.email, u.phone, u.role, u.is_active, u.is_listing_active, u.profile_image, u.created_at,
          json_build_object(
            'businessName', vi.business_name,
            'businessDescription', vi.business_description,
            'website', vi.website_url,
            'isVerified', vi.is_verified,
            'categories', vi.approval_status,
            'joinDate', vi.created_at
          ) as vendor_info
        FROM blinds.users u
        LEFT JOIN blinds.vendor_info vi ON user_id = vi.user_id
        WHERE user_id = $1
      `;

      const result = await client.query(query, [vendorId]);

      if (result.rows.length === 0) {
        return next(
          new ErrorResponse(`Vendor not found with id of ${vendorId}`, 404)
        );
      }

      const vendor = result.rows[0];

      // Check if the user is actually a vendor
      if (vendor.role !== 'vendor') {
        return next(
          new ErrorResponse(`User with id ${vendorId} is not a vendor`, 400)
        );
      }

      // Get additional vendor stats
      const statsQuery = `
        SELECT
          (SELECT COUNT(*) FROM blinds.vendor_products WHERE vendor_id = $1) as product_count,
          (SELECT COUNT(DISTINCT order_id) FROM blinds.order_items WHERE vendor_id = $1) as order_count,
          (SELECT SUM(total_price) FROM blinds.order_items WHERE vendor_id = $1) as total_revenue
      `;

      const statsResult = await client.query(statsQuery, [vendorId]);

      // Format the response
      const vendorDetails = {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        role: vendor.role,
        isActive: vendor.is_active,
        isListingActive: vendor.is_listing_active,
        profileImage: vendor.profile_image,
        createdAt: vendor.created_at,
        vendorInfo: vendor.vendor_info,
        stats: {
          productCount: parseInt(statsResult.rows[0].product_count || 0),
          orderCount: parseInt(statsResult.rows[0].order_count || 0),
          totalRevenue: parseFloat(statsResult.rows[0].total_revenue || 0)
        }
      };

      res.status(200).json({
        success: true,
        data: vendorDetails
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update vendor account status (active/inactive)
 * @route   PUT /api/admin/vendors/:id/status
 * @access  Private/Admin
 */
const updateVendorStatus = async (req, res, next) => {
  try {
    const vendorId = req.params.id;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return next(
        new ErrorResponse('Please provide isActive status', 400)
      );
    }

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Check if vendor exists
      const checkResult = await client.query(
        'SELECT id, role FROM blinds.users WHERE user_id = $1',
        [vendorId]
      );

      if (checkResult.rows.length === 0) {
        return next(
          new ErrorResponse(`Vendor not found with id of ${vendorId}`, 404)
        );
      }

      if (checkResult.rows[0].role !== 'vendor') {
        return next(
          new ErrorResponse(`User with id ${vendorId} is not a vendor`, 400)
        );
      }

      // Update vendor status
      await client.query(
        'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [isActive, vendorId]
      );

      // Commit transaction
      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: `Vendor account ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { id: vendorId, isActive }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update vendor listing status (products visible/hidden on front-end)
 * @route   PUT /api/admin/vendors/:id/listing-status
 * @access  Private/Admin
 */
const updateVendorListingStatus = async (req, res, next) => {
  try {
    const vendorId = req.params.id;
    const { isListingActive } = req.body;

    if (isListingActive === undefined) {
      return next(
        new ErrorResponse('Please provide isListingActive status', 400)
      );
    }

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Check if vendor exists
      const checkResult = await client.query(
        'SELECT id, role FROM blinds.users WHERE user_id = $1',
        [vendorId]
      );

      if (checkResult.rows.length === 0) {
        return next(
          new ErrorResponse(`Vendor not found with id of ${vendorId}`, 404)
        );
      }

      if (checkResult.rows[0].role !== 'vendor') {
        return next(
          new ErrorResponse(`User with id ${vendorId} is not a vendor`, 400)
        );
      }

      // Update vendor listing status in users table
      await client.query(
        'UPDATE users SET is_listing_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [isListingActive, vendorId]
      );

      // Also update in vendor_info table if it exists
      await client.query(
        `UPDATE blinds.vendor_info
         SET is_listing_active = $1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [isListingActive, vendorId]
      );

      // Log this administrative action
      await client.query(
        `INSERT INTO admin_actions
         (admin_id, action_type, entity_type, entity_id, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          req.user.id,
          isListingActive ? 'enable_listings' : 'disable_listings',
          'vendor',
          vendorId,
          JSON.stringify({
            timestamp: new Date(),
            previous_status: !isListingActive
          })
        ]
      );

      // Commit transaction
      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: `Vendor product listings ${isListingActive ? 'enabled' : 'disabled'} successfully`,
        data: { id: vendorId, isListingActive }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update vendor verification status
 * @route   PUT /api/admin/vendors/:id/verify
 * @access  Private/Admin
 */
const updateVendorVerification = async (req, res, next) => {
  try {
    const vendorId = req.params.id;
    const { isVerified } = req.body;

    if (isVerified === undefined) {
      return next(
        new ErrorResponse('Please provide isVerified status', 400)
      );
    }

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Check if vendor exists
      const checkResult = await client.query(
        'SELECT u.user_id, u.role, vi.user_id FROM blinds.users u LEFT JOIN blinds.vendor_info vi ON u.user_id = vi.user_id WHERE u.user_id = $1',
        [vendorId]
      );

      if (checkResult.rows.length === 0) {
        return next(
          new ErrorResponse(`Vendor not found with id of ${vendorId}`, 404)
        );
      }

      if (checkResult.rows[0].role !== 'vendor') {
        return next(
          new ErrorResponse(`User with id ${vendorId} is not a vendor`, 400)
        );
      }

      // If vendor_info exists, update it
      if (checkResult.rows[0].user_id) {
        await client.query(
          'UPDATE blinds.vendor_info SET is_verified = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
          [isVerified, vendorId]
        );
      } else {
        // If vendor_info doesn't exist, create it
        await client.query(
          'INSERT INTO blinds.vendor_info (user_id, business_name, is_verified) VALUES ($1, $2, $3)',
          [vendorId, checkResult.rows[0].name, isVerified]
        );
      }

      // Commit transaction
      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        message: `Vendor ${isVerified ? 'verified' : 'unverified'} successfully`,
        data: { id: vendorId, isVerified }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Impersonate vendor (get temporary token)
 * @route   POST /api/admin/vendors/:id/impersonate
 * @access  Private/Admin
 */
const impersonateVendor = async (req, res, next) => {
  try {
    const vendorId = req.params.id;
    const adminId = req.user.id;

    const client = await pool.connect();

    try {
      // Check if vendor exists
      const result = await client.query(
        'SELECT id, name, email, role, is_active FROM blinds.users WHERE id = $1',
        [vendorId]
      );

      if (result.rows.length === 0) {
        return next(
          new ErrorResponse(`Vendor not found with id of ${vendorId}`, 404)
        );
      }

      const vendor = result.rows[0];

      if (vendor.role !== 'vendor') {
        return next(
          new ErrorResponse(`User with id ${vendorId} is not a vendor`, 400)
        );
      }

      if (!vendor.is_active) {
        return next(
          new ErrorResponse(`Vendor account is inactive`, 400)
        );
      }

      // Log the impersonation for audit purposes
      await client.query(
        'INSERT INTO admin_actions (admin_id, action_type, entity_type, entity_id, details) VALUES ($1, $2, $3, $4, $5)',
        [
          adminId,
          'impersonate',
          'vendor',
          vendorId,
          JSON.stringify({
            vendorName: vendor.name,
            vendorEmail: vendor.email,
            timestamp: new Date()
          })
        ]
      );

      // Generate a special impersonation token (short-lived)
      const token = jwt.sign(
        {
          id: vendorId,
          impersonatedBy: adminId
        },
        process.env.JWT_SECRET || 'your_jwt_secret',
        {
          expiresIn: '1h' // Short-lived token for security
        }
      );

      res.status(200).json({
        success: true,
        message: `Now impersonating vendor: ${vendor.name}`,
        data: {
          token,
          vendor: {
            id: vendor.id,
            name: vendor.name,
            email: vendor.email,
            role: vendor.role
          }
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Get user counts by role
      const userCountsQuery = `
        SELECT
          COUNT(*) as total_users,
          COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
          COUNT(CASE WHEN role = 'vendor' THEN 1 END) as vendors,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
        FROM users
      `;

      // Get vendor status counts
      const vendorStatusQuery = `
        SELECT
          COUNT(CASE WHEN u.is_active = true THEN 1 END) as active_vendors,
          COUNT(CASE WHEN u.is_active = false THEN 1 END) as inactive_vendors,
          COUNT(CASE WHEN vi.is_verified = true THEN 1 END) as verified_vendors,
          COUNT(CASE WHEN vi.is_verified = false OR vi.is_verified IS NULL THEN 1 END) as unverified_vendors,
          COUNT(CASE WHEN u.is_listing_active = true THEN 1 END) as listed_vendors,
          COUNT(CASE WHEN u.is_listing_active = false THEN 1 END) as unlisted_vendors
        FROM blinds.users u
        LEFT JOIN blinds.vendor_info vi ON u.user_id = vi.user_id
        WHERE u.role = 'vendor'
      `;

      // Get recent vendors
      const recentVendorsQuery = `
        SELECT user_id, u.name, u.email, u.created_at, u.is_active, u.is_listing_active,
          json_build_object(
            'businessName', vi.business_name,
            'isVerified', vi.is_verified
          ) as vendor_info
        FROM blinds.users u
        LEFT JOIN blinds.vendor_info vi ON u.user_id = vi.user_id
        WHERE u.role = 'vendor'
        ORDER BY u.created_at DESC
        LIMIT 5
      `;

      // Get order stats
      const orderStatsQuery = `
        SELECT
          COUNT(*) as total_orders,
          SUM(total_amount) as total_revenue,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
        FROM blinds.orders
      `;

      // Execute all queries
      const [
        userCountsResult,
        vendorStatusResult,
        recentVendorsResult,
        orderStatsResult
      ] = await Promise.all([
        client.query(userCountsQuery),
        client.query(vendorStatusQuery),
        client.query(recentVendorsQuery),
        client.query(orderStatsQuery)
      ]);

      // Commit transaction
      await client.query('COMMIT');

      // Format response data
      const dashboardData = {
        userCounts: userCountsResult.rows[0],
        vendorStatus: vendorStatusResult.rows[0],
        recentVendors: recentVendorsResult.rows,
        orderStats: orderStatsResult.rows[0]
      };

      res.status(200).json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllVendors,
  getVendorDetails,
  updateVendorStatus,
  updateVendorListingStatus,
  updateVendorVerification,
  impersonateVendor,
  getAdminDashboard
};

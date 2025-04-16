/**
 * Vendor Dashboard Controller
 * Handles requests for vendor dashboard data, profile, and analytics
 */
const { pool } = require('../../config/db');
const ErrorResponse = require('../../utils/errorResponse');
const users = require('../../tables/usersTable');
const vendorProducts = require('../../tables/vendorProductsTable');
const orders = require('../../tables/ordersTable');

/**
 * @desc    Get vendor profile information
 * @route   GET /api/vendor/profile
 * @access  Private/Vendor
 */
const getVendorProfile = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const client = await pool.connect();

    try {
      // Get vendor profile with vendor info
      const result = await client.query(
        users.getUserByIdSQL,
        [vendorId]
      );

      if (result.rows.length === 0) {
        return next(
          new ErrorResponse('Vendor not found', 404)
        );
      }

      const vendor = result.rows[0];

      // Format vendor info for response
      const vendorInfo = {
        businessName: vendor.vendor_info?.businessName || vendor.name,
        businessDescription: vendor.vendor_info?.businessDescription || '',
        website: vendor.vendor_info?.website || '',
        isVerified: vendor.vendor_info?.isVerified || false,
        categories: vendor.vendor_info?.categories || [],
        joinDate: vendor.created_at
      };

      res.status(200).json({
        success: true,
        data: vendorInfo
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update vendor profile information
 * @route   PUT /api/vendor/profile
 * @access  Private/Vendor
 */
const updateVendorProfile = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const {
      businessName,
      businessDescription,
      website,
      categories
    } = req.body;

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Update vendor info
      await client.query(
        users.upsertVendorInfoSQL,
        [
          vendorId,
          businessName || null,
          businessDescription || null,
          website || null,
          null, // isVerified (admin control only)
          categories ? JSON.stringify(categories) : null
        ]
      );

      // Get updated vendor info
      const result = await client.query(
        users.getUserByIdSQL,
        [vendorId]
      );

      // Commit transaction
      await client.query('COMMIT');

      const vendor = result.rows[0];

      // Format vendor info for response
      const vendorInfo = {
        businessName: vendor.vendor_info?.businessName || vendor.name,
        businessDescription: vendor.vendor_info?.businessDescription || '',
        website: vendor.vendor_info?.website || '',
        isVerified: vendor.vendor_info?.isVerified || false,
        categories: vendor.vendor_info?.categories || [],
        joinDate: vendor.created_at
      };

      res.status(200).json({
        success: true,
        data: vendorInfo
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
 * @desc    Get vendor dashboard overview data
 * @route   GET /api/vendor/dashboard
 * @access  Private/Vendor
 */
const getDashboardData = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Get product count
      const productCountResult = await client.query(
        'SELECT COUNT(*) FROM blinds.vendor_products WHERE vendor_id = $1',
        [vendorId]
      );
      const productCount = parseInt(productCountResult.rows[0].count);

      // Get order count
      const orderCountResult = await client.query(`
        SELECT COUNT(DISTINCT order_id)
        FROM blinds.order_items
        WHERE vendor_id = $1
      `, [vendorId]);
      const orderCount = parseInt(orderCountResult.rows[0].count);

      // Get total revenue
      const revenueResult = await client.query(`
        SELECT SUM(total_price) as total_revenue
        FROM blinds.order_items
        WHERE vendor_id = $1
      `, [vendorId]);
      const revenue = parseFloat(revenueResult.rows[0].total_revenue || 0);

      // Get average rating (placeholder - would be based on actual reviews)
      const ratingResult = await client.query(`
        SELECT AVG(rating) as avg_rating
        FROM blinds.product_reviews
        WHERE product_id IN (
          SELECT product_id FROM blinds.vendor_products WHERE vendor_id = $1
        )
      `, [vendorId]);
      const averageRating = parseFloat(ratingResult.rows[0]?.avg_rating || 0) || 4.5;

      // Get recent products (limited to 5)
      const recentProductsResult = await client.query(`
        SELECT product_id, name, created_at, base_price
        FROM blinds.vendor_products
        WHERE vendor_id = $1
        ORDER BY created_at DESC
        LIMIT 5
      `, [vendorId]);

      // Get recent orders (limited to 5)
      const recentOrdersResult = await client.query(`
        SELECT oi.order_id, oi.name, oi.total_price, oi.created_at, oi.status
        FROM blinds.order_items oi
        WHERE oi.vendor_id = $1
        ORDER BY oi.created_at DESC
        LIMIT 5
      `, [vendorId]);

      // Commit transaction
      await client.query('COMMIT');

      // Format the response data
      const dashboardData = {
        productCount,
        orderCount,
        revenue,
        averageRating,
        recentProducts: recentProductsResult.rows,
        recentOrders: recentOrdersResult.rows
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

/**
 * @desc    Get vendor analytics data
 * @route   GET /api/vendor/analytics
 * @access  Private/Vendor
 */
const getAnalytics = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    const { period = 'month' } = req.query;

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Set the date range based on period
      let dateFilter;
      switch (period) {
        case 'week':
          dateFilter = "created_at >= NOW() - INTERVAL '7 days'";
          break;
        case 'month':
          dateFilter = "created_at >= NOW() - INTERVAL '30 days'";
          break;
        case 'year':
          dateFilter = "created_at >= NOW() - INTERVAL '1 year'";
          break;
        case 'all':
          dateFilter = "1=1"; // No date filter
          break;
        default:
          dateFilter = "created_at >= NOW() - INTERVAL '30 days'";
      }

      // Get total sales and revenue
      const salesResult = await client.query(`
        SELECT
          COUNT(*) as total_sales,
          SUM(total_price) as total_revenue,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders
        FROM blinds.order_items
        WHERE vendor_id = $1 AND ${dateFilter}
      `, [vendorId]);

      // Get sales by month
      const monthlySalesResult = await client.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
          COUNT(*) as sales,
          SUM(total_price) as revenue
        FROM blinds.order_items
        WHERE vendor_id = $1
        AND created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      `, [vendorId]);

      // Get top performing products
      const productPerformanceResult = await client.query(`
        SELECT
          vp.product_id as id,
          vp.name,
          COUNT(oi.item_id) as sales,
          SUM(oi.total_price) as revenue
        FROM vendor_products vp
        LEFT JOIN order_items oi ON vp.product_id = oi.product_id
        WHERE vp.vendor_id = $1
        GROUP BY vp.product_id, vp.name
        ORDER BY revenue DESC NULLS LAST
        LIMIT 10
      `, [vendorId]);

      // Commit transaction
      await client.query('COMMIT');

      // Format the response data
      const analyticsData = {
        totalSales: parseInt(salesResult.rows[0]?.total_sales || 0),
        totalRevenue: parseFloat(salesResult.rows[0]?.total_revenue || 0),
        pendingOrders: parseInt(salesResult.rows[0]?.pending_orders || 0),
        completedOrders: parseInt(salesResult.rows[0]?.completed_orders || 0),
        monthlySales: monthlySalesResult.rows.map(item => ({
          month: item.month,
          sales: parseInt(item.sales),
          revenue: parseFloat(item.revenue)
        })),
        productPerformance: productPerformanceResult.rows.map(item => ({
          id: item.id,
          name: item.name,
          sales: parseInt(item.sales || 0),
          revenue: parseFloat(item.revenue || 0)
        }))
      };

      res.status(200).json({
        success: true,
        data: analyticsData
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
  getVendorProfile,
  updateVendorProfile,
  getDashboardData,
  getAnalytics
};

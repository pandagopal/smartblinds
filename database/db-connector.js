/**
 * PostgreSQL Database Connector for SmartBlindsHub
 *
 * This module provides utilities for connecting to the PostgreSQL database
 * and performing common operations on products, categories, users, and orders.
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create connection pool
const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: process.env.PGPORT || 5432,
  database: process.env.PGDATABASE || 'smartblindshub',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Connect and test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Connected to PostgreSQL database');
    console.log('Current timestamp:', result.rows[0].now);
  });
});

/**
 * Product-related database operations
 */
const productQueries = {
  /**
   * Get all products with optional filtering
   * @param {Object} filters - Optional filters (category, search, etc.)
   * @returns {Promise<Array>} Array of products
   */
  getAllProducts: async (filters = {}) => {
    let query = `
      SELECT p.*, c.name as category_name,
             (SELECT image_url FROM blinds.product_images
              WHERE product_id = p.product_id AND is_primary = TRUE
              LIMIT 1) as primary_image
      FROM blinds.products p
      JOIN blinds.categories c ON p.category_id = c.category_id
      WHERE p.is_active = TRUE
    `;

    const queryParams = [];

    if (filters.category) {
      queryParams.push(filters.category);
      query += ` AND c.slug = $${queryParams.length}`;
    }

    if (filters.search) {
      queryParams.push(`%${filters.search}%`);
      query += ` AND (p.name ILIKE $${queryParams.length} OR p.short_description ILIKE $${queryParams.length})`;
    }

    if (filters.minPrice) {
      queryParams.push(filters.minPrice);
      query += ` AND p.base_price >= $${queryParams.length}`;
    }

    if (filters.maxPrice) {
      queryParams.push(filters.maxPrice);
      query += ` AND p.base_price <= $${queryParams.length}`;
    }

    query += ' ORDER BY p.name ASC';

    try {
      const result = await pool.query(query, queryParams);
      return result.rows;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  /**
   * Get a single product by ID or slug with all related information
   * @param {string|number} identifier - Product ID or slug
   * @param {boolean} isSlug - Whether the identifier is a slug (true) or ID (false)
   * @returns {Promise<Object>} Complete product information
   */
  getProductDetails: async (identifier, isSlug = false) => {
    const idField = isSlug ? 'p.slug' : 'p.product_id';

    // Main product query
    const productQuery = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM blinds.products p
      JOIN blinds.categories c ON p.category_id = c.category_id
      WHERE ${idField} = $1 AND p.is_active = TRUE
    `;

    try {
      // Get basic product info
      const productResult = await pool.query(productQuery, [identifier]);

      if (productResult.rows.length === 0) {
        return null;
      }

      const product = productResult.rows[0];
      const productId = product.product_id;

      // Get product images
      const imagesQuery = `
        SELECT * FROM blinds.product_images
        WHERE product_id = $1
        ORDER BY is_primary DESC, display_order ASC
      `;
      const imagesResult = await pool.query(imagesQuery, [productId]);
      product.images = imagesResult.rows;

      // Get product colors
      const colorsQuery = `
        SELECT pc.*, c.name, c.hex_code, c.color_group
        FROM blinds.product_colors pc
        JOIN blinds.colors c ON pc.color_id = c.color_id
        WHERE pc.product_id = $1
        ORDER BY pc.is_default DESC, c.name ASC
      `;
      const colorsResult = await pool.query(colorsQuery, [productId]);
      product.colors = colorsResult.rows;

      // Get product materials
      const materialsQuery = `
        SELECT pm.*, m.name, m.description
        FROM blinds.product_materials pm
        JOIN blinds.materials m ON pm.material_id = m.material_id
        WHERE pm.product_id = $1
        ORDER BY pm.is_default DESC, m.name ASC
      `;
      const materialsResult = await pool.query(materialsQuery, [productId]);
      product.materials = materialsResult.rows;

      // Get product features
      const featuresQuery = `
        SELECT pf.*, f.name, f.description
        FROM blinds.product_features pf
        JOIN blinds.features f ON pf.feature_id = f.feature_id
        WHERE pf.product_id = $1
      `;
      const featuresResult = await pool.query(featuresQuery, [productId]);
      product.features = featuresResult.rows;

      // Get product dimensions
      const dimensionsQuery = `
        SELECT pd.*, dt.name, dt.unit, dt.description
        FROM blinds.product_dimensions pd
        JOIN blinds.dimension_types dt ON pd.dimension_type_id = dt.dimension_type_id
        WHERE pd.product_id = $1
      `;
      const dimensionsResult = await pool.query(dimensionsQuery, [productId]);
      product.dimensions = dimensionsResult.rows;

      // Get price matrix
      const priceMatrixQuery = `
        SELECT * FROM blinds.price_matrix
        WHERE product_id = $1
      `;
      const priceMatrixResult = await pool.query(priceMatrixQuery, [productId]);
      product.priceMatrix = priceMatrixResult.rows;

      // Get reviews
      const reviewsQuery = `
        SELECT r.*, u.first_name, u.last_name
        FROM blinds.reviews r
        LEFT JOIN blinds.users u ON r.user_id = u.user_id
        WHERE r.product_id = $1 AND r.status = 'approved'
        ORDER BY r.created_at DESC
      `;
      const reviewsResult = await pool.query(reviewsQuery, [productId]);
      product.reviews = reviewsResult.rows;

      return product;
    } catch (error) {
      console.error('Error fetching product details:', error);
      throw error;
    }
  }
};

/**
 * Category-related database operations
 */
const categoryQueries = {
  /**
   * Get all categories
   * @returns {Promise<Array>} Array of categories
   */
  getAllCategories: async () => {
    const query = `
      SELECT * FROM blinds.categories
      WHERE is_active = TRUE
      ORDER BY display_order ASC, name ASC
    `;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  /**
   * Get category by ID or slug
   * @param {string|number} identifier - Category ID or slug
   * @param {boolean} isSlug - Whether the identifier is a slug (true) or ID (false)
   * @returns {Promise<Object>} Category information
   */
  getCategoryByIdOrSlug: async (identifier, isSlug = false) => {
    const idField = isSlug ? 'slug' : 'category_id';

    const query = `SELECT * FROM blinds.categories WHERE ${idField} = $1 AND is_active = TRUE`;

    try {
      const result = await pool.query(query, [identifier]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }
};

/**
 * User-related database operations
 */
const userQueries = {
  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User information
   */
  getUserById: async (userId) => {
    const query = `
      SELECT user_id, email, first_name, last_name, phone, last_login, is_admin, is_active, created_at,role
      FROM blinds.users
      WHERE user_id = $1
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object>} User information
   */
  getUserByEmail: async (email) => {
    const query = `
      SELECT user_id, email, password_hash, first_name, last_name, phone, last_login, is_admin, is_active, created_at,role
      FROM blinds.users
      WHERE email = $1
    `;

    try {
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  },

  /**
   * Get user addresses
   * @param {number} userId - User ID
   * @returns {Promise<Array>} User addresses
   */
  getUserAddresses: async (userId) => {
    const query = `
      SELECT * FROM blinds.addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching user addresses:', error);
      throw error;
    }
  }
};

/**
 * Cart-related database operations
 */
const cartQueries = {
  /**
   * Get cart by user ID or session ID
   * @param {Object} identifier - Object containing either userId or sessionId
   * @returns {Promise<Object>} Cart with items
   */
  getCart: async ({ userId, sessionId }) => {
    let cartQuery;
    let params;

    if (userId) {
      cartQuery = 'SELECT * FROM blinds.carts WHERE user_id = $1 AND is_active = TRUE LIMIT 1';
      params = [userId];
    } else if (sessionId) {
      cartQuery = 'SELECT * FROM blinds.carts WHERE session_id = $1 AND is_active = TRUE LIMIT 1';
      params = [sessionId];
    } else {
      throw new Error('Either userId or sessionId must be provided');
    }

    try {
      // Get or create cart
      let cartResult = await pool.query(cartQuery, params);

      if (cartResult.rows.length === 0) {
        // Create new cart
        if (userId) {
          cartResult = await pool.query(
            'INSERT INTO blinds.carts (user_id, is_active) VALUES ($1, TRUE) RETURNING *',
            [userId]
          );
        } else {
          cartResult = await pool.query(
            'INSERT INTO blinds.carts (session_id, is_active) VALUES ($1, TRUE) RETURNING *',
            [sessionId]
          );
        }
      }

      const cart = cartResult.rows[0];

      // Get cart items
      const itemsQuery = `
        SELECT ci.*, p.name as product_name, p.slug as product_slug,
               (SELECT image_url FROM blinds.product_images WHERE product_id = p.product_id AND is_primary = TRUE LIMIT 1) as product_image,
               c.name as color_name, c.hex_code as color_hex_code,
               m.name as material_name
        FROM blinds.cart_items ci
        JOIN blinds.products p ON ci.product_id = p.product_id
        LEFT JOIN blinds.colors c ON ci.color_id = c.color_id
        LEFT JOIN blinds.materials m ON ci.material_id = m.material_id
        WHERE ci.cart_id = $1
      `;

      const itemsResult = await pool.query(itemsQuery, [cart.cart_id]);
      cart.items = itemsResult.rows;

      return cart;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  /**
   * Add item to cart
   * @param {Object} cartData - Cart data
   * @param {Object} itemData - Item data
   * @returns {Promise<Object>} Updated cart
   */
  addItemToCart: async (cartData, itemData) => {
    try {
      const { cartId } = cartData;
      const { productId, quantity, width, height, colorId, materialId, unitPrice } = itemData;

      // Check if item already exists in cart
      const checkQuery = `
        SELECT * FROM blinds.cart_items
        WHERE cart_id = $1 AND product_id = $2
          AND COALESCE(width, 0) = COALESCE($3, 0)
          AND COALESCE(height, 0) = COALESCE($4, 0)
          AND COALESCE(color_id, 0) = COALESCE($5, 0)
          AND COALESCE(material_id, 0) = COALESCE($6, 0)
      `;

      const checkResult = await pool.query(checkQuery, [
        cartId, productId, width, height, colorId, materialId
      ]);

      if (checkResult.rows.length > 0) {
        // Update existing item
        const existingItem = checkResult.rows[0];
        const newQuantity = existingItem.quantity + quantity;
        const newTotalPrice = unitPrice * newQuantity;

        const updateQuery = `
          UPDATE blinds.cart_items
          SET quantity = $1, unit_price = $2, total_price = $3, updated_at = CURRENT_TIMESTAMP
          WHERE cart_item_id = $4
          RETURNING *
        `;

        await pool.query(updateQuery, [
          newQuantity, unitPrice, newTotalPrice, existingItem.cart_item_id
        ]);
      } else {
        // Add new item
        const totalPrice = unitPrice * quantity;

        const insertQuery = `
          INSERT INTO blinds.cart_items (
            cart_id, product_id, quantity, width, height,
            color_id, material_id, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          RETURNING *
        `;

        await pool.query(insertQuery, [
          cartId, productId, quantity, width, height,
          colorId, materialId, unitPrice, totalPrice
        ]);
      }

      // Return updated cart
      return await cartQueries.getCart({ cartId });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  }
};

/**
 * Order-related database operations
 */
const orderQueries = {
  /**
   * Get orders by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Array>} User's orders
   */
  getUserOrders: async (userId) => {
    const query = `
      SELECT o.*, os.name as status_name
      FROM blinds.orders o
      JOIN order_status os ON o.status_id = os.status_id
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
    `;

    try {
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  /**
   * Get order details by order ID or order number
   * @param {string|number} identifier - Order ID or order number
   * @param {boolean} isOrderNumber - Whether the identifier is an order number (true) or ID (false)
   * @returns {Promise<Object>} Order details
   */
  getOrderDetails: async (identifier, isOrderNumber = false) => {
    const idField = isOrderNumber ? 'o.order_number' : 'o.order_id';

    const orderQuery = `
      SELECT o.*, os.name as status_name,
             ba.address_line1 as billing_address_line1, ba.city as billing_city,
             ba.state as billing_state, ba.postal_code as billing_postal_code,
             sa.address_line1 as shipping_address_line1, sa.city as shipping_city,
             sa.state as shipping_state, sa.postal_code as shipping_postal_code
      FROM blinds.orders o
      JOIN blinds.order_status os ON o.status_id = os.status_id
      LEFT JOIN blinds.addresses ba ON o.billing_address_id = ba.address_id
      LEFT JOIN blinds.addresses sa ON o.shipping_address_id = sa.address_id
      WHERE ${idField} = $1
    `;

    try {
      const orderResult = await pool.query(orderQuery, [identifier]);

      if (orderResult.rows.length === 0) {
        return null;
      }

      const order = orderResult.rows[0];

      // Get order items
      const itemsQuery = `
        SELECT oi.*,
               (SELECT image_url FROM blinds.product_images WHERE product_id = oi.product_id AND is_primary = TRUE LIMIT 1) as product_image
        FROM blinds.order_items oi
        WHERE oi.order_id = $1
      `;

      const itemsResult = await pool.query(itemsQuery, [order.order_id]);
      order.items = itemsResult.rows;

      // Get payments
      const paymentsQuery = `
        SELECT * FROM blinds.payments
        WHERE order_id = $1
        ORDER BY created_at DESC
      `;

      const paymentsResult = await pool.query(paymentsQuery, [order.order_id]);
      order.payments = paymentsResult.rows;

      return order;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }
};

// Export all query modules
module.exports = {
  pool,
  productQueries,
  categoryQueries,
  userQueries,
  cartQueries,
  orderQueries
};

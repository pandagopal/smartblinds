/**
 * PostgreSQL schema and queries for orders related tables
 */

// Main orders table schema
const createOrdersTableSQL = `
CREATE TABLE IF NOT EXISTS orders (
  order_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_address_id INTEGER REFERENCES addresses(id),
  billing_address_id INTEGER REFERENCES addresses(id),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  shipping_method VARCHAR(50),
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  coupon_code VARCHAR(50),
  notes TEXT,
  estimated_delivery_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
`;

// Order items table schema
const createOrderItemsTableSQL = `
CREATE TABLE IF NOT EXISTS order_items (
  item_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_type VARCHAR(50) NOT NULL DEFAULT 'standard', -- 'standard' or 'vendor'
  vendor_id INTEGER REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  options JSONB DEFAULT '{}',
  dimensions JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id, product_type);
CREATE INDEX IF NOT EXISTS idx_order_items_vendor ON order_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_order_items_status ON order_items(status);
`;

// Order history table schema
const createOrderHistoryTableSQL = `
CREATE TABLE IF NOT EXISTS order_history (
  history_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_history_order ON order_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_history_status ON order_history(status);
CREATE INDEX IF NOT EXISTS idx_order_history_created_at ON order_history(created_at);
`;

// Shipping labels table schema
const createShippingLabelsTableSQL = `
CREATE TABLE IF NOT EXISTS shipping_labels (
  label_id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  tracking_number VARCHAR(100),
  carrier VARCHAR(50),
  label_url VARCHAR(255),
  shipping_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_shipping_labels_order ON shipping_labels(order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_labels_tracking ON shipping_labels(tracking_number);
`;

// Get orders with pagination and filters
const buildOrdersQuery = (filters = {}) => {
  let query = `
    SELECT o.*,
      u.name as customer_name,
      u.email as customer_email,
      (SELECT COUNT(*) FROM blinds.order_items WHERE order_id = o.order_id) as item_count
    FROM blinds.orders o
    JOIN blinds.users u ON o.user_id = u.user_id
    WHERE 1=1
  `;

  const params = [];

  // Add userId filter
  if (filters.userId) {
    params.push(filters.userId);
    query += ` AND o.user_id = $${params.length}`;
  }

  // Add status filter
  if (filters.status) {
    params.push(filters.status);
    query += ` AND o.status = $${params.length}`;
  }

  // Add payment status filter
  if (filters.paymentStatus) {
    params.push(filters.paymentStatus);
    query += ` AND o.payment_status = $${params.length}`;
  }

  // Add date range filters
  if (filters.startDate) {
    params.push(filters.startDate);
    query += ` AND o.created_at >= $${params.length}`;
  }

  if (filters.endDate) {
    params.push(filters.endDate);
    query += ` AND o.created_at <= $${params.length}`;
  }

  // Add search filter
  if (filters.search) {
    params.push(`%${filters.search}%`);
    query += ` AND (
      o.order_id::TEXT LIKE $${params.length} OR
      u.name ILIKE $${params.length} OR
      u.email ILIKE $${params.length}
    )`;
  }

  // Add sorting
  if (filters.sortBy) {
    const direction = filters.sortDirection === 'asc' ? 'ASC' : 'DESC';

    switch (filters.sortBy) {
      case 'order_id':
        query += ` ORDER BY o.order_id ${direction}`;
        break;
      case 'customer_name':
        query += ` ORDER BY u.name ${direction}`;
        break;
      case 'total_amount':
        query += ` ORDER BY o.total_amount ${direction}`;
        break;
      case 'status':
        query += ` ORDER BY o.status ${direction}`;
        break;
      case 'payment_status':
        query += ` ORDER BY o.payment_status ${direction}`;
        break;
      default:
        query += ` ORDER BY o.created_at DESC`;
    }
  } else {
    query += ` ORDER BY o.created_at DESC`;
  }

  // Add pagination
  if (filters.limit) {
    params.push(parseInt(filters.limit));
    query += ` LIMIT $${params.length}`;
  }

  if (filters.offset !== undefined) {
    params.push(parseInt(filters.offset));
    query += ` OFFSET $${params.length}`;
  }

  return { sql: query, params };
};

// Get total count for filtered orders
const getOrdersCountQuery = (filters = {}) => {
  let query = `
    SELECT COUNT(*)
    FROM blinds.orders o
    JOIN blinds.users u ON o.user_id = u.user_id
    WHERE 1=1
  `;

  const params = [];

  // Add userId filter
  if (filters.userId) {
    params.push(filters.userId);
    query += ` AND o.user_id = $${params.length}`;
  }

  // Add status filter
  if (filters.status) {
    params.push(filters.status);
    query += ` AND o.status = $${params.length}`;
  }

  // Add payment status filter
  if (filters.paymentStatus) {
    params.push(filters.paymentStatus);
    query += ` AND o.payment_status = $${params.length}`;
  }

  // Add date range filters
  if (filters.startDate) {
    params.push(filters.startDate);
    query += ` AND o.created_at >= $${params.length}`;
  }

  if (filters.endDate) {
    params.push(filters.endDate);
    query += ` AND o.created_at <= $${params.length}`;
  }

  // Add search filter
  if (filters.search) {
    params.push(`%${filters.search}%`);
    query += ` AND (
      o.order_id::TEXT LIKE $${params.length} OR
      u.name ILIKE $${params.length} OR
      u.email ILIKE $${params.length}
    )`;
  }

  return { sql: query, params };
};

// Get order details by ID
const getOrderByIdSQL = `
SELECT o.*,
  u.name as customer_name,
  u.email as customer_email,
  u.phone as customer_phone,
  sa.address_line1 as shipping_address_line1,
  sa.address_line2 as shipping_address_line2,
  sa.city as shipping_city,
  sa.state as shipping_state,
  sa.postal_code as shipping_postal_code,
  sa.country as shipping_country,
  ba.address_line1 as billing_address_line1,
  ba.address_line2 as billing_address_line2,
  ba.city as billing_city,
  ba.state as billing_state,
  ba.postal_code as billing_postal_code,
  ba.country as billing_country
FROM blinds.orders o
JOIN blinds.users u ON o.user_id = u.user_id
LEFT JOIN addresses sa ON o.shipping_address_id = sa.id
LEFT JOIN addresses ba ON o.billing_address_id = ba.id
WHERE o.order_id = $1
`;

// Get vendor order items
const getVendorOrderItemsSQL = `
SELECT oi.*,
  o.status as order_status,
  o.created_at as order_date,
  u.name as customer_name,
  u.email as customer_email
FROM blinds.order_items oi
JOIN blinds.orders o ON oi.order_id = o.order_id
JOIN blinds.users u ON o.user_id = user_id
WHERE oi.vendor_id = $1
`;

// Build a dynamic filter query for vendor order items
const buildVendorOrderItemsQuery = (filters = {}) => {
  let query = getVendorOrderItemsSQL;
  const params = [filters.vendorId];

  // Add status filter
  if (filters.status) {
    params.push(filters.status);
    query += ` AND oi.status = $${params.length}`;
  }

  // Add product filter
  if (filters.productId) {
    params.push(filters.productId);
    query += ` AND oi.product_id = $${params.length}`;
  }

  // Add date range filters
  if (filters.startDate) {
    params.push(filters.startDate);
    query += ` AND o.created_at >= $${params.length}`;
  }

  if (filters.endDate) {
    params.push(filters.endDate);
    query += ` AND o.created_at <= $${params.length}`;
  }

  // Add search filter
  if (filters.search) {
    params.push(`%${filters.search}%`);
    query += ` AND (
      oi.order_id::TEXT LIKE $${params.length} OR
      oi.name ILIKE $${params.length} OR
      u.name ILIKE $${params.length} OR
      u.email ILIKE $${params.length}
    )`;
  }

  // Add sorting
  if (filters.sortBy) {
    const direction = filters.sortDirection === 'asc' ? 'ASC' : 'DESC';

    switch (filters.sortBy) {
      case 'order_id':
        query += ` ORDER BY oi.order_id ${direction}`;
        break;
      case 'product_name':
        query += ` ORDER BY oi.name ${direction}`;
        break;
      case 'status':
        query += ` ORDER BY oi.status ${direction}`;
        break;
      case 'total_price':
        query += ` ORDER BY oi.total_price ${direction}`;
        break;
      default:
        query += ` ORDER BY oi.created_at DESC`;
    }
  } else {
    query += ` ORDER BY oi.created_at DESC`;
  }

  // Add pagination
  if (filters.limit) {
    params.push(parseInt(filters.limit));
    query += ` LIMIT $${params.length}`;
  }

  if (filters.offset !== undefined) {
    params.push(parseInt(filters.offset));
    query += ` OFFSET $${params.length}`;
  }

  return { sql: query, params };
};

// Get order items by order ID
const getOrderItemsSQL = `
SELECT oi.*,
  CASE
    WHEN oi.product_type = 'vendor' THEN
      (SELECT name FROM blinds.users WHERE id = oi.vendor_id)
    ELSE NULL
  END as vendor_name
FROM blinds.order_items oi
WHERE oi.order_id = $1
ORDER BY oi.item_id ASC
`;

// Get order history
const getOrderHistorySQL = `
SELECT oh.*,
  u.name as user_name,
  u.role as user_role
FROM blinds.order_history oh
LEFT JOIN blinds.users u ON oh.created_by = user_id
WHERE oh.order_id = $1
ORDER BY oh.created_at DESC
`;

// Get shipping labels for an order
const getShippingLabelsSQL = `
SELECT * FROM blinds.shipping_labels
WHERE order_id = $1
ORDER BY created_at DESC
`;

// Create new order
const createOrderSQL = `
INSERT INTO orders (
  user_id, status, total_amount, shipping_address_id,
  billing_address_id, payment_method, payment_status,
  shipping_method, shipping_cost, tax_amount,
  discount_amount, coupon_code, notes
)
VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
)
RETURNING *
`;

// Create order item
const createOrderItemSQL = `
INSERT INTO order_items (
  order_id, product_id, product_type, vendor_id,
  name, quantity, unit_price, total_price,
  options, dimensions, status
)
VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
)
RETURNING *
`;

// Add order history entry
const createOrderHistorySQL = `
INSERT INTO order_history (
  order_id, status, notes, created_by
)
VALUES (
  $1, $2, $3, $4
)
RETURNING *
`;

// Create shipping label
const createShippingLabelSQL = `
INSERT INTO shipping_labels (
  order_id, tracking_number, carrier, label_url, shipping_date
)
VALUES (
  $1, $2, $3, $4, $5
)
RETURNING *
`;

// Update order status
const updateOrderStatusSQL = `
UPDATE orders
SET
  status = $2,
  updated_at = CURRENT_TIMESTAMP
WHERE order_id = $1
RETURNING *
`;

// Update order item status
const updateOrderItemStatusSQL = `
UPDATE order_items
SET
  status = $2,
  updated_at = CURRENT_TIMESTAMP
WHERE item_id = $1
RETURNING *
`;

// Update payment status
const updatePaymentStatusSQL = `
UPDATE orders
SET
  payment_status = $2,
  payment_method = COALESCE($3, payment_method),
  updated_at = CURRENT_TIMESTAMP
WHERE order_id = $1
RETURNING *
`;

// Update shipping information
const updateShippingInfoSQL = `
UPDATE orders
SET
  shipping_method = COALESCE($2, shipping_method),
  shipping_cost = COALESCE($3, shipping_cost),
  estimated_delivery_date = COALESCE($4, estimated_delivery_date),
  updated_at = CURRENT_TIMESTAMP
WHERE order_id = $1
RETURNING *
`;

// Get order statistics
const getOrderStatsSQL = `
SELECT
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
  COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
  SUM(total_amount) as total_revenue,
  SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN total_amount ELSE 0 END) as monthly_revenue
FROM orders
`;

// Get vendor order statistics
const getVendorOrderStatsSQL = `
SELECT
  COUNT(*) as total_orders,
  COUNT(DISTINCT order_id) as unique_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_items,
  COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_items,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_items,
  COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_items,
  SUM(total_price) as total_revenue,
  SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN total_price ELSE 0 END) as monthly_revenue
FROM order_items
WHERE vendor_id = $1
`;

module.exports = {
  // Table creation
  createOrdersTableSQL,
  createOrderItemsTableSQL,
  createOrderHistoryTableSQL,
  createShippingLabelsTableSQL,

  // Query builders
  buildOrdersQuery,
  getOrdersCountQuery,
  buildVendorOrderItemsQuery,

  // Order queries
  getOrderByIdSQL,
  getOrderItemsSQL,
  getOrderHistorySQL,
  getShippingLabelsSQL,

  // Vendor order queries
  getVendorOrderItemsSQL,

  // Create/update operations
  createOrderSQL,
  createOrderItemSQL,
  createOrderHistorySQL,
  createShippingLabelSQL,
  updateOrderStatusSQL,
  updateOrderItemStatusSQL,
  updatePaymentStatusSQL,
  updateShippingInfoSQL,

  // Stats and analytics
  getOrderStatsSQL,
  getVendorOrderStatsSQL
};

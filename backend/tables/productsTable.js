/**
 * PostgreSQL schema and queries for products table
 */

// Table creation SQL
const createTableSQL = `
CREATE TABLE IF NOT EXISTS blinds.products (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  category_id INTEGER NOT NULL REFERENCES categories(id),
  vendor_id INTEGER REFERENCES users(id),
  sku VARCHAR(100),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  images JSONB DEFAULT '[]',
  specs JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS blinds.idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS blinds.idx_products_vendor ON products(vendor_id);
CREATE INDEX IF NOT EXISTS blinds.idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS blinds.idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS blinds.idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS blinds.idx_products_slug ON products(slug);
`;

// Get all products with filters
const getProductsSQL = `
SELECT p.*, c.name as category_name
FROM blinds.products p
JOIN blinds.categories c ON p.category_id = c.id
WHERE 1=1
`;

// Build a dynamic filter query with parameters
const buildFilteredProductsQuery = (filters) => {
  let query = getProductsSQL;
  const params = [];

  // Add category filter
  if (filters.category) {
    params.push(filters.category);
    query += ` AND c.slug = $${params.length}`;
  }

  // Add search filter
  if (filters.search) {
    params.push(`%${filters.search}%`);
    query += ` AND (p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
  }

  // Add price range filters
  if (filters.minPrice) {
    params.push(parseFloat(filters.minPrice));
    query += ` AND p.price >= $${params.length}`;
  }

  if (filters.maxPrice) {
    params.push(parseFloat(filters.maxPrice));
    query += ` AND p.price <= $${params.length}`;
  }

  // Add vendor filter
  if (filters.vendorId) {
    params.push(filters.vendorId);
    query += ` AND p.vendor_id = $${params.length}`;
  }

  // Add active filter
  if (filters.isActive !== undefined) {
    params.push(filters.isActive);
    query += ` AND p.is_active = $${params.length}`;
  }

  // Add featured filter
  if (filters.isFeatured !== undefined) {
    params.push(filters.isFeatured);
    query += ` AND p.is_featured = $${params.length}`;
  }

  // Add sorting
  if (filters.sort) {
    switch (filters.sort) {
      case 'price-asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'newest':
        query += ' ORDER BY p.created_at DESC';
        break;
      case 'best-selling':
        query += ' ORDER BY p.sales_count DESC';
        break;
      default:
        query += ' ORDER BY p.created_at DESC';
    }
  } else {
    query += ' ORDER BY p.created_at DESC';
  }

  // Add pagination
  if (filters.limit) {
    params.push(parseInt(filters.limit));
    query += ` LIMIT $${params.length}`;
  }

  if (filters.offset) {
    params.push(parseInt(filters.offset));
    query += ` OFFSET $${params.length}`;
  }

  return { sql: query, params };
};

// Get product by ID
const getProductByIdSQL = `
SELECT p.*, c.name as category_name,
  u.name as vendor_name,
  (SELECT json_build_object(
    'businessName', vi.business_name,
    'businessDescription', vi.business_description,
    'website', vi.website_url,
    'isVerified', vi.is_verified
  ) FROM blinds.vendor_info vi WHERE vi.user_id = p.vendor_id) as vendor_info
FROM blinds.products p
JOIN blinds.categories c ON p.category_id = c.id
LEFT JOIN blinds.users u ON p.vendor_id = user_id
WHERE p.id = $1;
`;

// Get product by slug
const getProductBySlugSQL = `
SELECT p.*, c.name as category_name,
  u.name as vendor_name,
  (SELECT json_build_object(
    'businessName', vi.business_name,
    'businessDescription', vi.business_description,
    'website', vi.website_url,
    'isVerified', vi.is_verified
  ) FROM blinds.vendor_info vi WHERE vi.user_id = p.vendor_id) as vendor_info
FROM blinds.products p
JOIN blinds.categories c ON p.category_id = c.id
LEFT JOIN blinds.users u ON p.vendor_id = user_id
WHERE p.slug = $1;
`;

// Create a product
const createProductSQL = `
INSERT INTO blinds.products (
  title, slug, description, price, sale_price,
  category_id, vendor_id, sku, stock_quantity,
  is_featured, is_active, images, specs
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
)
RETURNING *;
`;

// Update a product
const updateProductSQL = `
UPDATE blinds.products
SET
  title = COALESCE($2, title),
  slug = COALESCE($3, slug),
  description = COALESCE($4, description),
  price = COALESCE($5, price),
  sale_price = COALESCE($6, sale_price),
  category_id = COALESCE($7, category_id),
  sku = COALESCE($8, sku),
  stock_quantity = COALESCE($9, stock_quantity),
  is_featured = COALESCE($10, is_featured),
  is_active = COALESCE($11, is_active),
  images = COALESCE($12, images),
  specs = COALESCE($13, specs),
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
`;

// Delete a product
const deleteProductSQL = `
DELETE FROM blinds.products
WHERE id = $1
RETURNING id;
`;

// Get total count for filtered queries
const getProductCountSQL = (filters) => {
  let query = `
  SELECT COUNT(*)
  FROM blinds.products p
  JOIN blinds.categories c ON p.category_id = c.id
  WHERE 1=1
  `;

  const params = [];

  // Add category filter
  if (filters.category) {
    params.push(filters.category);
    query += ` AND c.slug = $${params.length}`;
  }

  // Add search filter
  if (filters.search) {
    params.push(`%${filters.search}%`);
    query += ` AND (p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
  }

  // Add price range filters
  if (filters.minPrice) {
    params.push(parseFloat(filters.minPrice));
    query += ` AND p.price >= $${params.length}`;
  }

  if (filters.maxPrice) {
    params.push(parseFloat(filters.maxPrice));
    query += ` AND p.price <= $${params.length}`;
  }

  // Add vendor filter
  if (filters.vendorId) {
    params.push(filters.vendorId);
    query += ` AND p.vendor_id = $${params.length}`;
  }

  // Add active filter
  if (filters.isActive !== undefined) {
    params.push(filters.isActive);
    query += ` AND p.is_active = $${params.length}`;
  }

  // Add featured filter
  if (filters.isFeatured !== undefined) {
    params.push(filters.isFeatured);
    query += ` AND p.is_featured = $${params.length}`;
  }

  return { sql: query, params };
};

module.exports = {
  createTableSQL,
  buildFilteredProductsQuery,
  getProductByIdSQL,
  getProductBySlugSQL,
  createProductSQL,
  updateProductSQL,
  deleteProductSQL,
  getProductCountSQL
};

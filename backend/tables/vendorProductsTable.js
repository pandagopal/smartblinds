/**
 * PostgreSQL schema and queries for vendor_products related tables
 */

// Main product table schema
const createProductTableSQL = `
CREATE TABLE IF NOT EXISTS blinds.vendor_products (
  product_id SERIAL PRIMARY KEY,
  vendor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  type_id INTEGER NOT NULL,
  series_name VARCHAR(255),
  material_type VARCHAR(255),
  short_description TEXT,
  full_description TEXT,
  features TEXT,
  benefits TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  base_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(vendor_id, slug)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS blinds.idx_vendor_products_vendor ON vendor_products(vendor_id);
CREATE INDEX IF NOT EXISTS blinds.idx_vendor_products_type ON vendor_products(type_id);
CREATE INDEX IF NOT EXISTS blinds.idx_vendor_products_active ON vendor_products(is_active);
CREATE INDEX IF NOT EXISTS blinds.idx_vendor_products_slug ON vendor_products(slug);
`;

// Product images table schema
const createProductImagesTableSQL = `
CREATE TABLE IF NOT EXISTS blinds.vendor_product_images (
  image_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES blinds.vendor_products(product_id) ON DELETE CASCADE,
  image_url VARCHAR(255) NOT NULL,
  alt_text VARCHAR(255),
  image_type VARCHAR(50) DEFAULT 'product',
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS blinds.idx_product_images_product ON vendor_product_images(product_id);
CREATE INDEX IF NOT EXISTS blinds.idx_product_images_primary ON vendor_product_images(is_primary);
CREATE INDEX IF NOT EXISTS blinds.idx_product_images_order ON vendor_product_images(display_order);
`;

// Product dimensions table schema
const createProductDimensionsTableSQL = `
CREATE TABLE IF NOT EXISTS blinds.vendor_product_dimensions (
  dimension_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES blinds.vendor_products(product_id) ON DELETE CASCADE,
  min_width DECIMAL(10, 2),
  max_width DECIMAL(10, 2),
  min_height DECIMAL(10, 2),
  max_height DECIMAL(10, 2),
  min_depth DECIMAL(10, 2),
  max_depth DECIMAL(10, 2),
  measurement_unit VARCHAR(10) DEFAULT 'inch',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS blinds.idx_product_dimensions_product ON vendor_product_dimensions(product_id);
`;

// Product options table schema
const createProductOptionsTableSQL = `
CREATE TABLE IF NOT EXISTS blinds.vendor_product_options (
  option_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES blinds.vendor_products(product_id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  description TEXT,
  option_type VARCHAR(50) NOT NULL, -- 'select', 'radio', 'checkbox', etc.
  is_required BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  affects_price BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS blinds.idx_product_options_product ON vendor_product_options(product_id);
CREATE INDEX IF NOT EXISTS blinds.idx_product_options_order ON vendor_product_options(display_order);
`;

// Product option values table schema
const createProductOptionValuesTableSQL = `
CREATE TABLE IF NOT EXISTS blinds.vendor_product_option_values (
  value_id SERIAL PRIMARY KEY,
  option_id INTEGER NOT NULL REFERENCES blinds.vendor_product_options(option_id) ON DELETE CASCADE,
  value VARCHAR(255) NOT NULL,
  display_value VARCHAR(255),
  description TEXT,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(option_id, value)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS blinds.idx_option_values_option ON vendor_product_option_values(option_id);
CREATE INDEX IF NOT EXISTS blinds.idx_option_values_order ON vendor_product_option_values(display_order);
`;

// Product price grid table schema
const createProductPriceGridTableSQL = `
CREATE TABLE IF NOT EXISTS blinds.vendor_product_price_grid (
  grid_id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES blinds.vendor_products(product_id) ON DELETE CASCADE,
  width DECIMAL(10, 2),
  height DECIMAL(10, 2),
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS blinds.idx_price_grid_product ON vendor_product_price_grid(product_id);
CREATE INDEX IF NOT EXISTS blinds.idx_price_grid_dimensions ON vendor_product_price_grid(width, height);
`;

// Product types table schema
const createProductTypesTableSQL = `
CREATE TABLE IF NOT EXISTS blinds.product_types (
  type_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS blinds.idx_product_types_slug ON product_types(slug);
CREATE INDEX IF NOT EXISTS blinds.idx_product_types_active ON product_types(is_active);
CREATE INDEX IF NOT EXISTS blinds.idx_product_types_order ON product_types(display_order);
`;

// Query to get all vendor products with filters
const getVendorProductsSQL = `
SELECT vp.*, pt.name as type_name
FROM blinds.vendor_products vp
JOIN blinds.product_types pt ON vp.type_id = pt.type_id
WHERE vp.vendor_id = $1
`;

// Function to build a dynamic filter query for vendor products
const buildVendorProductsQuery = (filters = {}) => {
  let query = getVendorProductsSQL;
  const params = [filters.vendorId];

  if (filters.type && filters.type !== 'all') {
    params.push(filters.type);
    query += ` AND pt.slug = $${params.length}`;
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    query += ` AND (vp.name ILIKE $${params.length} OR vp.short_description ILIKE $${params.length})`;
  }

  if (filters.active === true || filters.active === 'true') {
    query += ` AND vp.is_active = true`;
  } else if (filters.active === false || filters.active === 'false') {
    query += ` AND vp.is_active = false`;
  }

  // Add sorting
  query += ` ORDER BY vp.created_at DESC`;

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

// Get vendor product by ID
const getVendorProductByIdSQL = `
SELECT vp.*, pt.name as type_name
FROM blinds.vendor_products vp
JOIN blinds.product_types pt ON vp.type_id = pt.type_id
WHERE vp.product_id = $1 AND vp.vendor_id = $2
`;

// Insert a new vendor product
const createVendorProductSQL = `
INSERT INTO blinds.vendor_products (
  vendor_id, name, slug, type_id, series_name, material_type,
  short_description, full_description, features, benefits,
  is_active, base_price
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING *
`;

// Update a vendor product
const updateVendorProductSQL = `
UPDATE blinds.vendor_products
SET
  name = COALESCE($3, name),
  slug = COALESCE($4, slug),
  type_id = COALESCE($5, type_id),
  series_name = COALESCE($6, series_name),
  material_type = COALESCE($7, material_type),
  short_description = COALESCE($8, short_description),
  full_description = COALESCE($9, full_description),
  features = COALESCE($10, features),
  benefits = COALESCE($11, benefits),
  is_active = COALESCE($12, is_active),
  base_price = COALESCE($13, base_price),
  updated_at = CURRENT_TIMESTAMP
WHERE product_id = $1 AND vendor_id = $2
RETURNING *
`;

// Delete a vendor product
const deleteVendorProductSQL = `
DELETE FROM blinds.vendor_products
WHERE product_id = $1 AND vendor_id = $2
RETURNING product_id
`;

// Check if product with same slug exists
const checkProductSlugSQL = `
SELECT product_id FROM blinds.vendor_products
WHERE slug = $1 AND vendor_id = $2
`;

// Insert a product image
const createProductImageSQL = `
INSERT INTO blinds.vendor_product_images (
  product_id, image_url, alt_text, image_type, is_primary, display_order
)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *
`;

// Get product images
const getProductImagesSQL = `
SELECT * FROM blinds.vendor_product_images
WHERE product_id = $1
ORDER BY is_primary DESC, display_order ASC
`;

// Update a product image
const updateProductImageSQL = `
UPDATE blinds.vendor_product_images
SET
  image_url = COALESCE($2, image_url),
  alt_text = COALESCE($3, alt_text),
  image_type = COALESCE($4, image_type),
  is_primary = COALESCE($5, is_primary),
  display_order = COALESCE($6, display_order)
WHERE image_id = $1
RETURNING *
`;

// Delete a product image
const deleteProductImageSQL = `
DELETE FROM blinds.vendor_product_images
WHERE image_id = $1
RETURNING image_id
`;

// Insert product dimensions
const createProductDimensionsSQL = `
INSERT INTO blinds.vendor_product_dimensions (
  product_id, min_width, max_width, min_height, max_height,
  min_depth, max_depth, measurement_unit
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *
`;

// Get product dimensions
const getProductDimensionsSQL = `
SELECT * FROM blinds.vendor_product_dimensions
WHERE product_id = $1
`;

// Update product dimensions
const updateProductDimensionsSQL = `
UPDATE blinds.vendor_product_dimensions
SET
  min_width = COALESCE($2, min_width),
  max_width = COALESCE($3, max_width),
  min_height = COALESCE($4, min_height),
  max_height = COALESCE($5, max_height),
  min_depth = COALESCE($6, min_depth),
  max_depth = COALESCE($7, max_depth),
  measurement_unit = COALESCE($8, measurement_unit)
WHERE product_id = $1
RETURNING *
`;

// Insert a product option
const createProductOptionSQL = `
INSERT INTO blinds.vendor_product_options (
  product_id, name, display_name, description, option_type,
  is_required, display_order, affects_price
)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *
`;

// Get product options
const getProductOptionsSQL = `
SELECT * FROM blinds.vendor_product_options
WHERE product_id = $1
ORDER BY display_order ASC
`;

// Update a product option
const updateProductOptionSQL = `
UPDATE blinds.vendor_product_options
SET
  name = COALESCE($2, name),
  display_name = COALESCE($3, display_name),
  description = COALESCE($4, description),
  option_type = COALESCE($5, option_type),
  is_required = COALESCE($6, is_required),
  display_order = COALESCE($7, display_order),
  affects_price = COALESCE($8, affects_price)
WHERE option_id = $1
RETURNING *
`;

// Delete a product option
const deleteProductOptionSQL = `
DELETE FROM blinds.vendor_product_options
WHERE option_id = $1
RETURNING option_id
`;

// Insert an option value
const createOptionValueSQL = `
INSERT INTO blinds.vendor_product_option_values (
  option_id, value, display_value, description,
  price_adjustment, display_order
)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *
`;

// Get option values
const getOptionValuesSQL = `
SELECT * FROM blinds.vendor_product_option_values
WHERE option_id = $1
ORDER BY display_order ASC
`;

// Update an option value
const updateOptionValueSQL = `
UPDATE blinds.vendor_product_option_values
SET
  value = COALESCE($2, value),
  display_value = COALESCE($3, display_value),
  description = COALESCE($4, description),
  price_adjustment = COALESCE($5, price_adjustment),
  display_order = COALESCE($6, display_order)
WHERE value_id = $1
RETURNING *
`;

// Delete an option value
const deleteOptionValueSQL = `
DELETE FROM blinds.vendor_product_option_values
WHERE value_id = $1
RETURNING value_id
`;

// Insert a price grid entry
const createPriceGridEntrySQL = `
INSERT INTO blinds.vendor_product_price_grid (
  product_id, width, height, price
)
VALUES ($1, $2, $3, $4)
RETURNING *
`;

// Get price grid entries
const getPriceGridEntriesSQL = `
SELECT * FROM blinds.vendor_product_price_grid
WHERE product_id = $1
ORDER BY width, height
`;

// Update a price grid entry
const updatePriceGridEntrySQL = `
UPDATE blinds.vendor_product_price_grid
SET
  width = COALESCE($2, width),
  height = COALESCE($3, height),
  price = COALESCE($4, price)
WHERE grid_id = $1
RETURNING *
`;

// Delete a price grid entry
const deletePriceGridEntrySQL = `
DELETE FROM blinds.vendor_product_price_grid
WHERE grid_id = $1
RETURNING grid_id
`;

// Get product types
const getProductTypesSQL = `
SELECT * FROM blinds.product_types
WHERE is_active = true
ORDER BY display_order ASC, name ASC
`;

module.exports = {
  // Table creation
  createProductTableSQL,
  createProductImagesTableSQL,
  createProductDimensionsTableSQL,
  createProductOptionsTableSQL,
  createProductOptionValuesTableSQL,
  createProductPriceGridTableSQL,
  createProductTypesTableSQL,

  // Query builders
  buildVendorProductsQuery,

  // Main product queries
  getVendorProductsSQL,
  getVendorProductByIdSQL,
  createVendorProductSQL,
  updateVendorProductSQL,
  deleteVendorProductSQL,
  checkProductSlugSQL,

  // Product images
  createProductImageSQL,
  getProductImagesSQL,
  updateProductImageSQL,
  deleteProductImageSQL,

  // Product dimensions
  createProductDimensionsSQL,
  getProductDimensionsSQL,
  updateProductDimensionsSQL,

  // Product options
  createProductOptionSQL,
  getProductOptionsSQL,
  updateProductOptionSQL,
  deleteProductOptionSQL,

  // Option values
  createOptionValueSQL,
  getOptionValuesSQL,
  updateOptionValueSQL,
  deleteOptionValueSQL,

  // Price grid
  createPriceGridEntrySQL,
  getPriceGridEntriesSQL,
  updatePriceGridEntrySQL,
  deletePriceGridEntrySQL,

  // Product types
  getProductTypesSQL
};

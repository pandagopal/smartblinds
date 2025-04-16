/**
 * PostgreSQL schema and queries for categories table
 */

// Table creation SQL
const createTableSQL = `
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id),
  image VARCHAR(255),
  icon VARCHAR(255),
  is_featured BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_featured ON categories(is_featured);
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories(display_order);
`;

// Get all categories
const getAllCategoriesSQL = `
SELECT c.*,
  p.name as parent_name,
  p.slug as parent_slug,
  (SELECT COUNT(*) FROM blinds.products WHERE category_id = c.id) as product_count
FROM blinds.categories c
LEFT JOIN blinds.categories p ON c.parent_id = p.id
ORDER BY c.display_order, c.name
`;

// Get featured categories
const getFeaturedCategoriesSQL = `
SELECT c.*,
  p.name as parent_name,
  p.slug as parent_slug,
  (SELECT COUNT(*) FROM blinds.products WHERE category_id = c.id) as product_count
FROM blinds.categories c
LEFT JOIN blinds.categories p ON c.parent_id = p.id
WHERE c.is_featured = true
ORDER BY c.display_order, c.name
LIMIT $1
`;

// Get category by ID
const getCategoryByIdSQL = `
SELECT c.*,
  p.name as parent_name,
  p.slug as parent_slug,
  (SELECT COUNT(*) FROM blinds.products WHERE category_id = c.id) as product_count
FROM blinds.categories c
LEFT JOIN blinds.categories p ON c.parent_id = p.id
WHERE c.id = $1
`;

// Get category by slug
const getCategoryBySlugSQL = `
SELECT c.*,
  p.name as parent_name,
  p.slug as parent_slug,
  (SELECT COUNT(*) FROM blinds.products WHERE category_id = c.id) as product_count
FROM blinds.categories c
LEFT JOIN blinds.categories p ON c.parent_id = p.id
WHERE c.slug = $1
`;

// Get subcategories
const getSubcategoriesSQL = `
SELECT c.*,
  (SELECT COUNT(*) FROM blinds.products WHERE category_id = c.id) as product_count
FROM blinds.categories c
WHERE c.parent_id = $1
ORDER BY c.display_order, c.name
`;

// Get parent categories
const getParentCategoriesSQL = `
SELECT c.*,
  (SELECT COUNT(*) FROM blinds.products WHERE category_id = c.id) as product_count
FROM blinds.categories c
WHERE c.parent_id IS NULL
ORDER BY c.display_order, c.name
`;

// Create a category
const createCategorySQL = `
INSERT INTO blinds.categories (
  name, slug, description, parent_id, image, icon, is_featured, display_order
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8
)
RETURNING *;
`;

// Update a category
const updateCategorySQL = `
UPDATE blinds.categories
SET
  name = COALESCE($2, name),
  slug = COALESCE($3, slug),
  description = COALESCE($4, description),
  parent_id = $5,
  image = COALESCE($6, image),
  icon = COALESCE($7, icon),
  is_featured = COALESCE($8, is_featured),
  display_order = COALESCE($9, display_order),
  updated_at = CURRENT_TIMESTAMP
WHERE id = $1
RETURNING *;
`;

// Delete a category
const deleteCategorySQL = `
DELETE FROM blinds.categories
WHERE id = $1
RETURNING id;
`;

// Check if category has subcategories
const categoryHasSubcategoriesSQL = `
SELECT COUNT(*)
FROM blinds.categories
WHERE parent_id = $1
`;

// Check if category has products
const categoryHasProductsSQL = `
SELECT COUNT(*)
FROM blinds.products
WHERE category_id = $1
`;

module.exports = {
  createTableSQL,
  getAllCategoriesSQL,
  getFeaturedCategoriesSQL,
  getCategoryByIdSQL,
  getCategoryBySlugSQL,
  getSubcategoriesSQL,
  getParentCategoriesSQL,
  createCategorySQL,
  updateCategorySQL,
  deleteCategorySQL,
  categoryHasSubcategoriesSQL,
  categoryHasProductsSQL
};

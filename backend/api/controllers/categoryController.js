const { executeQuery, saveData } = require('../../utils/dataService');

/**
 * Get all categories
 * @route GET /api/categories
 * @access Public
 */
const getCategories = async (req, res, next) => {
  try {
    // Build the PostgreSQL query
    const query = `
      SELECT * FROM categories
      ORDER BY name ASC
    `;

    // No transformation needed for CSV data, just return as is
    const categories = await executeQuery(query, [], 'categories', data => data);

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single category
 * @route GET /api/categories/:id
 * @access Public
 */
const getCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Build the PostgreSQL query - check if it's a numeric ID or a slug
    const isNumeric = !isNaN(id);
    const query = isNumeric
      ? `SELECT * FROM categories WHERE id = $1`
      : `SELECT * FROM categories WHERE slug = $1`;

    // Define transform function for CSV data
    const transformCsvData = (csvData) => {
      // Find by id or slug depending on the input
      const category = isNumeric
        ? csvData.find(c => c.id === parseInt(id))
        : csvData.find(c => c.slug === id);

      return category ? [category] : [];
    };

    // Execute query with CSV fallback
    const categories = await executeQuery(query, [id], 'categories', transformCsvData);

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Category not found`
      });
    }

    res.json({
      success: true,
      data: categories[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get products by category
 * @route GET /api/categories/:id/products
 * @access Public
 */
const getCategoryProducts = async (req, res, next) => {
  try {
    const { id } = req.params;

    // First, find the category
    const isNumeric = !isNaN(id);
    const categoryQuery = isNumeric
      ? `SELECT id FROM categories WHERE id = $1`
      : `SELECT id FROM categories WHERE slug = $1`;

    // Transform function to find category in CSV
    const findCategoryInCsv = (csvData) => {
      const category = isNumeric
        ? csvData.find(c => c.id === parseInt(id))
        : csvData.find(c => c.slug === id);

      return category ? [category] : [];
    };

    // Get the category
    const categories = await executeQuery(
      categoryQuery,
      [id],
      'categories',
      findCategoryInCsv
    );

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Category not found`
      });
    }

    const categoryId = categories[0].id;

    // Get products by category
    const productsQuery = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = $1
      ORDER BY p.title ASC
    `;

    // Transform function to find products in CSV
    const findProductsInCsv = (csvData) => {
      return csvData
        .filter(p => p.categoryId === categoryId)
        .sort((a, b) => a.title.localeCompare(b.title));
    };

    // Get the products
    const products = await executeQuery(
      productsQuery,
      [categoryId],
      'products',
      findProductsInCsv
    );

    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new category
 * @route POST /api/categories
 * @access Private/Admin
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image } = req.body;

    // Validate required fields
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name and slug'
      });
    }

    // Check if slug already exists
    const checkSlugQuery = `SELECT id FROM categories WHERE slug = $1`;

    // Function to check if slug exists in CSV
    const checkSlugInCsv = (csvData) => {
      return csvData.filter(c => c.slug === slug);
    };

    // Check if slug exists
    const existingCategories = await executeQuery(
      checkSlugQuery,
      [slug],
      'categories',
      checkSlugInCsv
    );

    if (existingCategories && existingCategories.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Slug already exists'
      });
    }

    // Generate a new ID - in a real app this would be handled by the database
    const newId = Date.now();

    // Build the PostgreSQL query
    const query = `
      INSERT INTO categories (id, name, slug, description, image)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const params = [
      newId,
      name,
      slug,
      description || '',
      image || ''
    ];

    // Prepare CSV data
    const csvCategory = {
      id: newId,
      name,
      slug,
      description: description || '',
      image: image || ''
    };

    // Read existing CSV data
    const getCsvCategories = async () => {
      try {
        const categories = await executeQuery('', [], 'categories', data => data);
        return [...categories, csvCategory];
      } catch (error) {
        return [csvCategory];
      }
    };

    // Save to PostgreSQL and CSV
    const result = await saveData(
      query,
      params,
      'categories',
      await getCsvCategories()
    );

    res.status(201).json({
      success: true,
      data: result[0] || csvCategory
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategory,
  getCategoryProducts,
  createCategory
};

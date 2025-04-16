const { pool } = require('../../config/db');
const categories = require('../../tables/categoriesTable');
const products = require('../../tables/productsTable');
const ErrorResponse = require('../../utils/errorResponse');

/**
 * Get all categories
 * @route GET /api/categories
 * @access Public
 */
const getCategories = async (req, res, next) => {
  try {
    const client = await pool.connect();

    try {
      const result = await client.query(categories.getAllCategoriesSQL);

      res.json({
        success: true,
        count: result.rows.length,
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
 * Get parent categories (top-level)
 * @route GET /api/categories/parents
 * @access Public
 */
const getParentCategories = async (req, res, next) => {
  try {
    const client = await pool.connect();

    try {
      const result = await client.query(categories.getParentCategoriesSQL);

      res.json({
        success: true,
        count: result.rows.length,
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
 * Get featured categories
 * @route GET /api/categories/featured
 * @access Public
 */
const getFeaturedCategories = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 6;

    const client = await pool.connect();

    try {
      const result = await client.query(
        categories.getFeaturedCategoriesSQL,
        [limit]
      );

      res.json({
        success: true,
        count: result.rows.length,
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
 * Get single category (by ID or slug)
 * @route GET /api/categories/:idOrSlug
 * @access Public
 */
const getCategory = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = !isNaN(idOrSlug);

    const client = await pool.connect();

    try {
      let result;

      if (isNumeric) {
        result = await client.query(
          categories.getCategoryByIdSQL,
          [idOrSlug]
        );
      } else {
        result = await client.query(
          categories.getCategoryBySlugSQL,
          [idOrSlug]
        );
      }

      if (result.rows.length === 0) {
        return next(
          new ErrorResponse(`Category not found`, 404)
        );
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get subcategories for a category
 * @route GET /api/categories/:id/subcategories
 * @access Public
 */
const getSubcategories = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();

    try {
      const result = await client.query(
        categories.getSubcategoriesSQL,
        [id]
      );

      res.json({
        success: true,
        count: result.rows.length,
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
 * Get products by category
 * @route GET /api/categories/:idOrSlug/products
 * @access Public
 */
const getCategoryProducts = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isNumeric = !isNaN(idOrSlug);
    const { page = 1, limit = 12 } = req.query;

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // First, find the category
      let categoryResult;

      if (isNumeric) {
        categoryResult = await client.query(
          `SELECT id FROM blinds.categories WHERE id = $1`,
          [idOrSlug]
        );
      } else {
        categoryResult = await client.query(
          `SELECT id FROM blinds.categories WHERE slug = $1`,
          [idOrSlug]
        );
      }

      if (categoryResult.rows.length === 0) {
        return next(
          new ErrorResponse(`Category not found`, 404)
        );
      }

      const categoryId = categoryResult.rows[0].id;

      // Build filters object
      const filters = {
        categoryId,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      // Get filtered products
      const { sql, params } = products.buildFilteredProductsQuery(filters);
      const productResult = await client.query(sql, params);

      // Get total count for pagination
      const countQuery = products.getProductCountSQL(filters);
      const countResult = await client.query(countQuery.sql, countQuery.params);
      const totalCount = parseInt(countResult.rows[0].count);

      // Commit transaction
      await client.query('COMMIT');

      res.json({
        success: true,
        count: totalCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          hasMore: parseInt(page) * parseInt(limit) < totalCount
        },
        data: productResult.rows
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
 * Create new category
 * @route POST /api/categories
 * @access Private/Admin
 */
const createCategory = async (req, res, next) => {
  try {
    const {
      name,
      description,
      parentId = null,
      image,
      icon,
      isFeatured = false,
      displayOrder = 0
    } = req.body;

    // Validate required fields
    if (!name) {
      return next(
        new ErrorResponse('Category name is required', 400)
      );
    }

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if slug exists
      const slugCheckResult = await client.query(
        'SELECT COUNT(*) FROM blinds.categories WHERE slug = $1',
        [slug]
      );

      const slugCount = parseInt(slugCheckResult.rows[0].count);

      if (slugCount > 0) {
        return next(
          new ErrorResponse('A category with this name already exists', 400)
        );
      }

      // Insert the category
      const result = await client.query(
        categories.createCategorySQL,
        [
          name,
          slug,
          description || null,
          parentId,
          image || null,
          icon || null,
          isFeatured,
          displayOrder
        ]
      );

      // Commit transaction
      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        data: result.rows[0]
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
 * Update category
 * @route PUT /api/categories/:id
 * @access Private/Admin
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      parentId,
      image,
      icon,
      isFeatured,
      displayOrder
    } = req.body;

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Check if category exists
      const categoryCheck = await client.query(
        'SELECT * FROM blinds.categories WHERE id = $1',
        [id]
      );

      if (categoryCheck.rows.length === 0) {
        return next(
          new ErrorResponse(`Category with ID ${id} not found`, 404)
        );
      }

      // Generate slug if name changed
      let slug = null;
      if (name && name !== categoryCheck.rows[0].name) {
        slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Check if slug exists (except for this category)
        const slugCheckResult = await client.query(
          'SELECT COUNT(*) FROM blinds.categories WHERE slug = $1 AND id != $2',
          [slug, id]
        );

        const slugCount = parseInt(slugCheckResult.rows[0].count);
        if (slugCount > 0) {
          return next(
            new ErrorResponse('A category with this name already exists', 400)
          );
        }
      }

      // Update the category
      const result = await client.query(
        categories.updateCategorySQL,
        [
          id,
          name || null,
          slug,
          description || null,
          parentId, // Will be NULL if not provided
          image || null,
          icon || null,
          isFeatured !== undefined ? isFeatured : null,
          displayOrder !== undefined ? displayOrder : null
        ]
      );

      // Commit transaction
      await client.query('COMMIT');

      res.json({
        success: true,
        data: result.rows[0]
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
 * Delete category
 * @route DELETE /api/categories/:id
 * @access Private/Admin
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Check if category exists
      const categoryCheck = await client.query(
        'SELECT * FROM blinds.categories WHERE id = $1',
        [id]
      );

      if (categoryCheck.rows.length === 0) {
        return next(
          new ErrorResponse(`Category with ID ${id} not found`, 404)
        );
      }

      // Check if category has subcategories
      const subcategoriesCheck = await client.query(
        categories.categoryHasSubcategoriesSQL,
        [id]
      );

      const subcategoriesCount = parseInt(subcategoriesCheck.rows[0].count);
      if (subcategoriesCount > 0) {
        return next(
          new ErrorResponse(
            'Cannot delete category with subcategories. Please delete or reassign subcategories first.',
            400
          )
        );
      }

      // Check if category has products
      const productsCheck = await client.query(
        categories.categoryHasProductsSQL,
        [id]
      );

      const productsCount = parseInt(productsCheck.rows[0].count);
      if (productsCount > 0) {
        return next(
          new ErrorResponse(
            'Cannot delete category with products. Please delete or reassign products first.',
            400
          )
        );
      }

      // Delete the category
      await client.query(
        categories.deleteCategorySQL,
        [id]
      );

      // Commit transaction
      await client.query('COMMIT');

      res.json({
        success: true,
        data: {}
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
  getCategories,
  getParentCategories,
  getFeaturedCategories,
  getCategory,
  getSubcategories,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory
};

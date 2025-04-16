const { pool } = require('../../config/db');
const products = require('../../tables/productsTable');
const ErrorResponse = require('../../utils/errorResponse');
const { executeQuery, saveData } = require('../../utils/dataService');

/**
 * Get all products
 * @route GET /api/products
 * @access Public
 */
const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    // Build filters object
    const filters = {
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const client = await pool.connect();

    try {
      // Get filtered products
      const { sql, params } = products.buildFilteredProductsQuery(filters);
      const productResult = await client.query(sql, params);

      // Get total count for pagination
      const countQuery = products.getProductCountSQL(filters);
      const countResult = await client.query(countQuery.sql, countQuery.params);
      const totalCount = parseInt(countResult.rows[0].count);

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
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get single product
 * @route GET /api/products/:id
 * @access Public
 */
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();

    try {
      const result = await client.query(
        products.getProductByIdSQL,
        [id]
      );

      if (result.rows.length === 0) {
        return next(
          new ErrorResponse(`Product with ID ${id} not found`, 404)
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
 * Get product by slug
 * @route GET /api/products/slug/:slug
 * @access Public
 */
const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const client = await pool.connect();

    try {
      const result = await client.query(
        products.getProductBySlugSQL,
        [slug]
      );

      if (result.rows.length === 0) {
        return next(
          new ErrorResponse(`Product with slug ${slug} not found`, 404)
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
 * Get related products
 * @route GET /api/products/:id/related
 * @access Public
 */
const getRelatedProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 4;

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // First, get the product to find its category
      const productResult = await client.query(
        'SELECT category_id FROM blinds.products WHERE id = $1',
        [id]
      );

      if (productResult.rows.length === 0) {
        return next(
          new ErrorResponse(`Product with ID ${id} not found`, 404)
        );
      }

      const categoryId = productResult.rows[0].category_id;

      // Get related products
      const relatedResult = await client.query(`
        SELECT p.*, c.name as category_name
        FROM blinds.products p
        JOIN blinds.categories c ON p.category_id = c.id
        WHERE p.category_id = $1 AND p.id != $2
        ORDER BY p.created_at DESC
        LIMIT $3
      `, [categoryId, id, limit]);

      // Commit transaction
      await client.query('COMMIT');

      res.json({
        success: true,
        count: relatedResult.rows.length,
        data: relatedResult.rows
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
 * Create new product
 * @route POST /api/products
 * @access Private/Admin/Vendor
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      salePrice,
      categoryId,
      vendorId = req.user.id,
      sku,
      stockQuantity = 0,
      isFeatured = false,
      isActive = true,
      images = [],
      specs = {}
    } = req.body;

    // Validate required fields
    if (!title || !description || !categoryId || !price) {
      return next(
        new ErrorResponse('Please provide all required fields', 400)
      );
    }

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Generate slug from title
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Check if slug exists and make it unique if needed
      const slugCheckResult = await client.query(
        'SELECT COUNT(*) FROM blinds.products WHERE slug = $1',
        [slug]
      );

      const slugCount = parseInt(slugCheckResult.rows[0].count);
      const finalSlug = slugCount > 0 ? `${slug}-${Date.now()}` : slug;

      // Insert the product
      const result = await client.query(
        products.createProductSQL,
        [
          title,
          finalSlug,
          description,
          price,
          salePrice || null,
          categoryId,
          vendorId,
          sku || null,
          stockQuantity,
          isFeatured,
          isActive,
          JSON.stringify(images),
          JSON.stringify(specs)
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
 * Update product
 * @route PUT /api/products/:id
 * @access Private/Admin/Vendor
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      salePrice,
      categoryId,
      sku,
      stockQuantity,
      isFeatured,
      isActive,
      images,
      specs
    } = req.body;

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Check if product exists and user has permission
      const productCheck = await client.query(
        'SELECT * FROM blinds.products WHERE id = $1',
        [id]
      );

      if (productCheck.rows.length === 0) {
        return next(
          new ErrorResponse(`Product with ID ${id} not found`, 404)
        );
      }

      // If user is not admin, verify they own the product
      if (req.user.role !== 'admin' && productCheck.rows[0].vendor_id !== req.user.id) {
        return next(
          new ErrorResponse('Not authorized to update this product', 403)
        );
      }

      // Generate slug if title changed
      let slug = null;
      if (title && title !== productCheck.rows[0].title) {
        slug = title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        // Check if slug exists and make it unique if needed
        const slugCheckResult = await client.query(
          'SELECT COUNT(*) FROM blinds.products WHERE slug = $1 AND id != $2',
          [slug, id]
        );

        const slugCount = parseInt(slugCheckResult.rows[0].count);
        slug = slugCount > 0 ? `${slug}-${Date.now()}` : slug;
      }

      // Update the product
      const result = await client.query(
        products.updateProductSQL,
        [
          id,
          title || null,
          slug,
          description || null,
          price ? parseFloat(price) : null,
          salePrice ? parseFloat(salePrice) : null,
          categoryId || null,
          sku || null,
          stockQuantity !== undefined ? parseInt(stockQuantity) : null,
          isFeatured !== undefined ? isFeatured : null,
          isActive !== undefined ? isActive : null,
          images ? JSON.stringify(images) : null,
          specs ? JSON.stringify(specs) : null
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
 * Delete product
 * @route DELETE /api/products/:id
 * @access Private/Admin/Vendor
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Check if product exists and user has permission
      const productCheck = await client.query(
        'SELECT * FROM blinds.products WHERE id = $1',
        [id]
      );

      if (productCheck.rows.length === 0) {
        return next(
          new ErrorResponse(`Product with ID ${id} not found`, 404)
        );
      }

      // If user is not admin, verify they own the product
      if (req.user.role !== 'admin' && productCheck.rows[0].vendor_id !== req.user.id) {
        return next(
          new ErrorResponse('Not authorized to delete this product', 403)
        );
      }

      // Delete the product
      await client.query(
        products.deleteProductSQL,
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

/**
 * Get featured products
 * @route GET /api/products/featured
 * @access Public
 */
const getFeaturedProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const client = await pool.connect();

    try {
      const result = await client.query(`
        SELECT p.*, c.name as category_name
        FROM blinds.products p
        JOIN blinds.categories c ON p.category_id = c.id
        WHERE p.is_featured = true AND p.is_active = true
        ORDER BY p.created_at DESC
        LIMIT $1
      `, [limit]);

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
 * Get all products from vendors with listing enabled
 * @route GET /api/products/vendor-listings
 * @access Public
 */
const getVendorListingProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    // Build filters object
    const filters = {
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    const client = await pool.connect();

    try {
      // Build a query for vendor products with listing enabled
      const query = `
        SELECT vp.*, pt.name as category_name, u.name as vendor_name,
               (SELECT image_url FROM blinds.vendor_product_images
                WHERE product_id = vp.product_id AND is_primary = true LIMIT 1) as main_image
        FROM blinds.vendor_products vp
        JOIN blinds.product_types pt ON vp.type_id = pt.type_id
        JOIN blinds.users u ON vp.vendor_id = u.user_id
        JOIN blinds.vendor_info vi ON u.user_id = vi.user_id
        WHERE vp.is_listing_enabled = true
          AND u.is_listing_active = true
          AND vi.is_listing_active = true
      `;

      // Add filters if needed
      let queryWithFilters = query;
      const params = [];

      // Add category filter
      if (filters.category) {
        params.push(filters.category);
        queryWithFilters += ` AND pt.slug = $${params.length}`;
      }

      // Add search filter
      if (filters.search) {
        params.push(`%${filters.search}%`);
        queryWithFilters += ` AND (vp.name ILIKE $${params.length} OR vp.short_description ILIKE $${params.length})`;
      }

      // Add price filters
      if (filters.minPrice) {
        params.push(parseFloat(filters.minPrice));
        queryWithFilters += ` AND vp.base_price >= $${params.length}`;
      }

      if (filters.maxPrice) {
        params.push(parseFloat(filters.maxPrice));
        queryWithFilters += ` AND vp.base_price <= $${params.length}`;
      }

      // Add sorting
      if (filters.sort) {
        switch (filters.sort) {
          case 'price-asc':
            queryWithFilters += ' ORDER BY vp.base_price ASC';
            break;
          case 'price-desc':
            queryWithFilters += ' ORDER BY vp.base_price DESC';
            break;
          case 'newest':
            queryWithFilters += ' ORDER BY vp.created_at DESC';
            break;
          default:
            queryWithFilters += ' ORDER BY vp.created_at DESC';
        }
      } else {
        queryWithFilters += ' ORDER BY vp.created_at DESC';
      }

      // Add pagination
      if (filters.limit) {
        params.push(parseInt(filters.limit));
        queryWithFilters += ` LIMIT $${params.length}`;
      }

      if (filters.offset) {
        params.push(parseInt(filters.offset));
        queryWithFilters += ` OFFSET $${params.length}`;
      }

      // Get products with filters
      const productResult = await client.query(queryWithFilters, params);

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*)
        FROM blinds.vendor_products vp
        JOIN blinds.product_types pt ON vp.type_id = pt.type_id
        JOIN blinds.users u ON vp.vendor_id = user_id
        JOIN blinds.vendor_info vi ON user_id = vi.user_id
        WHERE vp.is_listing_enabled = true
          AND u.is_listing_active = true
          AND vi.is_listing_active = true
      `;

      const countResult = await client.query(countQuery);
      const totalCount = parseInt(countResult.rows[0].count);

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
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getVendorListingProducts  // Add the new function to exports
};

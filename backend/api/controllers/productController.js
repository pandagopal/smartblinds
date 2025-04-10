const { executeQuery, saveData } = require('../../utils/dataService');

/**
 * Get all products
 * @route GET /api/products
 * @access Public
 */
const getProducts = async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, sort } = req.query;

    // Build the PostgreSQL query
    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const params = [];

    // Add filters
    if (category) {
      params.push(category);
      query += ` AND c.slug = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.title ILIKE $${params.length} OR p.description ILIKE $${params.length})`;
    }

    if (minPrice) {
      params.push(parseFloat(minPrice));
      query += ` AND p.price >= $${params.length}`;
    }

    if (maxPrice) {
      params.push(parseFloat(maxPrice));
      query += ` AND p.price <= $${params.length}`;
    }

    // Add sorting
    if (sort) {
      switch (sort) {
        case 'price-asc':
          query += ' ORDER BY p.price ASC';
          break;
        case 'price-desc':
          query += ' ORDER BY p.price DESC';
          break;
        case 'rating':
          query += ' ORDER BY p.rating DESC';
          break;
        case 'newest':
          query += ' ORDER BY p.created_at DESC';
          break;
        default:
          query += ' ORDER BY p.title ASC';
      }
    } else {
      query += ' ORDER BY p.title ASC';
    }

    // Define a transform function for CSV data to match the query results
    const transformCsvData = (csvData) => {
      let filteredData = [...csvData];

      // Apply filters
      if (category) {
        const categorySlug = category.toLowerCase();
        filteredData = filteredData.filter(p =>
          p.category && p.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
        );
      }

      if (search) {
        const searchLower = search.toLowerCase();
        filteredData = filteredData.filter(p =>
          p.title.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }

      if (minPrice) {
        const min = parseFloat(minPrice);
        filteredData = filteredData.filter(p => p.price >= min);
      }

      if (maxPrice) {
        const max = parseFloat(maxPrice);
        filteredData = filteredData.filter(p => p.price <= max);
      }

      // Apply sorting
      if (sort) {
        switch (sort) {
          case 'price-asc':
            filteredData.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            filteredData.sort((a, b) => b.price - a.price);
            break;
          case 'rating':
            filteredData.sort((a, b) => b.rating - a.rating);
            break;
          default:
            filteredData.sort((a, b) => a.title.localeCompare(b.title));
        }
      } else {
        filteredData.sort((a, b) => a.title.localeCompare(b.title));
      }

      return filteredData;
    };

    // Execute the query with CSV fallback
    const products = await executeQuery(query, params, 'products', transformCsvData);

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
 * Get single product
 * @route GET /api/products/:id
 * @access Public
 */
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Build the PostgreSQL query
    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `;

    // Define a transform function for CSV data
    const transformCsvData = (csvData) => {
      const product = csvData.find(p => p.id === id);

      if (!product) {
        return null;
      }

      return product;
    };

    // Execute the query with CSV fallback
    const products = await executeQuery(query, [id], 'products', transformCsvData);

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`
      });
    }

    res.json({
      success: true,
      data: products[0]
    });
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

    // First, get the product to find its category
    const productQuery = `
      SELECT category_id FROM products WHERE id = $1
    `;

    // Define a transform function for finding the product in CSV
    const findProductInCsv = (csvData) => {
      const product = csvData.find(p => p.id === id);
      return product ? [{ category_id: product.categoryId }] : [];
    };

    // Get the product
    const products = await executeQuery(productQuery, [id], 'products', findProductInCsv);

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        error: `Product with ID ${id} not found`
      });
    }

    const categoryId = products[0].category_id;

    // Get related products query
    const relatedQuery = `
      SELECT p.*, c.name as category_name
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = $1 AND p.id != $2
      ORDER BY p.rating DESC
      LIMIT $3
    `;

    // Define a transform function for finding related products in CSV
    const findRelatedInCsv = (csvData) => {
      return csvData
        .filter(p => p.categoryId === categoryId && p.id !== id)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    };

    // Get related products
    const relatedProducts = await executeQuery(
      relatedQuery,
      [categoryId, id, limit],
      'products',
      findRelatedInCsv
    );

    res.json({
      success: true,
      count: relatedProducts.length,
      data: relatedProducts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new product
 * @route POST /api/products
 * @access Private/Admin
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      categoryId,
      price,
      image,
      features,
      inStock,
      colors
    } = req.body;

    // Validate required fields
    if (!title || !description || !categoryId || !price) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Generate a new ID - in a real app this would be handled by the database
    const newId = `product-${Date.now()}`;

    // Build the PostgreSQL query
    const query = `
      INSERT INTO products (
        id, title, description, category_id, price, image, features,
        in_stock, colors, rating, review_count
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
      ) RETURNING *
    `;

    const params = [
      newId,
      title,
      description,
      categoryId,
      price,
      image || '',
      JSON.stringify(features || []),
      inStock !== false,
      JSON.stringify(colors || []),
      0, // default rating
      0  // default review count
    ];

    // Prepare CSV data for backup
    const csvProduct = {
      id: newId,
      title,
      description,
      categoryId,
      price,
      image: image || '',
      features: JSON.stringify(features || []),
      inStock: inStock !== false,
      colors: JSON.stringify(colors || []),
      rating: 0,
      reviewCount: 0
    };

    // Read existing CSV data to append the new product
    const getCsvProducts = async () => {
      try {
        const products = await executeQuery('', [], 'products', data => data);
        return [...products, csvProduct];
      } catch (error) {
        return [csvProduct];
      }
    };

    // Save to PostgreSQL and CSV
    const result = await saveData(
      query,
      params,
      'products',
      await getCsvProducts()
    );

    res.status(201).json({
      success: true,
      data: result[0] || csvProduct
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  getRelatedProducts,
  createProduct
};

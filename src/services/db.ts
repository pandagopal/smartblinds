/**
 * Database Service Mock
 *
 * This service simulates a PostgreSQL database connection
 * Since we can't connect directly to PostgreSQL from the browser,
 * we're creating a mock implementation.
 *
 * In a real-world application, you would:
 * 1. Create a backend API using Node.js/Express
 * 2. Connect to PostgreSQL from there
 * 3. Create REST endpoints for the frontend to call
 */

import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { ProductFilterCriteria } from './api';

// Import the static data - we'll use this for now but structure the code
// so it can be easily replaced with real database calls later
import { SAMPLE_PRODUCTS } from '../models/Product';
import { SAMPLE_CATEGORIES } from '../models/Category';

// Product-related database operations
export const productQueries = {
  /**
   * Get all products
   */
  getAllProducts: async (): Promise<Product[]> => {
    // In a real application, this would be:
    // const response = await fetch('/api/products');
    // return await response.json();

    // For now, return the static data
    return Promise.resolve(SAMPLE_PRODUCTS);
  },

  /**
   * Get a product by ID
   */
  getProductById: async (id: string): Promise<Product> => {
    // In a real application, this would be:
    // const response = await fetch(`/api/products/${id}`);
    // return await response.json();

    // For now, find in static data
    const product = SAMPLE_PRODUCTS.find(p => p.id === id);

    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

    return Promise.resolve(product);
  },

  /**
   * Get related products
   */
  getRelatedProducts: async (productId: string, limit = 4): Promise<Product[]> => {
    // In a real application, this would be:
    // const response = await fetch(`/api/products/${productId}/related?limit=${limit}`);
    // return await response.json();

    // For now, simulate with static data
    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Filter products in the same category
    const related = SAMPLE_PRODUCTS
      .filter(p => p.id !== productId && p.categoryId === product.categoryId)
      .slice(0, limit);

    return Promise.resolve(related);
  },

  /**
   * Get product price (simulating database price matrix lookup)
   */
  getProductPrice: async (
    productId: string,
    width: number,
    height: number,
    options: Record<string, string>
  ): Promise<number> => {
    // In a real application, this would be:
    // const response = await fetch(`/api/products/${productId}/price`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ width, height, options })
    // });
    // const data = await response.json();
    // return data.price;

    // For now, simulate a price calculation
    const product = SAMPLE_PRODUCTS.find(p => p.id === productId);

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // Get base price
    let basePrice = product.basePrice || 79.99;

    // Apply size multiplier (simple calculation for demo)
    const sizeMultiplier = (width * height) / (24 * 36); // Using 24x36 as a base size
    basePrice = basePrice * Math.max(1, Math.min(2.5, sizeMultiplier));

    // Apply option modifiers
    if (options.color && options.color !== 'White') {
      basePrice += 5; // Non-white colors cost more
    }

    if (options.material && options.material === 'Premium') {
      basePrice += 15; // Premium material costs more
    }

    return Promise.resolve(basePrice);
  },

  /**
   * Filter products based on criteria
   */
  filterProducts: async (criteria: ProductFilterCriteria): Promise<Product[]> => {
    // In a real application, this would be:
    // const queryParams = new URLSearchParams();
    // Object.entries(criteria).forEach(([key, value]) => {
    //   if (value !== undefined && value !== null) {
    //     queryParams.append(key, String(value));
    //   }
    // });
    // const response = await fetch(`/api/products?${queryParams.toString()}`);
    // return await response.json();

    // For now, simulate filtering with static data
    let results = [...SAMPLE_PRODUCTS];

    // Filter by category ID
    if (criteria.categoryId) {
      results = results.filter(p => p.categoryId === criteria.categoryId);
    }

    // Filter by category slug
    if (criteria.categorySlug) {
      const category = SAMPLE_CATEGORIES.find(c => c.slug === criteria.categorySlug);
      if (category) {
        results = results.filter(p => p.categoryId === category.id);
      }
    }

    // Filter by search term
    if (criteria.search) {
      const searchLower = criteria.search.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by special deals
    if (criteria.special) {
      results = results.filter(p => p.special);
    }

    // Filter by in-stock status
    if (criteria.inStock) {
      results = results.filter(p => p.inStock !== false);
    }

    // Filter by min price
    if (criteria.minPrice !== undefined) {
      results = results.filter(p => (p.basePrice || 79.99) >= criteria.minPrice!);
    }

    // Filter by max price
    if (criteria.maxPrice !== undefined && criteria.maxPrice !== null) {
      results = results.filter(p => (p.basePrice || 79.99) <= criteria.maxPrice!);
    }

    // Sort results
    if (criteria.sortBy) {
      switch (criteria.sortBy) {
        case 'price-asc':
          results.sort((a, b) => (a.basePrice || 79.99) - (b.basePrice || 79.99));
          break;
        case 'price-desc':
          results.sort((a, b) => (b.basePrice || 79.99) - (a.basePrice || 79.99));
          break;
        case 'rating':
          results.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
        default:
          // Assume ID is correlated with newness in our sample data
          results.sort((a, b) => +b.id.split('-')[1] - +a.id.split('-')[1]);
          break;
      }
    }

    // Apply limit if specified
    if (criteria.limit !== undefined && criteria.limit > 0) {
      results = results.slice(0, criteria.limit);
    }

    return Promise.resolve(results);
  }
};

// Category-related database operations
export const categoryQueries = {
  /**
   * Get all categories
   */
  getAllCategories: async (): Promise<Category[]> => {
    // In a real application, this would be:
    // const response = await fetch('/api/categories');
    // return await response.json();

    // For now, return the static data
    return Promise.resolve(SAMPLE_CATEGORIES);
  },

  /**
   * Get a category by ID
   */
  getCategoryById: async (id: number): Promise<Category> => {
    // In a real application, this would be:
    // const response = await fetch(`/api/categories/${id}`);
    // return await response.json();

    // For now, find in static data
    const category = SAMPLE_CATEGORIES.find(c => c.id === id);

    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }

    return Promise.resolve(category);
  },

  /**
   * Get a category by slug
   */
  getCategoryBySlug: async (slug: string): Promise<Category> => {
    // In a real application, this would be:
    // const response = await fetch(`/api/categories/slug/${slug}`);
    // return await response.json();

    // For now, find in static data
    const category = SAMPLE_CATEGORIES.find(c => c.slug === slug);

    if (!category) {
      throw new Error(`Category with slug ${slug} not found`);
    }

    return Promise.resolve(category);
  }
};

export default {
  productQueries,
  categoryQueries
};

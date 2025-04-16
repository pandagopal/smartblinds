/**
 * Database Service - PostgreSQL Connector
 *
 * This service provides an interface for accessing data from the PostgreSQL database
 * through the backend API. No static/fallback data is used.
 */

import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { ProductFilterCriteria } from './api';
import { api } from './api';

// Export interfaces so they can be used by the API
export interface ProductFilterCriteria {
  categoryId?: number;
  categorySlug?: string;
  search?: string;
  special?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  limit?: number;
}

/**
 * Direct Database Connection Service
 *
 * This service directly connects to the PostgreSQL database via the API
 * instead of using static data or fallback mechanisms.
 */
export const dbService = {
  /**
   * Checks if the database connection is available
   */
  checkConnection: async (): Promise<boolean> => {
    try {
      // Try to fetch a simple resource to check connection
      await fetch('/api/status');
      return true;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  },

  /**
   * Custom SQL query executor - Admin only
   * Allows running raw SQL queries against the database (admin only)
   */
  executeQuery: async (query: string, params: any[] = []): Promise<any> => {
    try {
      const response = await fetch('/api/admin/execute-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, params }),
      });

      if (!response.ok) {
        throw new Error(`Database query failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing database query:', error);
      throw error;
    }
  },

  // Product-related database operations
  productQueries: {
    /**
     * Get all products
     */
    getAllProducts: async (): Promise<Product[]> => {
      const response = await fetch('/api/products');
      return await response.json();
    },

    /**
     * Get a product by ID
     */
    getProductById: async (id: string): Promise<Product> => {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) {
        throw new Error(`Product with ID ${id} not found`);
      }
      return await response.json();
    },

    /**
     * Get related products
     */
    getRelatedProducts: async (productId: string, limit = 4): Promise<Product[]> => {
      const response = await fetch(`/api/products/${productId}/related?limit=${limit}`);
      return await response.json();
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
      const response = await fetch(`/api/products/${productId}/price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ width, height, options })
      });
      const data = await response.json();
      return data.price;
    },

    /**
     * Filter products based on criteria
     */
    filterProducts: async (criteria: ProductFilterCriteria): Promise<Product[]> => {
      const queryParams = new URLSearchParams();
      Object.entries(criteria).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      const response = await fetch(`/api/products?${queryParams.toString()}`);
      return await response.json();
    }
  },

  // Category-related database operations
  categoryQueries: {
    /**
     * Get all categories
     */
    getAllCategories: async (): Promise<Category[]> => {
      const response = await fetch('/api/categories');
      return await response.json();
    },

    /**
     * Get a category by ID
     */
    getCategoryById: async (id: number): Promise<Category> => {
      const response = await fetch(`/api/categories/${id}`);
      if (!response.ok) {
        throw new Error(`Category with ID ${id} not found`);
      }
      return await response.json();
    },

    /**
     * Get a category by slug
     */
    getCategoryBySlug: async (slug: string): Promise<Category> => {
      const response = await fetch(`/api/categories/slug/${slug}`);
      if (!response.ok) {
        throw new Error(`Category with slug ${slug} not found`);
      }
      return await response.json();
    }
  }
};

export default dbService;

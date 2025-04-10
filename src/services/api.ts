import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { ProductFilterCriteria } from './db';

// API base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Fallback to static data if API call fails
import { productQueries, categoryQueries } from './db';

/**
 * Generic API call function with error handling and fallback
 * @param endpoint - API endpoint to call
 * @param options - Fetch options
 * @param fallbackFn - Function to call if API fails
 * @returns API response data
 */
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackFn: () => Promise<T>
): Promise<T> => {
  try {
    // Add default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Make the API call
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data as T;
  } catch (error) {
    // Log the error
    console.error(`API call failed: ${endpoint}`, error);
    console.log('Falling back to static data');

    // Fall back to static data
    return fallbackFn();
  }
};

/**
 * Fetches all products from the API with fallback to static data
 */
export const getProducts = async (): Promise<Product[]> => {
  return apiCall<Product[]>(
    '/products',
    {},
    productQueries.getAllProducts
  );
};

/**
 * Fetches a product by ID from the API with fallback to static data
 */
export const fetchProductById = async (id: string): Promise<Product> => {
  return apiCall<Product>(
    `/products/${id}`,
    {},
    async () => {
      try {
        return await productQueries.getProductById(id);
      } catch (error) {
        throw new Error(`Product with ID ${id} not found`);
      }
    }
  );
};

/**
 * Fetches related products from the API with fallback to static data
 */
export const fetchRelatedProducts = async (productId: string, limit = 4): Promise<Product[]> => {
  return apiCall<Product[]>(
    `/products/${productId}/related?limit=${limit}`,
    {},
    async () => productQueries.getRelatedProducts(productId, limit)
  );
};

/**
 * Fetches all categories from the API with fallback to static data
 */
export const getCategories = async (): Promise<Category[]> => {
  return apiCall<Category[]>(
    '/categories',
    {},
    categoryQueries.getAllCategories
  );
};

/**
 * Fetches a category by ID from the API with fallback to static data
 */
export const fetchCategoryById = async (id: number): Promise<Category> => {
  return apiCall<Category>(
    `/categories/${id}`,
    {},
    async () => categoryQueries.getCategoryById(id)
  );
};

/**
 * Fetches a category by slug from the API with fallback to static data
 */
export const fetchCategoryBySlug = async (slug: string): Promise<Category> => {
  return apiCall<Category>(
    `/categories/${slug}`,
    {},
    async () => categoryQueries.getCategoryBySlug(slug)
  );
};

/**
 * Fetches products by category slug from the API with fallback to static data
 */
export async function fetchProductsByCategory(categorySlug?: string): Promise<Product[]> {
  if (!categorySlug) {
    return getProducts();
  }

  return apiCall<Product[]>(
    `/categories/${categorySlug}/products`,
    {},
    async () => {
      // Convert slug to ID (simplified - in a real app this would use a proper slug lookup)
      const product = await productQueries.filterProducts({ categorySlug });
      return product;
    }
  );
}

/**
 * Fetches product price from the API with fallback to static data
 */
export const fetchProductPrice = async (
  productId: string,
  width: number,
  height: number,
  options: Record<string, string>
): Promise<{ price: number }> => {
  // For price calculation, we'll make a POST to the API
  return apiCall<{ price: number }>(
    `/products/${productId}/price`,
    {
      method: 'POST',
      body: JSON.stringify({ width, height, options })
    },
    async () => {
      // Fallback to simple calculation
      const product = await fetchProductById(productId);
      const basePrice = product.basePrice || 79.99;

      // Square footage
      const squareFeet = (width * height) / 144; // Convert to square feet
      let price = Math.max(basePrice, squareFeet * 15); // $15 per square foot

      // Apply options
      if (options['Control Type'] === 'Motorized') {
        price += 50;
      } else if (options['Control Type'] === 'Cordless') {
        price += 20;
      }

      if (options['Opacity'] === 'Blackout') {
        price += 15;
      }

      // Round to 2 decimal places
      price = Math.round(price * 100) / 100;

      return { price };
    }
  );
};

/**
 * Fetches product configurator options from the API with fallback to static data
 */
export async function fetchProductConfiguratorOptions(): Promise<{
  colors: Array<{ id: string, name: string, value: string }>,
  slatSizes: Array<{ id: string, name: string, value: number }>,
  mountTypes: Array<{ id: string, name: string }>,
  controlTypes: Array<{ id: string, name: string, priceFactor?: number }>,
  headrailTypes: Array<{ id: string, name: string, priceFactor?: number }>
}> {
  return apiCall<any>(
    '/products/configurator-options',
    {},
    async () => {
      // Return mock data for now - in a real app this would come from the backend
      return {
        colors: [
          { id: 'white', name: 'Snow White', value: '#ffffff' },
          { id: 'cream', name: 'Cream', value: '#F5F5DC' },
          { id: 'gray', name: 'Pearl Gray', value: '#D3D3D3' },
          { id: 'tan', name: 'Tan', value: '#D2B48C' },
          { id: 'brown', name: 'Chestnut Brown', value: '#8B4513' },
          { id: 'black', name: 'Matte Black', value: '#000000' },
        ],
        slatSizes: [
          { id: '2inch', name: '2 inch', value: 2 },
          { id: '2.5inch', name: '2.5 inch', value: 2.5 },
        ],
        mountTypes: [
          { id: 'inside', name: 'Inside Mount' },
          { id: 'outside', name: 'Outside Mount' },
        ],
        controlTypes: [
          { id: 'standard', name: 'Standard Cord' },
          { id: 'cordless', name: 'Cordless', priceFactor: 1.25 },
          { id: 'motorized', name: 'Motorized', priceFactor: 1.75 },
        ],
        headrailTypes: [
          { id: 'standard', name: 'Standard Valance' },
          { id: 'deluxe', name: 'Deluxe Valance', priceFactor: 1.15 },
        ],
      };
    }
  );
}

/**
 * Filters products based on criteria from the API with fallback to static data
 */
export const filterProducts = async (criteria: ProductFilterCriteria = {}): Promise<Product[]> => {
  // Build query string from criteria
  const queryParams = new URLSearchParams();

  Object.entries(criteria).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/products?${queryString}` : '/products';

  return apiCall<Product[]>(
    endpoint,
    {},
    async () => productQueries.filterProducts(criteria)
  );
};

/**
 * Create a new product - Admin only
 */
export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  return apiCall<Product>(
    '/products',
    {
      method: 'POST',
      body: JSON.stringify(productData)
    },
    async () => {
      throw new Error('Create product is not supported in fallback mode');
    }
  );
};

/**
 * Create a new category - Admin only
 */
export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  return apiCall<Category>(
    '/categories',
    {
      method: 'POST',
      body: JSON.stringify(categoryData)
    },
    async () => {
      throw new Error('Create category is not supported in fallback mode');
    }
  );
};

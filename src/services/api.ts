import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { ProductFilterCriteria } from './db';
import cacheService from './cacheService';
import analyticsService from './analyticsService';

// API base URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Base API URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Cache durations for different types of data
const CACHE_DURATIONS = {
  PRODUCTS: 5 * 60 * 1000, // 5 minutes
  CATEGORIES: 10 * 60 * 1000, // 10 minutes
  PRODUCT_DETAILS: 3 * 60 * 1000, // 3 minutes
  CONFIG_OPTIONS: 30 * 60 * 1000, // 30 minutes
  SEARCH_RESULTS: 2 * 60 * 1000, // 2 minutes
};

// Generic fetch function with error handling, caching, and analytics
const fetchFromAPI = async (endpoint: string, options: RequestInit = {}, cacheOptions?: { maxAge?: number, force?: boolean }) => {
  const startTime = performance.now();
  const method = options.method || 'GET';

  try {
    console.log(`Fetching from API: ${BASE_URL}${endpoint}`);

    // Use the cacheService for GET requests
    if (method === 'GET') {
      const result = await cacheService.cachedFetch(
        `${BASE_URL}${endpoint}`,
        {
          ...options,
          maxAge: cacheOptions?.maxAge,
          force: cacheOptions?.force
        }
      );

      const duration = performance.now() - startTime;
      analyticsService.trackApiRequest(endpoint, method, duration);
      return result;
    } else {
      // For non-GET requests, use normal fetch (no caching)
      const response = await fetch(`${BASE_URL}${endpoint}`, options);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'An unknown error occurred'
        }));

        throw new Error(errorData.message || `API Error: ${response.status}`);
      }

      const result = await response.json();
      const duration = performance.now() - startTime;
      analyticsService.trackApiRequest(endpoint, method, duration);
      return result;
    }
  } catch (error) {
    const duration = performance.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    analyticsService.trackApiRequest(endpoint, method, duration, 500, errorMessage);
    analyticsService.trackDatabaseError({
      operation: 'fetch',
      endpoint,
      errorMessage,
      timestamp: Date.now()
    });

    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Generic API call function with error handling
 * @param endpoint - API endpoint to call
 * @param options - Fetch options
 * @returns API response data
 */
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
  cacheOptions?: { maxAge?: number, force?: boolean }
): Promise<T> => {
  try {
    // Add default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Make the API call with caching for GET requests
    const method = options.method || 'GET';
    const startTime = performance.now();

    // Use the cacheService for GET requests
    let response;
    if (method === 'GET') {
      response = await cacheService.cachedFetch<{ data: T }>(
        `${API_BASE_URL}${endpoint}`,
        {
          ...options,
          headers,
          maxAge: cacheOptions?.maxAge,
          force: cacheOptions?.force
        }
      );
    } else {
      // For non-GET requests, use normal fetch
      const fetchResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (!fetchResponse.ok) {
        throw new Error(`API error: ${fetchResponse.status}`);
      }

      response = await fetchResponse.json();
    }

    const duration = performance.now() - startTime;
    analyticsService.trackApiRequest(endpoint, method, duration);

    return response.data as T;
  } catch (error) {
    // Log the error and rethrow
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    analyticsService.trackDatabaseError({
      operation: 'apiCall',
      endpoint,
      errorMessage,
      timestamp: Date.now()
    });

    console.error(`API call failed: ${endpoint}`, error);
    throw error;
  }
};

/**
 * Fetches all products from the API
 */
export const getProducts = async (): Promise<Product[]> => {
  const result = await fetchFromAPI('/products', {}, { maxAge: CACHE_DURATIONS.PRODUCTS });
  return result.data || [];
};

/**
 * Fetches a product by ID from the API
 */
export const fetchProductById = async (id: string): Promise<Product> => {
  const result = await fetchFromAPI(`/products/${id}`, {}, { maxAge: CACHE_DURATIONS.PRODUCT_DETAILS });
  if (!result.data) {
    throw new Error(`Product with ID ${id} not found`);
  }
  return result.data;
};

/**
 * Fetches related products from the API
 */
export const fetchRelatedProducts = async (productId: string, limit = 4): Promise<Product[]> => {
  const result = await fetchFromAPI(`/products/${productId}/related?limit=${limit}`, {}, { maxAge: CACHE_DURATIONS.PRODUCTS });
  return result.data || [];
};

/**
 * Fetches all categories from the API
 */
export const getCategories = async (): Promise<Category[]> => {
  const result = await fetchFromAPI('/categories', {}, { maxAge: CACHE_DURATIONS.CATEGORIES });
  return result.data || [];
};

/**
 * Fetches a category by ID from the API
 */
export const fetchCategoryById = async (id: number): Promise<Category> => {
  const result = await fetchFromAPI(`/categories/${id}`, {}, { maxAge: CACHE_DURATIONS.CATEGORIES });
  if (!result.data) {
    throw new Error(`Category with ID ${id} not found`);
  }
  return result.data;
};

/**
 * Fetches a category by slug from the API
 */
export const fetchCategoryBySlug = async (slug: string): Promise<Category> => {
  const result = await fetchFromAPI(`/categories/slug/${slug}`, {}, { maxAge: CACHE_DURATIONS.CATEGORIES });
  if (!result.data) {
    throw new Error(`Category with slug ${slug} not found`);
  }
  return result.data;
};

/**
 * Fetches products by category slug from the API
 */
export async function fetchProductsByCategory(categorySlug?: string): Promise<Product[]> {
  if (!categorySlug) {
    return getProducts();
  }

  console.log(`Fetching products for category: ${categorySlug}`);
  const result = await fetchFromAPI(`/categories/${categorySlug}/products`, {}, { maxAge: CACHE_DURATIONS.PRODUCTS });
  return result.data || [];
}

/**
 * Fetches product price from the API
 */
export const fetchProductPrice = async (
  productId: string,
  width: number,
  height: number,
  options: Record<string, string>
): Promise<{ price: number }> => {
  // Don't cache price calculations - always get fresh data
  const result = await fetchFromAPI(`/products/${productId}/price`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ width, height, options })
  });

  if (!result.data) {
    throw new Error(`Could not calculate price for product ${productId}`);
  }

  return { price: result.data.price };
};

/**
 * Fetches product configurator options from the API
 */
export async function fetchProductConfiguratorOptions(): Promise<{
  colors: Array<{ id: string, name: string, value: string }>,
  slatSizes: Array<{ id: string, name: string, value: number }>,
  mountTypes: Array<{ id: string, name: string }>,
  controlTypes: Array<{ id: string, name: string, priceFactor?: number }>,
  headrailTypes: Array<{ id: string, name: string, priceFactor?: number }>
}> {
  // Cache configurator options for longer since they rarely change
  const result = await fetchFromAPI('/products/configurator-options', {}, { maxAge: CACHE_DURATIONS.CONFIG_OPTIONS });
  return result.data || {
    colors: [],
    slatSizes: [],
    mountTypes: [],
    controlTypes: [],
    headrailTypes: []
  };
}

/**
 * Filters products based on criteria from the API
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

  // Use shorter cache duration for search results
  const result = await fetchFromAPI(endpoint, {}, { maxAge: CACHE_DURATIONS.SEARCH_RESULTS });
  return result.data || [];
};

/**
 * Create a new product - Admin only
 */
export const createProduct = async (productData: Partial<Product>): Promise<Product> => {
  const result = await fetchFromAPI('/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData)
  });

  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to create product');
  }

  // Invalidate products cache after creating a new product
  cacheService.clearCache(/\/products/);

  return result.data;
};

/**
 * Create a new category - Admin only
 */
export const createCategory = async (categoryData: Partial<Category>): Promise<Category> => {
  const result = await fetchFromAPI('/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(categoryData)
  });

  if (!result.success || !result.data) {
    throw new Error(result.message || 'Failed to create category');
  }

  // Invalidate categories cache after creating a new category
  cacheService.clearCache(/\/categories/);

  return result.data;
};

// Helper function to build query string from filters
function buildQueryString(filters: Record<string, any>): string {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Fetches all products from vendors with listing enabled
 */
export const fetchVendorListingProducts = async (filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<Product[]> => {
  const result = await fetchFromAPI(`/products/vendor-listings${filters ? buildQueryString(filters) : ''}`, {}, { maxAge: CACHE_DURATIONS.PRODUCTS });
  return result.data || [];
};

// API methods for different endpoints
export const api = {
  // Product related API calls
  products: {
    getAll: async () => {
      console.log("Getting all products from database");
      try {
        const products = await getProducts();
        console.log(`Retrieved ${products.length} products from database`);
        return products;
      } catch (error) {
        console.error("Error fetching products from database:", error);
        throw error;
      }
    },
    getById: async (id: string) => {
      console.log(`Getting product ${id} from database`);
      try {
        const product = await fetchProductById(id);
        console.log(`Retrieved product ${id} from database`);
        return product;
      } catch (error) {
        console.error(`Error fetching product ${id} from database:`, error);
        throw error;
      }
    },
    getRelated: async (productId: string, limit = 4) => {
      console.log(`Getting related products for ${productId} from database`);
      try {
        const products = await fetchRelatedProducts(productId, limit);
        console.log(`Retrieved ${products.length} related products from database`);
        return products;
      } catch (error) {
        console.error(`Error fetching related products for ${productId} from database:`, error);
        throw error;
      }
    },
    getByCategory: async (slug: string) => {
      console.log(`Getting products for category ${slug} from database`);
      try {
        const products = await fetchProductsByCategory(slug);
        console.log(`Retrieved ${products.length} products for category ${slug} from database`);
        return products;
      } catch (error) {
        console.error(`Error fetching products for category ${slug} from database:`, error);
        throw error;
      }
    },
    getPrice: fetchProductPrice,
    getVendorListings: fetchVendorListingProducts,
    getConfiguratorOptions: fetchProductConfiguratorOptions
  },

  // Category related API calls
  categories: {
    getAll: async () => {
      console.log("Getting all categories from database");
      try {
        const categories = await getCategories();
        console.log(`Retrieved ${categories.length} categories from database`);
        return categories;
      } catch (error) {
        console.error("Error fetching categories from database:", error);
        throw error;
      }
    },
    getById: async (id: number) => {
      console.log(`Getting category ${id} from database`);
      try {
        const category = await fetchCategoryById(id);
        console.log(`Retrieved category ${id} from database`);
        return category;
      } catch (error) {
        console.error(`Error fetching category ${id} from database:`, error);
        throw error;
      }
    },
    getBySlug: async (slug: string) => {
      console.log(`Getting category ${slug} from database`);
      try {
        const category = await fetchCategoryBySlug(slug);
        console.log(`Retrieved category ${slug} from database`);
        return category;
      } catch (error) {
        console.error(`Error fetching category ${slug} from database:`, error);
        throw error;
      }
    }
  },

  // Cache management
  cache: {
    clearProductCache: () => cacheService.clearCache(/\/products/),
    clearCategoryCache: () => cacheService.clearCache(/\/categories/),
    clearAllCache: () => cacheService.clearCache(),
    getCacheStats: () => cacheService.getCacheStats()
  },

  // User authentication
  auth: {
    login: (credentials: any) =>
      fetchFromAPI('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      }),
    register: (userData: any) =>
      fetchFromAPI('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      }),
    logout: () => fetchFromAPI('/auth/logout'),
    socialLogin: (data: any) =>
      fetchFromAPI('/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
  },

  // Cart operations
  cart: {
    get: () => fetchFromAPI('/cart'),
    add: (item: any) =>
      fetchFromAPI('/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      }),
    update: (id: string, data: any) =>
      fetchFromAPI(`/cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }),
    remove: (id: string) =>
      fetchFromAPI(`/cart/${id}`, {
        method: 'DELETE'
      }),
  },
};

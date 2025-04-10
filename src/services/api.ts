import { Product, SAMPLE_PRODUCTS } from '../models/Product';
import { Category } from '../models/Category';
import { productQueries, categoryQueries } from './db';

// Simulate API response delay for consistency with previous implementation
const SIMULATED_DELAY_MS = 300;

/**
 * Filter criteria for products
 */
export interface ProductFilterCriteria {
  categoryId?: number;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number | null;
  search?: string;
  special?: boolean;
  inStock?: boolean;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'rating';
  limit?: number;
}

/**
 * Basic simulation of an API call with delay
 */
const simulateApiCall = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), SIMULATED_DELAY_MS);
  });
};

/**
 * Fetches all products from the database
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    const products = await productQueries.getAllProducts();
    return simulateApiCall(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Fetches a product by ID from the database
 */
export const fetchProductById = async (id: string): Promise<Product> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Find product by ID
  const product = SAMPLE_PRODUCTS.find(p => p.id === id);
  if (!product) {
    throw new Error(`Product with ID ${id} not found`);
  }

  return product;
};

/**
 * Fetches related products from the database
 */
export const fetchRelatedProducts = async (productId: string, limit = 4): Promise<Product[]> => {
  try {
    const relatedProducts = await productQueries.getRelatedProducts(productId, limit);
    return simulateApiCall(relatedProducts);
  } catch (error) {
    console.error(`Error fetching related products for ${productId}:`, error);
    throw error;
  }
};

/**
 * Fetches all categories from the database
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const categories = await categoryQueries.getAllCategories();
    return simulateApiCall(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Fetches a category by ID from the database
 */
export const fetchCategoryById = async (id: number): Promise<Category> => {
  try {
    const category = await categoryQueries.getCategoryById(id);
    return simulateApiCall(category);
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetches a category by slug from the database
 */
export const fetchCategoryBySlug = async (slug: string): Promise<Category> => {
  try {
    const category = await categoryQueries.getCategoryBySlug(slug);
    return simulateApiCall(category);
  } catch (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    throw error;
  }
};

/**
 * Fetches products by category slug
 */
export async function fetchProductsByCategory(categorySlug?: string): Promise<Product[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  if (!categorySlug) {
    return SAMPLE_PRODUCTS;
  }

  // Convert slug to ID (simplified - in a real app this would use a proper slug lookup)
  const categoryId = SAMPLE_PRODUCTS.find(p =>
    p.category.toLowerCase().replace(/\s+/g, '-') === categorySlug
  )?.categoryId;

  if (!categoryId) {
    return [];
  }

  return SAMPLE_PRODUCTS.filter(p => p.categoryId === categoryId);
}

/**
 * Fetches product price based on dimensions and options from the database
 */
export const fetchProductPrice = async (
  productId: string,
  width: number,
  height: number,
  options: Record<string, string>
): Promise<{ price: number }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Find product
  const product = await fetchProductById(productId);

  // Base price calculation (simple formula based on size)
  const basePrice = product.basePrice || 79.99;

  // Square footage
  const squareFeet = (width * height) / 144; // Convert to square feet
  let price = Math.max(basePrice, squareFeet * 15); // $15 per square foot, with minimum base price

  // Apply options
  if (options['Control Type'] === 'Motorized') {
    price += 50;
  } else if (options['Control Type'] === 'Cordless') {
    price += 20;
  }

  if (options['Opacity'] === 'Blackout') {
    price += 15;
  }

  if (options['Mount Type'] === 'Outside Mount') {
    price += 5;
  }

  if (options['Slat Size'] === '2.5 inch') {
    price += price * 0.15; // 15% markup for larger slats
  }

  // Round to 2 decimal places
  price = Math.round(price * 100) / 100;

  return { price };
};

/**
 * Fetches product configurator options
 */
export async function fetchProductConfiguratorOptions(): Promise<{
  colors: Array<{ id: string, name: string, value: string }>,
  slatSizes: Array<{ id: string, name: string, value: number }>,
  mountTypes: Array<{ id: string, name: string }>,
  controlTypes: Array<{ id: string, name: string, priceFactor?: number }>,
  headrailTypes: Array<{ id: string, name: string, priceFactor?: number }>
}> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));

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

/**
 * Filters products based on criteria using the database
 */
export const filterProducts = async (criteria: ProductFilterCriteria = {}): Promise<Product[]> => {
  try {
    const filteredProducts = await productQueries.filterProducts(criteria);
    return simulateApiCall(filteredProducts);
  } catch (error) {
    console.error('Error filtering products:', error);
    throw error;
  }
};

// Product model and types
export interface ProductOption {
  name: string;
  values: string[];
  selectedValue: string;
}

export interface ProductSpec {
  name: string;
  value: string;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
}

export interface ProductAttributes {
  color?: string;
  material?: string;
  opacity?: string;
  style?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  cordless?: boolean;
  motorized?: boolean;
  roomDarkening?: boolean;
  energyEfficient?: boolean;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  image: string;
  additionalImages?: string[];
  category: string;
  categoryId: number;
  features: string[];
  specs: ProductSpec[];
  options: ProductOption[];
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  special: boolean;
  price?: number;
  salePrice?: number;
  basePrice?: number;
  inStock?: boolean;
  createdAt?: string;
  attributes?: ProductAttributes;
}

export function getProductBasePrice(product: Product): number {
  // Simplified pricing logic
  return product.basePrice || 79.99;
}

export function getProductPrice(product: Product, width?: number, height?: number, options?: Record<string, string>): number {
  const basePrice = getProductBasePrice(product);
  // Apply any size multipliers
  let price = basePrice;

  if (width && height) {
    // Simple size-based pricing - larger sizes cost more
    const sizeMultiplier = (width * height) / (24 * 36); // Base size is 24x36
    price = price * Math.max(1, sizeMultiplier);
  }

  // Apply options pricing adjustments
  if (options) {
    // Premium options like motorized controls add to the price
    if (options['Control Type'] === 'Motorized') {
      price += 50;
    } else if (options['Control Type'] === 'Cordless') {
      price += 20;
    }

    // Blackout material costs more
    if (options['Opacity'] === 'Blackout') {
      price += 15;
    }
  }

  return Math.round(price * 100) / 100;
}

// Add product attributes for filtering purposes
export function addProductAttributes(product: Product): Product {
  // This is a helper function that can be used to ensure products have attribute data
  if (!product.attributes) {
    // If no attributes, create default ones based on product properties
    const attributes: ProductAttributes = {};

    // Check product title/description for common attributes
    const title = product.title.toLowerCase();
    const description = product.description?.toLowerCase() || '';

    // Determine material
    if (title.includes('wood') || description.includes('wood')) {
      attributes.material = 'Wood';
    } else if (title.includes('faux') || description.includes('faux')) {
      attributes.material = 'Faux Wood';
    } else if (title.includes('fabric') || description.includes('fabric')) {
      attributes.material = 'Fabric';
    } else if (title.includes('vinyl') || description.includes('vinyl')) {
      attributes.material = 'Vinyl';
    } else if (title.includes('bamboo') || description.includes('bamboo')) {
      attributes.material = 'Bamboo';
    }

    // Determine opacity
    if (title.includes('blackout') || description.includes('blackout')) {
      attributes.opacity = 'Blackout';
    } else if (title.includes('room darkening') || description.includes('room darkening')) {
      attributes.opacity = 'Room Darkening';
    } else if (title.includes('light filtering') || description.includes('light filtering')) {
      attributes.opacity = 'Light Filtering';
    } else if (title.includes('sheer') || description.includes('sheer')) {
      attributes.opacity = 'Sheer';
    }

    // Determine features
    if (title.includes('cordless') || description.includes('cordless')) {
      attributes.cordless = true;
    }

    if (title.includes('motorized') || description.includes('motorized')) {
      attributes.motorized = true;
    }

    if (title.includes('energy') || description.includes('energy')) {
      attributes.energyEfficient = true;
    }

    return {
      ...product,
      attributes
    };
  }

  return product;
}

// Export an empty array as a placeholder for actual product data
export const SAMPLE_PRODUCTS: Product[] = [];

// Helper to format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
}

// Filter functions for product searching/filtering
export function filterProductsByCategory(products: Product[], categoryId?: number): Product[] {
  if (!categoryId) return products;
  return products.filter(product => product.categoryId === categoryId);
}

export function filterProductsByPrice(products: Product[], minPrice?: number, maxPrice?: number): Product[] {
  let filtered = [...products];

  if (minPrice !== undefined) {
    filtered = filtered.filter(product => {
      const price = product.salePrice || product.price || product.basePrice || 0;
      return price >= minPrice;
    });
  }

  if (maxPrice !== undefined) {
    filtered = filtered.filter(product => {
      const price = product.salePrice || product.price || product.basePrice || 0;
      return price <= maxPrice;
    });
  }

  return filtered;
}

export function filterProductsByAttributes(
  products: Product[],
  attributes: Partial<ProductAttributes>
): Product[] {
  if (!attributes || Object.keys(attributes).length === 0) return products;

  return products.filter(product => {
    // Ensure product has attributes
    const productWithAttrs = addProductAttributes(product);
    const productAttrs = productWithAttrs.attributes || {};

    // Check each attribute
    for (const [key, value] of Object.entries(attributes)) {
      // Skip undefined attribute values
      if (value === undefined) continue;

      // If product doesn't have this attribute or it doesn't match, filter it out
      if (productAttrs[key as keyof ProductAttributes] !== value) {
        return false;
      }
    }

    return true;
  });
}

// Sort products by different criteria
export function sortProducts(
  products: Product[],
  sortBy: 'price-asc' | 'price-desc' | 'newest' | 'rating' | 'popularity'
): Product[] {
  const sortedProducts = [...products];

  switch (sortBy) {
    case 'price-asc':
      return sortedProducts.sort((a, b) => {
        const priceA = a.salePrice || a.price || a.basePrice || 0;
        const priceB = b.salePrice || b.price || b.basePrice || 0;
        return priceA - priceB;
      });

    case 'price-desc':
      return sortedProducts.sort((a, b) => {
        const priceA = a.salePrice || a.price || a.basePrice || 0;
        const priceB = b.salePrice || b.price || b.basePrice || 0;
        return priceB - priceA;
      });

    case 'newest':
      return sortedProducts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

    case 'rating':
      return sortedProducts.sort((a, b) => b.rating - a.rating);

    case 'popularity':
      return sortedProducts.sort((a, b) => b.reviewCount - a.reviewCount);

    default:
      return sortedProducts;
  }
}

// Search products by keyword
export function searchProducts(products: Product[], keyword: string): Product[] {
  if (!keyword || keyword.trim() === '') return products;

  const searchTerm = keyword.toLowerCase().trim();

  return products.filter(product => {
    const title = product.title.toLowerCase();
    const description = product.description?.toLowerCase() || '';
    const category = product.category?.toLowerCase() || '';

    // Check if search term is in any of the main product fields
    return (
      title.includes(searchTerm) ||
      description.includes(searchTerm) ||
      category.includes(searchTerm) ||
      product.features?.some(feature => feature.toLowerCase().includes(searchTerm)) ||
      product.specs?.some(spec =>
        spec.name.toLowerCase().includes(searchTerm) ||
        spec.value.toLowerCase().includes(searchTerm)
      )
    );
  });
}

// Calculate product ratings
export function calculateAverageRating(reviews: ProductReview[]): number {
  if (!reviews || reviews.length === 0) return 0;

  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place
}

// Generate product recommendations
export function getRelatedProducts(product: Product, allProducts: Product[], limit = 4): Product[] {
  if (!product || !allProducts || allProducts.length === 0) return [];

  // Get products in the same category
  const sameCategory = allProducts.filter(p =>
    p.id !== product.id && p.categoryId === product.categoryId
  );

  // If we have enough in the same category, return those
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }

  // Otherwise, add some other popular products
  const otherProducts = allProducts.filter(p =>
    p.id !== product.id && p.categoryId !== product.categoryId
  ).sort((a, b) => b.rating - a.rating);

  return [...sameCategory, ...otherProducts].slice(0, limit);
}

// Helper to determine if a product is on sale
export function isProductOnSale(product: Product): boolean {
  return Boolean(
    product.salePrice &&
    product.basePrice &&
    product.salePrice < product.basePrice
  );
}

// Calculate discount percentage
export function calculateDiscountPercentage(product: Product): number {
  if (!isProductOnSale(product) || !product.basePrice || !product.salePrice) {
    return 0;
  }

  return Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100);
}

// Check if product is in stock
export function isProductInStock(product: Product): boolean {
  return product.inStock !== false; // Consider true by default unless explicitly false
}

// Format dimensions for display
export function formatDimensions(width?: number, height?: number): string {
  if (!width && !height) return '';
  if (width && !height) return `${width}"`;
  if (!width && height) return `${height}"`;
  return `${width}" × ${height}"`;
}

// Convert product to URL-friendly string for sharing
export function getProductShareUrl(product: Product, baseUrl: string): string {
  const slug = product.title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-'); // Replace multiple hyphens with single hyphen

  return `${baseUrl}/product/${product.id}/${slug}`;
}

// Get limited description for preview
export function getProductPreviewDescription(product: Product, maxLength = 120): string {
  if (!product.description) return '';

  if (product.description.length <= maxLength) {
    return product.description;
  }

  // Find the last space before maxLength
  const lastSpace = product.description.substring(0, maxLength).lastIndexOf(' ');
  return product.description.substring(0, lastSpace) + '...';
}

// Extract color from product data
export function getProductColorOptions(product: Product): string[] {
  const colorOption = product.options?.find(opt => opt.name.toLowerCase() === 'color');
  return colorOption?.values || [];
}

// Get specific product option value
export function getProductOptionValue(product: Product, optionName: string): string | undefined {
  const option = product.options?.find(opt =>
    opt.name.toLowerCase() === optionName.toLowerCase()
  );
  return option?.selectedValue;
}

export interface CartItemOption {
  name: string;
  value: string;
}

export interface CartItem {
  id: string;  // Unique identifier for this cart item
  productId: string; // Changed to string
  title: string;
  price: number;
  image: string;
  quantity: number;
  width?: number;  // Optional dimensions (for custom sized products)
  height?: number;
  options: Record<string, string>;  // Option name -> selected value map
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  shippingAmount: number;
  total: number;
}

export interface SavedCart {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  items: CartItem[];
  notes?: string;
}

/**
 * Generate a unique ID for a cart item based on product ID, dimensions, and options
 */
export function generateCartItemId(
  productId: string, // Changed to string
  width?: number,
  height?: number,
  options: Record<string, string> = {}
): string {
  // Create a key from the product ID, dimensions, and sorted options
  let key = `${productId}`;

  // Add dimensions if present
  if (width !== undefined && height !== undefined) {
    key += `-${width}x${height}`;
  }

  // Add options, sorted by key
  const sortedOptions = Object.entries(options).sort(([a], [b]) => a.localeCompare(b));
  for (const [name, value] of sortedOptions) {
    key += `-${name}:${value}`;
  }

  return key;
}

/**
 * Calculate the subtotal for a cart
 */
export function calculateCartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Calculate the tax amount for a cart
 */
export function calculateCartTax(subtotal: number, taxRate: number): number {
  return subtotal * taxRate;
}

/**
 * Calculate the total for a cart
 */
export function calculateCartTotal(
  subtotal: number,
  taxAmount: number,
  shippingAmount: number
): number {
  return subtotal + taxAmount + shippingAmount;
}

/**
 * Create an empty cart
 */
export function createEmptyCart(): Cart {
  return {
    items: [],
    subtotal: 0,
    taxRate: 0.07, // 7% tax rate by default
    taxAmount: 0,
    shippingAmount: 0,
    total: 0
  };
}

/**
 * Create a new SavedCart from a Cart
 */
export function createSavedCart(cart: Cart, name: string, notes?: string): SavedCart {
  return {
    id: `saved_cart_${Date.now()}`,
    name,
    createdAt: new Date().toISOString(),
    items: [...cart.items],
    notes
  };
}

/**
 * Recalculate all cart totals
 */
export function recalculateCart(cart: Cart): Cart {
  const subtotal = calculateCartSubtotal(cart.items);
  const taxAmount = calculateCartTax(subtotal, cart.taxRate);

  // Determine shipping - free for orders over $100, otherwise $9.99
  const shippingAmount = subtotal >= 100 ? 0 : 9.99;

  const total = calculateCartTotal(subtotal, taxAmount, shippingAmount);

  return {
    ...cart,
    subtotal,
    taxAmount,
    shippingAmount,
    total
  };
}

import {
  Cart,
  CartItem,
  SavedCart,
  createEmptyCart,
  recalculateCart,
  generateCartItemId,
  createSavedCart
} from '../models/Cart';
import { Product } from '../models/Product';
import { getProductPrice } from '../models/Product';

// Key for storing cart in localStorage
const CART_STORAGE_KEY = 'smartblinds_cart';
// Key for storing saved carts in localStorage
const SAVED_CARTS_STORAGE_KEY = 'smartblinds_saved_carts';
// Key for storing saved items for later in localStorage
const SAVED_ITEMS_STORAGE_KEY = 'smartblinds_saved_items';

/**
 * Load cart from localStorage
 */
export function loadCart(): Cart {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (storedCart) {
      return JSON.parse(storedCart);
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }

  return createEmptyCart();
}

/**
 * Save cart to localStorage
 */
export function saveCart(cart: Cart): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));

    // Dispatch a custom event to notify other components that the cart has changed
    window.dispatchEvent(new Event('cartUpdated'));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}

/**
 * Get current cart
 */
export function getCart(): Cart {
  return loadCart();
}

/**
 * Add item to cart - overloaded to accept either a product or a cart item
 */
export function addToCart(cartItem: CartItem): Cart;
export function addToCart(
  product: Product,
  quantity: number = 1,
  width?: number,
  height?: number,
  options: Record<string, string> = {}
): Cart;
export function addToCart(
  productOrCartItem: Product | CartItem,
  quantity: number = 1,
  width?: number,
  height?: number,
  options: Record<string, string> = {}
): Cart {
  // Get current cart
  const cart = loadCart();

  // If the first argument is a CartItem
  if ('id' in productOrCartItem && 'productId' in productOrCartItem) {
    const cartItem = productOrCartItem as CartItem;

    // Check if this item already exists in the cart
    const existingItemIndex = cart.items.findIndex(item => item.id === cartItem.id);

    if (existingItemIndex >= 0) {
      // Update existing item
      cart.items[existingItemIndex].quantity += cartItem.quantity;
    } else {
      // Add new item
      cart.items.push(cartItem);
    }
  } else {
    // Handle the case where it's a Product
    const product = productOrCartItem as Product;

    // Calculate the price based on product, dimensions, and options
    const price = getProductPrice(product, width || 24, height || 36, options);

    // Generate a unique ID for this item based on product, dimensions, and options
    const itemId = generateCartItemId(product.id, width, height, options);

    // Check if this item already exists in the cart
    const existingItemIndex = cart.items.findIndex(item => item.id === itemId);

    if (existingItemIndex >= 0) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: itemId,
        productId: product.id,
        title: product.title,
        price,
        image: product.image,
        quantity,
        width,
        height,
        options
      };

      cart.items.push(newItem);
    }
  }

  // Recalculate cart totals
  const updatedCart = recalculateCart(cart);

  // Save cart to localStorage
  saveCart(updatedCart);

  return updatedCart;
}

/**
 * Update cart item quantity
 */
export function updateCartItemQuantity(itemId: string, quantity: number): Cart {
  // Get current cart
  const cart = loadCart();

  // Find the item
  const itemIndex = cart.items.findIndex(item => item.id === itemId);

  if (itemIndex >= 0) {
    // Update the quantity
    cart.items[itemIndex].quantity = Math.max(1, quantity);

    // Recalculate cart totals
    const updatedCart = recalculateCart(cart);

    // Save cart to localStorage
    saveCart(updatedCart);

    return updatedCart;
  }

  return cart;
}

/**
 * Remove item from cart
 */
export function removeCartItem(itemId: string): Cart {
  // Get current cart
  const cart = loadCart();

  // Remove the item
  cart.items = cart.items.filter(item => item.id !== itemId);

  // Recalculate cart totals
  const updatedCart = recalculateCart(cart);

  // Save cart to localStorage
  saveCart(updatedCart);

  return updatedCart;
}

/**
 * Move an item from cart to saved items
 */
export function moveToSavedItems(itemId: string): { cart: Cart, savedItems: CartItem[] } {
  // Get current cart
  const cart = loadCart();

  // Find the item to save for later
  const itemIndex = cart.items.findIndex(item => item.id === itemId);

  if (itemIndex >= 0) {
    const itemToSave = cart.items[itemIndex];

    // Remove from cart
    cart.items = cart.items.filter(item => item.id !== itemId);

    // Recalculate cart totals
    const updatedCart = recalculateCart(cart);

    // Save cart to localStorage
    saveCart(updatedCart);

    // Get current saved items
    const savedItems = getSavedItems();

    // Add to saved items if not already there
    if (!savedItems.some(item => item.id === itemId)) {
      savedItems.push(itemToSave);
      localStorage.setItem(SAVED_ITEMS_STORAGE_KEY, JSON.stringify(savedItems));
      window.dispatchEvent(new Event('savedItemsUpdated'));
    }

    return { cart: updatedCart, savedItems };
  }

  return { cart, savedItems: getSavedItems() };
}

/**
 * Get saved items
 */
export function getSavedItems(): CartItem[] {
  try {
    const storedItems = localStorage.getItem(SAVED_ITEMS_STORAGE_KEY);

    if (storedItems) {
      return JSON.parse(storedItems);
    }
  } catch (error) {
    console.error('Error loading saved items from localStorage:', error);
  }

  return [];
}

/**
 * Move an item from saved items to cart
 */
export function moveToCart(itemId: string): { cart: Cart, savedItems: CartItem[] } {
  // Get saved items
  const savedItems = getSavedItems();

  // Find the item to move
  const itemIndex = savedItems.findIndex(item => item.id === itemId);

  if (itemIndex >= 0) {
    const itemToMove = savedItems[itemIndex];

    // Remove from saved items
    const updatedSavedItems = savedItems.filter(item => item.id !== itemId);
    localStorage.setItem(SAVED_ITEMS_STORAGE_KEY, JSON.stringify(updatedSavedItems));
    window.dispatchEvent(new Event('savedItemsUpdated'));

    // Add to cart
    const updatedCart = addToCart(itemToMove);

    return { cart: updatedCart, savedItems: updatedSavedItems };
  }

  return { cart: getCart(), savedItems };
}

/**
 * Remove an item from saved items
 */
export function removeSavedItem(itemId: string): CartItem[] {
  // Get saved items
  const savedItems = getSavedItems();

  // Remove the item
  const updatedSavedItems = savedItems.filter(item => item.id !== itemId);

  // Save to localStorage
  localStorage.setItem(SAVED_ITEMS_STORAGE_KEY, JSON.stringify(updatedSavedItems));
  window.dispatchEvent(new Event('savedItemsUpdated'));

  return updatedSavedItems;
}

/**
 * Save current cart as a named cart
 */
export function saveCurrentCart(name: string, notes?: string): SavedCart[] {
  const currentCart = loadCart();

  // Don't save empty carts
  if (currentCart.items.length === 0) {
    throw new Error("Cannot save an empty cart");
  }

  // Create a new saved cart
  const newSavedCart = createSavedCart(currentCart, name, notes);

  // Get existing saved carts
  const savedCarts = getSavedCarts();

  // Add new saved cart
  savedCarts.push(newSavedCart);

  // Store in localStorage
  localStorage.setItem(SAVED_CARTS_STORAGE_KEY, JSON.stringify(savedCarts));

  // Notify listeners
  window.dispatchEvent(new Event('savedCartsUpdated'));

  return savedCarts;
}

/**
 * Get all saved carts
 */
export function getSavedCarts(): SavedCart[] {
  try {
    const storedCarts = localStorage.getItem(SAVED_CARTS_STORAGE_KEY);

    if (storedCarts) {
      return JSON.parse(storedCarts);
    }
  } catch (error) {
    console.error('Error loading saved carts from localStorage:', error);
  }

  return [];
}

/**
 * Delete a saved cart
 */
export function deleteSavedCart(cartId: string): SavedCart[] {
  // Get saved carts
  const savedCarts = getSavedCarts();

  // Remove the cart with matching ID
  const updatedCarts = savedCarts.filter(cart => cart.id !== cartId);

  // Store in localStorage
  localStorage.setItem(SAVED_CARTS_STORAGE_KEY, JSON.stringify(updatedCarts));

  // Notify listeners
  window.dispatchEvent(new Event('savedCartsUpdated'));

  return updatedCarts;
}

/**
 * Load a saved cart into the current cart
 */
export function loadSavedCart(cartId: string): Cart {
  // Get saved carts
  const savedCarts = getSavedCarts();

  // Find the cart with matching ID
  const savedCart = savedCarts.find(cart => cart.id === cartId);

  if (!savedCart) {
    throw new Error(`Saved cart with ID ${cartId} not found`);
  }

  // Create a new cart with the saved items
  const newCart: Cart = {
    ...createEmptyCart(),
    items: [...savedCart.items]
  };

  // Recalculate the cart
  const finalCart = recalculateCart(newCart);

  // Save to localStorage
  saveCart(finalCart);

  return finalCart;
}

/**
 * Merge a saved cart with the current cart
 */
export function mergeSavedCart(cartId: string): Cart {
  // Get current cart
  const currentCart = loadCart();

  // Get saved carts
  const savedCarts = getSavedCarts();

  // Find the cart with matching ID
  const savedCart = savedCarts.find(cart => cart.id === cartId);

  if (!savedCart) {
    throw new Error(`Saved cart with ID ${cartId} not found`);
  }

  // Add each item from saved cart to current cart
  savedCart.items.forEach(item => {
    // Check if item already exists in current cart
    const existingItemIndex = currentCart.items.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex >= 0) {
      // Increase quantity if item already exists
      currentCart.items[existingItemIndex].quantity += item.quantity;
    } else {
      // Add item if it doesn't exist
      currentCart.items.push({...item});
    }
  });

  // Recalculate the cart
  const finalCart = recalculateCart(currentCart);

  // Save to localStorage
  saveCart(finalCart);

  return finalCart;
}

/**
 * Clear the cart
 */
export function clearCart(): Cart {
  const emptyCart = createEmptyCart();
  saveCart(emptyCart);
  return emptyCart;
}

/**
 * Get the total number of items in the cart
 */
export function getCartItemCount(): number {
  const cart = loadCart();
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Apply a coupon code to the cart
 */
export function applyCoupon(code: string): { success: boolean; message: string; cart: Cart } {
  // Get current cart
  const cart = loadCart();

  // Example coupon codes
  const coupons: Record<string, number> = {
    'SAVE10': 0.1,    // 10% off
    'SPRING20': 0.2,  // 20% off
    'WELCOME15': 0.15 // 15% off
  };

  // Check if valid coupon code
  if (coupons[code]) {
    const discount = cart.subtotal * coupons[code];

    // Apply discount (in a real app, we'd likely have a discountAmount field in the Cart model)
    const updatedCart: Cart = {
      ...cart,
      subtotal: cart.subtotal - discount,
    };

    // Recalculate tax and total
    const finalCart = recalculateCart(updatedCart);

    saveCart(finalCart);

    return {
      success: true,
      message: `Coupon applied! You saved $${discount.toFixed(2)}`,
      cart: finalCart
    };
  }

  return {
    success: false,
    message: 'Invalid coupon code',
    cart
  };
}

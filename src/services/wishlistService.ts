import { Product } from '../models/Product';

// Key for storing wishlist in localStorage
const WISHLIST_STORAGE_KEY = 'blinds_wishlist';

/**
 * Get the current wishlist from localStorage
 */
export function getWishlist(): string[] {
  try {
    const wishlistJson = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!wishlistJson) return [];
    return JSON.parse(wishlistJson);
  } catch (error) {
    console.error('Error retrieving wishlist:', error);
    return [];
  }
}

/**
 * Get the full product details for all items in the wishlist
 */
export function getWishlistProducts(allProducts: Product[]): Product[] {
  const wishlistIds = getWishlist();
  return allProducts.filter(product => wishlistIds.includes(product.id));
}

/**
 * Add a product to the wishlist
 */
export function addToWishlist(productId: string): void {
  try {
    const currentWishlist = getWishlist();
    if (currentWishlist.includes(productId)) return;

    const updatedWishlist = [...currentWishlist, productId];
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updatedWishlist));

    // Dispatch event for components to listen to
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
  } catch (error) {
    console.error('Error adding to wishlist:', error);
  }
}

/**
 * Remove a product from the wishlist
 */
export function removeFromWishlist(productId: string): void {
  try {
    const currentWishlist = getWishlist();
    const updatedWishlist = currentWishlist.filter(id => id !== productId);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updatedWishlist));

    // Dispatch event for components to listen to
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
  } catch (error) {
    console.error('Error removing from wishlist:', error);
  }
}

/**
 * Clear the entire wishlist
 */
export function clearWishlist(): void {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify([]));

    // Dispatch event for components to listen to
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
  } catch (error) {
    console.error('Error clearing wishlist:', error);
  }
}

/**
 * Check if a product is in the wishlist
 */
export function isInWishlist(productId: string): boolean {
  return getWishlist().includes(productId);
}

/**
 * Get the count of items in the wishlist
 */
export function getWishlistCount(): number {
  return getWishlist().length;
}

/**
 * Toggle a product in the wishlist (add if not present, remove if present)
 */
export function toggleWishlistItem(productId: string): boolean {
  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
    return false;
  } else {
    addToWishlist(productId);
    return true;
  }
}

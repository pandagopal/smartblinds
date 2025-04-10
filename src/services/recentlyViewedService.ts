// Interface for a recently viewed item
export interface RecentlyViewedItem {
  id: string;
  productId: string;
  productTitle: string;
  colorName: string;
  width: number;
  height: number;
  thumbnail?: string;
  timestamp: number;
}

const MAX_RECENT_ITEMS = 20;
const STORAGE_KEY = 'recentlyViewed';

/**
 * Check if localStorage is available
 * @returns boolean indicating if localStorage is available
 */
function isLocalStorageAvailable() {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Safely get an item from localStorage with error handling
 * @param key The localStorage key
 * @returns The value or null if not found/error
 */
function safeGetFromStorage(key: string): string | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error('Error accessing localStorage:', e);
    return null;
  }
}

/**
 * Safely set an item in localStorage with error handling
 * @param key The localStorage key
 * @param value The value to store
 */
function safeSetToStorage(key: string, value: string): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.error('Error writing to localStorage:', e);
    return false;
  }
}

/**
 * Safely remove an item from localStorage with error handling
 * @param key The localStorage key to remove
 */
function safeRemoveFromStorage(key: string): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error('Error removing from localStorage:', e);
    return false;
  }
}

/**
 * Add a configuration to the recently viewed items
 *
 * @param config The configuration to add
 */
export const addToRecentlyViewed = (config: {
  productId: string;
  productTitle: string;
  width: number;
  height: number;
  colorName: string;
  thumbnail?: string;
}) => {
  try {
    // Generate a unique ID based on product and options
    const configId = `${config.productId}-${config.width}-${config.height}-${config.colorName}`.replace(/\s+/g, '');

    // Create the item to add
    const newItem: RecentlyViewedItem = {
      ...config,
      id: configId,
      timestamp: Date.now()
    };

    // Get existing items
    let recentItems: RecentlyViewedItem[] = [];
    const storedItems = safeGetFromStorage(STORAGE_KEY);

    if (storedItems) {
      try {
        recentItems = JSON.parse(storedItems);

        // Ensure valid array
        if (!Array.isArray(recentItems)) {
          recentItems = [];
        }
      } catch (error) {
        console.error('Error parsing recently viewed items:', error);
        recentItems = [];
      }

      // Remove any existing item with the same ID
      recentItems = recentItems.filter(item => item.id !== configId);
    }

    // Add the new item at the beginning
    recentItems.unshift(newItem);

    // Keep only the most recent items
    if (recentItems.length > MAX_RECENT_ITEMS) {
      recentItems = recentItems.slice(0, MAX_RECENT_ITEMS);
    }

    // Save to localStorage
    safeSetToStorage(STORAGE_KEY, JSON.stringify(recentItems));

    return configId;
  } catch (error) {
    console.error('Error adding to recently viewed:', error);
    return null;
  }
};

/**
 * Get all recently viewed items
 */
export const getRecentlyViewed = (): RecentlyViewedItem[] => {
  try {
    const storedItems = safeGetFromStorage(STORAGE_KEY);
    if (storedItems) {
      const parsedItems = JSON.parse(storedItems);
      if (Array.isArray(parsedItems)) {
        return parsedItems;
      }
    }
  } catch (error) {
    console.error('Error getting recently viewed items:', error);
    // Clear corrupted data
    safeRemoveFromStorage(STORAGE_KEY);
  }

  return [];
};

/**
 * Clear all recently viewed items
 */
export const clearRecentlyViewed = (): void => {
  safeRemoveFromStorage(STORAGE_KEY);
};

/**
 * Remove a specific item from recently viewed
 *
 * @param id ID of the item to remove
 */
export const removeFromRecentlyViewed = (id: string): void => {
  try {
    const storedItems = safeGetFromStorage(STORAGE_KEY);
    if (storedItems) {
      const recentItems: RecentlyViewedItem[] = JSON.parse(storedItems);
      if (Array.isArray(recentItems)) {
        const filteredItems = recentItems.filter(item => item.id !== id);
        safeSetToStorage(STORAGE_KEY, JSON.stringify(filteredItems));
      }
    }
  } catch (error) {
    console.error('Error removing from recently viewed:', error);
  }
};

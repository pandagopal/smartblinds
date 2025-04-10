/**
 * Favorites Service
 *
 * This service manages user's favorite blind configurations,
 * allowing them to save, retrieve, and manage their favorite setups.
 */

export interface FavoriteItem {
  id: string;
  productId: string;
  productTitle: string;
  colorName: string;
  width: number;
  height: number;
  thumbnail?: string;
  slatSize?: string;
  mountType?: string;
  controlType?: string;
  notes?: string;
  timestamp: number;
  isFavorite: boolean;
}

const STORAGE_KEY = 'favorites';
const MAX_FAVORITES = 50; // Maximum number of favorites to store

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
 * Add a configuration to favorites
 * @param config The configuration to add to favorites
 * @returns The ID of the favorited item or null if operation failed
 */
export const addToFavorites = (config: {
  productId: string;
  productTitle: string;
  width: number;
  height: number;
  colorName: string;
  thumbnail?: string;
  slatSize?: string;
  mountType?: string;
  controlType?: string;
  notes?: string;
}): string | null => {
  try {
    // Generate a unique ID based on product and options
    const configId = `${config.productId}-${config.width}-${config.height}-${config.colorName}`.replace(/\s+/g, '');

    // Create the favorite item
    const favoriteItem: FavoriteItem = {
      ...config,
      id: configId,
      timestamp: Date.now(),
      isFavorite: true
    };

    // Get existing favorites
    let favorites: FavoriteItem[] = [];
    const storedFavorites = safeGetFromStorage(STORAGE_KEY);

    if (storedFavorites) {
      try {
        favorites = JSON.parse(storedFavorites);

        // Ensure valid array
        if (!Array.isArray(favorites)) {
          favorites = [];
        }
      } catch (error) {
        console.error('Error parsing favorites:', error);
        favorites = [];
      }

      // Remove any existing item with the same ID
      favorites = favorites.filter(item => item.id !== configId);
    }

    // Add the new favorite at the beginning
    favorites.unshift(favoriteItem);

    // Keep only the maximum allowed favorites
    if (favorites.length > MAX_FAVORITES) {
      favorites = favorites.slice(0, MAX_FAVORITES);
    }

    // Save to localStorage
    safeSetToStorage(STORAGE_KEY, JSON.stringify(favorites));

    return configId;
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return null;
  }
};

/**
 * Remove a configuration from favorites
 * @param id The ID of the configuration to remove
 * @returns boolean indicating success
 */
export const removeFromFavorites = (id: string): boolean => {
  try {
    const storedFavorites = safeGetFromStorage(STORAGE_KEY);
    if (!storedFavorites) return false;

    let favorites: FavoriteItem[] = [];
    try {
      favorites = JSON.parse(storedFavorites);

      // Ensure valid array
      if (!Array.isArray(favorites)) {
        return false;
      }
    } catch (error) {
      console.error('Error parsing favorites:', error);
      return false;
    }

    // Filter out the item to remove
    const newFavorites = favorites.filter(item => item.id !== id);

    // If nothing was removed, return false
    if (newFavorites.length === favorites.length) {
      return false;
    }

    // Save the updated favorites
    safeSetToStorage(STORAGE_KEY, JSON.stringify(newFavorites));
    return true;
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return false;
  }
};

/**
 * Get all favorite items
 * @returns Array of favorite items
 */
export const getFavorites = (): FavoriteItem[] => {
  try {
    const storedFavorites = safeGetFromStorage(STORAGE_KEY);
    if (storedFavorites) {
      const parsedFavorites = JSON.parse(storedFavorites);
      if (Array.isArray(parsedFavorites)) {
        return parsedFavorites;
      }
    }
  } catch (error) {
    console.error('Error getting favorites:', error);
    // Clear corrupted data
    safeRemoveFromStorage(STORAGE_KEY);
  }

  return [];
};

/**
 * Check if a configuration is in favorites
 * @param id The ID of the configuration to check
 * @returns boolean indicating if the configuration is in favorites
 */
export const isFavorite = (id: string): boolean => {
  try {
    const favorites = getFavorites();
    return favorites.some(item => item.id === id);
  } catch (error) {
    console.error('Error checking if favorite:', error);
    return false;
  }
};

/**
 * Toggle favorite status for a configuration
 * @param config The configuration to toggle
 * @returns boolean indicating the new favorite status
 */
export const toggleFavorite = (config: {
  productId: string;
  productTitle: string;
  width: number;
  height: number;
  colorName: string;
  thumbnail?: string;
  slatSize?: string;
  mountType?: string;
  controlType?: string;
  notes?: string;
}): boolean => {
  // Generate the configuration ID
  const configId = `${config.productId}-${config.width}-${config.height}-${config.colorName}`.replace(/\s+/g, '');

  // Check if it's already a favorite
  const isCurrentlyFavorite = isFavorite(configId);

  if (isCurrentlyFavorite) {
    // If it's already a favorite, remove it
    removeFromFavorites(configId);
    return false;
  } else {
    // If it's not a favorite, add it
    addToFavorites(config);
    return true;
  }
};

/**
 * Clear all favorites
 */
export const clearFavorites = (): void => {
  safeRemoveFromStorage(STORAGE_KEY);
};

/**
 * Update notes for a favorite item
 * @param id The ID of the favorite to update
 * @param notes The new notes
 * @returns boolean indicating success
 */
export const updateFavoriteNotes = (id: string, notes: string): boolean => {
  try {
    const favorites = getFavorites();
    const index = favorites.findIndex(item => item.id === id);

    if (index === -1) return false;

    favorites[index].notes = notes;
    safeSetToStorage(STORAGE_KEY, JSON.stringify(favorites));
    return true;
  } catch (error) {
    console.error('Error updating favorite notes:', error);
    return false;
  }
};

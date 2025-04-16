/**
 * Cache Service
 *
 * This service provides functions for caching API responses and other data
 * to improve performance by reducing redundant network requests.
 */

// Define cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Define cache options interface
interface CacheOptions {
  maxAge?: number; // Time in milliseconds
  key?: string; // Custom cache key
  force?: boolean; // Force update cache
}

// Cache storage Map
const cacheStorage = new Map<string, CacheEntry<any>>();

// Default cache settings
const DEFAULT_CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a cache key from the request
 */
const generateCacheKey = (url: string, params?: any): string => {
  if (!params) {
    return url;
  }

  // Sort the keys to ensure consistent cache keys
  const sortedParams = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, any>);

  return `${url}:${JSON.stringify(sortedParams)}`;
};

/**
 * Fetch with caching
 *
 * This function wraps the fetch API to add caching capabilities.
 */
export const cachedFetch = async <T>(
  url: string,
  options?: RequestInit & CacheOptions,
  params?: Record<string, any>
): Promise<T> => {
  // Destructure options
  const {
    maxAge = DEFAULT_CACHE_MAX_AGE,
    key,
    force = false,
    ...fetchOptions
  } = options || {};

  // Generate the cache key
  const cacheKey = key || generateCacheKey(url, params);

  // Check if we have a valid cache entry
  const cachedEntry = cacheStorage.get(cacheKey);
  const now = Date.now();

  // Return cached data if available and not expired
  if (!force && cachedEntry && cachedEntry.expiresAt > now) {
    // Log cache hit for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Cache Hit] ${cacheKey}`);
    }
    return cachedEntry.data;
  }

  // Build the complete URL with query parameters
  let completeUrl = url;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      completeUrl += `?${queryString}`;
    }
  }

  // Fetch the data
  const startTime = performance.now();
  try {
    const response = await fetch(completeUrl, fetchOptions);
    const endTime = performance.now();

    // Log cache miss and fetch time for debugging
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Cache Miss] ${cacheKey} (${(endTime - startTime).toFixed(2)}ms)`);
    }

    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    // Parse the response
    const data = await response.json();

    // Cache the response
    cacheStorage.set(cacheKey, {
      data,
      timestamp: now,
      expiresAt: now + maxAge,
    });

    return data;
  } catch (error) {
    // Try to return stale cache if available
    if (cachedEntry) {
      console.warn(`[Cache] Returning stale data for ${cacheKey} due to fetch error`);
      return cachedEntry.data;
    }

    throw error;
  }
};

/**
 * Get cached data
 */
export const getCachedData = <T>(key: string): T | null => {
  const cachedEntry = cacheStorage.get(key);

  if (cachedEntry && cachedEntry.expiresAt > Date.now()) {
    return cachedEntry.data;
  }

  return null;
};

/**
 * Manually set cached data
 */
export const setCachedData = <T>(
  key: string,
  data: T,
  maxAge = DEFAULT_CACHE_MAX_AGE
): void => {
  const now = Date.now();

  cacheStorage.set(key, {
    data,
    timestamp: now,
    expiresAt: now + maxAge,
  });
};

/**
 * Manually invalidate cached data
 */
export const invalidateCache = (key: string): boolean => {
  return cacheStorage.delete(key);
};

/**
 * Invalidate all cache entries or entries that match a pattern
 */
export const clearCache = (pattern?: RegExp): void => {
  if (!pattern) {
    cacheStorage.clear();
    return;
  }

  // Delete keys matching the pattern
  for (const key of cacheStorage.keys()) {
    if (pattern.test(key)) {
      cacheStorage.delete(key);
    }
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  totalSize: string;
} => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  let totalSizeBytes = 0;

  // Calculate stats
  for (const [key, entry] of cacheStorage.entries()) {
    if (entry.expiresAt > now) {
      validEntries++;
    } else {
      expiredEntries++;
    }

    // Rough size estimation (not precise)
    totalSizeBytes += key.length * 2; // string key size (2 bytes per char)
    totalSizeBytes += JSON.stringify(entry.data).length * 2; // data size
  }

  // Convert bytes to human-readable format
  const totalSize = totalSizeBytes < 1024
    ? `${totalSizeBytes} B`
    : totalSizeBytes < 1024 * 1024
    ? `${(totalSizeBytes / 1024).toFixed(2)} KB`
    : `${(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`;

  return {
    totalEntries: cacheStorage.size,
    validEntries,
    expiredEntries,
    totalSize,
  };
};

// Export utility for caching with tracking
export const cacheWithTracking = async <T>(
  url: string,
  options?: RequestInit & CacheOptions,
  params?: Record<string, any>,
  trackFn?: (duration: number, hit: boolean) => void
): Promise<T> => {
  const start = performance.now();
  const key = options?.key || generateCacheKey(url, params);

  // Check for cache hit first
  const cachedData = getCachedData<T>(key);
  if (cachedData && !options?.force) {
    const duration = performance.now() - start;
    trackFn?.(duration, true);
    return cachedData;
  }

  // Cache miss, fetch the data
  const data = await cachedFetch<T>(url, options, params);
  const duration = performance.now() - start;
  trackFn?.(duration, false);
  return data;
};

// Export the cache service
const cacheService = {
  cachedFetch,
  getCachedData,
  setCachedData,
  invalidateCache,
  clearCache,
  getCacheStats,
  cacheWithTracking,
};

export default cacheService;

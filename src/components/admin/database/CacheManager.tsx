import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';

/**
 * Cache Manager component for the Database Admin Panel
 */
const CacheManager: React.FC = () => {
  const [cacheStats, setCacheStats] = useState<{
    totalEntries: number;
    validEntries: number;
    expiredEntries: number;
    totalSize: string;
  } | null>(null);

  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Fetch cache statistics
  useEffect(() => {
    const stats = api.cache.getCacheStats();
    setCacheStats(stats);
  }, [refreshKey]);

  // Clear different types of cache
  const clearCache = (type: 'all' | 'products' | 'categories') => {
    if (!window.confirm(`Are you sure you want to clear ${type} cache?`)) {
      return;
    }

    try {
      switch (type) {
        case 'all':
          api.cache.clearAllCache();
          break;
        case 'products':
          api.cache.clearProductCache();
          break;
        case 'categories':
          api.cache.clearCategoryCache();
          break;
      }

      // Refresh cache stats
      setRefreshKey(prev => prev + 1);

      alert(`${type.charAt(0).toUpperCase() + type.slice(1)} cache cleared successfully`);
    } catch (error) {
      console.error(`Error clearing ${type} cache:`, error);
      alert(`Failed to clear ${type} cache. Please try again.`);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Cache Management</h2>
        <button
          onClick={() => setRefreshKey(prev => prev + 1)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh Stats
        </button>
      </div>

      {/* Cache Statistics */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-blue-700 mb-4">Cache Statistics</h3>
        {cacheStats ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow-sm">
              <p className="text-sm text-gray-500">Total Entries</p>
              <p className="text-2xl font-semibold">{cacheStats.totalEntries}</p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm">
              <p className="text-sm text-gray-500">Valid Entries</p>
              <p className="text-2xl font-semibold text-green-600">{cacheStats.validEntries}</p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm">
              <p className="text-sm text-gray-500">Expired Entries</p>
              <p className="text-2xl font-semibold text-orange-500">{cacheStats.expiredEntries}</p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm">
              <p className="text-sm text-gray-500">Total Size</p>
              <p className="text-2xl font-semibold text-blue-600">{cacheStats.totalSize}</p>
            </div>
          </div>
        ) : (
          <p>Loading cache statistics...</p>
        )}
      </div>

      {/* Cache Management Actions */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Cache Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow-sm">
            <h4 className="text-md font-medium mb-2">Products Cache</h4>
            <p className="text-sm text-gray-500 mb-3">
              Products, listings, and related product data.
            </p>
            <button
              onClick={() => clearCache('products')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm w-full"
            >
              Clear Products Cache
            </button>
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <h4 className="text-md font-medium mb-2">Categories Cache</h4>
            <p className="text-sm text-gray-500 mb-3">
              Categories and category-specific data.
            </p>
            <button
              onClick={() => clearCache('categories')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm w-full"
            >
              Clear Categories Cache
            </button>
          </div>

          <div className="bg-white p-4 rounded shadow-sm">
            <h4 className="text-md font-medium mb-2">All Cache</h4>
            <p className="text-sm text-gray-500 mb-3">
              Clear all cached data across the application.
            </p>
            <button
              onClick={() => clearCache('all')}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm w-full"
            >
              Clear All Cache
            </button>
          </div>
        </div>
      </div>

      {/* Cache Tips */}
      <div className="mt-6 bg-yellow-50 text-yellow-800 p-4 rounded-md">
        <h4 className="font-medium mb-2">Tips for Cache Management</h4>
        <ul className="list-disc pl-5 text-sm">
          <li>Clear product cache after updating or adding new products</li>
          <li>Clear category cache after modifying category data</li>
          <li>Use "Clear All Cache" when making significant data changes</li>
          <li>Cache is automatically cleared for created/updated entities</li>
          <li>Cache improves application performance but may show stale data</li>
        </ul>
      </div>
    </div>
  );
};

export default CacheManager;

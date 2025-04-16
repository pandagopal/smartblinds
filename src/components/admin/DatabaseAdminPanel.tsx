import React, { useState } from 'react';
import ProductsManager from './database/ProductsManager';
import CategoriesManager from './database/CategoriesManager';
import CacheManager from './database/CacheManager';
import DatabaseStats from './database/DatabaseStats';
import DatabaseBackup from './database/DatabaseBackup';
import { api } from '../../services/api';

/**
 * Database Admin Panel for managing products, categories, and database operations
 */
const DatabaseAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('products');

  // Define tabs for the admin panel
  const tabs = [
    { id: 'products', label: 'Products', icon: 'box' },
    { id: 'categories', label: 'Categories', icon: 'folder' },
    { id: 'cache', label: 'Cache Management', icon: 'database' },
    { id: 'stats', label: 'Database Stats', icon: 'chart-bar' },
    { id: 'backup', label: 'Backup & Restore', icon: 'cloud-upload' },
  ];

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Clear all cache
  const handleClearAllCache = () => {
    api.cache.clearAllCache();
    alert('All cache cleared successfully');
  };

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return <ProductsManager />;
      case 'categories':
        return <CategoriesManager />;
      case 'cache':
        return <CacheManager />;
      case 'stats':
        return <DatabaseStats />;
      case 'backup':
        return <DatabaseBackup />;
      default:
        return <ProductsManager />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Database Administration</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleClearAllCache}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Clear All Cache
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-3 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => handleTabChange(tab.id)}
          >
            <div className="flex items-center">
              {/* Render icon based on tab */}
              {renderTabIcon(tab.icon)}
              <span className="ml-2">{tab.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-lg shadow p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Helper function to render tab icons
const renderTabIcon = (icon: string) => {
  switch (icon) {
    case 'box':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"
          />
        </svg>
      );
    case 'folder':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
      );
    case 'database':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      );
    case 'chart-bar':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      );
    case 'cloud-upload':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      );
    default:
      return null;
  }
};

export default DatabaseAdminPanel;

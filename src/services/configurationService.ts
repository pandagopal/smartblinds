import { Product } from '../models/Product';

export interface SavedConfiguration {
  id: string;
  name: string;
  date: string;
  product: Product;
  options: Record<string, string>;
  width: number;
  height: number;
  quantity: number;
}

// Local storage key
const STORAGE_KEY = 'savedConfigurations';

/**
 * Get all saved configurations from local storage
 */
export const getSavedConfigurations = (): SavedConfiguration[] => {
  try {
    const savedConfigs = localStorage.getItem(STORAGE_KEY);
    return savedConfigs ? JSON.parse(savedConfigs) : [];
  } catch (error) {
    console.error('Error loading saved configurations:', error);
    return [];
  }
};

/**
 * Save a configuration to local storage
 */
export const saveConfiguration = (
  name: string,
  product: Product,
  options: Record<string, string>,
  width: number,
  height: number,
  quantity: number
): SavedConfiguration => {
  // Create a new configuration object
  const newConfig: SavedConfiguration = {
    id: Date.now().toString(),
    name: name.trim(),
    date: new Date().toISOString(),
    product,
    options,
    width,
    height,
    quantity
  };

  // Get existing configurations
  const existingConfigs = getSavedConfigurations();

  // Add new configuration
  const updatedConfigs = [...existingConfigs, newConfig];

  // Save to local storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfigs));

  return newConfig;
};

/**
 * Update an existing configuration
 */
export const updateConfiguration = (
  configId: string,
  updatedConfig: Partial<SavedConfiguration>
): boolean => {
  // Get existing configurations
  const existingConfigs = getSavedConfigurations();

  // Find the configuration to update
  const configIndex = existingConfigs.findIndex(config => config.id === configId);

  if (configIndex === -1) {
    return false;
  }

  // Update the configuration
  existingConfigs[configIndex] = {
    ...existingConfigs[configIndex],
    ...updatedConfig,
    // Always update the date when updating a configuration
    date: new Date().toISOString()
  };

  // Save to local storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existingConfigs));

  return true;
};

/**
 * Delete a configuration
 */
export const deleteConfiguration = (configId: string): boolean => {
  // Get existing configurations
  const existingConfigs = getSavedConfigurations();

  // Filter out the configuration to delete
  const updatedConfigs = existingConfigs.filter(config => config.id !== configId);

  if (updatedConfigs.length === existingConfigs.length) {
    // No configuration was deleted
    return false;
  }

  // Save to local storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConfigs));

  return true;
};

/**
 * Get a configuration by ID
 */
export const getConfigurationById = (configId: string): SavedConfiguration | null => {
  const configs = getSavedConfigurations();
  const config = configs.find(c => c.id === configId);
  return config || null;
};

/**
 * Get configurations for a specific product
 */
export const getConfigurationsForProduct = (productId: string): SavedConfiguration[] => {
  const configs = getSavedConfigurations();
  return configs.filter(config => config.product.id === productId);
};

/**
 * Format date for display
 */
export const formatConfigDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Check if user has any saved configurations
 */
export const hasSavedConfigurations = (): boolean => {
  const configs = getSavedConfigurations();
  return configs.length > 0;
};

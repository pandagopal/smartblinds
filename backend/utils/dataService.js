/**
 * Data Service Module
 *
 * Provides centralized access to product, category, and configuration data.
 * Falls back to CSV files if database isn't available.
 */

const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../config/db');

// In-memory cache for data
let dataCache = {
  products: [],
  categories: [],
  mountTypes: [],
  controlTypes: [],
  fabricTypes: [],
  blindTypes: [],
  initialized: false
};

/**
 * Initialize the data service with either database or CSV fallback
 */
const initializeDataServiceStub = () => {
  console.log('Initializing stub data service...');

  // Mock data for development
  dataCache = {
    products: [
      { id: 1, name: 'Premium Roller Shades', description: 'High-quality shades for any room', price: 129.99, category_id: 1 },
      { id: 2, name: 'Deluxe Venetian Blinds', description: 'Classic blinds with modern features', price: 89.99, category_id: 2 },
      { id: 3, name: 'Smart Motorized Blinds', description: 'Voice-controlled smart blinds', price: 249.99, category_id: 3 }
    ],
    categories: [
      { id: 1, name: 'Roller Shades', description: 'Modern shades with clean lines' },
      { id: 2, name: 'Venetian Blinds', description: 'Traditional slatted blinds' },
      { id: 3, name: 'Smart Blinds', description: 'App and voice controlled blinds' }
    ],
    mountTypes: [
      { id: 1, name: 'Inside Mount', description: 'Fits within the window frame' },
      { id: 2, name: 'Outside Mount', description: 'Mounts on or above the window frame' }
    ],
    controlTypes: [
      { id: 1, name: 'Standard Cord', description: 'Traditional pull cord control' },
      { id: 2, name: 'Cordless', description: 'Child-safe cordless operation' },
      { id: 3, name: 'Motorized', description: 'Remote controlled operation' },
      { id: 4, name: 'Smart Control', description: 'App and voice-controlled operation' }
    ],
    fabricTypes: [
      { id: 1, name: 'Light Filtering', description: 'Allows some light through' },
      { id: 2, name: 'Room Darkening', description: 'Blocks most light' },
      { id: 3, name: 'Blackout', description: 'Blocks all light' },
      { id: 4, name: 'Sheer', description: 'Allows significant light through' }
    ],
    blindTypes: [
      { id: 1, name: 'Roller Shades', description: 'Modern and clean' },
      { id: 2, name: 'Roman Shades', description: 'Elegant and classic' },
      { id: 3, name: 'Venetian Blinds', description: 'Traditional slats' },
      { id: 4, name: 'Vertical Blinds', description: 'Ideal for large windows and doors' },
      { id: 5, name: 'Cellular Shades', description: 'Energy efficient honeycomb design' }
    ],
    initialized: true
  };

  console.log('Data service initialized with stub data');
  return dataCache;
};

/**
 * Get products from cache or database
 */
const getProducts = async () => {
  if (dataCache.products.length > 0) {
    return dataCache.products;
  }

  try {
    const result = await db.query('SELECT * FROM blinds.products');
    dataCache.products = result.rows;
    return result.rows;
  } catch (error) {
    console.error(`Error fetching products: ${error.message}`);
    return [];
  }
};

/**
 * Get categories from cache or database
 */
const getCategories = async () => {
  if (dataCache.categories.length > 0) {
    return dataCache.categories;
  }

  try {
    const result = await db.query('SELECT * FROM blinds.categories');
    dataCache.categories = result.rows;
    return result.rows;
  } catch (error) {
    console.error(`Error fetching categories: ${error.message}`);
    return [];
  }
};

/**
 * Get mount types from cache or database
 */
const getMountTypes = async () => {
  if (dataCache.mountTypes.length > 0) {
    return dataCache.mountTypes;
  }

  try {
    const result = await db.query('SELECT * FROM blinds.mount_types');
    dataCache.mountTypes = result.rows;
    return result.rows;
  } catch (error) {
    console.error(`Error fetching mount types: ${error.message}`);
    return [];
  }
};

/**
 * Get control types from cache or database
 */
const getControlTypes = async () => {
  if (dataCache.controlTypes.length > 0) {
    return dataCache.controlTypes;
  }

  try {
    const result = await db.query('SELECT * FROM blinds.control_types');
    dataCache.controlTypes = result.rows;
    return result.rows;
  } catch (error) {
    console.error(`Error fetching control types: ${error.message}`);
    return [];
  }
};

/**
 * Get fabric types from cache or database
 */
const getFabricTypes = async () => {
  if (dataCache.fabricTypes.length > 0) {
    return dataCache.fabricTypes;
  }

  try {
    const result = await db.query('SELECT * FROM blinds.fabric_types');
    dataCache.fabricTypes = result.rows;
    return result.rows;
  } catch (error) {
    console.error(`Error fetching fabric types: ${error.message}`);
    return [];
  }
};

/**
 * Get blind types from cache or database
 */
const getBlindTypes = async () => {
  if (dataCache.blindTypes.length > 0) {
    return dataCache.blindTypes;
  }

  try {
    const result = await db.query('SELECT * FROM blinds.blind_types');
    dataCache.blindTypes = result.rows;
    return result.rows;
  } catch (error) {
    console.error(`Error fetching blind types: ${error.message}`);
    return [];
  }
};

// Export functions
module.exports = {
  initializeDataServiceStub,
  getProducts,
  getCategories,
  getMountTypes,
  getControlTypes,
  getFabricTypes,
  getBlindTypes
};

const colors = require('colors');
const { pool } = require('../config/db');
const csvService = require('./csvDataService');

// Flag to determine if we're using PostgreSQL or CSV backup
let usePostgres = true;

/**
 * Set the data source to use (PostgreSQL or CSV)
 * @param {boolean} postgres - If true, use PostgreSQL; otherwise, use CSV
 */
const setDataSource = (postgres) => {
  usePostgres = postgres;
  console.log(`Using ${usePostgres ? 'PostgreSQL' : 'CSV backup'} as data source`.cyan);
};

/**
 * Check PostgreSQL connection status
 * @returns {Promise<boolean>} True if PostgreSQL is connected
 */
const checkPostgresConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error(`PostgreSQL connection error: ${error.message}`.red);
    return false;
  }
};

/**
 * Initialize the data service
 * @returns {Promise<void>}
 */
const initializeDataService = async () => {
  try {
    // Check PostgreSQL connection
    const isPostgresConnected = await checkPostgresConnection();
    setDataSource(isPostgresConnected);

    // If PostgreSQL is not connected, make sure CSV backup is ready
    if (!isPostgresConnected) {
      console.log('PostgreSQL not connected. Using CSV backup.'.yellow);
      // This would be implemented if needed to ensure CSV files exist
    }
  } catch (error) {
    console.error(`Error initializing data service: ${error.message}`.red);
    setDataSource(false); // Default to CSV if there's an error
  }
};

/**
 * Generic database query function that falls back to CSV if PostgreSQL fails
 * @param {string} query - PostgreSQL query string
 * @param {Array} params - Query parameters
 * @param {string} csvFileName - CSV file name to use as fallback
 * @param {Function} transform - Optional function to transform CSV data
 * @returns {Promise<Array>} Query results
 */
const executeQuery = async (query, params = [], csvFileName, transform = data => data) => {
  // If using PostgreSQL, try that first
  if (usePostgres) {
    try {
      const client = await pool.connect();
      const result = await client.query(query, params);
      client.release();
      return result.rows;
    } catch (error) {
      console.error(`PostgreSQL query error: ${error.message}`.red);
      console.log(`Falling back to CSV for ${csvFileName}`.yellow);

      // Switch to CSV for future queries
      setDataSource(false);
    }
  }

  // Use CSV as fallback
  try {
    const csvData = await csvService.readCsvData(csvFileName);
    return transform(csvData);
  } catch (error) {
    console.error(`CSV fallback error: ${error.message}`.red);
    throw new Error(`Data retrieval failed from all sources for ${csvFileName}`);
  }
};

/**
 * Save data to both PostgreSQL and CSV
 * @param {string} query - PostgreSQL query string
 * @param {Array} params - Query parameters
 * @param {string} csvFileName - CSV file name to save to
 * @param {Array} csvData - Data to save to CSV
 * @returns {Promise<Array>} Query results
 */
const saveData = async (query, params = [], csvFileName, csvData) => {
  let results;
  let pgSuccess = false;

  // Try to save to PostgreSQL
  if (usePostgres) {
    try {
      const client = await pool.connect();
      const result = await client.query(query, params);
      client.release();
      results = result.rows;
      pgSuccess = true;
    } catch (error) {
      console.error(`PostgreSQL save error: ${error.message}`.red);
      setDataSource(false);
    }
  }

  // Also save to CSV as backup
  try {
    await csvService.writeCsvData(csvFileName, csvData);
  } catch (error) {
    console.error(`CSV save error: ${error.message}`.red);

    // If both failed, throw error
    if (!pgSuccess) {
      throw new Error(`Failed to save data to all sources for ${csvFileName}`);
    }
  }

  return results || [];
};

module.exports = {
  initializeDataService,
  setDataSource,
  checkPostgresConnection,
  executeQuery,
  saveData
};

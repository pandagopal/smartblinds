const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createObjectCsvWriter } = require('csv-writer');
const colors = require('colors');

const CSV_DIR = path.join(__dirname, '../data/csv');

// Ensure CSV directory exists
if (!fs.existsSync(CSV_DIR)) {
  fs.mkdirSync(CSV_DIR, { recursive: true });
}

/**
 * Read data from a CSV file
 * @param {string} fileName - The name of the CSV file without extension
 * @returns {Promise<Array>} - Array of objects from the CSV
 */
const readCsvData = async (fileName) => {
  const filePath = path.join(CSV_DIR, `${fileName}.csv`);

  // Check if file exists, if not return empty array
  if (!fs.existsSync(filePath)) {
    console.warn(`CSV file ${fileName}.csv does not exist. Returning empty array.`.yellow);
    return [];
  }

  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        // Convert string numbers to actual numbers
        const parsedResults = results.map(item => {
          const parsedItem = { ...item };

          // Parse numbers
          Object.keys(parsedItem).forEach(key => {
            if (!isNaN(parsedItem[key]) && parsedItem[key] !== '') {
              parsedItem[key] = Number(parsedItem[key]);
            }

            // Parse booleans
            if (parsedItem[key] === 'true') parsedItem[key] = true;
            if (parsedItem[key] === 'false') parsedItem[key] = false;
          });

          return parsedItem;
        });

        resolve(parsedResults);
      })
      .on('error', (error) => reject(error));
  });
};

/**
 * Write data to a CSV file
 * @param {string} fileName - The name of the CSV file without extension
 * @param {Array} data - Array of objects to write to CSV
 * @returns {Promise<void>}
 */
const writeCsvData = async (fileName, data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn(`No data to write to ${fileName}.csv`.yellow);
    return;
  }

  const filePath = path.join(CSV_DIR, `${fileName}.csv`);

  // Get header from first item
  const header = Object.keys(data[0]).map(id => ({ id, title: id }));

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header
  });

  try {
    await csvWriter.writeRecords(data);
    console.log(`Data written to ${fileName}.csv`.green);
  } catch (error) {
    console.error(`Error writing to ${fileName}.csv: ${error.message}`.red);
    throw error;
  }
};

/**
 * Generate initial CSV files from static data
 * @param {Object} staticData - Object containing arrays of static data
 * @returns {Promise<void>}
 */
const generateInitialCsvData = async (staticData) => {
  try {
    const tasks = Object.entries(staticData).map(([key, data]) =>
      writeCsvData(key, data)
    );

    await Promise.all(tasks);
    console.log('Initial CSV data generated successfully'.green);
  } catch (error) {
    console.error(`Error generating initial CSV data: ${error.message}`.red);
    throw error;
  }
};

module.exports = {
  readCsvData,
  writeCsvData,
  generateInitialCsvData
};

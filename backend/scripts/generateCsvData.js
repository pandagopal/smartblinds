const path = require('path');
const fs = require('fs');
const { generateInitialCsvData } = require('../utils/csvDataService');

// Import static data
const { SAMPLE_PRODUCTS } = require('../../src/models/Product');
const { SAMPLE_CATEGORIES } = require('../../src/models/Category');

// Add any additional static data imports here

// Prepare data for CSV format
const prepareProducts = (products) => {
  return products.map(product => {
    // Extract basic product properties
    const baseProduct = {
      id: product.id,
      title: product.title,
      categoryId: product.categoryId,
      description: product.description,
      category: product.category,
      price: product.price || product.basePrice || 0,
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      colors: JSON.stringify(product.colors || []),
      features: JSON.stringify(product.features || []),
      image: product.image || '',
      inStock: product.inStock !== false,
      special: product.special || false,
      featured: product.featured || false
    };

    return baseProduct;
  });
};

const prepareCategories = (categories) => {
  return categories.map(category => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image || '',
    description: category.description || ''
  }));
};

// Run the data generation
const runDataGeneration = async () => {
  try {
    console.log('Starting CSV data generation...');

    // Create CSV directory if it doesn't exist
    const csvDir = path.join(__dirname, '../data/csv');
    if (!fs.existsSync(csvDir)) {
      fs.mkdirSync(csvDir, { recursive: true });
    }

    // Prepare and format the data
    const products = prepareProducts(SAMPLE_PRODUCTS);
    const categories = prepareCategories(SAMPLE_CATEGORIES);

    // Generate all CSV files
    await generateInitialCsvData({
      products,
      categories
      // Add more data types here when needed
    });

    console.log('CSV data generation completed successfully!');
  } catch (error) {
    console.error(`Error generating CSV data: ${error.message}`);
    process.exit(1);
  }
};

// Run the function if called directly
if (require.main === module) {
  runDataGeneration();
}

module.exports = runDataGeneration;

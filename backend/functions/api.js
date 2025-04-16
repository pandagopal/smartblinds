const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { initializeDataService } = require('../utils/dataService');
const runDataGeneration = require('../scripts/generateCsvData');
const { initializeDatabase } = require('../utils/dbInit');

// Import routes
const productRoutes = require('../api/routes/productRoutes');
const categoryRoutes = require('../api/routes/categoryRoutes');
const cartRoutes = require('../api/routes/cartRoutes');
const orderRoutes = require('../api/routes/orderRoutes');
const userRoutes = require('../api/routes/userRoutes');
const vendorRoutes = require('../api/routes/vendorRoutes');
const vendorAdminRoutes = require('../api/routes/vendorAdminRoutes');

// Create express app
const app = express();

// Initialize data service with fallback to CSV
(async () => {
  try {
    // Initialize data service (will use CSV in serverless environment)
    await initializeDataService();

    // Initialize database tables
    await initializeDatabase();

    // Generate CSV data for backup
    await runDataGeneration();

    console.log('Serverless function data service initialized');
  } catch (error) {
    console.error('Error initializing serverless data service:', error);
  }
})();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);
app.use('/vendor/products', vendorRoutes);
app.use('/vendor/admin', vendorAdminRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Blinds API is running'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`API Error: ${err.message}`);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Export the serverless handler
module.exports.handler = serverless(app, {
  binary: ['image/*', 'application/pdf', 'application/zip']
});

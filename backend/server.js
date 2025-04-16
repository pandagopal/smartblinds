const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const path = require('path');
const database = require('./config/db.js'); // Changed variable name from db to database
const util = require('util'); // Added for console logging

// Force immediate console output
console.log = function() {
  process.stdout.write(util.format.apply(this, arguments) + '\n');
};
console.error = function() {
  process.stderr.write(util.format.apply(this, arguments) + '\n');
};

// Add explicit startup logs
console.log('='.repeat(80));
console.log('SERVER STARTING UP - DEBUGGING MODE');
console.log('='.repeat(80));

// Load env vars
dotenv.config();

// Create Express app
const app = express();

// Body parser
app.use(express.json());

// Enable CORS - customize as needed
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));

// Set up a basic root route that always works
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Blinds API Server',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Add a simple health check endpoint
app.get('/api/health', (req, res) => {
  console.log('[Health Check] Received health check request');
  res.json({
    success: true,
    message: 'API server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Initialize database pool (doesn't connect yet)
const pool = database.initPool(); // Initialize the database pool
console.log('Database pool initialized and ready for connections');

// API Routes
try {
  app.use('/api/auth', require('./api/routes/authRoutes'));
  app.use('/api/products', require('./api/routes/productRoutes'));
  app.use('/api/categories', require('./api/routes/categoryRoutes'));
  app.use('/api/cart', require('./api/routes/cartRoutes'));
  app.use('/api/orders', require('./api/routes/orderRoutes'));
  app.use('/api/users', require('./api/routes/userRoutes'));
  app.use('/api/vendor', require('./api/routes/vendorRoutes'));
  app.use('/api/vendor-admin', require('./api/routes/vendorAdminRoutes'));
  app.use('/api/admin', require('./api/routes/adminRoutes'));

  // Add new routes
  app.use('/api/notifications', require('./api/routes/notificationRoutes'));
  app.use('/api/questions', require('./api/routes/questionRoutes'));
  app.use('/api/inventory-alerts', require('./api/routes/inventoryAlertRoutes'));
  app.use('/api/shipments', require('./api/routes/shipmentRoutes'));
  app.use('/api/carriers', require('./api/routes/carrierRoutes'));
} catch (error) {
  console.error(`Error loading routes: ${error.message}`.red);
  console.error(error.stack);
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../dist')));

  // Any route not matching the API should serve the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`API Error: ${err.message}`.red);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Start server
const PORT = process.env.PORT || 5000;

console.log('=====================================');
console.log(`ATTEMPTING TO START SERVER ON PORT ${PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log('=====================================');

const server = app.listen(PORT, () => {
  console.log('=====================================');
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`.yellow.bold
  );
  console.log('Server is now ready to accept connections');
  console.log('=====================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`.red);
  console.error(err.stack);
  // Don't crash the server for unhandled rejections in development
  if (process.env.NODE_ENV === 'production') {
    // Close server & exit process with failure
    server.close(() => process.exit(1));
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Error: ${err.message}`.red);
  console.error(err.stack);
  // Don't crash the server for uncaught exceptions in development
  if (process.env.NODE_ENV === 'production') {
    // Close server & exit process with failure
    server.close(() => process.exit(1));
  }
});

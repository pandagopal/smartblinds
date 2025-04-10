const express = require('express');
const dotenv = require('dotenv');
const colors = require('colors');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { initializeDataService } = require('./utils/dataService');
const runDataGeneration = require('./scripts/generateCsvData');

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

// Initialize database service
const initializeApp = async () => {
  try {
    // Connect to PostgreSQL
    await connectDB();

    // Initialize data service (with CSV fallback)
    await initializeDataService();

    // Generate CSV data for backup
    await runDataGeneration();

    console.log('Application initialized successfully'.green);
  } catch (error) {
    console.error(`Application initialization failed: ${error.message}`.red);
  }
};

// Run initialization
initializeApp();

// API Routes
app.use('/api/products', require('./api/routes/productRoutes'));
app.use('/api/categories', require('./api/routes/categoryRoutes'));
app.use('/api/cart', require('./api/routes/cartRoutes'));
app.use('/api/orders', require('./api/routes/orderRoutes'));
app.use('/api/users', require('./api/routes/userRoutes'));

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

app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`.red);
  // Close server & exit process with failure
  // server.close(() => process.exit(1));
});

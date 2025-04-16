# PostgreSQL Database Migration Guide

This document provides a comprehensive guide for migrating the SmartBlindsHub application from using static data to a fully functional PostgreSQL database with a proper backend API.

## Current Implementation

The application now uses a simulated database service that mimics the functionality of a PostgreSQL database, but still uses the static data from the codebase. This serves as a bridge between the current implementation and a full database migration.

### Key Files

1. **src/services/db.ts** - A mock database service that simulates PostgreSQL queries
2. **src/services/api.ts** - Updated API service that uses the mock database service
3. **database/schema.sql** - Complete PostgreSQL schema with tables, relationships, and sample data
4. **database/db-connector.js** - Node.js utility for connecting to PostgreSQL and performing database operations
5. **database/README.md** - Documentation for the database schema

## Migration Steps

### 1. Set Up PostgreSQL Database

1. Install PostgreSQL on your server
2. Create a new database for the application:
   ```bash
   createdb smartblindshub
   ```
3. Run the schema.sql script to create tables and insert sample data:
   ```bash
   psql -d smartblindshub -f database/schema.sql
   ```

### 2. Create a Backend API

1. Create a new Node.js/Express project for the backend API:
   ```bash
   mkdir backend
   cd backend
   bun init
   ```

2. Install necessary dependencies:
   ```bash
   bun add express cors pg dotenv
   bun add -d @types/express @types/pg @types/cors
   ```

3. Copy the database connector from `database/db-connector.js` to your backend project.

4. Create the following API endpoints:

   ```javascript
   // Example routes using Express
   const express = require('express');
   const router = express.Router();
   const {
     productQueries,
     categoryQueries
   } = require('../utils/db-connector');

   // Get all products
   router.get('/products', async (req, res) => {
     try {
       const products = await productQueries.getAllProducts();
       res.json(products);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });

   // Get product by ID
   router.get('/products/:id', async (req, res) => {
     try {
       const product = await productQueries.getProductById(req.params.id);
       res.json(product);
     } catch (error) {
       res.status(404).json({ error: error.message });
     }
   });

   // Get related products
   router.get('/products/:id/related', async (req, res) => {
     try {
       const limit = parseInt(req.query.limit) || 4;
       const relatedProducts = await productQueries.getRelatedProducts(req.params.id, limit);
       res.json(relatedProducts);
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });

   // Additional endpoints for categories, product filtering, etc.
   ```

### 3. Update Frontend Services

1. Update `src/services/api.ts` to use real HTTP requests to the backend API:

   ```typescript
   // Example update for the getProducts function
   export const getProducts = async (): Promise<Product[]> => {
     try {
       const response = await fetch(`${API_BASE_URL}/products`);

       if (!response.ok) {
         throw new Error(`API error: ${response.status}`);
       }

       const products = await response.json();
       return products;
     } catch (error) {
       console.error('Error fetching products:', error);
       throw error;
     }
   };
   ```

2. Update environment configuration in `.env`:

   ```
   # API Configuration
   API_BASE_URL=http://localhost:3001/api
   ```

## Database Schema Overview

The PostgreSQL schema includes the following tables:

- **categories**: Product categories
- **products**: Core product information
- **product_images**: Product images
- **materials**: Available materials
- **product_materials**: Material options for products
- **features**: Product features
- **product_features**: Features associated with products
- **colors**: Color options
- **product_colors**: Color options for products
- **dimension_types**: Types of dimensions (width, height)
- **product_dimensions**: Dimension configurations for products
- **price_matrix**: Price lookup table based on dimensions
- **users**: User accounts
- **addresses**: User addresses
- **carts**: Shopping carts
- **cart_items**: Items in shopping carts
- **wishlist**: User wishlists
- **wishlist_items**: Items in wishlists
- **order_status**: Order status options
- **orders**: Order information
- **order_items**: Items in orders
- **payments**: Payment information
- **reviews**: Product reviews
- **shipping_methods**: Shipping methods
- **shipping_zones**: Geographic shipping zones
- **shipping_rates**: Shipping rates
- **coupons**: Discount coupons
- **measurement_requests**: In-home measurement requests
- **installation_requests**: Installation service requests

## Database Views

The schema also includes useful views:

- **product_details_view**: Comprehensive product information
- **active_orders_view**: Currently active orders
- **product_pricing_summary**: Summary of product pricing options

## Performance Considerations

- The schema includes appropriate indexes for common query patterns
- Foreign key constraints ensure data integrity
- Views simplify complex data access patterns
- The database design follows normalization principles for efficient storage

## Security Considerations

- Use environment variables for database credentials
- Implement proper authentication and authorization in your API
- Use prepared statements to prevent SQL injection
- Limit database user permissions to only what's necessary

## Testing the Migration

1. Create a staging environment to test the migration
2. Run both the static data and database versions side by side
3. Compare results to ensure consistency
4. Perform load testing to ensure performance
5. Once validated, perform the migration on the production environment

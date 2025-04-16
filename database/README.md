# SmartBlindsHub Database Schema

This directory contains the PostgreSQL database schema for the SmartBlindsHub e-commerce website. The schema is designed to efficiently store and retrieve data for an online blinds store, supporting all the core functionality required for selling window treatments online.

## Schema Overview

The database schema is designed with the following key components:

1. **Product Management:** Detailed structure for storing products, categories, features, materials, colors, and dimensions
2. **User Management:** User accounts, addresses, and authentication
3. **Order Processing:** Cart, checkout, orders, and payments
4. **Shipping & Delivery:** Shipping methods, rates, and delivery tracking
5. **Promotions & Discounts:** Coupons and promotional campaigns
6. **Reviews & Ratings:** Customer feedback and product ratings

## Table Structure

### Core Product Tables
- `categories`: Product categories and their hierarchical structure
- `products`: Core product information including name, description, and base price
- `product_images`: Images associated with products
- `materials`: Available materials for products
- `product_materials`: Association between products and materials
- `features`: Product features like "cordless", "blackout", etc.
- `product_features`: Association between products and features
- `colors`: Available colors with hex code values
- `product_colors`: Association between products and colors
- `dimension_types`: Types of dimensions (width, height, etc.)
- `product_dimensions`: Configuration of dimensions for each product
- `price_matrix`: Pricing based on product dimensions

### User & Authentication Tables
- `users`: User account information
- `addresses`: User shipping and billing addresses

### Order & Cart Tables
- `carts`: Shopping cart information
- `cart_items`: Items in a user's cart
- `wishlist`: User's saved products
- `wishlist_items`: Items in a user's wishlist
- `order_status`: Possible statuses for orders
- `orders`: Order information
- `order_items`: Items included in an order
- `payments`: Payment information for orders

### Shipping & Delivery Tables
- `shipping_methods`: Available shipping methods
- `shipping_zones`: Geographic shipping zones
- `shipping_rates`: Shipping rates based on method and zone

### Promotions & Discounts Tables
- `coupons`: Discount coupons and promotional codes
- `coupon_categories`: Categories applicable for specific coupons
- `coupon_products`: Products applicable for specific coupons

### Additional Feature Tables
- `reviews`: Product reviews and ratings
- `measurement_requests`: In-home measurement service requests
- `installation_requests`: Professional installation service requests

## Views

The schema includes several useful views:

1. `product_details_view`: Consolidated product information with category and primary image
2. `active_orders_view`: Active orders with status information
3. `product_pricing_summary`: Summary of product pricing options

## Sample Data

The schema includes sample data for all tables, providing a realistic starting point for development and testing.

## Installation and Usage

To use this database schema:

1. Ensure you have PostgreSQL installed and running
2. Run the schema.sql file to create the database and all tables:

```bash
psql -f schema.sql
```

## Integration with Application

The current SmartBlindsHub application uses a static data structure in `src/models/Product.ts`. To migrate to this PostgreSQL database:

1. Set up a database connection in your application
2. Replace the static data access with database queries
3. Implement a data access layer to abstract database operations

## Performance Considerations

- The schema includes appropriate indexes for common query patterns
- Foreign key constraints ensure data integrity
- Views provide simplified access to commonly used data combinations

## Notes on the Schema Design

- The schema uses the PostgreSQL SERIAL type for auto-incrementing primary keys
- Timestamps are automatically set for creation and update times
- Soft deletion is implemented in some tables using is_active flags
- The schema follows naming conventions for clarity and consistency

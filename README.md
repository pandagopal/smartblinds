# Smart Blinds Hub E-commerce Platform

A comprehensive e-commerce platform for selling custom window treatments (blinds, shades, shutters, etc.) with multi-role functionality for customers, vendors, sales representatives, installers, and administrators.

## Project Overview

Smart Blinds Hub provides a complete solution for browsing, configuring, and purchasing custom window treatments. The platform supports the entire customer journey from product discovery to installation, with specialized interfaces for each role in the process.

## Authentication

The platform uses JWT-based authentication with role-based access control.

### Default Admin Credentials
- **Email**: admin@smartblindshub.com
- **Password**: admin123

## User Roles

### 1. Customer
- Browse products by category
- Configure custom window treatments
- Save configurations and products to wishlist
- Manage shopping cart
- Place orders
- Track order status

### 2. Vendor
Access to Vendor Portal with functionality for:
- Company profile management
- Product catalog management (add/edit/configure products)
- Order management
- Contact information
- Manufacturing details
- Shipping addresses
- Business hours
- Legal documents

### 3. Admin
Comprehensive dashboard with:
- System statistics overview
- Vendor management
- Product management
- Order management
- User management
- System settings

### 4. Sales Person
Specialized interface for:
- Creating quotes
- Managing appointments
- Customer management
- Sales reports
- Performance tracking

### 5. Installer
Dashboard focused on:
- Installation schedule
- Job management
- Completed installations
- Customer information
- Material tracking

## Key Features

### Product Configurator
A sophisticated component that allows users to:
- Select dimensions with fraction precision
- Choose colors and materials
- Select mount types, control types, and other options
- View simulated previews
- Calculate pricing in real-time
- Add to cart or proceed to checkout
- Save configurations
- View augmented reality visualization
- Get style recommendations

### Shopping Cart
Full-featured cart functionality:
- Add/remove items
- Update quantities
- Apply promo codes
- Save items for later
- Save entire carts
- Calculate subtotals, tax, and shipping
- Proceed to checkout

## Technical Stack

- **Frontend**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **State Management**: React Hooks
- **API Communication**: Custom axios-based API service
- **Database**: PostgreSQL

## Project Structure

```
smartblinds/
├── backend/                # Backend API server
│   ├── api/                # API routes and controllers
│   ├── config/             # Configuration files
│   ├── controllers/        # Business logic
│   ├── middleware/         # Request middleware
│   ├── models/             # Data models
│   └── services/           # Service layer
├── database/               # Database schema and migrations
└── src/                    # Frontend React application
    ├── components/         # React components
    │   ├── admin/          # Admin-specific components
    │   ├── cart/           # Shopping cart components
    │   ├── configurator/   # Product configurator components
    │   ├── dashboards/     # Dashboard components for each role
    │   ├── sales/          # Sales person components
    │   └── vendor/         # Vendor-specific components
    ├── models/             # TypeScript interfaces
    ├── services/           # Frontend services
    └── utils/              # Utility functions
```

## Getting Started

### Prerequisites
- Node.js
- Bun package manager
- PostgreSQL database

### Installation
1. Clone the repository
2. Install dependencies: `bun install`
3. Set up the database using the SQL scripts in the database directory
4. Configure environment variables in `.env`
5. Start the development server: `bun run dev`

### Development Server
The development server will be available at `http://localhost:5173` by default.

### Database Setup
Initialize the database with sample data using:
```
psql -U postgres -f database/schema.sql
psql -U postgres -f database/migration.sql
```

## Notes for Development

- The authentication system is fully implemented with JWT tokens
- The admin user (admin@smartblindshub.com) is defined in the database migration scripts
- Use the roleTestingPanel in development mode to switch between different user roles for testing
- The product configurator handles real-time pricing calculations based on dimensions and options

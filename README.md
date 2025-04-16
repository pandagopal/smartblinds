# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
# Building the Blinds Clone Project in Visual Studio Code on Windows 11

Here are the step-by-step instructions to set up and build the project locally on your Windows 11 laptop using Visual Studio Code:

## Prerequisites

1. **Install Node.js and npm**:
   - Download and install from [nodejs.org](https://nodejs.org/)
   - Recommended version: Node.js 18.x or later

2. **Install Bun** (the project uses Bun as the package manager):
   - Open PowerShell or Command Prompt as Administrator
   - Run: `npm install -g bun`
   - Verify installation: `bun --version`

3. **Install Visual Studio Code**:
   - Download and install from [code.visualstudio.com](https://code.visualstudio.com/)

4. **Install recommended VS Code extensions**:
   - ESLint
   - Prettier
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense

## Setup Steps

1. **Extract the downloaded code**:
   - Create a folder where you want to store the project
   - Extract the downloaded ZIP file to that folder

2. **Open the project in VS Code**:
   - Open VS Code
   - Go to File > Open Folder
   - Navigate to and select the `blinds-clone` folder
   - Click "Select Folder"

3. **Install dependencies**:
   - Open a terminal in VS Code (Terminal > New Terminal)
   - Run:
     ```
     cd /path/to/blinds-clone
     bun install
     ```
   - This will install all the required dependencies from the package.json file

4. **Install react-error-boundary** (required for the ProductConfiguratorWrapper component):
   - In the same terminal, run:
     ```
     bun add react-error-boundary
     ```

## Running the Development Server

1. **Start the development server**:
   - In the terminal, run:
   - To run the project:
    ```
    Frontend: bun run dev
    Backend: bun run server
    Generate CSV data: bun run generate:csv
    ```
   - This will start the Vite development server

3. **Access the application**:
   - Open your browser and navigate to `http://localhost:5173`
   - The application should be running now

4. **Access the Product Configurator**:
   - Click on any product
   - Click on "Configure" or navigate directly to `http://localhost:5173/product/configure/product-2`

## Building for Production

When you're ready to build for production:

1. **Create a production build**:
   - In the terminal, run:
     ```
     bun run build
     ```
   - This creates a `dist` folder with optimized production files

2. **Preview the production build** (optional):
   - After building, run:
     ```
     bun run preview
     ```
   - Access the preview at `http://localhost:4173`

## Troubleshooting Common Issues

1. **Missing dependencies**:
   - If you see errors about missing packages, run `bun install` again
   - If specific packages are missing, install them with `bun add [package-name]`

2. **Port already in use**:
   - If port 5173 is already in use, Vite will automatically try to use the next available port
   - Check the terminal output for the actual URL

3. **Build errors related to modules**:
   - If you see errors about modules not being found, ensure the imports in your files match the actual file paths
   - Check for the `export default` statement in components that are being imported elsewhere

4. **Tailwind CSS not working**:
   - Ensure the Tailwind CSS configuration is properly set up in `tailwind.config.js`
   - Restart the development server after making changes to the configuration

By following these steps, you should be able to successfully build and run the Blinds Clone project on your Windows 11 laptop using Visual Studio Code. Let me know if you encounter any specific issues during the setup process.

## Git Test
Updated on: April 16, 2025

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

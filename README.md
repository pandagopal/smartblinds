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
     ```
    To run the project:

    Frontend: bun run dev
    Backend: bun run server
    Generate CSV data: bun run generate:csv
     ```
   - This will start the Vite development server

2. **Access the application**:
   - Open your browser and navigate to `http://localhost:5173`
   - The application should be running now

3. **Access the Product Configurator**:
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

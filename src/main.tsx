import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'
import './index.css'
import './App.css'
import App from './App.tsx'

// Get the root element
const rootElement = document.getElementById('root');

// Create root using the proper method
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);

  // Render the app
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error('Root element not found!');
}

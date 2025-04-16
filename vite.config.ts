import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist'
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Updated port to 5000
        changeOrigin: true,
        secure: false,
        logLevel: 'debug', // Add debug logging
      }
    }
  }
})

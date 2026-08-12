import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Remove console.* in production to save bytes and prevent info leakage
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — smallest, most-cached chunk
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react-core';
          }
          // React Router — changes less often than app code
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }
          // Axios — tiny, separate for cache efficiency
          if (id.includes('node_modules/axios')) {
            return 'axios';
          }
        },
      },
    },
  },
  define: {
    // Remove debug code in production
    __DEV__: false,
  },
})

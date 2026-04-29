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
    // 🔒 Security: disable source maps in production to prevent code exposure
    sourcemap: false,
    // 🔒 Security: minify and optimize
    minify: true,
  },
  define: {
    // 🔒 Security: remove debug code in production
    __DEV__: false,
  }
})


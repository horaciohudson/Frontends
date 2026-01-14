import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 🔧 fixa a porta
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/tax-situations': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/customer-physicals': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/customer-legals': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/customer-professionals': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/customer-financials': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/customer-photos': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/customer-addresses': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  publicDir: 'public',
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
});


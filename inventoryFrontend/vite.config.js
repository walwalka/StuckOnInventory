import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash]-qrfix.js`,
        chunkFileNames: `assets/[name]-[hash]-qrfix.js`,
        assetFileNames: `assets/[name]-[hash]-qrfix.[ext]`
      }
    }
  },
  server: {
    host: true,
    strictPort: true,
    port: 5080,
    watch: {
     usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5081',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:5081',
        changeOrigin: true,
        secure: false,
      }
    }
  }}
)

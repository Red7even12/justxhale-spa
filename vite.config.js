import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' 
import { readFileSync } from 'fs'

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5181,
    host: true,
    allowedHosts: [
      // This must contain your static domain
      'tritheistical-patrica-eluvial.ngrok-free.app' 
    ],

    proxy: {
      // This says: whenever a request starts with "/api",
      // forward it to the target server.
      '/api': {
        target: 'http://localhost:8011', // Your Laravel backend
        changeOrigin: true,
        // We don't need to rewrite the path, as Laravel expects '/api/...'
      },
      // Proxy storage assets as well
      '/storage': {
        target: 'http://localhost:8011',
        changeOrigin: true,
      }
  }
  }
})



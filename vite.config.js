import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path' 
import { readFileSync } from 'fs'
import { VitePWA } from 'vite-plugin-pwa'

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: true // 👈 Required for virtual:pwa-register during `npm run dev`
      },
      manifest: {
        name: 'JustXhale Operational Field Logbook',
        short_name: 'JustXhale Log',
        description: 'High-frequency operational logbook, daily pre-trips & field telemetry',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  
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



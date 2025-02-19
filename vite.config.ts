import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import Pages from 'vite-plugin-pages';

export default defineConfig({
  plugins: [
    react(),
    Pages({
      dirs: [{ dir: 'src/artifacts', baseRoute: '' }],
      extensions: ['jsx', 'tsx'],   
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Habit Tracker',
        short_name: 'Habits',
        description: 'Track your daily habits and routines',
        theme_color: '#111827',
        background_color: '#111827',
        display: 'standalone',
        scope: '/HabitTracker/',
        start_url: '/HabitTracker/',
        icons: [
          {
            src: '/HabitTracker/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/HabitTracker/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        navigateFallback: 'index.html'
      }
    })
  ],
  base: '/HabitTracker/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      'src': resolve(__dirname, './src'),
    }
  }
})

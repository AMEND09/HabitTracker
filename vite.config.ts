import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['virtual:generated-pages-react'],
      output: {
        manualChunks: undefined
      }
    }
  }
})

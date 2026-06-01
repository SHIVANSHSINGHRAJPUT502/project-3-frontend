import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Set to false for live production to hide your code logic
    chunkSizeWarningLimit: 1600,
  }
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/', // 🧠 Forces absolute path routing for cloud hosting environments
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, 
    chunkSizeWarningLimit: 1600,
  }
})
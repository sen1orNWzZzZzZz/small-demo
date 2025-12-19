import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:18080',
        changeOrigin: true,
        secure: false
      },
      '/system': {
        target: 'http://localhost:18080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

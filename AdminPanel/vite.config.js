import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // your backend URL
        changeOrigin: true,
      },
    },
  },
  plugins: [
    tailwindcss(),
  ],
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/projects/infertility-system/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://techleaf.pro/infertility-system',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})

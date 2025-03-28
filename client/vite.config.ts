import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

process.env = { ...process.env, ...loadEnv('', process.cwd()) }
export default defineConfig({
  plugins: [vue()],
  define: {
    VITE_BACKEND_URL: JSON.stringify(`${process.env.VITE_BACKEND_URL}`),
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nexari-mini-app/',
  build: {
    target: 'es2022'
  },
  esbuild: {
    target: 'es2022'
  }
})

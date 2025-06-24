import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
  ],
  base: '/nexari-mini-app/',
  build: {
    target: 'es2022'
  },
  esbuild: {
    target: 'es2022'
  }
})

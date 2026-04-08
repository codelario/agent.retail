import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  base: 'http://localhost:3002',
  plugins: [
    react(),
    federation({
      name: 'notificationMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './bootstrap': './src/bootstrap-export.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 3002,
    cors: true,
  },
  preview: {
    port: 3002,
    cors: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    outDir: 'dist',
  },
})

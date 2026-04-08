import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

/**
 * Vite configuration for client micro frontend application with module federation.
 * 
 * @property {string} base - The public base path for the application (http://localhost:3001)
 * @property {Array} plugins - Build plugins including React support and Vite plugin federation
 * @property {Object} plugins.federation - Module federation configuration
 * @property {string} plugins.federation.name - Identifier for this federated module ('clientMfe')
 * @property {string} plugins.federation.filename - Entry point file name for remote consumption ('remoteEntry.js')
 * @property {Object} plugins.federation.exposes - Modules exposed to remote consumers
 * @property {string} plugins.federation.exposes.'./bootstrap' - Exposes the bootstrap-export.tsx file under the 'bootstrap' alias. Remote applications will import this module as './bootstrap' rather than the full file path, enabling decoupled module consumption
 * @property {Array<string>} plugins.federation.shared - Dependencies shared among federated modules to avoid duplication (react, react-dom)
 * @property {Object} server - Development server configuration
 * @property {number} server.port - Development server port (3001)
 * @property {boolean} server.cors - Enable CORS for development server
 * @property {Object} preview - Preview server configuration (mirrors server settings)
 * @property {Object} build - Production build configuration
 * @property {string} build.target - ES version target for output (esnext - required by vite-plugin-federation)
 * @property {boolean} build.minify - Disable code minification for debugging purposes
 * @property {string} build.outDir - Output directory for build artifacts
 */
export default defineConfig({
  base: 'http://localhost:3001',
  plugins: [
    react(),
    federation({
      name: 'clientMfe',
      filename: 'remoteEntry.js',
      exposes: {
        './bootstrap': './src/bootstrap-export.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
  ],
  server: {
    port: 3001,
    cors: true,
  },
  preview: {
    port: 3001,
    cors: true,
  },
  build: {
    target: 'esnext', // requerido por vite-plugin-federation
    minify: false,
    outDir: 'dist',
  },
})

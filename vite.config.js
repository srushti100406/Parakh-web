import { defineConfig } from 'vite';

export default defineConfig({
  // Dev server: proxy /api requests to the local FastAPI backend.
  // In production, serve the built files behind the same origin as the backend,
  // or set VITE_API_BASE_URL to the deployed backend URL.
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});

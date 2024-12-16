import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to your Render backend during development
      '/api': {
        target: 'https://passwordmanager-mtph.onrender.com', // Replace with your Render backend URL
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    outDir: 'dist', // Default build output for Netlify
  },
});

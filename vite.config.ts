
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // We define this as a fallback to a global property to prevent Vite from 
    // hard-coding 'undefined' during the build process on Vercel.
    'process.env.API_KEY': 'globalThis.process?.env?.API_KEY || undefined'
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react'],
          utils: ['jspdf']
        }
      }
    }
  }
});

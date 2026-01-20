
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This ensures that 'process.env.API_KEY' in the code points to the 
    // actual window.process.env.API_KEY object at runtime.
    'process.env.API_KEY': '(window.process?.env?.API_KEY || "")'
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

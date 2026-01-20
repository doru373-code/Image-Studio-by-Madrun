
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Permite SDK-ului Gemini să citească cheia corectă injectată la runtime
    'process.env.API_KEY': '(window.process?.env?.API_KEY || "")'
  },
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    sourcemap: false,
    minify: 'terser'
  }
});

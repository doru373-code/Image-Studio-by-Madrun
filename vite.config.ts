
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  server: {
    port: 3000,
  },
  define: {
    // This allows process.env.API_KEY to be available in the browser
    // when building on Vercel or locally if the variable is present.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});

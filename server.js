
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Path to the built files (Vite output directory)
const distPath = path.join(__dirname, 'dist');

// Middleware to serve index.html with environment variable injection
// This handles both the root path and SPA routing fallbacks
const serveIndex = (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('Application build folder (dist/) not found. Please run "npm run build" in the console.');
  }

  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Server Error: Failed to load application.');
    }
    
    // Dynamically inject the API_KEY from Hostinger's environment into the frontend's process.env mock
    const apiKey = process.env.API_KEY || '';
    const injectedData = data.replace(
      '<script>window.process={env:{API_KEY:""}};</script>',
      `<script>window.process={env:{API_KEY:"${apiKey}"}};</script>`
    );
    
    res.send(injectedData);
  });
};

// Route for the root path
app.get('/', serveIndex);

// Serve all static assets (JS, CSS, images) from the dist folder
// We use { index: false } because we handle the root manually for injection
app.use(express.static(distPath, { index: false }));

// Fallback for SPA routing: ensures page refreshes and direct URLs don't 404
app.get('*', serveIndex);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n-----------------------------------------`);
  console.log(`🚀 Image Studio is live on port ${PORT}`);
  console.log(`🌐 Ready for Hostinger Deployment`);
  console.log(`🔑 API Key Status: ${process.env.API_KEY ? 'Active' : 'Missing (Set API_KEY in Hostinger dashboard)'}`);
  console.log(`-----------------------------------------\n`);
});

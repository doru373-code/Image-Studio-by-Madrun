
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Path to the built files
const distPath = path.join(__dirname, 'dist');

const serveIndex = (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    console.error('CRITICAL: dist/index.html not found. Please run "npm run build" in the Hostinger console.');
    return res.status(404).send('Application not built. Please run "npm run build" in your Hostinger dashboard terminal.');
  }

  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Server Error: Failed to load application.');
    }
    
    // Use the API_KEY from Hostinger's environment variables
    const apiKey = process.env.API_KEY || '';
    
    // Direct token replacement is the most reliable method for Hostinger deployments
    const injectedData = data.replace('__GEMINI_API_KEY__', apiKey);
    
    res.send(injectedData);
  });
};

// Route for the root path
app.get('/', serveIndex);

// Serve all static assets (JS, CSS, images) from the dist folder
app.use(express.static(distPath, { index: false }));

// Fallback for SPA routing (fixes "blank page" on refresh)
app.get('*', serveIndex);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n-----------------------------------------`);
  console.log(`🚀 Image Studio Production Server`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔑 API Key Configured: ${process.env.API_KEY ? 'YES' : 'NO (Check Hpanel Environment Variables)'}`);
  console.log(`-----------------------------------------\n`);
});

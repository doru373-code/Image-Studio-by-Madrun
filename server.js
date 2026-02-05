
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
    return res.status(404).send('Build folder not found. Please run "npm run build" in Hostinger terminal.');
  }

  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error loading application.');
    }
    
    // Use Regex to find the API_KEY injection point. 
    // This is more robust than exact string matching if Vite minifies the HTML.
    const apiKey = process.env.API_KEY || '';
    
    // This regex looks for the window.process mock and replaces the empty string with the real key
    const injectedData = data.replace(
      /window\.process\s*=\s*\{env\s*:\s*\{API_KEY\s*:\s*""\}\}/g,
      `window.process={env:{API_KEY:"${apiKey}"}}`
    );
    
    res.send(injectedData);
  });
};

app.get('/', serveIndex);
app.use(express.static(distPath, { index: false }));
app.get('*', serveIndex);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🔑 Hostinger API_KEY Detection: ${process.env.API_KEY ? 'SUCCESS' : 'FAILED (Check Environment Variables in Hpanel)'}`);
});

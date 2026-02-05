
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const distPath = path.join(__dirname, 'dist');

const serveIndex = (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    return res.status(404).send('Build folder not found. Did you run "npm run build"?');
  }

  fs.readFile(indexPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error loading index.html');
    }
    
    const apiKey = process.env.API_KEY || '';
    
    // Replace the placeholder script for runtime key injection on Hostinger
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
  console.log(`🚀 Hostinger Server active on port ${PORT}`);
  if (process.env.API_KEY) {
    console.log(`✅ API_KEY found in environment (starts with: ${process.env.API_KEY.substring(0, 4)}...)`);
  } else {
    console.error(`❌ API_KEY NOT FOUND in Hostinger environment variables!`);
  }
});

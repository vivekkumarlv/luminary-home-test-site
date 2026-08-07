// Simple static file server for the Luminary Home test site.
// Run: node serve.js (from test-sites/ecommerce/)
// Visit: http://localhost:4000

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(ROOT, req.url === '/' ? '/index.html' : req.url.split('?')[0]);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }

  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') { res.writeHead(404); res.end('Not found'); }
      else { res.writeHead(500); res.end('Server error'); }
      return;
    }
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Luminary Home test site: http://localhost:${PORT}`);
  console.log('Pages: index.html | products.html | product.html?id=SKU-001 | cart.html | checkout.html | confirmation.html');
  console.log('Press Ctrl+C to stop');
});

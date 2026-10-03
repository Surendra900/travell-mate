import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const distDir = path.resolve('./dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(distDir, reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4180, async () => {
  console.log('Server started on 4180');
  const browser = await puppeteer.launch({ executablePath: edgePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message, '\n', err.stack));

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('travelmate-location-onboarding', 'dismissed');
    localStorage.setItem('travelmate-storage-consent', 'granted');
  });

  await page.goto('http://localhost:4180/planner?from=Delhi&to=Mumbai', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  console.log('Finding booking-search-button...');
  const searchBtn = await page.$('.booking-search-button');
  if (searchBtn) {
    console.log('Clicking search button...');
    await searchBtn.click();
    await new Promise(r => setTimeout(r, 3000));
  }
  await page.screenshot({ path: 'C:/Users/SURENDRA.G/.gemini/antigravity/brain/e26689ab-38ae-4aa7-8cd7-6b8dae31b7f8/debug_results.png' });
  console.log('debug_results.png saved');

  await browser.close();
  server.close();
});

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:/Users/SURENDRA.G/.gemini/antigravity/brain/e26689ab-38ae-4aa7-8cd7-6b8dae31b7f8';

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

function createStaticServer(distDir, port) {
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

  return new Promise((resolve) => {
    server.listen(port, () => resolve(server));
  });
}

async function main() {
  const beforeDist = path.resolve('../travelmate-before/dist');
  const afterDist = path.resolve('./dist');

  console.log('Capturing BEFORE state on port 4173...');
  const beforeServer = await createStaticServer(beforeDist, 4173);
  let browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
    });

    // Before Home
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'before_01_home.png') });
    console.log('Saved before_01_home.png');

    // Before Results
    await page.goto('http://localhost:4173/planner?from=Delhi&to=Mumbai', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    const searchBtn = await page.$('.booking-search-button');
    if (searchBtn) {
      await searchBtn.click();
      await new Promise(r => setTimeout(r, 3000));
    }
    await page.screenshot({ path: path.join(artifactDir, 'before_02_results.png') });
    console.log('Saved before_02_results.png');
  } finally {
    await browser.close();
    beforeServer.close();
  }

  console.log('Capturing AFTER state on port 4174...');
  const afterServer = await createStaticServer(afterDist, 4174);
  browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1100 });
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
    });

    // After Home
    await page.goto('http://localhost:4174/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(artifactDir, 'after_01_home.png') });
    console.log('Saved after_01_home.png');

    // After Results
    await page.goto('http://localhost:4174/planner?from=Delhi&to=Mumbai', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    const searchBtn = await page.$('.booking-search-button');
    if (searchBtn) {
      await searchBtn.click();
      await new Promise(r => setTimeout(r, 3000));
    }
    await page.screenshot({ path: path.join(artifactDir, 'after_02_multimodal_results.png') });
    console.log('Saved after_02_multimodal_results.png');

    // Scroll backdrop to show Tier 2 and Tier 3
    await page.evaluate(() => {
      const backdrop = document.querySelector('.live-results-backdrop');
      if (backdrop) backdrop.scrollTop = 550;
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(artifactDir, 'after_03_tiers_2_and_3.png') });
    console.log('Saved after_03_tiers_2_and_3.png');
  } finally {
    await browser.close();
    afterServer.close();
  }

  console.log('COMPLETED ALL REAL SCREENSHOTS!');
}

main();

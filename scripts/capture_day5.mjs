import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const artifactDir = 'C:/Users/SURENDRA.G/.gemini/antigravity/brain/e26689ab-38ae-4aa7-8cd7-6b8dae31b7f8';
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
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4197, async () => {
  console.log('Day 5 capture server running on port 4197...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1050 });

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
    });

    // 1. Capture Home Page with new PNR Predictor CTA and Banner
    console.log('Capturing Home Page with Day 5 PNR features...');
    await page.goto('http://localhost:4197/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const shot1 = path.join(artifactDir, 'day5_01_home_pnr_banner.png');
    await page.screenshot({ path: shot1 });
    console.log(`Saved: ${shot1}`);

    // 2. Open PNR Predictor Modal directly from Home
    console.log('Opening PNR Confirmation Predictor Modal...');
    await page.waitForSelector('#open-pnr-modal-btn');
    await page.click('#open-pnr-modal-btn');
    console.log('Clicked #open-pnr-modal-btn');
    await page.waitForSelector('#pnr-predictor-modal', { timeout: 8000 });
    await new Promise(r => setTimeout(r, 1000));

    const shot3 = path.join(artifactDir, 'day5_03_pnr_predictor_modal.png');
    await page.screenshot({ path: shot3 });
    console.log(`Saved: ${shot3}`);

    // Close modal
    const closeBtn = await page.$('#pnr-predictor-modal button');
    if (closeBtn) await closeBtn.click();
    await new Promise(r => setTimeout(r, 500));

    // 3. Navigate to Planner & Trigger Search to capture Station Hopper Quota Hack Card
    console.log('Navigating to Planner for Delhi -> Kanpur to capture Station Hopper...');
    await page.goto('http://localhost:4197/planner?from=Delhi&to=Kanpur', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const searchBtn = await page.$('.booking-search-button');
    if (searchBtn) {
      await searchBtn.click();
      await new Promise(r => setTimeout(r, 3000));
    }

    // Scroll to station hopper card
    await page.evaluate(() => {
      const hopper = document.querySelector('.station-hopper-container');
      if (hopper) {
        hopper.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });
    await new Promise(r => setTimeout(r, 800));

    const shot2 = path.join(artifactDir, 'day5_02_station_hopper_results.png');
    await page.screenshot({ path: shot2 });
    console.log(`Saved: ${shot2}`);

    console.log('All Day 5 screenshots successfully captured!');
  } catch (err) {
    console.error('Capture error:', err);
  } finally {
    await browser.close();
    server.close();
    process.exit(0);
  }
});

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

server.listen(4195, async () => {
  console.log('Day 4 capture server running on port 4195...');
  const browser = await puppeteer.launch({
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

    console.log('Navigating to Planner with Delhi -> Mumbai...');
    await page.goto('http://localhost:4195/planner?from=Delhi&to=Mumbai', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const searchBtn = await page.$('.booking-search-button');
    if (searchBtn) {
      await searchBtn.click();
      await new Promise(r => setTimeout(r, 3000));
    }

    // 1. Capture Card with visual progress track and new buttons
    const shot1 = path.join(artifactDir, 'day4_01_track_and_buttons.png');
    await page.screenshot({ path: shot1 });
    console.log(`Saved: ${shot1}`);

    // 2. Click "Station Transfer Guide" button to expand junction navigator
    const guideBtns = await page.$$('button');
    for (const btn of guideBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Station Transfer Guide')) {
        console.log('Clicking Station Transfer Guide button...');
        await btn.click();
        await new Promise(r => setTimeout(r, 1000));
        break;
      }
    }
    const shot2 = path.join(artifactDir, 'day4_02_expanded_junction_guide.png');
    await page.screenshot({ path: shot2 });
    console.log(`Saved: ${shot2}`);

    // 3. Click "Offline Pass" button to open boarding pass modal
    const passBtns = await page.$$('button');
    for (const btn of passBtns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Offline Pass')) {
        console.log('Clicking Offline Pass button...');
        await btn.click();
        await new Promise(r => setTimeout(r, 1200));
        break;
      }
    }

    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const modal = document.querySelector('div[role="dialog"]');
      if (modal) modal.scrollTop = 0;
    });
    await new Promise(r => setTimeout(r, 600));

    const shot3 = path.join(artifactDir, 'day4_03_offline_boarding_pass.png');
    await page.screenshot({ path: shot3 });
    console.log(`Saved: ${shot3}`);

  } catch (err) {
    console.error('Error in Day 4 capture:', err);
  } finally {
    await browser.close();
    server.close();
    console.log('Day 4 capture completed successfully!');
  }
});

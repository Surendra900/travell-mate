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

server.listen(4190, async () => {
  console.log('Day 3 capture server running on port 4190...');
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
    await page.goto('http://localhost:4190/planner?from=Delhi&to=Mumbai', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const searchBtn = await page.$('.booking-search-button');
    if (searchBtn) {
      await searchBtn.click();
      await new Promise(r => setTimeout(r, 3000));
    }

    // 1. Capture All Options view with WhatsApp Share button and AI reasoning box
    const shot1 = path.join(artifactDir, 'day3_01_all_and_whatsapp.png');
    await page.screenshot({ path: shot1 });
    console.log(`Saved: ${shot1}`);

    // 2. Click "🟢 Under ₹1,000" filter pill
    const filterButtons = await page.$$('button');
    for (const btn of filterButtons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Under ₹1,000')) {
        console.log('Clicking Under ₹1,000 filter...');
        await btn.click();
        await new Promise(r => setTimeout(r, 1000));
        break;
      }
    }
    const shot2 = path.join(artifactDir, 'day3_02_filter_budget.png');
    await page.screenshot({ path: shot2 });
    console.log(`Saved: ${shot2}`);

    // 3. Click "⚡ Fastest (< 12h)" filter pill
    const filterButtons2 = await page.$$('button');
    for (const btn of filterButtons2) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.includes('Fastest')) {
        console.log('Clicking Fastest filter...');
        await btn.click();
        await new Promise(r => setTimeout(r, 1000));
        break;
      }
    }
    const shot3 = path.join(artifactDir, 'day3_03_filter_fastest.png');
    await page.screenshot({ path: shot3 });
    console.log(`Saved: ${shot3}`);

  } catch (err) {
    console.error('Error in Day 3 capture:', err);
  } finally {
    await browser.close();
    server.close();
    console.log('Day 3 capture completed successfully!');
  }
});

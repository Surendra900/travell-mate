import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-9/after');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
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

server.listen(4208, async () => {
  console.log('Day 9 after-capture server running on port 4208...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing Day 9 AFTER for ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile || false
      });
      const page = await context.newPage();

      await page.addInitScript(() => {
        localStorage.setItem('travelmate-location-onboarding', 'dismissed');
        localStorage.setItem('travelmate-storage-consent', 'granted');
        localStorage.setItem('travelmate-current-plan', JSON.stringify({
          from: 'New Delhi',
          to: 'Kanpur Central',
          transportMode: 'Train',
          date: '2026-10-15',
          classType: '3A'
        }));
      });

      // Load planner
      await page.goto('http://localhost:4208/planner', { waitUntil: 'networkidle' });
      await page.waitForTimeout(600);

      // Now simulate offline context
      await context.setOffline(true);
      await page.waitForTimeout(600);

      await page.screenshot({ path: path.join(outDir, `low_network_${vp.name}.png`), fullPage: false });
      await context.close();
    }
    console.log('Day 9 AFTER screenshots saved in docs/screenshots/day-9/after!');
  } catch (err) {
    console.error('Error in Day 9 after capture:', err);
  } finally {
    await browser.close();
    server.close();
  }
});

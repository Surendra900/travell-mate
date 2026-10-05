import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-26/before');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
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
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4255, async () => {
  console.log('Day 26 before-capture server running on port 4255...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate_blind_voice_mode', 'standard');
    });

    const routes = [
      { name: 'mobile-home-before', path: '/' },
      { name: 'mobile-planner-before', path: '/planner' },
      { name: 'mobile-emergency-before', path: '/safety' }
    ];

    for (const r of routes) {
      console.log(`Capturing Day 26 BEFORE for ${r.name}...`);
      await page.goto(`http://localhost:4255${r.path}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);
      const screenshotPath = path.join(outDir, `${r.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved: ${screenshotPath}`);
    }

    await context.close();
  } catch (err) {
    console.error('Error during Day 26 BEFORE capture:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
    console.log('Day 26 BEFORE capture completed.');
  }
});

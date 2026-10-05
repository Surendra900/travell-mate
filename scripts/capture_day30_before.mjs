import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const beforeDir = path.resolve('./docs/screenshots/day-30/before');
if (!fs.existsSync(beforeDir)) {
  fs.mkdirSync(beforeDir, { recursive: true });
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

server.listen(4265, async () => {
  console.log('Capture Day 30 Before screenshots server running on 4265...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    // 1. Desktop 1440x900 on /
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktopPage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
    });
    await desktopPage.goto('http://localhost:4265/', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(600);
    const desktopShot = path.join(beforeDir, 'desktop-1440-home-before-day30.png');
    await desktopPage.screenshot({ path: desktopShot });
    console.log('Saved:', desktopShot);
    await desktopPage.close();

    // 2. Mobile 390x844 on /
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    await mobilePage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
    });
    await mobilePage.goto('http://localhost:4265/', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(600);
    const mobileShot = path.join(beforeDir, 'mobile-390-home-before-day30.png');
    await mobilePage.screenshot({ path: mobileShot });
    console.log('Saved:', mobileShot);
    await mobilePage.close();

    console.log('Day 30 BEFORE screenshots captured successfully!');
  } catch (err) {
    console.error('Failed to capture Day 30 BEFORE screenshots:', err);
  } finally {
    await browser.close();
    server.close();
  }
});

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const afterDir = path.resolve('./docs/screenshots/day-28/after');
if (!fs.existsSync(afterDir)) {
  fs.mkdirSync(afterDir, { recursive: true });
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

server.listen(4261, async () => {
  console.log('Capture Day 28 After screenshots server running on 4261...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    // 1. Desktop 1440x900 with Demo Tour Modal open
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktopPage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
    });
    await desktopPage.goto('http://localhost:4261/', { waitUntil: 'domcontentloaded' });
    await desktopPage.waitForTimeout(600);

    const tourBtn = desktopPage.locator('[data-testid="navbar-demo-tour-btn"]');
    if (await tourBtn.isVisible()) {
      await tourBtn.click();
    } else {
      await desktopPage.evaluate(() => window.dispatchEvent(new CustomEvent('travelmate:open-demo-tour')));
    }
    await desktopPage.waitForSelector('[data-testid="demo-tour-modal"]');
    await desktopPage.waitForTimeout(500);

    const desktopShot = path.join(afterDir, 'desktop-demotour-modal.png');
    await desktopPage.screenshot({ path: desktopShot });
    console.log('Saved:', desktopShot);
    await desktopPage.close();

    // 2. Mobile 390x844 with Demo Tour Modal open
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    await mobilePage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
    });
    await mobilePage.goto('http://localhost:4261/', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(600);

    await mobilePage.evaluate(() => window.dispatchEvent(new CustomEvent('travelmate:open-demo-tour')));
    await mobilePage.waitForSelector('[data-testid="demo-tour-modal"]');
    await mobilePage.waitForTimeout(500);

    const mobileShot = path.join(afterDir, 'mobile-demotour-modal.png');
    await mobilePage.screenshot({ path: mobileShot });
    console.log('Saved:', mobileShot);
    await mobilePage.close();

    console.log('Day 28 AFTER screenshots captured successfully!');
  } catch (err) {
    console.error('Failed to capture Day 28 AFTER screenshots:', err);
  } finally {
    await browser.close();
    server.close();
  }
});

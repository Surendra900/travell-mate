import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const afterDir = path.resolve('./docs/screenshots/day-30/after');
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

server.listen(4266, async () => {
  console.log('Capture Day 30 After screenshots server running on 4266...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    // 1. Desktop 1440x900 on production Vercel
    const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await desktopPage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
    });
    
    // Navigate to live production Vercel or local fallback
    try {
      await desktopPage.goto('https://travelmate-ai-flowzint.vercel.app/', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await desktopPage.waitForTimeout(1000);
    } catch {
      await desktopPage.goto('http://localhost:4266/', { waitUntil: 'domcontentloaded' });
      await desktopPage.waitForTimeout(600);
    }

    const desktopShot = path.join(afterDir, 'desktop-1440-production-home-day30.png');
    await desktopPage.screenshot({ path: desktopShot });
    console.log('Saved:', desktopShot);
    await desktopPage.close();

    // 2. Mobile 390x844 on production Vercel
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    await mobilePage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
    });
    
    try {
      await mobilePage.goto('https://travelmate-ai-flowzint.vercel.app/', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await mobilePage.waitForTimeout(1000);
    } catch {
      await mobilePage.goto('http://localhost:4266/', { waitUntil: 'domcontentloaded' });
      await mobilePage.waitForTimeout(600);
    }

    const mobileShot = path.join(afterDir, 'mobile-390-production-home-day30.png');
    await mobilePage.screenshot({ path: mobileShot });
    console.log('Saved:', mobileShot);
    await mobilePage.close();

    // 3. Desktop 1440x900 on production Vercel /planner
    const plannerPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await plannerPage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
    });
    try {
      await plannerPage.goto('https://travelmate-ai-flowzint.vercel.app/#planner', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await plannerPage.waitForTimeout(1000);
    } catch {
      await plannerPage.goto('http://localhost:4266/#planner', { waitUntil: 'domcontentloaded' });
      await plannerPage.waitForTimeout(600);
    }
    const plannerShot = path.join(afterDir, 'desktop-1440-production-planner-day30.png');
    await plannerPage.screenshot({ path: plannerShot });
    console.log('Saved:', plannerShot);
    await plannerPage.close();

    console.log('Day 30 AFTER screenshots captured successfully!');
  } catch (err) {
    console.error('Failed to capture Day 30 AFTER screenshots:', err);
  } finally {
    await browser.close();
    server.close();
  }
});

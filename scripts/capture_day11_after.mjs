import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-11/after');

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
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4212, async () => {
  console.log('Day 11 after-capture server running on port 4212...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    // 1. Desktop Screenshots
    console.log('Capturing Day 11 AFTER Desktop screenshots...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await desktopContext.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.removeItem('travelmate-blind-mode');
    });

    await page.goto('http://localhost:4212/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Gate should be visible
    const gate = page.locator('[data-testid="blind-voice-gate"]');
    if (await gate.isVisible()) {
      await page.screenshot({
        path: path.join(outDir, 'desktop_blind_voice_gate.png'),
        fullPage: false
      });

      // Click YES to enable mode
      const yesBtn = page.locator('[data-testid="blind-gate-yes"]');
      await yesBtn.click();
      await page.waitForTimeout(600);

      // Capture desktop with active voice banner
      await page.screenshot({
        path: path.join(outDir, 'desktop_voice_mode_active.png'),
        fullPage: false
      });
    }

    await desktopContext.close();

    // 2. Mobile Screenshots
    console.log('Capturing Day 11 AFTER Mobile screenshots...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.removeItem('travelmate-blind-mode');
    });

    await mobilePage.goto('http://localhost:4212/', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);

    const mobileGate = mobilePage.locator('[data-testid="blind-voice-gate"]');
    if (await mobileGate.isVisible()) {
      await mobilePage.screenshot({
        path: path.join(outDir, 'mobile_blind_voice_gate.png'),
        fullPage: false
      });
    }

    await mobileContext.close();
    console.log('Day 11 AFTER screenshots captured successfully.');
  } catch (err) {
    console.error('Error capturing Day 11 AFTER screenshots:', err);
  } finally {
    await browser.close();
    server.close();
  }
});

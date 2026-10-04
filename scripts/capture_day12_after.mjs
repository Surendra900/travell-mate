import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-12/after');

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

server.listen(4215, async () => {
  console.log('Day 12 after-capture server running on port 4215...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    // 1. Desktop Screenshots
    console.log('Capturing Day 12 AFTER Desktop screenshots...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await desktopContext.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
    });

    await page.goto('http://localhost:4215/planner', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // Open voice search dialog
    const micBtn = page.locator('[data-testid="voice-search-launcher"]');
    if (await micBtn.isVisible()) {
      await micBtn.click();
      await page.waitForTimeout(400);

      // Type phonetic voice command into input
      const searchInput = page.locator('#voice-search-fallback');
      if (await searchInput.isVisible()) {
        await searchInput.fill('train from Dilli to Bombay tomorrow');
        await page.screenshot({
          path: path.join(outDir, 'desktop_voice_dialog_input.png'),
          fullPage: false
        });

        // Submit search
        const submitBtn = page.locator('[data-testid="voice-search-submit"]');
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(800);

          // Capture filled planner
          await page.screenshot({
            path: path.join(outDir, 'desktop_planner_phonetic_filled.png'),
            fullPage: false
          });
        }
      }
    }

    await desktopContext.close();

    // 2. Mobile Screenshots
    console.log('Capturing Day 12 AFTER Mobile screenshots...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
    });

    await mobilePage.goto('http://localhost:4215/planner', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);

    const mobileMicBtn = mobilePage.locator('button.floating-voice-action');
    if (await mobileMicBtn.isVisible()) {
      await mobileMicBtn.click();
      await mobilePage.waitForTimeout(400);
      await mobilePage.screenshot({
        path: path.join(outDir, 'mobile_voice_dialog.png'),
        fullPage: false
      });
    }

    await mobileContext.close();
    console.log('Day 12 AFTER screenshots captured successfully.');
  } catch (err) {
    console.error('Error capturing Day 12 AFTER screenshots:', err);
  } finally {
    await browser.close();
    server.close();
  }
});

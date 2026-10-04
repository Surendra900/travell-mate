import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-10/after');

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

server.listen(4210, async () => {
  console.log('Day 10 after-capture server running on port 4210...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    // 1. Desktop Screenshots
    console.log('Capturing Day 10 AFTER Desktop screenshots...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await desktopContext.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
    });

    // Desktop Urdu RTL view
    await page.goto('http://localhost:4210/', { waitUntil: 'networkidle' });
    const langSelect = page.locator('select[aria-label="Select website language"]');
    await langSelect.selectOption('ur');
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(outDir, 'desktop_home_urdu_rtl.png'),
      fullPage: false
    });

    // Desktop Hindi view
    await langSelect.selectOption('hi');
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(outDir, 'desktop_home_hindi.png'),
      fullPage: false
    });

    // Desktop Safety Mode with Emergency Phrase Cards
    await page.goto('http://localhost:4210/safety', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const phraseSection = page.locator('section[aria-label="Regional Emergency Phrases"]');
    if (await phraseSection.isVisible()) {
      await phraseSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(outDir, 'desktop_safety_phrase_cards.png'),
        fullPage: false
      });
    }

    await desktopContext.close();

    // 2. Mobile Screenshots
    console.log('Capturing Day 10 AFTER Mobile screenshots...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
    });

    await mobilePage.goto('http://localhost:4210/safety', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);
    const mobilePhraseSection = mobilePage.locator('section[aria-label="Regional Emergency Phrases"]');
    if (await mobilePhraseSection.isVisible()) {
      await mobilePhraseSection.scrollIntoViewIfNeeded();
      await mobilePage.waitForTimeout(400);
      await mobilePage.screenshot({
        path: path.join(outDir, 'mobile_safety_phrase_cards.png'),
        fullPage: false
      });
    }

    await mobileContext.close();
    console.log('Day 10 AFTER screenshots captured successfully.');
  } catch (err) {
    console.error('Error capturing Day 10 AFTER screenshots:', err);
  } finally {
    await browser.close();
    server.close();
  }
});

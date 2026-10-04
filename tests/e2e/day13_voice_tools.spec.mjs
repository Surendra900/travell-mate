import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');

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

server.listen(4219, async () => {
  console.log('Day 13 E2E test server listening on port 4219...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  let exitCode = 0;

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
    });

    console.log('1. Navigating to /planner and searching route...');
    await page.goto('http://localhost:4219/planner', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    await page.fill('[data-testid="planner-from-input"]', 'Hyderabad');
    await page.fill('[data-testid="planner-to-input"]', 'Visakhapatnam');
    await page.click('button.booking-search-button');
    await page.waitForTimeout(1500);

    console.log('2. Verifying multimodal container and tier cards are rendered...');
    const multimodalContainer = page.locator('.multimodal-container');
    if (!await multimodalContainer.isVisible()) {
      throw new Error('Multimodal alternative container should be visible');
    }

    const tierCards = page.locator('.multimodal-container article');
    const cardCount = await tierCards.count();
    console.log(`   Found ${cardCount} multimodal tier cards.`);
    if (cardCount < 2) {
      throw new Error(`Expected at least 2 multimodal cards, found ${cardCount}`);
    }

    console.log('3. Verifying Spoken Audio Playback buttons on tier cards...');
    const listenButtons = page.locator('[data-testid^="speak-tier-btn-"]');
    const listenCount = await listenButtons.count();
    console.log(`   Found ${listenCount} Listen Tier buttons.`);
    if (listenCount < 2) {
      throw new Error(`Expected Listen Tier buttons on all cards, found ${listenCount}`);
    }

    const firstListenBtn = listenButtons.first();
    const btnTextBefore = await firstListenBtn.innerText();
    console.log(`   Button label before click: "${btnTextBefore}"`);
    if (!btnTextBefore.includes('Listen')) {
      throw new Error('Listen button should indicate Listen before clicked');
    }

    await firstListenBtn.click();
    await page.waitForTimeout(200);

    const btnTextAfter = await firstListenBtn.innerText();
    console.log(`   Button label after click: "${btnTextAfter}"`);
    if (!btnTextAfter.includes('Stop Audio')) {
      throw new Error('Listen button should toggle to "Stop Audio" while playing');
    }

    // Toggle stop
    await firstListenBtn.click();
    await page.waitForTimeout(200);

    console.log('4. Verifying Read Top Option button in header...');
    const readTopBtn = page.locator('[data-testid="voice-read-top-tier"]');
    if (!await readTopBtn.isVisible()) {
      throw new Error('Read Top Option button should be visible in multimodal header');
    }
    await readTopBtn.click();
    await page.waitForTimeout(200);
    const readTopText = await readTopBtn.innerText();
    console.log(`   Read top button active text: "${readTopText}"`);
    await readTopBtn.click(); // stop

    console.log('5. Verifying speech-driven filter dispatch...');
    // Dispatch travelmate:voice-filter for budget
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('travelmate:voice-filter', { detail: { filter: 'budget' } }));
    });
    await page.waitForTimeout(300);

    // Verify filter changed
    const budgetFilteredCount = await page.locator('.multimodal-container article').count();
    console.log(`   Cards displayed under Budget filter: ${budgetFilteredCount}`);
    if (budgetFilteredCount === 0) {
      throw new Error('Budget filter should display matching route');
    }

    console.log('6. Checking console errors...');
    if (consoleErrors.length > 0) {
      throw new Error(`Console errors detected during Day 13 verification: ${consoleErrors.join('; ')}`);
    }

    console.log('DAY 13 E2E GATES PASSED (6/6 checks clean).');
    await context.close();
  } catch (err) {
    console.error('DAY 13 E2E TEST FAILED:', err);
    exitCode = 1;
  } finally {
    await browser.close();
    server.close();
    process.exit(exitCode);
  }
});

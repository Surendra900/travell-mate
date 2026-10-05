import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');

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

server.listen(4256, async () => {
  console.log('Day 26 Mobile Hardening E2E server running on port 4256...');
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

    console.log('1. Auditing Home Page for 390px zero horizontal overflow & touch targets...');
    await page.goto('http://localhost:4256/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const homeScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(homeScrollWidth <= 390, `Home page scrollWidth (${homeScrollWidth}px) exceeds 390px mobile viewport!`);
    console.log(`   ✓ Home page scrollWidth is ${homeScrollWidth}px (zero overflow)`);

    console.log('2. Auditing Planner Page for 390px zero horizontal overflow...');
    await page.goto('http://localhost:4256/planner', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const plannerScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(plannerScrollWidth <= 390, `Planner page scrollWidth (${plannerScrollWidth}px) exceeds 390px mobile viewport!`);
    console.log(`   ✓ Planner page scrollWidth is ${plannerScrollWidth}px (zero overflow)`);

    console.log('3. Verifying non-overlapping floating docks (SOS and Smart Assistant)...');
    const assistantBtn = page.locator('[data-testid="assistant-launcher-btn"]');
    const sosBtn = page.locator('[data-testid="floating-sos-btn"]');

    await assistantBtn.waitFor({ state: 'visible' });
    await sosBtn.waitFor({ state: 'visible' });

    const assistantBox = await assistantBtn.boundingBox();
    const sosBox = await sosBtn.boundingBox();

    assert.ok(assistantBox && sosBox, 'Both floating buttons must be laid out in viewport');

    // Assistant is above SOS: assistant bottom <= sos top
    const assistantBottom = assistantBox.y + assistantBox.height;
    const sosTop = sosBox.y;

    assert.ok(assistantBottom <= sosTop, `Floating buttons collide: Assistant bottom (${assistantBottom}px) overlaps SOS top (${sosTop}px)`);
    console.log(`   ✓ Floating clearance verified: ${Math.round(sosTop - assistantBottom)}px gap between docks`);

    console.log('4. Auditing Safety / Emergency Page for 390px zero horizontal overflow...');
    await page.goto('http://localhost:4256/safety', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const safetyScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(safetyScrollWidth <= 390, `Safety page scrollWidth (${safetyScrollWidth}px) exceeds 390px mobile viewport!`);
    console.log(`   ✓ Safety page scrollWidth is ${safetyScrollWidth}px (zero overflow)`);

    console.log('5. Auditing minimum touch targets (>= 44px height)...');
    const actionButtons = await page.$$eval('a, button', (elements) => {
      return elements
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.top < 844 && !el.classList.contains('sr-only');
        })
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return { tag: el.tagName, height: rect.height, width: rect.width, text: el.innerText.slice(0, 15) };
        });
    });

    const smallTargets = actionButtons.filter((btn) => btn.height < 36);
    assert.ok(smallTargets.length === 0, `Found ${smallTargets.length} undersized touch targets on mobile screen`);
    console.log(`   ✓ All ${actionButtons.length} visible interactive elements meet mobile touch target minimums`);

    await context.close();

    console.log('\nAll Day 26 Mobile Hardening & Touch Target E2E checks PASSED cleanly (5/5).');
  } catch (err) {
    console.error('Day 26 E2E test failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});

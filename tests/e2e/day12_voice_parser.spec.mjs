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

server.listen(4216, async () => {
  console.log('Day 12 E2E test server running on port 4216...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  PASS: ${message}`);
      passed++;
    } else {
      console.error(`  FAIL: ${message}`);
      failed++;
    }
  }

  try {
    console.log('\n--- Day 12 Voice Route Parser Desktop Tests ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await desktopContext.newPage();
    page.setDefaultTimeout(15000);

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
    });

    await page.goto('http://localhost:4216/planner', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // [Gate 1/5] Floating voice action button exists
    const micBtn = page.locator('[data-testid="voice-search-launcher"]');
    assert(await micBtn.isVisible(), 'Floating voice action button is visible');
    await micBtn.click();
    await page.waitForTimeout(400);

    // [Gate 2/5] Voice dialog opens with accessible controls
    const voiceDialog = page.locator('#travelmate-voice-search');
    assert(await voiceDialog.isVisible(), 'Voice search dialog opens successfully');

    // [Gate 3/5] Submit phonetic route "train from Dilli to Bombay tomorrow"
    const searchInput = page.locator('#voice-search-fallback');
    await searchInput.fill('train from Dilli to Bombay tomorrow');
    const applyBtn = page.locator('[data-testid="voice-search-submit"]');
    await applyBtn.click();
    await page.waitForTimeout(800);

    // [Gate 4/5] Verify planner from and to fields populated with canonical city names
    const fromInput = page.locator('[data-testid="planner-from-input"]');
    const fromVal = await fromInput.inputValue();
    assert(fromVal === 'Delhi', `Phonetic 'Dilli' resolved to canonical 'Delhi' (found: '${fromVal}')`);

    const toInput = page.locator('[data-testid="planner-to-input"]');
    const toVal = await toInput.inputValue();
    assert(toVal === 'Mumbai', `Phonetic 'Bombay' resolved to canonical 'Mumbai' (found: '${toVal}')`);

    // [Gate 5/5] Verify date extraction populated tomorrow's date
    const dateInput = page.locator('[data-testid="planner-date-input"]');
    const dateVal = await dateInput.inputValue();
    assert(dateVal.length === 10 && dateVal.includes('-'), `Date was populated from 'tomorrow' voice intent (found: '${dateVal}')`);

    await desktopContext.close();

    console.log(`\nDay 12 E2E Results: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Error in Day 12 E2E test:', err);
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
});

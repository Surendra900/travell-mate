import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

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

server.listen(4222, async () => {
  console.log('Day 14 E2E test server listening on port 4222...');
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
      localStorage.setItem('travelmate-last-location', JSON.stringify({
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 12,
        capturedAt: new Date().toISOString(),
        mapUrl: 'https://maps.google.com/?q=28.613900,77.209000'
      }));
    });

    console.log('1. Testing Voice Emergency Trigger from Home to /safety...');
    await page.goto('http://localhost:4222/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Open voice search dialog
    const voiceBtn = page.locator('[data-testid="voice-search-launcher"]');
    if (!await voiceBtn.isVisible()) {
      throw new Error('Voice search launcher should be visible');
    }
    await voiceBtn.click();
    await page.waitForTimeout(300);

    // Fill "help call police" into fallback input
    const voiceInput = page.locator('#voice-search-fallback');
    await voiceInput.fill('help call police');
    await page.click('[data-testid="voice-search-submit"]');
    await page.waitForTimeout(1000);

    console.log(`   Current URL after emergency trigger: ${page.url()}`);
    if (!page.url().includes('/safety')) {
      throw new Error(`Expected navigation to /safety, got: ${page.url()}`);
    }

    console.log('2. Verifying Emergency Hotlines & GPS Telemetry on /safety...');
    const bodyText = await page.textContent('body');
    assert.ok(bodyText.includes('112'), 'Must display 112 hotline');
    assert.ok(bodyText.includes('139'), 'Must display 139 hotline');
    assert.ok(bodyText.includes('108'), 'Must display 108 hotline');
    assert.ok(bodyText.includes('1090'), 'Must display 1090 hotline');

    const hotlineBtns = page.locator('[data-testid^="hotline-call-"]');
    const hotlineCount = await hotlineBtns.count();
    console.log(`   Found ${hotlineCount} active hotline call buttons.`);
    assert.ok(hotlineCount >= 4, `Expected at least 4 hotline buttons, found ${hotlineCount}`);

    console.log('3. Verifying Spoken Audio Guidance buttons on Incident Protocols...');
    const headerListenBtns = page.locator('[data-testid^="speak-protocol-header-"]');
    const headerListenCount = await headerListenBtns.count();
    console.log(`   Found ${headerListenCount} incident protocol audio guidance buttons.`);
    if (headerListenCount < 2) {
      throw new Error(`Expected at least 2 incident protocol audio buttons, found: ${headerListenCount}`);
    }

    const firstAudioBtn = headerListenBtns.first();
    const textBefore = await firstAudioBtn.innerText();
    console.log(`   Protocol button text before click: "${textBefore}"`);
    if (!textBefore.includes('Listen')) {
      throw new Error('Audio button should indicate Listen before clicked');
    }

    await firstAudioBtn.click();
    await page.waitForTimeout(200);

    const textAfter = await firstAudioBtn.innerText();
    console.log(`   Protocol button text after click: "${textAfter}"`);
    if (!textAfter.includes('Stop')) {
      throw new Error('Audio button should toggle to "Stop" while playing');
    }

    // Toggle stop
    await firstAudioBtn.click();
    await page.waitForTimeout(200);

    console.log('4. Checking console errors...');
    if (consoleErrors.length > 0) {
      throw new Error(`Console errors detected: ${consoleErrors.join('; ')}`);
    }

    console.log('DAY 14 E2E GATES PASSED (5/5 checks clean).');
    await context.close();
  } catch (err) {
    console.error('DAY 14 E2E TEST FAILED:', err);
    exitCode = 1;
  } finally {
    await browser.close();
    server.close();
    process.exit(exitCode);
  }
});

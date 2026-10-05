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

server.listen(4260, async () => {
  console.log('Day 28 Judge Demo Tour E2E server running on port 4260...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    // 1. Desktop Test (1440x900)
    console.log('1. Testing Judge Demo Tour modal on Desktop (1440x900)...');
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.setDefaultTimeout(15000);

    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
    });

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:4260/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Verify Judge Tour button exists in Navbar
    const tourBtn = page.locator('[data-testid="navbar-demo-tour-btn"]');
    await assert.doesNotReject(tourBtn.waitFor({ state: 'visible' }), 'Judge Tour navbar button must be visible');
    await tourBtn.click();

    // Verify modal is open
    const modal = page.locator('[data-testid="demo-tour-modal"]');
    await modal.waitFor({ state: 'visible' });

    // Step 1 check
    const stepTitle = page.locator('[data-testid="demo-tour-step-title"]');
    let titleText = await stepTitle.textContent();
    assert.match(titleText, /Multimodal Split-Routing/i, 'Step 1 title match');

    // Step 2 check (via Next button)
    const nextBtn = page.locator('[data-testid="demo-tour-next-btn"]');
    await nextBtn.click();
    titleText = await stepTitle.textContent();
    assert.match(titleText, /Divyangjan Voice Accessibility/i, 'Step 2 title match');

    // Step 3 check (via Keyboard ArrowRight)
    await page.keyboard.press('ArrowRight');
    titleText = await stepTitle.textContent();
    assert.match(titleText, /Encrypted Vault & DPDP/i, 'Step 3 title match');

    // Step 4 check
    await page.keyboard.press('ArrowRight');
    titleText = await stepTitle.textContent();
    assert.match(titleText, /Open-Meteo Winter Fog/i, 'Step 4 title match');

    // Step 5 check
    await nextBtn.click();
    titleText = await stepTitle.textContent();
    assert.match(titleText, /1-Tap SOS Telemetry/i, 'Step 5 title match');

    // Action button navigates to targetRoute
    const actionBtn = page.locator('[data-testid="demo-tour-action-btn"]');
    await actionBtn.click();
    await page.waitForTimeout(600);

    // Modal should be closed and URL should be /safety
    assert.ok(page.url().includes('/safety'), 'Action button must navigate to /safety route');
    const modalClosed = await modal.count();
    assert.equal(modalClosed, 0, 'Demo tour modal should close after taking action');

    // Escape key check: reopen and press Escape
    await page.evaluate(() => window.dispatchEvent(new CustomEvent('travelmate:open-demo-tour')));
    await modal.waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    assert.equal(await modal.count(), 0, 'Escape key must dismiss demo tour modal');

    await page.close();

    // 2. Mobile Viewport Test (390x844)
    console.log('2. Testing Judge Demo Tour modal on Mobile (390x844)...');
    const mobilePage = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    mobilePage.setDefaultTimeout(15000);

    await mobilePage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
    });

    await mobilePage.goto('http://localhost:4260/', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(500);

    // Open mobile hamburger menu
    const menuToggle = mobilePage.locator('button[aria-label="Toggle navigation menu"]');
    if (await menuToggle.isVisible()) {
      await menuToggle.click();
      await mobilePage.waitForTimeout(300);
      const mobileTourBtn = mobilePage.locator('[data-testid="mobile-navbar-demo-tour-btn"]');
      await mobileTourBtn.click();
    } else {
      await mobilePage.evaluate(() => window.dispatchEvent(new CustomEvent('travelmate:open-demo-tour')));
    }

    const mobileModal = mobilePage.locator('[data-testid="demo-tour-modal"]');
    await mobileModal.waitFor({ state: 'visible' });

    // Verify modal does not cause horizontal overflow
    const overflowInfo = await mobilePage.evaluate(() => {
      return {
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        innerWidth: window.innerWidth
      };
    });
    assert.ok(overflowInfo.docScrollWidth <= 390, `Document scrollWidth ${overflowInfo.docScrollWidth} must be <= 390`);

    await mobilePage.close();

    // Verify zero fatal console errors
    const fatalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('Open-Meteo'));
    assert.equal(fatalErrors.length, 0, `Expected 0 fatal console errors, got: ${fatalErrors.join(', ')}`);

    console.log('✔ DAY 28 PLAYWRIGHT E2E VERIFICATION PASSED (5/5 checks passed cleanly).');
    process.exitCode = 0;
  } catch (err) {
    console.error('❌ Day 28 E2E verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});

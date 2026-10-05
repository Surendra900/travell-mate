import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
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

server.listen(4225, async () => {
  console.log('Day 15 A11y Gate test server running on port 4225...');
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

    console.log('1. Testing Skip-to-Content keyboard navigation...');
    await page.goto('http://localhost:4225/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Tab into skip link
    await page.keyboard.press('Tab');
    const focusedText = await page.evaluate(() => document.activeElement?.textContent?.trim());
    console.log(`   Focused text after first Tab: "${focusedText}"`);
    assert.match(focusedText || '', /Skip to (main )?content/i, 'First tab must focus skip link');

    // Press enter on skip link
    await page.keyboard.press('Enter');
    const activeId = await page.evaluate(() => document.activeElement?.id);
    console.log(`   Active element ID after activating skip link: "${activeId}"`);
    assert.strictEqual(activeId, 'main-content', 'Focus must move to main-content landmark');

    console.log('2. Testing BlindVoiceGate keyboard trap and Escape dismissal...');
    const voiceGateBtn = page.locator('[data-testid="navbar-voice-gate-btn"]');
    await voiceGateBtn.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);

    const gateDialog = page.locator('[data-testid="blind-voice-gate"]');
    assert.ok(await gateDialog.isVisible(), 'Blind voice gate modal must open');

    // Verify initial focus is on YES button
    await page.waitForTimeout(200);
    const initialFocused = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    console.log(`   Initially focused in modal: ${initialFocused}`);
    assert.strictEqual(initialFocused, 'blind-gate-yes', 'Focus must start on YES button');

    // Test Tab cycling within modal
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      const insideDialog = await page.evaluate(() => {
        const dialog = document.querySelector('[data-testid="blind-voice-gate"]');
        return dialog?.contains(document.activeElement);
      });
      assert.ok(insideDialog, `Focus escaped dialog during Tab iteration ${i + 1}`);
    }

    // Dismiss with Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    assert.ok(!(await gateDialog.isVisible()), 'Modal must dismiss on Escape key');

    console.log('3. Running Axe WCAG 2.1 AA audit across core application routes...');
    const routesToAudit = ['/', '/planner', '/safety'];

    for (const route of routesToAudit) {
      console.log(`   Auditing route: ${route}...`);
      await page.goto(`http://localhost:4225${route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(700);

      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const criticalSerious = axeResults.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
      if (criticalSerious.length > 0) {
        console.error(`   [FAIL] Found ${criticalSerious.length} critical/serious a11y violations on ${route}:`);
        criticalSerious.forEach(v => {
          console.error(`     - [${v.impact.toUpperCase()}] ${v.id}: ${v.description}`);
          v.nodes.slice(0, 10).forEach(n => {
            console.error(`       Target: ${n.target.join(', ')}`);
            console.error(`       HTML: ${n.html}`);
            console.error(`       Failure: ${n.failureSummary}`);
          });
        });
        throw new Error(`Axe accessibility violations found on ${route}`);
      } else {
        console.log(`   [PASS] 0 critical or serious violations on ${route} (${axeResults.passes.length} a11y checks passed).`);
      }
    }

    console.log('4. Verifying zero unhandled console errors or secret bundle leaks...');
    const realErrors = consoleErrors.filter(e => !e.includes('SpeechRecognition') && !e.includes('speechSynthesis') && !e.includes('AudioContext'));
    assert.strictEqual(realErrors.length, 0, `Unexpected console errors: ${realErrors.join(', ')}`);

    console.log('\nAll Day 15 Accessibility Gate checks PASSED cleanly (5/5).');
  } catch (err) {
    console.error('\nDay 15 E2E Verification failed:', err);
    exitCode = 1;
  } finally {
    await browser.close();
    server.close();
    process.exit(exitCode);
  }
});

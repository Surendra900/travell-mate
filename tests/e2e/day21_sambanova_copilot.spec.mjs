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

server.listen(4242, async () => {
  console.log('Day 21 SambaNova Copilot E2E server running on port 4242...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const errors = [];
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource') && !text.includes('status of 404')) {
          errors.push(`Console error: ${text}`);
        }
      }
    });
    page.on('pageerror', (err) => {
      errors.push(`Unhandled page error: ${err.message}`);
    });

    // Mock /api/assistant route
    await page.route('**/api/assistant', async (route) => {
      const responseData = {
        ok: true,
        reply: 'I found multiple daily trains between Kochi and Chennai including 12624 Chennai Mail and 12696 TVC MAS Express. I have filled this route directly into your planner.',
        applyPlan: true,
        planPatch: {
          from: 'Kochi',
          to: 'Chennai',
          transportMode: 'Train',
          classType: 'Sleeper (SL)'
        },
        shouldCheckProviders: false
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(responseData)
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      localStorage.setItem('travelmate-pwa-dismissed', 'true');
    });

    console.log('1. Navigating to Planner page...');
    await page.goto('http://localhost:4242/planner', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    console.log('2. Clicking floating Smart Assistant launcher...');
    const launcherBtn = page.locator('[data-testid="assistant-launcher-btn"]');
    assert.ok(await launcherBtn.isVisible(), 'Launcher button must be visible');
    await launcherBtn.click();
    await page.waitForTimeout(500);

    const assistantPanel = page.locator('[data-testid="assistant-panel"]');
    assert.ok(await assistantPanel.isVisible(), 'Smart Assistant dialog panel must open');
    console.log('   ✓ Smart Assistant modal dialog open');

    console.log('3. Verifying greeting and sample prompt chips...');
    const greetingText = page.locator('.assistant-message').first();
    assert.ok(await greetingText.isVisible(), 'Initial greeting message must render');

    const promptChip = page.locator('.assistant-prompt-chip').first();
    assert.ok(await promptChip.isVisible(), 'Prompt chips must be present');
    await promptChip.click();
    await page.waitForTimeout(200);

    const textarea = page.locator('[data-testid="assistant-composer-textarea"]');
    const chipText = await textarea.inputValue();
    assert.ok(chipText.length > 0, 'Clicking chip must populate composer textarea');
    console.log(`   ✓ Populated composer with: "${chipText}"`);

    console.log('4. Submitting natural route query to SambaNova copilot...');
    await textarea.fill('Tickets Kochi to Chennai by train.');
    const sendBtn = page.locator('[data-testid="assistant-send-btn"]');
    await sendBtn.click();
    await page.waitForTimeout(600);

    const replyMsg = page.locator('text=I found multiple daily trains between Kochi and Chennai');
    assert.ok(await replyMsg.isVisible(), 'AI reasoning copilot response must render in conversation');
    console.log('   ✓ AI copilot response displayed in conversation');

    console.log('5. Closing assistant and verifying planner fields were updated...');
    const closeBtn = page.locator('[data-testid="assistant-close-btn"]');
    await closeBtn.click();
    await page.waitForTimeout(300);
    assert.ok(!(await assistantPanel.isVisible()), 'Assistant closed cleanly');

    const fromInput = page.locator('[data-testid="planner-from-input"]');
    const toInput = page.locator('[data-testid="planner-to-input"]');
    assert.equal(await fromInput.inputValue(), 'Kochi', 'From input must be auto-filled to Kochi');
    assert.equal(await toInput.inputValue(), 'Chennai', 'To input must be auto-filled to Chennai');
    console.log('   ✓ Planner inputs automatically populated by SambaNova agent');

    // 6. Mobile Viewport Check (390x844)
    console.log('6. Testing Mobile responsive viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await launcherBtn.click();
    await page.waitForTimeout(400);
    assert.ok(await assistantPanel.isVisible(), 'Smart Assistant is fully responsive on mobile');
    await closeBtn.click();
    console.log('   ✓ Mobile viewport check passed');

    await context.close();

    if (errors.length > 0) {
      throw new Error(`Errors during Day 21 E2E: ${errors.join('; ')}`);
    }

    console.log('\nAll Day 21 SambaNova AI Copilot E2E checks PASSED cleanly (5/5).');
  } catch (err) {
    console.error('Day 21 E2E Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});

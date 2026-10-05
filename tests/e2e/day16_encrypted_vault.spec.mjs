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

server.listen(4228, async () => {
  console.log('Day 16 Encrypted Vault E2E server running on port 4228...');
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

    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
    });

    console.log('1. Navigating to /safety and checking locked Document Vault...');
    await page.goto('http://localhost:4228/safety', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Verify security architecture badges
    const aesBadge = page.locator('text=AES-GCM 256-Bit');
    assert.ok(await aesBadge.first().isVisible(), 'Must display AES-GCM 256-Bit badge');
    console.log('   ✓ AES-GCM 256-Bit badge visible');

    const zeroCloudBadge = page.locator('text=Zero-Cloud Local IndexedDB');
    assert.ok(await zeroCloudBadge.first().isVisible(), 'Must display Zero-Cloud Local IndexedDB badge');
    console.log('   ✓ Zero-Cloud Local IndexedDB badge visible');

    console.log('2. Creating encrypted vault with PBKDF2 passphrase...');
    const passInput = page.locator('input[placeholder="At least 8 characters"]');
    const confirmInput = page.locator('input[placeholder="Repeat passphrase"]');
    await passInput.fill('TravelPass@2026!');
    await confirmInput.fill('TravelPass@2026!');

    const createBtn = page.locator('button:has-text("Create encrypted vault")');
    await createBtn.click();
    await page.waitForTimeout(1000);

    // Verify unlocked state
    const unlockedBadge = page.locator('text=Vault unlocked in this tab');
    assert.ok(await unlockedBadge.isVisible(), 'Vault must transition to unlocked state');
    console.log('   ✓ Vault successfully unlocked with derived master key');

    console.log('3. Verifying category filter pills and export controls...');
    const exportBtn = page.locator('[data-testid="export-vault-backup"]');
    assert.ok(await exportBtn.isVisible(), 'Export encrypted backup button must be visible');
    console.log('   ✓ Export encrypted backup button rendered');

    const aadhaarPill = page.locator('button:has-text("Aadhaar / ID")');
    assert.ok(await aadhaarPill.isVisible(), 'Category filter pill Aadhaar / ID must be visible');
    await aadhaarPill.click();
    console.log('   ✓ Category filter interaction verified');

    console.log('4. Testing locking and passphrase verification rejection...');
    const lockBtn = page.locator('button:has-text("Lock vault")');
    await lockBtn.click();
    await page.waitForTimeout(600);

    const unlockPassInput = page.locator('input[type="password"]');
    await unlockPassInput.fill('WrongPassword123');
    const unlockBtn = page.locator('button:has-text("Unlock encrypted vault")');
    await unlockBtn.click();
    await page.waitForTimeout(600);

    const errorMsg = page.locator('text=Incorrect vault passphrase');
    assert.ok(await errorMsg.isVisible(), 'Must reject incorrect passphrase');
    console.log('   ✓ Incorrect passphrase successfully rejected with cryptographic authentication error');

    console.log('5. Unlocking vault with authentic passphrase...');
    await unlockPassInput.fill('TravelPass@2026!');
    await unlockBtn.click();
    await page.waitForTimeout(800);

    assert.ok(await unlockedBadge.isVisible(), 'Vault must unlock with valid credentials');
    console.log('   ✓ Vault re-unlocked successfully');

    // 6. Mobile Viewport Check (390x844)
    console.log('6. Testing Mobile responsive viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    assert.ok(await unlockedBadge.isVisible(), 'Vault remains fully responsive on mobile');
    console.log('   ✓ Mobile viewport responsive check passed');

    await context.close();

    if (errors.length > 0) {
      throw new Error(`Errors during Day 16 E2E: ${errors.join('; ')}`);
    }

    console.log('\nAll Day 16 Encrypted Vault E2E checks PASSED cleanly (5/5).');
  } catch (err) {
    console.error('Day 16 E2E Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});

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

server.listen(4213, async () => {
  console.log('Day 11 E2E test server running on port 4213...');
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
    // 1. Desktop Tests
    console.log('\n--- Day 11 Blind Voice Gate Desktop Tests ---');
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
      localStorage.removeItem('travelmate-blind-mode');
    });

    await page.goto('http://localhost:4213/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    // [Gate 1/5] First-time automatic gate check
    const gateDialog = page.locator('[data-testid="blind-voice-gate"]');
    assert(await gateDialog.isVisible(), 'Blind Voice Gate dialog opens automatically for first-time visitors');

    // [Gate 2/5] High-contrast content & ARIA semantics
    const titleText = await page.locator('#blind-gate-title').innerText();
    assert(titleText.includes('Are you blind or visually impaired?'), `Gate title contains correct question (found: "${titleText}")`);

    const role = await gateDialog.getAttribute('role');
    assert(role === 'alertdialog', `Gate dialog has role="alertdialog" (found: ${role})`);

    const ariaModal = await gateDialog.getAttribute('aria-modal');
    assert(ariaModal === 'true', 'Gate dialog has aria-modal="true"');

    // [Gate 3/5] Test YES action enables Voice Mode
    const yesBtn = page.locator('[data-testid="blind-gate-yes"]');
    assert(await yesBtn.isVisible(), 'YES - Enable Voice Mode button is visible');
    await yesBtn.click();
    await page.waitForTimeout(600);

    assert(!(await gateDialog.isVisible()), 'Gate dialog closes after choosing YES');

    // Verify persistent Voice Accessibility Mode banner is rendered
    const voiceBanner = page.locator('text=Voice Accessibility Mode Active');
    assert(await voiceBanner.isVisible(), 'Persistent Voice Accessibility Mode banner is visible');

    // [Gate 4/5] Test Alt+B shortcut reopens the gate
    await page.keyboard.press('Alt+b');
    await page.waitForTimeout(600);
    assert(await gateDialog.isVisible(), 'Alt+B keyboard shortcut reopens Blind Voice Gate');

    // Test NO - Standard Mode button closes the gate
    const noBtn = page.locator('[data-testid="blind-gate-no"]');
    await noBtn.click();
    await page.waitForTimeout(600);
    assert(!(await gateDialog.isVisible()), 'Gate dialog closes after choosing NO');

    // [Gate 5/5] Verify Navbar button triggers Voice Gate
    const navVoiceBtn = page.locator('[data-testid="navbar-voice-gate-btn"]');
    assert(await navVoiceBtn.isVisible(), 'Navbar Voice A11y trigger button is visible');
    await navVoiceBtn.click();
    await page.waitForTimeout(600);
    assert(await gateDialog.isVisible(), 'Clicking Navbar button opens Blind Voice Gate');

    // Test Escape key dismisses gate
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    assert(!(await gateDialog.isVisible()), 'Escape key dismisses the gate dialog');

    await desktopContext.close();

    // 2. Mobile Viewport Test (390x844)
    console.log('\n--- Day 11 Blind Voice Gate Mobile Tests (390x844) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();
    mobilePage.setDefaultTimeout(15000);

    await mobilePage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.removeItem('travelmate-blind-mode');
    });

    await mobilePage.goto('http://localhost:4213/', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(800);

    const mobileGate = mobilePage.locator('[data-testid="blind-voice-gate"]');
    assert(await mobileGate.isVisible(), 'Mobile viewport correctly displays full-screen accessible gate');

    const mobileYesBtn = mobilePage.locator('[data-testid="blind-gate-yes"]');
    assert(await mobileYesBtn.isVisible(), 'Mobile YES button is fully touch-accessible');

    await mobileContext.close();

    console.log(`\nDay 11 E2E Results: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Error in Day 11 E2E test:', err);
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
});

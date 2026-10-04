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

server.listen(4209, async () => {
  console.log('Day 10 E2E test server running on port 4209...');
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
    // 1. Desktop Test
    console.log('\n--- Day 10 Multilingual E2E Desktop Tests ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await desktopContext.newPage();
    page.setDefaultTimeout(15000);

    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
    });

    await page.goto('http://localhost:4209/', { waitUntil: 'networkidle' });

    // Check language selector exists in Navbar
    const langSelect = page.locator('select[aria-label="Select website language"]');
    assert(await langSelect.isVisible(), 'Language selector dropdown is visible in desktop Navbar');

    // Switch to Hindi
    await langSelect.selectOption('hi');
    await page.waitForTimeout(600);
    const htmlLangHi = await page.getAttribute('html', 'lang');
    assert(htmlLangHi === 'hi', `HTML lang attribute is 'hi' (found: ${htmlLangHi})`);

    // Switch to Urdu and verify RTL
    await langSelect.selectOption('ur');
    await page.waitForTimeout(600);
    const htmlDirUr = await page.getAttribute('html', 'dir');
    assert(htmlDirUr === 'rtl', `HTML dir attribute is 'rtl' for Urdu (found: ${htmlDirUr})`);

    // Switch to Punjabi
    await langSelect.selectOption('pa');
    await page.waitForTimeout(600);
    const htmlLangPa = await page.getAttribute('html', 'lang');
    assert(htmlLangPa === 'pa', `HTML lang attribute is 'pa' for Punjabi (found: ${htmlLangPa})`);

    // Navigate to Safety Mode to check EmergencyPhraseCards
    await page.goto('http://localhost:4209/safety', { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const phraseSection = page.locator('section[aria-label="Regional Emergency Phrases"]');
    assert(await phraseSection.isVisible(), 'Regional Emergency Phrases section is visible on Safety Mode');

    // Check language pills exist
    const teluguPill = phraseSection.locator('button:has-text("తెలుగు")');
    assert(await teluguPill.isVisible(), 'Telugu regional phrase pill is visible');
    await teluguPill.click();
    await page.waitForTimeout(400);

    // Verify phrase card updated to Telugu
    const teluguHelpText = phraseSection.locator('text=నాకు సహాయం కావాలి.');
    assert(await teluguHelpText.isVisible(), 'Telugu emergency phrase "నాకు సహాయం కావాలి." is displayed');

    // Switch to Tamil
    const tamilPill = phraseSection.locator('button:has-text("தமிழ்")');
    await tamilPill.click();
    await page.waitForTimeout(400);
    const tamilHelpText = phraseSection.locator('text=எனக்கு உதவி வேண்டும்.');
    assert(await tamilHelpText.isVisible(), 'Tamil emergency phrase "எனக்கு உதவி வேண்டும்." is displayed');

    await desktopContext.close();

    // 2. Mobile Viewport Test (390x844)
    console.log('\n--- Day 10 Multilingual E2E Mobile Tests (390x844) ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();
    mobilePage.setDefaultTimeout(15000);

    await mobilePage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
    });

    await mobilePage.goto('http://localhost:4209/', { waitUntil: 'networkidle' });

    // Open mobile hamburger menu
    const menuBtn = mobilePage.locator('button.tm-menu');
    assert(await menuBtn.isVisible(), 'Mobile hamburger button is visible');
    await menuBtn.click();
    await mobilePage.waitForTimeout(400);

    // Verify mobile menu language selector
    const mobileLangSelect = mobilePage.locator('.tm-mobile-menu select[aria-label="Select website language"]');
    assert(await mobileLangSelect.isVisible(), 'Language selector is accessible within mobile menu');

    await mobileContext.close();

    console.log(`\nDay 10 E2E Results: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Error in Day 10 E2E test:', err);
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
});

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

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

server.listen(4263, async () => {
  console.log('Day 29 Full Regression & Axe Gate E2E server running on port 4263...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    // 1. Desktop 1440x900 Axe & Regression Audit
    console.log('\n--- 1. Desktop 1440x900 Axe WCAG 2.1 AA Audit ---');
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopPage = await desktopContext.newPage();
    desktopPage.setDefaultTimeout(15000);

    const desktopErrors = [];
    desktopPage.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('BROWSER ERROR:', msg.text());
        desktopErrors.push(msg.text());
      }
    });
    desktopPage.on('pageerror', err => {
      console.error('PAGE ERROR DETECTED:', err.stack || err.message);
      desktopErrors.push(err.message);
    });

    await desktopPage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
    });

    const routes = ['/', '/planner', '/safety', '/saved'];

    for (const r of routes) {
      console.log(`Auditing Desktop route: ${r}...`);
      await desktopPage.goto(`http://localhost:4263${r}`, { waitUntil: 'domcontentloaded' });
      await desktopPage.waitForTimeout(600);

      const axeResults = await new AxeBuilder({ page: desktopPage })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const criticalSerious = axeResults.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
      if (criticalSerious.length > 0) {
        console.error(`   [FAIL] Found ${criticalSerious.length} critical/serious a11y violations on ${r}:`);
        criticalSerious.forEach(v => {
          console.error(`     - [${v.impact.toUpperCase()}] ${v.id}: ${v.description}`);
          v.nodes.forEach(n => {
            console.error(`       Target: ${n.target.join(', ')}`);
            console.error(`       HTML: ${n.html}`);
            console.error(`       Summary: ${n.failureSummary}`);
          });
        });
        throw new Error(`Axe accessibility violations found on ${r}`);
      } else {
        console.log(`   ✓ [PASS] 0 critical/serious violations (${axeResults.passes.length} a11y rules passed).`);
      }
    }
    await desktopPage.close();
    await desktopContext.close();

    // 2. Mobile 390x844 Axe & Regression Audit
    console.log('\n--- 2. Mobile 390x844 Axe WCAG 2.1 AA Audit ---');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();
    mobilePage.setDefaultTimeout(15000);

    const mobileErrors = [];
    mobilePage.on('console', msg => {
      if (msg.type() === 'error') mobileErrors.push(msg.text());
    });
    mobilePage.on('pageerror', err => mobileErrors.push(err.message));

    await mobilePage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
    });

    for (const r of routes) {
      console.log(`Auditing Mobile route: ${r}...`);
      await mobilePage.goto(`http://localhost:4263${r}`, { waitUntil: 'domcontentloaded' });
      await mobilePage.waitForTimeout(600);

      // Verify zero horizontal overflow
      const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(scrollWidth <= 390, `Route ${r} scrollWidth (${scrollWidth}px) exceeds 390px mobile viewport!`);

      const axeResults = await new AxeBuilder({ page: mobilePage })
        .withTags(['wcag2a', 'wcag2aa'])
        .analyze();

      const criticalSerious = axeResults.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
      if (criticalSerious.length > 0) {
        console.error(`   [FAIL] Found ${criticalSerious.length} critical/serious a11y violations on mobile ${r}:`);
        criticalSerious.forEach(v => console.error(`     - [${v.impact.toUpperCase()}] ${v.id}: ${v.description}`));
        throw new Error(`Axe accessibility violations found on mobile ${r}`);
      } else {
        console.log(`   ✓ [PASS] 0 critical/serious violations (${axeResults.passes.length} a11y rules passed).`);
      }
    }
    await mobilePage.close();
    await mobileContext.close();

    // Verify 0 fatal errors
    const allErrors = [...desktopErrors, ...mobileErrors].filter(
      e => !e.includes('SpeechRecognition') && !e.includes('speechSynthesis') && !e.includes('AudioContext') && !e.includes('favicon') && !e.includes('Open-Meteo')
    );
    assert.equal(allErrors.length, 0, `Unexpected errors: ${allErrors.join(', ')}`);

    console.log('\n✔ DAY 29 FULL REGRESSION & AXE GATE VERIFICATION PASSED (5/5 checks passed cleanly).');
    process.exitCode = 0;
  } catch (err) {
    console.error('❌ Day 29 E2E verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});

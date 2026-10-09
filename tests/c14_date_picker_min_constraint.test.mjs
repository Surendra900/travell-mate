import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';
import { localDateIso } from '../src/utils/date.js';

test('C-14 Date Picker Min Constraint Suite', async (t) => {
  const today = localDateIso();

  await t.test('Static code check: src/pages/Home.jsx date input has min={localDateIso()}', () => {
    const code = fs.readFileSync('src/pages/Home.jsx', 'utf8');
    const inputMatch = code.match(/id="home-travel-date"[^>]*>/s) || code.match(/<input[^>]*id="home-travel-date"[^>]*>/s);
    assert.ok(inputMatch, 'Home.jsx must contain #home-travel-date input');
    assert.ok(
      inputMatch[0].includes('min={localDateIso()}'),
      '#home-travel-date input must enforce min={localDateIso()}'
    );
  });

  await t.test('Static code check: src/planner/NormalPlanner.jsx date input has min={localDateIso()}', () => {
    const code = fs.readFileSync('src/planner/NormalPlanner.jsx', 'utf8');
    const inputMatch = code.match(/<input[^>]*data-testid="planner-date-input"[^>]*>/s) || code.match(/<input[\s\S]*?planner-date-input[\s\S]*?>/);
    assert.ok(inputMatch, 'NormalPlanner.jsx must contain planner-date-input');
    assert.ok(
      inputMatch[0].includes('min={localDateIso()}'),
      'planner-date-input must enforce min={localDateIso()}'
    );
  });

  await t.test('Static code check: src/planner/EmergencyTatkalPlanner.jsx date input has min={localDateIso()}', () => {
    const code = fs.readFileSync('src/planner/EmergencyTatkalPlanner.jsx', 'utf8');
    assert.ok(
      code.includes('min={localDateIso()}'),
      'EmergencyTatkalPlanner date input must enforce min={localDateIso()}'
    );
  });

  await t.test('Static code check: src/planner/LowNetworkPlanner.jsx date input has min={localDateIso()}', () => {
    const code = fs.readFileSync('src/planner/LowNetworkPlanner.jsx', 'utf8');
    assert.ok(
      code.includes('min={localDateIso()}'),
      'LowNetworkPlanner date input must enforce min={localDateIso()}'
    );
  });

  await t.test('Static code check: src/pages/AnalyzeJourney.jsx date input has min={localDateIso()}', () => {
    const code = fs.readFileSync('src/pages/AnalyzeJourney.jsx', 'utf8');
    assert.ok(
      code.includes('min={localDateIso()}'),
      'AnalyzeJourney date input must enforce min={localDateIso()}'
    );
  });

  await t.test('Browser check: Home travel date input has min attribute set to current date', async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    try {
      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
      const minVal = await page.$eval('#home-travel-date', (el) => el.getAttribute('min'));
      assert.equal(minVal, today, `Home date input min must be ${today}, but was ${minVal}`);

      // Verify HTML5 constraint validation on past date
      const validity = await page.$eval('#home-travel-date', (el) => {
        el.value = '2020-01-01';
        return {
          rangeUnderflow: el.validity.rangeUnderflow,
          valid: el.validity.valid
        };
      });
      assert.equal(validity.rangeUnderflow, true, 'Setting a past date must trigger rangeUnderflow violation');
      assert.equal(validity.valid, false, 'Setting a past date must make input invalid');
    } finally {
      await browser.close();
    }
  });

  await t.test('Browser check: Planner date input has min attribute set to current date', async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    try {
      await page.goto('http://127.0.0.1:5173/planner', { waitUntil: 'networkidle' });
      const minVal = await page.$eval('[data-testid="planner-date-input"]', (el) => el.getAttribute('min'));
      assert.equal(minVal, today, `Planner date input min must be ${today}, but was ${minVal}`);
    } finally {
      await browser.close();
    }
  });
});

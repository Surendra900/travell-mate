import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  { name: 'home', url: 'http://127.0.0.1:5173/' },
  { name: 'planner', url: 'http://127.0.0.1:5173/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-15' },
  { name: 'safety', url: 'http://127.0.0.1:5173/safety' },
  { name: 'saved', url: 'http://127.0.0.1:5173/saved' },
  { name: 'privacy', url: 'http://127.0.0.1:5173/privacy' },
  { name: 'terms', url: 'http://127.0.0.1:5173/terms' },
  { name: 'disclaimer', url: 'http://127.0.0.1:5173/disclaimer' }
];

describe('C-09: WCAG 2.1 AA Color Contrast Across All Routes', () => {
  let browser;

  before(async () => {
    browser = await chromium.launch({ headless: true });
  });

  after(async () => {
    if (browser) await browser.close();
  });

  for (const r of routes) {
    test(`Route /${r.name} has zero color-contrast violations`, async () => {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);

      try {
        await page.goto(r.url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(500);

        const accessibilityScanResults = await new AxeBuilder({ page })
          .withRules(['color-contrast'])
          .analyze();

        const contrastViolations = accessibilityScanResults.violations;
        if (contrastViolations.length > 0) {
          const details = contrastViolations.flatMap(v =>
            v.nodes.map(n => ({
              target: n.target.join(' '),
              html: n.html.substring(0, 100),
              summary: n.failureSummary
            }))
          );
          assert.fail(`Route ${r.name} has ${contrastViolations.length} color-contrast violations:\n` + JSON.stringify(details, null, 2));
        }
        assert.equal(contrastViolations.length, 0, `Route ${r.name} must have 0 contrast violations`);
      } finally {
        await context.close();
      }
    });
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

test('C-15 Unbundled Ticketing Disclaimer & Risk Protection Suite', async (t) => {
  await t.test('MultimodalTimelineCard.jsx contains prominent unbundled ticketing disclaimer and buffer recommendation', () => {
    const code = fs.readFileSync('src/components/MultimodalTimelineCard.jsx', 'utf8');

    assert.ok(
      code.includes('data-testid="unbundled-ticketing-disclaimer"'),
      'MultimodalTimelineCard must have unbundled-ticketing-disclaimer testid'
    );
    assert.ok(
      code.toLowerCase().includes('separate pnr') || code.toLowerCase().includes('unbundled'),
      'Card must explicitly state separate PNRs or unbundled ticketing'
    );
    assert.ok(
      code.toLowerCase().includes('refund'),
      'Card must warn about operator refund limitations on missed connections'
    );
    assert.ok(
      code.toLowerCase().includes('buffer'),
      'Card must provide buffer recommendation for self-transfer connections'
    );
  });

  await t.test('LegalDisclaimer.jsx contains dedicated section on unbundled multi-ticket connections', () => {
    const code = fs.readFileSync('src/pages/LegalDisclaimer.jsx', 'utf8');

    assert.ok(
      code.includes('Unbundled') || code.includes('Split-Ticket') || code.includes('Multi-Ticket'),
      'LegalDisclaimer must have dedicated heading on unbundled / split-ticket bookings'
    );
    assert.ok(
      code.includes('PNR') || code.includes('contract of carriage'),
      'LegalDisclaimer must explain independent PNRs / contracts of carriage'
    );
  });

  await t.test('real-vs-demo-matrix.md documents unbundled ticketing protection model', () => {
    const markdown = fs.readFileSync('docs/pitch/real-vs-demo-matrix.md', 'utf8');

    assert.ok(
      markdown.toLowerCase().includes('unbundled') || markdown.toLowerCase().includes('separate pnr'),
      'real-vs-demo-matrix.md must document the unbundled ticketing reality'
    );
  });

  await t.test('Browser test: Unbundled disclaimer is visible and styled prominently on multimodal cards', async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    try {
      await page.goto('http://127.0.0.1:5173/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&transportMode=Train&date=2026-10-15', {
        waitUntil: 'networkidle'
      });

      const disclaimer = page.locator('[data-testid="unbundled-ticketing-disclaimer"]').first();
      await disclaimer.waitFor({ state: 'visible', timeout: 8000 });
      const isVisible = await disclaimer.isVisible();
      assert.strictEqual(isVisible, true, 'Unbundled ticketing disclaimer must be visible on multimodal route card');

      const text = await disclaimer.textContent();
      assert.ok(text.toLowerCase().includes('pnr') || text.toLowerCase().includes('unbundled'), 'Disclaimer text must mention PNR or unbundled');
    } finally {
      await browser.close();
    }
  });
});

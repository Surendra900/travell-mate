import { chromium } from 'playwright';
import fs from 'node:fs';
import { localDateIso } from '../src/utils/date.js';

async function main() {
  fs.mkdirSync('docs/fix-evidence/C-14/after', { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });

  const dateInput = page.locator('#home-travel-date');
  const minAttr = await dateInput.getAttribute('min');
  const currentValue = await dateInput.inputValue();

  console.log(`AFTER - min attribute: ${minAttr}, currentValue: ${currentValue}`);

  // Screenshot the date input area on Home showing the min-bounded date picker
  const dateCard = page.locator('#home-travel-date');
  await dateCard.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: 'docs/fix-evidence/C-14/after/home_date_picker_after.png',
    clip: { x: 300, y: 150, width: 840, height: 400 }
  });

  // Also verify and screenshot Planner date input
  await page.goto('http://127.0.0.1:5173/planner', { waitUntil: 'networkidle' });
  const plannerMin = await page.locator('[data-testid="planner-date-input"]').getAttribute('min');
  console.log(`AFTER Planner - min attribute: ${plannerMin}`);

  await page.screenshot({
    path: 'docs/fix-evidence/C-14/after/planner_date_picker_after.png',
    clip: { x: 300, y: 150, width: 840, height: 400 }
  });

  await browser.close();
  console.log('Saved after evidence screenshots');
}

main().catch(console.error);

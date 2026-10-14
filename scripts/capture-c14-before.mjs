import { chromium } from 'playwright';
import fs from 'node:fs';

async function main() {
  fs.mkdirSync('docs/fix-evidence/C-14/before', { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });

  const dateInput = page.locator('#home-travel-date');
  const minAttr = await dateInput.getAttribute('min');
  const currentValue = await dateInput.inputValue();

  console.log(`BEFORE - min attribute: ${minAttr}, currentValue: ${currentValue}`);

  // Screenshot the date input area on Home
  const dateCard = page.locator('#home-travel-date');
  await dateCard.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: 'docs/fix-evidence/C-14/before/home_date_picker_before.png',
    clip: { x: 300, y: 150, width: 840, height: 400 }
  });

  await browser.close();
  console.log('Saved before evidence screenshot');
}

main().catch(console.error);

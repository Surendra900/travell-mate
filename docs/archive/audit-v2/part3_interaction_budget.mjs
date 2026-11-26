import { chromium } from 'playwright';
import fs from 'fs';

async function measureInteractionBudget() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  const log = {
    navItemCount: 0,
    searchInteractions: 0,
    bookingInteractions: 0,
    searchSuccess: false,
    bookingUrlOpened: ''
  };

  try {
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });

    // 1. Measure Nav Items
    const navItems = await page.$$eval('header nav a, header nav button', els => els.map(e => e.innerText.trim()).filter(Boolean));
    log.navItemCount = navItems.length;
    log.navItems = navItems;

    // Handle initial modals if present
    const locBtn = page.locator('button:has-text("Continue without location")');
    if (await locBtn.count() > 0 && await locBtn.isVisible()) {
      await locBtn.click();
      await page.waitForTimeout(300);
    }
    const voiceBtn = page.locator('button:has-text("NO - Standard Mode")');
    if (await voiceBtn.count() > 0 && await voiceBtn.isVisible()) {
      await voiceBtn.click();
      await page.waitForTimeout(300);
    }

    // Interaction 1: Click a high-traffic corridor chip (e.g., "NDLS → HWH") OR fill origin & destination
    // If clicking a pre-set corridor chip: 1 click sets origin & destination!
    // Or typing: Input From (1), Input To (2), Click Search (3). Total: 3 interactions!
    let interactions = 0;
    const corridorChip = page.locator('button:has-text("NDLS → HWH"), button:has-text("New Delhi → Howrah")').first();
    if (await corridorChip.count() > 0 && await corridorChip.isVisible()) {
      await corridorChip.click();
      interactions += 1;
      await page.waitForTimeout(400);
      
      const searchBtn = page.locator('button:has-text("Search Recovery Routes")');
      if (await searchBtn.isVisible()) {
        await searchBtn.click();
        interactions += 1;
      }
    } else {
      // Manual input test
      const fromInput = page.locator('input[placeholder*="origin" i], input[placeholder*="from" i], input[placeholder*="station" i]').first();
      await fromInput.fill('NDLS');
      interactions += 1;
      await page.waitForTimeout(200);

      const toInput = page.locator('input[placeholder*="destination" i], input[placeholder*="to" i]').first();
      await toInput.fill('HWH');
      interactions += 1;
      await page.waitForTimeout(200);

      const searchBtn = page.locator('button:has-text("Search Recovery Routes")');
      await searchBtn.click();
      interactions += 1;
    }
    log.searchInteractions = interactions;

    // Wait for results
    await page.waitForSelector('.timeline-card, [data-testid*="route-card"], [data-testid="waitlist-bypass-contrast"]', { timeout: 10000 });
    log.searchSuccess = true;

    // Measure Booking Interactions: from results to opening booking site
    // In results card: Click "Book Leg 1 (ConfirmTkt)" or "Book on ConfirmTkt"
    let bookClicks = 0;
    const bookBtn = page.locator('a:has-text("ConfirmTkt"), a:has-text("Book Leg"), a:has-text("redBus")').first();
    if (await bookBtn.count() > 0) {
      log.bookingUrlOpened = await bookBtn.getAttribute('href');
      bookClicks += 1;
    }
    log.bookingInteractions = bookClicks;

    fs.writeFileSync('docs/audit-v2/test-logs/part3_interaction_budget.json', JSON.stringify(log, null, 2));
    console.log('Interaction budget measurement complete:', log);
  } finally {
    await browser.close();
  }
}

measureInteractionBudget().catch(err => {
  console.error('Interaction budget measurement failed:', err);
  process.exit(1);
});

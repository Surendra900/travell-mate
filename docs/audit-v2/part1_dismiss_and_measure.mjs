import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/audit-v2/screenshots');

async function testDismissAndMeasure() {
  const browser = await chromium.launch({ headless: true });
  const report = {};

  try {
    for (const env of [{ name: 'prod', url: 'https://travelmate-ai-flowzint.vercel.app' }, { name: 'local', url: 'http://127.0.0.1:5173' }]) {
      report[env.name] = {};

      // 1. Mobile (390x844) Cold & After Dismissal
      const mobileCtx = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true
      });
      await mobileCtx.clearCookies();
      const mobilePage = await mobileCtx.newPage();
      mobilePage.setDefaultTimeout(15000);

      await mobilePage.goto(env.url, { waitUntil: 'networkidle' });
      await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, `${env.name}_mobile_01_stacked_dialogs.png`) });

      // Because LocationPermissionGate has z-[130] and BlindVoiceGate has z-[100],
      // LocationPermissionGate is visually and physically on top!
      const locDismissBtn = mobilePage.locator('button:has-text("Continue without location")');
      if (await locDismissBtn.count() > 0 && await locDismissBtn.isVisible()) {
        await locDismissBtn.click();
        await mobilePage.waitForTimeout(500);
      }
      await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, `${env.name}_mobile_02_voice_gate_revealed.png`) });

      // Now dismiss the underlying voice gate
      const voiceNoBtn = mobilePage.locator('button:has-text("NO - Standard Mode")');
      if (await voiceNoBtn.count() > 0 && await voiceNoBtn.isVisible()) {
        await voiceNoBtn.click();
        await mobilePage.waitForTimeout(500);
      }

      // Screen after dismissal
      await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, `${env.name}_mobile_03_revealed_home.png`) });

      // Evaluate revealed home on mobile
      const mobileMetrics = await mobilePage.evaluate(() => {
        const text = document.body.innerText;
        const clickables = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"], [tabindex="0"]'))
          .filter(el => {
            const r = el.getBoundingClientRect();
            return r.top >= 0 && r.top <= window.innerHeight && r.width > 0 && r.height > 0;
          });
        const navLinks = Array.from(document.querySelectorAll('nav a, header a, nav button, header button'));
        
        return {
          clickablesInFold: clickables.length,
          navLinksCount: navLinks.length,
          navTexts: navLinks.map(n => n.innerText.trim()).filter(Boolean),
          hasWhereAmI: text.includes('TravelMate'),
          hasWhatItDoes: text.includes('When direct trains are waitlisted') || text.includes('route recovery') || text.includes('never get stranded'),
          hasHowToSearch: !!document.querySelector('input[placeholder*="origin" i], input[placeholder*="from" i], input[placeholder*="station" i]'),
          hasSoldOutGuidance: text.includes('Waitlist Bypass') || text.includes('Alternative') || text.includes('sold out') || text.includes('waitlist'),
          hasUrgentMode: text.includes('Urgent') || text.includes('12h') || text.includes('Tatkal'),
          h1Text: document.querySelector('h1')?.innerText || '',
          heroSnippet: text.substring(0, 600)
        };
      });
      report[env.name].mobile = mobileMetrics;
      await mobileCtx.close();

      // 2. Desktop (1440x900) Cold & After Dismissal
      const deskCtx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1
      });
      await deskCtx.clearCookies();
      const deskPage = await deskCtx.newPage();
      deskPage.setDefaultTimeout(15000);

      await deskPage.goto(env.url, { waitUntil: 'networkidle' });
      await deskPage.screenshot({ path: path.join(SCREENSHOT_DIR, `${env.name}_desktop_01_stacked_dialogs.png`) });

      const dLocDismiss = deskPage.locator('button:has-text("Continue without location")');
      if (await dLocDismiss.count() > 0 && await dLocDismiss.isVisible()) {
        await dLocDismiss.click();
        await deskPage.waitForTimeout(500);
      }
      await deskPage.screenshot({ path: path.join(SCREENSHOT_DIR, `${env.name}_desktop_02_voice_gate_revealed.png`) });

      const dVoiceNo = deskPage.locator('button:has-text("NO - Standard Mode")');
      if (await dVoiceNo.count() > 0 && await dVoiceNo.isVisible()) {
        await dVoiceNo.click();
        await deskPage.waitForTimeout(500);
      }

      await deskPage.screenshot({ path: path.join(SCREENSHOT_DIR, `${env.name}_desktop_03_revealed_home.png`) });

      const deskMetrics = await deskPage.evaluate(() => {
        const text = document.body.innerText;
        const clickables = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"], [tabindex="0"]'))
          .filter(el => {
            const r = el.getBoundingClientRect();
            return r.top >= 0 && r.top <= window.innerHeight && r.width > 0 && r.height > 0;
          });
        const navLinks = Array.from(document.querySelectorAll('nav a, header a, nav button, header button'));
        return {
          clickablesInFold: clickables.length,
          navLinksCount: navLinks.length,
          navTexts: navLinks.map(n => n.innerText.trim()).filter(Boolean),
          hasWhereAmI: text.includes('TravelMate'),
          hasWhatItDoes: text.includes('When direct trains are waitlisted') || text.includes('route recovery') || text.includes('never get stranded'),
          hasHowToSearch: !!document.querySelector('input[placeholder*="origin" i], input[placeholder*="from" i], input[placeholder*="station" i]'),
          hasSoldOutGuidance: text.includes('Waitlist Bypass') || text.includes('Alternative') || text.includes('sold out') || text.includes('waitlist'),
          hasUrgentMode: text.includes('Urgent') || text.includes('12h') || text.includes('Tatkal'),
          h1Text: document.querySelector('h1')?.innerText || '',
          heroSnippet: text.substring(0, 800)
        };
      });
      report[env.name].desktop = deskMetrics;
      await deskCtx.close();
    }

    fs.writeFileSync('docs/audit-v2/test-logs/part1_dismiss_analysis.json', JSON.stringify(report, null, 2));
    console.log('Part 1 dismiss analysis finished successfully.');
  } finally {
    await browser.close();
  }
}

testDismissAndMeasure().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

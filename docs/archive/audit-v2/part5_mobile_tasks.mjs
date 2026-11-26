import { chromium } from 'playwright';
import fs from 'fs';

async function runCleanMobileTasks() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    deviceScaleFactor: 2
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  const taskLog = [];

  async function recordTask(name, actionFn) {
    const start = Date.now();
    let clicks = 0;
    let errors = [];
    let hesitationPoints = [];

    const clickListener = () => { clicks++; };
    page.on('click', clickListener);

    try {
      await actionFn({
        addHesitation: (h) => hesitationPoints.push(h),
        addError: (e) => errors.push(e)
      });
      const durationMs = Date.now() - start;
      taskLog.push({
        task: name,
        durationMs,
        clicks,
        hesitationPoints,
        errors,
        status: errors.length ? 'PARTIAL' : 'PASS'
      });
    } catch (err) {
      const durationMs = Date.now() - start;
      taskLog.push({
        task: name,
        durationMs,
        clicks,
        hesitationPoints,
        errors: [...errors, err.message],
        status: 'FAIL'
      });
    } finally {
      page.off('click', clickListener);
    }
  }

  try {
    console.log('Running clean mobile tasks...');

    // Task (a): Find alternative route for sold-out corridor
    await recordTask('(a) Find alternative route for sold-out corridor', async (ctx) => {
      await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
      
      const locBtn = page.getByRole('button', { name: /continue without location/i });
      if (await locBtn.isVisible()) {
        await locBtn.click();
        ctx.addHesitation('Cold visitor blocked by Location Gate modal on initial load');
      }
      const voiceBtn = page.getByRole('button', { name: /no - standard mode/i });
      if (await voiceBtn.isVisible()) {
        await voiceBtn.click();
        ctx.addHesitation('Cold visitor blocked by Voice Gate modal on initial load');
      }

      const corridorChip = page.getByRole('button', { name: /delhi ⇄ patna/i });
      await corridorChip.click();

      const searchBtn = page.getByTestId('home-search-btn');
      await searchBtn.click();
      await page.waitForTimeout(1000);

      // On planner page
      const plannerSearchBtn = page.getByTestId('planner-search-btn');
      if (await plannerSearchBtn.isVisible()) {
        ctx.addHesitation('Double-search confusion: user must tap Search button again on planner page');
        await plannerSearchBtn.click();
        await page.waitForTimeout(1500);
      }

      const modalClose = page.getByRole('button', { name: /close results/i }).or(page.locator('[aria-label="Close"]')).first();
      if (await modalClose.isVisible()) {
        // Modal is open, close it to allow inspecting underlying page
        await modalClose.click();
        await page.waitForTimeout(400);
      }
    });

    // Task (b): Understand transfer risk
    await recordTask('(b) Understand transfer risk', async (ctx) => {
      const contrastCard = page.getByTestId('waitlist-bypass-contrast');
      const hasContrast = await contrastCard.isVisible();
      if (!hasContrast) {
        ctx.addHesitation('Waitlist bypass contrast card not visible in mobile fold');
      }
      const riskBadge = page.locator('text=Safe').or(page.locator('text=Moderate')).first();
      const hasRisk = await riskBadge.isVisible();
      if (!hasRisk) {
        ctx.addHesitation('Risk badge not immediately obvious without scrolling');
      }
    });

    // Task (c): Simulate late first train
    await recordTask('(c) Simulate late first train', async (ctx) => {
      // Find delay simulator tab on NormalPlanner
      const delayTab = page.getByRole('tab', { name: /if leg 1 runs late|delay simulator/i }).or(page.locator('button:has-text("If Leg 1 Runs Late")')).first();
      if (await delayTab.isVisible()) {
        await delayTab.click();
        await page.waitForTimeout(500);
        const slider = page.locator('input[type="range"]');
        if (await slider.isVisible()) {
          // successfully reached slider
        } else {
          ctx.addHesitation('Range slider not found after switching to delay tab');
        }
      } else {
        ctx.addHesitation('Delay simulator tab hidden or modal still active');
      }
    });

    // Task (d): Use Demo scenario
    await recordTask('(d) Use Demo scenario', async (ctx) => {
      await page.goto('http://127.0.0.1:5173/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-15&demo=true', { waitUntil: 'networkidle' });
      const demoBanner = page.getByTestId('demo-mode-banner');
      const visible = await demoBanner.isVisible();
      if (!visible) {
        ctx.addError('Demo banner not visible when demo=true param present');
      }
    });

    // Task (e): Prepare for Tatkal
    await recordTask('(e) Prepare for Tatkal', async (ctx) => {
      await page.goto('http://127.0.0.1:5173/planner?mode=tatkal', { waitUntil: 'networkidle' });
      const countdown = page.locator('text=10:00 AM').or(page.locator('text=11:00 AM')).first();
      const visible = await countdown.isVisible();
      if (!visible) {
        ctx.addError('Tatkal countdown timers not visible on Tatkal Desk');
      }
    });

    // Task (f): Save or open offline pass
    await recordTask('(f) Save or open offline pass', async (ctx) => {
      await page.goto('http://127.0.0.1:5173/saved', { waitUntil: 'networkidle' });
      const heading = page.getByRole('heading', { level: 1 }).or(page.getByRole('heading', { level: 2 })).first();
      const text = await heading.innerText();
      if (!text.toLowerCase().includes('saved') && !text.toLowerCase().includes('pass')) {
        ctx.addHesitation(`Unexpected heading on /saved: ${text}`);
      }
    });

    // Task (g): Find helpline numbers
    await recordTask('(g) Find helpline numbers', async (ctx) => {
      await page.goto('http://127.0.0.1:5173/safety', { waitUntil: 'networkidle' });
      const h112 = page.locator('a[href*="112"]').or(page.locator('text=112')).first();
      const h139 = page.locator('a[href*="139"]').or(page.locator('text=139')).first();
      if (!(await h112.isVisible()) || !(await h139.isVisible())) {
        ctx.addError('112 or 139 helpline dialing buttons not visible on /safety');
      }
    });

    // Task (h): Change date or origin after results
    await recordTask('(h) Change date or origin after results', async (ctx) => {
      await page.goto('http://127.0.0.1:5173/planner', { waitUntil: 'networkidle' });
      const originInput = page.locator('#planner-from-input, input[placeholder*="from" i], input[placeholder*="origin" i]').first();
      if (await originInput.isVisible()) {
        await originInput.fill('Mumbai');
      } else {
        ctx.addHesitation('Origin input not found on planner');
      }
    });

    // Task (i): Recover from mistake
    await recordTask('(i) Recover from mistake', async (ctx) => {
      await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
      const searchBtn = page.getByTestId('home-search-btn');
      if (await searchBtn.isVisible()) {
        await searchBtn.click();
        await page.waitForTimeout(400);
        const toast = page.locator('.app-toast');
        if (!(await toast.isVisible())) {
          ctx.addHesitation('No toast or inline validation visible upon empty search');
        }
      }
    });

    fs.writeFileSync('docs/audit-v2/test-logs/part5_mobile_tasks_clean.json', JSON.stringify(taskLog, null, 2));
    console.log('Clean mobile tasks completed successfully.');
  } finally {
    await browser.close();
  }
}

runCleanMobileTasks().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});

import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { localDateIso } from '../../src/utils/date.js';

const BASE_URL = 'http://127.0.0.1:5173';
const SCREENSHOT_DIR = path.resolve('docs/audit-v3/screenshots');
const METRICS_DIR = path.resolve('docs/audit-v3/metrics');
const LOGS_DIR = path.resolve('docs/audit-v3/test-logs');

async function main() {
  console.log('=== STARTING INDEPENDENT AUDIT V3 ===');
  const startTime = Date.now();
  const summary = {
    timestamp: new Date().toISOString(),
    auditTarget: BASE_URL,
    findingsChecked: 15,
    prosChecked: 10,
    results: {},
    passedChecks: 0,
    failedChecks: 0
  };

  const browser = await chromium.launch({ headless: true });

  try {
    // -------------------------------------------------------------
    // CHECK 1: Cold Visit Gates & Modals (C-01, C-02, C-03)
    // -------------------------------------------------------------
    console.log('[Audit V3] Check 1: Cold visit gates & modals...');
    const coldContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await coldContext.clearCookies();
    const coldPage = await coldContext.newPage();
    await coldPage.goto(BASE_URL, { waitUntil: 'networkidle' });

    await coldPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'v3_home_desktop.png') });

    const openModals = await coldPage.$$eval('[role="dialog"], .modal, .modal-backdrop, .overlay, [aria-modal="true"]', (els) => {
      return els.filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }).length;
    });

    const isBackdropPresent = await coldPage.evaluate(() => {
      const el = document.elementFromPoint(720, 450);
      return el ? (el.className.includes('backdrop') || el.className.includes('modal')) : false;
    });

    const navItemsCount = await coldPage.$$eval('header nav a, header nav button', els => els.length);

    summary.results['C-01_cold_gates'] = {
      openModals,
      isBackdropPresent,
      navItemsCount,
      pass: openModals === 0 && !isBackdropPresent && navItemsCount === 4
    };

    // Mobile check
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' });
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'v3_home_mobile.png') });
    await mobileContext.close();

    // Spec compliance: BlindVoiceGate & LocationPermissionGate in App.jsx
    const appCode = fs.readFileSync('src/App.jsx', 'utf8');
    summary.results['C-02_blind_gate_spec'] = {
      autoInvoked: appCode.includes('<BlindVoiceGate />') || !appCode.includes('blindGateOpen'),
      pass: !appCode.includes('<BlindVoiceGate />') && appCode.includes('blindGateOpen')
    };

    // Location permission gate gesture check
    const locGateCode = fs.readFileSync('src/components/LocationPermissionGate.jsx', 'utf8');
    summary.results['C-03_location_permission'] = {
      autoOpens: locGateCode.includes('setOpen(!choice)'),
      pass: !locGateCode.includes('setOpen(!choice)') && locGateCode.includes('setOpen(false)')
    };

    // -------------------------------------------------------------
    // CHECK 2: Date Picker Past-Date Constraints (C-14)
    // -------------------------------------------------------------
    console.log('[Audit V3] Check 2: Date picker min constraint...');
    const homeDateInput = coldPage.locator('#home-travel-date');
    const minAttr = await homeDateInput.getAttribute('min');
    const today = localDateIso();

    const rangeUnderflowCheck = await coldPage.evaluate(() => {
      const el = document.getElementById('home-travel-date');
      el.value = '2020-01-01';
      return {
        rangeUnderflow: el.validity.rangeUnderflow,
        valid: el.validity.valid
      };
    });

    summary.results['C-14_date_picker_min'] = {
      minAttr,
      expectedMin: today,
      rangeUnderflowTriggered: rangeUnderflowCheck.rangeUnderflow,
      pass: minAttr === today && rangeUnderflowCheck.rangeUnderflow === true
    };

    await coldContext.close();

    // -------------------------------------------------------------
    // CHECK 3: Search Flow, Deep Links, Inline Results & Unbundled Disclaimer (C-06, C-07, C-08, C-11, C-15)
    // -------------------------------------------------------------
    console.log('[Audit V3] Check 3: Search flow, inline results, deep links & C-15 disclaimer...');
    const plannerContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const plannerPage = await plannerContext.newPage();
    
    // Direct URL navigation with search query params
    await plannerPage.goto(`${BASE_URL}/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-15`, { waitUntil: 'networkidle' });
    await plannerPage.waitForTimeout(1000);

    await plannerPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'v3_planner_desktop.png') });

    // Check C-08 auto-trigger
    const cardsCount = await plannerPage.locator('[data-testid="multimodal-journey-card"]').count();
    
    // Check C-07 inline layout (results container has no fixed/inset-0 modal class)
    const isModalCover = await plannerPage.evaluate(() => {
      const panel = document.querySelector('[data-testid="live-results-panel"]');
      if (!panel) return false;
      const style = window.getComputedStyle(panel);
      return style.position === 'fixed' && (style.top === '0px' || style.inset === '0px');
    });

    // Check C-11 single container mount
    const bypassContrastMounts = await plannerPage.locator('[data-testid="waitlist-bypass-contrast"]').count();

    // Check C-15 unbundled ticketing disclaimer
    const disclaimerLocator = plannerPage.locator('[data-testid="unbundled-ticketing-disclaimer"]').first();
    const isDisclaimerVisible = await disclaimerLocator.isVisible();
    const disclaimerText = isDisclaimerVisible ? await disclaimerLocator.innerText() : '';

    // Check C-06 deep links
    const deepLinks = await plannerPage.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href*="redbus.in"], a[href*="google.com/travel/flights"]'));
      return anchors.map(a => a.href);
    });

    const hasRedbusCitySlug = deepLinks.some(link => link.includes('redbus.in/bus-tickets/') && !link.match(/bus-tickets\/[A-Z]{3,5}-to-/));
    const hasFlightsIata = deepLinks.some(link => link.includes('google.com/travel/flights') && link.includes('DEL') || link.includes('PAT'));

    summary.results['C-08_search_auto_trigger'] = { cardsCount, pass: cardsCount > 0 };
    summary.results['C-07_inline_results'] = { isModalCover, pass: !isModalCover && cardsCount > 0 };
    summary.results['C-11_single_mount'] = { bypassContrastMounts, pass: bypassContrastMounts === 1 };
    summary.results['C-15_unbundled_disclaimer'] = {
      isDisclaimerVisible,
      containsSeparatePnr: disclaimerText.toLowerCase().includes('separate pnr') || disclaimerText.toLowerCase().includes('unbundled'),
      containsBuffer: disclaimerText.toLowerCase().includes('buffer'),
      pass: isDisclaimerVisible && disclaimerText.toLowerCase().includes('separate pnr') && disclaimerText.toLowerCase().includes('buffer')
    };
    summary.results['C-06_deep_links'] = {
      deepLinksFound: deepLinks.length,
      sampleLinks: deepLinks.slice(0, 2),
      pass: deepLinks.length > 0 && (hasRedbusCitySlug || hasFlightsIata)
    };

    // Mobile Planner screenshot
    const mobilePlannerCtx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
    const mobilePlannerPage = await mobilePlannerCtx.newPage();
    await mobilePlannerPage.goto(`${BASE_URL}/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-15`, { waitUntil: 'networkidle' });
    await mobilePlannerPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'v3_planner_mobile.png') });
    await mobilePlannerCtx.close();

    await plannerContext.close();

    // -------------------------------------------------------------
    // CHECK 4: Safety, Saved & Legal Pages (P-10, C-09)
    // -------------------------------------------------------------
    console.log('[Audit V3] Check 4: Safety mode, saved plans & legal routes...');
    const safetyCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const safetyPage = await safetyCtx.newPage();
    await safetyPage.goto(`${BASE_URL}/safety`, { waitUntil: 'networkidle' });
    await safetyPage.screenshot({ path: path.join(SCREENSHOT_DIR, 'v3_safety_desktop.png') });

    // Check emergency hotlines by switching to SOS tab
    const sosTab = safetyPage.locator('[data-testid="tab-safety-helplines"]');
    if (await sosTab.isVisible()) {
      await sosTab.click();
      await safetyPage.waitForTimeout(300);
    }
    const hotlinesCount = await safetyPage.locator('button:has-text("Call "), [data-testid="helpline-139"]').count();
    summary.results['P-10_safety_hub'] = {
      hotlinesCount,
      pass: hotlinesCount >= 4
    };
    await safetyCtx.close();

    // Other desktop screenshots
    const otherRoutes = ['saved', 'privacy', 'terms', 'disclaimer'];
    for (const route of otherRoutes) {
      const pageCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const p = await pageCtx.newPage();
      await p.goto(`${BASE_URL}/${route}`, { waitUntil: 'networkidle' });
      await p.screenshot({ path: path.join(SCREENSHOT_DIR, `v3_${route}_desktop.png`) });
      await pageCtx.close();
    }

    // -------------------------------------------------------------
    // CHECK 5: Accessibility & WCAG 2.1 AA Axe-core Scan (C-09)
    // -------------------------------------------------------------
    console.log('[Audit V3] Check 5: Running comprehensive Axe-core a11y audit...');
    const a11yRoutes = ['/', '/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-15', '/safety', '/saved', '/privacy', '/terms', '/disclaimer'];
    const a11yReport = {};
    let totalSeriousOrCriticalViolations = 0;
    let totalColorContrastViolations = 0;

    for (const r of a11yRoutes) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const p = await ctx.newPage();
      await p.goto(`${BASE_URL}${r}`, { waitUntil: 'networkidle' });

      const axeResults = await new AxeBuilder({ page: p })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const seriousOrCritical = axeResults.violations.filter(v => v.impact === 'serious' || v.impact === 'critical');
      const contrastViolations = axeResults.violations.filter(v => v.id === 'color-contrast');

      totalSeriousOrCriticalViolations += seriousOrCritical.length;
      totalColorContrastViolations += contrastViolations.length;

      a11yReport[r] = {
        totalViolations: axeResults.violations.length,
        seriousOrCriticalCount: seriousOrCritical.length,
        colorContrastCount: contrastViolations.length,
        violations: axeResults.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }))
      };
      await ctx.close();
    }

    fs.writeFileSync(path.join(LOGS_DIR, 'v3_axe_report.json'), JSON.stringify(a11yReport, null, 2));

    summary.results['C-09_accessibility_wcag21aa'] = {
      totalSeriousOrCriticalViolations,
      totalColorContrastViolations,
      pass: totalSeriousOrCriticalViolations === 0 && totalColorContrastViolations === 0
    };

    // -------------------------------------------------------------
    // CHECK 6: Data Honesty Static Scan (C-04)
    // -------------------------------------------------------------
    console.log('[Audit V3] Check 6: Scanning codebase for dishonest claims...');
    const forbiddenClaimsFound = [];
    const filesToScan = ['src/components/MultimodalTimelineCard.jsx', 'src/components/StationHopperCard.jsx', 'src/utils/multimodalRouter.js', 'src/pages/Home.jsx'];

    for (const f of filesToScan) {
      const code = fs.readFileSync(f, 'utf8');
      const lines = code.split('\n');
      lines.forEach((line, idx) => {
        if (/confirmed\s+(seat|berth|quota|bypass)/i.test(line) && !line.includes('//') && !line.includes('Chance of Confirmed')) {
          forbiddenClaimsFound.push({ file: f, line: idx + 1, text: line.trim() });
        }
      });
    }

    summary.results['C-04_data_honesty'] = {
      forbiddenClaimsFoundCount: forbiddenClaimsFound.length,
      claims: forbiddenClaimsFound,
      pass: forbiddenClaimsFound.length === 0
    };

    // -------------------------------------------------------------
    // CHECK 7: Timetable Dataset Hub Coverage & Route Battery (C-05)
    // -------------------------------------------------------------
    console.log('[Audit V3] Check 7: Testing canonical timetable dataset & route engine...');
    const trains = JSON.parse(fs.readFileSync('shared/data/trains.json', 'utf8'));
    const stops = JSON.parse(fs.readFileSync('shared/data/stops.json', 'utf8'));
    const hubsCovered = new Set();
    stops.forEach(s => hubsCovered.add(s.stationCode));

    summary.results['C-05_timetable_hub_coverage'] = {
      totalTrains: trains.length,
      uniqueStationsCovered: hubsCovered.size,
      pass: trains.length >= 40 && hubsCovered.size >= 25
    };

    // -------------------------------------------------------------
    // CHECK 8: DevOps Security Headers in vercel.json (C-10)
    // -------------------------------------------------------------
    console.log('[Audit V3] Check 8: Checking Content-Security-Policy & HSTS in vercel.json...');
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    const allHeaders = vercelConfig.headers?.flatMap(h => h.headers || []) || [];
    const cspHeader = allHeaders.find(h => h.key === 'Content-Security-Policy');
    const hstsHeader = allHeaders.find(h => h.key === 'Strict-Transport-Security');

    summary.results['C-10_security_headers'] = {
      hasCsp: !!cspHeader,
      cspValue: cspHeader?.value?.substring(0, 100) + '...',
      hasHsts: !!hstsHeader,
      pass: !!cspHeader && !!hstsHeader
    };

    // -------------------------------------------------------------
    // CHECK 9: Client Asset Bundle Inspection (C-12)
    // -------------------------------------------------------------
    console.log('[Audit V3] Check 9: Inspecting production bundle assets...');
    const distAssets = fs.existsSync('dist/assets') ? fs.readdirSync('dist/assets') : [];
    const hasClerkChunk = distAssets.some(f => f.toLowerCase().includes('clerk') || f.toLowerCase().includes('vendor-auth'));
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasClerkDep = !!(packageJson.dependencies?.['@clerk/clerk-react'] || packageJson.devDependencies?.['@clerk/clerk-react']);

    summary.results['C-12_bundle_auth_clerk'] = {
      hasClerkDep,
      hasClerkChunk,
      pass: !hasClerkDep && !hasClerkChunk
    };

    // -------------------------------------------------------------
    // CHECK 10: Dependency Vulnerabilities via npm audit (C-13)
    // -------------------------------------------------------------
    console.log('[Audit V3] Check 10: Running npm audit inspection...');
    let prodAuditOut = '';
    try {
      prodAuditOut = execSync('cmd.exe /c "npm audit --omit=dev --json"', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    } catch (e) {
      prodAuditOut = e.stdout || '{}';
    }

    const prodAuditJson = JSON.parse(prodAuditOut || '{}');
    const prodVulnSummary = prodAuditJson.metadata?.vulnerabilities || {};
    const prodHighAndCritical = (prodVulnSummary.high || 0) + (prodVulnSummary.critical || 0);

    summary.results['C-13_dependency_vulnerabilities'] = {
      productionVulnerabilities: prodVulnSummary,
      productionHighAndCritical: prodHighAndCritical,
      pass: prodHighAndCritical === 0
    };

  } finally {
    await browser.close();
  }

  // Calculate scores
  let passed = 0;
  let failed = 0;
  for (const [key, val] of Object.entries(summary.results)) {
    if (val.pass) passed++;
    else failed++;
  }
  summary.passedChecks = passed;
  summary.failedChecks = failed;
  summary.durationMs = Date.now() - startTime;

  fs.writeFileSync(path.join(METRICS_DIR, 'v3_metrics.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(LOGS_DIR, 'v3_audit_summary.json'), JSON.stringify(summary, null, 2));

  console.log(`=== AUDIT V3 COMPLETE: ${passed} PASSED, ${failed} FAILED in ${(summary.durationMs / 1000).toFixed(1)}s ===`);
}

main().catch(err => {
  console.error('Audit V3 execution failed:', err);
  process.exit(1);
});

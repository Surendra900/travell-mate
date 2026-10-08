/**
 * Day 6: Urgent Mode Preset, Tatkal Desk & Passenger Master, PNR Estimator, and Transit Glossary
 * Reference: docs/MASTER_SPEC.md Sections 4, 8, 14, 15
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Day 6 Gate: Urgent Mode Preset in Home, NormalPlanner, and Planner', () => {
  // Check Home.jsx
  const homeFile = path.resolve('src/pages/Home.jsx');
  assert.ok(fs.existsSync(homeFile), 'Home.jsx must exist');
  const homeContent = fs.readFileSync(homeFile, 'utf8');
  assert.ok(homeContent.includes('Need to travel tonight? (12h)'), 'Home must contain Urgent tonight checkbox');
  assert.ok(homeContent.includes("params.set('urgency', 'Tonight')") && homeContent.includes("params.set('urgent', '12h')"), 'Home must route with urgency query params');

  // Check NormalPlanner.jsx
  const normalPlannerFile = path.resolve('src/planner/NormalPlanner.jsx');
  assert.ok(fs.existsSync(normalPlannerFile), 'NormalPlanner.jsx must exist');
  const normalPlannerContent = fs.readFileSync(normalPlannerFile, 'utf8');
  assert.ok(normalPlannerContent.includes('data-testid="planner-urgent-tonight-checkbox"'), 'NormalPlanner must have urgent tonight checkbox testid');
  assert.ok(normalPlannerContent.includes('Need to travel tonight? (12h)'), 'NormalPlanner must label 12h urgency');

  // Check Planner.jsx
  const plannerFile = path.resolve('src/pages/Planner.jsx');
  assert.ok(fs.existsSync(plannerFile), 'Planner.jsx must exist');
  const plannerContent = fs.readFileSync(plannerFile, 'utf8');
  assert.ok(plannerContent.includes('data-testid="urgent-tonight-banner"'), 'Planner must have urgent-tonight-banner');
  assert.ok(plannerContent.includes('Urgent Departure Preset Active (12h)'), 'Planner must explain 12h departure window');
  // Must NOT redirect urgent to tatkal
  assert.ok(!plannerContent.includes("if (urgency === 'Tonight') {\n      setManualMode('emergency')"), 'Urgent tonight must not hijack to emergency mode');
});

test('Day 6 Gate: Tatkal Desk Dual-Window IST Countdown and Assistive Notice', () => {
  const timerFile = path.resolve('src/components/TatkalEmergencyTimer.jsx');
  assert.ok(fs.existsSync(timerFile), 'TatkalEmergencyTimer.jsx must exist');
  const timerContent = fs.readFileSync(timerFile, 'utf8');

  // Verify dual countdown targets
  assert.ok(timerContent.includes('data-testid="tatkal-countdown-display"'), 'Must have tatkal countdown display testid');
  assert.ok(timerContent.includes('data-testid="tatkal-diff-ac"'), 'Must have AC countdown difference testid');
  assert.ok(timerContent.includes('data-testid="tatkal-diff-nonac"'), 'Must have Non-AC countdown difference testid');
  assert.ok(timerContent.includes('10:00 AM IST') || timerContent.includes('10:00'), 'Must track 10:00 AM IST AC window');
  assert.ok(timerContent.includes('11:00 AM IST') || timerContent.includes('11:00'), 'Must track 11:00 AM IST Non-AC window');
  assert.ok(!timerContent.includes('🚨'), 'Must not use sensationalist emergency sirens for standard booking quota');
});

test('Day 6 Gate: Local Passenger Master List with Zero-ID Compliance and Clipboard Copy', () => {
  const deskFile = path.resolve('src/planner/EmergencyTatkalPlanner.jsx');
  assert.ok(fs.existsSync(deskFile), 'EmergencyTatkalPlanner.jsx must exist');
  const deskContent = fs.readFileSync(deskFile, 'utf8');

  // Assistive notice and Zero-ID policy
  assert.ok(deskContent.includes('data-testid="tatkal-assistive-notice"'), 'Must contain tatkal assistive notice');
  assert.ok(deskContent.includes('data-testid="zero-id-notice"'), 'Must contain zero-ID compliance notice');
  assert.ok(deskContent.includes('Zero ID Numbers Stored'), 'Must prominently disclose zero ID storage');
  
  // Verify strictly NO personal ID input fields or storage
  assert.ok(!deskContent.includes('name="aadhaar"') && !deskContent.includes('placeholder="Aadhaar'), 'Must not have Aadhaar form fields');
  assert.ok(!deskContent.includes('name="passport"') && !deskContent.includes('placeholder="Passport'), 'Must not have Passport form fields');
  assert.ok(!deskContent.includes('name="pan"') && !deskContent.includes('placeholder="PAN'), 'Must not have PAN form fields');

  // 1-Click Clipboard Copy and Clear-Data handlers
  assert.ok(deskContent.includes('data-testid="copy-all-passengers-btn"'), 'Must have copy all passengers button');
  assert.ok(deskContent.includes('data-testid="clear-passengers-btn"'), 'Must have clear passengers button');
  assert.ok(deskContent.includes('Name, Age, Gender, Berth'), 'Must specify IRCTC-compliant clipboard format');
  assert.ok(deskContent.includes('localStorage.removeItem'), 'Clear action must purge local storage');

  // Clean export alias TatkalDesk.jsx
  const aliasFile = path.resolve('src/planner/TatkalDesk.jsx');
  assert.ok(fs.existsSync(aliasFile), 'TatkalDesk.jsx export alias must exist');
});

test('Day 6 Gate: PNR Tracker & Confirmation Estimator with Honest Disclaimers', () => {
  const pnrFile = path.resolve('src/components/PnrPredictorModal.jsx');
  assert.ok(fs.existsSync(pnrFile), 'PnrPredictorModal.jsx must exist');
  const pnrContent = fs.readFileSync(pnrFile, 'utf8');

  // 10-digit PNR input & odds display
  assert.ok(pnrContent.includes('data-testid="pnr-input"'), 'Must have pnr-input testid');
  assert.ok(pnrContent.includes('data-testid="pnr-predict-btn"'), 'Must have pnr-predict-btn testid');
  assert.ok(pnrContent.includes('data-testid="pnr-probability-display"'), 'Must display confirmation probability');

  // How we estimate toggle & official IRCTC/NTES links
  assert.ok(pnrContent.includes('data-testid="how-we-estimate-btn"'), 'Must have how-we-estimate toggle button');
  assert.ok(pnrContent.includes('data-testid="pnr-estimation-disclaimer"'), 'Must have estimation disclaimer card');
  assert.ok(pnrContent.includes('How we estimate'), 'Must explain estimation methodology');
  assert.ok(pnrContent.includes('data-testid="pnr-official-link"'), 'Must link to official Indian Railways enquiry');
  assert.ok(pnrContent.includes('https://www.indianrail.gov.in'), 'Must contain direct official railway link');
  assert.ok(pnrContent.includes('Historical Model') || pnrContent.includes('heuristic model'), 'Must clearly state it is a model estimate, not guaranteed');
});

test('Day 6 Gate: Transit Glossary Tooltip component with core Indian transit terms', () => {
  const glossaryFile = path.resolve('src/components/GlossaryTooltip.jsx');
  assert.ok(fs.existsSync(glossaryFile), 'GlossaryTooltip.jsx must exist');
  const glossaryContent = fs.readFileSync(glossaryFile, 'utf8');

  // Check supported terms
  assert.ok(glossaryContent.includes('WL'), 'Glossary must support WL (Waiting List)');
  assert.ok(glossaryContent.includes('RAC'), 'Glossary must support RAC (Reservation Against Cancellation)');
  assert.ok(glossaryContent.includes('PNR'), 'Glossary must support PNR (Passenger Name Record)');
  assert.ok(glossaryContent.includes('Tatkal'), 'Glossary must support Tatkal');
  assert.ok(glossaryContent.includes('Junction'), 'Glossary must support Junction');

  // Check accessibility
  assert.ok(glossaryContent.includes('aria-expanded'), 'Glossary must support aria-expanded');
  assert.ok(glossaryContent.includes('glossary-tooltip-'), 'Must provide structured testid for glossary triggers');
  assert.ok(glossaryContent.includes('data-testid="glossary-popover"'), 'Must provide popover testid');
});

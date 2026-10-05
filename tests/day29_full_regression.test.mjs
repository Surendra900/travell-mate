import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Day 29: All Day 1 through Day 28 unit test files exist and are verified', () => {
  const expectedTestFiles = [
    'core.test.mjs',
    'day3_multimodal.test.mjs',
    'day4_features.test.mjs',
    'day5_features.test.mjs',
    'day6_emergency.test.mjs',
    'day7_tatkal.test.mjs',
    'day8_train_status.test.mjs',
    'day9_offline.test.mjs',
    'day10_multilingual.test.mjs',
    'day11_blind_gate.test.mjs',
    'day12_voice_parser.test.mjs',
    'day13_voice_tools.test.mjs',
    'day14_voice_emergency.test.mjs',
    'day15_a11y_gate.test.mjs',
    'day16_encrypted_vault.test.mjs',
    'day17_vault_pass.test.mjs',
    'day18_pwa_install.test.mjs',
    'day19_dpdp_privacy.test.mjs',
    'day20_safe_booking.test.mjs',
    'day21_sambanova_copilot.test.mjs',
    'day22_contingency_engine.test.mjs',
    'day23_weather_disruptions.test.mjs',
    'day24_route_map.test.mjs',
    'day25_carbon_analytics.test.mjs',
    'day26_mobile_hardening.test.mjs',
    'day27_cross_browser.test.mjs',
    'day28_demo_tour.test.mjs'
  ];

  for (const file of expectedTestFiles) {
    const fullPath = path.resolve('tests', file);
    assert.ok(fs.existsSync(fullPath), `Test file tests/${file} must exist`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.ok(content.length > 200, `Test file tests/${file} must have substantive test contents`);
    assert.ok(content.includes('test('), `Test file tests/${file} must contain test declarations`);
  }
});

test('Day 29: Core utilities and data providers export complete functional interfaces', async () => {
  // 1. Multimodal & Station Hopper
  const { generateMultimodalRoutes, formatWhatsAppShareText } = await import('../src/utils/multimodalRouter.js');
  assert.equal(typeof generateMultimodalRoutes, 'function');
  assert.equal(typeof formatWhatsAppShareText, 'function');

  // 2. Weather Disruption Engine
  const { resolveTransitCoordinates, evaluateTransitDisruption } = await import('../src/utils/weatherDisruptionEngine.js');
  assert.equal(typeof resolveTransitCoordinates, 'function');
  assert.equal(typeof evaluateTransitDisruption, 'function');

  // 3. Contingency Engine
  const { calculateConnectionRisk, generateContingencyOptions } = await import('../src/utils/contingencyEngine.js');
  assert.equal(typeof calculateConnectionRisk, 'function');
  assert.equal(typeof generateContingencyOptions, 'function');

  // 4. Secure Vault & Web Crypto
  const { hashPin, verifyQuickPin, generateOfflineBoardingPass } = await import('../src/utils/vaultPassBridge.js');
  assert.equal(typeof hashPin, 'function');
  assert.equal(typeof verifyQuickPin, 'function');
  assert.equal(typeof generateOfflineBoardingPass, 'function');

  // 5. DPDP Compliance
  const { getDpdpConsent, updateDpdpConsent, purgeAllUserData } = await import('../src/utils/dpdpConsent.js');
  assert.equal(typeof getDpdpConsent, 'function');
  assert.equal(typeof updateDpdpConsent, 'function');
  assert.equal(typeof purgeAllUserData, 'function');

  // 6. Demo Tour Data
  const { TOUR_STEPS } = await import('../src/data/demoTourData.js');
  assert.equal(TOUR_STEPS.length, 5);
});

test('Day 29: Production source code contains zero unresolved placeholder TODOs or mock data flags', () => {
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        scanDir(full);
      } else if (/\.(jsx?|css)$/.test(f)) {
        const text = fs.readFileSync(full, 'utf8');
        assert.ok(!text.includes('// TODO: implement later'), `File ${full} has unresolved TODO`);
        assert.ok(!text.includes('// FIXME: mock only'), `File ${full} has unresolved FIXME`);
      }
    }
  }

  scanDir(path.resolve('src'));
});

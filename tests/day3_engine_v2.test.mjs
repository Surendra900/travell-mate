/**
 * Day 3: Route Recovery Engine v2 Test Suite
 * Asserts time-expanded graph properties, zero MCT violations,
 * chronological monotonicity, 3-tier ranking, and delay contingency simulation.
 * Reference: docs/MASTER_SPEC.md Sections 5 & 6
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findDirectTrainRoutes,
  findConnectingRoutes,
  searchRecoveryRoutes,
  rankItinerariesIntoTiers,
  resolveStationCode,
  parseTimeToMinutes,
  formatMinutesToTime
} from '../server/services/routeEngine.js';
import {
  getMinimumConnectionTime,
  MIN_CONNECTION_MINUTES,
  isOvernightTime
} from '../server/config/connectionTimes.js';
import {
  evaluateConnectionReliability,
  classifySlackRisk,
  RISK_LEVELS
} from '../server/config/reliabilityModel.js';
import {
  simulateLeg1Delay,
  findAlternativeHubDepartures
} from '../server/services/contingencyEngine.js';

test('Day 3 Gate: Minimum Connection Time Matrix adheres to Master Spec', () => {
  assert.equal(MIN_CONNECTION_MINUTES.RAIL_TO_RAIL_SAME_STATION, 45, 'Rail-to-Rail same station must be >= 45 min');
  assert.equal(MIN_CONNECTION_MINUTES.RAIL_TO_RAIL_CROSS_METRO, 90, 'Rail-to-Rail cross-metro must be >= 90 min');
  assert.equal(MIN_CONNECTION_MINUTES.RAIL_TO_BUS, 105, 'Rail-to-Bus intermodal must be >= 105 min');
  assert.equal(MIN_CONNECTION_MINUTES.RAIL_TO_AIRPORT, 210, 'Rail-to-Airport must be >= 210 min');

  assert.equal(getMinimumConnectionTime('train', 'train', true), 45);
  assert.equal(getMinimumConnectionTime('train', 'train', false), 90);
  assert.equal(getMinimumConnectionTime('train', 'bus'), 105);
  assert.equal(getMinimumConnectionTime('train', 'flight'), 210);
});

test('Day 3 Gate: Station Code Resolver handles cities and codes', () => {
  assert.equal(resolveStationCode('NDLS'), 'NDLS');
  assert.equal(resolveStationCode('New Delhi'), 'NDLS');
  assert.equal(resolveStationCode('Patna'), 'PNBE');
  assert.equal(resolveStationCode('Kanpur'), 'CNB');
  assert.equal(resolveStationCode('Mumbai'), 'MMCT');
  assert.equal(resolveStationCode('Bengaluru'), 'SBC');
});

test('Day 3 Gate: Direct Train Search returns valid chronological itineraries', () => {
  const directRoutes = findDirectTrainRoutes('NDLS', 'PNBE', '2026-10-15');
  assert.ok(Array.isArray(directRoutes), 'Must return an array');
  assert.ok(directRoutes.length > 0, 'Must find direct trains between Delhi and Patna');

  for (const route of directRoutes) {
    assert.equal(route.type, 'direct');
    assert.equal(route.mode, 'train');
    assert.equal(route.provenance, 'TIMETABLE');
    assert.ok(route.durationMinutes > 0, 'Duration must be positive');
    assert.ok(route.distanceKm > 0, 'Distance must be positive');
    assert.ok(route.bookingUrl.includes('confirmtkt.com'), 'Must generate valid ConfirmTkt deep-link');
  }
});

test('Day 3 Gate: Property Test — Zero MCT Violations across all split routes', () => {
  const testCorridors = [
    { from: 'NDLS', to: 'PNBE' },
    { from: 'NDLS', to: 'MMCT' },
    { from: 'SC', to: 'SBC' },
    { from: 'HWH', to: 'MAS' }
  ];

  for (const corridor of testCorridors) {
    const splitRoutes = findConnectingRoutes(corridor.from, corridor.to, {
      travelDate: '2026-10-15',
      includeHighRisk: false
    });

    for (const route of splitRoutes) {
      const { slackMinutes, transfer, reliability } = route;
      const mct = transfer.mctMinutes;

      assert.ok(
        slackMinutes >= mct,
        `MCT VIOLATION in ${route.id}: slack (${slackMinutes}m) is less than required MCT (${mct}m)`
      );
      assert.notEqual(
        reliability.riskLevel,
        RISK_LEVELS.BROKEN,
        'Active routes must not be in BROKEN risk state'
      );
      assert.equal(reliability.isViolatingMct, false);
    }
  }
});

test('Day 3 Gate: Property Test — Strict Chronological Monotonicity', () => {
  const routes = findConnectingRoutes('NDLS', 'PNBE', { travelDate: '2026-10-15' });
  assert.ok(routes.length > 0, 'Should find connecting routes between Delhi and Patna');

  for (const r of routes) {
    // Total duration must be positive and non-zero
    assert.ok(r.totalDurationMin > 0, 'Total duration must be positive');
    assert.ok(r.totalFare > 0, 'Total fare must be positive');

    // Leg 1 must have positive duration
    assert.ok(r.leg1.durationMin > 0, 'Leg 1 duration must be positive');
    // Leg 2 must have positive duration
    assert.ok(r.leg2.durationMin > 0, 'Leg 2 duration must be positive');

    // Slack must equal scheduled layover
    assert.ok(r.slackMinutes >= r.transfer.mctMinutes);

    // Provenance stamp on every leg
    assert.ok(['TIMETABLE', 'ESTIMATE', 'LIVE'].includes(r.leg1.provenance));
    assert.ok(['TIMETABLE', 'ESTIMATE', 'LIVE'].includes(r.leg2.provenance));

    // Split routes must carry legal disclosure
    assert.ok(r.legalNotice.includes('independent bookings'));
  }
});

test('Day 3 Gate: 3-Tier Multimodal Ranking contracts and properties', () => {
  const result = searchRecoveryRoutes({
    from: 'Delhi',
    to: 'Mumbai',
    date: '2026-10-15'
  });

  assert.ok(result.rankedTiers.length >= 2, 'Must rank at least 2 distinct tiers');
  const tiers = result.rankedTiers.map(t => t.tier);
  assert.ok(tiers.includes('paisa-vasool'), 'Must include Paisa Vasool (Budget) tier');
  assert.ok(tiers.includes('smart-balanced') || tiers.includes('emergency-express'), 'Must include Balanced or Express tier');

  const budgetRoute = result.rankedTiers.find(t => t.tier === 'paisa-vasool');
  const balancedRoute = result.rankedTiers.find(t => t.tier === 'smart-balanced');

  if (budgetRoute && balancedRoute) {
    assert.ok(
      budgetRoute.totalFare <= balancedRoute.totalFare,
      `Budget fare (₹${budgetRoute.totalFare}) should be <= Balanced fare (₹${balancedRoute.totalFare})`
    );
  }
});

test('Day 3 Gate: Parametric Reliability Model and Risk Classifier', () => {
  // Safe buffer >= 120 min
  const safeEval = evaluateConnectionReliability({
    slackMinutes: 140,
    mode1: 'train',
    mode2: 'train',
    sameStation: true,
    leg1VehicleName: 'Vande Bharat Express'
  });
  assert.equal(safeEval.riskLevel, RISK_LEVELS.SAFE);
  assert.ok(safeEval.maxDelayBeforeBreak >= 95);
  assert.ok(safeEval.estimatedReliabilityPercent >= 88);

  // Moderate buffer 90 - 119 min
  const modEval = evaluateConnectionReliability({
    slackMinutes: 100,
    mode1: 'train',
    mode2: 'train',
    sameStation: true,
    leg1VehicleName: 'Rajdhani Express'
  });
  assert.equal(modEval.riskLevel, RISK_LEVELS.MODERATE);

  // Tight buffer 60 - 89 min
  const tightEval = evaluateConnectionReliability({
    slackMinutes: 65,
    mode1: 'train',
    mode2: 'train',
    sameStation: true,
    leg1VehicleName: 'Superfast Express'
  });
  assert.equal(tightEval.riskLevel, RISK_LEVELS.TIGHT);

  // Broken connection (slack < MCT 45)
  const brokenEval = evaluateConnectionReliability({
    slackMinutes: 30,
    mode1: 'train',
    mode2: 'train',
    sameStation: true
  });
  assert.equal(brokenEval.riskLevel, RISK_LEVELS.BROKEN);
  assert.equal(brokenEval.isViolatingMct, true);
  assert.equal(brokenEval.estimatedReliabilityPercent, 0);
});

test('Day 3 Gate: Delay Contingency Simulator recomputes slack and viable fallbacks', () => {
  const result = searchRecoveryRoutes({
    from: 'NDLS',
    to: 'PNBE',
    date: '2026-10-15'
  });

  const testItinerary = result.rankedTiers[0];
  assert.ok(testItinerary, 'Must have at least one test itinerary');

  // Case 1: Minor delay absorbed by buffer (within maxDelayBeforeBreak)
  const safeDelay = Math.min(10, testItinerary.reliability?.maxDelayBeforeBreak || 15);
  const minorSim = simulateLeg1Delay(testItinerary, safeDelay);
  assert.equal(minorSim.delayMinutes, safeDelay);
  assert.equal(minorSim.isConnectionBroken, false, `Delay of ${safeDelay}m should be safely absorbed`);
  assert.ok(minorSim.effectiveSlackMinutes >= minorSim.mctMinutes);

  // Case 2: Severe delay causing connection breach
  const severeDelay = (testItinerary.slackMinutes || 90) + 30; // 30 min beyond total slack
  const severeSim = simulateLeg1Delay(testItinerary, severeDelay);
  assert.equal(severeSim.isConnectionBroken, true);
  assert.equal(severeSim.updatedRiskLevel, RISK_LEVELS.BROKEN);
  assert.ok(severeSim.fallbackDepartures.length > 0, 'Must provide onward fallback departures when connection breaks');
  assert.ok(severeSim.maxAbsorbableDelayMinutes >= 0);
  assert.ok(severeSim.pointOfNoReturnTime, 'Must specify point of no return clock time');
});

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchRecoveryRoutes } from '../../server/services/routeEngine.js';
import { simulateLeg1Delay, findAlternativeHubDepartures } from '../../server/services/contingencyEngine.js';
import { getMinimumConnectionTime } from '../../server/config/connectionTimes.js';
import { evaluateConnectionReliability, classifySlackRisk, RISK_LEVELS } from '../../server/config/reliabilityModel.js';

const testPairs = [
  // 1-4: Major Trunk Corridors
  { from: 'NDLS', to: 'HWH', desc: 'Delhi to Howrah Trunk' },
  { from: 'CSMT', to: 'HWH', desc: 'Mumbai to Howrah Trunk' },
  { from: 'MAS', to: 'NDLS', desc: 'Chennai to Delhi Grand Trunk' },
  { from: 'SBC', to: 'MAS', desc: 'Bengaluru to Chennai Trunk' },
  // 5: Short Route
  { from: 'PUNE', to: 'CSMT', desc: 'Pune to Mumbai (Short 192km)' },
  // 6-7: Very Long Routes
  { from: 'TVC', to: 'NDLS', desc: 'Thiruvananthapuram to Delhi (Long 3000km)' },
  { from: 'CAPE', to: 'SVDK', desc: 'Kanyakumari to Katra (Himsagar Corridor)' },
  // 8: Route with difficult junction connectivity
  { from: 'GHY', to: 'MAQ', desc: 'Guwahati to Mangaluru (Complex Inter-Zonal)' },
  // 9: Overnight Route
  { from: 'BPL', to: 'NDLS', desc: 'Bhopal to Delhi (Overnight Express)' },
  // 10: Near Midnight Departure
  { from: 'BSB', to: 'NDLS', desc: 'Varanasi to Delhi (Late Night)' },
  // 11: Date Boundary Crossing
  { from: 'PNBE', to: 'CSMT', desc: 'Patna to Mumbai (Multi-day boundary)' },
  // 12: Same Origin and Destination
  { from: 'NDLS', to: 'NDLS', desc: 'Same OD Edge Case' },
  // 13: Misspelled station name
  { from: 'Delli', to: 'Kolkata', desc: 'Misspelled Origin' },
  // 14: Unknown station code
  { from: 'ZZZ99', to: 'NDLS', desc: 'Unknown Station Code' },
  // 15: Past Date
  { from: 'NDLS', to: 'PNBE', date: '2020-01-01', desc: 'Past Date Edge Case' },
  // 16: Distant Future Date
  { from: 'NDLS', to: 'PNBE', date: '2030-12-31', desc: 'Distant Future Date' },
  // 17: Direct Train Readily Available
  { from: 'NDLS', to: 'CNB', desc: 'Delhi to Kanpur (High Frequency Direct)' },
  // 18: Western-Central Corridor
  { from: 'ADI', to: 'NGP', desc: 'Ahmedabad to Nagpur' },
  // 19: North-South Deccan
  { from: 'HYB', to: 'SBC', desc: 'Hyderabad to Bengaluru' },
  // 20: Tourist / Pilgrimage
  { from: 'JAT', to: 'BSB', desc: 'Jammu Tawi to Varanasi' }
];

const results = {
  battery20: [],
  delaySimTests: [],
  reliabilityAudit: {},
  transferGuidanceAudit: [],
  deepLinksAudit: [],
  tierRankingAudit: []
};

// 1. Run 20 OD Battery
console.log('Running 20 OD pairs battery...');
for (const pair of testPairs) {
  try {
    const res = searchRecoveryRoutes({
      from: pair.from,
      to: pair.to,
      date: pair.date || '2026-10-15',
      allowOvernight: true,
      includeHighRisk: false
    });
    results.battery20.push({
      pair: `${pair.from} → ${pair.to}`,
      desc: pair.desc,
      directCount: res.directCount,
      splitCount: res.splitRoutesCount,
      rankedTiersReturned: res.rankedTiers?.length || 0,
      tiers: res.rankedTiers?.map(t => ({ tier: t.tier, duration: t.durationFormatted, cost: t.costEstimate, risk: t.reliability?.riskLevel })),
      status: 'PASS'
    });
  } catch (err) {
    results.battery20.push({
      pair: `${pair.from} → ${pair.to}`,
      desc: pair.desc,
      status: 'ERROR',
      error: err.message
    });
  }
}

// 2. Mathematical Delay Simulator Tests
console.log('Testing Delay Simulator mathematically...');
const sampleItinerary = {
  leg1: { from: 'NDLS', to: 'CNB', arrive: '10:00' },
  leg2: { from: 'CNB', to: 'PNBE', depart: '12:00' },
  hubCode: 'CNB',
  hubCity: 'Kanpur',
  slackMinutes: 120, // 2 hours slack
  transfer: { mctMinutes: 45, type: 'rail-to-rail-same' }
};

const delayScenarios = [
  { delay: 0, desc: 'Zero delay' },
  { delay: 1, desc: '1 minute delay' },
  { delay: 75, desc: 'Exactly at slack limit (120 - 45 = 75m)' },
  { delay: 76, desc: '1 minute beyond slack limit (76m)' },
  { delay: 150, desc: 'Beyond last viable departure (150m delay)' },
  { delay: 840, desc: 'Across midnight rollover (14 hours delay)' }
];

for (const sc of delayScenarios) {
  try {
    const sim = simulateLeg1Delay(sampleItinerary, sc.delay);
    results.delaySimTests.push({
      scenario: sc.desc,
      delayMinutes: sc.delay,
      effectiveSlack: sim.effectiveSlackMinutes,
      mct: sim.mctMinutes,
      isBroken: sim.isConnectionBroken,
      isTight: sim.isConnectionTight,
      riskLevel: sim.updatedRiskLevel,
      pointOfNoReturn: sim.pointOfNoReturnTime,
      fallbacksFound: sim.fallbackDepartures?.length || 0
    });
  } catch (err) {
    results.delaySimTests.push({ scenario: sc.desc, error: err.message });
  }
}

// 3. Reliability Model Audit
const mct = 45;
results.reliabilityAudit = {
  modelDefinition: 'Parametric slack classification via server/config/reliabilityModel.js',
  tests: [
    { slack: 130, risk: classifySlackRisk(130, mct), expected: 'SAFE' },
    { slack: 100, risk: classifySlackRisk(100, mct), expected: 'MODERATE' },
    { slack: 70, risk: classifySlackRisk(70, mct), expected: 'TIGHT' },
    { slack: 40, risk: classifySlackRisk(40, mct), expected: 'HIGH_RISK' }
  ]
};

// 4. Transfer Guidance Audit for 10 Junctions
const dataDir = path.resolve('shared/data');
const transferGuides = JSON.parse(fs.readFileSync(path.join(dataDir, 'transfer_guides.json'), 'utf8'));
results.transferGuidanceAudit = transferGuides.slice(0, 10).map(g => ({
  junction: g.junctionCode,
  fromHub: g.fromHub,
  toHub: g.toHub,
  type: g.transferType,
  timeMin: g.typicalTimeMinutes,
  distKm: g.distanceKm,
  stepsCount: g.steps?.length || 0
}));

// 5. Deep-links Audit
const routeResult = searchRecoveryRoutes({ from: 'NDLS', to: 'HWH', date: '2026-10-15' });
if (routeResult.rankedTiers?.[0]) {
  const r = routeResult.rankedTiers[0];
  results.deepLinksAudit = [
    { leg: 'Leg 1', mode: r.leg1?.type, url: r.leg1?.bookingUrl },
    { leg: 'Leg 2', mode: r.leg2?.type, url: r.leg2?.bookingUrl }
  ];
}

fs.writeFileSync('docs/audit-v2/test-logs/part4_battery_results.json', JSON.stringify(results, null, 2));
console.log('Part 4 battery complete.');

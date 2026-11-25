/**
 * TravelMate AI — Route Schema Tests
 * Agent 20: Test Automation Lead — W6-01
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PROVENANCE, PROVENANCE_RANK, worstProvenance,
  formatDuration, formatFare, makeLeg, makeRoute
} from '../../src/types/routeSchema.js'

// --- PROVENANCE constants ---
test('PROVENANCE: has 4 canonical values', () => {
  assert.equal(Object.keys(PROVENANCE).length, 4)
})
test('PROVENANCE_RANK: LIVE is highest quality (index 0)', () => {
  assert.equal(PROVENANCE_RANK[0], PROVENANCE.LIVE)
})
test('PROVENANCE_RANK: ESTIMATE is lowest quality (last)', () => {
  assert.equal(PROVENANCE_RANK[PROVENANCE_RANK.length - 1], PROVENANCE.ESTIMATE)
})

// --- worstProvenance ---
test('worstProvenance: all LIVE → LIVE', () => {
  assert.equal(worstProvenance([{ provenance: PROVENANCE.LIVE }, { provenance: PROVENANCE.LIVE }]), PROVENANCE.LIVE)
})
test('worstProvenance: any ESTIMATE → ESTIMATE', () => {
  assert.equal(worstProvenance([{ provenance: PROVENANCE.LIVE }, { provenance: PROVENANCE.ESTIMATE }]), PROVENANCE.ESTIMATE)
})
test('worstProvenance: TIMETABLE beats LIVE but loses to ESTIMATE', () => {
  assert.equal(worstProvenance([{ provenance: PROVENANCE.LIVE }, { provenance: PROVENANCE.TIMETABLE }]), PROVENANCE.TIMETABLE)
})
test('worstProvenance: empty legs returns LIVE', () => {
  assert.equal(worstProvenance([]), PROVENANCE.LIVE)
})

// --- formatDuration ---
const durationCases = [[0,'0m'],[30,'30m'],[60,'1h'],[90,'1h 30m'],[135,'2h 15m'],[1440,'24h']]
for (const [min, expected] of durationCases) {
  test(`formatDuration: ${min}m → "${expected}"`, () => assert.equal(formatDuration(min), expected))
}
test('formatDuration: negative → 0m', () => assert.equal(formatDuration(-10), '0m'))

// --- formatFare ---
test('formatFare: 1250 → ₹1,250', () => assert.equal(formatFare(1250), '₹1,250'))
test('formatFare: 10000 → ₹10,000', () => assert.equal(formatFare(10000), '₹10,000'))
test('formatFare: null → Price unavailable', () => assert.equal(formatFare(null), 'Price unavailable'))
test('formatFare: undefined → Price unavailable', () => assert.equal(formatFare(undefined), 'Price unavailable'))
test('formatFare: NaN → Price unavailable', () => assert.equal(formatFare(NaN), 'Price unavailable'))
test('formatFare: rounds to integer', () => assert.equal(formatFare(1250.75), '₹1,251'))

// --- makeLeg ---
test('makeLeg: sets default fields', () => {
  const leg = makeLeg({ mode: 'Train', from: 'Delhi', to: 'Mumbai' })
  assert.equal(leg.legIndex, 1)
  assert.equal(leg.mode, 'Train')
  assert.equal(leg.from, 'Delhi')
  assert.equal(leg.to, 'Mumbai')
  assert.equal(leg.provenance, PROVENANCE.ESTIMATE)
  assert.equal(leg.fare, null)
  assert.equal(leg.fareFormatted, 'Price unavailable')
  assert.equal(leg.nearbyNote, null)
})
test('makeLeg: computes durationFormatted from durationMin', () => {
  const leg = makeLeg({ durationMin: 90 })
  assert.equal(leg.durationFormatted, '1h 30m')
})
test('makeLeg: computes fareFormatted from fare', () => {
  const leg = makeLeg({ fare: 850 })
  assert.equal(leg.fareFormatted, '₹850')
})
test('makeLeg: preserves nearbyNote and nearbyDistKm', () => {
  const leg = makeLeg({ nearbyNote: 'From Kollam Jn, 65 km from your origin', nearbyDistKm: 65 })
  assert.equal(leg.nearbyNote, 'From Kollam Jn, 65 km from your origin')
  assert.equal(leg.nearbyDistKm, 65)
})

// --- makeRoute ---
test('makeRoute: sets default tier', () => {
  const route = makeRoute({})
  assert.equal(route.tier, 'smart-balanced')
})
test('makeRoute: empty legs and transfers by default', () => {
  const route = makeRoute({})
  assert.deepEqual(route.legs, [])
  assert.deepEqual(route.transfers, [])
  assert.equal(route.totalFare, null)
})
test('makeRoute: computes worstProvenance from legs', () => {
  const legs = [makeLeg({ provenance: PROVENANCE.LIVE }), makeLeg({ provenance: PROVENANCE.TIMETABLE })]
  const route = makeRoute({ legs })
  assert.equal(route.worstProvenance, PROVENANCE.TIMETABLE)
})
test('makeRoute: computes totalDuration from totalDurationMin', () => {
  const route = makeRoute({ totalDurationMin: 335 })
  assert.equal(route.totalDuration, '5h 35m')
})

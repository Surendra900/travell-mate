/**
 * TravelMate AI — Combination Engine Tests
 * Agent 20: Test Automation Lead — W6-01
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildTransferInfo, isMCTViolation,
  assembleTwoLegRoutes, assembleThreeLegRoutes,
  rankRoutes
} from '../../src/utils/combinationEngine.js'
import { PROVENANCE } from '../../src/types/routeSchema.js'

// Fixtures
const train = (overrides = {}) => ({
  type:'train', mode:'Train', fromStationCode:'NDLS', toStationCode:'BZA',
  from:'Delhi', to:'Vijayawada', depart:'06:00', arrive:'20:00',
  duration:'14h', price:650, serviceName:'AP Express', provenance:'TIMETABLE', ...overrides
})
const bus = (overrides = {}) => ({
  type:'bus', mode:'Bus', fromStationCode:'VJA', toStationCode:'HYD',
  from:'Vijayawada', to:'Hyderabad', depart:'22:00', arrive:'03:00',
  duration:'5h', price:300, serviceName:'APSRTC Volvo', provenance:'LIVE_PROVIDER_DATA', ...overrides
})
const flight = (overrides = {}) => ({
  type:'flight', mode:'Flight', fromStationCode:'DEL', toStationCode:'BOM',
  from:'Delhi', to:'Mumbai', depart:'10:00', arrive:'12:00',
  duration:'2h', price:4200, serviceName:'IndiGo 6E-123', provenance:'LIVE_PROVIDER_DATA', ...overrides
})

// --- isMCTViolation ---
test('isMCTViolation: no violation when slack = MCT for Train→Train', () => {
  assert.equal(isMCTViolation(train({ arrive: '10:00' }), train({ depart: '11:00' })), false)
})
test('isMCTViolation: violation when slack < MCT for Train→Flight (needs 180 min)', () => {
  assert.equal(isMCTViolation(train({ arrive: '10:00' }), flight({ depart: '12:00' })), true)
})
test('isMCTViolation: no violation when times are null (cannot enforce)', () => {
  assert.equal(isMCTViolation(train({ arrive: null }), train({ depart: null })), false)
})
test('isMCTViolation: overnight crossing handled (23:30 → 01:30 = 2h > MCT 90 min)', () => {
  assert.equal(isMCTViolation(train({ arrive: '23:30' }), bus({ depart: '01:30' })), false)
})

// --- buildTransferInfo ---
test('buildTransferInfo: LOW risk for comfortable Train→Train', () => {
  const info = buildTransferInfo(train({ arrive: '10:00' }), train({ depart: '12:00' }), 'Vijayawada')
  assert.equal(info.riskLevel, 'LOW')
  assert.equal(info.mctMinutes, 60)
  assert.equal(info.location, 'Vijayawada')
})
test('buildTransferInfo: HIGH risk for tight Train→Flight', () => {
  const info = buildTransferInfo(train({ arrive: '10:00' }), flight({ depart: '12:00' }), 'Delhi Airport')
  assert.equal(info.riskLevel, 'HIGH')
})
test('buildTransferInfo: MEDIUM risk for borderline Train→Bus', () => {
  // 105 min slack - 90 MCT = 15 buffer → MEDIUM (10-29)
  const info = buildTransferInfo(train({ arrive: '10:00' }), bus({ depart: '11:45' }), 'Hub')
  assert.equal(info.riskLevel, 'MEDIUM')
})

// --- assembleTwoLegRoutes ---
test('assembleTwoLegRoutes: produces route for valid Train→Bus', () => {
  const routes = assembleTwoLegRoutes([train({ arrive:'20:00' })], [bus({ depart:'22:00' })], 'Hub')
  assert.ok(routes.length > 0)
  assert.equal(routes[0].legs.length, 2)
  assert.equal(routes[0].legs[0].mode, 'Train')
  assert.equal(routes[0].legs[1].mode, 'Bus')
})
test('assembleTwoLegRoutes: rejects MCT-violating Train→Flight', () => {
  const routes = assembleTwoLegRoutes([train({ arrive:'10:00' })], [flight({ depart:'12:00' })], 'Hub')
  assert.equal(routes.length, 0)
})
test('assembleTwoLegRoutes: allows violation when allowMCTViolations=true', () => {
  const routes = assembleTwoLegRoutes([train({ arrive:'10:00' })], [flight({ depart:'12:00' })], 'Hub', { allowMCTViolations: true })
  assert.ok(routes.length > 0)
})
test('assembleTwoLegRoutes: totalFare = sum of leg fares', () => {
  const routes = assembleTwoLegRoutes([train({ price:650, arrive:'20:00' })], [bus({ price:300, depart:'22:00' })], 'Hub')
  assert.equal(routes[0].totalFare, 950)
})
test('assembleTwoLegRoutes: totalFare null when any fare unknown', () => {
  const routes = assembleTwoLegRoutes([train({ price:null, arrive:'20:00' })], [bus({ price:300, depart:'22:00' })], 'Hub')
  assert.equal(routes[0].totalFare, null)
})
test('assembleTwoLegRoutes: worstProvenance = TIMETABLE when mixed', () => {
  const routes = assembleTwoLegRoutes(
    [train({ provenance:'TIMETABLE', arrive:'20:00' })],
    [bus({ provenance:'LIVE_PROVIDER_DATA', depart:'22:00' })],
    'Hub'
  )
  assert.equal(routes[0].worstProvenance, PROVENANCE.TIMETABLE)
})
test('assembleTwoLegRoutes: empty inputs return empty', () => {
  assert.equal(assembleTwoLegRoutes([], [], 'Hub').length, 0)
})

// --- assembleThreeLegRoutes ---
test('assembleThreeLegRoutes: assembles 3-leg when MCT satisfied at both transfers', () => {
  const t1 = train({ arrive: '12:00' })
  const b  = bus({ depart: '14:00', arrive: '16:00' })
  const t2 = train({ depart: '17:00' })
  const routes = assembleThreeLegRoutes([t1], [b], [t2], 'Hub1', 'Hub2')
  assert.ok(routes.length > 0)
  assert.equal(routes[0].legs.length, 3)
})

// --- rankRoutes ---
const cheap    = { id:'cheap',    totalFare:500,  totalDurationMin:600, legs:[], transfers:[], worstProvenance: PROVENANCE.TIMETABLE }
const fast     = { id:'fast',     totalFare:5000, totalDurationMin:90,  legs:[], transfers:[], worstProvenance: PROVENANCE.LIVE }
const balanced = { id:'balanced', totalFare:1200, totalDurationMin:300, legs:[], transfers:[], worstProvenance: PROVENANCE.LIVE }

test('rankRoutes: budget = lowest fare', () => {
  const { budget } = rankRoutes([cheap, fast, balanced])
  assert.equal(budget?.id, 'cheap')
  assert.equal(budget?.tier, 'paisa-vasool')
})
test('rankRoutes: fastest = shortest duration', () => {
  const { fastest } = rankRoutes([cheap, fast, balanced])
  assert.equal(fastest?.id, 'fast')
  assert.equal(fastest?.tier, 'emergency-express')
})
test('rankRoutes: empty list returns nulls', () => {
  const { budget, fastest, all } = rankRoutes([])
  assert.equal(budget, null)
  assert.equal(fastest, null)
  assert.equal(all.length, 0)
})

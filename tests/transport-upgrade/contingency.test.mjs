/**
 * TravelMate AI — Contingency Engine Tests
 * Agent 20: Test Automation Lead — W6-01
 * Verifies NO hardcoded fake data remains and risk scoring is correct.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateConnectionRisk,
  generateContingencyOptions
} from '../../src/utils/contingencyEngine.js'

const KNOWN_FAKE_TRAINS  = ['12430', '12427', '12559']
const KNOWN_FAKE_FLIGHTS = ['6E-2419', '6E2419']
const KNOWN_FAKE_FARES   = [4800, 1250, 890]

// --- calculateConnectionRisk ---
test('calculateConnectionRisk: SAFE with no delay and large buffer', () => {
  const r = calculateConnectionRisk(0, 120)
  assert.equal(r.riskLevel, 'SAFE')
  assert.equal(r.contingencyTriggered, false)
  assert.ok(r.missedTransferProbability < 20)
})
test('calculateConnectionRisk: MODERATE with moderate delay', () => {
  const r = calculateConnectionRisk(25, 90)
  assert.equal(r.riskLevel, 'MODERATE')
  assert.equal(r.contingencyTriggered, false)
})
test('calculateConnectionRisk: CRITICAL when delay ≥ 45 min', () => {
  const r = calculateConnectionRisk(45, 90)
  assert.equal(r.riskLevel, 'CRITICAL')
  assert.equal(r.contingencyTriggered, true)
  assert.ok(r.missedTransferProbability >= 65)
})
test('calculateConnectionRisk: CRITICAL when buffer ≤ 15 min', () => {
  const r = calculateConnectionRisk(10, 20)
  assert.equal(r.riskLevel, 'CRITICAL')
})
test('calculateConnectionRisk: probability capped 65-98 for CRITICAL', () => {
  const r = calculateConnectionRisk(90, 100)
  assert.ok(r.missedTransferProbability >= 65 && r.missedTransferProbability <= 98)
})
test('calculateConnectionRisk: layover clamped to min 15', () => {
  const r = calculateConnectionRisk(0, 5)
  assert.equal(r.layoverMinutes, 15)
})
test('calculateConnectionRisk: delay clamped to min 0', () => {
  const r = calculateConnectionRisk(-10, 60)
  assert.equal(r.delayMinutes, 0)
})
test('calculateConnectionRisk: returns all required fields', () => {
  const r = calculateConnectionRisk(30, 60)
  for (const field of ['riskLevel','delayMinutes','layoverMinutes','remainingBuffer','contingencyTriggered','missedTransferProbability','summary','badgeStyle']) {
    assert.ok(Object.hasOwn(r, field), `Missing field: ${field}`)
  }
})

// --- generateContingencyOptions: data integrity ---
test('generateContingencyOptions: returns options for known city pair', () => {
  const opts = generateContingencyOptions({ from: 'Delhi', to: 'Mumbai' }, 60)
  assert.ok(opts.length > 0)
})
test('generateContingencyOptions: returns options for unknown cities (graceful)', () => {
  const opts = generateContingencyOptions({ from: 'CityA', to: 'CityB' }, 60)
  assert.ok(opts.length > 0)
})
test('generateContingencyOptions: NO hardcoded fake train numbers', () => {
  const opts = generateContingencyOptions({ from: 'Delhi', to: 'Lucknow' }, 60)
  for (const opt of opts) {
    assert.ok(!KNOWN_FAKE_TRAINS.includes(opt.code), `Found fake train code: ${opt.code}`)
  }
})
test('generateContingencyOptions: NO hardcoded fake flight codes', () => {
  const opts = generateContingencyOptions({ from: 'Delhi', to: 'Mumbai' }, 60)
  for (const opt of opts) {
    assert.ok(!KNOWN_FAKE_FLIGHTS.includes(opt.code), `Found fake flight code: ${opt.code}`)
  }
})
test('generateContingencyOptions: NO hardcoded exact fake fares', () => {
  const opts = generateContingencyOptions({ from: 'Delhi', to: 'Mumbai' }, 60)
  for (const opt of opts) {
    if (opt.fare !== null) {
      assert.ok(!KNOWN_FAKE_FARES.includes(opt.fare), `Found fake fare: ${opt.fare}`)
    }
  }
})
test('generateContingencyOptions: fares are null or provenance is ESTIMATE', () => {
  const opts = generateContingencyOptions({ from: 'Delhi', to: 'Chennai' }, 60)
  for (const opt of opts) {
    assert.ok(opt.fare === null || opt.provenance === 'ESTIMATE',
      `opt "${opt.id}" has non-null fare ${opt.fare} but provenance=${opt.provenance}`)
  }
})
test('generateContingencyOptions: all options have required fields', () => {
  const opts = generateContingencyOptions({ from: 'Delhi', to: 'Mumbai' }, 55)
  for (const opt of opts) {
    for (const f of ['id','title','transport','reason','bookingLink']) {
      assert.ok(Object.hasOwn(opt, f), `Option "${opt.id}" missing field: ${f}`)
    }
  }
})
test('generateContingencyOptions: booking links are real URLs', () => {
  const opts = generateContingencyOptions({ from: 'Delhi', to: 'Mumbai' }, 60)
  for (const opt of opts) {
    assert.match(opt.bookingLink, /^https?:\/\//)
  }
})

/**
 * TravelMate AI — Mode Purity + Routing Config Tests
 * Agent 20: Test Automation Lead — W6-01
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { enforceModePurity, enforceItineraryModePurity, normaliseSearchType, resultMode } from '../../src/utils/modePurity.js'
import { getMCT, transferRisk, isModePure } from '../../src/config/routingConfig.js'

// --- resultMode ---
test('resultMode: Train from mode field', () => { assert.equal(resultMode({ mode: 'Train' }), 'Train') })
test('resultMode: train from type field', () => { assert.equal(resultMode({ type: 'train' }), 'Train') })
test('resultMode: Bus detected', () => { assert.equal(resultMode({ mode: 'Bus' }), 'Bus') })
test('resultMode: road = Bus', () => { assert.equal(resultMode({ transport: 'road' }), 'Bus') })
test('resultMode: Flight detected', () => { assert.equal(resultMode({ mode: 'Flight' }), 'Flight') })
test('resultMode: null for unknown', () => { assert.equal(resultMode({}), null) })
test('resultMode: null for helicopter', () => { assert.equal(resultMode({ mode: 'helicopter' }), null) })

// --- normaliseSearchType ---
const normCases = [
  ['train','train'],['trains','train'],['Train','train'],['TRAIN','train'],
  ['bus','bus'],['buses','bus'],['flight','flight'],['flights','flight'],['fly','flight'],
  ['combination','combination'],['combo','combination'],['','combination']
]
for (const [input, expected] of normCases) {
  test(`normaliseSearchType: "${input}" → "${expected}"`, () => {
    assert.equal(normaliseSearchType(input), expected)
  })
}

// --- enforceModePurity ---
const trainResult  = { mode: 'Train', serviceName: 'Rajdhani' }
const busResult    = { mode: 'Bus',   serviceName: 'RedBus' }
const flightResult = { mode: 'Flight', serviceName: 'IndiGo' }

test('enforceModePurity: train search keeps only trains', () => {
  const { pure, removed } = enforceModePurity([trainResult, busResult, flightResult], 'train')
  assert.equal(pure.length, 1)
  assert.equal(pure[0].mode, 'Train')
  assert.equal(removed, 2)
})
test('enforceModePurity: bus search keeps only buses', () => {
  const { pure, removed } = enforceModePurity([trainResult, busResult, flightResult], 'bus')
  assert.equal(pure.length, 1)
  assert.equal(removed, 2)
})
test('enforceModePurity: flight search keeps only flights', () => {
  const { pure } = enforceModePurity([trainResult, busResult, flightResult], 'flight')
  assert.equal(pure.length, 1)
  assert.equal(pure[0].mode, 'Flight')
})
test('enforceModePurity: combination keeps all', () => {
  const { pure, removed } = enforceModePurity([trainResult, busResult, flightResult], 'combination')
  assert.equal(pure.length, 3)
  assert.equal(removed, 0)
})
test('enforceModePurity: empty input returns empty', () => {
  const { pure } = enforceModePurity([], 'train')
  assert.equal(pure.length, 0)
})
test('enforceModePurity: unknown mode is not filtered (kept)', () => {
  const { pure } = enforceModePurity([{ serviceName: 'Unknown' }], 'train')
  assert.equal(pure.length, 1)
})

// --- enforceItineraryModePurity ---
test('enforceItineraryModePurity: rejects mixed itinerary for train search', () => {
  const pure = { legs: [{ mode: 'Train' }, { mode: 'Train' }] }
  const mixed = { legs: [{ mode: 'Train' }, { mode: 'Bus' }] }
  const result = enforceItineraryModePurity([pure, mixed], 'train')
  assert.equal(result.length, 1)
  assert.equal(result[0], pure)
})
test('enforceItineraryModePurity: allows mixed for combination', () => {
  const mixed = { legs: [{ mode: 'Train' }, { mode: 'Bus' }] }
  const result = enforceItineraryModePurity([mixed], 'combination')
  assert.equal(result.length, 1)
})

// --- getMCT ---
test('getMCT: Train→Train = 60', () => assert.equal(getMCT('Train', 'Train'), 60))
test('getMCT: Train→Bus = 90',   () => assert.equal(getMCT('Train', 'Bus'), 90))
test('getMCT: Train→Flight = 180', () => assert.equal(getMCT('Train', 'Flight'), 180))
test('getMCT: Bus→Flight = 150', () => assert.equal(getMCT('Bus', 'Flight'), 150))
test('getMCT: Flight→Train = 90', () => assert.equal(getMCT('Flight', 'Train'), 90))
test('getMCT: unknown pair = 90 safe default', () => assert.equal(getMCT('Helicopter', 'Boat'), 90))

// --- transferRisk ---
test('transferRisk: LOW when buffer ≥ 30 above MCT', () => {
  assert.equal(transferRisk(120, 90), 'LOW')
  assert.equal(transferRisk(200, 60), 'LOW')
})
test('transferRisk: MEDIUM when buffer 10-29 above MCT', () => {
  assert.equal(transferRisk(100, 90), 'MEDIUM')
  assert.equal(transferRisk(109, 90), 'MEDIUM')
})
test('transferRisk: HIGH when buffer < 10 above MCT', () => {
  assert.equal(transferRisk(95, 90), 'HIGH')
  assert.equal(transferRisk(89, 90), 'HIGH')
  assert.equal(transferRisk(0,  90), 'HIGH')
})

// --- isModePure ---
test('isModePure: pure train legs pass train search', () => {
  assert.equal(isModePure([{ mode: 'Train' }], 'train'), true)
})
test('isModePure: bus leg fails train search', () => {
  assert.equal(isModePure([{ mode: 'Train' }, { mode: 'Bus' }], 'train'), false)
})
test('isModePure: all modes pass combination', () => {
  assert.equal(isModePure([{ mode: 'Train' }, { mode: 'Bus' }, { mode: 'Flight' }], 'combination'), true)
})

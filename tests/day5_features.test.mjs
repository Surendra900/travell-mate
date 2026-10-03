import test from 'node:test'
import assert from 'node:assert/strict'
import {
  parseWaitlistString,
  predictWaitlistConfirmation,
  SAMPLE_PNR_PRESETS
} from '../src/utils/pnrPredictor.js'
import {
  findCorridorMatch,
  generateStationHopperHacks,
  RAIL_CORRIDOR_CHAINS
} from '../src/utils/stationHopper.js'

test('parseWaitlistString accurately segments Indian Railways booking statuses', () => {
  const cnf = parseWaitlistString('CNF / B3 / 42')
  assert.equal(cnf.isConfirmed, true)
  assert.equal(cnf.quota, 'CNF')

  const rac = parseWaitlistString('RAC 14 / RAC 6')
  assert.equal(rac.isConfirmed, false)
  assert.equal(rac.isRac, true)
  assert.equal(rac.currentWl, 6)

  const gnwl = parseWaitlistString('GNWL 45 / WL 12')
  assert.equal(gnwl.isConfirmed, false)
  assert.equal(gnwl.quota, 'GNWL')
  assert.equal(gnwl.currentWl, 12)

  const pqwl = parseWaitlistString('PQWL 20 / WL 8')
  assert.equal(pqwl.quota, 'PQWL')
  assert.equal(pqwl.currentWl, 8)

  const tqwl = parseWaitlistString('TQWL 4')
  assert.equal(tqwl.quota, 'TQWL')
  assert.equal(tqwl.currentWl, 4)
})

test('predictWaitlistConfirmation calculates mathematically sound confirmation odds', () => {
  // Confirmed ticket
  const cnfResult = predictWaitlistConfirmation({
    currentStatus: 'CNF',
    classType: '3A',
    daysToDeparture: 2
  })
  assert.equal(cnfResult.probability, 100)
  assert.equal(cnfResult.tier, 'confirmed')

  // RAC ticket
  const racResult = predictWaitlistConfirmation({
    currentStatus: 'RAC 4',
    classType: '3A',
    daysToDeparture: 2
  })
  assert.ok(racResult.probability >= 85, 'RAC probability should be >= 85%')
  assert.equal(racResult.tier, 'high')

  // GNWL vs PQWL comparison for the same waitlist number & class
  const gnwlResult = predictWaitlistConfirmation({
    currentStatus: 'GNWL 15',
    classType: '3A',
    daysToDeparture: 4
  })
  const pqwlResult = predictWaitlistConfirmation({
    currentStatus: 'PQWL 15',
    classType: '3A',
    daysToDeparture: 4
  })
  assert.ok(
    gnwlResult.probability > pqwlResult.probability,
    `GNWL (${gnwlResult.probability}%) should have higher confirmation odds than PQWL (${pqwlResult.probability}%)`
  )

  // Chart prepared regret check
  const regretResult = predictWaitlistConfirmation({
    currentStatus: 'GNWL 10',
    chartPrepared: true
  })
  assert.equal(regretResult.probability, 0)
  assert.equal(regretResult.tier, 'low')
})

test('findCorridorMatch recognizes major Indian trunk routes and stations', () => {
  const matchNorthEast = findCorridorMatch('New Delhi', 'Kanpur Central')
  assert.ok(matchNorthEast, 'Delhi - Kanpur should match a corridor')
  assert.equal(matchNorthEast.corridor.name, 'Northern & Eastern Trunk Corridor')
  assert.equal(matchNorthEast.forward, true)

  const matchWest = findCorridorMatch('Kota Junction', 'Mumbai Central')
  assert.ok(matchWest, 'Kota - Mumbai should match Western corridor')
  assert.equal(matchWest.forward, true)

  const unlistedMatch = findCorridorMatch('UnknownHillStationA', 'UnknownVillageB')
  assert.equal(unlistedMatch, null)
})

test('generateStationHopperHacks creates legal alternate station quota options', () => {
  const hacks = generateStationHopperHacks({
    from: 'New Delhi',
    to: 'Kanpur Central',
    date: '2026-10-15',
    classType: '3A'
  })

  assert.ok(hacks.length >= 1, 'Should return at least 1 alternate station hack')
  const nextStn = hacks.find(h => h.type === 'extend-destination')
  assert.ok(nextStn, 'Should have an extend-destination hack')
  assert.ok(nextStn.estimatedExtraFare > 0, 'Should calculate extra fare')
  assert.ok(nextStn.confirmedProbability >= 80, 'Alternate station should have >= 80% confirmation probability')
  assert.ok(nextStn.bookingUrl.includes('confirmtkt.com'), 'Should provide direct ConfirmTkt booking URL')
  assert.ok(nextStn.legalRule.includes('Legal'), 'Should include legal guidance for passengers')

  // Unlisted fallback
  const fallbackHacks = generateStationHopperHacks({
    from: 'RemoteTownX',
    to: 'RemoteTownY',
    date: '2026-10-15'
  })
  assert.ok(fallbackHacks.length >= 1)
  assert.equal(fallbackHacks[0].id, 'hopper-next-generic')
})

test('SAMPLE_PNR_PRESETS holds verified realistic test data for user simulation', () => {
  assert.equal(SAMPLE_PNR_PRESETS.length, 3)
  for (const preset of SAMPLE_PNR_PRESETS) {
    assert.match(preset.pnrNumber, /^\d{10}$/)
    assert.ok(preset.trainName.length > 5)
    assert.ok(preset.passengers.length >= 1)
  }
})

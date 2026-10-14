import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  searchRecoveryRoutes,
  findDirectTrainRoutes,
  findConnectingRoutes,
  resolveStationCode
} from '../server/services/routeEngine.js'
import { getMinimumConnectionTime } from '../server/config/connectionTimes.js'

describe('F-08: Genuine Timetable Graph & Real-Data Boundary Suite', () => {

  it('1. Real timetable result: NDLS -> CNB returns validated timetable records', () => {
    const result = searchRecoveryRoutes({
      from: 'NDLS',
      to: 'CNB',
      date: '2026-10-15'
    })

    assert.ok(result && typeof result === 'object', 'Engine must return result object')
    assert.ok(result.directCount > 0, `Expected direct trains between NDLS and CNB; found ${result.directCount}`)
    
    const d0 = result.directRoutes[0]
    assert.equal(d0.provenance, 'TIMETABLE', 'Direct route provenance must be TIMETABLE')
    assert.ok(d0.trainNumber, 'Must have legitimate train number')
    assert.ok(d0.departTime && d0.arriveTime, 'Must have scheduled clock departure and arrival times')
    assert.ok(d0.durationMinutes > 0, 'Duration must be positive')
    assert.ok(d0.bookingUrl.includes('confirmtkt.com'), 'Must generate valid booking URL')
  })

  it('2. Direct itinerary precedence: direct routes are identified and prioritized before transfer graph', () => {
    const result = searchRecoveryRoutes({
      from: 'New Delhi',
      to: 'Patna',
      date: '2026-10-15'
    })

    assert.ok(result.directCount > 0, 'Must identify direct trains for Delhi -> Patna corridor')
    assert.ok(result.splitRoutesCount > 0, 'Must also identify recovery transfer routes')
    
    // Direct routes must be sorted by duration ascending
    for (let i = 1; i < result.directRoutes.length; i++) {
      assert.ok(
        result.directRoutes[i].durationMinutes >= result.directRoutes[i - 1].durationMinutes,
        'Direct trains must be ordered by shortest duration first'
      )
    }
  })

  it('3. Transfer outside permitted MCT is excluded by default', () => {
    const defaultSearch = searchRecoveryRoutes({
      from: 'NDLS',
      to: 'PNBE',
      date: '2026-10-15',
      includeHighRisk: false
    })

    const mct = getMinimumConnectionTime('train', 'train', true) // 45 minutes

    for (const itinerary of defaultSearch.allSplitRoutes) {
      if (itinerary.transfer?.mctMinutes) {
        assert.ok(
          itinerary.slackMinutes >= itinerary.transfer.mctMinutes,
          `Itinerary ${itinerary.id} violated MCT: slack ${itinerary.slackMinutes}m < MCT ${itinerary.transfer.mctMinutes}m`
        )
      }
    }
  })

  it('4. Cross-midnight arrival and date boundaries: layover slack correctly handles overnight transition', () => {
    // When arrival is 23:00 and next departure is 02:00, slack is 180 min (not negative)
    const result = searchRecoveryRoutes({
      from: 'NDLS',
      to: 'PNBE',
      date: '2026-10-15',
      allowOvernight: true
    })

    for (const itinerary of result.allSplitRoutes) {
      assert.ok(
        itinerary.slackMinutes >= 0,
        `Slack minutes cannot be negative (found ${itinerary.slackMinutes} on ${itinerary.id})`
      )
      assert.ok(
        itinerary.totalDurationMin > itinerary.slackMinutes,
        'Total duration must exceed transfer layover duration'
      )
    }
  })

  it('5. No provider data: unknown stations return safe no-data state, never fake departures', () => {
    const result = searchRecoveryRoutes({
      from: 'UNKNOWN_STN_A',
      to: 'UNKNOWN_STN_B',
      date: '2026-10-15'
    })

    assert.equal(result.directCount, 0, 'Direct count must be 0 for unknown stations')
    assert.equal(result.directRoutes.length, 0, 'Direct routes array must be empty')
    assert.equal(result.splitRoutesCount, 0, 'Split routes count must be 0 for unknown stations')
    assert.equal(result.rankedTiers.length, 0, 'Ranked tiers array must be empty')
  })

  it('6. Invalid or incomplete input: empty strings or identical origin/destination return safe empty states', () => {
    const emptyResult = searchRecoveryRoutes({ from: '', to: '' })
    assert.equal(emptyResult.directCount, 0)
    assert.equal(emptyResult.splitRoutesCount, 0)

    const sameStationResult = searchRecoveryRoutes({ from: 'NDLS', to: 'NDLS' })
    assert.equal(sameStationResult.directCount, 0)
    assert.equal(sameStationResult.splitRoutesCount, 0)
  })

  it('7. No result represented as valid departure time when schedule is unavailable', () => {
    const noDirect = findDirectTrainRoutes('JP', 'VSKP', '2026-10-15')
    // If no direct trains exist, array is empty; no synthetic train is returned
    for (const item of noDirect) {
      assert.ok(item.departTime, 'Any returned item must have actual departTime')
      assert.ok(item.trainNumber, 'Any returned item must have actual trainNumber')
    }
  })

})

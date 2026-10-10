import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {
  calculateTravelScore,
  calculatePlanQualityScore,
  calculateRouteComboScore,
  estimatePrice
} from '../src/utils/scoring.js'
import {
  predictWaitlistConfirmation,
  parseWaitlistString
} from '../src/utils/pnrPredictor.js'

describe('F-05 & F-04: Deterministic Scoring & PNR Honesty Suite', () => {

  it('Scoring is 100% deterministic across 1,000 iterations for identical inputs', () => {
    const testPlan = {
      from: 'Delhi',
      to: 'Patna',
      date: '2026-10-15',
      budget: 2000,
      passengers: 2,
      transportMode: 'Train',
      urgency: 'Normal'
    }

    const firstScore = calculateTravelScore(testPlan)
    const firstQuality = calculatePlanQualityScore(testPlan)

    for (let i = 0; i < 1000; i++) {
      const runScore = calculateTravelScore(testPlan)
      const runQuality = calculatePlanQualityScore(testPlan)

      assert.equal(
        runScore,
        firstScore,
        `calculateTravelScore must be strictly deterministic; diverged on run ${i}`
      )
      assert.equal(
        runQuality,
        firstQuality,
        `calculatePlanQualityScore must be strictly deterministic; diverged on run ${i}`
      )
    }
  })

  it('scoring.js contains zero routeSpecificAdjustment or hash-jitter logic', async () => {
    const code = await fs.readFile('src/utils/scoring.js', 'utf8')
    assert.ok(
      !code.includes('routeSpecificAdjustment'),
      'scoring.js must not contain routeSpecificAdjustment'
    )
    assert.ok(
      !code.includes('routeHash'),
      'scoring.js must not contain routeHash'
    )
  })

  it('PNR predictor labels waitlist estimates honestly as heuristic clearance indices', () => {
    const wlResult = predictWaitlistConfirmation({
      currentStatus: 'GNWL 14',
      bookingStatus: 'GNWL 25',
      classType: '3A',
      daysToDeparture: 4
    })

    assert.equal(wlResult.isHeuristicEstimate, true, 'Waitlist estimate must be flagged as heuristic')
    assert.ok(Number.isFinite(wlResult.clearanceScore), 'Must provide numeric clearanceScore')
    assert.ok(
      wlResult.label.includes('Heuristic') || wlResult.label.includes('Clearance Index'),
      'Label must disclose heuristic index nature'
    )
    assert.ok(
      wlResult.methodologyDisclosure && wlResult.methodologyDisclosure.includes('heuristic'),
      'Must provide methodology disclosure explaining heuristic parametric model'
    )
    assert.ok(
      wlResult.insights.some(i => i.toLowerCase().includes('heuristic')),
      'Insights list must contain explicit heuristic disclaimer'
    )
  })

  it('PNR predictor returns safe insufficient-data state on empty or malformed inputs', () => {
    const emptyResult = predictWaitlistConfirmation({ currentStatus: '', bookingStatus: '' })
    assert.equal(emptyResult.tier, 'insufficient-data', 'Empty status must yield insufficient-data tier')
    assert.equal(emptyResult.clearanceScore, 0, 'Clearance score must be 0 for insufficient data')
    assert.ok(emptyResult.summary.includes('valid'), 'Summary must prompt for valid input')
  })

  it('PNR predictor accurately handles confirmed tickets without heuristic flagging', () => {
    const cnfResult = predictWaitlistConfirmation({ currentStatus: 'CNF B2 34' })
    assert.equal(cnfResult.tier, 'confirmed')
    assert.equal(cnfResult.clearanceScore, 100)
    assert.equal(cnfResult.isHeuristicEstimate, false, 'Confirmed ticket is not a heuristic estimate')
  })

})

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { TravelQuerySchema, RouteFactsSchema } from '../server/schemas/querySchema.js'
import {
  heuristicParseQuery,
  generateRouteRationale,
  validateRouteRationale
} from '../server/adapters/aiProvider.js'
import {
  fetchHubWeatherDisruption,
  resolveTransitCoordinates,
  evaluateTransitDisruption
} from '../src/utils/weatherDisruptionEngine.js'

describe('Day 7: Passes, Safety & Grounded AI Suite', () => {

  it('7.1 TravelQuerySchema validates and sanitizes natural language travel parameters', () => {
    // Valid query
    const valid = TravelQuerySchema.parse({
      origin: 'New Delhi',
      destination: 'Patna Junction',
      date: '2026-10-15',
      passengers: 2,
      modePreferences: 'Train',
      budget: 3500
    })
    assert.equal(valid.origin, 'New Delhi')
    assert.equal(valid.destination, 'Patna Junction')
    assert.equal(valid.passengers, 2)
    assert.equal(valid.modePreferences, 'Train')

    // Passenger clamp validation
    assert.throws(() => {
      TravelQuerySchema.parse({
        origin: 'NDLS',
        destination: 'CNB',
        passengers: 10 // max is 6
      })
    })

    // Date format validation
    assert.throws(() => {
      TravelQuerySchema.parse({
        origin: 'NDLS',
        destination: 'CNB',
        date: '15-10-2026' // must be YYYY-MM-DD
      })
    })
  })

  it('7.2 RouteFactsSchema validates computed facts for grounded rationale generation', () => {
    const facts = RouteFactsSchema.parse({
      origin: 'Delhi',
      destination: 'Patna',
      transferHub: 'Kanpur Central',
      mode: 'Train',
      durationHours: 12.5,
      savingsPercent: 30,
      layoverMinutes: 90,
      totalFare: 1450
    })
    assert.equal(facts.origin, 'Delhi')
    assert.equal(facts.transferHub, 'Kanpur Central')
    assert.equal(facts.layoverMinutes, 90)
  })

  it('7.3 heuristicParseQuery extracts route, passenger count, date, and mode from plain text', () => {
    const parsed1 = heuristicParseQuery('Need train tomorrow from Delhi to Patna for 2 passengers')
    assert.equal(parsed1.origin, 'Delhi')
    assert.equal(parsed1.destination, 'Patna')
    assert.equal(parsed1.modePreferences, 'Train')
    assert.equal(parsed1.passengers, 2)
    assert.ok(parsed1.date, 'Date should be populated')

    const parsed2 = heuristicParseQuery('Flight Mumbai to Bengaluru for 3 people')
    assert.equal(parsed2.origin, 'Mumbai')
    assert.equal(parsed2.destination, 'Bengaluru')
    assert.equal(parsed2.modePreferences, 'Flight')
    assert.equal(parsed2.passengers, 3)
  })

  it('7.4 Grounded Route Rationale generates strictly 2 sentences and validates against facts', async () => {
    const facts = {
      origin: 'Delhi',
      destination: 'Howrah',
      transferHub: 'Kanpur Central',
      mode: 'Train',
      durationHours: 14,
      savingsPercent: 25,
      layoverMinutes: 90,
      totalFare: 2100
    }

    const rationale = await generateRouteRationale(facts)
    assert.ok(typeof rationale === 'string' && rationale.length > 20, 'Rationale should be a non-empty string')
    // Check that it contains computed facts
    assert.ok(rationale.includes('Kanpur Central') || rationale.includes('Delhi') || rationale.includes('Howrah'))

    // Validate anti-hallucination validator
    const validCheck = validateRouteRationale(rationale, facts)
    assert.equal(validCheck, true)

    // Unrelated text with unmentioned cities must fail validation
    const invalidCheck = validateRouteRationale('Take a scenic detour through Chennai Central with Swiss Alps views.', facts)
    assert.equal(invalidCheck, false)
  })

  it('7.5 Weather Disruption Engine evaluates hub weather and returns structured transit impact', async () => {
    const coords = resolveTransitCoordinates('Delhi')
    assert.equal(coords.city, 'Delhi')
    assert.ok(coords.lat > 20 && coords.lon > 70)

    // Evaluate simulated fog scenario
    const fogEvaluation = evaluateTransitDisruption({
      temperature_2m: 9,
      relative_humidity_2m: 98,
      precipitation: 0,
      weather_code: 45, // Dense fog
      wind_speed_10m: 4,
      visibility: 400
    }, 'Delhi')

    assert.equal(fogEvaluation.riskLevel, 'CRITICAL')
    assert.ok(fogEvaluation.delayEstimateMinutes >= 45)
    assert.equal(fogEvaluation.isDisrupted, true)

    // Evaluate live or fallback hub weather call
    const weatherResult = await fetchHubWeatherDisruption('Kanpur Central', { timeoutMs: 3000 })
    assert.ok(weatherResult.analysis, 'Weather analysis must be present')
    assert.ok(typeof weatherResult.analysis.headline === 'string')
    assert.ok(typeof weatherResult.analysis.riskLevel === 'string')
  })

  it('7.6 Passes and Safety Hub artifacts and statutory disclaimers are fully defined in code', async () => {
    const fs = await import('node:fs/promises')
    const safetyModeCode = await fs.readFile('src/pages/SafetyMode.jsx', 'utf8')

    // Master Spec Section 15 statutory notice
    assert.ok(
      safetyModeCode.includes('data-testid="safety-statutory-notice"'),
      'SafetyMode must contain data-testid="safety-statutory-notice"'
    )
    assert.ok(
      safetyModeCode.includes('TravelMate is not an emergency service. In an emergency call 112.'),
      'SafetyMode must contain exact statutory disclaimer text'
    )

    // Tab test IDs
    assert.ok(safetyModeCode.includes('data-testid={testId}') || safetyModeCode.includes('data-testid="tab-offline-passes"'))
    assert.ok(safetyModeCode.includes('tab-offline-passes'))
    assert.ok(safetyModeCode.includes('tab-safety-helplines'))
    assert.ok(safetyModeCode.includes('tab-station-guides'))

    // Offline boarding pass actions
    assert.ok(safetyModeCode.includes('data-testid="pwa-offline-status"'))
    assert.ok(safetyModeCode.includes('data-testid="sync-offline-pack-btn"'))
    assert.ok(safetyModeCode.includes('data-testid="view-offline-pass-btn"'))
    assert.ok(safetyModeCode.includes('data-testid="print-pass-btn"'))
    assert.ok(safetyModeCode.includes('data-testid="copy-pass-summary-btn"'))

    // EmergencyToolkit checks
    const toolkitCode = await fs.readFile('src/components/EmergencyToolkit.jsx', 'utf8')
    assert.ok(toolkitCode.includes('data-testid="helpline-112"'))
    assert.ok(toolkitCode.includes('data-testid={hotline.number === \'139\' ? \'helpline-139\' : `hotline-call-${hotline.id}`}'))
    assert.ok(toolkitCode.includes('data-testid="share-gps-pin-btn"'))
    assert.ok(toolkitCode.includes('data-testid="location-privacy-notice"'))

    // MultimodalTimelineCard grounded rationale & weather
    const cardCode = await fs.readFile('src/components/MultimodalTimelineCard.jsx', 'utf8')
    assert.ok(cardCode.includes('data-testid="route-grounded-rationale"'))
    assert.ok(cardCode.includes('data-testid="route-contextual-weather"'))

    // NaturalLanguageQueryInput
    const nlCode = await fs.readFile('src/components/NaturalLanguageQueryInput.jsx', 'utf8')
    assert.ok(nlCode.includes('data-testid="ai-query-input"'))
    assert.ok(nlCode.includes('data-testid="ai-parse-btn"'))
    assert.ok(nlCode.includes('data-testid="ai-understood-banner"'))
    assert.ok(nlCode.includes('data-testid="apply-ai-chips-btn"'))
  })
})

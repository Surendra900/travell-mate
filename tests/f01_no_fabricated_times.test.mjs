import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { generateMultimodalRoutes, formatWhatsAppShareText } from '../src/utils/multimodalRouter.js'

describe('F-01 / F-08 Priority 1: No Fabricated Departure/Arrival Times Gate', () => {

  const FORBIDDEN_LITERALS = [
    '07:30', '11:15', '13:00', '20:30', '14:30',
    '18:15', '20:15', '06:30', '06:00', '09:45',
    '13:15', '15:30'
  ]

  it('generateMultimodalRoutes does not output hardcoded clock times for estimated routes', () => {
    const routes = generateMultimodalRoutes({
      from: 'Delhi',
      to: 'Patna',
      date: '2026-10-15',
      passengers: 1
    })

    assert.ok(routes.length >= 1, 'Must return routes')

    for (const route of routes) {
      for (const leg of [route.leg1, route.leg2]) {
        assert.equal(
          leg.depart,
          null,
          `Leg depart time must be null for frequency estimates; found ${leg.depart}`
        )
        assert.equal(
          leg.arrive,
          null,
          `Leg arrive time must be null for frequency estimates; found ${leg.arrive}`
        )
        assert.equal(
          leg.provenance,
          'ESTIMATE',
          `Leg provenance must be ESTIMATE; found ${leg.provenance}`
        )
        assert.ok(
          typeof leg.departureEstimate === 'string' && leg.departureEstimate.length > 5,
          'Leg must provide descriptive departure estimate'
        )
        assert.ok(
          typeof leg.scheduleNote === 'string' && leg.scheduleNote.includes('estimate'),
          'Leg must include explicit schedule estimate disclaimer'
        )
      }
    }
  })

  it('No forbidden fabricated clock time literals exist in generated route objects', () => {
    const testPairs = [
      ['Delhi', 'Mumbai'],
      ['Delhi', 'Patna'],
      ['Hyderabad', 'Bengaluru'],
      ['Chennai', 'Kolkata']
    ]

    for (const [from, to] of testPairs) {
      const routes = generateMultimodalRoutes({ from, to, date: '2026-10-15' })
      for (const route of routes) {
        for (const leg of [route.leg1, route.leg2]) {
          for (const forbidden of FORBIDDEN_LITERALS) {
            assert.notEqual(
              leg.depart,
              forbidden,
              `Forbidden clock literal ${forbidden} found in leg.depart`
            )
            assert.notEqual(
              leg.arrive,
              forbidden,
              `Forbidden clock literal ${forbidden} found in leg.arrive`
            )
          }
        }
      }
    }
  })

  it('formatWhatsAppShareText outputs frequency estimate and provenance, not fake clock times', () => {
    const routes = generateMultimodalRoutes({
      from: 'Delhi',
      to: 'Patna',
      date: '2026-10-15'
    })
    const text = formatWhatsAppShareText(routes[0])

    for (const forbidden of FORBIDDEN_LITERALS) {
      assert.ok(
        !text.includes(`Depart ${forbidden}`),
        `Share text must not include fabricated "Depart ${forbidden}"`
      )
    }
    assert.ok(
      text.includes('Schedule:'),
      'Share text must format schedule note honestly'
    )
    assert.ok(
      text.includes('(est.)'),
      'Share text must include (est.) indicator for estimated fares'
    )
  })

  it('LiveResultsPanel does not use hardcoded 10:30 AM or 06:45 PM fallbacks', async () => {
    const code = await fs.readFile('src/components/LiveResultsPanel.jsx', 'utf8')
    assert.ok(
      !code.includes("'10:30 AM'"),
      'LiveResultsPanel must not fall back to 10:30 AM'
    )
    assert.ok(
      !code.includes("'06:45 PM'"),
      'LiveResultsPanel must not fall back to 06:45 PM'
    )
    assert.ok(
      !code.includes("'8h 15m'"),
      'LiveResultsPanel must not fall back to 8h 15m'
    )
  })

  it('DelayContingencySimulator does not fabricate 22436 / 12304 default itinerary', async () => {
    const code = await fs.readFile('src/components/DelayContingencySimulator.jsx', 'utf8')
    assert.ok(
      !code.includes("'Vande Bharat Express (22436)'"),
      'DelayContingencySimulator must not invent default Vande Bharat 22436 itinerary'
    )
    assert.ok(
      !code.includes("'Poorva Express (12304)'"),
      'DelayContingencySimulator must not invent default Poorva Express 12304 itinerary'
    )
  })

})

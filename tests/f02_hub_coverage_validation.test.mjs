import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { transitHubDirectory, getTransitHubGuide } from '../src/data/transitHubData.js'
import { RecoveryQuerySchema, DelaySimulationSchema, PnrQuerySchema, validateSchema } from '../shared/schemas.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('F-02: transitHubDirectory covers all 25 corridor junctions from junctions.json', () => {
  const junctions = JSON.parse(fs.readFileSync(path.join(root, 'shared/data/junctions.json'), 'utf8'))
  assert.equal(junctions.length, 25, 'junctions.json must have 25 corridor hubs')

  const hubEntries = Object.values(transitHubDirectory)
  assert.ok(hubEntries.length >= 25, `transitHubDirectory must have at least 25 hubs, got ${hubEntries.length}`)

  for (const junc of junctions) {
    const matched = hubEntries.find(h =>
      h.stationCode.toUpperCase() === junc.stationCode.toUpperCase() ||
      h.city.toLowerCase() === junc.cityName.toLowerCase()
    )

    assert.ok(matched, `Junction ${junc.stationCode} (${junc.cityName}) must be present in transitHubDirectory`)
    assert.ok(matched.platforms > 0, `${junc.stationCode} must specify platforms`)
    assert.ok(matched.safetyScore >= 80, `${junc.stationCode} must have valid safety score`)
    assert.ok(Array.isArray(matched.amenities) && matched.amenities.length > 0, `${junc.stationCode} must specify amenities`)
    assert.ok(matched.trainTransferTip.length > 15, `${junc.stationCode} must have actionable train transfer tip`)
    assert.ok(matched.busTerminalDistanceKm >= 0, `${junc.stationCode} must specify bus distance`)
    assert.ok(matched.airportDistanceKm >= 0, `${junc.stationCode} must specify airport distance`)
  }
})

test('F-02: getTransitHubGuide accurately resolves by station code and city name', () => {
  // Query by code
  const ndlsGuide = getTransitHubGuide({ hubCity: 'NDLS', leg1Mode: 'Train', leg2Mode: 'Train' })
  assert.equal(ndlsGuide.stationCode, 'NDLS')
  assert.equal(ndlsGuide.city, 'Delhi')
  assert.equal(ndlsGuide.platforms, 16)

  // Query by city
  const kanpurGuide = getTransitHubGuide({ hubCity: 'Kanpur', leg1Mode: 'Train', leg2Mode: 'Bus' })
  assert.equal(kanpurGuide.stationCode, 'CNB')
  assert.equal(kanpurGuide.transferType, 'Station to Inter-State Bus Stand')

  // Query by southern hub
  const chennaiGuide = getTransitHubGuide({ hubCity: 'MAS', leg1Mode: 'Train', leg2Mode: 'Flight' })
  assert.equal(chennaiGuide.stationCode, 'MAS')
  assert.equal(chennaiGuide.city, 'Chennai')
  assert.equal(chennaiGuide.transferType, 'Railway Station to Airport Departure Terminal')
})

test('F-15: Zod schemas validate API inputs and reject malformed payloads', () => {
  // 1. Valid recovery query
  const validQuery = validateSchema(RecoveryQuerySchema, { from: 'NDLS', to: 'CNB', date: '2026-10-15' })
  assert.equal(validQuery.success, true)
  assert.equal(validQuery.data.from, 'NDLS')

  // 2. Invalid recovery query (missing destination)
  const invalidQuery = validateSchema(RecoveryQuerySchema, { from: 'NDLS' })
  assert.equal(invalidQuery.success, false)
  assert.ok(invalidQuery.errors.includes('to'))

  // 3. Valid PNR
  const validPnr = validateSchema(PnrQuerySchema, { pnr: '2849102847' })
  assert.equal(validPnr.success, true)

  // 4. Invalid PNR (letters or too short)
  const invalidPnr = validateSchema(PnrQuerySchema, { pnr: '28491ABC' })
  assert.equal(invalidPnr.success, false)

  // 5. Valid delay simulation
  const validDelay = validateSchema(DelaySimulationSchema, {
    itinerary: { leg1: { arrive: '10:30', mode: 'Train' } },
    delayMinutes: 45
  })
  assert.equal(validDelay.success, true)
  assert.equal(validDelay.data.delayMinutes, 45)
})

test('F-06: tsconfig.json exists and is valid compiler configuration', () => {
  const tsconfigPath = path.join(root, 'tsconfig.json')
  assert.ok(fs.existsSync(tsconfigPath), 'tsconfig.json must exist in project root')
  const content = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))
  assert.ok(content.compilerOptions, 'tsconfig.json must declare compilerOptions')
  assert.equal(content.compilerOptions.jsx, 'react-jsx', 'Must configure react-jsx')
})

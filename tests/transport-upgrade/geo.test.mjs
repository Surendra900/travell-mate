/**
 * TravelMate AI — Geo Utils Tests
 * Agent 20: Test Automation Lead — W6-01
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  haversineKm, findNearestStations, findNearestAirports,
  cityToIATA, cityToStationCode, nearbyLabel
} from '../../src/utils/geoUtils.js'

// Fixtures
const STATIONS = [
  { code:'NDLS', city:'Delhi',      lat:28.6448, lng:77.2167 },
  { code:'GZB',  city:'Ghaziabad',  lat:28.6692, lng:77.4538 },
  { code:'CNB',  city:'Kanpur',     lat:26.4499, lng:80.3319 },
  { code:'SBC',  city:'Bengaluru',  lat:12.9779, lng:77.5713 },
  { code:'MAS',  city:'Chennai',    lat:13.0836, lng:80.2746 },
]
const AIRPORTS = [
  { iata:'DEL', city:'Delhi',     lat:28.5562, lng:77.1000 },
  { iata:'BOM', city:'Mumbai',    lat:19.0896, lng:72.8656 },
  { iata:'BLR', city:'Bengaluru', lat:13.1986, lng:77.7066, aliases:['Bangalore'] },
  { iata:'MAA', city:'Chennai',   lat:12.9941, lng:80.1709 },
]

// --- haversineKm ---
test('haversineKm: 0 for identical points', () => assert.equal(haversineKm({ lat:28.6, lng:77.2 }, { lat:28.6, lng:77.2 }), 0))
test('haversineKm: Delhi→Gurgaon ≈ 25-40 km', () => {
  const km = haversineKm({ lat:28.6448, lng:77.2167 }, { lat:28.4595, lng:77.0266 })
  assert.ok(km > 25 && km < 40, `Expected 25-40 km, got ${km}`)
})
test('haversineKm: Delhi→Mumbai ≈ 1100-1200 km', () => {
  const km = haversineKm({ lat:28.6448, lng:77.2167 }, { lat:19.0760, lng:72.8777 })
  assert.ok(km > 1100 && km < 1200, `Expected 1100-1200 km, got ${km}`)
})
test('haversineKm: null for missing coords', () => {
  assert.equal(haversineKm(null, { lat:28.6, lng:77.2 }), null)
})
test('haversineKm: null when both coords are (0,0)', () => {
  assert.equal(haversineKm({ lat:0, lng:0 }, { lat:28.6, lng:77.2 }), null)
})
test('haversineKm: accepts latitude/longitude field names', () => {
  const km = haversineKm({ latitude:28.6448, longitude:77.2167 }, { latitude:28.4595, longitude:77.0266 })
  assert.ok(km > 0)
})

// --- findNearestStations ---
test('findNearestStations: finds GZB within 50 km of Delhi', () => {
  const results = findNearestStations('Delhi', 50, STATIONS)
  assert.ok(results.some(r => r.station.code === 'GZB'))
  assert.ok(!results.some(r => r.station.code === 'CNB'))
})
test('findNearestStations: sorted by distance ascending', () => {
  const results = findNearestStations('Delhi', 200, STATIONS)
  for (let i = 1; i < results.length; i++) {
    assert.ok(results[i].distKm >= results[i-1].distKm)
  }
})
test('findNearestStations: empty for unknown city', () => {
  assert.equal(findNearestStations('MoonCity', 100, STATIONS).length, 0)
})
test('findNearestStations: excludes origin itself (distKm > 0)', () => {
  const results = findNearestStations('Delhi', 10, STATIONS)
  assert.ok(results.every(r => r.distKm > 0))
})
test('findNearestStations: caps at 4 results', () => {
  const many = Array.from({ length: 20 }, (_, i) => ({ code:`S${i}`, city:`City${i}`, lat:28.6+i*0.01, lng:77.2+i*0.01 }))
  const results = findNearestStations({ lat:28.6448, lng:77.2167 }, 500, many)
  assert.ok(results.length <= 4)
})

// --- cityToIATA ---
test('cityToIATA: Delhi → DEL', () => assert.equal(cityToIATA('Delhi', AIRPORTS), 'DEL'))
test('cityToIATA: Mumbai → BOM', () => assert.equal(cityToIATA('Mumbai', AIRPORTS), 'BOM'))
test('cityToIATA: alias Bangalore → BLR', () => assert.equal(cityToIATA('Bangalore', AIRPORTS), 'BLR'))
test('cityToIATA: empty string for unknown city', () => assert.equal(cityToIATA('Atlantis', AIRPORTS), ''))
test('cityToIATA: case-insensitive', () => {
  assert.equal(cityToIATA('delhi', AIRPORTS), 'DEL')
  assert.equal(cityToIATA('MUMBAI', AIRPORTS), 'BOM')
})

// --- findNearestAirports ---
test('findNearestAirports: finds DEL near Delhi within 50 km', () => {
  const results = findNearestAirports('Delhi', 50, AIRPORTS)
  assert.ok(results.some(r => r.airport.iata === 'DEL'))
})
test('findNearestAirports: empty for unknown city', () => {
  assert.equal(findNearestAirports('MoonCity', 150, AIRPORTS).length, 0)
})

// --- nearbyLabel ---
test('nearbyLabel: origin side', () => {
  assert.equal(nearbyLabel('Kollam Jn', 65, 'origin'), 'From Kollam Jn, 65 km from your origin')
})
test('nearbyLabel: destination side', () => {
  assert.equal(nearbyLabel('Mysuru Jn', 42, 'destination'), 'To Mysuru Jn, 42 km from your destination')
})
test('nearbyLabel: rounds distance', () => {
  assert.equal(nearbyLabel('Station', 65.7, 'origin'), 'From Station, 66 km from your origin')
})

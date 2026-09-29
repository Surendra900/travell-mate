import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getTransitHubGuide,
  transitHubDirectory
} from '../src/data/transitHubData.js'

test('transitHubDirectory includes key Indian junctions with platform and safety data', () => {
  const hubs = ['Jaipur', 'Vijayawada', 'Nagpur', 'Pune', 'Bhopal', 'Kanpur', 'Hyderabad']
  for (const hubName of hubs) {
    const hub = transitHubDirectory[hubName]
    assert.ok(hub, `Must include data for ${hubName}`)
    assert.ok(hub.stationName, `Must specify station name for ${hubName}`)
    assert.ok(hub.stationCode, `Must specify station code for ${hubName}`)
    assert.ok(hub.platforms > 0, `Must specify platforms for ${hubName}`)
    assert.ok(hub.safetyScore >= 90, `Safety score must be high for ${hubName}`)
    assert.ok(Array.isArray(hub.amenities) && hub.amenities.length > 0, `Must have amenities for ${hubName}`)
  }
})

test('getTransitHubGuide tailors advice for same-station train transfer', () => {
  const guide = getTransitHubGuide({
    hubCity: 'Jaipur',
    leg1Mode: 'Train',
    leg2Mode: 'Train',
    bufferMinutes: 105
  })

  assert.equal(guide.city, 'Jaipur')
  assert.equal(guide.transferType, 'Same-Station Platform Transfer')
  assert.ok(guide.isBufferAdequate, '105 minutes must be adequate for 30m platform transfer')
  assert.ok(guide.transferInstructions.includes('Platform'), 'Must include platform guidance')
  assert.ok(guide.amenities.includes('Cloakroom / Left Luggage'), 'Must include station amenities')
})

test('getTransitHubGuide calculates auto/taxi transfers for inter-modal journeys', () => {
  // Train to Bus
  const busGuide = getTransitHubGuide({
    hubCity: 'Jaipur',
    leg1Mode: 'Train',
    leg2Mode: 'Bus',
    bufferMinutes: 120
  })

  assert.equal(busGuide.transferType, 'Station to Inter-State Bus Stand')
  assert.ok(busGuide.transferInstructions.includes('Sindhi Camp'), 'Must mention Sindhi Camp bus stand')
  assert.ok(busGuide.busAutoFare, 'Must provide auto fare estimate')
  assert.ok(busGuide.isBufferAdequate, '2 hours is adequate for bus transfer')

  // Train to Flight
  const flightGuide = getTransitHubGuide({
    hubCity: 'Vijayawada',
    leg1Mode: 'Train',
    leg2Mode: 'Flight',
    bufferMinutes: 210
  })

  assert.equal(flightGuide.transferType, 'Railway Station to Airport Departure Terminal')
  assert.ok(flightGuide.transferInstructions.includes('Airport'), 'Must mention airport transfer')
  assert.ok(flightGuide.airportTaxiFare, 'Must provide airport taxi fare estimate')
  assert.ok(flightGuide.isBufferAdequate, '3.5h is adequate for airport transfer and security check')
})

test('getTransitHubGuide gracefully generates guidance for unlisted Indian cities', () => {
  const guide = getTransitHubGuide({
    hubCity: 'Guntur',
    leg1Mode: 'Train',
    leg2Mode: 'Train',
    bufferMinutes: 90
  })

  assert.equal(guide.city, 'Guntur')
  assert.ok(guide.stationName.includes('Guntur Junction'))
  assert.ok(guide.isBufferAdequate)
  assert.ok(guide.transferInstructions)
})

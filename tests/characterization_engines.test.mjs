import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { generateMultimodalRoutes, findTransitHubs } from '../src/utils/multimodalRouter.js'
import { calculateConnectionRisk, generateContingencyOptions } from '../src/utils/contingencyEngine.js'
import { getProviderDeepLink, transportPlaces, routeCombos } from '../src/data/transportData.js'

test('Characterization: multimodalRouter candidate transit hubs', () => {
  const hubs = findTransitHubs('New Delhi', 'Patna')
  assert.ok(Array.isArray(hubs), 'findTransitHubs must return an array')
  assert.ok(hubs.length > 0, 'Must find candidate hubs for Delhi to Patna corridor')
  const hubCities = hubs.map(h => h.city)
  assert.ok(hubCities.includes('Kanpur') || hubCities.includes('Jaipur') || hubCities.includes('Lucknow') || hubCities.includes('Varanasi'),
    'Candidate hubs should include major rail crossroads')
})

test('Characterization: multimodalRouter 3-tier route generation contract', () => {
  const routes = generateMultimodalRoutes({
    from: 'New Delhi',
    to: 'Mumbai',
    date: '2026-10-15',
    passengers: 1
  })

  assert.ok(Array.isArray(routes), 'generateMultimodalRoutes must return an array')
  assert.equal(routes.length, 3, 'Must return exactly 3 ranked tiers')

  const tiers = routes.map(r => r.tier)
  assert.deepEqual(tiers, ['paisa-vasool', 'smart-balanced', 'emergency-express'],
    'Tiers must be paisa-vasool, smart-balanced, and emergency-express')

  for (const route of routes) {
    assert.ok(route.totalFare > 0, 'Total fare must be positive')
    assert.ok(route.totalDurationMin > 0, 'Total duration must be positive')
    assert.ok(route.hubCity, 'Must define an intermediate hub city')
    assert.ok(route.transferBuffer, 'Must define transfer buffer text')
    assert.ok(route.whyPicked, 'Must explain why route was picked')
    assert.ok(route.leg1 && route.leg2, 'Must contain leg1 and leg2')
    for (const leg of [route.leg1, route.leg2]) {
      if (leg.provenance === 'TIMETABLE' || leg.provenance === 'LIVE') {
        assert.ok(leg.depart && leg.arrive, 'Timetable legs must have verified clock times')
      } else {
        assert.ok(leg.departureEstimate && leg.scheduleNote, 'Estimated legs must have schedule estimate and disclaimer')
      }
    }
    assert.ok(route.leg1.bookingLink && route.leg2.bookingLink, 'Legs must have deep links')
  }
})

test('Characterization: contingencyEngine connection risk math', () => {
  // Safe delay (<20 min on 60 min layover)
  const safe = calculateConnectionRisk(15, 60)
  assert.equal(safe.delayMinutes, 15)
  assert.equal(safe.layoverMinutes, 60)
  assert.equal(safe.remainingBuffer, 45)
  assert.equal(safe.riskLevel, 'SAFE')
  assert.equal(safe.contingencyTriggered, false)

  // Critical delay (>=45 min on 60 min layover)
  const critical = calculateConnectionRisk(55, 60)
  assert.equal(critical.delayMinutes, 55)
  assert.equal(critical.remainingBuffer, 5)
  assert.equal(critical.riskLevel, 'CRITICAL')
  assert.equal(critical.contingencyTriggered, true)
  assert.ok(critical.missedTransferProbability >= 65, 'Critical risk probability must be >= 65%')
})

test('Characterization: contingencyEngine alternative generation', () => {
  const plan = {
    from: 'New Delhi',
    to: 'Mumbai',
    date: '2026-10-15',
    transportMode: 'Train',
    routeCombo: 'Train + Bus'
  }
  const contingencies = generateContingencyOptions(plan, 55)
  assert.ok(Array.isArray(contingencies), 'Must generate contingency options')
  assert.ok(contingencies.length >= 2, 'Must provide at least 2 alternative fallback options')
  const bus = contingencies.find(c => c.id === 'contingency-intercity-road')
  assert.ok(bus, 'Must include intercity road fallback')
  assert.equal(bus.provider, 'RedBus')
})

test('Characterization: transportData official deep link generation', () => {
  // Train search deep link (ConfirmTkt)
  const trainUrl = getProviderDeepLink({
    transport: 'Train',
    from: 'New Delhi',
    to: 'Patna',
    date: '2026-10-15'
  })
  assert.ok(trainUrl.startsWith('https://www.confirmtkt.com/trains/'), 'Train URL must target ConfirmTkt trains search')
  assert.ok(trainUrl.includes('NDLS') || trainUrl.includes('New%20Delhi') || trainUrl.includes('PNBE'), 'Must include station or city codes')

  // Train status deep link
  const trainStatusUrl = getProviderDeepLink({
    transport: 'Train',
    from: 'New Delhi',
    to: 'Patna',
    date: '2026-10-15',
    serviceCode: '12394'
  })
  assert.equal(trainStatusUrl, 'https://www.confirmtkt.com/train-running-status/12394')

  // Bus deep link (RedBus)
  const busUrl = getProviderDeepLink({
    transport: 'Bus',
    from: 'New Delhi',
    to: 'Jaipur',
    date: '2026-10-15'
  })
  assert.ok(busUrl.startsWith('https://www.redbus.in/bus-tickets/'), 'Bus URL must target RedBus')

  // Flight deep link (Google Flights)
  const flightUrl = getProviderDeepLink({
    transport: 'Flight',
    from: 'Delhi',
    to: 'Mumbai',
    date: '2026-10-15'
  })
  assert.ok(flightUrl.startsWith('https://www.google.com/travel/flights'), 'Flight URL must target Google Flights')
})

test('Characterization: Tatkal Desk dual-window IST rules & clipboard auto-fill', () => {
  const tatkalFilePath = path.resolve('src/planner/EmergencyTatkalPlanner.jsx')
  const timerFilePath = path.resolve('src/components/TatkalEmergencyTimer.jsx')
  assert.ok(fs.existsSync(tatkalFilePath), 'EmergencyTatkalPlanner must exist')
  assert.ok(fs.existsSync(timerFilePath), 'TatkalEmergencyTimer must exist')

  const timerCode = fs.readFileSync(timerFilePath, 'utf8')
  assert.ok(timerCode.includes('10:00') && timerCode.includes('11:00'), 'Must define 10:00 AM (AC) and 11:00 AM (Non-AC) Tatkal windows')
  assert.ok(timerCode.includes('UTC+5:30') || timerCode.includes('Asia/Kolkata') || timerCode.includes('IST'), 'Must synchronize to Indian Standard Time')

  const plannerCode = fs.readFileSync(tatkalFilePath, 'utf8')
  assert.ok(plannerCode.includes('Tatkal Auto-Fill Master Data') || plannerCode.includes('auto-fill'), 'Must contain master data auto-fill feature')
  assert.ok(plannerCode.includes('navigator.clipboard.writeText') || plannerCode.includes('copyPassengers'), 'Must support 1-click clipboard copy')
})

test('Characterization: RouteMap Leaflet visualizer integration', () => {
  const routeMapPath = path.resolve('src/components/RouteMap.jsx')
  assert.ok(fs.existsSync(routeMapPath), 'RouteMap component must exist')
  const mapCode = fs.readFileSync(routeMapPath, 'utf8')
  assert.ok(mapCode.includes('leaflet') || mapCode.includes('L.map'), 'Must integrate Leaflet mapping')
  assert.ok(mapCode.includes('fitBounds') || mapCode.includes('setView'), 'Must handle dynamic viewport bounds')
})

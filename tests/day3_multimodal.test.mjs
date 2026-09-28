import test from 'node:test'
import assert from 'node:assert/strict'
import {
  generateMultimodalRoutes,
  formatWhatsAppShareText,
  getWhatsAppShareUrl
} from '../src/utils/multimodalRouter.js'

test('multimodal router generates 3 ranked tiers with totalDurationMin', () => {
  const routes = generateMultimodalRoutes({
    from: 'Delhi',
    to: 'Mumbai',
    date: '2026-09-28',
    passengers: 1
  })

  assert.equal(routes.length, 3, 'Should generate 3 ranked multimodal routes')
  const tiers = routes.map(r => r.tier)
  assert.ok(tiers.includes('paisa-vasool'), 'Must include paisa-vasool')
  assert.ok(tiers.includes('smart-balanced'), 'Must include smart-balanced')
  assert.ok(tiers.includes('emergency-express'), 'Must include emergency-express')

  for (const r of routes) {
    assert.ok(Number.isFinite(r.totalDurationMin) && r.totalDurationMin > 0, 'Must have numeric totalDurationMin')
    assert.ok(Number.isFinite(r.totalFare) && r.totalFare > 0, 'Must have numeric totalFare')
    assert.ok(r.hubCity, 'Must specify intermediate hub city')
    assert.ok(r.leg1?.bookingLink, 'Leg 1 must have booking link')
    assert.ok(r.leg2?.bookingLink, 'Leg 2 must have booking link')
  }
})

test('formatWhatsAppShareText produces rich, readable itinerary for travelers', () => {
  const routes = generateMultimodalRoutes({
    from: 'Delhi',
    to: 'Mumbai',
    date: '2026-09-28',
    passengers: 1
  })

  const pvRoute = routes.find(r => r.tier === 'paisa-vasool')
  assert.ok(pvRoute)

  const text = formatWhatsAppShareText(pvRoute)
  assert.ok(text.includes('Delhi ➔ Mumbai'), 'Should include origin and destination')
  assert.ok(text.includes('Paisa Vasool'), 'Should include tier label')
  assert.ok(text.includes(pvRoute.fareFormatted), 'Should include total fare')
  assert.ok(text.includes('Transfer at'), 'Should describe transfer hub')
  assert.ok(text.includes('Why this route:'), 'Should include AI reasoning')
  assert.ok(text.includes('travelmate-ai-flowzint.vercel.app'), 'Should include app URL for viral sharing')
})

test('getWhatsAppShareUrl returns valid api.whatsapp.com URL with encoded text', () => {
  const routes = generateMultimodalRoutes({
    from: 'Delhi',
    to: 'Mumbai',
    date: '2026-09-28',
    passengers: 1
  })

  const url = getWhatsAppShareUrl(routes[0])
  assert.ok(url.startsWith('https://api.whatsapp.com/send?text='), 'Must be WhatsApp send URL')
  assert.ok(url.includes('Delhi'), 'Must include encoded route info')
})

test('multimodal route filtering criteria correctly segment tiers', () => {
  const routes = generateMultimodalRoutes({
    from: 'Delhi',
    to: 'Mumbai',
    date: '2026-09-28',
    passengers: 1
  })

  // 1. Budget under 1000
  const budgetRoutes = routes.filter(r => r.totalFare <= 1000)
  assert.ok(budgetRoutes.length >= 1, 'Should find at least 1 budget option under 1000')
  assert.equal(budgetRoutes[0].tier, 'paisa-vasool')

  // 2. Sub-2000
  const balancedRoutes = routes.filter(r => r.totalFare <= 2000)
  assert.ok(balancedRoutes.length >= 2, 'Should find at least 2 options under 2000')

  // 3. Fastest
  const fastRoutes = routes.filter(r => r.tier === 'emergency-express' || (r.totalDurationMin && r.totalDurationMin <= 720))
  assert.ok(fastRoutes.length >= 1, 'Should find emergency express in fastest filter')
  assert.equal(fastRoutes[0].tier, 'emergency-express')
})

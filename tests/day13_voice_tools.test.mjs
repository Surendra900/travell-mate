import test from 'node:test'
import assert from 'node:assert/strict'
import {
  parseVoiceIntent,
  formatTierSpeechSummary,
  speakRouteTier,
  stopSpeaking
} from '../src/utils/voiceIntent.js'

test('Day 13: formatTierSpeechSummary produces rich, readable spoken itinerary summary', () => {
  const sampleRoute = {
    id: 'pv-hyd-vja-vskp',
    tier: 'paisa-vasool',
    tierLabel: '🟢 Paisa Vasool (Cheapest)',
    totalFare: 720,
    totalDuration: '8h 40m',
    hubCity: 'Vijayawada',
    transferBuffer: '1h 45m safe daylight transfer',
    whyPicked: 'Saves up to ₹3,500 vs. flight. Splits into two confirmed train quotas.',
    leg1: {
      mode: 'Train',
      from: 'Hyderabad',
      to: 'Vijayawada',
      depart: '07:30'
    },
    leg2: {
      mode: 'Train',
      from: 'Vijayawada',
      to: 'Visakhapatnam',
      arrive: '20:30'
    }
  }

  const summary = formatTierSpeechSummary(sampleRoute)
  assert.ok(summary.includes('Paisa Vasool (Cheapest)'), 'Includes clean tier name')
  assert.ok(summary.includes('720 rupees'), 'Includes spoken rupee fare')
  assert.ok(summary.includes('8h 40m'), 'Includes total duration')
  assert.ok(summary.includes('Hyderabad to Vijayawada'), 'Includes Leg 1 details')
  assert.ok(summary.includes('Vijayawada Junction'), 'Includes transfer buffer and hub')
  assert.ok(summary.includes('Visakhapatnam'), 'Includes Leg 2 arrival')
  assert.ok(summary.includes('Saves up to'), 'Includes reason why picked')
})

test('Day 13: speakRouteTier and stopSpeaking safely handle non-browser environment without throwing', () => {
  // In Node environment without window.speechSynthesis, returns null without crashing
  const result = speakRouteTier({
    tierLabel: '⚡ Emergency Express',
    totalFare: 4200,
    totalDuration: '4h 15m'
  })
  assert.equal(result, null)

  // stopSpeaking must not throw
  assert.doesNotThrow(() => {
    stopSpeaking()
  })
})

test('Day 13: parseVoiceIntent detects agentic speech-driven filter commands', () => {
  const cheapest = parseVoiceIntent('show cheapest routes')
  assert.equal(cheapest.intent, 'planner')
  assert.equal(cheapest.action, 'apply-filter')
  assert.equal(cheapest.filter, 'budget')

  const fastest = parseVoiceIntent('fastest option')
  assert.equal(fastest.intent, 'planner')
  assert.equal(fastest.action, 'apply-filter')
  assert.equal(fastest.filter, 'fastest')

  const balanced = parseVoiceIntent('smart balanced routes')
  assert.equal(balanced.intent, 'planner')
  assert.equal(balanced.action, 'apply-filter')
  assert.equal(balanced.filter, 'balanced')

  const backup = parseVoiceIntent('show backup options')
  assert.equal(backup.intent, 'planner')
  assert.equal(backup.action, 'show-backup')
})

test('Day 13: parseVoiceIntent detects voice tier playback commands', () => {
  const readFastest = parseVoiceIntent('read fastest route')
  assert.equal(readFastest.intent, 'planner')
  assert.equal(readFastest.action, 'read-tier')
  assert.equal(readFastest.targetTier, 'emergency-express')

  const readBudget = parseVoiceIntent('speak budget tier')
  assert.equal(readBudget.intent, 'planner')
  assert.equal(readBudget.action, 'read-tier')
  assert.equal(readBudget.targetTier, 'paisa-vasool')

  const readGeneral = parseVoiceIntent('read route options')
  assert.equal(readGeneral.intent, 'planner')
  assert.equal(readGeneral.action, 'read-tier')
  assert.equal(readGeneral.targetTier, 'top')
})

test('Day 13: parseVoiceIntent integrates filter preference into route search', () => {
  const routeWithFilter = parseVoiceIntent('cheapest train from Hyderabad to Visakhapatnam')
  assert.equal(routeWithFilter.plan.from, 'Hyderabad')
  assert.equal(routeWithFilter.plan.to, 'Visakhapatnam')
  assert.equal(routeWithFilter.plan.transportMode, 'Train')
  assert.equal(routeWithFilter.plan.filter, 'budget')
})

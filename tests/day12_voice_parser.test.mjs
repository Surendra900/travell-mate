import test from 'node:test'
import assert from 'node:assert/strict'
import { parseVoiceIntent, extractVoiceDate, speakRouteConfirmation } from '../src/utils/voiceIntent.js'

test('Day 12: parseVoiceIntent resolves Indian city aliases and phonetic variations', () => {
  const r1 = parseVoiceIntent('train from Dilli to Bombay')
  assert.equal(r1.plan.from, 'Delhi', 'Dilli should resolve to Delhi')
  assert.equal(r1.plan.to, 'Mumbai', 'Bombay should resolve to Mumbai')
  assert.equal(r1.plan.transportMode, 'Train')

  const r2 = parseVoiceIntent('flight between Bangalore and Calcutta')
  assert.equal(r2.plan.from, 'Bengaluru', 'Bangalore should resolve to Bengaluru')
  assert.equal(r2.plan.to, 'Kolkata', 'Calcutta should resolve to Kolkata')
  assert.equal(r2.plan.transportMode, 'Flight')

  const r3 = parseVoiceIntent('bus from Madras to Hydrabad')
  assert.equal(r3.plan.from, 'Chennai', 'Madras should resolve to Chennai')
  assert.equal(r3.plan.to, 'Hyderabad', 'Hydrabad should resolve to Hyderabad')
  assert.equal(r3.plan.transportMode, 'Bus')

  const r4 = parseVoiceIntent('train from Banaras to Cochin')
  assert.equal(r4.plan.from, 'Varanasi', 'Banaras should resolve to Varanasi')
  assert.equal(r4.plan.to, 'Kochi', 'Cochin should resolve to Kochi')
})

test('Day 12: extractVoiceDate extracts relative travel dates and time periods', () => {
  const fixedBase = new Date('2026-10-04T12:00:00Z') // Sunday

  const tomorrow = extractVoiceDate('train to Mumbai tomorrow morning', fixedBase)
  assert.ok(tomorrow, 'Tomorrow date should be extracted')
  assert.equal(tomorrow.label, 'tomorrow')
  assert.equal(tomorrow.timeOfDay, 'morning')
  assert.equal(tomorrow.date, '2026-10-05')

  const dayAfter = extractVoiceDate('flight to Goa day after tomorrow', fixedBase)
  assert.ok(dayAfter, 'Day after tomorrow should be extracted')
  assert.equal(dayAfter.label, 'day after tomorrow')
  assert.equal(dayAfter.date, '2026-10-06')

  const nextFriday = extractVoiceDate('bus to Bangalore next Friday', fixedBase)
  assert.ok(nextFriday, 'Next Friday should be extracted')
  assert.equal(nextFriday.label, 'next friday')
  assert.equal(nextFriday.date, '2026-10-09')
})

test('Day 12: parseVoiceIntent integrates date extraction into generated plan', () => {
  const result = parseVoiceIntent('tickets from Delhi to Jaipur tomorrow')
  assert.equal(result.plan.from, 'Delhi')
  assert.equal(result.plan.to, 'Jaipur')
  assert.equal(result.plan.dateLabel, 'tomorrow')
  assert.ok(result.plan.date, 'plan.date must be populated with ISO string')
})

test('Day 12: speakRouteConfirmation safely handles non-browser environment without throwing', () => {
  // In Node environment without window.speechSynthesis, returns null without crashing
  const confirmation = speakRouteConfirmation({
    plan: { from: 'Delhi', to: 'Mumbai', transportMode: 'Train', dateLabel: 'tomorrow' }
  })
  assert.equal(confirmation, null)
})

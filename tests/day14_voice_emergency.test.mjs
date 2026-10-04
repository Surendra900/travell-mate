import test from 'node:test'
import assert from 'node:assert/strict'
import {
  parseVoiceIntent,
  speakEmergencyConfirmation,
  speakProtocolGuidance
} from '../src/utils/voiceIntent.js'

test('Day 14: parseVoiceIntent detects diverse spoken emergency distress keywords', () => {
  const r1 = parseVoiceIntent('help')
  assert.equal(r1.intent, 'safety')
  assert.equal(r1.action, 'open-safety')
  assert.equal(r1.emergencyType, 'general')
  assert.equal(r1.hotline, '112')

  const r2 = parseVoiceIntent('sos')
  assert.equal(r2.intent, 'safety')
  assert.equal(r2.action, 'open-safety')
  assert.equal(r2.emergencyType, 'general')
  assert.equal(r2.hotline, '112')

  const r3 = parseVoiceIntent('call police')
  assert.equal(r3.intent, 'safety')
  assert.equal(r3.emergencyType, 'police')
  assert.equal(r3.hotline, '112')

  const r4 = parseVoiceIntent('need ambulance urgently')
  assert.equal(r4.intent, 'safety')
  assert.equal(r4.emergencyType, 'medical')
  assert.equal(r4.hotline, '108')

  const r5 = parseVoiceIntent('railway emergency')
  assert.equal(r5.intent, 'safety')
  assert.equal(r5.emergencyType, 'railway')
  assert.equal(r5.hotline, '139')

  const r6 = parseVoiceIntent('women safety helpline')
  assert.equal(r6.intent, 'safety')
  assert.equal(r6.emergencyType, 'women')
  assert.equal(r6.hotline, '1090')
})

test('Day 14: speakEmergencyConfirmation safely handles non-browser environment without throwing', () => {
  const res1 = speakEmergencyConfirmation('general')
  assert.equal(res1, null)

  const res2 = speakEmergencyConfirmation('police')
  assert.equal(res2, null)

  const res3 = speakEmergencyConfirmation('medical')
  assert.equal(res3, null)
})

test('Day 14: speakProtocolGuidance formats crisis protocol guidance without throwing', () => {
  const protocol = {
    title: 'Coach Medical Crisis',
    steps: ['Locate Coach TTE', 'Press alarm chain if critical', 'Dial 139'],
    hotlineLabel: 'Call 139'
  }

  const res = speakProtocolGuidance(protocol)
  assert.equal(res, null)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  emergencyNumber,
  TRANSIT_HOTLINES,
  TRANSIT_INCIDENT_PROTOCOLS
} from '../src/data/emergencyData.js'

const root = path.resolve('.')

test('TRANSIT_HOTLINES defines all 4 core Indian transit emergency helplines', () => {
  assert.equal(TRANSIT_HOTLINES.length, 4)

  const numbers = TRANSIT_HOTLINES.map(h => h.number)
  assert.ok(numbers.includes('112'), 'Must include 112 National Unified Emergency')
  assert.ok(numbers.includes('139'), 'Must include 139 RailMadad & RPF Transit Helpline')
  assert.ok(numbers.includes('108'), 'Must include 108 Emergency Ambulance Helpline')
  assert.ok(numbers.includes('1090'), 'Must include 1090 Women Safety & Anti-Harassment')

  for (const hotline of TRANSIT_HOTLINES) {
    assert.ok(hotline.title.length > 5, 'Hotline title must be descriptive')
    assert.ok(hotline.desc.length > 10, 'Hotline description must explain service scope')
    assert.ok(hotline.badge.includes('24/7'), 'Hotline must indicate 24/7 availability')
    assert.match(hotline.btnColor, /bg-/, 'Hotline button must have high-visibility styling')
  }
})

test('TRANSIT_INCIDENT_PROTOCOLS provides actionable zero-network transit procedures', () => {
  assert.ok(TRANSIT_INCIDENT_PROTOCOLS.length >= 4, 'Must provide at least 4 transit incident protocols')

  const protocolIds = TRANSIT_INCIDENT_PROTOCOLS.map(p => p.id)
  assert.ok(protocolIds.includes('coach-medical'), 'Must include on-train coach medical protocol')
  assert.ok(protocolIds.includes('zero-fir'), 'Must include theft and Zero-FIR filing protocol')
  assert.ok(protocolIds.includes('stranded-junction'), 'Must include night stranded junction layover protocol')
  assert.ok(protocolIds.includes('lost-traveler'), 'Must include lost traveler distress protocol')

  for (const protocol of TRANSIT_INCIDENT_PROTOCOLS) {
    assert.ok(protocol.title.length > 5, 'Protocol must have clear title')
    assert.ok(protocol.steps.length >= 4, 'Protocol must have at least 4 step-by-step instructions')
    assert.ok(protocol.hotline.length >= 3, 'Protocol must be mapped to an official emergency hotline')
    assert.ok(protocol.hotlineLabel.includes('Call'), 'Protocol must have clear direct dial call label')
  }

  // Verify Zero-FIR specifics
  const zeroFir = TRANSIT_INCIDENT_PROTOCOLS.find(p => p.id === 'zero-fir')
  assert.ok(zeroFir.steps.some(s => s.includes('Zero-FIR')), 'Zero-FIR procedure must be explicitly detailed')
  assert.ok(zeroFir.steps.some(s => s.includes('1930')), 'Must include 1930 cyber fraud helpline for fast account freezing')

  // Verify Coach Medical specifics
  const medical = TRANSIT_INCIDENT_PROTOCOLS.find(p => p.id === 'coach-medical')
  assert.ok(medical.steps.some(s => s.includes('139') || s.includes('TTE')), 'Must reference TTE and 139 RailMadad')
})

test('EmergencyToolkit.jsx integrates 4-hotline dialers, live GPS telemetry, and legal disclaimer', () => {
  const code = readFileSync(path.join(root, 'src/components/EmergencyToolkit.jsx'), 'utf8')

  // 4-Hotlines and direct calling with location copy
  assert.match(code, /TRANSIT_HOTLINES/, 'Must render TRANSIT_HOTLINES')
  assert.match(code, /handleHotlineCall/, 'Must implement handleHotlineCall')
  assert.match(code, /navigator\.clipboard\.writeText/, 'Must copy location to clipboard on hotline call')

  // Live GPS Broadcast Engine & telemetry
  assert.match(code, /Live GPS Broadcast Engine/, 'Must feature Live GPS Broadcast Engine')
  assert.match(code, /Satellite Fix Locked|Approximate Fix|GPS Offline/, 'Must indicate satellite lock telemetry state')
  assert.match(code, /locationMapUrl/, 'Must construct explicit Google Maps URL')
  assert.match(code, /Open Maps/, 'Must provide direct link to open Google Maps')

  // Offline Transit Incident Protocols
  assert.match(code, /TRANSIT_INCIDENT_PROTOCOLS/, 'Must render offline incident protocols')
  assert.match(code, /Offline Transit Incident Protocols/, 'Must display Offline Transit Incident Protocols header')
  assert.match(code, /expandedProtocol/, 'Must support interactive accordion expansion')

  // Legal Notice & A11y
  assert.match(code, /Legal Safety & Transit Notice/, 'Must feature prominent legal safety warning')
  assert.match(code, /NOT an official government dispatch system/, 'Must clearly disclose scope and advise dialing 112/139 directly')
  assert.match(code, /aria-label="SOS Emergency Alert"/, 'Must have WCAG aria-label for emergency container')
  assert.match(code, /role="submit"|type="submit"|type="button"/, 'Buttons must have explicit accessible types')
})

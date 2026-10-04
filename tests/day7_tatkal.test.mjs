import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve('.')

test('TatkalEmergencyTimer.jsx implements dual-window countdown and IST synchronization', () => {
  const code = readFileSync(path.join(root, 'src/components/TatkalEmergencyTimer.jsx'), 'utf8')

  // Dual window countdowns
  assert.match(code, /targetAc/, 'Must track AC Tatkal window')
  assert.match(code, /targetNonAc/, 'Must track Non-AC Tatkal window')
  assert.match(code, /diffAc/, 'Must compute differential for AC window')
  assert.match(code, /diffNonAc/, 'Must compute differential for Non-AC window')
  assert.match(code, /10:00 AM/, 'Must specify 10:00 AM opening time for AC')
  assert.match(code, /11:00 AM/, 'Must specify 11:00 AM opening time for Non-AC')
  assert.match(code, /IST Sync \(UTC\+5:30\)/, 'Must display IST synchronization status')

  // Alarm and reminders
  assert.match(code, /alarmLeadMinutes/, 'Must support adjustable alarm lead times')
  assert.match(code, /enableAlarm/, 'Must support enabling alarm')
  assert.match(code, /disableAlarm/, 'Must support disabling alarm')
})

test('EmergencyTatkalPlanner.jsx implements 1-click master data auto-fill and pre-Tatkal checklist', () => {
  const code = readFileSync(path.join(root, 'src/planner/EmergencyTatkalPlanner.jsx'), 'utf8')

  // Master Data Auto-Fill
  assert.match(code, /Tatkal Auto-Fill Master Data/, 'Must render Master Data Assistant')
  assert.match(code, /travelmate-tatkal-master-list/, 'Must persist master list to local storage')
  assert.match(code, /copyMasterData/, 'Must implement 1-click clipboard copy')
  assert.match(code, /navigator\.clipboard\.writeText/, 'Must copy formatted passenger string to clipboard')
  assert.match(code, /Max 4 for Tatkal/, 'Must enforce max 4 passengers limit for Tatkal')

  // Rapid Action Checklist
  assert.match(code, /Pre-Tatkal Golden Hour Checklist/, 'Must render Pre-Tatkal Golden Hour Checklist')
  assert.match(code, /toggleChecklistItem/, 'Must allow checking off items')
  assert.match(code, /Open IRCTC Portal/, 'Must provide link to official IRCTC portal')

  // Integration with live trains and SeatAvailabilityChecker
  assert.match(code, /Check live Tatkal trains/, 'Must preserve Check live Tatkal trains action')
  assert.match(code, /SeatAvailabilityChecker/, 'Must preserve SeatAvailabilityChecker')
  assert.match(code, /TQ Eligible/, 'Must label Tatkal quota eligibility')
})

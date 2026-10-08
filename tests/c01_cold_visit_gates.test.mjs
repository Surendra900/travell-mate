import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

describe('C-01 & C-02 & C-03: Cold Visit Unblocked & Spec Compliance Gate', () => {

  it('C-03 & C-01: LocationPermissionGate does not auto-open on cold load without user gesture', async () => {
    const locGateContent = await fs.readFile('src/components/LocationPermissionGate.jsx', 'utf8')
    assert.ok(
      !locGateContent.includes('setOpen(!choice)'),
      'LocationPermissionGate must not auto-open on cold load without user gesture'
    )
    assert.ok(
      locGateContent.includes('setOpen(false)'),
      'LocationPermissionGate must default open state to false on cold load'
    )
  })

  it('C-01 & C-02: BlindVoiceGate does not auto-open for first-time visitors', async () => {
    const blindGateContent = await fs.readFile('src/components/BlindVoiceGate.jsx', 'utf8')
    assert.ok(
      !blindGateContent.includes("sessionStorage.getItem('travelmate-blind-gate-shown')"),
      'BlindVoiceGate must not use session auto-prompting on home'
    )
    const appContent = await fs.readFile('src/App.jsx', 'utf8')
    assert.ok(
      appContent.includes('{blindGateOpen &&') || appContent.includes('blindGateOpen ?'),
      'BlindVoiceGate must only be rendered conditionally when explicitly triggered'
    )
  })

})

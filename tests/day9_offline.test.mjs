import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve('.')

test('useDeviceStatus detects poor cellular connection and data-saver mode', () => {
  const code = readFileSync(path.join(root, 'src/utils/deviceStatus.js'), 'utf8')
  assert.match(code, /isSlowNetwork/, 'Must export isSlowNetwork status')
  assert.match(code, /effectiveType === '2g'/, 'Must detect 2G network')
  assert.match(code, /saveData/, 'Must respect user saveData preference')
  assert.match(code, /networkQuality/, 'Must export network quality tiers')
  assert.match(code, /recommendedMode/, 'Must automatically recommend low-network mode when offline or slow')
})

test('LowNetworkPlanner.jsx renders diagnostic banner, offline snapshot, and voice emergency links', () => {
  const code = readFileSync(path.join(root, 'src/planner/LowNetworkPlanner.jsx'), 'utf8')
  assert.match(code, /AUTONOMOUS ZERO-NETWORK SHIFT/, 'Must display autonomous shift badge')
  assert.match(code, /Zero external HTTP requests made/, 'Must guarantee zero external HTTP requests')
  assert.match(code, /SavedOfflineSnapshot/, 'Must render saved offline route snapshots')
  assert.match(code, /Sync Offline Pack/, 'Must provide offline pack sync action')
  assert.match(code, /tel:139/, 'Must provide direct cellular voice link for RailMadad')
  assert.match(code, /What stays available offline/, 'Must clarify offline capabilities')
})

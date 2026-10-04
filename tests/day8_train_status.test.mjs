import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import {
  parseDelayMinutes,
  calculateDelaySeverity,
  POPULAR_TRAIN_PRESETS,
  POPULAR_STATION_PRESETS,
  SAMPLE_LIVE_TRAIN_STATUSES,
  SAMPLE_STATION_BOARDS
} from '../src/utils/trainRunningTracker.js'

const root = path.resolve('.')

test('parseDelayMinutes parses various Indian transit delay string representations', () => {
  assert.equal(parseDelayMinutes(0), 0)
  assert.equal(parseDelayMinutes('0 mins'), 0)
  assert.equal(parseDelayMinutes('Right on time'), 0)
  assert.equal(parseDelayMinutes('18 mins delay'), 18)
  assert.equal(parseDelayMinutes('Late by 45 mins'), 45)
  assert.equal(parseDelayMinutes(null), 0)
})

test('calculateDelaySeverity segments delays and alerts for severe transit connection risks', () => {
  const onTime = calculateDelaySeverity('0 mins')
  assert.equal(onTime.tier, 'on-time')
  assert.equal(onTime.contingencyAlert, false)

  const minor = calculateDelaySeverity('18 mins late')
  assert.equal(minor.tier, 'minor')
  assert.equal(minor.contingencyAlert, false)

  const severe = calculateDelaySeverity('50 mins late')
  assert.equal(severe.tier, 'severe')
  assert.equal(severe.contingencyAlert, true)
  assert.match(severe.advice, /backup routes/i)
})

test('POPULAR_TRAIN_PRESETS and SAMPLE_LIVE_TRAIN_STATUSES contain realistic verified data', () => {
  assert.ok(POPULAR_TRAIN_PRESETS.length >= 4)
  for (const preset of POPULAR_TRAIN_PRESETS) {
    assert.match(preset.code, /^\d{5}$/)
  }

  const sampleRajdhani = SAMPLE_LIVE_TRAIN_STATUSES['12952']
  assert.ok(sampleRajdhani)
  assert.equal(sampleRajdhani.trainNumber, '12952')
  assert.ok(sampleRajdhani.timeline.length >= 4)
  assert.ok(sampleRajdhani.timeline.some(t => t.status === 'departed'))
  assert.ok(sampleRajdhani.timeline.some(t => t.status === 'upcoming'))
})

test('TrainRunningStatus.jsx incorporates tracker, station boards, and presets', () => {
  const code = readFileSync(path.join(root, 'src/planner/TrainRunningStatus.jsx'), 'utf8')
  assert.match(code, /Live Train Status & Station Boards/, 'Must render main title')
  assert.match(code, /Train Tracker/, 'Must provide Train Tracker mode')
  assert.match(code, /Station Board/, 'Must provide Station Board mode')
  assert.match(code, /POPULAR_TRAIN_PRESETS/, 'Must render popular train presets')
  assert.match(code, /calculateDelaySeverity/, 'Must compute delay heuristics')
  assert.match(code, /Station Progression Timeline/, 'Must render visual station progression')
})

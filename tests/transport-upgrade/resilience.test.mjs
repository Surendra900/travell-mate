/**
 * TravelMate AI — Resilience & Cache Tests
 * Agent 20: Test Automation Lead — W6-01
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { makeCacheKey, CACHE_TTL } from '../../api/_cache.js'
import { withTimeout, gracefulError } from '../../api/_resilience.js'

// --- makeCacheKey ---
test('makeCacheKey: prefixed with travelmate:namespace:', () => {
  const key = makeCacheKey('trains', { from: 'NDLS', to: 'SBC' })
  assert.match(key, /^travelmate:trains:/)
})
test('makeCacheKey: deterministic regardless of param order', () => {
  const k1 = makeCacheKey('flights', { from: 'DEL', to: 'BOM', date: '2026-12-01' })
  const k2 = makeCacheKey('flights', { date: '2026-12-01', to: 'BOM', from: 'DEL' })
  assert.equal(k1, k2)
})
test('makeCacheKey: key is entirely lowercase', () => {
  const key = makeCacheKey('trains', { from: 'NDLS', to: 'MAS' })
  assert.equal(key, key.toLowerCase())
})
test('makeCacheKey: omits empty string params', () => {
  const k1 = makeCacheKey('trains', { from: 'NDLS', to: 'SBC', date: '' })
  const k2 = makeCacheKey('trains', { from: 'NDLS', to: 'SBC' })
  assert.equal(k1, k2)
})
test('makeCacheKey: different destinations produce different keys', () => {
  const k1 = makeCacheKey('trains', { from: 'NDLS', to: 'SBC' })
  const k2 = makeCacheKey('trains', { from: 'NDLS', to: 'MAS' })
  assert.notEqual(k1, k2)
})

// --- CACHE_TTL ---
test('CACHE_TTL.TRAINS ≥ 30 s', () => assert.ok(CACHE_TTL.TRAINS >= 30))
test('CACHE_TTL.FLIGHTS ≥ 30 s', () => assert.ok(CACHE_TTL.FLIGHTS >= 30))
test('CACHE_TTL.STATIC is longest', () => assert.ok(CACHE_TTL.STATIC > CACHE_TTL.TRAINS))

// --- withTimeout ---
test('withTimeout: resolves when promise finishes before deadline', async () => {
  const result = await withTimeout(Promise.resolve('ok'), 1000)
  assert.equal(result, 'ok')
})
test('withTimeout: rejects with SEARCH_TIMEOUT when too slow', async () => {
  const slow = new Promise(resolve => setTimeout(() => resolve('late'), 500))
  await assert.rejects(withTimeout(slow, 50), err => {
    assert.equal(err.code, 'SEARCH_TIMEOUT')
    return true
  })
})
test('withTimeout: propagates rejection from wrapped promise', async () => {
  await assert.rejects(withTimeout(Promise.reject(new Error('down')), 1000), /down/)
})

// --- gracefulError ---
test('gracefulError: returns ok=false with empty results', () => {
  const body = gracefulError({ mode: 'provider-unconfigured', provider: 'IRCTC', message: 'Not configured.' })
  assert.equal(body.ok, false)
  assert.deepEqual(body.results, [])
  assert.equal(body.count, 0)
  assert.equal(body.sourceBadge, 'PROVIDER_VERIFICATION_REQUIRED')
})
test('gracefulError: mode and provider are set', () => {
  const body = gracefulError({ mode: 'timeout', provider: 'Aviationstack', message: 'Timed out.' })
  assert.equal(body.mode, 'timeout')
  assert.equal(body.provider, 'Aviationstack')
})
test('gracefulError: extra fields are merged', () => {
  const body = gracefulError({ mode: 'provider-error', provider: 'X', message: 'Err.', extra: { radiusKm: 100 } })
  assert.equal(body.radiusKm, 100)
})

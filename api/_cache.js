/**
 * TravelMate AI — API Response Cache
 * Agent 19: Resilience & Performance — W4-01
 *
 * Thin cache layer using Upstash Redis (HTTP REST API).
 * Falls back gracefully to a no-op when Redis is not configured.
 *
 * Usage in an API handler:
 *   import { getCached, setCached, makeCacheKey } from '../_cache.js'
 *
 *   const key = makeCacheKey('trains', { from, to, date })
 *   const cached = await getCached(key)
 *   if (cached) return res.status(200).json(cached)
 *   // ... fetch real data ...
 *   await setCached(key, responseBody, 60)  // TTL 60 s
 */

const REDIS_TIMEOUT_MS = 2_000

function redisConfig() {
  const url   = String(process.env.UPSTASH_REDIS_REST_URL   || '').trim()
  const token = String(process.env.UPSTASH_REDIS_REST_TOKEN || '').trim()
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

/**
 * Builds a deterministic cache key from a namespace and a params object.
 * Keys are lowercased and sorted so param order does not matter.
 * @param {string} namespace   — e.g. 'trains', 'flights', 'buses'
 * @param {Object} params      — query params that identify the request
 * @returns {string}
 */
export function makeCacheKey(namespace, params = {}) {
  const sorted = Object.entries(params)
    .filter(([, v]) => v != null && String(v).trim() !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${String(v).toLowerCase().trim()}`)
    .join('&')
  return `travelmate:${namespace}:${sorted}`
}

/**
 * Reads a cached value from Upstash Redis.
 * Returns the parsed JSON value, or null on miss / error / unconfigured.
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export async function getCached(key) {
  const cfg = redisConfig()
  if (!cfg) return null
  try {
    const res = await fetch(`${cfg.url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      signal: AbortSignal.timeout(REDIS_TIMEOUT_MS)
    })
    if (!res.ok) return null
    const body = await res.json()
    const raw = body?.result
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Stores a value in Upstash Redis with a TTL in seconds.
 * Silently ignores errors — cache failures never break the request.
 * @param {string} key
 * @param {any}    value      — will be JSON-serialised
 * @param {number} [ttlSec=60]
 */
export async function setCached(key, value, ttlSec = 60) {
  const cfg = redisConfig()
  if (!cfg) return
  try {
    await fetch(`${cfg.url}/set/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value: JSON.stringify(value), ex: ttlSec }),
      signal: AbortSignal.timeout(REDIS_TIMEOUT_MS)
    })
  } catch {
    // Intentional no-op — cache write failure must never surface to user
  }
}

/**
 * Deletes a cached key (call after a data-mutating action if needed).
 * @param {string} key
 */
export async function deleteCached(key) {
  const cfg = redisConfig()
  if (!cfg) return
  try {
    await fetch(`${cfg.url}/del/${encodeURIComponent(key)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.token}` },
      signal: AbortSignal.timeout(REDIS_TIMEOUT_MS)
    })
  } catch { /* no-op */ }
}

/**
 * Cache TTL constants (seconds).
 * Keep short — transport data is live and time-sensitive.
 */
export const CACHE_TTL = Object.freeze({
  TRAINS:  60,   // 1 minute — live schedule may change
  FLIGHTS: 90,   // 1.5 minutes — fares fluctuate fast
  BUSES:   120,  // 2 minutes — less volatile
  STATIC:  300,  // 5 minutes — station/airport lookups
})

/**
 * TravelMate AI — Resilience Utilities
 * Agent 19: Resilience & Performance — W4-02 / W4-03
 *
 * Provides:
 *   - withTimeout()      wrap any promise with a hard timeout
 *   - raceProviders()    run multiple providers in parallel, return first winner
 *   - gracefulError()    build a consistent empty-state error response
 *   - withCache()        wrap an async function with cache read/write
 */

import { getCached, setCached, makeCacheKey, CACHE_TTL } from './_cache.js'
import { PROVIDER_TIMEOUT_MS, SEARCH_TIMEOUT_MS } from '../src/config/routingConfig.js'

// ---------------------------------------------------------------------------
// Timeout wrapper
// ---------------------------------------------------------------------------

/**
 * Wraps a promise with a hard timeout.
 * Throws an error with code 'SEARCH_TIMEOUT' if the timeout is reached first.
 * @param {Promise<T>} promise
 * @param {number} [ms]        — default: SEARCH_TIMEOUT_MS from routingConfig
 * @returns {Promise<T>}
 */
export function withTimeout(promise, ms = SEARCH_TIMEOUT_MS) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`Search timed out after ${ms} ms.`)
      err.code   = 'SEARCH_TIMEOUT'
      err.status = 504
      reject(err)
    }, ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

// ---------------------------------------------------------------------------
// Race-first-winner across providers
// ---------------------------------------------------------------------------

/**
 * Runs multiple provider async functions in parallel.
 * Returns the FIRST to resolve successfully (non-null, non-throwing).
 * If all fail, returns null.
 *
 * @param {Array<() => Promise<any>>} providers   — array of async factory functions
 * @param {number} [timeoutMs]
 * @returns {Promise<any|null>}
 */
export async function raceProviders(providers = [], timeoutMs = PROVIDER_TIMEOUT_MS) {
  if (!providers.length) return null

  return new Promise(resolve => {
    let remaining = providers.length
    let resolved  = false

    for (const fn of providers) {
      const timed = withTimeout(fn(), timeoutMs)
      timed
        .then(result => {
          if (!resolved && result != null) {
            resolved = true
            resolve(result)
          }
        })
        .catch(() => { /* ignore individual provider errors */ })
        .finally(() => {
          remaining--
          if (remaining === 0 && !resolved) resolve(null)
        })
    }
  })
}

// ---------------------------------------------------------------------------
// Graceful empty-state error response builder
// ---------------------------------------------------------------------------

/**
 * Builds a consistent, user-safe empty-state response body.
 * Never exposes internal error details to the client.
 *
 * @param {Object} options
 * @param {'provider-unconfigured'|'provider-error'|'timeout'|'invalid'|'rate-limited'} options.mode
 * @param {string} options.provider   — human name e.g. 'RapidAPI IRCTC'
 * @param {string} options.message    — user-facing sentence
 * @param {string} [options.error]    — error code for client-side handling
 * @param {Object} [options.extra]    — any extra fields to include
 * @returns {Object}
 */
export function gracefulError({ mode, provider, message, error = 'PROVIDER_ERROR', extra = {} }) {
  return {
    ok:          false,
    mode,
    provider,
    sourceBadge: 'PROVIDER_VERIFICATION_REQUIRED',
    message,
    error,
    count:       0,
    results:     [],
    ...extra
  }
}

// ---------------------------------------------------------------------------
// Cache-aware async wrapper
// ---------------------------------------------------------------------------

/**
 * Executes `fn` only if the result is not cached.
 * On hit: returns cached value immediately.
 * On miss: runs fn, stores result, returns it.
 * On cache error: runs fn without caching.
 *
 * @param {string}            namespace   — 'trains' | 'flights' | 'buses' | 'static'
 * @param {Object}            params      — cache key params
 * @param {() => Promise<T>}  fn          — the actual fetch function
 * @param {number}            [ttlSec]    — override default TTL
 * @returns {Promise<{ data: T, fromCache: boolean }>}
 */
export async function withCache(namespace, params, fn, ttlSec) {
  const ttl = ttlSec ?? CACHE_TTL[namespace.toUpperCase()] ?? 60
  const key  = makeCacheKey(namespace, params)

  const cached = await getCached(key)
  if (cached !== null) {
    return { data: cached, fromCache: true }
  }

  const data = await fn()
  if (data !== null && data !== undefined) {
    await setCached(key, data, ttl) // fire-and-forget
  }
  return { data, fromCache: false }
}

// ---------------------------------------------------------------------------
// Safe JSON fetch with timeout (wraps fetchJsonWithTimeout from _security.js)
// but adds graceful error return instead of throwing
// ---------------------------------------------------------------------------

/**
 * Fetches JSON from a URL with a timeout.
 * Returns { ok: true, payload } on success or { ok: false, error } on failure.
 * Never throws.
 * @param {string} url
 * @param {RequestInit} options
 * @param {number} [timeoutMs]
 * @returns {Promise<{ ok: boolean, payload?: any, error?: Error }>}
 */
export async function safeFetch(url, options = {}, timeoutMs = PROVIDER_TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    const text = await response.text()
    let payload = null
    try { payload = text ? JSON.parse(text) : null } catch { payload = null }
    return { ok: response.ok, payload, status: response.status }
  } catch (error) {
    if (error?.name === 'AbortError') {
      const te = new Error('Provider request timed out.')
      te.code = 'PROVIDER_TIMEOUT'
      te.status = 504
      return { ok: false, error: te }
    }
    return { ok: false, error }
  } finally {
    clearTimeout(timer)
  }
}

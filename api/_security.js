import { createPublicKey, verify as verifySignature } from 'node:crypto'

const RATE_LIMIT_STORE = globalThis.__travelmateRateLimitStore || new Map()
globalThis.__travelmateRateLimitStore = RATE_LIMIT_STORE
const JWKS_CACHE = globalThis.__travelmateJwksCache || new Map()
globalThis.__travelmateJwksCache = JWKS_CACHE

function header(req, name) {
  const value = req?.headers?.[name] ?? req?.headers?.[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : String(value || '')
}

function jsonError(res, status, message, code, extra = {}) {
  return res.status(status).json({ ok: false, mode: 'error', message, error: code, ...extra })
}

export function setApiHeaders(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0, must-revalidate')
  res.setHeader('Pragma', 'no-cache')
  res.setHeader('Expires', '0')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'same-origin')
}

function clientIp(req) {
  return header(req, 'x-forwarded-for').split(',')[0].trim() || header(req, 'x-real-ip') || 'unknown'
}

export async function enforceDistributedRateLimit(key, limit, windowMs) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null

  try {
    const windowSec = Math.max(1, Math.ceil(windowMs / 1000))
    const response = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        ['INCR', `rl:${key}`],
        ['EXPIRE', `rl:${key}`, windowSec, 'NX'],
        ['TTL', `rl:${key}`]
      ]),
      signal: AbortSignal.timeout(2000)
    })

    if (!response.ok) {
      console.warn(`[RateLimit] Upstash Redis returned HTTP ${response.status}, falling back to memory store`)
      return null
    }

    const results = await response.json()
    const count = Number(results?.[0]?.result || 1)
    const ttl = Number(results?.[2]?.result || windowSec)
    return { count, resetSec: Math.max(1, ttl) }
  } catch (err) {
    console.warn(`[RateLimit] Upstash Redis request error (${err.message}), falling back to memory store`)
    return null
  }
}

export function publicProviderError(
  error,
  fallback = 'The provider is temporarily unavailable.'
) {
  const code = String(error?.code || '').trim()

  const safeMessages = new Map([
    ['PROVIDER_TIMEOUT', 'The provider timed out. Please try again.'],
    ['MISSING_PROVIDER_CONFIG', 'This provider is not configured.'],
    ['MISSING_RAPIDAPI_KEY', 'The railway provider is not configured.'],
    ['SAMBANOVA_NOT_CONFIGURED', 'The assistant provider is not configured.'],
    ['RATE_LIMITED', 'Too many requests. Please try again later.']
  ])

  return {
    message: safeMessages.get(code) || fallback,
    error: code || 'PROVIDER_ERROR'
  }
}

export async function enforceRateLimit(req, res, limit, windowMs) {
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL)
  const now = Date.now()
  const pathname = String(req?.url || req?.query?.path || 'api').split('?')[0]
  const key = `${clientIp(req)}:${pathname}`

  // 1. Try distributed Upstash Redis if configured
  const distributed = await enforceDistributedRateLimit(key, limit, windowMs)
  if (distributed) {
    const { count, resetSec } = distributed
    const resetAt = now + (resetSec * 1000)
    res.setHeader('X-RateLimit-Limit', String(limit))
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - count)))
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)))
    if (count > limit) {
      res.setHeader('Retry-After', String(Math.max(1, resetSec)))
      return false
    }
    return true
  }

  // In production or on Vercel, rate limiter must be distributed (Upstash Redis)
  if (isProduction) {
    res.status(503).json({
      ok: false,
      mode: 'error',
      message: 'Rate limiting is temporarily unavailable. Please try again later.',
      error: 'RATE_LIMITER_UNAVAILABLE'
    })
    return false
  }

  // 2. Fallback to local in-memory store for development
  let record = RATE_LIMIT_STORE.get(key)
  if (!record || record.resetAt <= now) record = { count: 0, resetAt: now + windowMs }
  record.count += 1
  RATE_LIMIT_STORE.set(key, record)

  if (RATE_LIMIT_STORE.size > 5_000) {
    for (const [storedKey, stored] of RATE_LIMIT_STORE) {
      if (stored.resetAt <= now) RATE_LIMIT_STORE.delete(storedKey)
    }
  }

  res.setHeader('X-RateLimit-Limit', String(limit))
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - record.count)))
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(record.resetAt / 1000)))
  if (record.count > limit) {
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil((record.resetAt - now) / 1000))))
    return false
  }
  return true
}

function normalizeHost(value = '') {
  return String(value).toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0]
}

function allowedRequestSource(req) {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) return true
  const secFetchSite = header(req, 'sec-fetch-site').toLowerCase()
  if (secFetchSite === 'cross-site') return false

  const allowedHosts = new Set([
    normalizeHost(header(req, 'host')),
    normalizeHost(process.env.VERCEL_URL),
    normalizeHost(process.env.VERCEL_PROJECT_PRODUCTION_URL),
    ...String(process.env.ALLOWED_ORIGINS || '').split(',').map(normalizeHost)
  ].filter(Boolean))

  for (const source of [header(req, 'origin'), header(req, 'referer')]) {
    if (!source) continue
    try {
      if (!allowedHosts.has(normalizeHost(new URL(source).host))) return false
    } catch {
      return false
    }
  }

  return Boolean(header(req, 'origin') || header(req, 'referer') || ['same-origin', 'same-site'].includes(secFetchSite))
}

function decodeBase64Url(value) {
  return Buffer.from(String(value || '').replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

function decodeJwtPart(value) {
  return JSON.parse(decodeBase64Url(value).toString('utf8'))
}

function issuerFromPublishableKey() {
  const key = String(process.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim()
  const encoded = key.replace(/^pk_(test|live)_/, '')
  if (!encoded || encoded === key) return ''
  try {
    const domain = decodeBase64Url(encoded).toString('utf8').replace(/\$$/, '').trim()
    return domain ? `https://${domain}` : ''
  } catch {
    return ''
  }
}

function configuredIssuer() {
  return String(process.env.CLERK_ISSUER_URL || process.env.CLERK_JWT_ISSUER || issuerFromPublishableKey()).replace(/\/$/, '')
}

async function fetchJwks(issuer) {
  const cached = JWKS_CACHE.get(issuer)
  if (cached && cached.expiresAt > Date.now()) return cached.keys

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5_000)
  try {
    const response = await fetch(`${issuer}/.well-known/jwks.json`, { signal: controller.signal, headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`JWKS HTTP ${response.status}`)
    const data = await response.json()
    const keys = Array.isArray(data.keys) ? data.keys : []
    JWKS_CACHE.set(issuer, { keys, expiresAt: Date.now() + 10 * 60 * 1000 })
    return keys
  } finally {
    clearTimeout(timeout)
  }
}

async function verifyClerkToken(token) {
  const parts = String(token || '').split('.')
  if (parts.length !== 3) throw new Error('Malformed authentication token.')
  const [encodedHeader, encodedPayload, encodedSignature] = parts
  const jwtHeader = decodeJwtPart(encodedHeader)
  const payload = decodeJwtPart(encodedPayload)
  const issuer = configuredIssuer()
  if (!issuer) throw new Error('CLERK_ISSUER_URL is not configured for protected API routes.')
  if (payload.iss !== issuer) throw new Error('Authentication token issuer mismatch.')
  const now = Math.floor(Date.now() / 1000)
  if (!payload.sub || Number(payload.exp || 0) <= now) throw new Error('Authentication token is expired or incomplete.')
  if (payload.nbf && Number(payload.nbf) > now + 30) throw new Error('Authentication token is not active yet.')
  if (process.env.CLERK_AUDIENCE) {
    const audience = Array.isArray(payload.aud) ? payload.aud : [payload.aud]
    if (!audience.includes(process.env.CLERK_AUDIENCE)) throw new Error('Authentication token audience mismatch.')
  }
  if (jwtHeader.alg !== 'RS256' || !jwtHeader.kid) throw new Error('Unsupported authentication token algorithm.')

  const keys = await fetchJwks(issuer)
  const jwk = keys.find((item) => item.kid === jwtHeader.kid && item.kty === 'RSA')
  if (!jwk) throw new Error('Authentication signing key was not found.')
  const publicKey = createPublicKey({ key: jwk, format: 'jwk' })
  const valid = verifySignature(
    'RSA-SHA256',
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
    publicKey,
    decodeBase64Url(encodedSignature)
  )
  if (!valid) throw new Error('Authentication token signature is invalid.')
  return payload
}

export async function prepareApiRequest(req, res, options = {}) {
  setApiHeaders(res)
  const methods = options.methods || ['GET']
  const method = String(req?.method || 'GET').toUpperCase()
  if (!methods.includes(method)) {
    res.setHeader('Allow', methods.join(', '))
    jsonError(res, 405, 'Method not allowed.', 'METHOD_NOT_ALLOWED')
    return null
  }

  const limit = Number(options.rateLimit || 30)
  const windowMs = Number(options.windowMs || 60_000)
  if (!(await enforceRateLimit(req, res, limit, windowMs))) {
    jsonError(res, 429, 'Too many requests. Wait before trying again.', 'RATE_LIMITED')
    return null
  }

  const authorization = header(req, 'authorization')
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1] || ''
  const globalAuthRequired = String(process.env.API_REQUIRE_AUTH || '').toLowerCase() === 'true'
  const requireAuth = Boolean(options.requireAuth === true || (options.useGlobalAuth !== false && globalAuthRequired))

  if (!allowedRequestSource(req) && !token) {
    jsonError(res, 403, 'Cross-site or untrusted API request blocked.', 'UNTRUSTED_REQUEST')
    return null
  }

  if (!token && requireAuth) {
    jsonError(res, 401, 'Sign in before using this protected provider check.', 'AUTH_REQUIRED')
    return null
  }

  let auth = null
  if (token) {
    try {
      auth = await verifyClerkToken(token)
    } catch (error) {
      jsonError(res, 401, error.message || 'Authentication failed.', 'INVALID_AUTH_TOKEN')
      return null
    }
  }

  return { auth, ip: clientIp(req) }
}


export async function readJsonBody(req, maxBytes = 128_000) {
  const current = req?.body
  if (current && typeof current === 'object' && !Buffer.isBuffer(current)) return current

  if (typeof current === 'string' || Buffer.isBuffer(current)) {
    const text = Buffer.isBuffer(current) ? current.toString('utf8') : current
    if (Buffer.byteLength(text) > maxBytes) {
      const error = new Error('Request body is too large.')
      error.status = 413
      error.code = 'BODY_TOO_LARGE'
      throw error
    }
    return text ? JSON.parse(text) : {}
  }

  if (!req || typeof req[Symbol.asyncIterator] !== 'function') return {}
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    total += buffer.length
    if (total > maxBytes) {
      const error = new Error('Request body is too large.')
      error.status = 413
      error.code = 'BODY_TOO_LARGE'
      throw error
    }
    chunks.push(buffer)
  }
  const text = Buffer.concat(chunks).toString('utf8')
  return text ? JSON.parse(text) : {}
}

export async function fetchJsonWithTimeout(url, options = {}, timeoutMs = 12_000) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    const text = await response.text()
    let payload = null
    try { payload = text ? JSON.parse(text) : null } catch { payload = null }
    return { response, payload }
  } catch (error) {
    if (error?.name === 'AbortError') {
      const timeoutError = new Error('Provider request timed out.')
      timeoutError.code = 'PROVIDER_TIMEOUT'
      timeoutError.status = 504
      throw timeoutError
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export function providerStatus(error) {
  if (error?.code === 'MISSING_RAPIDAPI_KEY' || error?.code === 'MISSING_PROVIDER_CONFIG') return 503
  if (error?.code === 'PROVIDER_TIMEOUT') return 504
  return 502
}

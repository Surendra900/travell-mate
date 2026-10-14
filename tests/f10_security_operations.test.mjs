import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { scrubPii, captureException, captureMessage, getRecentErrors, clearErrors } from '../src/utils/errorMonitoring.js'
import { enforceRateLimit, enforceDistributedRateLimit } from '../api/_security.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('F-11: Content Security Policy in vercel.json forbids unsafe-inline scripts', () => {
  const vercelJson = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'))
  const globalHeaders = vercelJson.headers.find(h => h.source === '/(.*)')
  const cspHeader = globalHeaders.headers.find(h => h.key.toLowerCase() === 'content-security-policy')

  assert.ok(cspHeader, 'CSP header must exist')
  const cspValue = cspHeader.value

  // Verify script-src does not allow unsafe-inline
  const scriptSrcMatch = cspValue.match(/script-src\s+([^;]+)/)
  assert.ok(scriptSrcMatch, 'script-src directive must exist in CSP')
  assert.doesNotMatch(scriptSrcMatch[1], /'unsafe-inline'/, "script-src must NOT contain 'unsafe-inline'")
  assert.match(scriptSrcMatch[1], /'self'/, "script-src must contain 'self'")
})

test('F-03: PnrPredictorModal uses dynamic origin resolution', () => {
  const modalContent = fs.readFileSync(path.join(root, 'src/components/PnrPredictorModal.jsx'), 'utf8')
  assert.match(modalContent, /window\.location\?\.origin/, 'Must dynamically inspect window.location.origin')
  assert.doesNotMatch(modalContent, /Verified on TravelMate: https:\/\/travelmate-ai-flowzint\.vercel\.app\/`/, 'Must not hardcode production URL in template literal')
})

test('F-10: Rate limiting supports Upstash Redis and graceful in-memory fallback', async () => {
  // Test in-memory fallback when Upstash is not configured
  const mockReq = {
    url: '/api/recovery',
    headers: { 'x-forwarded-for': '127.0.0.1' }
  }
  const headersSet = {}
  const mockRes = {
    setHeader: (k, v) => { headersSet[k] = v }
  }

  // 1st request should pass
  const pass = await enforceRateLimit(mockReq, mockRes, 5, 1000)
  assert.equal(pass, true, 'First request should pass rate limiter')
  assert.equal(headersSet['X-RateLimit-Limit'], '5')
  assert.ok(Number(headersSet['X-RateLimit-Remaining']) <= 4)

  // Test unconfigured Upstash returns null smoothly without throwing
  const distributedResult = await enforceDistributedRateLimit('test-key', 5, 1000)
  assert.equal(distributedResult, null, 'Unconfigured Upstash should return null and fail open/fallback')
})

test('F-12: Error monitoring scrubs PII and records crash telemetry safely', () => {
  clearErrors()

  // 1. PNR scrubbing
  const pnrTest = scrubPii('Booking failed for PNR 2849102847 on train 12301')
  assert.equal(pnrTest, 'Booking failed for PNR [SCRUBBED_PNR] on train 12301')

  // 2. Phone number scrubbing
  const phoneTest = scrubPii('Contact mobile +91-9876543210 or 9876543210')
  assert.ok(!phoneTest.includes('9876543210'), 'Phone numbers must be scrubbed')
  assert.ok(phoneTest.includes('[SCRUBBED_PHONE]'))

  // 3. GPS coordinates scrubbing
  const coordsTest = scrubPii('User location: 28.6139, 77.2090 near station')
  assert.ok(!coordsTest.includes('28.6139, 77.2090'), 'GPS coordinates must be scrubbed')
  assert.ok(coordsTest.includes('[SCRUBBED_COORDS]'))

  // 4. Object scrubbing with sensitive keys
  const objTest = scrubPii({
    pnrNumber: '2849102847',
    passengerName: 'Surendra G',
    destination: 'Patna Junction',
    metadata: {
      phone: '9876543210',
      note: 'Urgent medical travel'
    }
  })
  assert.equal(objTest.pnrNumber, '[SCRUBBED_SENSITIVE]')
  assert.equal(objTest.passengerName, '[SCRUBBED_SENSITIVE]')
  assert.equal(objTest.metadata.phone, '[SCRUBBED_SENSITIVE]')
  assert.equal(objTest.destination, 'Patna Junction')

  // 5. Exception capture ring buffer
  const errorEvent = captureException(new Error('Test error with PNR 1234567890'), { pnr: '1234567890' })
  assert.equal(errorEvent.type, 'error')
  assert.ok(errorEvent.message.includes('[SCRUBBED_PNR]'))
  assert.equal(errorEvent.context.pnr, '[SCRUBBED_SENSITIVE]')

  const recent = getRecentErrors()
  assert.ok(recent.length > 0)
  assert.equal(recent[recent.length - 1].message, errorEvent.message)
})

test('F-07: Prisma scaffolding is removed and db:seed script excised from package.json', () => {
  const prismaDirExists = fs.existsSync(path.join(root, 'prisma'))
  assert.equal(prismaDirExists, false, 'prisma/ directory must not exist')

  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
  assert.equal(pkg.scripts?.['db:seed'], undefined, 'package.json must not have db:seed script')
})

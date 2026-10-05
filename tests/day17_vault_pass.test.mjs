import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  hashPin,
  generateOfflineBoardingPass,
  authenticateBiometricSimulation
} from '../src/utils/vaultPassBridge.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('Day 17: vaultPassBridge.js implements SHA-256 Quick-PIN hashing and verification logic', async () => {
  const salt = 'a1b2c3d4e5f60718'
  const pin = '4289'

  const hash1 = await hashPin(pin, salt)
  const hash2 = await hashPin(pin, salt)
  const hashOther = await hashPin('9999', salt)

  assert.equal(hash1, hash2, 'Identical PIN and salt must yield identical hash')
  assert.notEqual(hash1, hashOther, 'Different PINs must yield distinct hashes')
  assert.equal(hash1.length, 64, 'SHA-256 hash must be 64 hexadecimal characters')
})

test('Day 17: generateOfflineBoardingPass formats rich transit pass with verified PNR and emergency hotlines', () => {
  const mockPlan = {
    id: 'plan-101',
    from: 'Secunderabad',
    to: 'Visakhapatnam',
    date: '2026-10-20',
    transportMode: 'Train',
    pnrNumber: '8523910245',
    seatPreference: 'B2 - 36 (SU)',
    selectedService: {
      trainName: '12728 Godavari Superfast Express',
      code: '12728',
      departure: '17:05',
      arrival: '05:45'
    }
  }

  const pass = generateOfflineBoardingPass(mockPlan)

  assert.equal(pass.pnr, '8523910245', 'PNR must match plan')
  assert.equal(pass.from, 'Secunderabad', 'Origin must match plan')
  assert.equal(pass.to, 'Visakhapatnam', 'Destination must match plan')
  assert.equal(pass.serviceName, '12728 Godavari Superfast Express', 'Service name must be extracted')
  assert.equal(pass.departure, '17:05', 'Departure time must be present')
  assert.equal(pass.arrival, '05:45', 'Arrival time must be present')
  assert.equal(pass.berthSeat, 'B2 - 36 (SU)', 'Berth must reflect plan preference')
  assert.ok(pass.emergencyHotlines.length >= 3, 'Must include at least 3 crisis hotlines')
  assert.ok(pass.emergencyHotlines.some((h) => h.number === '139'), 'Must include 139 Rail helpline')
  assert.ok(pass.emergencyHotlines.some((h) => h.number === '112'), 'Must include 112 National SOS')
})

test('Day 17: authenticateBiometricSimulation returns verified identity payload', async () => {
  const result = await authenticateBiometricSimulation()
  assert.equal(result.success, true, 'Biometric simulation must succeed')
  assert.ok(result.method, 'Auth method must be declared')
  assert.ok(result.verifiedAt, 'Timestamp must be recorded')
})

test('Day 17: OfflinePassModal.jsx provides dialog semantics, boarding pass card, PIN, and biometric actions', () => {
  const comp = fs.readFileSync(path.join(root, 'src/components/OfflinePassModal.jsx'), 'utf8')
  assert.match(comp, /role="dialog"/, 'Must have role="dialog"')
  assert.match(comp, /aria-modal="true"/, 'Must have aria-modal="true"')
  assert.match(comp, /100% Offline Boarding Pass/, 'Must display 100% Offline Boarding Pass header')
  assert.match(comp, /data-testid="biometric-unlock-btn"/, 'Must provide 1-tap biometric unlock button')
  assert.match(comp, /data-testid="submit-quick-pin"/, 'Must provide submit-quick-pin button')
  assert.match(comp, /Rail:\s*139/, 'Must display 139 hotline')
  assert.match(comp, /SOS:\s*112/, 'Must display 112 hotline')
})

test('Day 17: SavedPlans.jsx links OfflinePassModal with Boarding Pass action buttons', () => {
  const page = fs.readFileSync(path.join(root, 'src/pages/SavedPlans.jsx'), 'utf8')
  assert.match(page, /import OfflinePassModal from '\.\.\/components\/OfflinePassModal'/, 'Must import OfflinePassModal')
  assert.match(page, /data-testid=\{`view-pass-\$\{plan\.id\}`\}/, 'Must provide view-pass testid on upcoming card')
  assert.match(page, /data-testid=\{`detail-pass-\$\{plan\.id\}`\}/, 'Must provide detail-pass testid on detailed list')
  assert.match(page, /<OfflinePassModal/, 'Must render OfflinePassModal')
})

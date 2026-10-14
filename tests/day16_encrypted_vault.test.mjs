import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('Day 16 / Master Spec §4: secureVault.js is excised per Master Spec Section 4', () => {
  const exists = fs.existsSync(path.join(root, 'src/utils/secureVault.js'))
  assert.equal(exists, false, 'secureVault.js must not exist per Master Spec §4')
})

test('Day 16 / Master Spec §4: DocumentVault.jsx is excised per Master Spec Section 4', () => {
  const exists = fs.existsSync(path.join(root, 'src/components/DocumentVault.jsx'))
  assert.equal(exists, false, 'DocumentVault.jsx must not exist')
})

test('Day 16: Zero residual references to secureVault in application components and storage', () => {
  const filesToCheck = [
    'src/App.jsx',
    'src/utils/storage.js',
    'src/components/EmergencyToolkit.jsx',
    'src/planner/LowNetworkPlanner.jsx',
    'src/pages/SavedPlans.jsx'
  ]

  for (const relPath of filesToCheck) {
    const content = fs.readFileSync(path.join(root, relPath), 'utf8')
    assert.ok(
      !content.includes('secureVault') && !content.includes('SecureVault'),
      `${relPath} must contain zero references to secureVault`
    )
  }
})

test('Day 16: Web Crypto API performs authentic AES-GCM 256 encryption and decryption cycle in runtime environment', async () => {
  // Test native Web Crypto AES-GCM 256-bit functionality
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode('TravelMatePassphrase2026'),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  const aesKey = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 1000 },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )

  const plaintext = new TextEncoder().encode('CONFIDENTIAL-TRANSIT-TOKEN')
  const additionalData = new TextEncoder().encode('travelmate-meta:transit')

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData },
    aesKey,
    plaintext
  )

  assert.ok(ciphertext.byteLength > plaintext.byteLength, 'Ciphertext must include 128-bit authentication tag')

  // Successful decryption
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv, additionalData },
    aesKey,
    ciphertext
  )
  assert.equal(new TextDecoder().decode(decrypted), 'CONFIDENTIAL-TRANSIT-TOKEN')

  // Tampered ciphertext fails authentication
  const tampered = new Uint8Array(ciphertext)
  tampered[0] ^= 0xff
  await assert.rejects(async () => {
    await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData }, aesKey, tampered)
  }, 'AES-GCM must reject tampered ciphertext with tag verification failure')
})

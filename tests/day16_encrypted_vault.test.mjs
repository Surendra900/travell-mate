import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  exportEncryptedVaultBackup,
  importEncryptedVaultBackup,
  purgeLegacyDocumentStorage,
  hasLegacyDocumentStorage
} from '../src/utils/secureVault.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('Day 16: secureVault.js defines full suite of client-side encryption and backup functions', () => {
  const fileContent = fs.readFileSync(path.join(root, 'src/utils/secureVault.js'), 'utf8')
  assert.match(fileContent, /export async function createSecureVault/, 'Must export createSecureVault')
  assert.match(fileContent, /export async function unlockSecureVault/, 'Must export unlockSecureVault')
  assert.match(fileContent, /export async function saveSecureDocument/, 'Must export saveSecureDocument')
  assert.match(fileContent, /export async function listSecureDocuments/, 'Must export listSecureDocuments')
  assert.match(fileContent, /export async function readSecureDocument/, 'Must export readSecureDocument')
  assert.match(fileContent, /export async function updateSecureDocument/, 'Must export updateSecureDocument')
  assert.match(fileContent, /export async function deleteSecureDocument/, 'Must export deleteSecureDocument')
  assert.match(fileContent, /export async function changeSecureVaultPassphrase/, 'Must export changeSecureVaultPassphrase')
  assert.match(fileContent, /export async function resetSecureVault/, 'Must export resetSecureVault')
  assert.match(fileContent, /export async function exportEncryptedVaultBackup/, 'Must export exportEncryptedVaultBackup')
  assert.match(fileContent, /export async function importEncryptedVaultBackup/, 'Must export importEncryptedVaultBackup')
})

test('Day 16: secureVault.js enforces strong cryptographic parameters (AES-GCM 256, PBKDF2 SHA-256, 310k iterations)', () => {
  const fileContent = fs.readFileSync(path.join(root, 'src/utils/secureVault.js'), 'utf8')
  assert.match(fileContent, /DEFAULT_ITERATIONS = 310_000/, 'Must specify at least 310k PBKDF2 iterations')
  assert.match(fileContent, /name:\s*['"]AES-GCM['"],\s*length:\s*256/, 'Must use AES-GCM 256-bit')
  assert.match(fileContent, /name:\s*['"]PBKDF2['"],\s*hash:\s*['"]SHA-256['"]/, 'Must use PBKDF2 with SHA-256')
  assert.match(fileContent, /iv = randomBytes\(12\)/, 'Must generate unique 12-byte IV for every encryption')
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

  const plaintext = new TextEncoder().encode('AADHAAR-9999-8888-7777-CONFIDENTIAL-TICKET')
  const additionalData = new TextEncoder().encode('travelmate-meta:aadhaar')

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
  assert.equal(new TextDecoder().decode(decrypted), 'AADHAAR-9999-8888-7777-CONFIDENTIAL-TICKET')

  // Tampered ciphertext fails authentication
  const tampered = new Uint8Array(ciphertext)
  tampered[0] ^= 0xff
  await assert.rejects(async () => {
    await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData }, aesKey, tampered)
  }, 'AES-GCM must reject tampered ciphertext with tag verification failure')
})

test('Day 16: importEncryptedVaultBackup rejects invalid or malformed payloads', async () => {
  await assert.rejects(async () => {
    await importEncryptedVaultBackup('{}')
  }, /Invalid or corrupted TravelMate encrypted vault backup format/)

  await assert.rejects(async () => {
    await importEncryptedVaultBackup({ format: 'other' })
  }, /Invalid or corrupted TravelMate encrypted vault backup format/)
})

test('Day 16: DocumentVault.jsx provides high-contrast labels, security indicators, download, and category filters', () => {
  const comp = fs.readFileSync(path.join(root, 'src/components/DocumentVault.jsx'), 'utf8')
  assert.match(comp, /AES-GCM 256-Bit/, 'Must display AES-GCM 256-bit security badge')
  assert.match(comp, /PBKDF2 \(310k iter\)/, 'Must display PBKDF2 iteration badge')
  assert.match(comp, /Zero-Cloud Local IndexedDB/, 'Must state Zero-Cloud guarantee')
  assert.match(comp, /downloadDocument/, 'Must provide downloadDocument handler')
  assert.match(comp, /data-testid="export-vault-backup"/, 'Must provide export backup button')
  assert.match(comp, /Restore encrypted backup/, 'Must offer restore backup action')
  assert.match(comp, /filterCategory/, 'Must support filtering documents by category')
  assert.match(comp, /text-slate-800/, 'Labels must have high-contrast text-slate-800')
})

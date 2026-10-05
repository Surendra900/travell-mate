const DB_NAME = 'travelmate-secure-vault'
const DB_VERSION = 1
const CONFIG_ID = 'config'
const VERIFIER = 'travelmate-secure-vault:v1'
const DEFAULT_ITERATIONS = 310_000
const COUNT_KEY = 'travelmate-secure-vault-count'
const LEGACY_KEYS = ['travelmate-document-vault', 'travelmate-document-vault-password-hash']

function assertBrowserSupport() {
  if (!globalThis.crypto?.subtle || !globalThis.indexedDB) {
    throw new Error('Secure document storage is not supported in this browser.')
  }
}

function openDatabase() {
  assertBrowserSupport()
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'id' })
      if (!db.objectStoreNames.contains('documents')) db.createObjectStore('documents', { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Could not open secure vault database.'))
  })
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error || new Error('Secure vault database operation failed.'))
  })
}

function transactionDone(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error || new Error('Secure vault transaction failed.'))
    transaction.onabort = () => reject(transaction.error || new Error('Secure vault transaction was aborted.'))
  })
}

function randomBytes(length) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return bytes
}

async function deriveKey(passphrase, salt, iterations = DEFAULT_ITERATIONS) {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

async function encryptBytes(key, bytes, context) {
  const iv = randomBytes(12)
  const additionalData = new TextEncoder().encode(context)
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData },
    key,
    bytes
  )
  return { iv, ciphertext }
}

async function decryptBytes(key, encrypted, context) {
  const additionalData = new TextEncoder().encode(context)
  return crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: encrypted.iv, additionalData },
    key,
    encrypted.ciphertext
  )
}

async function encryptJson(key, value, context) {
  const bytes = new TextEncoder().encode(JSON.stringify(value))
  return encryptBytes(key, bytes, context)
}

async function decryptJson(key, encrypted, context) {
  const bytes = await decryptBytes(key, encrypted, context)
  return JSON.parse(new TextDecoder().decode(bytes))
}

function safeId() {
  return crypto.randomUUID?.() || `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function setCount(count) {
  try { localStorage.setItem(COUNT_KEY, String(Math.max(0, Number(count) || 0))) } catch {}
}

export function getSecureVaultDocumentCount() {
  try { return Math.max(0, Number(localStorage.getItem(COUNT_KEY) || 0)) } catch { return 0 }
}

export function hasLegacyDocumentStorage() {
  try { return LEGACY_KEYS.some((key) => Boolean(localStorage.getItem(key))) } catch { return false }
}

export function purgeLegacyDocumentStorage() {
  let removed = false
  try {
    for (const key of LEGACY_KEYS) {
      if (localStorage.getItem(key) !== null) removed = true
      localStorage.removeItem(key)
    }
  } catch {}
  return removed
}

export async function secureVaultExists() {
  const db = await openDatabase()
  try {
    const transaction = db.transaction('meta', 'readonly')
    return Boolean(await requestResult(transaction.objectStore('meta').get(CONFIG_ID)))
  } finally {
    db.close()
  }
}

export async function createSecureVault(passphrase) {
  if (String(passphrase || '').length < 8) throw new Error('Use at least 8 characters for the vault passphrase.')
  const db = await openDatabase()
  try {
    const existingTransaction = db.transaction('meta', 'readonly')
    if (await requestResult(existingTransaction.objectStore('meta').get(CONFIG_ID))) {
      throw new Error('A secure vault already exists on this device.')
    }

    const salt = randomBytes(16)
    const key = await deriveKey(passphrase, salt, DEFAULT_ITERATIONS)
    const verifier = await encryptBytes(key, new TextEncoder().encode(VERIFIER), 'vault-verifier')
    const transaction = db.transaction('meta', 'readwrite')
    transaction.objectStore('meta').put({ id: CONFIG_ID, version: 1, salt, iterations: DEFAULT_ITERATIONS, verifier })
    await transactionDone(transaction)
    setCount(0)
    return key
  } finally {
    db.close()
  }
}

export async function unlockSecureVault(passphrase) {
  const db = await openDatabase()
  try {
    const transaction = db.transaction('meta', 'readonly')
    const config = await requestResult(transaction.objectStore('meta').get(CONFIG_ID))
    if (!config) throw new Error('No secure vault exists on this device.')
    const key = await deriveKey(passphrase, config.salt, config.iterations)
    try {
      const plaintext = await decryptBytes(key, config.verifier, 'vault-verifier')
      if (new TextDecoder().decode(plaintext) !== VERIFIER) throw new Error('Invalid vault passphrase.')
      return key
    } catch {
      throw new Error('Incorrect vault passphrase.')
    }
  } finally {
    db.close()
  }
}

export async function listSecureDocuments(key) {
  const db = await openDatabase()
  try {
    const transaction = db.transaction('documents', 'readonly')
    const records = await requestResult(transaction.objectStore('documents').getAll())
    const documents = []
    for (const record of records) {
      try {
        const metadata = await decryptJson(key, record.metadata, `document-meta:${record.id}`)
        documents.push({ id: record.id, ...metadata })
      } catch {
        documents.push({ id: record.id, name: 'Unreadable encrypted document', category: 'Recovery required', note: '', size: 0, type: '', timestamp: record.createdAt, corrupted: true })
      }
    }
    documents.sort((a, b) => String(b.timestamp || '').localeCompare(String(a.timestamp || '')))
    setCount(documents.length)
    return documents
  } finally {
    db.close()
  }
}

export async function saveSecureDocument(key, file, { category, note = '', label = '' }) {
  if (!(file instanceof File)) throw new Error('Choose a valid document file.')
  if (file.size > 5 * 1024 * 1024) throw new Error('Keep each encrypted document below 5 MB.')
  const id = safeId()
  const timestamp = new Date().toISOString()
  const safeLabel = String(label || category || 'Important document').replace(/[\\/:*?"<>|]+/g, '-').trim() || 'Important document'
  const extension = file.name.match(/\.[A-Za-z0-9]+$/)?.[0] || ''
  const metadataValue = {
    name: `${safeLabel}${extension}`,
    originalName: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    category: safeLabel,
    note: String(note || '').slice(0, 500),
    timestamp
  }
  const [metadata, contents] = await Promise.all([
    encryptJson(key, metadataValue, `document-meta:${id}`),
    encryptBytes(key, await file.arrayBuffer(), `document-file:${id}`)
  ])

  const db = await openDatabase()
  try {
    const transaction = db.transaction('documents', 'readwrite')
    transaction.objectStore('documents').put({ id, createdAt: timestamp, metadata, contents })
    await transactionDone(transaction)
    const docs = await listSecureDocuments(key)
    return docs.find((item) => item.id === id)
  } finally {
    db.close()
  }
}

export async function readSecureDocument(key, id) {
  const db = await openDatabase()
  try {
    const transaction = db.transaction('documents', 'readonly')
    const record = await requestResult(transaction.objectStore('documents').get(id))
    if (!record) throw new Error('Encrypted document was not found.')
    const [metadata, bytes] = await Promise.all([
      decryptJson(key, record.metadata, `document-meta:${id}`),
      decryptBytes(key, record.contents, `document-file:${id}`)
    ])
    return { metadata, blob: new Blob([bytes], { type: metadata.type || 'application/octet-stream' }) }
  } finally {
    db.close()
  }
}

export async function updateSecureDocument(key, id, fields = {}) {
  const db = await openDatabase()
  try {
    const readTransaction = db.transaction('documents', 'readonly')
    const record = await requestResult(readTransaction.objectStore('documents').get(id))
    if (!record) throw new Error('Encrypted document was not found.')
    const current = await decryptJson(key, record.metadata, `document-meta:${id}`)
    const updated = {
      ...current,
      ...fields,
      name: String(fields.name ?? current.name).replace(/[\\/:*?"<>|]+/g, '-').trim() || current.name,
      category: String(fields.category ?? current.category).replace(/[\\/:*?"<>|]+/g, '-').trim() || current.category,
      note: String(fields.note ?? current.note).slice(0, 500)
    }
    record.metadata = await encryptJson(key, updated, `document-meta:${id}`)
    const writeTransaction = db.transaction('documents', 'readwrite')
    writeTransaction.objectStore('documents').put(record)
    await transactionDone(writeTransaction)
    return listSecureDocuments(key)
  } finally {
    db.close()
  }
}

export async function deleteSecureDocument(key, id) {
  if (!key) throw new Error('Unlock the secure vault before deleting a document.')
  const db = await openDatabase()
  try {
    const transaction = db.transaction('documents', 'readwrite')
    transaction.objectStore('documents').delete(id)
    await transactionDone(transaction)
    return listSecureDocuments(key)
  } finally {
    db.close()
  }
}

export async function changeSecureVaultPassphrase(currentKey, newPassphrase) {
  if (String(newPassphrase || '').length < 8) throw new Error('Use at least 8 characters for the new passphrase.')
  const db = await openDatabase()
  try {
    const readTransaction = db.transaction(['meta', 'documents'], 'readonly')
    const configRequest = readTransaction.objectStore('meta').get(CONFIG_ID)
    const recordsRequest = readTransaction.objectStore('documents').getAll()
    const [config, records] = await Promise.all([
      requestResult(configRequest),
      requestResult(recordsRequest)
    ])
    if (!config) throw new Error('No secure vault exists on this device.')

    const plaintextRecords = []
    for (const record of records) {
      const [metadata, contents] = await Promise.all([
        decryptBytes(currentKey, record.metadata, `document-meta:${record.id}`),
        decryptBytes(currentKey, record.contents, `document-file:${record.id}`)
      ])
      plaintextRecords.push({ record, metadata, contents })
    }

    const salt = randomBytes(16)
    const newKey = await deriveKey(newPassphrase, salt, DEFAULT_ITERATIONS)
    const verifier = await encryptBytes(newKey, new TextEncoder().encode(VERIFIER), 'vault-verifier')
    const reencrypted = []
    for (const item of plaintextRecords) {
      const [metadata, contents] = await Promise.all([
        encryptBytes(newKey, item.metadata, `document-meta:${item.record.id}`),
        encryptBytes(newKey, item.contents, `document-file:${item.record.id}`)
      ])
      reencrypted.push({ ...item.record, metadata, contents })
    }

    const writeTransaction = db.transaction(['meta', 'documents'], 'readwrite')
    writeTransaction.objectStore('meta').put({ id: CONFIG_ID, version: 1, salt, iterations: DEFAULT_ITERATIONS, verifier })
    const store = writeTransaction.objectStore('documents')
    for (const record of reencrypted) store.put(record)
    await transactionDone(writeTransaction)
    return newKey
  } finally {
    db.close()
  }
}

export async function resetSecureVault() {
  await new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error || new Error('Could not reset secure vault.'))
    request.onblocked = () => reject(new Error('Close other TravelMate tabs before resetting the vault.'))
  })
  setCount(0)
}

function toBase64(bytes) {
  const binary = Array.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes))
    .map((b) => String.fromCharCode(b))
    .join('')
  return btoa(binary)
}

function fromBase64(str) {
  const binary = atob(str)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export async function exportEncryptedVaultBackup() {
  const db = await openDatabase()
  try {
    const transaction = db.transaction(['meta', 'documents'], 'readonly')
    const config = await requestResult(transaction.objectStore('meta').get(CONFIG_ID))
    if (!config) throw new Error('No secure vault to export.')
    const records = await requestResult(transaction.objectStore('documents').getAll())

    const backup = {
      format: 'travelmate-encrypted-vault-backup:v1',
      exportedAt: new Date().toISOString(),
      config: {
        id: config.id,
        version: config.version,
        iterations: config.iterations,
        salt: toBase64(config.salt),
        verifier: {
          iv: toBase64(config.verifier.iv),
          ciphertext: toBase64(config.verifier.ciphertext)
        }
      },
      documents: records.map((doc) => ({
        id: doc.id,
        createdAt: doc.createdAt,
        metadata: {
          iv: toBase64(doc.metadata.iv),
          ciphertext: toBase64(doc.metadata.ciphertext)
        },
        contents: {
          iv: toBase64(doc.contents.iv),
          ciphertext: toBase64(doc.contents.ciphertext)
        }
      }))
    }
    return JSON.stringify(backup, null, 2)
  } finally {
    db.close()
  }
}

export async function importEncryptedVaultBackup(backupJsonString) {
  const backup = typeof backupJsonString === 'string' ? JSON.parse(backupJsonString) : backupJsonString
  if (backup.format !== 'travelmate-encrypted-vault-backup:v1' || !backup.config) {
    throw new Error('Invalid or corrupted TravelMate encrypted vault backup format.')
  }

  const db = await openDatabase()
  try {
    const transaction = db.transaction(['meta', 'documents'], 'readwrite')
    const metaStore = transaction.objectStore('meta')
    const docStore = transaction.objectStore('documents')

    const config = {
      id: backup.config.id || CONFIG_ID,
      version: backup.config.version || 1,
      iterations: backup.config.iterations || DEFAULT_ITERATIONS,
      salt: fromBase64(backup.config.salt),
      verifier: {
        iv: fromBase64(backup.config.verifier.iv),
        ciphertext: fromBase64(backup.config.verifier.ciphertext).buffer
      }
    }
    metaStore.put(config)

    for (const doc of backup.documents || []) {
      const record = {
        id: doc.id,
        createdAt: doc.createdAt,
        metadata: {
          iv: fromBase64(doc.metadata.iv),
          ciphertext: fromBase64(doc.metadata.ciphertext).buffer
        },
        contents: {
          iv: fromBase64(doc.contents.iv),
          ciphertext: fromBase64(doc.contents.ciphertext).buffer
        }
      }
      docStore.put(record)
    }

    await transactionDone(transaction)
    setCount(backup.documents?.length || 0)
    return { documentCount: backup.documents?.length || 0 }
  } finally {
    db.close()
  }
}


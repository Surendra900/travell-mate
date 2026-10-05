const DPDP_KEY = 'travelmate-dpdp-consent'
const memoryStore = new Map()

function getStorage() {
  if (typeof localStorage !== 'undefined') return localStorage
  return {
    getItem: (k) => memoryStore.get(k) ?? null,
    setItem: (k, v) => memoryStore.set(k, String(v)),
    removeItem: (k) => memoryStore.delete(k),
    clear: () => memoryStore.clear()
  }
}

export const DEFAULT_CONSENT = {
  essential_storage: true, // mandatory for client-side cryptographic store
  emergency_telemetry: true, // GPS location during SOS calls
  ai_translation: true, // SambaNova cloud translation
  voice_processing: true, // In-browser speech synthesis and recognition
  updatedAt: new Date().toISOString()
}

export function getDpdpConsent() {
  try {
    const raw = getStorage().getItem(DPDP_KEY)
    if (!raw) return { ...DEFAULT_CONSENT }
    return { ...DEFAULT_CONSENT, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_CONSENT }
  }
}

export function updateDpdpConsent(updates = {}) {
  try {
    const current = getDpdpConsent()
    const next = {
      ...current,
      ...updates,
      essential_storage: true, // essential storage cannot be disabled without wiping app
      updatedAt: new Date().toISOString()
    }
    getStorage().setItem(DPDP_KEY, JSON.stringify(next))
    return next
  } catch (err) {
    console.error('Failed to update DPDP consent:', err)
    return DEFAULT_CONSENT
  }
}

export async function purgeAllUserData() {
  const result = {
    localStorageCleared: false,
    indexedDbDeleted: false,
    timestamp: new Date().toISOString()
  }

  try {
    // 1. Purge all localStorage
    getStorage().clear()
    result.localStorageCleared = true
  } catch (err) {
    console.error('Failed to clear localStorage:', err)
  }

  try {
    // 2. Purge sessionStorage
    sessionStorage.clear()
  } catch {}

  try {
    // 3. Delete secure document IndexedDB database
    if (typeof indexedDB !== 'undefined') {
      await new Promise((resolve) => {
        const req = indexedDB.deleteDatabase('travelmate-secure-vault')
        req.onsuccess = () => resolve(true)
        req.onerror = () => resolve(false)
        req.onblocked = () => resolve(false)
      })
      result.indexedDbDeleted = true
    }
  } catch (err) {
    console.error('Failed to delete IndexedDB:', err)
  }

  return result
}

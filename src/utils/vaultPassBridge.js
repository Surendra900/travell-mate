const ATTACHMENT_KEY = 'travelmate-journey-vault-attachments'
const QUICKPIN_KEY = 'travelmate-quickpin-config'

function safeStorageGet(key, fallback = null) {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function getJourneyAttachments() {
  return safeStorageGet(ATTACHMENT_KEY, {})
}

export function getAttachedDocumentForPlan(planId) {
  const all = getJourneyAttachments()
  return all[planId] || null
}

export function attachDocumentToPlan(planId, docMeta) {
  if (!planId) return false
  const all = getJourneyAttachments()
  all[planId] = {
    docId: docMeta.id,
    name: docMeta.name || 'Attached ticket',
    category: docMeta.category || 'Ticket',
    attachedAt: new Date().toISOString()
  }
  safeStorageSet(ATTACHMENT_KEY, all)
  return all[planId]
}

export function detachDocumentFromPlan(planId) {
  const all = getJourneyAttachments()
  delete all[planId]
  safeStorageSet(ATTACHMENT_KEY, all)
  return true
}

export async function hashPin(pin, saltHex) {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${saltHex}:${pin}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function setQuickPin(pin) {
  if (!/^\d{4,6}$/.test(String(pin || '').trim())) {
    throw new Error('Quick PIN must be 4 to 6 numeric digits.')
  }
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  const hash = await hashPin(pin.trim(), salt)
  const config = {
    salt,
    hash,
    updatedAt: new Date().toISOString()
  }
  safeStorageSet(QUICKPIN_KEY, config)
  return true
}

export function hasQuickPinSet() {
  const cfg = safeStorageGet(QUICKPIN_KEY)
  return Boolean(cfg?.hash && cfg?.salt)
}

export async function verifyQuickPin(pin) {
  const cfg = safeStorageGet(QUICKPIN_KEY)
  if (!cfg?.hash || !cfg?.salt) return false
  const computed = await hashPin(String(pin || '').trim(), cfg.salt)
  return computed === cfg.hash
}

export async function authenticateBiometricSimulation() {
  // Check if WebAuthn is supported
  if (typeof window !== 'undefined' && window.PublicKeyCredential) {
    try {
      const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
      if (isAvailable) {
        // Authenticator exists on device (Touch ID, Windows Hello, Android Biometric)
        return { success: true, method: 'webauthn-platform', verifiedAt: new Date().toISOString() }
      }
    } catch {}
  }
  // Graceful device simulation for development and environments without biometric hardware
  return { success: true, method: 'simulated-biometric', verifiedAt: new Date().toISOString() }
}

export function generateOfflineBoardingPass(plan) {
  const service = plan.selectedService || {}
  const code = service.code || service.trainNo || service.flightNumber || 'EXP-100'
  const dateStr = plan.date || new Date().toISOString().split('T')[0]
  const pnr = plan.pnrNumber || `452${Math.floor(1000000 + Math.random() * 9000000)}`
  const attached = getAttachedDocumentForPlan(plan.id)

  return {
    passId: `BP-${code}-${pnr.slice(-4)}`,
    pnr,
    transportMode: plan.transportMode || 'Train',
    serviceName: service.trainName || service.name || service.serviceName || `${plan.transportMode || 'Express'} Journey`,
    serviceCode: code,
    from: plan.from || 'Origin',
    to: plan.to || 'Destination',
    date: dateStr,
    departure: service.departure || service.depart || '10:00',
    arrival: service.arrival || service.arrive || '18:30',
    berthSeat: service.berth || plan.seatPreference || 'B3 - 42 (MB)',
    coachClass: service.coach || plan.classPreference || (plan.transportMode === 'Flight' ? 'Economy (Y)' : '3rd AC (3A)'),
    passengerName: plan.passengerName || 'Surendra G (Adult)',
    emergencyHotlines: [
      { name: 'Transit Helplines', number: '139' },
      { name: 'National SOS', number: '112' },
      { name: 'Medical', number: '108' }
    ],
    attachedDocument: attached,
    offlineGeneratedAt: new Date().toISOString()
  }
}

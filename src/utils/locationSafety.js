const LOCATION_KEY = 'travelmate-last-location'
const CONSENT_KEY = 'travelmate-location-onboarding'

function safeStorageGet(key) {
  try { return localStorage.getItem(key) } catch { return null }
}

function safeStorageSet(key, value) {
  try { localStorage.setItem(key, value) } catch {}
}

export function getLocationOnboardingChoice() {
  return safeStorageGet(CONSENT_KEY) || ''
}

export function setLocationOnboardingChoice(choice) {
  safeStorageSet(CONSENT_KEY, choice)
}

export function getCachedEmergencyLocation(maxAgeMs = 30 * 60 * 1000) {
  try {
    const cached = JSON.parse(safeStorageGet(LOCATION_KEY) || 'null')
    if (!cached || !Number.isFinite(cached.latitude) || !Number.isFinite(cached.longitude)) return null
    const capturedAt = Date.parse(cached.capturedAt || '')
    if (!Number.isFinite(capturedAt) || Date.now() - capturedAt > maxAgeMs) return null
    return cached
  } catch {
    return null
  }
}

export function locationMapUrl(latitude, longitude) {
  return `https://maps.google.com/?q=${Number(latitude).toFixed(6)},${Number(longitude).toFixed(6)}`
}

export function formatEmergencyLocation(location) {
  if (!location) return 'Current GPS location is unavailable. Please share the nearest landmark manually.'
  const accuracy = Number.isFinite(location.accuracy) ? ` (accuracy about ${Math.round(location.accuracy)} m)` : ''
  const time = location.capturedAt ? `; captured ${new Date(location.capturedAt).toLocaleString()}` : ''
  return `${location.mapUrl || locationMapUrl(location.latitude, location.longitude)}${accuracy}${time}`
}

export async function queryLocationPermission() {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) return 'unknown'
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' })
    return permission.state || 'unknown'
  } catch {
    return 'unknown'
  }
}

export function requestEmergencyLocation(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 12000,
    maximumAge = 30000
  } = options

  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve({ ok: false, reason: 'unsupported', location: getCachedEmergencyLocation() })
      return
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const location = {
        latitude: Number(position.coords.latitude),
        longitude: Number(position.coords.longitude),
        accuracy: Number(position.coords.accuracy),
        capturedAt: new Date(position.timestamp || Date.now()).toISOString()
      }
      location.mapUrl = locationMapUrl(location.latitude, location.longitude)
      safeStorageSet(LOCATION_KEY, JSON.stringify(location))
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('travelmate:location-updated', { detail: location }))
      }
      resolve({ ok: true, reason: 'captured', location })
    }, (error) => {
      const reason = error?.code === 1 ? 'denied' : error?.code === 3 ? 'timeout' : 'unavailable'
      resolve({ ok: false, reason, location: getCachedEmergencyLocation() })
    }, { enableHighAccuracy, timeout, maximumAge })
  })
}

export async function refreshLocationWhenAlreadyAllowed() {
  const state = await queryLocationPermission()
  if (state !== 'granted') return { ok: false, reason: state, location: getCachedEmergencyLocation() }
  return requestEmergencyLocation({ maximumAge: 60000 })
}

export function getCurrentTripContext() {
  try {
    const plan = JSON.parse(safeStorageGet('travelmate-current-plan') || 'null')
    if (!plan) return ''
    const from = String(plan.from || '').trim()
    const to = String(plan.to || '').trim()
    if (!from && !to) return ''
    const mode = String(plan.transportMode || 'Travel').trim()
    return `${mode}: ${from || 'Not set'} → ${to || 'Not set'}`
  } catch {
    return ''
  }
}

export function buildEmergencyAlert({ emergencyType, location, contacts = [], tripContext = '' }) {
  const contactText = contacts.length
    ? contacts.map((item) => `${item.name} (${item.phone})`).join(', ')
    : 'None saved'

  return [
    'EMERGENCY ALERT',
    `Type: ${emergencyType || 'General emergency'}`,
    `Current location: ${formatEmergencyLocation(location)}`,
    tripContext ? `Travel plan: ${tripContext}` : '',
    'Emergency number India: 112',
    'Ambulance: 108',
    `Saved contacts: ${contactText}`,
    'Please call me and help me reach official emergency support.'
  ].filter(Boolean).join('\n')
}

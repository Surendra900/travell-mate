import { emergencyCards, emergencyNumber } from '../data/emergencyData'
import { calculatePlanQualityScore, scoreBreakdown } from './scoring'
import { coverageNotice, getServiceOptions, transportPlaces } from '../data/transportData'

const PLAN_KEY = 'travelmate-plans'
const OFFLINE_KEY = 'travelmate-offline-pack'
const LOADED_PLAN_KEY = 'travelmate-loaded-plan'

function safeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function selectedServiceSnapshot(plan = {}) {
  const service = plan.selectedService
  if (!service || typeof service !== 'object') return null

  const transport = plan.transportMode || plan.transport || 'Train'
  const serviceName = service.serviceName || service.service || service.name || service.trainName || service.operator || `${transport} option`
  const serviceCode = service.code || service.trainNo || service.trainNumber || service.flightNumber || service.serviceNumber || ''
  const departure = service.departure || service.depart || service.departureTime || ''
  const arrival = service.arrival || service.arrive || service.arrivalTime || ''

  return {
    id: service.id || serviceCode || serviceName,
    serviceName,
    service: service.service || serviceName,
    name: service.name || serviceName,
    code: serviceCode,
    trainName: service.trainName || (transport === 'Train' ? serviceName : ''),
    trainNumber: service.trainNumber || service.trainNo || (transport === 'Train' ? serviceCode : ''),
    trainNo: service.trainNo || service.trainNumber || (transport === 'Train' ? serviceCode : ''),
    flightNumber: service.flightNumber || (transport === 'Flight' ? serviceCode : ''),
    operator: service.operator || '',
    from: service.from || service.source || plan.from || '',
    to: service.to || service.destination || plan.to || '',
    departure,
    depart: service.depart || departure,
    arrival,
    arrive: service.arrive || arrival,
    duration: service.duration || service.travelTime || '',
    fare: service.fare ?? service.price ?? service.amount ?? null,
    price: service.price ?? service.fare ?? service.amount ?? null,
    status: service.status || service.availability || 'Provider verification required',
    availability: service.availability || service.status || '',
    provider: service.provider || plan.selectedProvider || '',
    sourceBadge: service.sourceBadge || plan.sourceBadge || 'Saved provider result',
    verification: service.verification || plan.liveVerification || ''
  }
}

function normalizedPnr(value) {
  const digits = String(value || '').replace(/\D/g, '').slice(0, 10)
  return /^\d{10}$/.test(digits) ? digits : ''
}

function usefulProviderValue(value) {
  const text = String(value ?? '').trim()
  if (!text || /^not returned$/i.test(text)) return ''
  return text
}

function pnrStatusSnapshot(value, pnrNumber) {
  if (!value || typeof value !== 'object') return null

  const statusPnr = normalizedPnr(value.pnrNumber || pnrNumber)
  if (!statusPnr || (pnrNumber && statusPnr !== pnrNumber)) return null

  return {
    pnrNumber: statusPnr,
    trainNumber: usefulProviderValue(value.trainNumber),
    trainName: usefulProviderValue(value.trainName),
    from: usefulProviderValue(value.from),
    to: usefulProviderValue(value.to),
    journeyDate: usefulProviderValue(value.journeyDate),
    chartStatus: value.chartStatus ?? '',
    bookingStatus: usefulProviderValue(value.bookingStatus),
    currentStatus: usefulProviderValue(value.currentStatus),
    passengers: Array.isArray(value.passengers)
      ? value.passengers.slice(0, 20).map((passenger, index) => ({
          serial: passenger?.serial ?? index + 1,
          bookingStatus: usefulProviderValue(passenger?.bookingStatus),
          currentStatus: usefulProviderValue(passenger?.currentStatus),
          coach: usefulProviderValue(passenger?.coach),
          berth: usefulProviderValue(passenger?.berth)
        }))
      : [],
    sourceBadge: usefulProviderValue(value.sourceBadge) || 'Saved PNR status',
    checkedAt: usefulProviderValue(value.checkedAt) || new Date().toISOString()
  }
}

function pnrFromPlan(plan = {}) {
  return normalizedPnr(
    plan.pnrNumber ||
    plan.pnr ||
    plan.booking?.pnrNumber ||
    plan.booking?.pnr ||
    plan.ticket?.pnrNumber ||
    plan.ticket?.pnr
  )
}

function serviceFromPnrResult(plan, result) {
  if (plan.selectedService) return plan.selectedService

  const trainNumber = usefulProviderValue(result?.trainNumber)
  const trainName = usefulProviderValue(result?.trainName)
  if (!trainNumber && !trainName) return null

  return {
    id: trainNumber || trainName,
    serviceName: trainName || 'Booked train',
    service: trainName || 'Booked train',
    name: trainName || 'Booked train',
    code: trainNumber,
    trainName,
    trainNumber,
    trainNo: trainNumber,
    from: usefulProviderValue(result?.from) || plan.from || '',
    to: usefulProviderValue(result?.to) || plan.to || '',
    status: usefulProviderValue(result?.currentStatus) || usefulProviderValue(result?.bookingStatus) || 'PNR status saved',
    availability: usefulProviderValue(result?.currentStatus),
    provider: 'RapidAPI IRCTC PNR Status',
    sourceBadge: usefulProviderValue(result?.sourceBadge) || 'Live PNR API result',
    verification: 'PNR status was saved from the configured provider. Verify final status with Indian Railways before travel.'
  }
}

export function getSavedPlans() {
  try {
    return JSON.parse(localStorage.getItem(PLAN_KEY)) || []
  } catch {
    return []
  }
}

export function savePlan(plan) {
  const current = getSavedPlans()
  const selectedService = selectedServiceSnapshot(plan)
  const pnrNumber = pnrFromPlan(plan)
  const rawPnrStatus = plan.pnrStatus || plan.booking?.pnrStatus || plan.ticket?.pnrStatus
  const pnrStatus = pnrNumber ? pnrStatusSnapshot(rawPnrStatus, pnrNumber) : null

  const normalized = {
    id: plan.id || safeId(),
    from: plan.from || '',
    to: plan.to || '',
    transportMode: plan.transportMode || plan.transport || 'Train',
    routeCombo: plan.routeCombo || `${plan.transportMode || 'Train'} only`,
    airline: plan.airline || 'All',
    date: plan.date || '',
    ticketType: plan.ticketType || plan.quota || 'Normal',
    quota: plan.quota || plan.ticketType || 'Normal',
    classType: plan.classType || 'Sleeper',
    passengers: Number(plan.passengers || 1),
    budget: Number(plan.budget || 0),
    readinessScore: Number(plan.readinessScore || 0),
    travelScore: Number(plan.travelScore || 0),
    planQualityScore: calculatePlanQualityScore(plan),
    scoreBreakdown: scoreBreakdown(plan),
    serviceOptions: getServiceOptions(plan),
    selectedService,
    selectedServiceName: selectedService?.serviceName || plan.selectedServiceName || '',
    selectedServiceCode: selectedService?.code || plan.selectedServiceCode || '',
    selectedProvider: selectedService?.provider || plan.selectedProvider || '',
    sourceBadge: selectedService?.sourceBadge || plan.sourceBadge || '',
    pnrNumber,
    pnrStatus,
    pnrStatusUpdatedAt: pnrStatus?.checkedAt || '',
    bookingReference: plan.bookingReference || plan.booking?.reference || plan.ticket?.reference || '',
    bookingStatus: plan.bookingStatus || plan.booking?.status || plan.ticket?.status || '',
    mode: plan.mode || 'normal',
    timestamp: new Date().toISOString()
  }

  localStorage.setItem(PLAN_KEY, JSON.stringify([normalized, ...current.filter((item) => item.id !== normalized.id)].slice(0, 20)))
  return normalized
}

export function updateSavedPlan(id, changes = {}) {
  const existing = getSavedPlans().find((plan) => plan.id === id)
  if (!existing) return null
  return savePlan({ ...existing, ...changes, id })
}

export function attachPnrStatus(plan = {}, result = {}) {
  const pnrNumber = normalizedPnr(result.pnrNumber || plan.pnrNumber || plan.pnr)
  if (!pnrNumber) return null

  const status = pnrStatusSnapshot({ ...result, pnrNumber, checkedAt: new Date().toISOString() }, pnrNumber)
  const selectedService = serviceFromPnrResult(plan, result)
  const changes = {
    ...plan,
    from: plan.from || usefulProviderValue(result.from),
    to: plan.to || usefulProviderValue(result.to),
    transportMode: 'Train',
    routeCombo: 'Train only',
    selectedService,
    pnrNumber,
    pnrStatus: status,
    pnrStatusUpdatedAt: status?.checkedAt || ''
  }

  return plan.id ? updateSavedPlan(plan.id, changes) : savePlan(changes)
}

export function deletePlan(id) {
  const updated = getSavedPlans().filter((plan) => plan.id !== id)
  localStorage.setItem(PLAN_KEY, JSON.stringify(updated))
  return updated
}

export function setLoadedPlan(plan) {
  localStorage.setItem(LOADED_PLAN_KEY, JSON.stringify(plan))
}

export function consumeLoadedPlan() {
  try {
    const plan = JSON.parse(localStorage.getItem(LOADED_PLAN_KEY))
    localStorage.removeItem(LOADED_PLAN_KEY)
    return plan
  } catch {
    return null
  }
}

export function saveOfflinePack() {
  const savedRoutes = getSavedPlans().filter((plan) => plan.selectedService)
  const payload = {
    emergencyNumber,
    emergencyCards: emergencyCards.map(({ id, title, summary, number, importantPoints }) => ({
      id,
      title,
      summary,
      number,
      importantPoints
    })),
    savedRoutes,
    serviceCoverageNotice: coverageNotice,
    transportPlaces: transportPlaces.map(({ city, train, airport, bus, aliases }) => ({ city, train, airport, bus, aliases })),
    currentRouteServices: savedRoutes.slice(0, 6).map((plan) => ({
      route: `${plan.from} → ${plan.to}`,
      selectedService: plan.selectedService || null,
      pnrNumber: plan.pnrNumber || '',
      pnrStatus: plan.pnrStatus || null,
      options: getServiceOptions(plan)
    })),
    generatedAt: new Date().toISOString(),
    notice: 'Offline pack contains emergency guidance and saved-route snapshots only.',
    savedAt: new Date().toISOString()
  }
  localStorage.setItem(OFFLINE_KEY, JSON.stringify(payload))
  return payload
}

export function getOfflinePack() {
  try {
    return JSON.parse(localStorage.getItem(OFFLINE_KEY))
  } catch {
    return null
  }
}

export function clearUserScopedLocalData() {
  const exactKeys = [
    PLAN_KEY,
    OFFLINE_KEY,
    LOADED_PLAN_KEY,
    'travelmate-user-profile',
    'travelmate-emergency-contacts',
    'travelmate-pending-voice-command',
    'travelmate-last-sos-click',
    'travelmate-current-plan',
    'travelmate-last-location',
    'travelmate-location-onboarding'
  ]
  for (const key of exactKeys) {
    try { localStorage.removeItem(key) } catch {}
  }
  try {
    for (let index = sessionStorage.length - 1; index >= 0; index -= 1) {
      const key = sessionStorage.key(index)
      if (key?.startsWith('saferoute-otp-session:')) sessionStorage.removeItem(key)
    }
  } catch {}
  window.dispatchEvent(new Event('travelmate:lock-vault'))
}

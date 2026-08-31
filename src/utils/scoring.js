import { buildComboLegs, findTransportPlace, getServiceOptions, routeCombos, servicesForMode } from '../data/transportData'
import { routeDistanceKm } from './travelMath'

export function calculateTatkalReadiness(items) {
  const values = Object.values(items || {})
  if (!values.length) return 0
  const completed = values.filter(Boolean).length
  return Math.round((completed / values.length) * 100)
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

function routeHash(plan = {}) {
  const text = `${plan.from || ''}|${plan.to || ''}|${plan.transportMode || ''}`.toLowerCase()
  let hash = 0
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash) + text.charCodeAt(i)
  return Math.abs(hash)
}

function routeSpecificAdjustment(plan = {}, spread = 8) {
  if (!plan.from || !plan.to) return 0
  return (routeHash(plan) % (spread * 2 + 1)) - spread
}

export function estimatePrice({ distance = 0, passengers = 1, classType = '', urgency = 'Normal', transportMode = 'Train' }) {
  const km = Math.max(0, Number(distance) || 0)
  const people = Math.max(1, Number(passengers) || 1)
  const mode = String(transportMode || 'Train')
  const cabin = String(classType || '').toLowerCase()
  const urgent = /emergency|tatkal|urgent/i.test(String(urgency || ''))

  const modeEstimate = mode === 'Flight'
    ? 1800 + (km * 4.2)
    : mode === 'Bus'
      ? 150 + (km * 1.1)
      : 100 + (km * 0.55)

  let cabinMultiplier = 1
  if (mode === 'Flight') {
    if (cabin.includes('first')) cabinMultiplier = 3.2
    else if (cabin.includes('business')) cabinMultiplier = 2.4
    else if (cabin.includes('premium')) cabinMultiplier = 1.35
  } else if (mode === 'Train') {
    if (cabin.includes('first') || cabin.includes('1a')) cabinMultiplier = 3.6
    else if (cabin.includes('2a') || cabin.includes('ac 2')) cabinMultiplier = 2.25
    else if (cabin.includes('3a') || cabin.includes('3e') || cabin.includes('ac 3')) cabinMultiplier = 1.55
    else if (cabin.includes('chair') || cabin.includes('cc')) cabinMultiplier = 1.25
    else if (cabin.includes('general') || cabin.includes('unreserved')) cabinMultiplier = 0.55
  } else if (mode === 'Bus') {
    if (cabin.includes('volvo') || cabin.includes('scania') || cabin.includes('premium')) cabinMultiplier = 1.55
    else if (cabin.includes('ac sleeper')) cabinMultiplier = 1.45
    else if (cabin.includes('sleeper')) cabinMultiplier = 1.25
    else if (cabin.includes('ordinary') || cabin.includes('local')) cabinMultiplier = 0.7
  }

  return Math.max(0, Math.round(modeEstimate * cabinMultiplier * people * (urgent ? 1.15 : 1)))
}

export function estimateCarbonKg({ distance = 1000, mode = 'Train', passengers = 1 }) {
  const factors = { Train: 0.04, Bus: 0.08, Flight: 0.18 }
  return Math.round(distance * (factors[mode] || 0.06) * passengers)
}

function budgetFitScore(plan = {}) {
  const budget = Number(plan.budget || 0)
  if (!budget) return 45
  const service = servicesForMode(plan, plan.transportMode)[0]
  const distance = routeDistanceKm(plan.from, plan.to)
  const expected = service?.fare || estimatePrice({ distance: distance || 1000, passengers: plan.passengers, classType: plan.classType, urgency: plan.urgency, transportMode: plan.transportMode })
  if (expected <= budget) return clamp(94 + routeSpecificAdjustment(plan, 4), 82, 100)
  const over = expected - budget
  return clamp(100 - (over / Math.max(budget, 1)) * 80 + routeSpecificAdjustment(plan, 5), 25, 96)
}

function routeCompleteness(plan = {}) {
  let score = 0
  if (findTransportPlace(plan.from) || plan.from) score += 18
  if (findTransportPlace(plan.to) || plan.to) score += 18
  if (plan.date) score += 14
  if (plan.transportMode) score += 12
  if (plan.routeCombo) score += 12
  if (plan.ticketType || plan.quota) score += 10
  if (Number(plan.passengers || 0) > 0) score += 8
  if (Number(plan.budget || 0) > 0) score += 8
  return clamp(score)
}

function selectedService(plan = {}) {
  return servicesForMode(plan, plan.transportMode || 'Train')[0]
}

function availabilityScore(plan = {}) {
  const service = selectedService(plan)
  if (!service) return 35
  const text = `${service.status || ''} ${service.availability || ''} ${service.code || ''}`.toLowerCase()
  let score = Number(service.reliability || 60)
  if (text.includes('full') || text.includes('unavailable') || text.includes('no-direct')) score -= 28
  if (text.includes('delayed') || text.includes('limited')) score -= 12
  if (text.includes('verified') || text.includes('catalogue')) score -= 5
  score += routeSpecificAdjustment(plan, 6)
  return clamp(score, 20, 100)
}

function dateConfidenceScore(plan = {}) {
  if (!plan.date) return 35
  const travelDate = new Date(`${plan.date}T00:00:00`)
  const today = new Date(new Date().toDateString())
  if (Number.isNaN(travelDate.getTime())) return 35
  const diffDays = Math.round((travelDate - today) / 86400000)
  if (diffDays < 0) return 20
  if (diffDays === 0) return 72
  if (diffDays <= 30) return 100
  if (diffDays <= 90) return 88
  return 70
}

function backupStrengthScore(plan = {}) {
  const combos = routeCombos.map((combo) => calculateRouteComboScore(combo, plan)).sort((a, b) => b - a)
  return clamp((combos[1] || combos[0] || 45) + routeSpecificAdjustment(plan, 4), 30, 100)
}

export function calculateRouteComboScore(combo, plan = {}) {
  const urgency = String(plan.urgency || plan.ticketType || 'Normal').toLowerCase()
  const budgetScore = budgetFitScore({ ...plan, routeCombo: combo.label })
  const knownHubBonus = findTransportPlace(plan.from) && findTransportPlace(plan.to) ? 4 : 0
  const legs = buildComboLegs(combo, plan)
  const serviceReliability = legs.reduce((sum, leg) => sum + Number(leg.reliability || combo.reliability), 0) / Math.max(legs.length, 1)
  let score = (combo.speed * 0.24) + (combo.cost * 0.2) + (serviceReliability * 0.23) + (combo.emergencyFit * 0.18) + (budgetScore * 0.15) + knownHubBonus
  if (urgency.includes('emergency') || urgency.includes('tatkal') || urgency.includes('urgent')) score += (combo.emergencyFit - 70) / 3
  if (Number(plan.budget || 0) <= 1800 && combo.cost >= 82) score += 4
  if (String(combo.label).includes('+')) score += 2
  return clamp(score, 35, 100)
}

export function bestRouteCombo(plan = {}) {
  return routeCombos
    .map((combo) => ({ ...combo, score: calculateRouteComboScore(combo, plan) }))
    .sort((a, b) => b.score - a.score)[0]
}

export function calculateTravelScore(plan = {}) {
  const completeness = routeCompleteness(plan)
  const budget = budgetFitScore(plan)
  const availability = availabilityScore(plan)
  const dateScore = dateConfidenceScore(plan)
  const backup = backupStrengthScore(plan)
  const readiness = Number(plan.readinessScore || 0)
  const knownData = (findTransportPlace(plan.from) ? 1 : 0) + (findTransportPlace(plan.to) ? 1 : 0)
  const knownDataScore = knownData === 2 ? 100 : knownData === 1 ? 65 : 35
  return clamp(
    (completeness * 0.22) +
    (budget * 0.2) +
    (availability * 0.23) +
    (dateScore * 0.1) +
    (backup * 0.12) +
    (readiness * 0.08) +
    (knownDataScore * 0.05) +
    routeSpecificAdjustment(plan, 5),
    20,
    100
  )
}

export function calculatePlanQualityScore(plan = {}) {
  const travelScore = calculateTravelScore(plan)
  const budget = budgetFitScore(plan)
  const availability = availabilityScore(plan)
  const backup = backupStrengthScore(plan)
  const dateScore = dateConfidenceScore(plan)
  const missingKnownStationPenalty = (!findTransportPlace(plan.from) || !findTransportPlace(plan.to)) ? 8 : 0
  return clamp((travelScore * 0.45) + (availability * 0.22) + (budget * 0.15) + (backup * 0.1) + (dateScore * 0.08) - missingKnownStationPenalty, 20, 100)
}

export function scoreBreakdown(plan = {}) {
  return [
    ['Route fields', routeCompleteness(plan)],
    ['Budget fit', budgetFitScore(plan)],
    ['Availability risk', availabilityScore(plan)],
    ['Date confidence', dateConfidenceScore(plan)],
    ['Backup strength', backupStrengthScore(plan)],
    ['Overall plan', calculatePlanQualityScore(plan)]
  ]
}

export function planVerdict(score) {
  if (score >= 85) return 'Good plan'
  if (score >= 70) return 'Usable plan'
  if (score >= 55) return 'Needs backup'
  return 'Weak plan'
}

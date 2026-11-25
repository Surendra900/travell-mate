/**
 * TravelMate AI — Combination Engine
 * Agent 15: Combination Mode Specialist — W3-02 / W3-03
 *
 * Assembles multi-modal itineraries from single-mode search results.
 * Enforces MCT for all transfer types.
 * Scores transfer risk as LOW / MEDIUM / HIGH.
 * Supports all 6 mode pairs and 3-leg routes.
 *
 * MCT values and risk thresholds are imported from routingConfig — never hardcoded.
 */

import {
  getMCT,
  transferRisk,
  RANKING_WEIGHTS,
  MAX_LEGS,
  MAX_DETOUR_RATIO,
  MIN_LEG_KM,
  NEARBY_RADIUS_KM
} from '../config/routingConfig.js'
import { PROVENANCE, PROVENANCE_RANK, worstProvenance, formatDuration, formatFare, makeLeg, makeRoute } from '../types/routeSchema.js'
import { haversineKm } from './geoUtils.js'

// ---------------------------------------------------------------------------
// Time Parsing Helpers
// ---------------------------------------------------------------------------

/**
 * Parses a time string "HH:mm" or ISO datetime and returns total minutes since midnight.
 * Returns null if unparseable.
 * @param {string|null} timeStr
 * @returns {number|null}
 */
function parseTimeMinutes(timeStr) {
  if (!timeStr) return null
  // ISO datetime: take the time part
  const isoMatch = String(timeStr).match(/T(\d{2}):(\d{2})/)
  if (isoMatch) return parseInt(isoMatch[1]) * 60 + parseInt(isoMatch[2])
  // Plain HH:mm
  const hmMatch = String(timeStr).match(/^(\d{1,2}):(\d{2})/)
  if (hmMatch) return parseInt(hmMatch[1]) * 60 + parseInt(hmMatch[2])
  return null
}

/**
 * Returns the slack time in minutes between the arrival of leg1 and
 * the departure of leg2.  Handles overnight crossing.
 * Returns null if either time is unknown.
 * @param {Object} leg1 — has `.arrive` or `.arrival`
 * @param {Object} leg2 — has `.depart` or `.departure`
 * @returns {number|null}
 */
function connectionSlack(leg1, leg2) {
  const arrMin = parseTimeMinutes(leg1.arrive ?? leg1.arrival)
  const depMin = parseTimeMinutes(leg2.depart ?? leg2.departure)
  if (arrMin == null || depMin == null) return null
  // Handle overnight (next-day departure)
  const diff = depMin >= arrMin ? depMin - arrMin : (1440 - arrMin) + depMin
  return diff
}

// ---------------------------------------------------------------------------
// Transfer Info Builder
// ---------------------------------------------------------------------------

/**
 * Builds a TransferInfo object for a connection between two legs.
 * @param {Object} leg1
 * @param {Object} leg2
 * @param {string} transferCity — human-readable transfer point
 * @returns {Object} TransferInfo
 */
export function buildTransferInfo(leg1, leg2, transferCity = '') {
  const mode1 = String(leg1.mode || '').trim()
  const mode2 = String(leg2.mode || '').trim()
  const mctMin = getMCT(mode1, mode2)
  const slackMin = connectionSlack(leg1, leg2)
  const risk = slackMin != null ? transferRisk(slackMin, mctMin) : 'HIGH'
  const riskMessages = {
    LOW:    `Comfortable connection: ${slackMin != null ? slackMin + ' min' : 'unknown'} buffer (MCT ${mctMin} min).`,
    MEDIUM: `Tight connection: ${slackMin != null ? slackMin + ' min' : 'unknown'} buffer vs MCT ${mctMin} min. Monitor delays.`,
    HIGH:   `High-risk connection: buffer ${slackMin != null ? slackMin + ' min' : 'unknown'} is below MCT ${mctMin} min. Consider an alternative.`
  }

  const transferTypeMap = {
    'Train-Flight': 'airport_to_city',
    'Flight-Train': 'city_to_airport',
    'Flight-Bus':   'city_to_airport',
    'Bus-Flight':   'airport_to_city',
  }
  const typeKey = `${mode1}-${mode2}`

  return {
    type:              transferTypeMap[typeKey] ?? 'same_station',
    location:          transferCity || `${leg1.to || leg1.toCode || '?'}`,
    durationMin:       slackMin,
    durationFormatted: slackMin != null ? formatDuration(slackMin) : 'Unknown',
    mctMinutes:        mctMin,
    riskLevel:         risk,
    riskReason:        riskMessages[risk],
    guidance:          buildTransferGuidance(mode1, mode2, transferCity, mctMin)
  }
}

function buildTransferGuidance(mode1, mode2, city, mct) {
  if (mode1 === 'Train' && mode2 === 'Flight') {
    return `Allow at least ${mct} min to reach ${city} airport from the railway station (taxi or metro). Check-in closes 45 min before departure.`
  }
  if (mode1 === 'Flight' && (mode2 === 'Train' || mode2 === 'Bus')) {
    return `After landing at ${city}, allow at least ${mct} min for baggage claim and transit to the railway/bus station.`
  }
  if (mode1 === 'Train' && mode2 === 'Bus') {
    return `The bus stand is typically adjacent to or within 1 km of ${city} railway station. Allow at least ${mct} min for the platform-to-bus walk and boarding.`
  }
  return `Transfer at ${city}. Allow at least ${mct} min between services.`
}

// ---------------------------------------------------------------------------
// MCT Violation Check
// ---------------------------------------------------------------------------

/**
 * Returns true if the connection between two legs VIOLATES MCT.
 * Returns false if times are unknown (cannot enforce without data).
 * @param {Object} leg1
 * @param {Object} leg2
 * @returns {boolean}
 */
export function isMCTViolation(leg1, leg2) {
  const mode1 = String(leg1.mode || '')
  const mode2 = String(leg2.mode || '')
  const mctMin = getMCT(mode1, mode2)
  const slack = connectionSlack(leg1, leg2)
  if (slack == null) return false // cannot determine — do not reject
  return slack < mctMin
}

// ---------------------------------------------------------------------------
// 2-Leg Combination Assembly
// ---------------------------------------------------------------------------

/**
 * Assembles 2-leg itineraries from two arrays of single-mode results.
 * Applies MCT enforcement. Returns array of TravelRoute objects.
 *
 * @param {Object[]} leg1Results   — normalised train/bus/flight results for leg 1
 * @param {Object[]} leg2Results   — normalised train/bus/flight results for leg 2
 * @param {string}   hubCity       — name of the transfer city
 * @param {Object}   [options]
 * @param {boolean}  [options.allowMCTViolations=false]
 * @returns {Object[]}  TravelRoute[]
 */
export function assembleTwoLegRoutes(leg1Results = [], leg2Results = [], hubCity = '', options = {}) {
  const { allowMCTViolations = false } = options
  const routes = []

  for (const r1 of leg1Results.slice(0, 10)) {
    for (const r2 of leg2Results.slice(0, 10)) {
      if (!allowMCTViolations && isMCTViolation(r1, r2)) continue

      const leg1 = makeLeg({
        legIndex:          1,
        mode:              r1.mode ?? r1.type ?? 'Train',
        from:              r1.from || r1.fromStationCode || '',
        fromCode:          r1.fromStationCode || r1.fromCode || '',
        to:                r1.to || r1.toStationCode || hubCity,
        toCode:            r1.toStationCode || r1.toCode || '',
        depart:            r1.depart ?? r1.departure ?? null,
        arrive:            r1.arrive ?? r1.arrival ?? null,
        durationMin:       parseDurationMin(r1.duration),
        fare:              r1.price ?? r1.fare ?? null,
        service:           r1.serviceName ?? r1.service ?? '',
        carrier:           r1.carrier ?? r1.provider ?? '',
        classes:           r1.cabins ?? r1.classes ?? [],
        provenance:        canonicalProvenance(r1.provenance),
        provenanceNote:    r1.verification ?? r1.provenanceNote ?? '',
        nearbyNote:        r1.nearbyNote ?? null,
        bookingLink:       r1.bookingLink ?? '',
      })

      const leg2 = makeLeg({
        legIndex:          2,
        mode:              r2.mode ?? r2.type ?? 'Train',
        from:              r2.from || r2.fromStationCode || hubCity,
        fromCode:          r2.fromStationCode || r2.fromCode || '',
        to:                r2.to || r2.toStationCode || '',
        toCode:            r2.toStationCode || r2.toCode || '',
        depart:            r2.depart ?? r2.departure ?? null,
        arrive:            r2.arrive ?? r2.arrival ?? null,
        durationMin:       parseDurationMin(r2.duration),
        fare:              r2.price ?? r2.fare ?? null,
        service:           r2.serviceName ?? r2.service ?? '',
        carrier:           r2.carrier ?? r2.provider ?? '',
        classes:           r2.cabins ?? r2.classes ?? [],
        provenance:        canonicalProvenance(r2.provenance),
        provenanceNote:    r2.verification ?? r2.provenanceNote ?? '',
        nearbyNote:        r2.nearbyNote ?? null,
        bookingLink:       r2.bookingLink ?? '',
      })

      const transfer = buildTransferInfo(leg1, leg2, hubCity)
      const transferMin = transfer.durationMin ?? getMCT(leg1.mode, leg2.mode)
      const totalDurationMin = (leg1.durationMin || 0) + transferMin + (leg2.durationMin || 0)
      const totalFare = (leg1.fare != null && leg2.fare != null)
        ? leg1.fare + leg2.fare
        : null

      routes.push(makeRoute({
        id:              `combo-${leg1.fromCode}-${hubCity}-${leg2.toCode}-${routes.length}`,
        tier:            'smart-balanced',
        tierLabel:       `${leg1.mode} + ${leg2.mode}`,
        tierBadge:       transfer.riskLevel,
        legs:            [leg1, leg2],
        transfers:       [transfer],
        totalFare,
        totalDurationMin,
        whyPicked:       `${leg1.mode} to ${hubCity}, then ${leg2.mode} onward. Transfer risk: ${transfer.riskLevel}.`,
        worstProvenance: worstProvenance([leg1, leg2])
      }))
    }
  }

  return routes
}

// ---------------------------------------------------------------------------
// 3-Leg Assembly
// ---------------------------------------------------------------------------

/**
 * Assembles 3-leg itineraries from three single-mode result arrays.
 * @param {Object[]} leg1Results
 * @param {Object[]} leg2Results
 * @param {Object[]} leg3Results
 * @param {string}   hub1City
 * @param {string}   hub2City
 * @returns {Object[]}
 */
export function assembleThreeLegRoutes(leg1Results = [], leg2Results = [], leg3Results = [], hub1City = '', hub2City = '') {
  const twoLeg = assembleTwoLegRoutes(leg1Results, leg2Results, hub1City)
  const routes = []

  for (const twoLegRoute of twoLeg.slice(0, 5)) {
    const syntheticLeg2 = twoLegRoute.legs[1]
    for (const r3 of leg3Results.slice(0, 5)) {
      if (isMCTViolation(syntheticLeg2, r3)) continue

      const leg3 = makeLeg({
        legIndex:    3,
        mode:        r3.mode ?? r3.type ?? 'Train',
        from:        r3.from || hub2City,
        fromCode:    r3.fromStationCode || '',
        to:          r3.to || '',
        toCode:      r3.toStationCode || '',
        depart:      r3.depart ?? r3.departure ?? null,
        arrive:      r3.arrive ?? r3.arrival ?? null,
        durationMin: parseDurationMin(r3.duration),
        fare:        r3.price ?? r3.fare ?? null,
        service:     r3.serviceName ?? r3.service ?? '',
        provenance:  canonicalProvenance(r3.provenance),
      })

      const transfer2 = buildTransferInfo(syntheticLeg2, leg3, hub2City)
      const transfer2Min = transfer2.durationMin ?? getMCT(syntheticLeg2.mode, leg3.mode)
      const totalDurationMin = twoLegRoute.totalDurationMin + transfer2Min + (leg3.durationMin || 0)
      const totalFare = (twoLegRoute.totalFare != null && leg3.fare != null)
        ? twoLegRoute.totalFare + leg3.fare
        : null

      routes.push(makeRoute({
        id:              `combo3-${twoLegRoute.id}-${leg3.toCode}`,
        tier:            'smart-balanced',
        tierLabel:       `${twoLegRoute.legs[0].mode} + ${syntheticLeg2.mode} + ${leg3.mode}`,
        tierBadge:       [twoLegRoute.transfers[0]?.riskLevel, transfer2.riskLevel].sort().reverse()[0], // worst badge
        legs:            [...twoLegRoute.legs, leg3],
        transfers:       [...twoLegRoute.transfers, transfer2],
        totalFare,
        totalDurationMin,
        whyPicked:       `3-leg route via ${hub1City} and ${hub2City}.`,
        worstProvenance: worstProvenance([...twoLegRoute.legs, leg3])
      }))
    }
  }

  return routes
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

/**
 * Scores a route for ranking. Higher = better.
 * Uses weights from routingConfig.RANKING_WEIGHTS.
 * @param {Object} route — TravelRoute
 * @param {{ maxFare: number, maxDuration: number }} bounds
 * @returns {number}
 */
export function scoreRoute(route, bounds = {}) {
  const { maxFare = 10000, maxDuration = 1440 } = bounds
  const fareScore     = route.totalFare != null ? Math.max(0, 1 - route.totalFare / maxFare) : 0.5
  const durationScore = Math.max(0, 1 - route.totalDurationMin / maxDuration)
  const reliabilityScore = route.transfers.reduce((acc, t) => {
    if (t.riskLevel === 'LOW')    return acc + 1
    if (t.riskLevel === 'MEDIUM') return acc + 0.5
    return acc // HIGH
  }, 1) / Math.max(1, route.transfers.length + 1)
  const provenanceScore = 1 - (PROVENANCE_RANK.indexOf(route.worstProvenance) / PROVENANCE_RANK.length)

  return (
    fareScore     * RANKING_WEIGHTS.fare +
    durationScore * RANKING_WEIGHTS.duration +
    reliabilityScore * RANKING_WEIGHTS.reliability +
    provenanceScore  * RANKING_WEIGHTS.provenance
  )
}

/**
 * Ranks a list of TravelRoute objects into Budget / Balanced / Fastest tiers.
 * @param {Object[]} routes
 * @returns {{ budget: Object|null, balanced: Object|null, fastest: Object|null, all: Object[] }}
 */
export function rankRoutes(routes = []) {
  if (!routes.length) return { budget: null, balanced: null, fastest: null, all: [] }

  const maxFare     = Math.max(...routes.map(r => r.totalFare ?? 0))
  const maxDuration = Math.max(...routes.map(r => r.totalDurationMin ?? 0))

  const scored = routes
    .map(r => ({ ...r, _score: scoreRoute(r, { maxFare, maxDuration }) }))
    .sort((a, b) => b._score - a._score)

  const byFare     = [...routes].sort((a, b) => (a.totalFare ?? 99999) - (b.totalFare ?? 99999))
  const byDuration = [...routes].sort((a, b) => a.totalDurationMin - b.totalDurationMin)

  const budget  = byFare[0]    ? { ...byFare[0],    tier: 'paisa-vasool',      tierLabel: 'Paisa Vasool (Budget)',   tierBadge: 'Lowest Fare' }    : null
  const fastest = byDuration[0] ? { ...byDuration[0], tier: 'emergency-express', tierLabel: 'Emergency Express',      tierBadge: 'Fastest Route' }  : null
  const balancedCandidate = scored.find(r => r.id !== budget?.id && r.id !== fastest?.id)
  const balanced = balancedCandidate ? { ...balancedCandidate, tier: 'smart-balanced', tierLabel: 'Smart Balanced', tierBadge: 'Best Overall' } : null

  return { budget, balanced, fastest, all: scored }
}

// ---------------------------------------------------------------------------
// Private Helpers
// ---------------------------------------------------------------------------

function parseDurationMin(duration) {
  if (typeof duration === 'number') return duration
  if (!duration) return 0
  const match = String(duration).match(/(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?/)
  if (!match) return 0
  return (parseInt(match[1] || 0) * 60) + parseInt(match[2] || 0)
}

/**
 * Maps any provenance string to one of the 4 canonical values.
 * @param {string} prov
 * @returns {string}
 */
function canonicalProvenance(prov = '') {
  const p = String(prov).toUpperCase()
  if (p === 'LIVE_PROVIDER_DATA' || p === 'LIVE_OTA_AGGREGATOR' || p === 'LIVE_PRICE_SCHEDULE') return PROVENANCE.LIVE
  if (p === 'TIMETABLE' || p === 'LIVE_SCHEDULE_ONLY' || p === 'LIVE_SCHEDULE_ONLY') return PROVENANCE.TIMETABLE
  if (p === 'PROVIDER_VERIFICATION_REQUIRED') return PROVENANCE.VERIFY
  return PROVENANCE.ESTIMATE
}

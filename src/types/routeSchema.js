/**
 * TravelMate AI — Canonical Route Schema
 * Agent 11: Route Engine Architect
 *
 * Every transport API (trains, buses, flights) MUST normalise its output
 * to these shapes before the result is returned to the client or consumed
 * by the combination engine.
 *
 * Provenance values (use ONLY these four):
 *   LIVE_PROVIDER_DATA        — real-time data from a live API, includes fare
 *   TIMETABLE                 — static schedule data (may be stale); no live fare
 *   ESTIMATE                  — mathematically derived; not from any provider
 *   PROVIDER_VERIFICATION_REQUIRED — provider responded but data needs user verification
 */

/**
 * @typedef {Object} RouteLeg
 * @property {number}  legIndex          — 1-based position in the itinerary
 * @property {'Train'|'Bus'|'Flight'} mode
 * @property {string}  from              — human-readable origin city/station
 * @property {string}  fromCode          — IATA / station code (e.g. "NDLS", "BLR")
 * @property {string}  to                — human-readable destination
 * @property {string}  toCode
 * @property {string|null} depart        — ISO-8601 datetime or "HH:mm" string; null if unknown
 * @property {string|null} arrive        — ISO-8601 datetime or "HH:mm" string; null if unknown
 * @property {number}  durationMin       — travel time in minutes (integer)
 * @property {string}  durationFormatted — human label e.g. "5h 30m"
 * @property {number|null} fare          — per-person fare in INR; null if unknown
 * @property {string}  fareFormatted     — "₹1,250" or "Price unavailable"
 * @property {string}  service           — train/bus/flight identifier e.g. "12627 Karnataka Express"
 * @property {string}  carrier           — operating company / airline
 * @property {string[]} classes          — available seat classes e.g. ["SL","3A","2A"]
 * @property {'LIVE_PROVIDER_DATA'|'TIMETABLE'|'ESTIMATE'|'PROVIDER_VERIFICATION_REQUIRED'} provenance
 * @property {string}  provenanceNote    — one-line explanation shown to user
 * @property {string|null} nearbyNote    — set when leg uses nearest-node fallback
 *                                         e.g. "From Kollam Jn, 65 km from your origin"
 * @property {number|null} nearbyDistKm  — straight-line km from requested city to fallback node
 * @property {string}  bookingLink       — deep-link URL to booking portal
 */

/**
 * @typedef {Object} TransferInfo
 * @property {'same_station'|'nearby_station'|'airport_to_city'|'city_to_airport'} type
 * @property {string} location           — e.g. "Vijayawada Jn (BZA)"
 * @property {number} durationMin        — wait / transfer time in minutes
 * @property {string} durationFormatted
 * @property {number} mctMinutes         — minimum connection time enforced
 * @property {'LOW'|'MEDIUM'|'HIGH'} riskLevel
 * @property {string} riskReason         — e.g. "Only 25 min buffer vs 90 min MCT"
 * @property {string} guidance           — user-facing transfer instructions
 */

/**
 * @typedef {Object} TravelRoute
 * @property {string}  id                — unique route identifier
 * @property {'paisa-vasool'|'smart-balanced'|'emergency-express'|'direct'} tier
 * @property {string}  tierLabel         — display name e.g. "Paisa Vasool (Budget)"
 * @property {string}  tierBadge         — short badge text e.g. "Saves ₹800"
 * @property {RouteLeg[]} legs           — ordered array of transport legs (1–3 legs)
 * @property {TransferInfo[]} transfers  — one entry per inter-leg connection
 * @property {number}  totalFare         — sum of all leg fares in INR (null if any leg unknown)
 * @property {string}  totalFareFormatted
 * @property {number}  totalDurationMin  — travel + transfer time combined
 * @property {string}  totalDuration     — formatted total e.g. "9h 45m"
 * @property {string}  whyPicked         — explanation of why this tier was selected
 * @property {'LIVE_PROVIDER_DATA'|'TIMETABLE'|'ESTIMATE'|'PROVIDER_VERIFICATION_REQUIRED'} worstProvenance
 *   — the lowest-quality provenance across all legs (drives the UI warning banner)
 */

/**
 * Canonical provenance values — the ONLY allowed strings.
 */
export const PROVENANCE = Object.freeze({
  LIVE:     'LIVE_PROVIDER_DATA',
  TIMETABLE:'TIMETABLE',
  ESTIMATE: 'ESTIMATE',
  VERIFY:   'PROVIDER_VERIFICATION_REQUIRED',
})

/** Provenance rank: lower index = higher quality */
export const PROVENANCE_RANK = [
  PROVENANCE.LIVE,
  PROVENANCE.TIMETABLE,
  PROVENANCE.VERIFY,
  PROVENANCE.ESTIMATE,
]

/**
 * Returns the worst (lowest-quality) provenance from a list of legs.
 * @param {RouteLeg[]} legs
 * @returns {string}
 */
export function worstProvenance(legs = []) {
  let worst = 0
  for (const leg of legs) {
    const rank = PROVENANCE_RANK.indexOf(leg.provenance)
    if (rank > worst) worst = rank
  }
  return PROVENANCE_RANK[worst] ?? PROVENANCE.ESTIMATE
}

/**
 * Formats a duration in minutes to "Xh Ym" label.
 * @param {number} minutes
 * @returns {string}
 */
export function formatDuration(minutes) {
  const m = Math.max(0, Math.round(Number(minutes) || 0))
  const h = Math.floor(m / 60)
  const rem = m % 60
  if (h === 0) return `${rem}m`
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

/**
 * Formats a fare in INR to "₹X,XXX" or "Price unavailable".
 * @param {number|null} fare
 * @returns {string}
 */
export function formatFare(fare) {
  if (fare == null || isNaN(fare)) return 'Price unavailable'
  return `₹${Math.round(fare).toLocaleString('en-IN')}`
}

/**
 * Builds a minimal valid RouteLeg with safe defaults.
 * Override specific fields in the second argument.
 * @param {Partial<RouteLeg>} fields
 * @returns {RouteLeg}
 */
export function makeLeg(fields = {}) {
  const durationMin = Number(fields.durationMin ?? 0)
  const fare = fields.fare != null ? Number(fields.fare) : null
  return {
    legIndex:          fields.legIndex ?? 1,
    mode:              fields.mode ?? 'Train',
    from:              fields.from ?? '',
    fromCode:          fields.fromCode ?? '',
    to:                fields.to ?? '',
    toCode:            fields.toCode ?? '',
    depart:            fields.depart ?? null,
    arrive:            fields.arrive ?? null,
    durationMin,
    durationFormatted: fields.durationFormatted ?? formatDuration(durationMin),
    fare,
    fareFormatted:     fields.fareFormatted ?? formatFare(fare),
    service:           fields.service ?? '',
    carrier:           fields.carrier ?? '',
    classes:           fields.classes ?? [],
    provenance:        fields.provenance ?? PROVENANCE.ESTIMATE,
    provenanceNote:    fields.provenanceNote ?? '',
    nearbyNote:        fields.nearbyNote ?? null,
    nearbyDistKm:      fields.nearbyDistKm ?? null,
    bookingLink:       fields.bookingLink ?? '',
  }
}

/**
 * Builds a minimal valid TravelRoute.
 * @param {Partial<TravelRoute>} fields
 * @returns {TravelRoute}
 */
export function makeRoute(fields = {}) {
  const legs = fields.legs ?? []
  const transfers = fields.transfers ?? []
  const totalFare = fields.totalFare ?? null
  const totalDurationMin = Number(fields.totalDurationMin ?? 0)
  return {
    id:                 fields.id ?? `route-${Date.now()}`,
    tier:               fields.tier ?? 'smart-balanced',
    tierLabel:          fields.tierLabel ?? 'Route',
    tierBadge:          fields.tierBadge ?? '',
    legs,
    transfers,
    totalFare,
    totalFareFormatted: fields.totalFareFormatted ?? formatFare(totalFare),
    totalDurationMin,
    totalDuration:      fields.totalDuration ?? formatDuration(totalDurationMin),
    whyPicked:          fields.whyPicked ?? '',
    worstProvenance:    fields.worstProvenance ?? worstProvenance(legs),
  }
}

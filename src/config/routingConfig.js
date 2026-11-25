/**
 * TravelMate AI — Routing Configuration
 * Agent 11: Route Engine Architect
 *
 * Single source of truth for all MCT values, search radii, timeouts,
 * ranking weights, and mode-purity rules.
 * Import from here; never hardcode these values in API handlers or utilities.
 */

// ---------------------------------------------------------------------------
// Minimum Connection Times (MCT) in minutes
// ---------------------------------------------------------------------------
// These are conservative values for Indian travel conditions.
// They are enforced by the combination engine — itineraries that do not
// satisfy MCT for their transfer type are REJECTED.
export const MCT = Object.freeze({
  /** Train → Train at same station */
  TRAIN_TO_TRAIN:    60,
  /** Train → Bus  (walk to bus stand, platform, boarding) */
  TRAIN_TO_BUS:      90,
  /** Train → Flight (airport transit: recommend pre-paid taxi ≥3 h) */
  TRAIN_TO_FLIGHT:  180,
  /** Bus → Train */
  BUS_TO_TRAIN:      60,
  /** Bus → Bus at same stand */
  BUS_TO_BUS:        45,
  /** Bus → Flight */
  BUS_TO_FLIGHT:    150,
  /** Flight → Train or Bus (deplaning + baggage + transit) */
  FLIGHT_TO_GROUND:  90,
  /** Flight → Flight (domestic transfer, same terminal) */
  FLIGHT_TO_FLIGHT:  60,
})

/**
 * Returns the MCT in minutes for a given mode pair.
 * @param {'Train'|'Bus'|'Flight'} fromMode
 * @param {'Train'|'Bus'|'Flight'} toMode
 * @returns {number}
 */
export function getMCT(fromMode, toMode) {
  const key = `${fromMode.toUpperCase()}_TO_${toMode.toUpperCase()}`
  return MCT[key] ?? 90 // safe default
}

// ---------------------------------------------------------------------------
// Nearby-Node Search Radii (km, straight-line)
// ---------------------------------------------------------------------------
export const NEARBY_RADIUS_KM = Object.freeze({
  TRAIN:  100,
  BUS:    100,
  FLIGHT: 150,
})

/** Maximum nearby nodes to search per side (origin OR destination) */
export const MAX_NEARBY_NODES = 4

// ---------------------------------------------------------------------------
// Timeouts
// ---------------------------------------------------------------------------
/** Per-provider HTTP fetch timeout in ms */
export const PROVIDER_TIMEOUT_MS = 12_000
/** Total search timeout across all providers for one mode in ms */
export const SEARCH_TIMEOUT_MS = 15_000
/** Upstash Redis rate-limit call timeout in ms */
export const REDIS_TIMEOUT_MS = 2_000

// ---------------------------------------------------------------------------
// Mode Purity
// ---------------------------------------------------------------------------
/**
 * Allowed transport modes per search type.
 * The API layer MUST filter results to ONLY the modes listed here.
 */
export const MODE_PURITY = Object.freeze({
  train:       ['Train'],
  bus:         ['Bus'],
  flight:      ['Flight'],
  combination: ['Train', 'Bus', 'Flight'],
})

/** Returns true when ALL legs in an itinerary belong to the allowed modes. */
export function isModePure(legs = [], searchType = 'combination') {
  const allowed = MODE_PURITY[searchType] ?? MODE_PURITY.combination
  return legs.every(leg => allowed.includes(leg.mode))
}

// ---------------------------------------------------------------------------
// Ranking Weights (used by scoring engine for multi-leg routes)
// ---------------------------------------------------------------------------
export const RANKING_WEIGHTS = Object.freeze({
  fare:        0.35,
  duration:    0.30,
  reliability: 0.20,
  provenance:  0.15, // higher-quality provenance = higher score
})

// ---------------------------------------------------------------------------
// Transfer Risk Thresholds
// ---------------------------------------------------------------------------
/** Slack minutes relative to MCT that determine risk badge */
export const TRANSFER_RISK = Object.freeze({
  /** Buffer ≥ 30 min above MCT → LOW */
  LOW_THRESHOLD:    30,
  /** Buffer 10–29 min above MCT → MEDIUM */
  MEDIUM_THRESHOLD: 10,
  /** Buffer < 10 min above MCT → HIGH */
  // (anything below MEDIUM_THRESHOLD is HIGH)
})

/**
 * Derives a transfer risk label from actual slack and MCT.
 * @param {number} slackMin — total available connection time in minutes
 * @param {number} mctMin   — minimum connection time for this mode pair
 * @returns {'LOW'|'MEDIUM'|'HIGH'}
 */
export function transferRisk(slackMin, mctMin) {
  const buffer = slackMin - mctMin
  if (buffer < TRANSFER_RISK.MEDIUM_THRESHOLD) return 'HIGH'
  if (buffer < TRANSFER_RISK.LOW_THRESHOLD)    return 'MEDIUM'
  return 'LOW'
}

// ---------------------------------------------------------------------------
// Combination Route Constraints
// ---------------------------------------------------------------------------
/** Maximum legs in a single itinerary (including transfers) */
export const MAX_LEGS = 3
/** Maximum detour ratio vs straight-line distance before hub is rejected */
export const MAX_DETOUR_RATIO = 1.35
/** Minimum segment distance (km) — legs shorter than this are dropped */
export const MIN_LEG_KM = 20

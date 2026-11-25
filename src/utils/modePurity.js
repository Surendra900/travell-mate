/**
 * TravelMate AI — Mode Purity Enforcement
 * Agent 11: Route Engine Architect — W3-01
 *
 * Filters any set of transport results to only the modes allowed by the
 * search type. This is a hard rule — results containing the wrong mode
 * are removed, never downgraded or relabelled.
 *
 * Usage in API handlers:
 *   import { enforceModePurity } from '../../src/utils/modePurity.js'
 *   const pure = enforceModePurity(results, 'train')
 */

import { MODE_PURITY, isModePure } from '../config/routingConfig.js'

/**
 * Normalises a search type key so 'trains', 'Train', 'TRAIN' all resolve to 'train'.
 * @param {string} searchType
 * @returns {'train'|'bus'|'flight'|'combination'}
 */
export function normaliseSearchType(searchType = '') {
  const raw = String(searchType).toLowerCase().trim()
  if (raw === 'train' || raw === 'trains') return 'train'
  if (raw === 'bus'   || raw === 'buses')  return 'bus'
  if (raw === 'flight' || raw === 'flights' || raw === 'fly') return 'flight'
  if (raw === 'combination' || raw === 'combo' || raw === 'combined') return 'combination'
  return 'combination'
}

/**
 * Extracts the mode from a result object.
 * Checks `mode`, `type`, `transport`, `transportMode` fields (case-insensitive).
 * Returns 'Train' | 'Bus' | 'Flight' | null.
 * @param {Object} result
 * @returns {'Train'|'Bus'|'Flight'|null}
 */
export function resultMode(result = {}) {
  const raw = String(result.mode || result.type || result.transport || result.transportMode || '').toLowerCase()
  if (raw.includes('train') || raw === 'rail') return 'Train'
  if (raw.includes('bus')   || raw === 'road') return 'Bus'
  if (raw.includes('flight') || raw.includes('fly') || raw === 'air') return 'Flight'
  return null
}

/**
 * Filters a flat array of single-mode results to only those matching
 * the allowed modes for `searchType`.
 *
 * - 'train'  → keeps only Train results
 * - 'bus'    → keeps only Bus results
 * - 'flight' → keeps only Flight results
 * - 'combination' → keeps all three modes
 *
 * @param {Object[]} results      — flat list of transport result objects
 * @param {string}   searchType  — 'train' | 'bus' | 'flight' | 'combination'
 * @returns {{ pure: Object[], removed: number }}
 */
export function enforceModePurity(results = [], searchType = 'combination') {
  const type = normaliseSearchType(searchType)
  const allowed = MODE_PURITY[type] ?? MODE_PURITY.combination

  const pure = []
  let removed = 0

  for (const result of results) {
    const mode = resultMode(result)
    if (mode === null || allowed.includes(mode)) {
      pure.push(result)
    } else {
      removed++
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[modePurity] Removed result "${result.serviceName || result.id}" (mode=${mode}) from ${searchType} search`
        )
      }
    }
  }

  return { pure, removed }
}

/**
 * Filters a TravelRoute itinerary's legs for mode purity.
 * Rejects the entire itinerary if ANY leg fails the purity check.
 *
 * @param {Object[]} itineraries — array of TravelRoute objects with `.legs`
 * @param {string}   searchType
 * @returns {Object[]}
 */
export function enforceItineraryModePurity(itineraries = [], searchType = 'combination') {
  const type = normaliseSearchType(searchType)
  return itineraries.filter(itinerary => {
    const legs = itinerary.legs ?? [itinerary.leg1, itinerary.leg2, itinerary.leg3].filter(Boolean)
    return isModePure(legs, type)
  })
}

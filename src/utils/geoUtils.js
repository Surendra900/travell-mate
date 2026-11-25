/**
 * TravelMate AI — Geo Utilities
 * Agent 17: Geo & Station Data
 *
 * Nearest-node lookup for train stations, airports, and bus stands.
 * City-name normalisation and code resolution helpers.
 *
 * All functions are pure (no side-effects, no API calls).
 * Data is imported from src/data/ at module load time.
 */

import { NEARBY_RADIUS_KM, MAX_NEARBY_NODES } from '../config/routingConfig.js'

// ---------------------------------------------------------------------------
// Haversine Distance
// ---------------------------------------------------------------------------

/**
 * Returns the straight-line distance in km between two lat/lng points.
 * Returns null if either coordinate is missing or zero-zero.
 * @param {{ lat: number, lng: number }} a
 * @param {{ lat: number, lng: number }} b
 * @returns {number|null}
 */
export function haversineKm(a, b) {
  const lat1 = Number(a?.lat ?? a?.latitude)
  const lon1 = Number(a?.lng ?? a?.longitude ?? a?.lon)
  const lat2 = Number(b?.lat ?? b?.latitude)
  const lon2 = Number(b?.lng ?? b?.longitude ?? b?.lon)

  if ([lat1, lon1, lat2, lon2].some(v => isNaN(v) || v === 0)) return null
  if (lat1 === lat2 && lon1 === lon2) return 0

  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a2 =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2)))
}

// ---------------------------------------------------------------------------
// City-name normalisation
// ---------------------------------------------------------------------------

function normKey(str = '') {
  return String(str)
    .toUpperCase()
    .replace(/&/g, ' AND ')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

// ---------------------------------------------------------------------------
// Train stations
// ---------------------------------------------------------------------------

let _stationsData = null

async function getStationsData() {
  if (_stationsData) return _stationsData
  // Dynamic import keeps this tree-shakable on the client
  const mod = await import('../data/stationsData.js')
  _stationsData = mod.default ?? mod.stations ?? []
  return _stationsData
}

/**
 * Finds the best-matching station entry for a city name or station code.
 * Returns null if nothing matched.
 * @param {string} cityOrCode
 * @param {any[]} [stationsArray]  — optional pre-loaded array (avoids async)
 * @returns {{ name: string, code: string, lat: number, lng: number }|null}
 */
export function findStation(cityOrCode, stationsArray) {
  const data = stationsArray ?? []
  if (!data.length) return null
  const key = normKey(cityOrCode)
  // Exact code match first
  let match = data.find(s => normKey(s.code) === key || normKey(s.stationCode) === key)
  if (match) return match
  // City name match
  match = data.find(s => normKey(s.city ?? s.name ?? '') === key)
  if (match) return match
  // Partial city name
  match = data.find(s => {
    const c = normKey(s.city ?? s.name ?? '')
    return c.startsWith(key) || key.startsWith(c)
  })
  return match ?? null
}

/**
 * Returns the geo-coordinates for a station code.
 * @param {string} code
 * @param {any[]} stationsArray
 * @returns {{ lat: number, lng: number }|null}
 */
export function stationCodeToCoord(code, stationsArray = []) {
  const s = findStation(code, stationsArray)
  if (!s) return null
  const lat = Number(s.lat ?? s.latitude)
  const lng = Number(s.lng ?? s.longitude)
  if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) return null
  return { lat, lng }
}

/**
 * Finds train stations within `radiusKm` of a given city or coordinate.
 * Returns results sorted by distance (nearest first), capped at MAX_NEARBY_NODES.
 *
 * @param {string|{ lat: number, lng: number }} cityOrCoord
 * @param {number} [radiusKm]
 * @param {any[]} [stationsArray]
 * @returns {Array<{ station: any, distKm: number }>}
 */
export function findNearestStations(
  cityOrCoord,
  radiusKm = NEARBY_RADIUS_KM.TRAIN,
  stationsArray = []
) {
  let origin
  if (typeof cityOrCoord === 'string') {
    const s = findStation(cityOrCoord, stationsArray)
    if (!s) return []
    origin = { lat: Number(s.lat ?? s.latitude), lng: Number(s.lng ?? s.longitude) }
  } else {
    origin = cityOrCoord
  }

  if (!origin || isNaN(origin.lat) || isNaN(origin.lng)) return []

  const results = []
  for (const station of stationsArray) {
    const lat = Number(station.lat ?? station.latitude)
    const lng = Number(station.lng ?? station.longitude)
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) continue
    const distKm = haversineKm(origin, { lat, lng })
    if (distKm != null && distKm <= radiusKm && distKm > 0) {
      results.push({ station, distKm })
    }
  }

  return results
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, MAX_NEARBY_NODES)
}

// ---------------------------------------------------------------------------
// Airports
// ---------------------------------------------------------------------------

let _airportsData = null

async function getAirportsData() {
  if (_airportsData) return _airportsData
  const mod = await import('../data/airportsData.js')
  _airportsData = mod.default ?? mod.airports ?? []
  return _airportsData
}

/**
 * Resolves a city name to its IATA code.
 * Returns '' if not found.
 * @param {string} cityName
 * @param {any[]} [airportsArray]
 * @returns {string}
 */
export function cityToIATA(cityName, airportsArray = []) {
  const key = normKey(cityName)
  const a = airportsArray.find(ap => {
    return (
      normKey(ap.city ?? '') === key ||
      normKey(ap.name ?? '') === key ||
      normKey(ap.iata ?? '') === key ||
      (ap.aliases ?? []).some(al => normKey(al) === key)
    )
  })
  return a?.iata ?? ''
}

/**
 * Finds airports within `radiusKm` of a city or coordinate.
 * Returns results sorted by distance, capped at MAX_NEARBY_NODES.
 *
 * @param {string|{ lat: number, lng: number }} cityOrCoord
 * @param {number} [radiusKm]
 * @param {any[]} [airportsArray]
 * @returns {Array<{ airport: any, distKm: number }>}
 */
export function findNearestAirports(
  cityOrCoord,
  radiusKm = NEARBY_RADIUS_KM.FLIGHT,
  airportsArray = []
) {
  let origin
  if (typeof cityOrCoord === 'string') {
    // Try direct IATA match first
    const direct = airportsArray.find(ap => {
      const key = normKey(cityOrCoord)
      return normKey(ap.city ?? '') === key ||
             normKey(ap.iata ?? '') === key ||
             (ap.aliases ?? []).some(al => normKey(al) === key)
    })
    if (direct) {
      origin = { lat: Number(direct.lat ?? direct.latitude), lng: Number(direct.lng ?? direct.longitude) }
    } else {
      return [] // cannot determine origin coordinates
    }
  } else {
    origin = cityOrCoord
  }

  if (!origin || isNaN(origin.lat) || isNaN(origin.lng)) return []

  const results = []
  for (const airport of airportsArray) {
    const lat = Number(airport.lat ?? airport.latitude)
    const lng = Number(airport.lng ?? airport.longitude)
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) continue
    const distKm = haversineKm(origin, { lat, lng })
    // Include distKm === 0: the airport AT the origin city is a valid result
    if (distKm != null && distKm <= radiusKm) {
      results.push({ airport, distKm })
    }
  }

  return results
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, MAX_NEARBY_NODES)
}

// ---------------------------------------------------------------------------
// Bus stands
// ---------------------------------------------------------------------------

let _transportData = null

async function getTransportData() {
  if (_transportData) return _transportData
  const mod = await import('../data/transportData.js')
  _transportData = mod.transportPlaces ?? mod.default ?? []
  return _transportData
}

/**
 * Finds bus stands / transport hubs within `radiusKm` of a city or coordinate.
 *
 * @param {string|{ lat: number, lng: number }} cityOrCoord
 * @param {number} [radiusKm]
 * @param {any[]} [transportArray]  — array of transportPlaces entries
 * @returns {Array<{ place: any, distKm: number }>}
 */
export function findNearestBusStands(
  cityOrCoord,
  radiusKm = NEARBY_RADIUS_KM.BUS,
  transportArray = []
) {
  let origin
  if (typeof cityOrCoord === 'string') {
    const key = normKey(cityOrCoord)
    const place = transportArray.find(p =>
      normKey(p.city ?? '') === key ||
      (p.aliases ?? []).some(al => normKey(al) === key)
    )
    if (!place) return []
    origin = { lat: Number(place.lat ?? place.latitude), lng: Number(place.lng ?? place.longitude) }
  } else {
    origin = cityOrCoord
  }

  if (!origin || isNaN(origin.lat) || isNaN(origin.lng)) return []

  const results = []
  for (const place of transportArray) {
    const lat = Number(place.lat ?? place.latitude)
    const lng = Number(place.lng ?? place.longitude)
    if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) continue
    const distKm = haversineKm(origin, { lat, lng })
    if (distKm != null && distKm <= radiusKm && distKm > 0) {
      results.push({ place, distKm })
    }
  }

  return results
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, MAX_NEARBY_NODES)
}

// ---------------------------------------------------------------------------
// City → station code (helper used by API handlers)
// ---------------------------------------------------------------------------

/**
 * Attempts to resolve a city name string to a primary station code.
 * Returns '' if resolution fails.
 * @param {string} cityName
 * @param {any[]} [stationsArray]
 * @returns {string}
 */
export function cityToStationCode(cityName, stationsArray = []) {
  const s = findStation(cityName, stationsArray)
  return s?.code ?? s?.stationCode ?? ''
}

/**
 * Builds a nearby-note label for display in results.
 * @param {string} nodeName
 * @param {number} distKm
 * @param {'origin'|'destination'} side
 * @returns {string}
 */
export function nearbyLabel(nodeName, distKm, side = 'origin') {
  const roundKm = Math.round(distKm)
  if (side === 'destination') {
    return `To ${nodeName}, ${roundKm} km from your destination`
  }
  return `From ${nodeName}, ${roundKm} km from your origin`
}

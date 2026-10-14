/**
 * Station Autocomplete & Directory Service
 * Backed by canonical GODL-India dataset from Day 2 ETL
 * Reference: docs/MASTER_SPEC.md Sections 6 & 8
 */

import stationsData from '../../shared/data/stations.json' with { type: 'json' };

export const STATIONS = Array.isArray(stationsData) ? stationsData : [];

// Index stations for fast prefix & substring search
const SEARCH_INDEX = STATIONS.map(s => {
  const code = String(s.code || '').toUpperCase();
  const name = String(s.name || '').toUpperCase();
  const city = String(s.city || '').toUpperCase();
  const state = String(s.state || '').toUpperCase();
  return {
    ...s,
    code,
    name: s.name || s.code,
    city: s.city || s.name || s.code,
    searchText: `${code} ${name} ${city} ${state}`
  };
});

/**
 * Searches stations by code, name, or city with junction priority
 * @param {string} query: Search query
 * @param {number} limit: Maximum results to return
 * @returns {Array} List of matching station records
 */
export function searchStations(query = '', limit = 10) {
  const q = String(query).trim().toUpperCase();
  if (!q) {
    // Return Top Indian Hubs by default
    return STATIONS.filter(s => s.isJunction).slice(0, limit);
  }

  // Exact code match gets top priority
  const exactCodeMatches = [];
  const startsWithMatches = [];
  const containsMatches = [];

  for (const s of SEARCH_INDEX) {
    if (s.code === q) {
      exactCodeMatches.push(s);
    } else if (s.code.startsWith(q) || (s.city && s.city.toUpperCase().startsWith(q)) || (s.name && s.name.toUpperCase().startsWith(q))) {
      startsWithMatches.push(s);
    } else if (s.searchText.includes(q)) {
      containsMatches.push(s);
    }
  }

  // Sort startsWith matches: exact city match, coordinates, then junctions first
  startsWithMatches.sort((a, b) => {
    const aCityExact = a.city && a.city.toUpperCase() === q;
    const bCityExact = b.city && b.city.toUpperCase() === q;
    if (aCityExact && !bCityExact) return -1;
    if (!aCityExact && bCityExact) return 1;

    const aNameExact = a.name && a.name.toUpperCase() === q;
    const bNameExact = b.name && b.name.toUpperCase() === q;
    if (aNameExact && !bNameExact) return -1;
    if (!aNameExact && bNameExact) return 1;

    const aHasCoords = a.latitude !== null && a.longitude !== null;
    const bHasCoords = b.latitude !== null && b.longitude !== null;
    if (aHasCoords && !bHasCoords) return -1;
    if (!aHasCoords && bHasCoords) return 1;

    if (a.isJunction && !b.isJunction) return -1;
    if (!a.isJunction && b.isJunction) return 1;
    return String(a.city || '').localeCompare(String(b.city || ''));
  });

  const combined = [...exactCodeMatches, ...startsWithMatches, ...containsMatches];
  return combined.slice(0, limit);
}

/**
 * Formats station for user display
 */
export function formatStationLabel(station) {
  if (!station) return '';
  return `${station.city} (${station.code})`;
}

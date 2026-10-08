/**
 * Station Autocomplete & Directory Service
 * Backed by canonical GODL-India dataset from Day 2 ETL
 * Reference: docs/MASTER_SPEC.md Sections 6 & 8
 */

import stationsData from '../../shared/data/stations.json' with { type: 'json' };

export const STATIONS = Array.isArray(stationsData) ? stationsData : [];

// Index stations for fast prefix & substring search
const SEARCH_INDEX = STATIONS.map(s => ({
  ...s,
  searchText: `${s.code} ${s.name} ${s.city} ${s.state}`.toUpperCase()
}));

/**
 * Searches stations by code, name, or city with junction priority
 * @param {string} query - Search query
 * @param {number} limit - Maximum results to return
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
    } else if (s.code.startsWith(q) || s.city.toUpperCase().startsWith(q) || s.name.toUpperCase().startsWith(q)) {
      startsWithMatches.push(s);
    } else if (s.searchText.includes(q)) {
      containsMatches.push(s);
    }
  }

  // Sort startsWith matches: junctions first
  startsWithMatches.sort((a, b) => {
    if (a.isJunction && !b.isJunction) return -1;
    if (!a.isJunction && b.isJunction) return 1;
    return a.city.localeCompare(b.city);
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

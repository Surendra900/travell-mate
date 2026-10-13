/**
 * Airport Autocomplete & Directory Service
 * Source: OurAirports Open Database & mwgg/Airports
 * License: CC0 1.0 Universal / MIT
 */

import airportsData from '../../shared/data/airports.json' with { type: 'json' };

export const AIRPORTS = Array.isArray(airportsData) ? airportsData : [];

const SEARCH_INDEX = AIRPORTS.map(a => {
  const code = String(a.iataCode || '').toUpperCase();
  const name = String(a.name || '').toUpperCase();
  const city = String(a.city || '').toUpperCase();
  const state = String(a.state || '').toUpperCase();
  return {
    ...a,
    code,
    name: a.name || a.iataCode,
    city: a.city || a.name || a.iataCode,
    searchText: `${code} ${name} ${city} ${state}`
  };
});

/**
 * Searches airports by IATA code, airport name, or city
 * @param {string} query: Search query
 * @param {number} limit: Maximum results
 * @returns {Array} List of matching airport records
 */
export function searchAirports(query = '', limit = 10) {
  const q = String(query).trim().toUpperCase();
  if (!q) {
    // Return major metro airports by default
    const major = ['DEL', 'BOM', 'BLR', 'MAA', 'HYD', 'CCU', 'AMD', 'PNQ', 'COK', 'GOI'];
    return AIRPORTS.filter(a => major.includes(a.iataCode)).slice(0, limit);
  }

  const exactCodeMatches = [];
  const startsWithMatches = [];
  const containsMatches = [];

  for (const a of SEARCH_INDEX) {
    if (a.code === q) {
      exactCodeMatches.push(a);
    } else if (a.code.startsWith(q) || a.city.toUpperCase().startsWith(q) || a.name.toUpperCase().startsWith(q)) {
      startsWithMatches.push(a);
    } else if (a.searchText.includes(q)) {
      containsMatches.push(a);
    }
  }

  return [...exactCodeMatches, ...startsWithMatches, ...containsMatches].slice(0, limit);
}

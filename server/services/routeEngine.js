/**
 * TravelMate Route Recovery Engine v2
 * Time-Expanded Timetable Graph Search, Intermodal Transfers,
 * Minimum Connection Times, 3-Tier Ranking & Honesty Provenance
 * Reference: docs/MASTER_SPEC.md Sections 5 & 6
 * Standing Decisions: S7 (data age honesty), S8 (detour limit 1.35x)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMinimumConnectionTime, isOvernightTime } from '../config/connectionTimes.js';
export { isOvernightTime };
import { evaluateConnectionReliability, RISK_LEVELS } from '../config/reliabilityModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data store singleton
let cachedData = null;

export const CODE_EQUIVALENTS = {
  'DDU': ['MGS', 'DDU'],
  'MGS': ['MGS', 'DDU'],
  'PRYJ': ['ALD', 'PRYJ'],
  'ALD': ['ALD', 'PRYJ'],
  'MMCT': ['BCT', 'MMCT'],
  'BCT': ['BCT', 'MMCT'],
  'CSMT': ['CSTM', 'CSMT'],
  'CSTM': ['CSTM', 'CSMT'],
  'VGLJ': ['JHS', 'VGLJ'],
  'JHS': ['JHS', 'VGLJ'],
  'AYC': ['FD', 'AYC'],
  'FD': ['FD', 'AYC'],
  'RKMP': ['HBJ', 'RKMP'],
  'HBJ': ['HBJ', 'RKMP'],
  'NDPM': ['HBD', 'NDPM'],
  'HBD': ['HBD', 'NDPM']
};

export function matchesStationCode(stn, target) {
  if (!stn || !target) return false;
  const s = String(stn).trim().toUpperCase();
  const t = String(target).trim().toUpperCase();
  if (s === t) return true;
  const eq = CODE_EQUIVALENTS[t];
  return eq ? eq.includes(s) : false;
}

function haversineDistanceKm(c1, c2) {
  if (!c1 || !c2) return null;
  const lat1 = c1.lat ?? c1.latitude;
  const lon1 = c1.lng ?? c1.longitude;
  const lat2 = c2.lat ?? c2.latitude;
  const lon2 = c2.lng ?? c2.longitude;
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;

  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function loadData() {
  if (cachedData) return cachedData;

  const dataDir = path.resolve(__dirname, '../../shared/data');
  const fallbackDir = path.resolve(__dirname, '../../data/processed');

  const readJson = (name) => {
    const primaryPath = path.join(dataDir, name);
    if (fs.existsSync(primaryPath)) {
      return JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
    }
    const fallbackPath = path.join(fallbackDir, name);
    if (fs.existsSync(fallbackPath)) {
      return JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
    }
    return [];
  };

  const stations = readJson('stations.json');
  const trains = readJson('trains.json');
  const stationStops = readJson('station_stops.json');
  const aliases = readJson('station_aliases.json');
  const junctions = readJson('junctions.json');
  const terminals = readJson('terminals.json');
  const airports = readJson('airports.json');
  const transferGuides = readJson('transfer_guides.json');
  const manifest = readJson('manifest.json');
  const legacyStops = readJson('stops.json');

  // Build high-performance in-memory indexes
  const stationByCode = new Map();
  const stationCoords = new Map();
  for (const s of stations) {
    stationByCode.set(s.code, s);
    if (s.latitude != null && s.longitude != null) {
      stationCoords.set(s.code, { lat: s.latitude, lng: s.longitude });
    }
  }

  const aliasMap = new Map();
  for (const a of aliases) {
    if (a.oldCode) aliasMap.set(a.oldCode.toUpperCase(), a.currentCode.toUpperCase());
    if (a.oldName) aliasMap.set(a.oldName.toUpperCase(), a.currentCode.toUpperCase());
    if (a.currentName) aliasMap.set(a.currentName.toUpperCase(), a.currentCode.toUpperCase());
  }

  const trainByNumber = new Map();
  for (const t of trains) {
    trainByNumber.set(t.number, t);
  }

  // Map station to train numbers and track frequency
  const stationToTrains = new Map();
  const stationTrainCounts = new Map();

  for (const [trainNumber, stops] of Object.entries(stationStops)) {
    for (const stop of stops) {
      const stnCode = stop[0];
      const equivalentCodes = CODE_EQUIVALENTS[stnCode] || [stnCode];
      for (const eqCode of equivalentCodes) {
        if (!stationToTrains.has(eqCode)) {
          stationToTrains.set(eqCode, new Set());
        }
        stationToTrains.get(eqCode).add(trainNumber);
        stationTrainCounts.set(eqCode, (stationTrainCounts.get(eqCode) || 0) + 1);
      }
    }
  }

  cachedData = {
    stations,
    trains,
    stationStops,
    legacyStops,
    aliases,
    junctions,
    terminals,
    airports,
    transferGuides,
    manifest,
    stationByCode,
    aliasMap,
    trainByNumber,
    stationToTrains,
    stationTrainCounts,
    stationCoords
  };

  return cachedData;
}

const CITY_PRIMARY_STATIONS = {
  'MUMBAI': 'MMCT',
  'BOMBAY': 'MMCT',
  'DELHI': 'NDLS',
  'NEW DELHI': 'NDLS',
  'KOLKATA': 'HWH',
  'CALCUTTA': 'HWH',
  'HOWRAH': 'HWH',
  'CHENNAI': 'MAS',
  'MADRAS': 'MAS',
  'BENGALURU': 'SBC',
  'BANGALORE': 'SBC',
  'HYDERABAD': 'SC',
  'SECUNDERABAD': 'SC',
  'PATNA': 'PNBE',
  'KANPUR': 'CNB',
  'VARANASI': 'BSB',
  'AHMEDABAD': 'ADI',
  'JAIPUR': 'JP',
  'LUCKNOW': 'LKO',
  'RAJAHMUNDRY': 'RJY',
  'RAJAMAHENDRAVARAM': 'RJY',
  'VIJAYAWADA': 'BZA',
  'BEZAWADA': 'BZA',
  'PRAYAGRAJ': 'PRYJ',
  'ALLAHABAD': 'PRYJ',
  'MUGHALSARAI': 'DDU',
  'MUGHAL SARAI': 'DDU'
};

/**
 * Resolves a city name or code to a canonical railway station code
 */
export function resolveStationCode(input = '') {
  if (!input) return null;
  const data = loadData();
  const query = String(input).trim().toUpperCase();

  // 1. Primary city shortcut
  if (CITY_PRIMARY_STATIONS[query]) {
    return CITY_PRIMARY_STATIONS[query];
  }

  // 2. Direct code match in stationByCode
  if (data.stationByCode.has(query)) {
    return query;
  }

  // 3. Known historical or renamed station alias
  if (data.aliasMap.has(query)) {
    return data.aliasMap.get(query);
  }

  // 4. Match station name in stations list
  const nameMatch = data.stations.find(s => 
    s.name && s.name.toUpperCase() === query
  );
  if (nameMatch) return nameMatch.code;

  // 5. Substring / city match
  const partial = data.stations.find(s =>
    (s.city && s.city.toUpperCase() === query) ||
    (s.name && s.name.toUpperCase().includes(query)) ||
    (s.city && query.includes(s.city.toUpperCase()))
  );
  if (partial) return partial.code;

  return query;
}

/**
 * Resolves a station code or name to a human city name for bus/intercity links
 */
export function resolveStationCity(input = '') {
  if (!input) return 'hub';
  const { stations, junctions } = loadData();
  const query = String(input).trim().toUpperCase();

  // 1. Check exact code match in stations
  const exactStation = stations?.find(s => s.code === query || s.name?.toUpperCase() === query);
  if (exactStation?.city) {
    return exactStation.city.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // 2. Check exact match in junctions
  const exactJunction = junctions?.find(j => j.stationCode === query || j.cityName?.toUpperCase() === query);
  if (exactJunction?.cityName) {
    return exactJunction.cityName.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // 3. Check reverse of CITY_PRIMARY_STATIONS
  for (const [cityName, stationCode] of Object.entries(CITY_PRIMARY_STATIONS)) {
    if (stationCode === query) {
      return cityName.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
  }

  // 4. Substring match in station names
  const partialStation = stations?.find(s => s.name?.toUpperCase().includes(query) || (s.code && query.includes(s.code)));
  if (partialStation?.city) {
    return partialStation.city.toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // 5. Strip parentheses or brackets (e.g., "Patna (PNBE)" -> "patna")
  const stripped = String(input).split(/[\(\-,]/)[0].trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return stripped || 'hub';
}

/**
 * Resolves a station code or city name to a standard airport IATA code
 */
export function resolveStationAirportIata(input = '') {
  if (!input) return '';
  const { airports } = loadData();
  const query = String(input).trim().toUpperCase();

  // 1. Direct IATA code match
  const directAirport = airports?.find(a => a.iataCode === query);
  if (directAirport) return directAirport.iataCode;

  // 2. Known station to airport IATA mapping for top trunk hubs
  const STATION_TO_IATA = {
    'NDLS': 'DEL',
    'DLI': 'DEL',
    'NZM': 'DEL',
    'ANVT': 'DEL',
    'MMCT': 'BOM',
    'CSMT': 'BOM',
    'BDTS': 'BOM',
    'PNBE': 'PAT',
    'HWH': 'CCU',
    'SDAH': 'CCU',
    'MAS': 'MAA',
    'MS': 'MAA',
    'SBC': 'BLR',
    'YPR': 'BLR',
    'SC': 'HYD',
    'HYB': 'HYD',
    'ADI': 'AMD',
    'JP': 'JAI',
    'LKO': 'LKO',
    'CNB': 'KNU',
    'BPL': 'BHO',
    'NGP': 'NAG',
    'BSB': 'VNS',
    'DDU': 'VNS',
    'GHY': 'GAU',
    'PUNE': 'PNQ',
    'BBI': 'BBI',
    'ASR': 'ATQ',
    'CDG': 'IXC',
    'RJY': 'RJA',
    'BZA': 'VGA',
    'VSKP': 'VTZ'
  };

  if (STATION_TO_IATA[query]) {
    return STATION_TO_IATA[query];
  }

  // 3. Resolve city and look up in airports
  const city = resolveStationCity(input);
  const airportByCity = airports?.find(a => a.city.toLowerCase().replace(/[^a-z0-9]/g, '') === city);
  if (airportByCity) return airportByCity.iataCode;

  const COMMON_CITY_IATA = {
    'delhi': 'DEL',
    'mumbai': 'BOM',
    'bengaluru': 'BLR',
    'bangalore': 'BLR',
    'kolkata': 'CCU',
    'chennai': 'MAA',
    'hyderabad': 'HYD',
    'patna': 'PAT',
    'ahmedabad': 'AMD',
    'pune': 'PNQ',
    'jaipur': 'JAI',
    'lucknow': 'LKO',
    'guwahati': 'GAU',
    'bhopal': 'BHO',
    'nagpur': 'NAG',
    'varanasi': 'VNS',
    'kanpur': 'KNU'
  };

  return COMMON_CITY_IATA[city] || city.toUpperCase();
}

/**
 * Parse 'HH:mm' or 'HH:mm:ss' time string into minutes from midnight
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string' || timeStr === 'None') return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return (h * 60) + m;
}

/**
 * Format minutes from midnight into 'HH:mm' string
 */
export function formatMinutesToTime(totalMinutes) {
  if (totalMinutes === null || totalMinutes === undefined) return '';
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60).toString().padStart(2, '0');
  const m = Math.floor(normalized % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Formats duration in minutes to human-readable 'Xh Ym' string
 */
export function formatDurationHoursMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function todayInIndia() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function resolveTravelDate(value) {
  const candidate = String(value || '').trim();

  return /^\d{4}-\d{2}-\d{2}$/.test(candidate)
    ? candidate
    : todayInIndia();
}

/**
 * Generate official, verified portal deep-links without affiliate tags
 */
export function getBookingDeepLink(mode, { fromCode, toCode, date, trainNumber, busOperator, flightNumber } = {}) {
  const cleanDate = resolveTravelDate(date);
  
  if (mode === 'train') {
    const scFrom = resolveStationCode(fromCode) || fromCode || '';
    const scTo = resolveStationCode(toCode) || toCode || '';
    return `https://www.confirmtkt.com/rbooking/trains-between-stations?fromStationCode=${encodeURIComponent(scFrom)}&toStationCode=${encodeURIComponent(scTo)}&date=${encodeURIComponent(cleanDate)}`;
  }
  
  if (mode === 'bus') {
    const fromCity = resolveStationCity(fromCode);
    const toCity = resolveStationCity(toCode);
    return `https://www.redbus.in/bus-tickets/${encodeURIComponent(fromCity)}-to-${encodeURIComponent(toCity)}?doj=${encodeURIComponent(cleanDate)}`;
  }
  
  if (mode === 'flight') {
    const fromIata = resolveStationAirportIata(fromCode);
    const toIata = resolveStationAirportIata(toCode);
    return `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(fromIata)}+to+${encodeURIComponent(toIata)}+on+${encodeURIComponent(cleanDate)}`;
  }

  return 'https://www.irctc.co.in/';
}

/**
 * Computes realistic Indian Railways telescopic fare approximation
 */
export function estimateTrainFare(distanceKm = 0, trainType = 'Superfast') {
  const d = Math.max(50, distanceKm);
  let baseSleeper = 120 + Math.round(d * 0.42);
  let base3AC = 320 + Math.round(d * 1.15);

  if (trainType === 'Vande Bharat' || trainType === 'Tejas') {
    return { sleeperFare: null, acFare: 550 + Math.round(d * 1.75), currency: 'INR' };
  }
  if (trainType === 'Rajdhani' || trainType === 'Shatabdi') {
    return { sleeperFare: null, acFare: 480 + Math.round(d * 1.55), currency: 'INR' };
  }
  return { sleeperFare: baseSleeper, acFare: base3AC, currency: 'INR' };
}

/**
 * Searches for direct train options between two stations using real timetable graph
 */
export function findDirectTrainRoutes(fromInput, toInput, travelDate) {
  const cleanTravelDate = resolveTravelDate(travelDate);
  const data = loadData();
  const fromCode = resolveStationCode(fromInput);
  const toCode = resolveStationCode(toInput);

  if (!fromCode || !toCode || fromCode === toCode) return [];

  const fromTrains = data.stationToTrains.get(fromCode);
  const toTrains = data.stationToTrains.get(toCode);

  if (!fromTrains || !toTrains) return [];

  const directItineraries = [];

  for (const trainNumber of fromTrains) {
    if (!toTrains.has(trainNumber)) continue;

    const routeStops = data.stationStops[trainNumber];
    if (!routeStops) continue;

    const stopFromIdx = routeStops.findIndex(s => matchesStationCode(s[0], fromCode));
    const stopToIdx = routeStops.findIndex(s => matchesStationCode(s[0], toCode));

    // Origin must appear before destination in chronological journey sequence
    if (stopFromIdx === -1 || stopToIdx === -1 || stopFromIdx >= stopToIdx) {
      continue;
    }

    const stopFrom = routeStops[stopFromIdx];
    const stopTo = routeStops[stopToIdx];

    // Format departure and arrival strings
    const depTime = stopFrom[6] ? stopFrom[6].slice(0, 5) : formatMinutesToTime(stopFrom[3]);
    const arrTime = stopTo[5] ? stopTo[5].slice(0, 5) : formatMinutesToTime(stopTo[2]);

    if (!depTime || !arrTime) continue;

    const depMin = stopFrom[3] !== null ? stopFrom[3] : parseTimeToMinutes(depTime);
    const arrMin = stopTo[2] !== null ? stopTo[2] : parseTimeToMinutes(arrTime);
    const dayDiff = (stopTo[4] || 1) - (stopFrom[4] || 1);
    let durationMin = (dayDiff * 1440) + (arrMin - depMin);
    if (durationMin <= 0) durationMin += 1440;

    const fromCoords = data.stationCoords.get(fromCode);
    const toCoords = data.stationCoords.get(toCode);
    const distanceKm = haversineDistanceKm(fromCoords, toCoords) || 150;

    const trainMeta = data.trainByNumber.get(trainNumber) || {};
    const trainName = trainMeta.name || `Express ${trainNumber}`;
    const trainType = trainMeta.type || 'Express';

    const fares = estimateTrainFare(distanceKm, trainType);

    directItineraries.push({
      id: `direct_${trainNumber}_${fromCode}_${toCode}`,
      type: 'direct',
      mode: 'train',
      trainNumber,
      trainName,
      trainType,
      originCode: fromCode,
      destCode: toCode,
      departTime: depTime,
      arriveTime: arrTime,
      durationMinutes: durationMin,
      durationFormatted: formatDurationHoursMinutes(durationMin),
      distanceKm,
      dayOffset: dayDiff,
      estimatedFare: fares.acFare || fares.sleeperFare || 650,
      fareFormatted: `₹${fares.acFare || fares.sleeperFare || 650}`,
      provenance: 'TIMETABLE',
      provenanceNote: 'Timetable data (community snapshot, about 2016)',
      runningDays: 'Running days unknown. Check before you travel',
      runningDaysNote: 'Running days unknown. Check before you travel',
      bookingUrl: getBookingDeepLink('train', { fromCode, toCode, date: cleanTravelDate, trainNumber })
    });
  }

  return directItineraries.sort((a, b) => a.durationMinutes - b.durationMinutes);
}

/**
 * Searches 1-transfer itineraries with data-driven hub ranking and detour bounding
 * Standing Decision S8: Detour ratio <= 1.35x direct distance
 */
export function findConnectingRoutes(fromInput, toInput, {
  travelDate,
  maxTransfers = 1,
  allowOvernight = false,
  includeHighRisk = false,
  preferredMode = 'all'
} = {}) {
  const cleanTravelDate = resolveTravelDate(travelDate);
  const data = loadData();
  const fromCode = resolveStationCode(fromInput);
  const toCode = resolveStationCode(toInput);

  if (!fromCode || !toCode || fromCode === toCode) return [];

  const fromTrains = data.stationToTrains.get(fromCode);
  const toTrains = data.stationToTrains.get(toCode);
  if (!fromTrains || !toTrains) return [];

  const fromCoords = data.stationCoords.get(fromCode);
  const toCoords = data.stationCoords.get(toCode);
  const directDist = haversineDistanceKm(fromCoords, toCoords) || 200;

  // Identify all stations H where fromCode -> H and H -> toCode both exist
  const candidateHubMap = new Map();
  const seenHubs = new Set();

  for (const trainNumber of fromTrains) {
    const stops = data.stationStops[trainNumber];
    if (!stops) continue;
    const fIdx = stops.findIndex(s => matchesStationCode(s[0], fromCode));
    if (fIdx === -1) continue;

    for (let i = fIdx + 1; i < stops.length; i++) {
      const hubCode = stops[i][0];
      if (seenHubs.has(hubCode)) continue;
      seenHubs.add(hubCode);

      if (matchesStationCode(hubCode, toCode)) continue; // Direct train stop, not transfer
      if (!data.stationToTrains.has(hubCode)) continue;

      // Check if hub has onward trains to toCode
      const hubTrains = data.stationToTrains.get(hubCode);
      let hasOnward = false;
      for (const ht of hubTrains) {
        if (toTrains.has(ht)) {
          const hStops = data.stationStops[ht];
          if (hStops) {
            const hIdx = hStops.findIndex(s => matchesStationCode(s[0], hubCode));
            const tIdx = hStops.findIndex(s => matchesStationCode(s[0], toCode));
            if (hIdx !== -1 && tIdx !== -1 && hIdx < tIdx) {
              hasOnward = true;
              break;
            }
          }
        }
      }

      if (!hasOnward) continue;

      // Detour sanity (Standing Decision S8)
      const hubCoords = data.stationCoords.get(hubCode);
      if (fromCoords && toCoords && hubCoords) {
        const d1 = haversineDistanceKm(fromCoords, hubCoords);
        const d2 = haversineDistanceKm(hubCoords, toCoords);
        const totalDist = d1 + d2;
        const detourRatio = totalDist / directDist;

        // Reject if detour ratio exceeds 1.35x direct distance
        if (detourRatio > 1.35) continue;

        // Reject backward travel: transfer station must be closer to destination than origin
        if (d2 >= directDist) continue;
      }

      const frequency = data.stationTrainCounts.get(hubCode) || 0;
      candidateHubMap.set(hubCode, frequency);
    }
  }

  // Rank candidate hubs by train count/connectivity descending
  const sortedHubs = Array.from(candidateHubMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(e => e[0]);

  const itineraries = [];

  for (const hubCode of sortedHubs) {
    const hubStation = data.stationByCode.get(hubCode);
    const hubCity = hubStation ? (hubStation.city || hubStation.name) : hubCode;
    const hubTrains = data.stationToTrains.get(hubCode);
    if (!hubTrains) continue;

    // 1. Leg 1 trains: fromCode -> hubCode
    const leg1Candidates = [];
    for (const tNum of fromTrains) {
      if (!hubTrains.has(tNum)) continue;
      const stops = data.stationStops[tNum];
      if (!stops) continue;
      const sFromIdx = stops.findIndex(s => matchesStationCode(s[0], fromCode));
      const sHubIdx = stops.findIndex(s => matchesStationCode(s[0], hubCode));
      if (sFromIdx !== -1 && sHubIdx !== -1 && sFromIdx < sHubIdx) {
        const sFrom = stops[sFromIdx];
        const sHub = stops[sHubIdx];
        const depTime = sFrom[6] ? sFrom[6].slice(0, 5) : formatMinutesToTime(sFrom[3]);
        const arrTime = sHub[5] ? sHub[5].slice(0, 5) : formatMinutesToTime(sHub[2]);
        if (!depTime || !arrTime) continue;

        const depMin = sFrom[3] !== null ? sFrom[3] : parseTimeToMinutes(depTime);
        const arrMin = sHub[2] !== null ? sHub[2] : parseTimeToMinutes(arrTime);
        const dayDiff = (sHub[4] || 1) - (sFrom[4] || 1);
        let durMin = (dayDiff * 1440) + (arrMin - depMin);
        if (durMin <= 0) durMin += 1440;

        const tMeta = data.trainByNumber.get(tNum) || {};
        leg1Candidates.push({
          trainNumber: tNum,
          trainName: tMeta.name || `Express ${tNum}`,
          trainType: tMeta.type || 'Express',
          depTime,
          arrTime,
          depMin,
          arrMin,
          durMin
        });
      }
    }

    if (leg1Candidates.length === 0) continue;

    // 2. Leg 2 trains: hubCode -> toCode
    const leg2Candidates = [];
    for (const tNum of hubTrains) {
      if (!toTrains.has(tNum)) continue;
      const stops = data.stationStops[tNum];
      if (!stops) continue;
      const sHubIdx = stops.findIndex(s => matchesStationCode(s[0], hubCode));
      const sToIdx = stops.findIndex(s => matchesStationCode(s[0], toCode));
      if (sHubIdx !== -1 && sToIdx !== -1 && sHubIdx < sToIdx) {
        const sHub = stops[sHubIdx];
        const sTo = stops[sToIdx];
        const depTime = sHub[6] ? sHub[6].slice(0, 5) : formatMinutesToTime(sHub[3]);
        const arrTime = sTo[5] ? sTo[5].slice(0, 5) : formatMinutesToTime(sTo[2]);
        if (!depTime || !arrTime) continue;

        const depMin = sHub[3] !== null ? sHub[3] : parseTimeToMinutes(depTime);
        const arrMin = sTo[2] !== null ? sTo[2] : parseTimeToMinutes(arrTime);
        const dayDiff = (sTo[4] || 1) - (sHub[4] || 1);
        let durMin = (dayDiff * 1440) + (arrMin - depMin);
        if (durMin <= 0) durMin += 1440;

        const tMeta = data.trainByNumber.get(tNum) || {};
        leg2Candidates.push({
          trainNumber: tNum,
          trainName: tMeta.name || `Express ${tNum}`,
          trainType: tMeta.type || 'Express',
          depTime,
          arrTime,
          depMin,
          arrMin,
          durMin
        });
      }
    }

    if (leg2Candidates.length === 0) continue;

    // Connect Leg 1 + Leg 2
    for (const l1 of leg1Candidates.slice(0, 3)) {
      for (const l2 of leg2Candidates.slice(0, 3)) {
        if (l1.trainNumber === l2.trainNumber) continue;

        let slackMinutes = l2.depMin - l1.arrMin;
        if (slackMinutes < 0) {
          slackMinutes += 1440;
        }

        const mct = getMinimumConnectionTime('train', 'train', true); // 45 min
        if (slackMinutes < mct && !includeHighRisk) continue;

        const isArrOvernight = isOvernightTime(l1.arrTime);
        const isDepOvernight = isOvernightTime(l2.depTime);
        const isOvernightLayover = isArrOvernight || isDepOvernight;
        if (isOvernightLayover && !allowOvernight) continue;

        const reliability = evaluateConnectionReliability({
          slackMinutes,
          mode1: 'train',
          mode2: 'train',
          sameStation: true,
          leg1VehicleName: l1.trainName
        });

        const l1Fare = estimateTrainFare(150, l1.trainType);
        const l2Fare = estimateTrainFare(150, l2.trainType);
        const totalFare = (l1Fare.acFare || 500) + (l2Fare.acFare || 500);
        const totalDurationMin = l1.durMin + slackMinutes + l2.durMin;

        itineraries.push({
          id: `split_rail_${l1.trainNumber}_${l2.trainNumber}_via_${hubCode}`,
          type: 'split_route',
          category: 'rail_rail',
          hubCode,
          hubCity,
          whyPicked: `Authentic connecting corridor via ${hubCity} (${candidateHubMap.get(hubCode) || 10} trains, detour bounded <= 1.35x).`,
          rationale: `Connects ${l1.trainName} to ${l2.trainName} via ${hubCity} with a verified ${slackMinutes}-minute transfer window. Serves as an alternative if direct trains are waitlisted.`,
          totalDurationMin,
          totalDurationFormatted: formatDurationHoursMinutes(totalDurationMin),
          totalFare,
          fareFormatted: `₹${totalFare}`,
          slackMinutes,
          slackFormatted: formatDurationHoursMinutes(slackMinutes),
          reliability,
          isOvernight: isOvernightLayover,
          legalNotice: 'These are independent bookings. If one leg is delayed, other operators owe you nothing and TravelMate cannot guarantee refunds or compensation.',
          leg1: {
            mode: 'train',
            vehicleNumber: l1.trainNumber,
            vehicleName: l1.trainName,
            from: fromCode,
            to: hubCode,
            depart: l1.depTime,
            arrive: l1.arrTime,
            durationMin: l1.durMin,
            durationFormatted: formatDurationHoursMinutes(l1.durMin),
            fare: l1Fare.acFare || 500,
            fareFormatted: `₹${l1Fare.acFare || 500}`,
            provenance: 'TIMETABLE',
            provenanceNote: 'Timetable data (community snapshot, about 2016)',
            runningDays: 'Running days unknown. Check before you travel',
            runningDaysNote: 'Running days unknown. Check before you travel',
            bookingLink: getBookingDeepLink('train', { fromCode, toCode: hubCode, date: cleanTravelDate, trainNumber: l1.trainNumber })
          },
          transfer: {
            type: 'same_station',
            location: `${hubCity} (${hubCode})`,
            durationMin: slackMinutes,
            durationFormatted: formatDurationHoursMinutes(slackMinutes),
            mctMinutes: mct,
            guidance: `Transfer between platforms at ${hubCity}. Minimum connection time is ${mct} minutes.`
          },
          leg2: {
            mode: 'train',
            vehicleNumber: l2.trainNumber,
            vehicleName: l2.trainName,
            from: hubCode,
            to: toCode,
            depart: l2.depTime,
            arrive: l2.arrTime,
            durationMin: l2.durMin,
            durationFormatted: formatDurationHoursMinutes(l2.durMin),
            fare: l2Fare.acFare || 500,
            fareFormatted: `₹${l2Fare.acFare || 500}`,
            provenance: 'TIMETABLE',
            provenanceNote: 'Timetable data (community snapshot, about 2016)',
            runningDays: 'Running days unknown. Check before you travel',
            runningDaysNote: 'Running days unknown. Check before you travel',
            bookingLink: getBookingDeepLink('train', { fromCode: hubCode, toCode, date: cleanTravelDate, trainNumber: l2.trainNumber })
          }
        });
      }
    }
  }

  return itineraries;
}

/**
 * Ranks itineraries into 3 distinct user tiers: Budget, Balanced, and Fastest
 */
export function rankItinerariesIntoTiers(itineraries = []) {
  if (!itineraries || itineraries.length === 0) return [];

  // Filter out any itineraries violating MCT
  const valid = itineraries.filter(i => !i.reliability?.isViolatingMct);
  if (valid.length === 0) return itineraries.slice(0, 3);

  // 1. Budget Tier: lowest total fare
  const budgetSorted = [...valid].sort((a, b) => a.totalFare - b.totalFare);
  const budget = budgetSorted[0];

  // 2. Fastest Tier: shortest total duration
  const fastestSorted = [...valid].sort((a, b) => a.totalDurationMin - b.totalDurationMin);
  const fastest = fastestSorted.find(i => i.id !== budget.id) || fastestSorted[0];

  // 3. Balanced Tier: optimal combination of high reliability and reasonable cost
  const balancedCandidates = valid.filter(i => 
    i.id !== budget.id && 
    i.id !== fastest.id && 
    (i.reliability?.riskLevel === RISK_LEVELS.SAFE || i.reliability?.riskLevel === RISK_LEVELS.MODERATE)
  );

  let balanced = balancedCandidates[0];
  if (!balanced) {
    balanced = valid.find(i => i.id !== budget.id && i.id !== fastest.id) || valid[1] || valid[0];
  }

  return [
    { ...budget, tier: 'paisa-vasool', tierLabel: 'Paisa Vasool (Budget)', badgeColor: 'bg-emerald-600' },
    { ...balanced, tier: 'smart-balanced', tierLabel: 'Smart Balanced', badgeColor: 'bg-blue-600' },
    { ...fastest, tier: 'emergency-express', tierLabel: 'Fastest Route', badgeColor: 'bg-amber-600' }
  ];
}

/**
 * Unified Route Recovery Search Engine
 * Returns direct trains + 3-tier split route alternatives
 */
export function searchRecoveryRoutes({
  from = '',
  to = '',
  date = '',
  maxTransfers = 1,
  allowOvernight = false,
  includeHighRisk = false
} = {}) {
  const travelDate = resolveTravelDate(date);
  const directRoutes = findDirectTrainRoutes(from, to, travelDate);
  const connectingRoutes = findConnectingRoutes(from, to, {
    travelDate,
    maxTransfers,
    allowOvernight,
    includeHighRisk
  });

  const rankedTiers = rankItinerariesIntoTiers(connectingRoutes);

  return {
    origin: resolveStationCode(from),
    destination: resolveStationCode(to),
    date: travelDate,
    directCount: directRoutes.length,
    directRoutes,
    splitRoutesCount: connectingRoutes.length,
    rankedTiers,
    allSplitRoutes: connectingRoutes,
    attribution: 'Timetable data (community snapshot, about 2016) · Map data © OpenStreetMap contributors · Weather data by Open-Meteo'
  };
}

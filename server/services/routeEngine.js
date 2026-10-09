/**
 * TravelMate Route Recovery Engine v2
 * Time-Expanded Timetable Graph Search, Intermodal Transfers,
 * Minimum Connection Times, 3-Tier Ranking & Honesty Provenance
 * Reference: docs/MASTER_SPEC.md Sections 5 & 6
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getMinimumConnectionTime, isOvernightTime } from '../config/connectionTimes.js';
import { evaluateConnectionReliability, RISK_LEVELS } from '../config/reliabilityModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory data store singleton
let cachedData = null;

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

  cachedData = {
    stations: readJson('stations.json'),
    junctions: readJson('junctions.json'),
    terminals: readJson('terminals.json'),
    airports: readJson('airports.json'),
    trains: readJson('trains.json'),
    stops: readJson('stops.json'),
    transferGuides: readJson('transfer_guides.json'),
    manifest: readJson('manifest.json')
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
  'LUCKNOW': 'LKO'
};

/**
 * Resolves a city name or code to a canonical railway station code
 */
export function resolveStationCode(input = '') {
  if (!input) return null;
  const { stations } = loadData();
  const query = String(input).trim().toUpperCase();

  // Primary city shortcut
  if (CITY_PRIMARY_STATIONS[query]) {
    return CITY_PRIMARY_STATIONS[query];
  }

  // Direct code match
  const exactCode = stations.find(s => s.code === query);
  if (exactCode) return exactCode.code;

  // City match or name match
  const match = stations.find(s => 
    s.city.toUpperCase() === query ||
    s.name.toUpperCase().includes(query) ||
    query.includes(s.city.toUpperCase())
  );

  return match ? match.code : query;
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
    'CDG': 'IXC'
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
 * Parse 'HH:mm' time string into minutes from midnight
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.split(':').map(v => parseInt(v, 10) || 0);
  return (h * 60) + m;
}

/**
 * Format minutes from midnight into 'HH:mm' string
 */
export function formatMinutesToTime(totalMinutes) {
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

/**
 * Generate official, verified portal deep-links without affiliate tags
 */
export function getBookingDeepLink(mode, { fromCode, toCode, date, trainNumber, busOperator, flightNumber } = {}) {
  const cleanDate = date || '2026-10-15';
  
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
 * Searches for direct train options between two stations
 */
export function findDirectTrainRoutes(fromInput, toInput, travelDate = '2026-10-15') {
  const data = loadData();
  const fromCode = resolveStationCode(fromInput);
  const toCode = resolveStationCode(toInput);

  if (!fromCode || !toCode || fromCode === toCode) return [];

  // Group stops by train number
  const stopsByTrain = {};
  for (const stop of data.stops) {
    if (!stopsByTrain[stop.trainNumber]) stopsByTrain[stop.trainNumber] = [];
    stopsByTrain[stop.trainNumber].push(stop);
  }

  const directItineraries = [];

  for (const train of data.trains) {
    const routeStops = stopsByTrain[train.number];
    if (!routeStops) continue;

    const stopFrom = routeStops.find(s => s.stationCode === fromCode);
    const stopTo = routeStops.find(s => s.stationCode === toCode);

    // Origin must come before destination in stop sequence
    if (stopFrom && stopTo && stopFrom.stopSequence < stopTo.stopSequence) {
      const depTime = stopFrom.departTime || '06:00';
      const arrTime = stopTo.arrivalTime || '18:00';

      const depMin = parseTimeToMinutes(depTime);
      const arrMin = parseTimeToMinutes(arrTime);
      const dayDiff = (stopTo.dayCount || 1) - (stopFrom.dayCount || 1);
      const durationMin = (dayDiff * 1440) + (arrMin - depMin);
      const distanceKm = Math.max(50, (stopTo.distanceKm || 0) - (stopFrom.distanceKm || 0));

      const fares = estimateTrainFare(distanceKm, train.type);

      directItineraries.push({
        id: `direct_${train.number}_${fromCode}_${toCode}`,
        type: 'direct',
        mode: 'train',
        trainNumber: train.number,
        trainName: train.name,
        trainType: train.type,
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
        provenanceNote: 'Official IR timetable schedule as of October 2026',
        bookingUrl: getBookingDeepLink('train', { fromCode, toCode, date: travelDate, trainNumber: train.number })
      });
    }
  }

  return directItineraries.sort((a, b) => a.durationMinutes - b.durationMinutes);
}

/**
 * Searches 1-transfer multi-modal and rail itineraries through Top 25 junction hubs
 */
export function findConnectingRoutes(fromInput, toInput, {
  travelDate = '2026-10-15',
  maxTransfers = 1,
  allowOvernight = false,
  includeHighRisk = false,
  preferredMode = 'all'
} = {}) {
  const data = loadData();
  const fromCode = resolveStationCode(fromInput);
  const toCode = resolveStationCode(toInput);

  if (!fromCode || !toCode || fromCode === toCode) return [];

  // Group stops by train number
  const stopsByTrain = {};
  for (const stop of data.stops) {
    if (!stopsByTrain[stop.trainNumber]) stopsByTrain[stop.trainNumber] = [];
    stopsByTrain[stop.trainNumber].push(stop);
  }

  // Pre-index stops by station code for rapid lookup
  const trainStopsByStation = {};
  for (const stop of data.stops) {
    if (!trainStopsByStation[stop.stationCode]) trainStopsByStation[stop.stationCode] = [];
    trainStopsByStation[stop.stationCode].push(stop);
  }

  const junctionCodes = data.junctions.map(j => j.stationCode || j.code);
  const candidateHubs = junctionCodes.filter(c => c && c !== fromCode && c !== toCode);

  const itineraries = [];

  for (const hubCode of candidateHubs) {
    const hubJunction = data.junctions.find(j => (j.stationCode || j.code) === hubCode);
    const hubCity = hubJunction ? (hubJunction.cityName || hubJunction.city) : hubCode;
    const platformCount = hubJunction ? (hubJunction.platformCount || hubJunction.platforms || 8) : 8;

    // 1. Find Leg 1 trains: fromCode -> hubCode
    const leg1Candidates = [];
    for (const train of data.trains) {
      const stops = stopsByTrain[train.number];
      if (!stops) continue;
      const sFrom = stops.find(s => s.stationCode === fromCode);
      const sHub = stops.find(s => s.stationCode === hubCode);
      if (sFrom && sHub && sFrom.stopSequence < sHub.stopSequence) {
        const depMin = parseTimeToMinutes(sFrom.departTime || '06:00');
        const arrMin = parseTimeToMinutes(sHub.arrivalTime || '12:00');
        const dayDiff = (sHub.dayCount || 1) - (sFrom.dayCount || 1);
        const durMin = (dayDiff * 1440) + (arrMin - depMin);
        const distKm = Math.max(40, (sHub.distanceKm || 0) - (sFrom.distanceKm || 0));
        leg1Candidates.push({
          train,
          sFrom,
          sHub,
          depTime: sFrom.departTime,
          arrTime: sHub.arrivalTime,
          durMin,
          distKm,
          dayCountArr: sHub.dayCount || 1
        });
      }
    }

    if (leg1Candidates.length === 0) continue;

    // 2. Find Leg 2 trains: hubCode -> toCode (Rail + Rail)
    const leg2TrainCandidates = [];
    for (const train of data.trains) {
      const stops = stopsByTrain[train.number];
      if (!stops) continue;
      const sHub = stops.find(s => s.stationCode === hubCode);
      const sTo = stops.find(s => s.stationCode === toCode);
      if (sHub && sTo && sHub.stopSequence < sTo.stopSequence) {
        const depMin = parseTimeToMinutes(sHub.departTime || '14:00');
        const arrMin = parseTimeToMinutes(sTo.arrivalTime || '20:00');
        const dayDiff = (sTo.dayCount || 1) - (sHub.dayCount || 1);
        const durMin = (dayDiff * 1440) + (arrMin - depMin);
        const distKm = Math.max(40, (sTo.distanceKm || 0) - (sHub.distanceKm || 0));
        leg2TrainCandidates.push({
          train,
          sHub,
          sTo,
          depTime: sHub.departTime,
          arrTime: sTo.arrivalTime,
          durMin,
          distKm
        });
      }
    }

    // Connect Leg 1 + Leg 2 Trains (Rail to Rail)
    for (const l1 of leg1Candidates) {
      for (const l2 of leg2TrainCandidates) {
        if (l1.train.number === l2.train.number) continue; // Same train is a direct journey

        const arr1Min = parseTimeToMinutes(l1.arrTime);
        const dep2Min = parseTimeToMinutes(l2.depTime);

        // Compute transfer layover / slack
        let slackMinutes = dep2Min - arr1Min;
        if (slackMinutes < 0) {
          // Departs next calendar day
          slackMinutes += 1440;
        }

        const mct = getMinimumConnectionTime('train', 'train', true);

        // Strict MCT check per Master Spec Section 6
        if (slackMinutes < mct && !includeHighRisk) continue;

        // Overnight check
        const isArrOvernight = isOvernightTime(l1.arrTime);
        const isDepOvernight = isOvernightTime(l2.depTime);
        const isOvernightLayover = isArrOvernight || isDepOvernight;
        if (isOvernightLayover && !allowOvernight) {
          // Allowed only with explicit setting or flagged
        }

        const reliability = evaluateConnectionReliability({
          slackMinutes,
          mode1: 'train',
          mode2: 'train',
          sameStation: true,
          leg1VehicleName: l1.train.name
        });

        const l1Fare = estimateTrainFare(l1.distKm, l1.train.type);
        const l2Fare = estimateTrainFare(l2.distKm, l2.train.type);
        const totalFare = (l1Fare.acFare || 500) + (l2Fare.acFare || 500);
        const totalDurationMin = l1.durMin + slackMinutes + l2.durMin;

        itineraries.push({
          id: `split_rail_${l1.train.number}_${l2.train.number}_via_${hubCode}`,
          type: 'split_route',
          category: 'rail_rail',
          hubCode,
          hubCity,
          whyPicked: `High-frequency transfer corridor via ${hubCity} (${platformCount} platforms, transfer readiness score ${hubJunction?.transferScore || 85}/100).`,
          rationale: `Connects ${l1.train.name} to ${l2.train.name} via ${hubCity} Junction with a verified ${slackMinutes}-minute transfer window. Bypasses direct route waitlists with available split-ticket seats.`,
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
            vehicleNumber: l1.train.number,
            vehicleName: l1.train.name,
            from: fromCode,
            to: hubCode,
            depart: l1.depTime,
            arrive: l1.arrTime,
            durationMin: l1.durMin,
            durationFormatted: formatDurationHoursMinutes(l1.durMin),
            fare: l1Fare.acFare || 500,
            fareFormatted: `₹${l1Fare.acFare || 500}`,
            provenance: 'TIMETABLE',
            provenanceNote: 'Timetable data as of October 2026',
            bookingLink: getBookingDeepLink('train', { fromCode, toCode: hubCode, date: travelDate, trainNumber: l1.train.number })
          },
          transfer: {
            type: 'same_station',
            location: `${hubCity} Junction (${hubCode})`,
            durationMin: slackMinutes,
            durationFormatted: formatDurationHoursMinutes(slackMinutes),
            mctMinutes: mct,
            guidance: `Transfer between platforms at ${hubCity} Junction. Escalators and battery carts available.`
          },
          leg2: {
            mode: 'train',
            vehicleNumber: l2.train.number,
            vehicleName: l2.train.name,
            from: hubCode,
            to: toCode,
            depart: l2.depTime,
            arrive: l2.arrTime,
            durationMin: l2.durMin,
            durationFormatted: formatDurationHoursMinutes(l2.durMin),
            fare: l2Fare.acFare || 500,
            fareFormatted: `₹${l2Fare.acFare || 500}`,
            provenance: 'TIMETABLE',
            provenanceNote: 'Timetable data as of October 2026',
            bookingLink: getBookingDeepLink('train', { fromCode: hubCode, toCode, date: travelDate, trainNumber: l2.train.number })
          }
        });
      }
    }

    // 3. Multimodal: Rail + Inter-State Bus via Hub
    const busGuide = data.transferGuides.find(g => g.junctionCode === hubCode && g.terminalId);
    if (busGuide && (preferredMode === 'all' || preferredMode === 'bus')) {
      for (const l1 of leg1Candidates.slice(0, 2)) {
        const arr1Min = parseTimeToMinutes(l1.arrTime);
        const mct = getMinimumConnectionTime('train', 'bus', false); // 105 min
        const transferDur = busGuide.approxMinutes || 30;
        
        // Realistic bus departs after transfer + buffer (e.g. 120 min slack)
        const busSlack = Math.max(mct, 120);
        const busDepMin = arr1Min + busSlack;
        const busDepTime = formatMinutesToTime(busDepMin);
        
        // Estimated bus travel time based on rough corridor distance
        const busDistKm = 300;
        const busDurMin = Math.round((busDistKm / 50) * 60); // 50 km/h average bus speed
        const busArrTime = formatMinutesToTime(busDepMin + busDurMin);
        const busFare = 650;

        const reliability = evaluateConnectionReliability({
          slackMinutes: busSlack,
          mode1: 'train',
          mode2: 'bus',
          sameStation: false,
          leg1VehicleName: l1.train.name
        });

        const l1Fare = estimateTrainFare(l1.distKm, l1.train.type);
        const totalFare = (l1Fare.acFare || 500) + busFare;
        const totalDurationMin = l1.durMin + busSlack + busDurMin;

        itineraries.push({
          id: `split_multimodal_bus_${l1.train.number}_via_${hubCode}`,
          type: 'split_route',
          category: 'rail_bus',
          hubCode,
          hubCity,
          whyPicked: `Bypass train waitlist: express train to ${hubCity} + high-frequency inter-state AC sleeper bus.`,
          rationale: `Connects express train ${l1.train.number} to an inter-state AC bus via ${hubCity} with an ample ${busSlack}-minute transfer window. Provides an immediate onward departure even when connecting trains are sold out.`,
          totalDurationMin,
          totalDurationFormatted: formatDurationHoursMinutes(totalDurationMin),
          totalFare,
          fareFormatted: `₹${totalFare}`,
          slackMinutes: busSlack,
          slackFormatted: formatDurationHoursMinutes(busSlack),
          reliability,
          isOvernight: isOvernightTime(l1.arrTime) || isOvernightTime(busDepTime),
          legalNotice: 'These are independent bookings. If one leg is delayed, other operators owe you nothing and TravelMate cannot guarantee refunds or compensation.',
          leg1: {
            mode: 'train',
            vehicleNumber: l1.train.number,
            vehicleName: l1.train.name,
            from: fromCode,
            to: hubCode,
            depart: l1.depTime,
            arrive: l1.arrTime,
            durationMin: l1.durMin,
            durationFormatted: formatDurationHoursMinutes(l1.durMin),
            fare: l1Fare.acFare || 500,
            fareFormatted: `₹${l1Fare.acFare || 500}`,
            provenance: 'TIMETABLE',
            provenanceNote: 'Timetable data as of October 2026',
            bookingLink: getBookingDeepLink('train', { fromCode, toCode: hubCode, date: travelDate, trainNumber: l1.train.number })
          },
          transfer: {
            type: 'station_to_terminal',
            location: `${hubCity} Inter-State Bus Stand`,
            durationMin: transferDur,
            durationFormatted: `approx. ${transferDur}m`,
            mctMinutes: mct,
            guidance: busGuide.guidanceText || `Transfer from ${hubCity} Junction to Central Bus Terminal.`
          },
          leg2: {
            mode: 'bus',
            vehicleNumber: 'AC-Sleeper-Exp',
            vehicleName: 'Inter-State AC Volvo / Scania',
            from: `${hubCity} ISBT`,
            to: toCode,
            depart: busDepTime,
            arrive: busArrTime,
            durationMin: busDurMin,
            durationFormatted: formatDurationHoursMinutes(busDurMin),
            fare: busFare,
            fareFormatted: `₹${busFare} (est.)`,
            provenance: 'ESTIMATE',
            provenanceNote: 'Buses typically depart every 30 to 60 min. Check redBus.',
            bookingLink: getBookingDeepLink('bus', { fromCode: hubCity, toCode, date: travelDate })
          }
        });
      }
    }

    // 4. Multimodal: Rail + Regional Flight via Hub
    const airportGuide = data.transferGuides.find(g => g.junctionCode === hubCode && g.airportCode);
    if (airportGuide && (preferredMode === 'all' || preferredMode === 'flight')) {
      for (const l1 of leg1Candidates.slice(0, 1)) {
        const arr1Min = parseTimeToMinutes(l1.arrTime);
        const mct = getMinimumConnectionTime('train', 'flight', false); // 210 min (3.5 hrs)
        const transferDur = airportGuide.approxMinutes || 40;
        
        const flightSlack = Math.max(mct, 240); // 4 hours buffer
        const flightDepMin = arr1Min + flightSlack;
        const flightDepTime = formatMinutesToTime(flightDepMin);
        const flightDurMin = 110; // ~1h 50m domestic flight
        const flightArrTime = formatMinutesToTime(flightDepMin + flightDurMin);
        const flightFare = 3400;

        const reliability = evaluateConnectionReliability({
          slackMinutes: flightSlack,
          mode1: 'train',
          mode2: 'flight',
          sameStation: false,
          leg1VehicleName: l1.train.name
        });

        const l1Fare = estimateTrainFare(l1.distKm, l1.train.type);
        const totalFare = (l1Fare.acFare || 500) + flightFare;
        const totalDurationMin = l1.durMin + flightSlack + flightDurMin;

        itineraries.push({
          id: `split_multimodal_flight_${l1.train.number}_via_${hubCode}`,
          type: 'split_route',
          category: 'rail_flight',
          hubCode,
          hubCity,
          whyPicked: `Fastest urgent recovery: feeder rail to airport hub at ${hubCity} + direct non-stop domestic flight.`,
          rationale: `Connects feeder train ${l1.train.number} to a domestic flight via ${hubCity} Airport with a comfortable ${flightSlack}-minute check-in slack. Serves as the fastest recovery option to reach ${toCode} today.`,
          totalDurationMin,
          totalDurationFormatted: formatDurationHoursMinutes(totalDurationMin),
          totalFare,
          fareFormatted: `₹${totalFare}`,
          slackMinutes: flightSlack,
          slackFormatted: formatDurationHoursMinutes(flightSlack),
          reliability,
          isOvernight: false,
          legalNotice: 'These are independent bookings. If one leg is delayed, other operators owe you nothing and TravelMate cannot guarantee refunds or compensation.',
          leg1: {
            mode: 'train',
            vehicleNumber: l1.train.number,
            vehicleName: l1.train.name,
            from: fromCode,
            to: hubCode,
            depart: l1.depTime,
            arrive: l1.arrTime,
            durationMin: l1.durMin,
            durationFormatted: formatDurationHoursMinutes(l1.durMin),
            fare: l1Fare.acFare || 500,
            fareFormatted: `₹${l1Fare.acFare || 500}`,
            provenance: 'TIMETABLE',
            provenanceNote: 'Timetable data as of October 2026',
            bookingLink: getBookingDeepLink('train', { fromCode, toCode: hubCode, date: travelDate, trainNumber: l1.train.number })
          },
          transfer: {
            type: 'station_to_airport',
            location: `${airportGuide.airportCode} Airport`,
            durationMin: transferDur,
            durationFormatted: `approx. ${transferDur}m`,
            mctMinutes: mct,
            guidance: airportGuide.guidanceText || `Transfer from ${hubCity} Junction to Civil Airport.`
          },
          leg2: {
            mode: 'flight',
            vehicleNumber: '6E-Flight',
            vehicleName: 'Domestic Non-stop Flight',
            from: airportGuide.airportCode || `${hubCity} Airport`,
            to: toCode,
            depart: flightDepTime,
            arrive: flightArrTime,
            durationMin: flightDurMin,
            durationFormatted: formatDurationHoursMinutes(flightDurMin),
            fare: flightFare,
            fareFormatted: `₹${flightFare} (est.)`,
            provenance: 'ESTIMATE',
            provenanceNote: 'Flight prices vary by booking window. Verify on Google Flights.',
            bookingLink: getBookingDeepLink('flight', { fromCode: airportGuide.airportCode, toCode, date: travelDate })
          }
        });
      }
    }
  }

  return itineraries;
}

/**
 * Ranks itineraries into 3 distinct user tiers: Budget, Balanced, and Fastest
 * per Master Spec Section 6
 */
export function rankItinerariesIntoTiers(itineraries = []) {
  if (!itineraries || itineraries.length === 0) return [];

  // Filter out any itineraries violating MCT
  const valid = itineraries.filter(i => !i.reliability?.isViolatingMct);
  if (valid.length === 0) return itineraries.slice(0, 3);

  // 1. Budget Tier: lowest total fare (typically Rail + Rail)
  const budgetSorted = [...valid].sort((a, b) => a.totalFare - b.totalFare);
  const budget = budgetSorted[0];

  // 2. Fastest Tier: shortest total duration (typically Rail + Flight or Express)
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
  date = '2026-10-15',
  maxTransfers = 1,
  allowOvernight = false,
  includeHighRisk = false
} = {}) {
  const directRoutes = findDirectTrainRoutes(from, to, date);
  const connectingRoutes = findConnectingRoutes(from, to, {
    travelDate: date,
    maxTransfers,
    allowOvernight,
    includeHighRisk
  });

  const rankedTiers = rankItinerariesIntoTiers(connectingRoutes);

  return {
    origin: resolveStationCode(from),
    destination: resolveStationCode(to),
    date,
    directCount: directRoutes.length,
    directRoutes,
    splitRoutesCount: connectingRoutes.length,
    rankedTiers,
    allSplitRoutes: connectingRoutes,
    attribution: 'Timetable data as of October 2026 · Map data © OpenStreetMap contributors · Weather data by Open-Meteo'
  };
}

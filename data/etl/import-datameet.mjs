/**
 * TravelMate Datameet Railway Dataset ETL Importer
 * Pinned commit: e0c538a1e41ae5eace454d2818902e1065608e16
 * License: CC0 1.0 Universal (Public Domain Dedication)
 * Standing Decisions: S7 (data age transparency), S9 (pinned commit & checksums)
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../..');

export const PINNED_COMMIT = 'e0c538a1e41ae5eace454d2818902e1065608e16';
export const SOURCE_REPO = 'https://github.com/datameet/railways';
export const LICENSE = 'CC0 1.0 Universal';

// Known scratch directory from autonomous clone
const SCRATCH_EXTERNAL_DIR = 'C:/Users/SURENDRA.G/.gemini/antigravity-ide/brain/039f1032-071e-48a2-831c-bafaa7c758f2/scratch/external/railways';

// Standard station aliases mapping historical, colonial, and renamed stations
export const HISTORICAL_STATION_ALIASES = [
  // Official station renames
  { oldCode: 'MGS', oldName: 'Mughal Sarai', currentCode: 'DDU', currentName: 'Pt. Deen Dayal Upadhyaya Junction', note: 'Renamed in 2018' },
  { oldCode: 'ALD', oldName: 'Allahabad Junction', currentCode: 'PRYJ', currentName: 'Prayagraj Junction', note: 'Renamed in 2020' },
  { oldCode: 'FD', oldName: 'Faizabad', currentCode: 'AYC', currentName: 'Ayodhya Cantt', note: 'Renamed in 2021' },
  { oldCode: 'JHS', oldName: 'Jhansi Junction', currentCode: 'VGLJ', currentName: 'Virangana Lakshmibai Jhansi', note: 'Renamed in 2021' },
  { oldCode: 'HBD', oldName: 'Hoshangabad', currentCode: 'NDPM', currentName: 'Narmadapuram', note: 'Renamed in 2022' },
  { oldCode: 'CR', oldName: 'Habibganj', currentCode: 'RKMP', currentName: 'Rani Kamlapati', note: 'Renamed in 2021' },

  // Regional city colloquialisms & alternative spellings
  { oldCode: 'RJY', oldName: 'Rajamahendravaram', currentCode: 'RJY', currentName: 'Rajahmundry', note: 'Local official Telugu name' },
  { oldCode: 'BZA', oldName: 'Bezawada', currentCode: 'BZA', currentName: 'Vijayawada', note: 'Historical name' },
  { oldCode: 'MAS', oldName: 'Madras', currentCode: 'MAS', currentName: 'MGR Chennai Central', note: 'Colonial name' },
  { oldCode: 'MS', oldName: 'Madras Egmore', currentCode: 'MS', currentName: 'Chennai Egmore', note: 'Colonial name' },
  { oldCode: 'BCT', oldName: 'Bombay Central', currentCode: 'MMCT', currentName: 'Mumbai Central', note: 'Historical railway code BCT' },
  { oldCode: 'MMCT', oldName: 'Mumbai Central', currentCode: 'BCT', currentName: 'Bombay Central', note: 'Canonical timetable code in Datameet' },
  { oldCode: 'CSTM', oldName: 'Victoria Terminus', currentCode: 'CSMT', currentName: 'Chhatrapati Shivaji Maharaj Terminus', note: 'Historical code CSTM' },
  { oldCode: 'CSMT', oldName: 'Chhatrapati Shivaji Maharaj Terminus', currentCode: 'CSTM', currentName: 'Victoria Terminus', note: 'Canonical timetable code in Datameet' },
  { oldCode: 'VT', oldName: 'VT', currentCode: 'CSMT', currentName: 'Chhatrapati Shivaji Maharaj Terminus', note: 'Colonial code shortcut' },
  { oldCode: 'SBC', oldName: 'Bangalore City', currentCode: 'SBC', currentName: 'KSR Bengaluru City', note: 'Colonial name' },
  { oldCode: 'HYB', oldName: 'Nampally', currentCode: 'HYB', currentName: 'Hyderabad Deccan Nampally', note: 'Colloquial local station name' },
  { oldCode: 'HWH', oldName: 'Calcutta', currentCode: 'HWH', currentName: 'Howrah Junction', note: 'Colonial city designation' },
  { oldCode: 'CNB', oldName: 'Cawnpore', currentCode: 'CNB', currentName: 'Kanpur Central', note: 'Colonial name' },
  { oldCode: 'BSB', oldName: 'Benares', currentCode: 'BSB', currentName: 'Varanasi Junction', note: 'Colonial / historical name' },
  { oldCode: 'BSB', oldName: 'Kashi', currentCode: 'BSB', currentName: 'Varanasi Junction', note: 'Sacred name' },
  { oldCode: 'VSKP', oldName: 'Vizag', currentCode: 'VSKP', currentName: 'Visakhapatnam Junction', note: 'Colloquial name' },
  { oldCode: 'VSKP', oldName: 'Waltair', currentCode: 'VSKP', currentName: 'Visakhapatnam Junction', note: 'Colonial division name' },
  { oldCode: 'PUNE', oldName: 'Poona', currentCode: 'PUNE', currentName: 'Pune Junction', note: 'Colonial name' }
];

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function parseTimeToMinutes(timeStr) {
  if (!timeStr || timeStr === 'None' || typeof timeStr !== 'string') return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return (h * 60) + m;
}

function readSourceFile(filename) {
  // Check scratch external directory first
  const scratchPath = path.join(SCRATCH_EXTERNAL_DIR, filename);
  if (fs.existsSync(scratchPath)) {
    return fs.readFileSync(scratchPath);
  }
  // Check data/raw/datameet/
  const rawPath = path.join(ROOT, 'data', 'raw', 'datameet', filename);
  if (fs.existsSync(rawPath)) {
    return fs.readFileSync(rawPath);
  }
  throw new Error(`Datameet source file not found: ${filename}. Checked ${scratchPath} and ${rawPath}`);
}

export function runDatameetImport({ dryRun = false } = {}) {
  console.log(`[ETL:Datameet] Starting ingestion (dryRun=${dryRun})...`);
  console.log(`[ETL:Datameet] Pinned commit: ${PINNED_COMMIT}`);

  // 1. Read files and compute checksums
  const stationsBuf = readSourceFile('stations.json');
  const trainsBuf = readSourceFile('trains.json');
  const schedulesBuf = readSourceFile('schedules.json');

  const checksums = {
    stations: sha256(stationsBuf),
    trains: sha256(trainsBuf),
    schedules: sha256(schedulesBuf)
  };

  console.log(`[ETL:Datameet] Stations SHA-256: ${checksums.stations}`);
  console.log(`[ETL:Datameet] Trains SHA-256:   ${checksums.trains}`);
  console.log(`[ETL:Datameet] Schedules SHA-256: ${checksums.schedules}`);

  const rawStations = JSON.parse(stationsBuf.toString('utf8'));
  const rawTrains = JSON.parse(trainsBuf.toString('utf8'));
  const rawSchedules = JSON.parse(schedulesBuf.toString('utf8'));

  // Preload junction hub city mappings
  const junctionCityMap = new Map();
  const junctionPath = path.resolve(ROOT, 'shared/data/junctions.json');
  if (fs.existsSync(junctionPath)) {
    try {
      const junctions = JSON.parse(fs.readFileSync(junctionPath, 'utf8'));
      for (const j of junctions) {
        if (j.stationCode) junctionCityMap.set(j.stationCode, j.cityName || j.city);
        if (j.code) junctionCityMap.set(j.code, j.cityName || j.city);
      }
    } catch (_) {}
  }

  // Known city mappings for primary stations
  const PRIMARY_STATION_CITIES = {
    'NDLS': 'Delhi', 'DLI': 'Delhi', 'NZM': 'Delhi', 'ANVT': 'Delhi',
    'MMCT': 'Mumbai', 'BCT': 'Mumbai', 'CSMT': 'Mumbai', 'CSTM': 'Mumbai', 'BDTS': 'Mumbai', 'LTT': 'Mumbai',
    'HWH': 'Kolkata', 'SDAH': 'Kolkata', 'KOAA': 'Kolkata',
    'MAS': 'Chennai', 'MS': 'Chennai',
    'SBC': 'Bengaluru', 'YPR': 'Bengaluru',
    'SC': 'Hyderabad', 'HYB': 'Hyderabad',
    'RJY': 'Rajahmundry', 'BZA': 'Vijayawada',
    'PNBE': 'Patna', 'CNB': 'Kanpur', 'LKO': 'Lucknow',
    'BSB': 'Varanasi', 'DDU': 'Pt. Deen Dayal Upadhyaya', 'MGS': 'Mughalsarai',
    'PRYJ': 'Prayagraj', 'ALD': 'Allahabad',
    'JP': 'Jaipur', 'ADI': 'Ahmedabad', 'PUNE': 'Pune', 'VSKP': 'Visakhapatnam',
    'JHS': 'Jhansi', 'VGLJ': 'Jhansi'
  };

  // 2. Process Stations
  const stationMap = new Map();
  let stationsWithoutCoords = 0;
  let rejectedStations = 0;

  for (const feat of rawStations.features || []) {
    const p = feat.properties || {};
    const code = String(p.code || '').trim().toUpperCase();
    if (!code) {
      rejectedStations++;
      continue;
    }

    const coords = feat.geometry?.coordinates;
    const lng = (coords && typeof coords[0] === 'number') ? coords[0] : null;
    const lat = (coords && typeof coords[1] === 'number') ? coords[1] : null;

    if (lat === null || lng === null) {
      stationsWithoutCoords++;
    }

    const name = String(p.name || code).trim();
    const state = p.state ? String(p.state).trim() : 'India';
    const zone = p.zone ? String(p.zone).trim() : null;
    const address = p.address ? String(p.address).trim() : null;
    const city = PRIMARY_STATION_CITIES[code] || junctionCityMap.get(code) || (p.city ? String(p.city).trim() : (state || name));

    stationMap.set(code, {
      code,
      name,
      city,
      state,
      zone,
      latitude: lat,
      longitude: lng,
      address,
      active: true,
      provenance: 'TIMETABLE',
      isJunction: Boolean(junctionCityMap.has(code) || (zone && ['NR', 'NCR', 'WR', 'CR', 'ER', 'ECR', 'SR', 'SCR', 'SWR', 'SECR', 'SER'].includes(zone)))
    });
  }

  // Inject known modern renames into station map if absent (e.g. DDU, PRYJ, MMCT, CSMT)
  if (!stationMap.has('DDU') && stationMap.has('MGS')) {
    const mgs = stationMap.get('MGS');
    stationMap.set('DDU', {
      ...mgs,
      code: 'DDU',
      name: 'Pt. Deen Dayal Upadhyaya Junction',
      city: 'Pt. Deen Dayal Upadhyaya'
    });
  }
  if (!stationMap.has('PRYJ') && stationMap.has('ALD')) {
    const ald = stationMap.get('ALD');
    stationMap.set('PRYJ', {
      ...ald,
      code: 'PRYJ',
      name: 'Prayagraj Junction',
      city: 'Prayagraj'
    });
  }
  if (!stationMap.has('MMCT') && stationMap.has('BCT')) {
    const bct = stationMap.get('BCT');
    stationMap.set('MMCT', {
      ...bct,
      code: 'MMCT',
      name: 'Mumbai Central',
      city: 'Mumbai'
    });
  }
  if (!stationMap.has('CSMT') && stationMap.has('CSTM')) {
    const cstm = stationMap.get('CSTM');
    stationMap.set('CSMT', {
      ...cstm,
      code: 'CSMT',
      name: 'Chhatrapati Shivaji Maharaj Terminus',
      city: 'Mumbai'
    });
  }
  if (!stationMap.has('VGLJ') && stationMap.has('JHS')) {
    const jhs = stationMap.get('JHS');
    stationMap.set('VGLJ', {
      ...jhs,
      code: 'VGLJ',
      name: 'Virangana Lakshmibai Jhansi Junction',
      city: 'Jhansi',
      isJunction: true
    });
  }

  const normalizedStations = Array.from(stationMap.values());
  console.log(`[ETL:Datameet] Normalized ${normalizedStations.length} stations (${stationsWithoutCoords} without coordinates, ${rejectedStations} rejected).`);

  // 3. Process Trains
  const trainMap = new Map();
  let rejectedTrains = 0;

  for (const feat of rawTrains.features || []) {
    const p = feat.properties || {};
    const number = String(p.number || '').trim();
    if (!number) {
      rejectedTrains++;
      continue;
    }

    const fromCode = String(p.from_station_code || '').trim().toUpperCase();
    const toCode = String(p.to_station_code || '').trim().toUpperCase();
    const name = String(p.name || `Train ${number}`).trim();
    const type = p.type ? String(p.type).trim() : 'Express';
    const zone = p.zone ? String(p.zone).trim() : null;
    const distanceKm = typeof p.distance === 'number' ? Math.round(p.distance) : null;
    const returnTrain = p.return_train ? String(p.return_train).trim() : null;

    const classFlags = {
      firstAc: Boolean(p.first_ac),
      secondAc: Boolean(p.second_ac),
      thirdAc: Boolean(p.third_ac),
      sleeper: Boolean(p.sleeper),
      chairCar: Boolean(p.chair_car),
      firstClass: Boolean(p.first_class)
    };

    trainMap.set(number, {
      number,
      name,
      type,
      fromCode,
      toCode,
      distanceKm,
      zone,
      returnTrain,
      classFlags,
      sourceDataset: 'datameet'
    });
  }

  const normalizedTrains = Array.from(trainMap.values());
  console.log(`[ETL:Datameet] Normalized ${normalizedTrains.length} trains (${rejectedTrains} rejected).`);

  // 4. Process Schedules into compact train stop structures
  // Group schedules by train number
  const schedulesByTrain = new Map();
  for (const row of rawSchedules) {
    const num = String(row.train_number || '').trim();
    if (!num) continue;
    if (!schedulesByTrain.has(num)) schedulesByTrain.set(num, []);
    schedulesByTrain.get(num).push(row);
  }

  const compactTrainStops = {};
  const stationToTrainsIndex = {};
  let totalStopsProcessed = 0;

  for (const [trainNumber, stops] of schedulesByTrain.entries()) {
    // Normalization: Ensure sequential stops and monotonic day offsets
    const stopsList = [];
    let currentDay = 1;
    let prevDepMin = 0;

    for (let idx = 0; idx < stops.length; idx++) {
      const s = stops[idx];
      const stnCode = String(s.station_code || '').trim().toUpperCase();
      if (!stnCode) continue;

      const rawArr = s.arrival === 'None' ? null : s.arrival;
      const rawDep = s.departure === 'None' ? null : s.departure;
      const arrMin = parseTimeToMinutes(rawArr);
      const depMin = parseTimeToMinutes(rawDep);
      let day = parseInt(s.day, 10);
      if (isNaN(day) || day < 1) day = currentDay;

      // Detect midnight rollover if scheduled minute resets while day is unchanged
      const effectiveMin = arrMin !== null ? arrMin : depMin;
      if (effectiveMin !== null && effectiveMin < prevDepMin && day === currentDay) {
        day += 1;
      }
      currentDay = Math.max(currentDay, day);
      if (depMin !== null) prevDepMin = depMin;

      // Stop representation: [stationCode, seq, arrMinutes, depMinutes, dayOffset, rawArr, rawDep]
      stopsList.push([
        stnCode,
        idx + 1,
        arrMin,
        depMin,
        day,
        rawArr || '',
        rawDep || ''
      ]);

      if (!stationToTrainsIndex[stnCode]) {
        stationToTrainsIndex[stnCode] = [];
      }
      stationToTrainsIndex[stnCode].push(trainNumber);
      totalStopsProcessed++;
    }

    if (stopsList.length > 0) {
      compactTrainStops[trainNumber] = stopsList;
    }
  }

  console.log(`[ETL:Datameet] Indexed ${totalStopsProcessed} stop rows across ${Object.keys(compactTrainStops).length} scheduled trains.`);

  // 5. Verification check on RJY <-> BZA corridor
  const rjyTrains = new Set(stationToTrainsIndex['RJY'] || []);
  const bzaTrains = new Set(stationToTrainsIndex['BZA'] || []);
  let directRjyToBza = 0;
  let directBzaToRjy = 0;

  for (const t of rjyTrains) {
    if (!bzaTrains.has(t)) continue;
    const stops = compactTrainStops[t];
    const rIdx = stops.findIndex(s => s[0] === 'RJY');
    const bIdx = stops.findIndex(s => s[0] === 'BZA');
    if (rIdx !== -1 && bIdx !== -1) {
      if (rIdx < bIdx) directRjyToBza++;
      if (bIdx < rIdx) directBzaToRjy++;
    }
  }

  console.log(`[ETL:Datameet] Corridor validation: RJY -> BZA direct: ${directRjyToBza} trains; BZA -> RJY direct: ${directBzaToRjy} trains.`);

  // 6. Dataset Version record
  const datasetVersion = {
    id: `ver_datameet_${PINNED_COMMIT.slice(0, 8)}`,
    source: 'datameet/railways',
    license: LICENSE,
    sourceReference: `${SOURCE_REPO}/tree/${PINNED_COMMIT}`,
    checksum: checksums.schedules,
    checksums,
    rowCounts: {
      stations: normalizedStations.length,
      trains: normalizedTrains.length,
      stopRows: totalStopsProcessed,
      scheduledTrains: Object.keys(compactTrainStops).length
    },
    importedAt: new Date().toISOString()
  };

  if (dryRun) {
    console.log('[ETL:Datameet] Dry run requested. No disk changes committed.');
    return { datasetVersion, stationsCount: normalizedStations.length, trainsCount: normalizedTrains.length, totalStopsProcessed };
  }

  // 7. Write outputs to data/processed and shared/data
  const targets = [
    path.resolve(ROOT, 'data/processed'),
    path.resolve(ROOT, 'shared/data')
  ];

  for (const dir of targets) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(path.join(dir, 'stations.json'), JSON.stringify(normalizedStations, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'trains.json'), JSON.stringify(normalizedTrains, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'station_stops.json'), JSON.stringify(compactTrainStops), 'utf8');
    fs.writeFileSync(path.join(dir, 'station_aliases.json'), JSON.stringify(HISTORICAL_STATION_ALIASES, null, 2), 'utf8');
    fs.writeFileSync(path.join(dir, 'dataset_version.json'), JSON.stringify(datasetVersion, null, 2), 'utf8');
  }

  // Update manifest.json in shared/data
  const manifestPath = path.resolve(ROOT, 'shared/data/manifest.json');
  let manifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (_) {}
  }
  manifest.datameet = datasetVersion;
  manifest.updatedAt = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('[ETL:Datameet] Artifacts successfully written to data/processed/ and shared/data/.');
  return { datasetVersion, stationsCount: normalizedStations.length, trainsCount: normalizedTrains.length, totalStopsProcessed };
}

// Allow CLI execution: node data/etl/import-datameet.mjs [--dry-run]
if (process.argv[1] && import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  const isDryRun = process.argv.includes('--dry-run');
  runDatameetImport({ dryRun: isDryRun });
}

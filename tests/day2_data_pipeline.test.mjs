import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const dataDir = path.join(root, 'shared/data');

test('Day 2: ETL outputs canonical data files with valid JSON structure', () => {
  const requiredFiles = [
    'stations.json',
    'junctions.json',
    'terminals.json',
    'airports.json',
    'trains.json',
    'stops.json',
    'transfer_guides.json',
    'manifest.json'
  ];

  for (const file of requiredFiles) {
    const fullPath = path.join(dataDir, file);
    assert.ok(fs.existsSync(fullPath), `Dataset file ${file} must exist in shared/data/`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.doesNotThrow(() => JSON.parse(content), `${file} must contain valid JSON`);
  }
});

test('Day 2: Stations dataset covers all Top 25 junction hubs with valid geo bounds', () => {
  const stations = JSON.parse(fs.readFileSync(path.join(dataDir, 'stations.json'), 'utf8'));
  assert.ok(stations.length >= 40, 'Must have at least 40 key transit stations');

  const stationMap = new Map(stations.map((s) => [s.code, s]));
  const top25Codes = [
    'NDLS', 'CNB', 'DDU', 'PNBE', 'HWH', 'JP', 'ADI', 'BPL',
    'ET', 'NGP', 'VGLJ', 'GWL', 'PRYJ', 'BSB', 'GKP', 'KGP',
    'BZA', 'VSKP', 'SC', 'GTL', 'SBC', 'KPD', 'MAS', 'PUNE', 'MMCT'
  ];

  for (const code of top25Codes) {
    assert.ok(stationMap.has(code), `Station master must include Top 25 junction: ${code}`);
    const st = stationMap.get(code);
    assert.ok(st.name && st.city, `Station ${code} must have name and city`);
    // India geo bounds: Latitude 6.0° to 38.0° N, Longitude 68.0° to 98.0° E
    assert.ok(st.latitude >= 6.0 && st.latitude <= 38.0, `Latitude of ${code} must be within India bounds`);
    assert.ok(st.longitude >= 68.0 && st.longitude <= 98.0, `Longitude of ${code} must be within India bounds`);
    assert.ok(st.provenance, `Station ${code} must declare provenance field`);
  }
});

test('Day 2: Junctions dataset defines verified transfer metrics and facilities', () => {
  const junctions = JSON.parse(fs.readFileSync(path.join(dataDir, 'junctions.json'), 'utf8'));
  assert.equal(junctions.length, 25, 'Junctions directory must contain exactly 25 hubs');

  for (const j of junctions) {
    assert.ok(j.rank >= 1 && j.rank <= 25, 'Rank must be between 1 and 25');
    assert.ok(j.platformCount >= 1, `Platform count for ${j.stationCode} must be >= 1`);
    assert.ok(j.transferScore >= 70.0 && j.transferScore <= 100.0, `Transfer score for ${j.stationCode} must be valid`);
    assert.ok(Array.isArray(j.facilities) && j.facilities.length > 0, `Facilities for ${j.stationCode} must be non-empty`);
    assert.ok(j.license, `Junction ${j.stationCode} must include license`);
  }
});

test('Day 2: Bus Terminals and Airports contain complete cross-modal connection nodes', () => {
  const terminals = JSON.parse(fs.readFileSync(path.join(dataDir, 'terminals.json'), 'utf8'));
  const airports = JSON.parse(fs.readFileSync(path.join(dataDir, 'airports.json'), 'utf8'));

  assert.ok(terminals.length >= 20, 'Must include at least 20 major bus terminals');
  assert.ok(airports.length >= 15, 'Must include at least 15 major airports');

  for (const t of terminals) {
    assert.ok(t.name && t.city && t.type, `Terminal ${t.id} must have name, city, and type`);
    assert.ok(t.latitude && t.longitude, `Terminal ${t.id} must have geo coordinates`);
  }

  for (const a of airports) {
    assert.match(a.iataCode, /^[A-Z]{3}$/, `Airport ${a.iataCode} must be valid 3-letter IATA code`);
    assert.ok(a.name && a.city, `Airport ${a.iataCode} must have name and city`);
  }
});

test('Day 2: Timetable stop-times enforce chronological sequence and non-negative distance', () => {
  const trains = JSON.parse(fs.readFileSync(path.join(dataDir, 'trains.json'), 'utf8'));
  const stops = JSON.parse(fs.readFileSync(path.join(dataDir, 'stops.json'), 'utf8'));

  assert.ok(trains.length >= 10, 'Must have at least 10 high-frequency trunk trains');
  assert.ok(stops.length >= 50, 'Must have at least 50 scheduled stops');

  const stopsByTrain = new Map();
  for (const s of stops) {
    if (!stopsByTrain.has(s.trainNumber)) stopsByTrain.set(s.trainNumber, []);
    stopsByTrain.get(s.trainNumber).push(s);
  }

  for (const [trainNo, trainStops] of stopsByTrain.entries()) {
    assert.ok(trainStops.length >= 2, `Train ${trainNo} must have at least 2 stops`);
    trainStops.sort((a, b) => a.stopSequence - b.stopSequence);

    let prevDistance = -1;
    let prevSeq = 0;

    for (const stop of trainStops) {
      assert.equal(stop.stopSequence, prevSeq + 1, `Stop sequence on train ${trainNo} must be strictly contiguous`);
      prevSeq = stop.stopSequence;

      if (stop.distanceKm !== null && stop.distanceKm !== undefined) {
        assert.ok(stop.distanceKm >= prevDistance, `Distance must be non-decreasing on train ${trainNo}`);
        prevDistance = stop.distanceKm;
      }
    }
  }
});

test('Day 2: Intermodal transfer guides define realistic connection slack and guidance', () => {
  const guides = JSON.parse(fs.readFileSync(path.join(dataDir, 'transfer_guides.json'), 'utf8'));
  assert.ok(guides.length >= 20, 'Must have at least 20 intermodal transfer guides');

  for (const g of guides) {
    assert.ok(['walk', 'auto', 'taxi', 'metro', 'bus'].includes(g.transferMode), `Invalid mode ${g.transferMode}`);
    assert.ok(g.distanceKm > 0, `Distance must be > 0 for guide ${g.id}`);
    assert.ok(g.approxMinutes > 0, `Duration must be > 0 for guide ${g.id}`);
    assert.ok(g.guidanceText && g.guidanceText.length > 10, `Guidance text must be descriptive for guide ${g.id}`);
    assert.equal(g.provenance, 'ESTIMATE', 'Transfer guidance must be labeled ESTIMATE provenance per Section 5');
  }
});

test('Day 2: Manifest and attribution adhere to Section 6 and legal license specs', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(dataDir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.pipelineVersion, '2.0.0');
  assert.equal(manifest.freshnessAsOf, 'October 2026');
  assert.ok(manifest.attribution.includes('Timetable data as of October 2026'));
  assert.ok(manifest.attribution.includes('OpenStreetMap contributors'));
  assert.ok(manifest.attribution.includes('Open-Meteo'));

  assert.ok(manifest.domains.stations.license.includes('GODL'));
  assert.ok(manifest.domains.airports.license.includes('CC0'));
  assert.ok(manifest.domains.junctions.license.includes('ODbL'));
});

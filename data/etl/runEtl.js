// Master ETL Pipeline Runner
// Runs all extractors, verifies data quality, and outputs canonical datasets
// Reference: Section 6 of MASTER_SPEC.md

import fs from 'node:fs';
import path from 'node:path';
import { extractStations } from './extractStations.js';
import { extractJunctions } from './extractJunctions.js';
import { extractTerminals } from './extractTerminals.js';
import { extractAirports } from './extractAirports.js';
import { extractTrainsAndStops } from './extractTrainsAndStops.js';
import { extractTransferGuides } from './extractTransferGuides.js';

export function runEtl() {
  console.log('[ETL] Starting TravelMate Master Data Pipeline...');

  // 1. Extract raw domains
  const { metadata: stationMeta, stations } = extractStations();
  const { metadata: junctionMeta, junctions } = extractJunctions();
  const { metadata: terminalMeta, terminals } = extractTerminals();
  const { metadata: airportMeta, airports } = extractAirports();
  const { metadata: trainMeta, trains, stops } = extractTrainsAndStops();
  const { metadata: guideMeta, guides: transferGuides } = extractTransferGuides();

  console.log(`[ETL] Extracted ${stations.length} stations, ${junctions.length} junctions, ${terminals.length} terminals, ${airports.length} airports.`);
  console.log(`[ETL] Extracted ${trains.length} trains with ${stops.length} scheduled stops.`);
  console.log(`[ETL] Extracted ${transferGuides.length} transfer guides.`);

  // 2. Data Quality Assertions
  const stationCodeSet = new Set(stations.map((s) => s.code));
  for (const s of stations) {
    if (s.latitude < 6.0 || s.latitude > 38.0 || s.longitude < 68.0 || s.longitude > 98.0) {
      throw new Error(`Station coordinate out of India bounds: ${s.code} (${s.latitude}, ${s.longitude})`);
    }
  }

  for (const j of junctions) {
    if (!stationCodeSet.has(j.stationCode)) {
      throw new Error(`Junction references unknown stationCode: ${j.stationCode}`);
    }
  }

  for (const stop of stops) {
    if (!stationCodeSet.has(stop.stationCode)) {
      throw new Error(`Stop references unknown stationCode: ${stop.stationCode} on train ${stop.trainNumber}`);
    }
  }

  const manifest = {
    pipelineVersion: '2.0.0',
    generatedAt: new Date().toISOString(),
    freshnessAsOf: 'October 2026',
    attribution: 'Timetable data as of October 2026. Map data © OpenStreetMap contributors. Weather data by Open-Meteo.',
    domains: {
      stations: stationMeta,
      junctions: junctionMeta,
      terminals: terminalMeta,
      airports: airportMeta,
      trainsAndStops: trainMeta,
      transferGuides: guideMeta
    }
  };

  // 3. Write outputs to data/processed and shared/data
  const targets = [
    path.resolve('./data/processed'),
    path.resolve('./shared/data')
  ];

  for (const targetDir of targets) {
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(path.join(targetDir, 'stations.json'), JSON.stringify(stations, null, 2), 'utf8');
    fs.writeFileSync(path.join(targetDir, 'junctions.json'), JSON.stringify(junctions, null, 2), 'utf8');
    fs.writeFileSync(path.join(targetDir, 'terminals.json'), JSON.stringify(terminals, null, 2), 'utf8');
    fs.writeFileSync(path.join(targetDir, 'airports.json'), JSON.stringify(airports, null, 2), 'utf8');
    fs.writeFileSync(path.join(targetDir, 'trains.json'), JSON.stringify(trains, null, 2), 'utf8');
    fs.writeFileSync(path.join(targetDir, 'stops.json'), JSON.stringify(stops, null, 2), 'utf8');
    fs.writeFileSync(path.join(targetDir, 'transfer_guides.json'), JSON.stringify(transferGuides, null, 2), 'utf8');
    fs.writeFileSync(path.join(targetDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  }

  console.log('[ETL] Master Data Pipeline completed successfully! Artifacts written to data/processed/ and shared/data/.');
  return { manifest, counts: { stations: stations.length, junctions: junctions.length, terminals: terminals.length, airports: airports.length, trains: trains.length, stops: stops.length, guides: transferGuides.length } };
}

// Allow CLI execution: node data/etl/runEtl.js
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runEtl();
}

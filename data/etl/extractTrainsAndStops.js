// ETL Step 5: Extract High-Frequency Trunk Trains & Stop-Time Schedules
// Source: Indian Railways Open Train Schedules / Railway Data Commons
// License: Open Database License (ODbL) / Public Domain
// Freshness: October 2026

import { EXPANDED_TRAINS } from '../../scripts/generate_complete_trains.mjs';

export const RAW_TRAINS = EXPANDED_TRAINS;

export function extractTrainsAndStops() {
  const metadata = {
    source: 'Indian Railways Timetable Dataset / Open Rail Data Commons',
    license: 'Open Database License (ODbL) / Public Domain',
    retrievedAt: '2026-10-01',
    provenance: 'TIMETABLE',
    trainCount: RAW_TRAINS.length,
    stopCount: RAW_TRAINS.reduce((acc, t) => acc + t.stops.length, 0)
  };

  const trains = [];
  const stops = [];

  for (const t of RAW_TRAINS) {
    trains.push({
      number: t.number,
      name: t.name,
      type: t.type,
      originCode: t.originCode,
      destCode: t.destCode,
      runsOnDays: t.runsOnDays,
      source: metadata.source,
      license: metadata.license,
      provenance: metadata.provenance
    });

    for (const s of t.stops) {
      stops.push({
        id: `stop_${t.number}_${s.sequence}`,
        trainNumber: t.number,
        stationCode: s.stationCode,
        stopSequence: s.sequence,
        arrivalTime: s.arr,
        departTime: s.dep,
        dayCount: s.day,
        distanceKm: s.distKm,
        source: metadata.source,
        license: metadata.license,
        provenance: metadata.provenance
      });
    }
  }

  return { metadata, trains, stops };
}

import fs from 'fs';
import path from 'path';

function runDataAudit() {
  const dataDir = path.resolve('shared/data');
  const stations = JSON.parse(fs.readFileSync(path.join(dataDir, 'stations.json'), 'utf8'));
  const trains = JSON.parse(fs.readFileSync(path.join(dataDir, 'trains.json'), 'utf8'));
  const stops = JSON.parse(fs.readFileSync(path.join(dataDir, 'stops.json'), 'utf8'));
  const junctions = JSON.parse(fs.readFileSync(path.join(dataDir, 'junctions.json'), 'utf8'));
  const transferGuides = JSON.parse(fs.readFileSync(path.join(dataDir, 'transfer_guides.json'), 'utf8'));

  const report = {
    counts: {
      stations: stations.length,
      trains: trains.length,
      stops: stops.length,
      junctions: junctions.length,
      transferGuides: transferGuides.length
    },
    stationCodeDuplicates: [],
    trainNumberDuplicates: [],
    impossibleTimes: [],
    spotCheck50: []
  };

  // 1. Check station duplicates
  const seenStations = new Set();
  for (const s of stations) {
    if (seenStations.has(s.code)) {
      report.stationCodeDuplicates.push(s.code);
    }
    seenStations.add(s.code);
  }

  // 2. Check train duplicates
  const seenTrains = new Set();
  for (const t of trains) {
    if (seenTrains.has(t.number)) {
      report.trainNumberDuplicates.push(t.number);
    }
    seenTrains.add(t.number);
  }

  // 3. Check impossible times in stops
  for (const st of stops) {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (st.departTime && !timeRegex.test(st.departTime)) {
      report.impossibleTimes.push({ train: st.trainNumber, stop: st.stationCode, departTime: st.departTime });
    }
    if (st.arrivalTime && !timeRegex.test(st.arrivalTime)) {
      report.impossibleTimes.push({ train: st.trainNumber, stop: st.stationCode, arrivalTime: st.arrivalTime });
    }
  }

  // 4. Spot check 50 records
  const sampleStations = stations.slice(0, 25).map(s => ({ type: 'station', code: s.code, name: s.name, state: s.state }));
  const sampleTrains = trains.slice(0, 12).map(t => ({ type: 'train', number: t.number, name: t.name, origin: t.origin, dest: t.destination }));
  const sampleJunctions = junctions.slice(0, 13).map(j => ({ type: 'junction', code: j.code, name: j.name, platforms: j.platforms }));
  report.spotCheck50 = [...sampleStations, ...sampleTrains, ...sampleJunctions];

  fs.writeFileSync('docs/audit-v2/test-logs/part11_data_report.json', JSON.stringify(report, null, 2));
  console.log('Part 11 data audit complete:', report.counts);
}

runDataAudit();

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { searchRecoveryRoutes, findDirectTrainRoutes, findConnectingRoutes } from '../server/services/routeEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const corridors = [
  { name: 'RJY to BZA', from: 'RJY', to: 'BZA', expectDirect: true, forbidVia: 'HYB' },
  { name: 'BZA to RJY', from: 'BZA', to: 'RJY', expectDirect: true, forbidVia: 'HYB' },
  { name: 'RJY to VSKP', from: 'RJY', to: 'VSKP', expectDirect: true },
  { name: 'BZA to SC', from: 'BZA', to: 'SC', expectDirect: true },
  { name: 'MAS to HWH', from: 'MAS', to: 'HWH', expectDirect: true },
  { name: 'NDLS to PNBE', from: 'NDLS', to: 'PNBE', expectDirect: true },
  { name: 'SBC to SC', from: 'SBC', to: 'SC', expectDirect: true },
  { name: 'CSMT to PUNE', from: 'CSMT', to: 'PUNE', expectDirect: true },
  { name: 'DDU to PNBE (Renamed DDU/MGS)', from: 'DDU', to: 'PNBE', expectDirect: true },
  { name: 'PRYJ to CNB (Renamed PRYJ/ALD)', from: 'PRYJ', to: 'CNB', expectDirect: true },
  { name: 'Same Station (NDLS to NDLS)', from: 'NDLS', to: 'NDLS', expectSafeEmpty: true },
  { name: 'Unknown Station (XYZ999 to NDLS)', from: 'XYZ999', to: 'NDLS', expectSafeEmpty: true }
];

const results = [];

for (const c of corridors) {
  const start = performance.now();
  const res = searchRecoveryRoutes({ from: c.from, to: c.to, date: '2026-10-15' });
  const durMs = Math.round(performance.now() - start);

  const directCount = res.directCount || 0;
  const splitCount = res.splitRoutesCount || 0;
  
  let hyderabadDetourFound = false;
  if (c.forbidVia) {
    const viaForbid = (res.allSplitRoutes || []).filter(r => r.hubCode === c.forbidVia);
    if (viaForbid.length > 0) hyderabadDetourFound = true;
  }

  // Sample train numbers
  const sampleDirect = (res.directRoutes || []).slice(0, 3).map(r => `${r.number} ${r.name}`);

  const item = {
    name: c.name,
    from: c.from,
    to: c.to,
    durationMs: durMs,
    directCount,
    splitCount,
    sampleDirect,
    detourForbiddenPresent: hyderabadDetourFound,
    provenance: res.directRoutes?.[0]?.provenanceNote || res.attribution,
    status: 'PASS'
  };

  if (c.expectDirect && directCount === 0) item.status = 'FAIL: Expected direct trains';
  if (c.expectSafeEmpty && directCount > 0) item.status = 'FAIL: Expected safe empty';
  if (c.forbidVia && hyderabadDetourFound) item.status = `FAIL: Found detour via ${c.forbidVia}`;

  results.push(item);
  console.log(`[Corridor] ${c.name.padEnd(35)} -> Direct: ${String(directCount).padStart(3)}, Splits: ${String(splitCount).padStart(3)}, Time: ${durMs}ms -> ${item.status}`);
}

const outDir = path.resolve(__dirname, '../docs/data/evidence');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'corridor-battery-results.json'), JSON.stringify(results, null, 2), 'utf8');

console.log(`\nSaved ${results.length} corridor battery results to docs/data/evidence/corridor-battery-results.json`);

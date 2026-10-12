import { searchRecoveryRoutes } from '../server/services/routeEngine.js';

// 30 calls benchmark
const queries = [
  { from: 'RJY', to: 'BZA' },
  { from: 'NDLS', to: 'CNB' },
  { from: 'MAS', to: 'HWH' },
  { from: 'BZA', to: 'SC' },
  { from: 'CSMT', to: 'PUNE' },
  { from: 'DDU', to: 'PNBE' }
];

const latencies = [];

for (let i = 0; i < 30; i++) {
  const q = queries[i % queries.length];
  const t0 = performance.now();
  searchRecoveryRoutes({ from: q.from, to: q.to, date: '2026-10-15' });
  const t1 = performance.now();
  latencies.push(t1 - t0);
}

latencies.sort((a, b) => a - b);
const cold = latencies[0]; // first run
const p50 = latencies[Math.floor(latencies.length * 0.50)];
const p95 = latencies[Math.floor(latencies.length * 0.95)];
const max = latencies[latencies.length - 1];

console.log(`[Benchmark] 30 Query Execution Latencies:`);
console.log(`  Min: ${cold.toFixed(1)}ms`);
console.log(`  p50: ${p50.toFixed(1)}ms`);
console.log(`  p95: ${p95.toFixed(1)}ms`);
console.log(`  Max: ${max.toFixed(1)}ms`);
console.log(`  p95 < 2000ms SLA target: ${p95 < 2000 ? 'YES' : 'NO'}`);

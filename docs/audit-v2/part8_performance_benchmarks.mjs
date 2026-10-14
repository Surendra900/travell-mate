import fs from 'fs';
import path from 'path';
import { searchRecoveryRoutes } from '../../server/services/routeEngine.js';

async function runPerformanceBenchmarks() {
  const report = {
    apiBenchmarks: {},
    bundleSizes: {},
    throttlingAudit: {}
  };

  console.log('Measuring search API latency across 30 calls...');
  const latencies = [];

  for (let i = 0; i < 30; i++) {
    const start = performance.now();
    searchRecoveryRoutes({
      from: 'NDLS',
      to: 'PNBE',
      date: '2026-10-15',
      allowOvernight: true
    });
    const dur = performance.now() - start;
    latencies.push(dur);
  }

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p95 = latencies[Math.floor(latencies.length * 0.95)];

  report.apiBenchmarks = {
    totalCalls: 30,
    coldCallDurationMs: latencies[0], // first invocation
    warmCallDurationMs: latencies[1],
    minMs: latencies[0],
    maxMs: latencies[latencies.length - 1],
    p50Ms: p50,
    p95Ms: p95,
    allLatenciesMs: latencies.map(l => Math.round(l * 100) / 100)
  };

  // Inspect dist/ bundle sizes
  const distDir = path.resolve('dist/assets');
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    report.bundleSizes = files.map(f => {
      const stats = fs.statSync(path.join(distDir, f));
      return {
        file: f,
        sizeBytes: stats.size,
        sizeKb: Math.round(stats.size / 1024 * 10) / 10
      };
    }).sort((a, b) => b.sizeBytes - a.sizeBytes);
  }

  fs.writeFileSync('docs/audit-v2/metrics/part8_performance_report.json', JSON.stringify(report, null, 2));
  console.log('Part 8 performance benchmarks complete:', report.apiBenchmarks);
}

runPerformanceBenchmarks().catch(err => {
  console.error('Benchmarking failed:', err);
  process.exit(1);
});

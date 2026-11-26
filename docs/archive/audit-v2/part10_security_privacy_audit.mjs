import { execSync } from 'child_process';
import https from 'https';
import fs from 'fs';

async function runSecurityAudit() {
  const report = {
    secretLeaks: [],
    securityHeaders: {},
    npmAuditSummary: {},
    localStorageAudit: {},
    apiFuzzingResults: []
  };

  console.log('1. Scanning client sources for potential secret leaks...');
  try {
    const grepKeys = execSync('git grep -i -E "sk-[a-zA-Z0-9]{20,}|AIza[0-9A-Za-z-_]{35}|ghp_[a-zA-Z0-9]{36}" -- src/ dist/', { encoding: 'utf-8' });
    report.secretLeaks = grepKeys.trim().split('\n').filter(Boolean);
  } catch (err) {
    report.secretLeaks = [];
  }

  console.log('2. Inspecting live HTTP security headers on Vercel deployment...');
  await new Promise((resolve) => {
    https.get('https://travelmate-ai-flowzint.vercel.app', (res) => {
      report.securityHeaders = {
        statusCode: res.statusCode,
        hsts: res.headers['strict-transport-security'] || 'MISSING',
        xContentTypeOptions: res.headers['x-content-type-options'] || 'MISSING',
        xFrameOptions: res.headers['x-frame-options'] || 'MISSING',
        referrerPolicy: res.headers['referrer-policy'] || 'MISSING',
        permissionsPolicy: res.headers['permissions-policy'] || 'MISSING',
        contentSecurityPolicy: res.headers['content-security-policy'] || 'MISSING'
      };
      resolve();
    }).on('error', (err) => {
      report.securityHeaders = { error: err.message };
      resolve();
    });
  });

  console.log('3. Running npm audit...');
  try {
    const auditRaw = execSync('npm audit --json', { encoding: 'utf-8' });
    const parsed = JSON.parse(auditRaw);
    report.npmAuditSummary = {
      vulnerabilitiesCount: parsed.metadata?.vulnerabilities || {},
      totalDependencies: parsed.metadata?.dependencies?.total || 0
    };
  } catch (err) {
    try {
      const parsed = JSON.parse(err.stdout || '{}');
      report.npmAuditSummary = {
        vulnerabilitiesCount: parsed.metadata?.vulnerabilities || {},
        totalDependencies: parsed.metadata?.dependencies?.total || 0
      };
    } catch {
      report.npmAuditSummary = { error: 'Failed to parse npm audit output' };
    }
  }

  // 4. API Fuzzing against local route engine
  console.log('4. Fuzzing route engine with malicious inputs...');
  const { searchRecoveryRoutes } = await import('../../server/services/routeEngine.js');
  const fuzzPayloads = [
    { from: "' OR 1=1 --", to: "HWH", desc: 'SQL Injection' },
    { from: "<script>alert(1)</script>", to: "HWH", desc: 'XSS Vector' },
    { from: "../../etc/passwd", to: "HWH", desc: 'Path Traversal' },
    { from: "A".repeat(10000), to: "HWH", desc: 'Buffer Overflow' },
    { from: null, to: undefined, desc: 'Null / Undefined' },
    { from: { bad: 'object' }, to: [1, 2, 3], desc: 'Type Confusion' }
  ];

  for (const f of fuzzPayloads) {
    try {
      const res = searchRecoveryRoutes({ from: f.from, to: f.to });
      report.apiFuzzingResults.push({
        payload: f.desc,
        status: 'HANDLED_GRACEFULLY',
        returnedDirect: res.directCount,
        returnedSplit: res.splitRoutesCount
      });
    } catch (err) {
      report.apiFuzzingResults.push({
        payload: f.desc,
        status: 'UNCAUGHT_EXCEPTION',
        error: err.message
      });
    }
  }

  fs.writeFileSync('docs/audit-v2/test-logs/part10_security_report.json', JSON.stringify(report, null, 2));
  console.log('Part 10 security audit finished.');
}

runSecurityAudit().catch(err => {
  console.error('Security audit failed:', err);
  process.exit(1);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';

test('C-13 Dependency Vulnerabilities Suite', async (t) => {
  await t.test('Production dependencies have 0 high and 0 critical vulnerabilities', () => {
    let auditJson = null;
    try {
      const out = execSync('npm audit --omit=dev --json', { encoding: 'utf8' });
      auditJson = JSON.parse(out);
    } catch (err) {
      if (err.stdout) {
        auditJson = JSON.parse(err.stdout);
      } else {
        throw err;
      }
    }

    const highCount = auditJson.metadata?.vulnerabilities?.high || 0;
    const criticalCount = auditJson.metadata?.vulnerabilities?.critical || 0;

    assert.strictEqual(
      highCount,
      0,
      `Production dependencies must have 0 high vulnerabilities (found: ${highCount})`
    );
    assert.strictEqual(
      criticalCount,
      0,
      `Production dependencies must have 0 critical vulnerabilities (found: ${criticalCount})`
    );
  });

  await t.test('Vulnerable transitive packages (nanoid, source-map-js, postcss) are resolved', () => {
    let auditJson = null;
    try {
      const out = execSync('npm audit --json', { encoding: 'utf8' });
      auditJson = JSON.parse(out);
    } catch (err) {
      if (err.stdout) {
        auditJson = JSON.parse(err.stdout);
      } else {
        throw err;
      }
    }

    const vulnerabilities = auditJson.vulnerabilities || {};
    assert.strictEqual(
      vulnerabilities['nanoid'],
      undefined,
      'nanoid vulnerability must be resolved'
    );
    assert.strictEqual(
      vulnerabilities['source-map-js'],
      undefined,
      'source-map-js vulnerability must be resolved'
    );
    assert.strictEqual(
      vulnerabilities['postcss'],
      undefined,
      'postcss vulnerability must be resolved'
    );
  });

  await t.test('Total vulnerabilities reduced from baseline of 14', () => {
    let auditJson = null;
    try {
      const out = execSync('npm audit --json', { encoding: 'utf8' });
      auditJson = JSON.parse(out);
    } catch (err) {
      if (err.stdout) {
        auditJson = JSON.parse(err.stdout);
      } else {
        throw err;
      }
    }

    const total = auditJson.metadata?.vulnerabilities?.total || 0;
    assert.ok(
      total <= 6,
      `Total vulnerabilities must be <= 6 after audit fix (was 14, now ${total})`
    );
  });
});

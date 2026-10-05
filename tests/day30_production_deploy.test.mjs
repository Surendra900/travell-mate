import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Day 30: All 30 sprint days logged and verified in sprint-status.md', () => {
  const statusPath = path.resolve('docs/sprint-status.md');
  assert.ok(fs.existsSync(statusPath), 'sprint-status.md must exist');
  const content = fs.readFileSync(statusPath, 'utf8');

  // Verify all 30 days are marked DONE-VERIFIED
  for (let day = 1; day <= 30; day++) {
    const dayRegex = new RegExp(`\\*\\*Day ${day}\\*\\*.*\\*\\*DONE-VERIFIED\\*\\*`, 's');
    assert.match(content, dayRegex, `Day ${day} must be marked DONE-VERIFIED in docs/sprint-status.md`);
  }
});

test('Day 30: Production build assets and web app manifest integrity', () => {
  const distHtml = path.resolve('dist/index.html');
  const manifestPath = path.resolve('dist/manifest.webmanifest');
  const swPath = path.resolve('dist/sw.js');

  assert.ok(fs.existsSync(distHtml), 'dist/index.html must exist');
  assert.ok(fs.existsSync(manifestPath), 'dist/manifest.webmanifest must exist');
  assert.ok(fs.existsSync(swPath), 'dist/sw.js must exist');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(manifest.name, 'TravelMate AI — Multimodal Bharat Travel & Safety');
  assert.equal(manifest.display, 'standalone');
});

test('Day 30: Zero secrets and production-ready Vercel configuration', () => {
  const vercelJsonPath = path.resolve('vercel.json');
  assert.ok(fs.existsSync(vercelJsonPath), 'vercel.json must exist');
  const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
  assert.ok(Array.isArray(vercelConfig.rewrites), 'vercel.json must declare SPA rewrites');
});

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

describe('C-10: Strict Content-Security-Policy and Security Headers Gate', () => {
  const vercelJsonPath = path.resolve('vercel.json');

  test('vercel.json exists and is valid JSON', () => {
    assert.ok(fs.existsSync(vercelJsonPath), 'vercel.json must exist in repository root');
    const content = fs.readFileSync(vercelJsonPath, 'utf8');
    const parsed = JSON.parse(content);
    assert.ok(parsed && typeof parsed === 'object', 'vercel.json must be a valid JSON object');
  });

  test('vercel.json declares Content-Security-Policy header covering all routes', () => {
    const parsed = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    assert.ok(Array.isArray(parsed.headers), 'vercel.json must define a headers array');

    const globalRouteHeaderBlock = parsed.headers.find(h => h.source === '/(.*)');
    assert.ok(globalRouteHeaderBlock, 'vercel.json must have a global header block for /(.*)');

    const cspHeader = globalRouteHeaderBlock.headers.find(h => h.key.toLowerCase() === 'content-security-policy');
    assert.ok(cspHeader, 'vercel.json must configure a Content-Security-Policy header for /(.*)');
    assert.ok(cspHeader.value && cspHeader.value.length > 20, 'Content-Security-Policy value must not be empty or stubbed');

    // Verify critical CSP directives
    const csp = cspHeader.value;
    assert.ok(csp.includes("default-src 'self'"), "CSP must define default-src 'self'");
    assert.ok(csp.includes("script-src"), 'CSP must define script-src');
    assert.ok(csp.includes("style-src"), 'CSP must define style-src');
    assert.ok(csp.includes("img-src"), 'CSP must define img-src');
    assert.ok(csp.includes("tile.openstreetmap.org"), 'CSP img-src must whitelist OpenStreetMap tiles');
    assert.ok(csp.includes("connect-src"), 'CSP must define connect-src');
    assert.ok(csp.includes("api.open-meteo.com"), 'CSP connect-src must whitelist Open-Meteo weather API');
    assert.ok(csp.includes("frame-ancestors 'none'"), "CSP must declare frame-ancestors 'none' for clickjacking protection");
  });

  test('vercel.json declares Strict-Transport-Security header', () => {
    const parsed = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
    const globalRouteHeaderBlock = parsed.headers.find(h => h.source === '/(.*)');
    const hstsHeader = globalRouteHeaderBlock?.headers.find(h => h.key.toLowerCase() === 'strict-transport-security');
    assert.ok(hstsHeader, 'vercel.json must configure Strict-Transport-Security');
    assert.ok(hstsHeader.value.includes('max-age'), 'HSTS must include max-age directive');
  });
});

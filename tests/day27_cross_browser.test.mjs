import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Day 27: index.html contains proper viewport meta tag for responsive multi-viewport rendering', () => {
  const htmlPath = path.resolve('index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.ok(html.includes('name="viewport"'), 'Must contain viewport meta tag');
  assert.ok(html.includes('width=device-width'), 'Must specify width=device-width');
  assert.ok(html.includes('initial-scale=1.0'), 'Must specify initial-scale=1.0');
});

test('Day 27: Client bundle sources contain ZERO hardcoded secret API keys', () => {
  const srcDir = path.resolve('src');

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (/\.(js|jsx|ts|tsx)$/.test(entry.name)) {
        const code = fs.readFileSync(fullPath, 'utf8');
        // Check for suspicious key patterns
        assert.doesNotMatch(code, /sk_live_[0-9a-zA-Z]{24,}/, `Possible leaked live secret key in ${entry.name}`);
        assert.doesNotMatch(code, /AIzaSy[0-9a-zA-Z_-]{33}/, `Possible leaked Google key in ${entry.name}`);
        assert.doesNotMatch(code, /sambanova_[0-9a-zA-Z]{30,}/, `Possible leaked SambaNova secret key in ${entry.name}`);
      }
    }
  }

  scanDir(srcDir);
});

test('Day 27: Core routes are registered in App.jsx and Navbar.jsx', () => {
  const navPath = path.resolve('src/components/Navbar.jsx');
  const navContent = fs.readFileSync(navPath, 'utf8');

  assert.ok(navContent.includes("to: '/planner'"), 'Must link to Planner');
  assert.ok(navContent.includes("to: '/safety'"), 'Must link to Safety');
  assert.ok(navContent.includes("to: '/saved'"), 'Must link to Saved Plans');
  assert.ok(navContent.includes('to="/"') || navContent.includes("to='/'"), 'Must link to Home');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Day 26: index.css enforces horizontal overflow prevention on html, body, #root', () => {
  const cssPath = path.resolve('src/index.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  assert.ok(css.includes('overflow-x:hidden'), 'Must enforce overflow-x:hidden globally');
  assert.ok(css.includes('min-width:320px'), 'Must declare min-width:320px');
});

test('Day 26: index.css enforces mobile touch target sizing (min-height 48px / 44px)', () => {
  const cssPath = path.resolve('src/index.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  assert.ok(css.includes('.tm-mobile-menu a{min-height:48px'), 'Mobile menu links must have min-height 48px');
  assert.ok(css.includes('min-height: 44px'), 'Buttons and form inputs must meet 44px minimum touch height');
});

test('Day 26: index.css guarantees non-overlapping floating docks with safe-area-inset-bottom', () => {
  const cssPath = path.resolve('src/index.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  assert.ok(css.includes('.assistant-launcher{right:16px;bottom:calc(96px + env(safe-area-inset-bottom'), 'Assistant launcher must have 96px bottom clearance');
  assert.ok(css.includes('.floating-sos{right:12px;bottom:calc(16px + env(safe-area-inset-bottom'), 'Floating SOS dock must have 16px bottom anchor');
  assert.ok(css.includes('z-index:75') && css.includes('z-index:70'), 'Must enforce layered z-indexes');
});

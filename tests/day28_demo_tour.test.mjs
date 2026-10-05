import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TOUR_STEPS } from '../src/data/demoTourData.js';

test('Day 28: TOUR_STEPS defines the 5 core national hackathon innovations', () => {
  assert.equal(TOUR_STEPS.length, 5, 'Must contain exactly 5 innovation steps');

  // Verify step titles and themes
  assert.match(TOUR_STEPS[0].title, /Multimodal Split-Routing/i);
  assert.match(TOUR_STEPS[1].title, /Divyangjan Voice Accessibility/i);
  assert.match(TOUR_STEPS[2].title, /Encrypted Vault & DPDP/i);
  assert.match(TOUR_STEPS[3].title, /Open-Meteo Winter Fog/i);
  assert.match(TOUR_STEPS[4].title, /1-Tap SOS Telemetry & Contingency/i);

  // Verify routes and action text
  TOUR_STEPS.forEach((step, idx) => {
    assert.equal(step.step, idx + 1);
    assert.ok(step.highlights.length >= 3, `Step ${idx + 1} must feature at least 3 highlights`);
    assert.ok(step.actionText.length > 5, `Step ${idx + 1} must provide actionable button label`);
    assert.ok(step.targetRoute.startsWith('/'), `Step ${idx + 1} must point to valid route`);
  });
});

test('Day 28: DemoTourModal.jsx implements accessible modal semantics and controls', () => {
  const modalPath = path.resolve('src/components/DemoTourModal.jsx');
  assert.ok(fs.existsSync(modalPath), 'DemoTourModal.jsx must exist');

  const content = fs.readFileSync(modalPath, 'utf8');
  assert.ok(content.includes('data-testid="demo-tour-modal"'));
  assert.ok(content.includes('data-testid="demo-tour-step-title"'));
  assert.ok(content.includes('data-testid="demo-tour-next-btn"'));
  assert.ok(content.includes('data-testid="demo-tour-prev-btn"'));
  assert.ok(content.includes('data-testid="demo-tour-action-btn"'));
  assert.ok(content.includes('role="dialog"'));
  assert.ok(content.includes('aria-modal="true"'));
});

test('Day 28: Navbar.jsx and App.jsx integrate Judge Demo Tour entry point and global trigger', () => {
  const navPath = path.resolve('src/components/Navbar.jsx');
  const navContent = fs.readFileSync(navPath, 'utf8');
  assert.ok(navContent.includes('data-testid="navbar-demo-tour-btn"'), 'Navbar must feature desktop Judge Tour button');
  assert.ok(navContent.includes('data-testid="mobile-navbar-demo-tour-btn"'), 'Navbar must feature mobile Judge Tour button');

  const appPath = path.resolve('src/App.jsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  assert.ok(appContent.includes('travelmate:open-demo-tour'), 'App must listen for global tour event');
  assert.ok(appContent.includes('<DemoTourModal'), 'App must render DemoTourModal');
});

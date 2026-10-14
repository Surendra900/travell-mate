/**
 * Day 4: App Shell & Search UX Test Suite
 * Asserts 4-item minimal navigation, station autocomplete,
 * 3-step onboarding strip, and honest demo scenario mode.
 * Reference: docs/MASTER_SPEC.md Sections 5, 8, & 9
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { searchStations, STATIONS } from '../src/data/stationsData.js';

test('Day 4 Gate: App Shell & Navbar strictly adheres to 4-item minimal architecture', () => {
  const navContent = fs.readFileSync(path.resolve('src/components/Navbar.jsx'), 'utf8');

  // Must link to the 4 core IA items
  assert.ok(navContent.includes("to: '/planner'"), 'Must link to Route Finder / Planner');
  assert.ok(navContent.includes("to: '/planner?mode=tatkal'"), 'Must link to Tatkal Desk');
  assert.ok(navContent.includes("to: '/safety'"), 'Must link to Passes & Safety');
  assert.ok(navContent.includes("to: '/saved'"), 'Must link to Saved Trips / Passes');
  assert.ok(navContent.includes("to=\"/\""), 'Must link to Home');

  // Must feature See a Demo button
  assert.ok(navContent.includes('data-testid="navbar-demo-tour-btn"'), 'Must have See a Demo action button');
  assert.ok(navContent.includes('data-testid="mobile-navbar-demo-tour-btn"'), 'Must have mobile See a Demo button');
  assert.ok(navContent.includes('data-testid="navbar-voice-gate-btn"'), 'Must have Voice accessibility trigger');
});

test('Day 4 Gate: Station Autocomplete service matches stations and prioritizes hubs', () => {
  assert.ok(STATIONS.length >= 25, 'Must load canonical station dataset');

  // Exact code match
  const ndlsMatches = searchStations('NDLS');
  assert.ok(ndlsMatches.length > 0);
  assert.equal(ndlsMatches[0].code, 'NDLS');
  assert.equal(ndlsMatches[0].city, 'Delhi');

  // City search
  const patnaMatches = searchStations('Patna');
  assert.ok(patnaMatches.length > 0);
  assert.equal(patnaMatches[0].code, 'PNBE');

  // Hub priority
  const defaultHubs = searchStations('');
  assert.ok(defaultHubs.length > 0);
  assert.ok(defaultHubs.every(s => s.isJunction), 'Default suggestions should prioritize junction hubs');
});

test('Day 4 Gate: StationAutocomplete.jsx implements accessible combobox semantics', () => {
  const autoContent = fs.readFileSync(path.resolve('src/components/StationAutocomplete.jsx'), 'utf8');

  assert.ok(autoContent.includes('role="combobox"'), 'Must implement combobox role');
  assert.ok(autoContent.includes('aria-autocomplete="list"'), 'Must declare aria-autocomplete list');
  assert.ok(autoContent.includes('role="listbox"'), 'Must declare listbox for suggestions');
  assert.ok(autoContent.includes('role="option"'), 'Must declare option role for items');
  assert.ok(autoContent.includes('onKeyDown'), 'Must support keyboard navigation');
  assert.ok(autoContent.includes('Hub'), 'Must display junction hub badges');
});

test('Day 4 Gate: Homepage hero, 3-step onboarding, and split combinations explainer', () => {
  const homeContent = fs.readFileSync(path.resolve('src/pages/Home.jsx'), 'utf8');

  // Single dominant search focus
  assert.ok(homeContent.includes('StationAutocomplete'), 'Homepage must use StationAutocomplete');
  assert.ok(homeContent.includes('id="home-from-input"'), 'Must have accessible from input ID');
  assert.ok(homeContent.includes('id="home-to-input"'), 'Must have accessible to input ID');
  assert.ok(homeContent.includes('data-testid="home-search-btn"'), 'Must have primary search CTA');

  // 12-hour urgent tonight preset (no medical emergency visuals)
  assert.ok(homeContent.includes('Need to travel tonight? (12h)'), 'Must include 12-hour travel tonight preset');

  // How it works in 3 steps
  assert.ok(homeContent.includes('How Route Recovery Works in 3 Steps'), 'Must include 3-step educational onboarding');
  assert.ok(homeContent.includes('Bypass Waitlists via Hubs'), 'Step 2 must explain hub bypass');

  // Direct route unavailable combinations
  assert.ok(homeContent.includes('Direct route unavailable?'), 'Must include combinations explainer');
  assert.ok(homeContent.includes('Train + Train'), 'Must explain Rail+Rail');
  assert.ok(homeContent.includes('Train + AC Bus'), 'Must explain Rail+Bus');
  assert.ok(homeContent.includes('Train + Flight'), 'Must explain Rail+Flight');

  // Honesty strip
  assert.ok(homeContent.includes('Official IR timetable data as of October 2026'), 'Must display honest data disclosure');
});

test('Day 4 Gate: Honest Demo Scenario Mode specification and banner in Planner.jsx', () => {
  // Demo mode spec document
  assert.ok(fs.existsSync(path.resolve('docs/demo-mode.md')), 'docs/demo-mode.md must exist');
  const demoSpec = fs.readFileSync(path.resolve('docs/demo-mode.md'), 'utf8');
  assert.ok(demoSpec.includes('Demo scenario: illustrative availability'));
  assert.ok(demoSpec.includes('Never Fake Route Outcomes'));

  // Planner demo mode banner
  const plannerContent = fs.readFileSync(path.resolve('src/pages/Planner.jsx'), 'utf8');
  assert.ok(plannerContent.includes('isDemoMode'), 'Planner must track demo mode state');
  assert.ok(plannerContent.includes('data-testid="demo-mode-banner"'), 'Planner must render demo mode banner');
  assert.ok(plannerContent.includes('Demo scenario: illustrative availability'), 'Must display verbatim honest demo label');
  assert.ok(plannerContent.includes('Exit Demo Mode'), 'Must provide 1-click exit from demo mode');
});

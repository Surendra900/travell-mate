/**
 * Day 5: Results & Split Routes Experience Test Suite
 * Asserts Left/Right Waitlist Bypass contrast, consumer-grade journey cards,
 * interactive Leaflet route map, inline delay contingency simulator,
 * provenance badges, risk badges, and statutory booking disclosures.
 * Reference: docs/MASTER_SPEC.md Sections 4, 5, 6, 8, & 9
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Day 5 Gate: WaitlistBypassContrast renders side-by-side contrast and statutory disclosure', () => {
  const contrastFile = path.resolve('src/components/WaitlistBypassContrast.jsx');
  assert.ok(fs.existsSync(contrastFile), 'WaitlistBypassContrast.jsx must exist');
  const content = fs.readFileSync(contrastFile, 'utf8');

  // Must render direct train status on left and split alternative on right
  assert.ok(content.includes('data-testid="contrast-direct-card"'), 'Must render direct train status card');
  assert.ok(content.includes('data-testid="contrast-split-card"'), 'Must render split-route recovery card');
  assert.ok(content.includes('Direct Train Status (Waitlist Wall)'), 'Must identify direct train waitlist bottleneck');
  assert.ok(content.includes('Split-Route Alternative (Waitlist Bypass)'), 'Must identify split-route recovery bypass');

  // Must render statutory split booking disclosure
  assert.ok(content.includes('data-testid="statutory-split-disclosure"'), 'Must render statutory disclosure');
  assert.ok(content.includes('These are independent bookings'), 'Must include required disclosure wording');
  assert.ok(content.includes('other operators owe you nothing'), 'Must emphasize independent operator liability');
});

test('Day 5 Gate: MultimodalTimelineCard renders provenance badges, risk badges, delay absorption, and disclosures', () => {
  const cardFile = path.resolve('src/components/MultimodalTimelineCard.jsx');
  assert.ok(fs.existsSync(cardFile), 'MultimodalTimelineCard.jsx must exist');
  const content = fs.readFileSync(cardFile, 'utf8');

  // Provenance badges
  assert.ok(content.includes('ProvenanceBadge'), 'Must render ProvenanceBadge on legs');
  assert.ok(content.includes('TIMETABLE'), 'Must declare TIMETABLE provenance for official trains');

  // Risk badges and delay tolerance
  assert.ok(content.includes('RiskBadge'), 'Must render RiskBadge for transfer');
  assert.ok(content.includes('maxDelayMinutes'), 'Must pass max delay absorption to RiskBadge');
  assert.ok(content.includes('data-testid="multimodal-journey-card"'), 'Must declare multimodal-journey-card testid');

  // Station transfer guide and delay test toggle
  assert.ok(content.includes('data-testid="toggle-delay-simulator-btn"'), 'Must offer inline delay test button');
  assert.ok(content.includes('DelayContingencySimulator'), 'Must mount DelayContingencySimulator');
  assert.ok(content.includes('Why TravelMate Picked This Junction'), 'Must explain junction selection rationale');

  // Statutory independent booking disclosure
  assert.ok(content.includes('These are independent bookings'), 'Must contain statutory disclosure on journey card');
});

test('Day 5 Gate: DelayContingencySimulator implements interactive slider, slack recomputation, and fallback options', () => {
  const simFile = path.resolve('src/components/DelayContingencySimulator.jsx');
  assert.ok(fs.existsSync(simFile), 'DelayContingencySimulator.jsx must exist');
  const content = fs.readFileSync(simFile, 'utf8');

  // Slider and metrics test IDs
  assert.ok(content.includes('data-testid="delay-slider"'), 'Must have delay slider');
  assert.ok(content.includes('data-testid="effective-slack"'), 'Must have effective slack metric');
  assert.ok(content.includes('data-testid="contingency-status"'), 'Must have connection status metric');
  assert.ok(content.includes('data-testid="point-of-no-return"'), 'Must have point of no return metric');

  // Fallback departures
  assert.ok(content.includes('fallbackDepartures'), 'Must compute fallback departures when broken or tight');
  assert.ok(content.includes('Point of No Return'), 'Must display Point of No Return clock time');
});

test('Day 5 Gate: Interactive RouteMap renders Leaflet canvas with custom markers and fit controls', () => {
  const mapFile = path.resolve('src/components/RouteMap.jsx');
  assert.ok(fs.existsSync(mapFile), 'RouteMap.jsx must exist');
  const content = fs.readFileSync(mapFile, 'utf8');

  assert.ok(content.includes('data-testid="interactive-route-map"'), 'Must render interactive route map container');
  assert.ok(content.includes('data-testid="leaflet-map-canvas"'), 'Must render Leaflet map canvas');
  assert.ok(content.includes('data-testid="map-zoom-fit"'), 'Must provide zoom fit button');
  assert.ok(content.includes('data-testid="map-focus-junction"'), 'Must provide junction focus button');
  assert.ok(content.includes('L.tileLayer'), 'Must mount OpenStreetMap tile layer');
});

test('Day 5 Gate: LiveResultsPanel and NormalPlanner integrate Waitlist Bypass contrast, simulator, and autocomplete', () => {
  // LiveResultsPanel
  const resultsFile = path.resolve('src/components/LiveResultsPanel.jsx');
  const resultsContent = fs.readFileSync(resultsFile, 'utf8');
  assert.ok(resultsContent.includes('WaitlistBypassContrast'), 'LiveResultsPanel must mount WaitlistBypassContrast');
  assert.ok(resultsContent.includes('DelayContingencySimulator'), 'LiveResultsPanel must mount DelayContingencySimulator');
  assert.ok(resultsContent.includes('RouteMap'), 'LiveResultsPanel must mount RouteMap');
  assert.ok(resultsContent.includes('data-testid="statutory-split-disclosure"'), 'Must declare statutory disclosure in results');

  // NormalPlanner
  const plannerFile = path.resolve('src/planner/NormalPlanner.jsx');
  const plannerContent = fs.readFileSync(plannerFile, 'utf8');
  assert.ok(plannerContent.includes('StationAutocomplete'), 'NormalPlanner must use StationAutocomplete');
  assert.ok(plannerContent.includes('inputTestId="planner-from-input"'), 'Must preserve planner-from-input testid');
  assert.ok(plannerContent.includes('inputTestId="planner-to-input"'), 'Must preserve planner-to-input testid');
  assert.ok(plannerContent.includes('WaitlistBypassContrast'), 'NormalPlanner must integrate WaitlistBypassContrast tab');
  assert.ok(plannerContent.includes('DelayContingencySimulator'), 'NormalPlanner must integrate DelayContingencySimulator tab');
});

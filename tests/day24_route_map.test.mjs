import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Day 24: RouteMap.jsx component exports valid visualizer and Leaflet integration', () => {
  const mapComponentPath = path.resolve('src/components/RouteMap.jsx');
  assert.ok(fs.existsSync(mapComponentPath), 'RouteMap.jsx must exist');

  const content = fs.readFileSync(mapComponentPath, 'utf8');
  assert.ok(content.includes('import L from \'leaflet\''), 'Must import Leaflet library');
  assert.ok(content.includes('import \'leaflet/dist/leaflet.css\''), 'Must import Leaflet CSS');
  assert.ok(content.includes('data-testid="interactive-route-map"'), 'Must declare accessible test ID');
  assert.ok(content.includes('data-testid="leaflet-map-canvas"'), 'Must contain leaflet map canvas');
  assert.ok(content.includes('data-testid="map-zoom-fit"'), 'Must provide Fit Route control');
  assert.ok(content.includes('data-testid="map-focus-junction"'), 'Must provide Focus Junction control');
  assert.ok(content.includes('OpenStreetMap'), 'Must cite OpenStreetMap contributors');
});

test('Day 24: NormalPlanner.jsx mounts RouteMap component as first-class feature', () => {
  const normalPlannerPath = path.resolve('src/planner/NormalPlanner.jsx');
  const plannerContent = fs.readFileSync(normalPlannerPath, 'utf8');
  assert.ok(plannerContent.includes('import RouteMap from \'../components/RouteMap\''), 'Must import RouteMap');
  assert.ok(plannerContent.includes('<RouteMap plan={plan} />'), 'Must render RouteMap in NormalPlanner');
});

test('Day 24: RouteMap integrates verified transit hub guidance and multi-modal route sequence', () => {
  const mapComponentPath = path.resolve('src/components/RouteMap.jsx');
  const content = fs.readFileSync(mapComponentPath, 'utf8');
  assert.ok(content.includes('getTransitHubGuide'), 'Must integrate transit hub guide');
  assert.ok(content.includes('transitHubDirectory'), 'Must link to transit hub directory');
  assert.ok(content.includes('data-testid="map-junction-card"'), 'Must declare transfer junction highlight card');
});

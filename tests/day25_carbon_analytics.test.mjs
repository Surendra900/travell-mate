import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { estimateCarbonKg } from '../src/utils/scoring.js';

test('Day 25: estimateCarbonKg accurately computes multi-modal transit emissions', () => {
  const trainEmissions = estimateCarbonKg({ distance: 1000, mode: 'Train', passengers: 1 });
  assert.equal(trainEmissions, 40, '1000km on Train should be 40kg CO2e');

  const busEmissions = estimateCarbonKg({ distance: 1000, mode: 'Bus', passengers: 1 });
  assert.equal(busEmissions, 80, '1000km on Bus should be 80kg CO2e');

  const flightEmissions = estimateCarbonKg({ distance: 1000, mode: 'Flight', passengers: 1 });
  assert.equal(flightEmissions, 180, '1000km on Flight should be 180kg CO2e');

  // Scaling with passengers
  const trainMultiPax = estimateCarbonKg({ distance: 1000, mode: 'Train', passengers: 3 });
  assert.equal(trainMultiPax, 120, '3 passengers on Train should be 120kg CO2e');
});

test('Day 25: CarbonCalculator.jsx defines rich environmental intelligence card and comparison bars', () => {
  const carbonPath = path.resolve('src/planner/CarbonCalculator.jsx');
  assert.ok(fs.existsSync(carbonPath), 'CarbonCalculator.jsx must exist');

  const content = fs.readFileSync(carbonPath, 'utf8');
  assert.ok(content.includes('data-testid="carbon-analytics-card"'), 'Must declare card test id');
  assert.ok(content.includes('data-testid="carbon-co2-val"'), 'Must declare footprint value test id');
  assert.ok(content.includes('data-testid="carbon-savings-badge"'), 'Must declare savings badge test id');
  assert.ok(content.includes('data-testid="carbon-trees-val"'), 'Must declare trees offset value test id');
  assert.ok(content.includes('Private Cab'), 'Must support Private Cab baseline comparison');
  assert.ok(content.includes('Flight'), 'Must support Flight baseline comparison');
});

test('Day 25: NormalPlanner.jsx mounts CarbonCalculator component', () => {
  const plannerPath = path.resolve('src/planner/NormalPlanner.jsx');
  const content = fs.readFileSync(plannerPath, 'utf8');
  assert.ok(content.includes('import CarbonCalculator from \'./CarbonCalculator\''), 'Must import CarbonCalculator');
  assert.ok(content.includes('<CarbonCalculator plan={plan} />'), 'Must mount CarbonCalculator');
});

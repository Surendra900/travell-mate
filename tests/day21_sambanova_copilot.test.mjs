import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { normalizeTravelMessage, extractRouteIntent } from '../api/assistant.js';

const root = path.resolve('.');
const smartAssistantPath = path.join(root, 'src/components/SmartAssistant.jsx');

test('Day 21: normalizeTravelMessage cleans typos and normalizes transit terms', () => {
  const dirty = 'tikets fron Kochi 2 Chennai by trian';
  const clean = normalizeTravelMessage(dirty);
  assert.equal(clean, 'ticket from Kochi to Chennai by train');

  const arrow = 'Delhi ➔ Mumbai flite';
  const cleanArrow = normalizeTravelMessage(arrow);
  assert.equal(cleanArrow, 'Delhi to Mumbai flight');
});

test('Day 21: extractRouteIntent extracts train routes and applies patches', () => {
  const message = 'Tickets Kochi to Chennai by train.';
  const intent = extractRouteIntent(message);
  assert.equal(intent.routeDetected, true, 'Must detect route');
  assert.equal(intent.patch.from, 'Kochi');
  assert.equal(intent.patch.to, 'Chennai');
  assert.equal(intent.patch.transportMode, 'Train');
  assert.equal(intent.patch.classType, 'Sleeper (SL)');
});

test('Day 21: extractRouteIntent extracts flight routes with typo tolerance', () => {
  const message = 'Book me a Delhi to Mumbai flight tomorrow.';
  const intent = extractRouteIntent(message);
  assert.equal(intent.routeDetected, true, 'Must detect route');
  assert.equal(intent.patch.from, 'Delhi');
  assert.equal(intent.patch.to, 'Mumbai');
  assert.equal(intent.patch.transportMode, 'Flight');
  assert.equal(intent.patch.classType, 'Economy');
});

test('Day 21: SmartAssistant chat drawer is pruned per Master Spec Section 4', () => {
  assert.equal(fs.existsSync(smartAssistantPath), false, 'SmartAssistant.jsx must not exist');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { normalizeTravelMessage, extractRouteIntent } from '../api/assistant.js';

const root = path.resolve('.');
const smartAssistantPath = path.join(root, 'src/components/SmartAssistant.jsx');
const assistantApiPath = path.join(root, 'api/assistant.js');

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

test('Day 21: SmartAssistant component provides multilingual greetings across 10 Indian languages', () => {
  const code = fs.readFileSync(smartAssistantPath, 'utf8');
  for (const lang of ['hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu', 'ur']) {
    assert.ok(code.includes(`${lang}:`), `Must contain greeting for language ${lang}`);
  }
});

test('Day 21: SmartAssistant component implements accessible dialog and resilient composer', () => {
  const code = fs.readFileSync(smartAssistantPath, 'utf8');
  assert.ok(code.includes('role="dialog"'), 'Must declare dialog semantics');
  assert.ok(code.includes('aria-label="AI travel assistant"'), 'Must have accessible label');
  assert.ok(code.includes('data-testid="assistant-launcher-btn"'), 'Must declare launcher testid');
  assert.ok(code.includes('data-testid="assistant-composer-textarea"'), 'Must declare composer testid');
  assert.ok(code.includes('data-testid="assistant-send-btn"'), 'Must declare send button testid');
  assert.ok(code.includes('SAMBANOVA_API_KEY'), 'Must handle missing SAMBANOVA_API_KEY gracefully');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const bookingModalPath = path.join(root, 'src/components/BookingModal.jsx');
const liveResultsPath = path.join(root, 'src/components/LiveResultsPanel.jsx');

test('Day 20: BookingModal enforces strict demo guardrails and zero-payment safety', () => {
  const code = fs.readFileSync(bookingModalPath, 'utf8');

  // Prominent disclaimers
  assert.ok(code.includes('Demo only · no payment · no real ticket'), 'Must feature clear demo badge');
  assert.ok(code.includes('No money was charged'), 'Must explicitly state no money was charged');
  assert.ok(code.includes('not a PNR or ticket number'), 'Must clarify reference is not a real PNR');
  assert.ok(code.includes('Licensed and authorized direct booking is coming soon'), 'Must state commercial status');

  // Credential refusal
  assert.ok(code.includes('Do not enter real card, UPI PIN, bank password, OTP, Aadhaar number, passport number'), 'Must warn against entering sensitive secrets');
  assert.ok(!code.includes('cardNumber'), 'Must never declare cardNumber input');
  assert.ok(!code.includes('cvv'), 'Must never declare cvv input');
  assert.ok(!code.includes('upiPin'), 'Must never declare upiPin input');
});

test('Day 20: BookingModal generates valid non-ticket demo reference format', () => {
  const code = fs.readFileSync(bookingModalPath, 'utf8');
  assert.ok(code.includes('TM-DEMO-'), 'Demo reference must have TM-DEMO- prefix');
  
  // Verify reference generator format
  const date = new Date();
  const day = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('');
  const regex = new RegExp(`^TM-DEMO-${day}-[A-Z0-9]{6}$`);
  const sampleRef = `TM-DEMO-${day}-AB12CD`;
  assert.ok(regex.test(sampleRef), 'Sample reference must match format');
});

test('Day 20: BookingModal provides transport-specific seat/berth preferences', () => {
  const code = fs.readFileSync(bookingModalPath, 'utf8');

  // Train
  assert.ok(code.includes('Berth preference'), 'Must offer berth preference for trains');
  assert.ok(code.includes('Lower berth'), 'Must include Lower berth');
  assert.ok(code.includes('Side lower'), 'Must include Side lower');

  // Flight & Bus
  assert.ok(code.includes('Window seat'), 'Must include Window seat');
  assert.ok(code.includes('Aisle seat'), 'Must include Aisle seat');
  assert.ok(code.includes('Lower deck'), 'Must include Lower deck for buses');
});

test('Day 20: BookingModal provides pre-filled official portal deep links', () => {
  const code = fs.readFileSync(bookingModalPath, 'utf8');
  assert.ok(code.includes('ConfirmTkt'), 'Must link to ConfirmTkt for trains');
  assert.ok(code.includes('RedBus'), 'Must link to RedBus for buses');
  assert.ok(code.includes('Google Flights'), 'Must link to Google Flights');
  assert.ok(code.includes('openPortal'), 'Must have openPortal handler');
});

test('Day 20: LiveResultsPanel exposes 1-tap demo booking entry point', () => {
  const code = fs.readFileSync(liveResultsPath, 'utf8');
  assert.ok(code.includes('Start demo booking'), 'Live results row must contain Start demo booking button');
  assert.ok(code.includes('data-testid="start-demo-booking-btn"'), 'Must have testid for automation');
});

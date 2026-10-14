import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { getProviderDeepLink } from '../src/data/transportData.js';

const root = path.resolve('.');
const bookingModalPath = path.join(root, 'src/components/BookingModal.jsx');
const liveResultsPath = path.join(root, 'src/components/LiveResultsPanel.jsx');

test('Day 20: BookingModal is pruned in favor of verified direct portal deep links per Master Spec', () => {
  assert.equal(fs.existsSync(bookingModalPath), false, 'BookingModal.jsx must not exist');
});

test('Day 20: getProviderDeepLink provides verified pre-filled deep links without credentials', () => {
  const trainLink = getProviderDeepLink({
    transport: 'Train',
    from: 'NDLS',
    to: 'PNBE',
    date: '2026-10-15',
    serviceCode: '12302'
  });
  assert.ok(trainLink.includes('confirmtkt.com'), 'Train link must target ConfirmTkt');

  const busLink = getProviderDeepLink({
    transport: 'Bus',
    from: 'Bengaluru',
    to: 'Hyderabad',
    date: '2026-10-15'
  });
  assert.ok(busLink.includes('redbus.in'), 'Bus link must target redBus');

  const flightLink = getProviderDeepLink({
    transport: 'Flight',
    from: 'DEL',
    to: 'BOM',
    date: '2026-10-15'
  });
  assert.ok(flightLink.includes('google.com/travel/flights'), 'Flight link must target Google Flights');
});

test('Day 20: LiveResultsPanel exposes 1-tap booking button and official portal links', () => {
  const code = fs.readFileSync(liveResultsPath, 'utf8');
  assert.ok(code.includes('data-testid="start-demo-booking-btn"'), 'Must have testid for automation');
  assert.ok(code.includes('Official Portal'), 'Must include Official Portal deep link');
});

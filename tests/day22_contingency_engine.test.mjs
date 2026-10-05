import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { calculateConnectionRisk, generateContingencyOptions } from '../src/utils/contingencyEngine.js';

const root = path.resolve('.');
const backupPlanPath = path.join(root, 'src/components/BackupPlan.jsx');

test('Day 22: calculateConnectionRisk evaluates safe, moderate and critical delays accurately', () => {
  const onTime = calculateConnectionRisk(0, 60);
  assert.equal(onTime.riskLevel, 'SAFE');
  assert.equal(onTime.contingencyTriggered, false);
  assert.equal(onTime.remainingBuffer, 60);

  const moderate = calculateConnectionRisk(25, 60);
  assert.equal(moderate.riskLevel, 'MODERATE');
  assert.equal(moderate.contingencyTriggered, false);
  assert.equal(moderate.remainingBuffer, 35);

  const severe = calculateConnectionRisk(55, 60);
  assert.equal(severe.riskLevel, 'CRITICAL');
  assert.equal(severe.contingencyTriggered, true);
  assert.ok(severe.missedTransferProbability >= 80, 'Must predict severe missed transfer risk');
});

test('Day 22: generateContingencyOptions produces rich multimodal fallback options', () => {
  const options = generateContingencyOptions({ from: 'Delhi', to: 'Lucknow', transportMode: 'Train' }, 55);
  assert.ok(Array.isArray(options), 'Must return an array of options');
  assert.ok(options.length >= 3, 'Must offer at least 3 viable contingency options');

  const express = options.find((opt) => opt.id === 'contingency-fast-express');
  assert.ok(express, 'Must include express rail bypass option');
  assert.ok(express.code && express.carrier, 'Must have realistic carrier code');

  const bus = options.find((opt) => opt.id === 'contingency-intercity-road');
  assert.ok(bus, 'Must include road connector');
  assert.ok(bus.provider === 'RedBus', 'Must provide verified provider partner');
});

test('Day 22: BackupPlan component contains contingency alert banner and simulator triggers', () => {
  const code = fs.readFileSync(backupPlanPath, 'utf8');
  assert.ok(code.includes('data-testid="contingency-severe-delay-banner"'), 'Must define severe delay banner testid');
  assert.ok(code.includes('simulate-delay-55m'), 'Must define severe delay simulator testid');
  assert.ok(code.includes('activateContingency'), 'Must declare contingency activation handler');
  assert.ok(code.includes('calculateConnectionRisk'), 'Must integrate contingency calculation engine');
});

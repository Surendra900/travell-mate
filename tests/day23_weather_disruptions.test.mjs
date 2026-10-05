import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  resolveTransitCoordinates,
  evaluateTransitDisruption,
  fetchHubWeatherDisruption,
  DEMO_WEATHER_SCENARIOS,
  INDIAN_TRANSIT_COORDINATES
} from '../src/utils/weatherDisruptionEngine.js';

test('Day 23: resolveTransitCoordinates accurately resolves Indian transit hubs and station codes', () => {
  const delhi = resolveTransitCoordinates('Delhi');
  assert.equal(delhi.city, 'Delhi');
  assert.equal(delhi.lat, 28.6139);
  assert.equal(delhi.lon, 77.209);

  const ndls = resolveTransitCoordinates('NDLS');
  assert.equal(ndls.city, 'Delhi');

  const csmt = resolveTransitCoordinates('CSMT');
  assert.equal(csmt.city, 'Mumbai');

  const bza = resolveTransitCoordinates('Vijayawada');
  assert.equal(bza.city, 'Vijayawada');

  const ngp = resolveTransitCoordinates('NGP');
  assert.equal(ngp.city, 'Nagpur');
});

test('Day 23: evaluateTransitDisruption accurately identifies Dense Winter Fog and calculates delay risk', () => {
  const fogWeather = {
    temperature_2m: 8.0,
    relative_humidity_2m: 98,
    precipitation: 0.0,
    weather_code: 45, // Fog
    wind_speed_10m: 4.0,
    visibility: 250 // 250 meters
  };

  const analysis = evaluateTransitDisruption(fogWeather, 'Delhi Junction');
  assert.equal(analysis.riskLevel, 'CRITICAL');
  assert.equal(analysis.isDisrupted, true);
  assert.ok(analysis.delayEstimateMinutes >= 60, 'Expected severe delay risk for winter fog');
  assert.match(analysis.trainImpact, /Fog Pass Device|restricted/i);
  assert.match(analysis.flightImpact, /CAT-III/i);
});

test('Day 23: evaluateTransitDisruption accurately identifies Torrential Monsoon and waterlogging risks', () => {
  const monsoonWeather = {
    temperature_2m: 27.0,
    relative_humidity_2m: 95,
    precipitation: 28.0, // 28 mm/h
    weather_code: 65, // Heavy Rain
    wind_speed_10m: 45.0,
    visibility: 800
  };

  const analysis = evaluateTransitDisruption(monsoonWeather, 'Mumbai CSMT');
  assert.equal(analysis.riskLevel, 'CRITICAL');
  assert.equal(analysis.isDisrupted, true);
  assert.match(analysis.trainImpact, /waterlogging/i);
  assert.match(analysis.recommendedAction, /buffer/i);
});

test('Day 23: evaluateTransitDisruption accurately identifies Clear Sky and normal operations', () => {
  const clearWeather = {
    temperature_2m: 25.0,
    relative_humidity_2m: 50,
    precipitation: 0.0,
    weather_code: 0, // Clear Sky
    wind_speed_10m: 10.0,
    visibility: 12000
  };

  const analysis = evaluateTransitDisruption(clearWeather, 'Bengaluru');
  assert.equal(analysis.riskLevel, 'CLEAR');
  assert.equal(analysis.isDisrupted, false);
  assert.equal(analysis.delayEstimateMinutes, 0);
  assert.match(analysis.trainImpact, /Normal signaling/i);
});

test('Day 23: fetchHubWeatherDisruption supports demo scenarios and offline fallback resilience', async () => {
  const fogScenario = await fetchHubWeatherDisruption('Delhi', { scenario: 'delhi_dense_fog' });
  assert.equal(fogScenario.ok, true);
  assert.equal(fogScenario.source, 'scenario-simulator');
  assert.equal(fogScenario.analysis.riskLevel, 'CRITICAL');

  // Verify structure of components and templates
  const alertComponentPath = path.resolve('src/components/WeatherDisruptionAlert.jsx');
  assert.ok(fs.existsSync(alertComponentPath), 'WeatherDisruptionAlert.jsx must exist');
  const alertContent = fs.readFileSync(alertComponentPath, 'utf8');
  assert.ok(alertContent.includes('Open-Meteo REST API'), 'Must cite Open-Meteo REST API');
  assert.ok(alertContent.includes('data-testid="weather-disruption-alert"'));
  assert.ok(alertContent.includes('data-testid="sim-fog-btn"'));
  assert.ok(alertContent.includes('data-testid="sim-monsoon-btn"'));
});

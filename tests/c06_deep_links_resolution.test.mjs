import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getBookingDeepLink, resolveStationCity, resolveStationAirportIata } from '../server/services/routeEngine.js';
import { getProviderDeepLink } from '../src/data/transportData.js';

describe('C-06: Deep Links Station Code to City and IATA Resolution Gate', () => {
  test('resolveStationCity maps railway station codes to human city names', () => {
    assert.equal(resolveStationCity('CNB'), 'kanpur');
    assert.equal(resolveStationCity('NDLS'), 'delhi');
    assert.equal(resolveStationCity('PNBE'), 'patna');
    assert.equal(resolveStationCity('HWH'), 'kolkata');
    assert.equal(resolveStationCity('MMCT'), 'mumbai');
    assert.equal(resolveStationCity('MAS'), 'chennai');
    assert.equal(resolveStationCity('SBC'), 'bengaluru');
  });

  test('resolveStationAirportIata maps railway station codes to airport IATA codes', () => {
    assert.equal(resolveStationAirportIata('NDLS'), 'DEL');
    assert.equal(resolveStationAirportIata('PNBE'), 'PAT');
    assert.equal(resolveStationAirportIata('MMCT'), 'BOM');
    assert.equal(resolveStationAirportIata('HWH'), 'CCU');
    assert.equal(resolveStationAirportIata('MAS'), 'MAA');
    assert.equal(resolveStationAirportIata('SBC'), 'BLR');
  });

  test('getBookingDeepLink produces human city path slugs for redBus', () => {
    const busLink1 = getBookingDeepLink('bus', { fromCode: 'CNB', toCode: 'PNBE', date: '2026-10-15' });
    assert.ok(busLink1.includes('kanpur-to-patna'), `Expected kanpur-to-patna but got: ${busLink1}`);
    assert.ok(!busLink1.includes('cnb-to-pnbe'), 'Must not contain raw station codes cnb-to-pnbe');

    const busLink2 = getBookingDeepLink('bus', { fromCode: 'NDLS', toCode: 'PNBE', date: '2026-10-15' });
    assert.ok(busLink2.includes('delhi-to-patna'), `Expected delhi-to-patna but got: ${busLink2}`);
    assert.ok(!busLink2.includes('ndls-to-pnbe'), 'Must not contain raw station codes ndls-to-pnbe');
  });

  test('getBookingDeepLink produces valid airport IATA codes or cities for Google Flights', () => {
    const flightLink1 = getBookingDeepLink('flight', { fromCode: 'NDLS', toCode: 'PNBE', date: '2026-10-15' });
    assert.ok(flightLink1.includes('DEL') && flightLink1.includes('PAT'), `Expected DEL and PAT in flight link: ${flightLink1}`);
    assert.ok(!flightLink1.includes('NDLS'), 'Must not query railway station code NDLS in Google Flights');

    const flightLink2 = getBookingDeepLink('flight', { fromCode: 'MMCT', toCode: 'HWH', date: '2026-10-15' });
    assert.ok(flightLink2.includes('BOM') && flightLink2.includes('CCU'), `Expected BOM and CCU in flight link: ${flightLink2}`);
    assert.ok(!flightLink2.includes('MMCT'), 'Must not query railway station code MMCT in Google Flights');
  });

  test('getProviderDeepLink in transportData resolves station codes to city slugs for redBus', () => {
    const busLink = getProviderDeepLink({ transport: 'Bus', from: 'NDLS', to: 'PNBE', date: '2026-10-15' });
    assert.ok(busLink.includes('delhi-to-patna'), `Expected delhi-to-patna but got: ${busLink}`);
    assert.ok(!busLink.includes('ndls-to-pnbe'), 'Must not contain raw station codes ndls-to-pnbe');
  });
});

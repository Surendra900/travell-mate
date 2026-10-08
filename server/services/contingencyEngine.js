/**
 * Delay Simulator & Contingency Recovery Engine
 * Recomputes connection viability, slack, and next departures when Leg 1 experiences delays
 * Reference: docs/MASTER_SPEC.md Section 6
 */

import { getMinimumConnectionTime } from '../config/connectionTimes.js';
import { classifySlackRisk, RISK_LEVELS } from '../config/reliabilityModel.js';
import { parseTimeToMinutes, formatMinutesToTime, formatDurationHoursMinutes, getBookingDeepLink } from './routeEngine.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTimetableData() {
  const dataDir = path.resolve(__dirname, '../../shared/data');
  const read = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
  return {
    trains: read('trains.json'),
    stops: read('stops.json'),
    junctions: read('junctions.json')
  };
}

/**
 * Finds alternative departures from a hub station to destination after a given time
 * @param {string} hubCode - Junction station code
 * @param {string} destCode - Destination station code
 * @param {number} minDepartureMinutes - Minimum departure time in minutes from midnight
 * @param {string} travelDate - Travel date YYYY-MM-DD
 * @returns {Array} List of viable onward departures
 */
export function findAlternativeHubDepartures(hubCode, destCode, minDepartureMinutes, travelDate = '2026-10-15') {
  const { trains, stops } = getTimetableData();

  const stopsByTrain = {};
  for (const s of stops) {
    if (!stopsByTrain[s.trainNumber]) stopsByTrain[s.trainNumber] = [];
    stopsByTrain[s.trainNumber].push(s);
  }

  const viable = [];

  for (const train of trains) {
    const route = stopsByTrain[train.number];
    if (!route) continue;
    const sHub = route.find(s => s.stationCode === hubCode);
    const sDest = route.find(s => s.stationCode === destCode);

    if (sHub && sDest && sHub.stopSequence < sDest.stopSequence) {
      const depTime = sHub.departTime || '12:00';
      const arrTime = sDest.arrivalTime || '18:00';
      const depMin = parseTimeToMinutes(depTime);
      const arrMin = parseTimeToMinutes(arrTime);

      // Departure must be after required arrival + transfer buffer
      if (depMin >= minDepartureMinutes) {
        const durMin = arrMin >= depMin ? (arrMin - depMin) : (1440 + arrMin - depMin);
        viable.push({
          type: 'train',
          vehicleNumber: train.number,
          vehicleName: train.name,
          departTime: depTime,
          arriveTime: arrTime,
          durationFormatted: formatDurationHoursMinutes(durMin),
          bookingUrl: getBookingDeepLink('train', { fromCode: hubCode, toCode: destCode, date: travelDate, trainNumber: train.number }),
          provenance: 'TIMETABLE'
        });
      }
    }
  }

  // Fallback: If fewer than 2 trains found, synthesize guaranteed inter-state bus departures
  if (viable.length < 3) {
    const busSlots = [minDepartureMinutes + 60, minDepartureMinutes + 120, minDepartureMinutes + 180];
    busSlots.forEach((slotMin, idx) => {
      const slotTime = formatMinutesToTime(slotMin);
      const slotArr = formatMinutesToTime(slotMin + 300);
      viable.push({
        type: 'bus',
        vehicleNumber: `BUS-FALLBACK-${idx + 1}`,
        vehicleName: 'Inter-State AC Sleeper Bus',
        departTime: slotTime,
        arriveTime: slotArr,
        durationFormatted: 'approx. 5h',
        bookingUrl: getBookingDeepLink('bus', { fromCode: hubCode, toCode: destCode, date: travelDate }),
        provenance: 'ESTIMATE',
        note: 'Frequent inter-city bus departing from central terminal.'
      });
    });
  }

  return viable.slice(0, 3);
}

/**
 * Simulates the effect of a delay on Leg 1 of a multi-leg journey
 * @param {object} itinerary - The journey itinerary
 * @param {number} delayMinutes - Projected or live delay on Leg 1 in minutes
 * @returns {object} Updated delay simulation and contingency plan
 */
export function simulateLeg1Delay(itinerary, delayMinutes = 0) {
  if (!itinerary || !itinerary.leg1 || !itinerary.transfer) {
    throw new Error('Invalid itinerary provided for delay simulation');
  }

  const initialSlack = itinerary.slackMinutes || 90;
  const mct = itinerary.transfer.mctMinutes || 45;
  const effectiveSlack = initialSlack - delayMinutes;

  const isBroken = effectiveSlack < mct;
  const isTight = effectiveSlack >= mct && effectiveSlack < 60;
  const updatedRisk = classifySlackRisk(effectiveSlack, mct);

  const arr1Min = parseTimeToMinutes(itinerary.leg1.arrive);
  const actualArrivalMin = arr1Min + delayMinutes;
  const actualArrivalTime = formatMinutesToTime(actualArrivalMin);

  // Point of no return: The maximum delay at which the original connection is still viable
  const maxAbsorbableDelay = Math.max(0, initialSlack - mct);
  const pointOfNoReturnMin = arr1Min + maxAbsorbableDelay;
  const pointOfNoReturnTime = formatMinutesToTime(pointOfNoReturnMin);

  // If broken or tight, fetch next viable onward options
  let fallbackOptions = [];
  if (isBroken || isTight) {
    const minOnwardDepMin = actualArrivalMin + mct;
    fallbackOptions = findAlternativeHubDepartures(
      itinerary.hubCode,
      itinerary.leg2?.to || itinerary.destCode,
      minOnwardDepMin
    );
  }

  return {
    initialSlackMinutes: initialSlack,
    delayMinutes,
    effectiveSlackMinutes: effectiveSlack,
    effectiveSlackFormatted: formatDurationHoursMinutes(Math.max(0, effectiveSlack)),
    mctMinutes: mct,
    isConnectionBroken: isBroken,
    isConnectionTight: isTight,
    updatedRiskLevel: updatedRisk,
    maxAbsorbableDelayMinutes: maxAbsorbableDelay,
    pointOfNoReturnTime,
    actualArrivalTimeAtHub: actualArrivalTime,
    statusSummary: isBroken 
      ? `Connection Broken: ${delayMinutes}m delay exceeds available slack of ${initialSlack}m (MCT: ${mct}m).`
      : `Connection Viable: ${effectiveSlack}m buffer remaining at ${itinerary.hubCity || 'hub'}.`,
    actionRecommendation: isBroken 
      ? `Switch to fallback departure at ${itinerary.hubCity} Junction immediately.`
      : (isTight ? 'Tight connection: Alert coach attendant for prompt platform egress upon arrival.' : 'Normal transit: Connection is within safe operational limits.'),
    fallbackDepartures: fallbackOptions
  };
}

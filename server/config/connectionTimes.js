/**
 * Minimum Connection Time (MCT) Matrix & Urban Transfer Configurations
 * Authoritative config for TravelMate Route Recovery Engine v2
 * Reference: docs/MASTER_SPEC.md Section 6
 */

export const MIN_CONNECTION_MINUTES = {
  // Rail-to-Rail transfers at same physical station
  RAIL_TO_RAIL_SAME_STATION: 45,

  // Rail-to-Rail transfers between different stations in the same urban node
  // (e.g. New Delhi NDLS to Hazrat Nizamuddin NZM, or Howrah HWH to Sealdah SDAH)
  RAIL_TO_RAIL_CROSS_METRO: 90,

  // Rail-to-Bus intermodal transfer (station to ISBT / central bus stand across town)
  RAIL_TO_BUS: 105,

  // Bus-to-Rail intermodal transfer (ISBT to railway station)
  BUS_TO_RAIL: 90,

  // Rail-to-Airport intermodal transfer (station to civil airport including check-in & CISF security)
  RAIL_TO_AIRPORT: 210,

  // Airport-to-Rail intermodal transfer (deplaning, baggage claim, airport to station)
  AIRPORT_TO_RAIL: 180,

  // Default fallback for unspecified intermodal pairs
  DEFAULT_INTERMODAL: 120
};

/**
 * Overnight transfer window: Transfers occurring between 23:00 and 05:00 IST
 * Require explicit user consent or clear safety warnings per Master Spec Section 6.
 */
export const OVERNIGHT_WINDOW = {
  START_HOUR: 23, // 11:00 PM
  END_HOUR: 5     // 05:00 AM
};

/**
 * Calculates the required minimum connection time between two transit modes
 * @param {string} mode1 - 'train' | 'bus' | 'flight'
 * @param {string} mode2 - 'train' | 'bus' | 'flight'
 * @param {boolean} sameLocation - Whether arrival & departure occur at identical terminal
 * @returns {number} Minimum connection time in minutes
 */
export function getMinimumConnectionTime(mode1 = 'train', mode2 = 'train', sameLocation = true) {
  const m1 = String(mode1).toLowerCase();
  const m2 = String(mode2).toLowerCase();

  if (m1 === 'train' && m2 === 'train') {
    return sameLocation 
      ? MIN_CONNECTION_MINUTES.RAIL_TO_RAIL_SAME_STATION 
      : MIN_CONNECTION_MINUTES.RAIL_TO_RAIL_CROSS_METRO;
  }

  if (m1 === 'train' && m2 === 'bus') {
    return MIN_CONNECTION_MINUTES.RAIL_TO_BUS;
  }

  if (m1 === 'bus' && m2 === 'train') {
    return MIN_CONNECTION_MINUTES.BUS_TO_RAIL;
  }

  if (m1 === 'train' && m2 === 'flight') {
    return MIN_CONNECTION_MINUTES.RAIL_TO_AIRPORT;
  }

  if (m1 === 'flight' && m2 === 'train') {
    return MIN_CONNECTION_MINUTES.AIRPORT_TO_RAIL;
  }

  return MIN_CONNECTION_MINUTES.DEFAULT_INTERMODAL;
}

/**
 * Checks whether an arrival or departure time falls into the overnight layover window (23:00 - 05:00)
 * @param {string} timeStr - Time string formatted as 'HH:mm'
 * @returns {boolean} True if the time is overnight
 */
export function isOvernightTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return false;
  const parts = timeStr.split(':');
  if (parts.length < 2) return false;
  const hour = parseInt(parts[0], 10);
  if (Number.isNaN(hour)) return false;
  return hour >= OVERNIGHT_WINDOW.START_HOUR || hour < OVERNIGHT_WINDOW.END_HOUR;
}

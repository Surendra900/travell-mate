/**
 * Connection Risk Classifier & Parametric Reliability Delay Model
 * Authoritative implementation for TravelMate Route Recovery Engine v2
 * Reference: docs/MASTER_SPEC.md Sections 5 & 6
 */

import { getMinimumConnectionTime } from './connectionTimes.js';

export const RISK_LEVELS = {
  SAFE: 'SAFE',
  MODERATE: 'MODERATE',
  TIGHT: 'TIGHT',
  HIGH_RISK: 'HIGH_RISK',
  BROKEN: 'BROKEN'
};

export const TRAIN_CATEGORY_METRICS = {
  VANDE_BHARAT: {
    categoryName: 'Vande Bharat / Tejas',
    p50DelayMin: 8,
    p85DelayMin: 25,
    p95DelayMin: 45,
    priorityRank: 1,
    description: 'Premier semi-high-speed service with highest track & dispatch priority'
  },
  RAJDHANI_SHATABDI: {
    categoryName: 'Rajdhani / Shatabdi / Duronto',
    p50DelayMin: 15,
    p85DelayMin: 40,
    p95DelayMin: 70,
    priorityRank: 2,
    description: 'Premier trunk corridor trains with elevated dispatch priority'
  },
  SUPERFAST: {
    categoryName: 'Superfast Express',
    p50DelayMin: 25,
    p85DelayMin: 60,
    p95DelayMin: 110,
    priorityRank: 3,
    description: 'High-speed express services with scheduled average speed > 55 km/h'
  },
  MAIL_EXPRESS: {
    categoryName: 'Mail / Express',
    p50DelayMin: 40,
    p85DelayMin: 95,
    p95DelayMin: 160,
    priorityRank: 4,
    description: 'Standard long-distance passenger services subject to sectional congestion'
  },
  DEFAULT: {
    categoryName: 'General Rail / Transit',
    p50DelayMin: 30,
    p85DelayMin: 75,
    p95DelayMin: 130,
    priorityRank: 3,
    description: 'Standard corridor baseline estimate'
  }
};

/**
 * Classifies connection risk based strictly on slack minutes
 * @param {number} slackMinutes - Total layover between legs in minutes
 * @param {number} mctMinutes - Minimum Connection Time in minutes
 * @returns {string} One of RISK_LEVELS
 */
export function classifySlackRisk(slackMinutes, mctMinutes = 45) {
  if (slackMinutes < mctMinutes) {
    return RISK_LEVELS.BROKEN;
  }
  if (slackMinutes >= 120) {
    return RISK_LEVELS.SAFE;
  }
  if (slackMinutes >= 90) {
    return RISK_LEVELS.MODERATE;
  }
  if (slackMinutes >= 60) {
    return RISK_LEVELS.TIGHT;
  }
  return RISK_LEVELS.HIGH_RISK;
}

/**
 * Identifies the train category from train name or type string
 * @param {string} trainName - Name of the train (e.g. 'Vande Bharat Express', 'Rajdhani Exp')
 * @returns {object} Category metrics
 */
export function getTrainCategoryMetrics(trainName = '') {
  const norm = String(trainName).toUpperCase();
  if (norm.includes('VANDE') || norm.includes('TEJAS') || norm.includes('GATIMAAN')) {
    return TRAIN_CATEGORY_METRICS.VANDE_BHARAT;
  }
  if (norm.includes('RAJDHANI') || norm.includes('SHATABDI') || norm.includes('DURONTO')) {
    return TRAIN_CATEGORY_METRICS.RAJDHANI_SHATABDI;
  }
  if (norm.includes('SF') || norm.includes('SUPERFAST')) {
    return TRAIN_CATEGORY_METRICS.SUPERFAST;
  }
  if (norm.includes('EXP') || norm.includes('MAIL')) {
    return TRAIN_CATEGORY_METRICS.MAIL_EXPRESS;
  }
  return TRAIN_CATEGORY_METRICS.DEFAULT;
}

/**
 * Calculates parametric connection reliability score and delay absorption limit
 * @param {object} params
 * @param {number} params.slackMinutes - Total scheduled layover duration in minutes
 * @param {string} params.mode1 - Leg 1 transit mode ('train' | 'bus' | 'flight')
 * @param {string} params.mode2 - Leg 2 transit mode ('train' | 'bus' | 'flight')
 * @param {boolean} params.sameStation - Whether transfer is at the same station
 * @param {string} params.leg1VehicleName - Vehicle / train name on leg 1
 * @returns {object} Comprehensive connection assessment
 */
export function evaluateConnectionReliability({
  slackMinutes = 0,
  mode1 = 'train',
  mode2 = 'train',
  sameStation = true,
  leg1VehicleName = ''
} = {}) {
  const mct = getMinimumConnectionTime(mode1, mode2, sameStation);
  const riskLevel = classifySlackRisk(slackMinutes, mct);
  const maxDelayBeforeBreak = Math.max(0, slackMinutes - mct);

  const trainMetrics = getTrainCategoryMetrics(leg1VehicleName);
  const { p50DelayMin, p85DelayMin, p95DelayMin } = trainMetrics;

  // Parametric probability estimation:
  // Evaluates CDF approximation where buffer allows absorption of expected delay distribution
  let estimatedReliabilityPercent = 50;
  if (slackMinutes < mct) {
    estimatedReliabilityPercent = 0;
  } else if (maxDelayBeforeBreak >= p95DelayMin) {
    estimatedReliabilityPercent = 96;
  } else if (maxDelayBeforeBreak >= p85DelayMin) {
    estimatedReliabilityPercent = 88;
  } else if (maxDelayBeforeBreak >= p50DelayMin) {
    estimatedReliabilityPercent = 75;
  } else if (maxDelayBeforeBreak > 0) {
    // Linear interpolation between 50% and 75%
    const ratio = maxDelayBeforeBreak / Math.max(1, p50DelayMin);
    estimatedReliabilityPercent = Math.round(50 + (ratio * 25));
  } else {
    estimatedReliabilityPercent = 40;
  }

  const badgeConfig = {
    [RISK_LEVELS.SAFE]: {
      label: 'Safe Transfer',
      tone: 'success',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    [RISK_LEVELS.MODERATE]: {
      label: 'Moderate Buffer',
      tone: 'info',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    [RISK_LEVELS.TIGHT]: {
      label: 'Tight Connection',
      tone: 'warning',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    [RISK_LEVELS.HIGH_RISK]: {
      label: 'High Risk Transfer',
      tone: 'danger',
      badgeClass: 'bg-red-50 text-red-700 border-red-200'
    },
    [RISK_LEVELS.BROKEN]: {
      label: 'Insufficient Layover',
      tone: 'danger',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
    }
  }[riskLevel];

  return {
    slackMinutes,
    mctMinutes: mct,
    riskLevel,
    badgeLabel: badgeConfig.label,
    badgeTone: badgeConfig.tone,
    badgeClass: badgeConfig.badgeClass,
    maxDelayBeforeBreak,
    safeDelayMessage: `Safe up to +${maxDelayBeforeBreak} min delay on Leg 1`,
    estimatedReliabilityPercent,
    reliabilityExplanation: `Estimated connection reliability based on scheduled ${slackMinutes}m layover, ${mct}m minimum connection time, and historical ${trainMetrics.categoryName} punctuality profiles.`,
    isViolatingMct: slackMinutes < mct,
    trainMetrics
  };
}

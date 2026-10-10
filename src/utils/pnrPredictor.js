/**
 * TravelMate AI - IRCTC Waitlist Confirmation Probability Engine
 * 
 * Analyzes quota types (GNWL, RLWL, PQWL, TQWL, RAC), coach class,
 * days until departure, and historical cancellation velocity to calculate
 * realistic confirmation odds for Indian Railways waitlisted tickets.
 */

export const WAITLIST_QUOTAS = {
  RAC: {
    code: 'RAC',
    name: 'Reservation Against Cancellation',
    baseRate: 0.94,
    description: 'Guaranteed right to board the train with shared side-lower berth. High likelihood of full berth upon charting.'
  },
  GNWL: {
    code: 'GNWL',
    name: 'General Waiting List',
    baseRate: 0.78,
    description: 'Issued from originating station. Benefits from the largest cancellation pool and VIP quota releases.'
  },
  RLWL: {
    code: 'RLWL',
    name: 'Remote Location Waiting List',
    baseRate: 0.52,
    description: 'Issued for important intermediate stations. Clears only when passengers booking within this specific section cancel.'
  },
  PQWL: {
    code: 'PQWL',
    name: 'Pooled Quota Waiting List',
    baseRate: 0.32,
    description: 'Shared across multiple small intermediate stations. Very limited quota; lowest clearance rate.'
  },
  TQWL: {
    code: 'TQWL',
    name: 'Tatkal Waiting List',
    baseRate: 0.15,
    description: 'Issued after Tatkal quota exhausts. Directly cancels without RAC; extremely rare to confirm.'
  },
  RSWL: {
    code: 'RSWL',
    name: 'Roadside Station Waiting List',
    baseRate: 0.28,
    description: 'Specific to intermediate roadside halts without dedicated quotas.'
  }
}

export const CLASS_CANCELLATION_FACTORS = {
  '1A': { factor: 0.45, label: 'First AC (1A)', maxSafeWl: 3 },
  '2A': { factor: 0.65, label: '2-Tier AC (2A)', maxSafeWl: 8 },
  '3A': { factor: 0.85, label: '3-Tier AC (3A)', maxSafeWl: 25 },
  '3E': { factor: 0.82, label: 'AC Economy (3E)', maxSafeWl: 25 },
  'CC': { factor: 0.70, label: 'AC Chair Car (CC)', maxSafeWl: 12 },
  'SL': { factor: 0.90, label: 'Sleeper (SL)', maxSafeWl: 50 },
  '2S': { factor: 0.75, label: 'Second Sitting (2S)', maxSafeWl: 30 }
}

/**
 * Parses raw status string like "GNWL 14 / WL 8" or "RAC 24" or "CNF / B3 / 42"
 */
export function parseWaitlistString(statusStr = '') {
  const clean = String(statusStr || '').trim().toUpperCase()
  if (!clean || clean.includes('CNF') || clean.includes('CONFIRM')) {
    return { isConfirmed: true, quota: 'CNF', currentWl: 0, raw: clean }
  }
  if (clean.includes('RAC')) {
    const numbers = clean.match(/\d+/g)
    const racNum = numbers && numbers.length > 0 ? parseInt(numbers[numbers.length - 1], 10) : 1
    return { isConfirmed: false, isRac: true, quota: 'RAC', currentWl: racNum, raw: clean }
  }

  let quota = 'GNWL'
  for (const qKey of Object.keys(WAITLIST_QUOTAS)) {
    if (clean.includes(qKey)) {
      quota = qKey
      break
    }
  }

  // Extract last WL number (which is the current status)
  const numbers = clean.match(/\d+/g)
  const currentWl = numbers && numbers.length > 0 ? parseInt(numbers[numbers.length - 1], 10) : 10

  return { isConfirmed: false, isRac: false, quota, currentWl, raw: clean }
}

/**
 * Calculates a probabilistic score (1-100) and actionable diagnosis
 */
export function predictWaitlistConfirmation({
  currentStatus = '',
  bookingStatus = '',
  classType = '3A',
  daysToDeparture = 3,
  chartPrepared = false
}) {
  const rawStatus = String(currentStatus || bookingStatus || '').trim()
  if (!rawStatus) {
    return {
      clearanceScore: 0,
      clearanceIndexFormatted: '0/100',
      probability: 0,
      tier: 'insufficient-data',
      label: 'Insufficient Data',
      badgeClass: 'bg-slate-500/20 text-slate-300 border border-slate-500/40',
      color: '#94a3b8',
      isHeuristicEstimate: true,
      summary: 'Please provide a valid Indian Railways waitlist status (e.g. GNWL 12, RAC 5).',
      insights: ['No waitlist position or quota could be identified from the input.'],
      recommendation: 'Enter your booking or current status from your IRCTC ticket.'
    }
  }

  const parsed = parseWaitlistString(rawStatus)

  if (parsed.isConfirmed) {
    return {
      clearanceScore: 100,
      clearanceIndexFormatted: '100/100',
      probability: 100,
      tier: 'confirmed',
      label: 'Confirmed (CNF)',
      badgeClass: 'bg-emerald-400 text-slate-950',
      color: '#10b981',
      isHeuristicEstimate: false,
      summary: 'Seat is confirmed. Check coach and berth allocation.',
      insights: [
        'Berth and coach details are confirmed by Indian Railways.',
        chartPrepared
          ? 'Reservation chart is prepared. Board with valid Govt ID.'
          : 'Final coach and berth number will be printed when chart is prepared 4 hours before departure.'
      ],
      recommendation: 'Pack your bags! Your journey is confirmed.'
    }
  }

  const quotaMeta = WAITLIST_QUOTAS[parsed.quota] || WAITLIST_QUOTAS.GNWL
  const classMeta = CLASS_CANCELLATION_FACTORS[classType?.toUpperCase()] || CLASS_CANCELLATION_FACTORS['3A']

  // If chart is already prepared and still WL, it did not confirm
  if (chartPrepared && !parsed.isRac) {
    return {
      clearanceScore: 0,
      clearanceIndexFormatted: '0/100',
      probability: 0,
      tier: 'low',
      label: 'Regret / Chart Prepared',
      badgeClass: 'bg-rose-500/20 text-rose-300 border border-rose-500/40',
      color: '#f43f5e',
      isHeuristicEstimate: false,
      summary: 'Charting is complete. Waitlisted e-tickets are automatically cancelled by IRCTC.',
      insights: [
        'Chart has been prepared; no further cancellations will clear this ticket.',
        'Waitlisted online tickets are not permitted to board trains.'
      ],
      recommendation: 'Take an instant multimodal route or emergency Tatkal bus immediately.'
    }
  }

  if (chartPrepared && parsed.isRac) {
    return {
      clearanceScore: 99,
      clearanceIndexFormatted: '99/100',
      probability: 99,
      tier: 'high',
      label: 'RAC Confirmed to Board',
      badgeClass: 'bg-emerald-400 text-slate-950 font-black',
      color: '#10b981',
      isHeuristicEstimate: false,
      summary: 'Chart prepared. You have confirmed boarding rights with side-lower berth allocation.',
      insights: [
        'Board the train legally with your allocated RAC berth.',
        'If any confirmed passenger no-shows, the TTE will upgrade you to a full berth during the journey.'
      ],
      recommendation: 'Safe to board. Present digital pass to TTE.'
    }
  }

  // Base calculation
  let prob = quotaMeta.baseRate * 100

  // Penalty based on current waitlist position relative to class capacity
  const wlPenalty = (parsed.currentWl / classMeta.maxSafeWl) * 45
  prob -= wlPenalty

  // Bonus/penalty based on days to departure (more days = more cancellation velocity)
  if (daysToDeparture > 10) {
    prob += 8
  } else if (daysToDeparture < 2) {
    prob -= 12
  }

  // Apply class factor adjustment
  prob = prob * classMeta.factor + 15

  // Clamp probability between 5% and 95%
  let finalProb = Math.round(Math.max(5, Math.min(95, prob)))

  // RAC is always higher
  if (parsed.isRac) {
    finalProb = Math.max(88, Math.min(98, 98 - parsed.currentWl))
  }

  let tier = 'medium'
  let label = `${finalProb}/100 Estimated Clearance Index (Heuristic)`
  let badgeClass = 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
  let color = '#f59e0b'
  let recommendation = 'Keep an eye on chart preparation 4 hours before departure. Prepare a backup multimodal option.'

  if (finalProb >= 75) {
    tier = 'high'
    label = `${finalProb}/100 High Clearance Index (Heuristic)`
    badgeClass = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
    color = '#10b981'
    recommendation = 'Strong likelihood of clearance. Ticket is expected to clear into RAC or CNF before charting.'
  } else if (finalProb < 45) {
    tier = 'low'
    label = `${finalProb}/100 Low Clearance Index (Heuristic)`
    badgeClass = 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
    color = '#f43f5e'
    recommendation = 'High risk of remaining waitlisted. Use TravelMate Multimodal Split or Tatkal Emergency to secure travel.'
  }

  const insights = [
    `${quotaMeta.name} (${parsed.quota}): ${quotaMeta.description}`,
    `${classMeta.label}: Average safe clearance threshold is around WL ${classMeta.maxSafeWl}. Current position: ${parsed.isRac ? `RAC ${parsed.currentWl}` : `WL ${parsed.currentWl}`}.`,
    `Time remaining: ~${daysToDeparture} days until departure. Bulk cancellations typically surge 24–48 hours prior.`,
    'Heuristic estimate disclosure: Calculated using a parametric heuristic model based on quota priority, coach class capacity, and charting window. This is an estimated index, not an official IRCTC guarantee.'
  ]

  return {
    clearanceScore: finalProb,
    clearanceIndexFormatted: `${finalProb}/100`,
    probability: finalProb,
    isHeuristicEstimate: true,
    modelName: 'Heuristic Waitlist Clearance Model (Parametric Rules)',
    tier,
    label,
    badgeClass,
    color,
    summary: parsed.isRac
      ? `RAC ${parsed.currentWl} has guaranteed boarding rights with high chance of full berth.`
      : `${parsed.quota} ${parsed.currentWl} has ~${finalProb}/100 clearance index into confirmed or RAC status.`,
    insights,
    methodologyDisclosure: 'Estimated using a heuristic parametric model combining quota priority (GNWL > RLWL > PQWL > TQWL), coach class cancellation velocity, and days remaining before charting. This is a heuristic clearance index, not an official IRCTC probability guarantee.',
    recommendation
  }
}

/**
 * Curated sample PNRs for instant testing, demos and offline fallback simulation
 */
export const SAMPLE_PNR_PRESETS = [
  {
    pnrNumber: '4523819204',
    trainNumber: '12952',
    trainName: 'New Delhi - Mumbai Central Tejas Rajdhani Express',
    from: 'NDLS (New Delhi)',
    to: 'MMCT (Mumbai Central)',
    journeyDate: 'Tomorrow · 16:55',
    classType: '3A',
    quota: 'GNWL',
    chartStatus: 'Chart Not Prepared',
    bookingStatus: 'GNWL 14',
    currentStatus: 'RAC 6',
    passengers: [
      { serial: 1, bookingStatus: 'GNWL 14', currentStatus: 'RAC 6', coach: 'B4', berth: 'Shared Side-Lower' },
      { serial: 2, bookingStatus: 'GNWL 15', currentStatus: 'RAC 7', coach: 'B4', berth: 'Shared Side-Lower' }
    ]
  },
  {
    pnrNumber: '6218940315',
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express',
    from: 'HWH (Howrah Junction)',
    to: 'NDLS (New Delhi)',
    journeyDate: 'In 3 Days · 16:50',
    classType: '2A',
    quota: 'PQWL',
    chartStatus: 'Chart Not Prepared',
    bookingStatus: 'PQWL 24',
    currentStatus: 'PQWL 18',
    passengers: [
      { serial: 1, bookingStatus: 'PQWL 24', currentStatus: 'PQWL 18', coach: 'Waitlisted', berth: 'Unassigned' }
    ]
  },
  {
    pnrNumber: '8923014756',
    trainNumber: '12626',
    trainName: 'Kerala SF Express',
    from: 'NDLS (New Delhi)',
    to: 'TVC (Thiruvananthapuram)',
    journeyDate: 'Today · 20:10',
    classType: 'SL',
    quota: 'GNWL',
    chartStatus: 'Chart Prepared',
    bookingStatus: 'RAC 28',
    currentStatus: 'CNF',
    passengers: [
      { serial: 1, bookingStatus: 'RAC 28', currentStatus: 'CNF', coach: 'S5', berth: '43 (Middle)' }
    ]
  }
]

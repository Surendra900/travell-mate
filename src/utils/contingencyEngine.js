/**
 * TravelMate AI - Severe Delay Contingency & Backup Route Calculation Engine
 * Indian Multimodal Transit: Evaluates transfer risks and generates immediate
 * backup legs when primary transport faces delays > 45 minutes.
 */

export function calculateConnectionRisk(firstLegDelayMinutes = 0, scheduledLayoverMinutes = 60) {
  const delay = Math.max(0, Number(firstLegDelayMinutes) || 0)
  const layover = Math.max(15, Number(scheduledLayoverMinutes) || 60)
  const remainingBuffer = layover - delay

  if (delay >= 45 || remainingBuffer <= 15) {
    const probability = Math.min(98, Math.max(65, Math.round(50 + (delay / layover) * 45)))
    return {
      riskLevel: 'CRITICAL',
      delayMinutes: delay,
      layoverMinutes: layover,
      remainingBuffer,
      contingencyTriggered: true,
      missedTransferProbability: probability,
      summary: `Severe delay (+${delay}m) exceeds connection safety threshold. Risk of missed transit connection is ${probability}%.`,
      badgeStyle: 'border-red-500/50 bg-red-950/60 text-red-200'
    }
  }

  if (delay >= 20 || remainingBuffer <= 30) {
    return {
      riskLevel: 'MODERATE',
      delayMinutes: delay,
      layoverMinutes: layover,
      remainingBuffer,
      contingencyTriggered: false,
      missedTransferProbability: 35,
      summary: `Moderate delay (+${delay}m). Buffer remaining: ${remainingBuffer}m. Monitor train running status closely.`,
      badgeStyle: 'border-amber-500/40 bg-amber-950/50 text-amber-200'
    }
  }

  return {
    riskLevel: 'SAFE',
    delayMinutes: delay,
    layoverMinutes: layover,
    remainingBuffer,
    contingencyTriggered: false,
    missedTransferProbability: 5,
    summary: `Transit on track. Generous connection buffer (+${remainingBuffer}m).`,
    badgeStyle: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200'
  }
}

export function generateContingencyOptions(plan = {}, delayMinutes = 55) {
  const from = plan.from || 'Current Station'
  const to = plan.to || 'Destination'
  const transport = plan.transportMode || 'Train'

  return [
    {
      id: 'contingency-fast-express',
      title: 'Alternative Express Bypass',
      transport: 'Train',
      mode: 'Train',
      carrier: '12430 New Delhi–Lucknow AC SF',
      code: '12430',
      reason: 'Departing 45 mins later; bypasses congested transfer junction.',
      depart: '+50m from schedule',
      arrive: '+1h 10m',
      duration: '6h 15m',
      fare: 1250,
      classes: ['3A', '2A', '1A'],
      availability: 'Confirmed Tatkal / Quota Available',
      provider: 'ConfirmTkt',
      riskReduction: 'Eliminates missed junction connection entirely'
    },
    {
      id: 'contingency-intercity-road',
      title: 'Express Intercity Road Connector',
      transport: 'Bus',
      mode: 'Bus',
      carrier: 'Zingbus / Intrcity SmartBus AC Sleeper',
      code: 'ZB-EXP-CONN',
      reason: 'Immediate departures every 30 mins from station front terminal.',
      depart: 'Within 25m',
      arrive: '+35m vs original',
      duration: '5h 40m',
      fare: 890,
      classes: ['AC Sleeper'],
      availability: 'Live Seats Open',
      provider: 'RedBus',
      riskReduction: '100% immune to rail track signal blocks'
    },
    {
      id: 'contingency-air-hop',
      title: 'Priority Air Link',
      transport: 'Flight',
      mode: 'Flight',
      carrier: 'IndiGo 6E-2419',
      code: '6E-2419',
      reason: 'Direct flight option to reach destination in under 2 hours.',
      depart: '19:15',
      arrive: '21:05',
      duration: '1h 50m',
      fare: 4800,
      classes: ['Economy'],
      availability: 'Available',
      provider: 'Google Flights',
      riskReduction: 'Recovers 4+ hours of transit loss'
    }
  ]
}

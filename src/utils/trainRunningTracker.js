/**
 * TravelMate AI - Live Train Running Status & Delay Prediction Heuristics
 */

export function parseDelayMinutes(delay) {
  if (delay === null || delay === undefined || delay === '') return 0
  if (typeof delay === 'number') return Math.max(0, Math.round(delay))
  const match = String(delay).match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

export function calculateDelaySeverity(delay) {
  const mins = parseDelayMinutes(delay)
  if (mins <= 5) {
    return {
      tier: 'on-time',
      minutes: mins,
      label: mins === 0 ? 'Right on Time' : `On Time (+${mins}m)`,
      badgeColor: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-200',
      dotColor: 'bg-emerald-400',
      contingencyAlert: false,
      advice: 'Train is running on schedule. Proceed to platform normally.'
    }
  }
  if (mins <= 30) {
    return {
      tier: 'minor',
      minutes: mins,
      label: `Minor Delay (+${mins}m)`,
      badgeColor: 'border-amber-500/40 bg-amber-500/20 text-amber-200',
      dotColor: 'bg-amber-400',
      contingencyAlert: false,
      advice: 'Slight delay. Expected to recover time during clear track sections.'
    }
  }
  return {
    tier: 'severe',
    minutes: mins,
    label: `Severe Delay (+${mins}m)`,
    badgeColor: 'border-red-500/50 bg-red-500/25 text-red-100',
    dotColor: 'bg-red-400 animate-ping',
    contingencyAlert: true,
    advice: 'Significant delay detected. If holding connecting tickets, review backup routes now.'
  }
}

export const POPULAR_TRAIN_PRESETS = [
  { code: '12952', name: 'Mumbai Rajdhani Express', route: 'NDLS → BCT' },
  { code: '22436', name: 'Vande Bharat Express', route: 'NDLS → BSB' },
  { code: '12004', name: 'Lucknow Shatabdi Express', route: 'NDLS → LKO' },
  { code: '12302', name: 'Kolkata Rajdhani Express', route: 'NDLS → HWH' }
]

export const POPULAR_STATION_PRESETS = [
  { code: 'NDLS', name: 'New Delhi Railway Station', city: 'Delhi' },
  { code: 'BCT', name: 'Mumbai Central', city: 'Mumbai' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata' },
  { code: 'SBC', name: 'KSR Bengaluru City', city: 'Bengaluru' },
  { code: 'MAS', name: 'MGR Chennai Central', city: 'Chennai' },
  { code: 'CNB', name: 'Kanpur Central', city: 'Kanpur' }
]

export const SAMPLE_LIVE_TRAIN_STATUSES = {
  '12952': {
    trainNumber: '12952',
    trainName: 'Mumbai Central Tejas Rajdhani Express',
    from: 'New Delhi (NDLS)',
    to: 'Mumbai Central (BCT)',
    currentStation: 'Kota Junction (KOTA)',
    status: 'Departed Kota Junction. Running at 128 km/h.',
    delay: '0 mins',
    platform: 'Platform 1',
    distanceCoveredKm: 465,
    totalDistanceKm: 1384,
    updated: 'Just now (GPS verified)',
    timeline: [
      { station: 'New Delhi (NDLS)', scheduled: '16:55', actual: '16:55', status: 'departed', platform: 'PF 3' },
      { station: 'Mathura Junction (MTJ)', scheduled: '18:53', actual: '18:55', status: 'departed', platform: 'PF 2' },
      { station: 'Kota Junction (KOTA)', scheduled: '21:40', actual: '21:40', status: 'departed', platform: 'PF 1' },
      { station: 'Vadodara Junction (BRC)', scheduled: '03:45', actual: '03:45', status: 'upcoming', platform: 'PF 2' },
      { station: 'Mumbai Central (BCT)', scheduled: '08:35', actual: '08:35', status: 'upcoming', platform: 'PF 1' }
    ]
  },
  '22436': {
    trainNumber: '22436',
    trainName: 'Vande Bharat Express',
    from: 'New Delhi (NDLS)',
    to: 'Varanasi Junction (BSB)',
    currentStation: 'Kanpur Central (CNB)',
    status: 'Arrived at Platform 1. 2-minute halt.',
    delay: '4 mins',
    platform: 'Platform 1',
    distanceCoveredKm: 440,
    totalDistanceKm: 759,
    updated: '1 minute ago (Live telemetry)',
    timeline: [
      { station: 'New Delhi (NDLS)', scheduled: '06:00', actual: '06:00', status: 'departed', platform: 'PF 16' },
      { station: 'Kanpur Central (CNB)', scheduled: '10:08', actual: '10:12', status: 'current', platform: 'PF 1' },
      { station: 'Prayagraj Junction (PRYJ)', scheduled: '12:08', actual: '12:12', status: 'upcoming', platform: 'PF 6' },
      { station: 'Varanasi Junction (BSB)', scheduled: '14:00', actual: '14:04', status: 'upcoming', platform: 'PF 1' }
    ]
  },
  '12004': {
    trainNumber: '12004',
    trainName: 'Lucknow Swarna Shatabdi Express',
    from: 'New Delhi (NDLS)',
    to: 'Lucknow Junction (LJN)',
    currentStation: 'Aligarh Junction (ALJN)',
    status: 'Speed restriction due to heavy track maintenance.',
    delay: '38 mins',
    platform: 'Platform 3',
    distanceCoveredKm: 131,
    totalDistanceKm: 511,
    updated: '2 minutes ago (IRCTC live feed)',
    timeline: [
      { station: 'New Delhi (NDLS)', scheduled: '06:10', actual: '06:10', status: 'departed', platform: 'PF 9' },
      { station: 'Ghaziabad (GZB)', scheduled: '06:48', actual: '07:05', status: 'departed', platform: 'PF 2' },
      { station: 'Aligarh Junction (ALJN)', scheduled: '07:49', actual: '08:27', status: 'current', platform: 'PF 3' },
      { station: 'Kanpur Central (CNB)', scheduled: '11:20', actual: '11:58', status: 'upcoming', platform: 'PF 5' },
      { station: 'Lucknow Junction (LJN)', scheduled: '12:40', actual: '13:18', status: 'upcoming', platform: 'PF 2' }
    ]
  }
}

export const SAMPLE_STATION_BOARDS = {
  NDLS: [
    { trainNumber: '12952', trainName: 'Mumbai Tejas Rajdhani', time: '16:55', type: 'Departure', destination: 'Mumbai Central', platform: 'PF 3', delay: '0 mins' },
    { trainNumber: '22436', trainName: 'Vande Bharat Express', time: '17:15', type: 'Departure', destination: 'Varanasi Junction', platform: 'PF 16', delay: '5 mins' },
    { trainNumber: '12004', trainName: 'Lucknow Shatabdi', time: '17:40', type: 'Arrival', origin: 'Lucknow Junction', platform: 'PF 9', delay: '22 mins' },
    { trainNumber: '12424', trainName: 'Dibrugarh Rajdhani', time: '18:10', type: 'Departure', destination: 'Dibrugarh', platform: 'PF 4', delay: '0 mins' }
  ],
  BCT: [
    { trainNumber: '12951', trainName: 'Mumbai Tejas Rajdhani', time: '17:00', type: 'Departure', destination: 'New Delhi', platform: 'PF 1', delay: '0 mins' },
    { trainNumber: '12953', trainName: 'August Kranti Rajdhani', time: '17:40', type: 'Departure', destination: 'Hazrat Nizamuddin', platform: 'PF 2', delay: '10 mins' },
    { trainNumber: '12961', trainName: 'Avantika Express', time: '20:55', type: 'Departure', destination: 'Indore Junction', platform: 'PF 3', delay: '0 mins' }
  ],
  HWH: [
    { trainNumber: '12301', trainName: 'Kolkata Rajdhani', time: '16:50', type: 'Departure', destination: 'New Delhi', platform: 'PF 9', delay: '0 mins' },
    { trainNumber: '12841', trainName: 'Coromandel Express', time: '15:20', type: 'Departure', destination: 'MGR Chennai Central', platform: 'PF 8', delay: '15 mins' },
    { trainNumber: '12859', trainName: 'Gitanjali Express', time: '12:30', type: 'Departure', destination: 'CSMT Mumbai', platform: 'PF 21', delay: '42 mins' }
  ]
}

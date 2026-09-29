/**
 * Verified transit hub guidance for intermediate Indian junction cities.
 * Provides platform connection tips, inter-modal transfer distance/fares, and amenities.
 */

export const transitHubDirectory = {
  Jaipur: {
    city: 'Jaipur',
    stationName: 'Jaipur Junction (JP)',
    stationCode: 'JP',
    platforms: 7,
    trainTransferTip: 'Platform 1 & 3 have lift and escalator connections via main foot-overbridge. Porter assistance available near exit 1.',
    busTerminalName: 'Sindhi Camp Central Bus Stand',
    busTerminalDistanceKm: 1.8,
    busAutoFare: '₹50 - ₹80',
    busTransitTimeMin: 10,
    airportName: 'Jaipur International Airport (JAI)',
    airportDistanceKm: 13,
    airportTaxiFare: '₹300 - ₹450',
    airportTransitTimeMin: 35,
    amenities: ['24/7 IRCTC Food Plaza', 'Executive AC Lounge', 'Cloakroom / Left Luggage', 'Wi-Fi Zone', 'Battery Cart'],
    safetyScore: 99
  },
  Vijayawada: {
    city: 'Vijayawada',
    stationName: 'Vijayawada Junction (BZA)',
    stationCode: 'BZA',
    platforms: 10,
    trainTransferTip: 'South Central Railway premier junction. All platforms connected by escalators and wide ramps. Quick transfers between PF 1 and PF 6.',
    busTerminalName: 'Pandit Nehru Bus Station (PNBS)',
    busTerminalDistanceKm: 3.2,
    busAutoFare: '₹70 - ₹100',
    busTransitTimeMin: 12,
    airportName: 'Vijayawada International Airport (Gannavaram, VGA)',
    airportDistanceKm: 21,
    airportTaxiFare: '₹450 - ₹650',
    airportTransitTimeMin: 40,
    amenities: ['IRCTC Executive Lounge', 'Dormitory & Retiring Rooms', '24/7 Food Court', 'AC Waiting Hall', 'Cloakroom'],
    safetyScore: 98
  },
  Nagpur: {
    city: 'Nagpur',
    stationName: 'Nagpur Junction (NGP)',
    stationCode: 'NGP',
    platforms: 8,
    trainTransferTip: 'Geographic center of Indian Railways (Diamond Crossing). Escalators at middle FOB. Battery cars available for senior citizens.',
    busTerminalName: 'Ganeshpeth Central Bus Stand',
    busTerminalDistanceKm: 2.1,
    busAutoFare: '₹60 - ₹90',
    busTransitTimeMin: 12,
    airportName: 'Dr. Babasaheb Ambedkar International Airport (NAG)',
    airportDistanceKm: 9.5,
    airportTaxiFare: '₹250 - ₹400',
    airportTransitTimeMin: 25,
    amenities: ['Subway with Lifts', 'Executive Lounge PF 1', 'Jan Aahaar Cafeteria', 'Left Luggage', 'Charging Kiosks'],
    safetyScore: 97
  },
  Pune: {
    city: 'Pune',
    stationName: 'Pune Junction (PUNE)',
    stationCode: 'PUNE',
    platforms: 6,
    trainTransferTip: 'Heavy junction. Main foot-overbridge connects Platform 1 to Platform 6 with lifts on all platforms.',
    busTerminalName: 'Pune Station MSRTC & Shivajinagar Bus Stand',
    busTerminalDistanceKm: 0.8,
    busAutoFare: '₹40 - ₹60',
    busTransitTimeMin: 5,
    airportName: 'Pune International Airport (PNQ, Lohegaon)',
    airportDistanceKm: 10.5,
    airportTaxiFare: '₹350 - ₹500',
    airportTransitTimeMin: 35,
    amenities: ['IRCTC Waiting Hall', 'Prepaid Auto Booth', 'Cloakroom', '24/7 Food Stalls', 'Medical Booth'],
    safetyScore: 96
  },
  Bhopal: {
    city: 'Bhopal',
    stationName: 'Bhopal Junction (BPL) / Rani Kamlapati (RKMP)',
    stationCode: 'BPL',
    platforms: 6,
    trainTransferTip: 'Modern world-class transit hub at Rani Kamlapati with air concourse. Bhopal Junction has escalator access on PF 1 & PF 4.',
    busTerminalName: 'ISBT Bhopal (Hoshangabad Road)',
    busTerminalDistanceKm: 4.5,
    busAutoFare: '₹80 - ₹120',
    busTransitTimeMin: 15,
    airportName: 'Raja Bhoj Airport (BHO)',
    airportDistanceKm: 14,
    airportTaxiFare: '₹350 - ₹500',
    airportTransitTimeMin: 35,
    amenities: ['Airport-like Air Concourse (RKMP)', 'Food Court', 'Executive Lounge', 'Cloakroom', 'Lifts'],
    safetyScore: 99
  },
  Kanpur: {
    city: 'Kanpur',
    stationName: 'Kanpur Central (CNB)',
    stationCode: 'CNB',
    platforms: 10,
    trainTransferTip: 'High-frequency junction on Delhi-Howrah trunk route. Use central footbridge with escalators. Dedicated parcel & cloakroom near PF 1.',
    busTerminalName: 'Jhakarkati Bus Station',
    busTerminalDistanceKm: 2.8,
    busAutoFare: '₹60 - ₹90',
    busTransitTimeMin: 15,
    airportName: 'Kanpur Airport (KNU) / Lucknow Airport (LKO)',
    airportDistanceKm: 15,
    airportTaxiFare: '₹400 - ₹600',
    airportTransitTimeMin: 40,
    amenities: ['AC Retiring Rooms', 'IRCTC Cafeteria', 'Prepaid Auto Booth', 'Cloakroom'],
    safetyScore: 95
  },
  Hyderabad: {
    city: 'Hyderabad',
    stationName: 'Secunderabad (SC) / Kacheguda (KCG)',
    stationCode: 'SC',
    platforms: 10,
    trainTransferTip: 'Lifts and escalators on all platforms. Foot-overbridge connects Platform 1 directly to Secunderabad East Metro Station.',
    busTerminalName: 'Jubilee Bus Station (JBS) & MGBS',
    busTerminalDistanceKm: 2.5,
    busAutoFare: '₹70 - ₹110',
    busTransitTimeMin: 15,
    airportName: 'Rajiv Gandhi International Airport (HYD, Shamshabad)',
    airportDistanceKm: 34,
    airportTaxiFare: '₹750 - ₹1,100',
    airportTransitTimeMin: 55,
    amenities: ['Direct Metro Link', 'IRCTC Executive Lounge', '24/7 Food Plaza', 'Cloakroom', 'Medical Room'],
    safetyScore: 98
  }
}

/**
 * Returns structured junction guidance tailored to the transfer modes
 */
export function getTransitHubGuide({
  hubCity = '',
  leg1Mode = 'Train',
  leg2Mode = 'Train',
  bufferMinutes = 105
} = {}) {
  const hub = transitHubDirectory[hubCity] || {
    city: hubCity,
    stationName: `${hubCity} Junction`,
    stationCode: hubCity.substring(0, 3).toUpperCase(),
    trainTransferTip: 'Main foot-overbridge connects arrival and departure platforms. Follow digital indicator boards on platforms.',
    busTerminalName: `${hubCity} Central Bus Stand`,
    busTerminalDistanceKm: 2.5,
    busAutoFare: '₹60 - ₹100',
    busTransitTimeMin: 15,
    airportName: `${hubCity} Airport`,
    airportDistanceKm: 15,
    airportTaxiFare: '₹350 - ₹550',
    airportTransitTimeMin: 40,
    amenities: ['Waiting Halls', 'Tea/Snack Stalls', 'Drinking Water', 'Cloakroom'],
    safetyScore: 95
  }

  const isSameStation = leg1Mode === 'Train' && leg2Mode === 'Train'
  const isTrainToBus = leg1Mode === 'Train' && leg2Mode === 'Bus'
  const isTrainToFlight = leg1Mode === 'Train' && leg2Mode === 'Flight'

  let transferType = 'Same-Station Platform Transfer'
  let transferInstructions = hub.trainTransferTip
  let minimumSafeTimeMin = 30
  let modeSpecificTip = 'Stay on the platform or relax in the AC waiting hall until your connecting train is announced.'

  if (isTrainToBus) {
    transferType = 'Station to Inter-State Bus Stand'
    transferInstructions = `Exit from Main Gate to prepaid auto stand. Reach ${hub.busTerminalName} (~${hub.busTerminalDistanceKm} km, approx ${hub.busTransitTimeMin} mins, fare ${hub.busAutoFare}).`
    minimumSafeTimeMin = 60
    modeSpecificTip = 'Auto-rickshaws are available 24/7 outside the station main portico. Avoid street touts and use prepaid counters.'
  } else if (isTrainToFlight) {
    transferType = 'Railway Station to Airport Departure Terminal'
    transferInstructions = `Exit to app cab pickup zone (Ola/Uber) or prepaid taxi counter. Drive to ${hub.airportName} (~${hub.airportDistanceKm} km, approx ${hub.airportTransitTimeMin} mins, taxi fare ${hub.airportTaxiFare}).`
    minimumSafeTimeMin = 150
    modeSpecificTip = 'Domestic flight gates close 45 mins before departure. Factor in 30 mins for security check-in at the airport.'
  }

  const bufferSafetyRatio = Math.min(100, Math.round((bufferMinutes / minimumSafeTimeMin) * 80))
  const isBufferAdequate = bufferMinutes >= minimumSafeTimeMin

  return {
    ...hub,
    transferType,
    transferInstructions,
    minimumSafeTimeMin,
    bufferMinutes,
    isBufferAdequate,
    bufferSafetyRatio,
    modeSpecificTip
  }
}

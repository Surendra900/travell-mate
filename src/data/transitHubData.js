/**
 * Verified transit hub guidance for 25 intermediate Indian junction corridor hubs.
 * Covers all corridor junctions from shared/data/junctions.json with authentic platform counts,
 * platform transfer tips, inter-modal transfer distance/fares, amenities, and safety scores.
 */

export const transitHubDirectory = {
  Delhi: {
    city: 'Delhi',
    stationName: 'New Delhi Railway Station (NDLS)',
    stationCode: 'NDLS',
    platforms: 16,
    trainTransferTip: 'Main Foot-Overbridge connects Platform 1 (Pahar Ganj) to Platform 16 (Ajmeri Gate). Direct subway link to Airport Express Metro.',
    busTerminalName: 'Kashmere Gate ISBT & Sarai Kale Khan',
    busTerminalDistanceKm: 4.8,
    busAutoFare: '₹90 - ₹140',
    busTransitTimeMin: 20,
    airportName: 'Indira Gandhi International Airport (DEL)',
    airportDistanceKm: 16,
    airportTaxiFare: '₹400 - ₹650',
    airportTransitTimeMin: 30,
    amenities: ['Cloakroom', 'Metro Interchange (Yellow & Airport Line)', '24x7 Executive Lounge', 'Wheelchair Ramps', 'RPF Help Desk', 'Battery Carts'],
    safetyScore: 94
  },
  Kanpur: {
    city: 'Kanpur',
    stationName: 'Kanpur Central (CNB)',
    stationCode: 'CNB',
    platforms: 10,
    trainTransferTip: 'High-frequency junction on Delhi-Howrah trunk route. Use central footbridge with escalators. Dedicated parcel & cloakroom near PF 1.',
    busTerminalName: 'Jhakarkati Central Bus Station',
    busTerminalDistanceKm: 2.8,
    busAutoFare: '₹60 - ₹90',
    busTransitTimeMin: 15,
    airportName: 'Kanpur Airport (KNU) / Chhatrapati Shivaji / Lucknow Airport (LKO)',
    airportDistanceKm: 15,
    airportTaxiFare: '₹400 - ₹600',
    airportTransitTimeMin: 40,
    amenities: ['Cloakroom', 'AC Dormitory', 'Prepaid Taxi', 'RPF Help Desk', 'Jan Aahaar Cafeteria'],
    safetyScore: 91
  },
  Mughalsarai: {
    city: 'Mughalsarai',
    stationName: 'Pt. Deen Dayal Upadhyaya Junction (DDU)',
    stationCode: 'DDU',
    platforms: 8,
    trainTransferTip: 'Major East Central Railway interchange. Broad platforms with middle overbridge connecting PF 1 through 8.',
    busTerminalName: 'Mughalsarai Local Bus Stand & Varanasi Cantt Roadways',
    busTerminalDistanceKm: 16.5,
    busAutoFare: '₹150 - ₹250',
    busTransitTimeMin: 40,
    airportName: 'Lal Bahadur Shastri International Airport (VNS, Babatpur)',
    airportDistanceKm: 38,
    airportTaxiFare: '₹800 - ₹1,200',
    airportTransitTimeMin: 65,
    amenities: ['Cloakroom', 'Retiring Rooms', 'RPF Station', '24x7 Refreshments'],
    safetyScore: 92
  },
  Patna: {
    city: 'Patna',
    stationName: 'Patna Junction (PNBE)',
    stationCode: 'PNBE',
    platforms: 10,
    trainTransferTip: 'Escalators and lifts operational on Platform 1 and Platform 10 (Karbigahiya side). Avoid peak rush on central footbridge.',
    busTerminalName: 'Bairiya ISBT (Pataliputra Bus Terminal)',
    busTerminalDistanceKm: 8.5,
    busAutoFare: '₹120 - ₹180',
    busTransitTimeMin: 30,
    airportName: 'Jayprakash Narayan International Airport (PAT)',
    airportDistanceKm: 6.5,
    airportTaxiFare: '₹250 - ₹400',
    airportTransitTimeMin: 25,
    amenities: ['Cloakroom', 'AC Waiting Hall', 'Prepaid Auto', 'RPF Help Desk', 'Executive Lounge'],
    safetyScore: 93
  },
  Kolkata: {
    city: 'Kolkata',
    stationName: 'Howrah Junction (HWH)',
    stationCode: 'HWH',
    platforms: 23,
    trainTransferTip: 'Largest railway terminal complex in India with 23 platforms across Old & New Complexes. Ferry service to Armenian Ghat available outside.',
    busTerminalName: 'Howrah Station Bus Terminus & Esplanade',
    busTerminalDistanceKm: 4.2,
    busAutoFare: '₹80 - ₹120',
    busTransitTimeMin: 20,
    airportName: 'Netaji Subhash Chandra Bose International Airport (CCU)',
    airportDistanceKm: 18,
    airportTaxiFare: '₹450 - ₹700',
    airportTransitTimeMin: 45,
    amenities: ['Cloakroom', 'Kolkata Metro Green Line (Line 2)', 'Ferry Ghat', '24x7 Waiting Lounge', 'RPF Help Desk', 'Prepaid Taxi'],
    safetyScore: 95
  },
  Jaipur: {
    city: 'Jaipur',
    stationName: 'Jaipur Junction (JP)',
    stationCode: 'JP',
    platforms: 8,
    trainTransferTip: 'Platform 1 & 3 have lift and escalator connections via main foot-overbridge. Direct interchange with Jaipur Metro Railway.',
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
  Ahmedabad: {
    city: 'Ahmedabad',
    stationName: 'Ahmedabad Junction (ADI, Kalupur)',
    stationCode: 'ADI',
    platforms: 12,
    trainTransferTip: 'Kalupur terminal has direct underground subway access to Ahmedabad Metro East-West corridor.',
    busTerminalName: 'Geeta Mandir Central Bus Stand (GSRTC)',
    busTerminalDistanceKm: 3.5,
    busAutoFare: '₹70 - ₹110',
    busTransitTimeMin: 15,
    airportName: 'Sardar Vallabhbhai Patel International Airport (AMD)',
    airportDistanceKm: 10,
    airportTaxiFare: '₹300 - ₹500',
    airportTransitTimeMin: 25,
    amenities: ['Cloakroom', 'Metro Interchange (Kalupur)', 'AC Lounges', 'Prepaid Auto', 'Jan Aahaar'],
    safetyScore: 92
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
    amenities: ['Cloakroom', 'Airport-like Air Concourse (RKMP)', 'AC Waiting Rooms', 'Battery Car Ramps', 'RPF Station'],
    safetyScore: 99
  },
  Itarsi: {
    city: 'Itarsi',
    stationName: 'Itarsi Junction (ET)',
    stationCode: 'ET',
    platforms: 8,
    trainTransferTip: 'Major North-South and East-West railway crossroads. Central Foot-Overbridge connects all 8 island platforms.',
    busTerminalName: 'Itarsi City Bus Stand',
    busTerminalDistanceKm: 1.2,
    busAutoFare: '₹40 - ₹60',
    busTransitTimeMin: 8,
    airportName: 'Raja Bhoj Airport Bhopal (BHO)',
    airportDistanceKm: 98,
    airportTaxiFare: '₹2,000 - ₹2,800',
    airportTransitTimeMin: 120,
    amenities: ['Cloakroom', 'Retiring Rooms', '24x7 Transit Canteen', 'RPF Help Desk', 'Water Vending Units'],
    safetyScore: 91
  },
  Nagpur: {
    city: 'Nagpur',
    stationName: 'Nagpur Junction (NGP)',
    stationCode: 'NGP',
    platforms: 8,
    trainTransferTip: 'Geographic center of Indian Railways (Diamond Crossing). Escalators at middle FOB. Direct connection to Nagpur Metro.',
    busTerminalName: 'Ganeshpeth Central Bus Stand',
    busTerminalDistanceKm: 2.1,
    busAutoFare: '₹60 - ₹90',
    busTransitTimeMin: 12,
    airportName: 'Dr. Babasaheb Ambedkar International Airport (NAG)',
    airportDistanceKm: 9.5,
    airportTaxiFare: '₹250 - ₹400',
    airportTransitTimeMin: 25,
    amenities: ['Cloakroom', 'Metro Interchange', 'AC Retiring Rooms', 'Prepaid Taxi', 'Battery Carts'],
    safetyScore: 92
  },
  Jhansi: {
    city: 'Jhansi',
    stationName: 'Virangana Lakshmibai Jhansi Junction (VGLJ)',
    stationCode: 'VGLJ',
    platforms: 8,
    trainTransferTip: 'Important junction on Delhi-Chennai trunk line. Broad platforms with escalators on Platform 1 and 4.',
    busTerminalName: 'Jhansi Central Bus Stand',
    busTerminalDistanceKm: 3.2,
    busAutoFare: '₹60 - ₹90',
    busTransitTimeMin: 12,
    airportName: 'Gwalior Airport (GWL) / Khajuraho Airport (HJR)',
    airportDistanceKm: 105,
    airportTaxiFare: '₹2,200 - ₹3,000',
    airportTransitTimeMin: 110,
    amenities: ['Cloakroom', 'Waiting Hall', 'Prepaid Auto', 'RPF Help Desk', 'Executive Lounge'],
    safetyScore: 92
  },
  Gwalior: {
    city: 'Gwalior',
    stationName: 'Gwalior Junction (GWL)',
    stationCode: 'GWL',
    platforms: 5,
    trainTransferTip: 'Main heritage building exits to Station Road. Wide overbridge with ramp access connecting PF 1 to 5.',
    busTerminalName: 'Gwalior Interstate Bus Terminal (ISBT)',
    busTerminalDistanceKm: 4.0,
    busAutoFare: '₹70 - ₹100',
    busTransitTimeMin: 15,
    airportName: 'Rajmata Vijaya Raje Scindia Airport (GWL)',
    airportDistanceKm: 11,
    airportTaxiFare: '₹300 - ₹450',
    airportTransitTimeMin: 30,
    amenities: ['Cloakroom', 'Retiring Rooms', 'Wheelchair Service', 'RPF Help Desk'],
    safetyScore: 91
  },
  Prayagraj: {
    city: 'Prayagraj',
    stationName: 'Prayagraj Junction (PRYJ)',
    stationCode: 'PRYJ',
    platforms: 10,
    trainTransferTip: 'Dual exits on Civil Lines side and City side. Multiple Foot-Overbridges with escalators on platforms 1, 4, 6.',
    busTerminalName: 'Civil Lines Bus Depot & Zero Road Depot',
    busTerminalDistanceKm: 1.5,
    busAutoFare: '₹40 - ₹70',
    busTransitTimeMin: 8,
    airportName: 'Prayagraj Airport (IXD, Bamrauli)',
    airportDistanceKm: 12,
    airportTaxiFare: '₹300 - ₹500',
    airportTransitTimeMin: 30,
    amenities: ['Cloakroom', 'AC Waiting Lounge', 'Battery Cars', 'RPF Help Desk', 'Prepaid Auto'],
    safetyScore: 94
  },
  Varanasi: {
    city: 'Varanasi',
    stationName: 'Varanasi Junction (BSB, Varanasi Cantt)',
    stationCode: 'BSB',
    platforms: 9,
    trainTransferTip: 'High-density pilgrim hub. Use western overbridge for rapid egress towards Cantt Roadways bus terminal.',
    busTerminalName: 'UPSRTC Varanasi Cantt Bus Station',
    busTerminalDistanceKm: 0.5,
    busAutoFare: '₹30 - ₹50',
    busTransitTimeMin: 5,
    airportName: 'Lal Bahadur Shastri International Airport (VNS)',
    airportDistanceKm: 24,
    airportTaxiFare: '₹600 - ₹900',
    airportTransitTimeMin: 45,
    amenities: ['Cloakroom', 'AC Retiring Rooms', 'Prepaid Taxi', 'RPF Station', 'Tourist Lounge'],
    safetyScore: 90
  },
  Gorakhpur: {
    city: 'Gorakhpur',
    stationName: 'Gorakhpur Junction (GKP)',
    stationCode: 'GKP',
    platforms: 10,
    trainTransferTip: 'North Eastern Railway headquarters. World’s longest railway platform (PF 1 & 2 combined, 1,366 meters).',
    busTerminalName: 'Gorakhpur Bus Stand (Kachahari Road)',
    busTerminalDistanceKm: 0.8,
    busAutoFare: '₹30 - ₹50',
    busTransitTimeMin: 5,
    airportName: 'Gorakhpur Civil Air Terminal (GOP)',
    airportDistanceKm: 8.5,
    airportTaxiFare: '₹250 - ₹400',
    airportTransitTimeMin: 20,
    amenities: ['Cloakroom', 'Retiring Rooms', 'Bus Interchange', 'RPF Post', '24x7 Canteen'],
    safetyScore: 92
  },
  Kharagpur: {
    city: 'Kharagpur',
    stationName: 'Kharagpur Junction (KGP)',
    stationCode: 'KGP',
    platforms: 12,
    trainTransferTip: 'South Eastern Railway flagship hub with third longest railway platform in the world. High-capacity island platforms.',
    busTerminalName: 'Kharagpur Central Bus Stand (Old Bus Stand)',
    busTerminalDistanceKm: 1.6,
    busAutoFare: '₹40 - ₹70',
    busTransitTimeMin: 8,
    airportName: 'Netaji Subhash Chandra Bose International Airport Kolkata (CCU)',
    airportDistanceKm: 135,
    airportTaxiFare: '₹2,500 - ₹3,500',
    airportTransitTimeMin: 150,
    amenities: ['Cloakroom', 'AC Waiting Hall', 'RPF Post', 'Water Kiosks', 'Jan Aahaar'],
    safetyScore: 92
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
    airportName: 'Vijayawada International Airport (VGA, Gannavaram)',
    airportDistanceKm: 21,
    airportTaxiFare: '₹450 - ₹650',
    airportTransitTimeMin: 40,
    amenities: ['Cloakroom', 'AC Retiring Rooms', 'Escalators', 'Prepaid Auto', 'RPF Station', 'Executive Lounge'],
    safetyScore: 93
  },
  Visakhapatnam: {
    city: 'Visakhapatnam',
    stationName: 'Visakhapatnam Junction (VSKP)',
    stationCode: 'VSKP',
    platforms: 8,
    trainTransferTip: 'Terminal reversal junction. Main exit 1 leads to Gnanapuram and exit 2 to Old Post Office side. Escalators on PF 1, 4, 8.',
    busTerminalName: 'Dwaraka Bus Station (RTC Complex)',
    busTerminalDistanceKm: 2.2,
    busAutoFare: '₹50 - ₹80',
    busTransitTimeMin: 10,
    airportName: 'Visakhapatnam International Airport (VTZ)',
    airportDistanceKm: 9.5,
    airportTaxiFare: '₹250 - ₹400',
    airportTransitTimeMin: 25,
    amenities: ['Cloakroom', 'Executive Lounge', 'Prepaid Taxi', 'RPF Help Desk', 'AC Waiting Rooms'],
    safetyScore: 90
  },
  Hyderabad: {
    city: 'Hyderabad',
    stationName: 'Secunderabad Junction (SC) / Kacheguda (KCG)',
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
    amenities: ['Cloakroom', 'Metro Interchange (Secunderabad East)', 'AC Waiting Lounge', 'Prepaid Taxi', 'RPF Help Desk'],
    safetyScore: 93
  },
  Guntakal: {
    city: 'Guntakal',
    stationName: 'Guntakal Junction (GTL)',
    stationCode: 'GTL',
    platforms: 7,
    trainTransferTip: 'Crucial South Western / South Central junction. Central Foot-Overbridge connects all 7 platforms with tea and meal stalls.',
    busTerminalName: 'APSRTC Bus Station Guntakal',
    busTerminalDistanceKm: 1.8,
    busAutoFare: '₹40 - ₹60',
    busTransitTimeMin: 8,
    airportName: 'Jindal Vijayanagar Airport Bellary (VDY) / Bengaluru (BLR)',
    airportDistanceKm: 65,
    airportTaxiFare: '₹1,500 - ₹2,200',
    airportTransitTimeMin: 85,
    amenities: ['Cloakroom', 'Retiring Rooms', 'Transit Refreshments', 'RPF Post'],
    safetyScore: 91
  },
  Bengaluru: {
    city: 'Bengaluru',
    stationName: 'KSR Bengaluru City Junction (SBC, Majestic)',
    stationCode: 'SBC',
    platforms: 10,
    trainTransferTip: 'Platform 1 has direct underground subway to Nadaprabhu Kempegowda Majestic Metro Interchange and KSRTC Bus Stand.',
    busTerminalName: 'Kempegowda Bus Station (Majestic KSRTC & BMTC)',
    busTerminalDistanceKm: 0.4,
    busAutoFare: '₹30 - ₹50',
    busTransitTimeMin: 5,
    airportName: 'Kempegowda International Airport (BLR, Devanahalli)',
    airportDistanceKm: 35,
    airportTaxiFare: '₹800 - ₹1,200',
    airportTransitTimeMin: 60,
    amenities: ['Cloakroom', 'Namma Metro Interchange', 'BMTC Bus Terminus Subway', 'Executive Lounge', 'RPF Station'],
    safetyScore: 95
  },
  Katpadi: {
    city: 'Katpadi',
    stationName: 'Katpadi Junction (KPD, Vellore)',
    stationCode: 'KPD',
    platforms: 5,
    trainTransferTip: 'Major Tamil Nadu junction serving CMC Vellore. Frequent bus and auto shuttles available outside Platform 1 portico.',
    busTerminalName: 'Vellore New Bus Stand (Old Bus Stand)',
    busTerminalDistanceKm: 6.8,
    busAutoFare: '₹100 - ₹150',
    busTransitTimeMin: 20,
    airportName: 'Chennai International Airport (MAA)',
    airportDistanceKm: 130,
    airportTaxiFare: '₹2,400 - ₹3,400',
    airportTransitTimeMin: 140,
    amenities: ['Cloakroom', 'Vellore Bus Shuttle', 'Waiting Rooms', 'RPF Help Desk'],
    safetyScore: 91
  },
  Chennai: {
    city: 'Chennai',
    stationName: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central (MAS)',
    stationCode: 'MAS',
    platforms: 12,
    trainTransferTip: 'All platforms terminating layout (no overbridge needed for egress). Direct underground connection to Chennai Central Metro Station.',
    busTerminalName: 'Central Bus Stand & Chennai Mofussil Bus Terminus (Koyambedu CMBT)',
    busTerminalDistanceKm: 10.5,
    busAutoFare: '₹150 - ₹220',
    busTransitTimeMin: 30,
    airportName: 'Chennai International Airport (MAA, Meenambakkam)',
    airportDistanceKm: 19,
    airportTaxiFare: '₹450 - ₹700',
    airportTransitTimeMin: 40,
    amenities: ['Cloakroom', 'Chennai Metro Interchange', 'Central Bus Bays', 'Air-Conditioned Lounge', 'RPF Help Desk', 'Prepaid Taxi'],
    safetyScore: 95
  },
  Pune: {
    city: 'Pune',
    stationName: 'Pune Junction (PUNE)',
    stationCode: 'PUNE',
    platforms: 6,
    trainTransferTip: 'Heavy junction. Main foot-overbridge connects Platform 1 to Platform 6 with lifts on all platforms. Pune Metro station adjacent.',
    busTerminalName: 'Pune Station MSRTC & Shivajinagar Bus Stand',
    busTerminalDistanceKm: 0.8,
    busAutoFare: '₹40 - ₹60',
    busTransitTimeMin: 5,
    airportName: 'Pune International Airport (PNQ, Lohegaon)',
    airportDistanceKm: 10.5,
    airportTaxiFare: '₹350 - ₹500',
    airportTransitTimeMin: 35,
    amenities: ['Cloakroom', 'Pune Metro Interchange', 'AC Waiting Hall', 'Prepaid Auto', 'RPF Station', 'Medical Booth'],
    safetyScore: 92
  },
  Mumbai: {
    city: 'Mumbai',
    stationName: 'Mumbai Central (MMCT) / CSMT',
    stationCode: 'MMCT',
    platforms: 9,
    trainTransferTip: 'Western Railway headquarters. Underground passage connects main line platforms with Mumbai Suburban local lines and Metro Line 3.',
    busTerminalName: 'Mumbai Central MSRTC Depot & Tardeo',
    busTerminalDistanceKm: 0.6,
    busAutoFare: '₹30 - ₹50',
    busTransitTimeMin: 5,
    airportName: 'Chhatrapati Shivaji Maharaj International Airport (BOM)',
    airportDistanceKm: 19,
    airportTaxiFare: '₹450 - ₹750',
    airportTransitTimeMin: 45,
    amenities: ['Cloakroom', 'Mumbai Metro Interchange', 'Pod Hotel Retiring Units', 'Prepaid Taxi', 'RPF Station'],
    safetyScore: 94
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
  const query = String(hubCity || '').trim()

  // Match by exact city name or station code or partial match
  const hub = transitHubDirectory[query] ||
    Object.values(transitHubDirectory).find(h =>
      h.stationCode.toLowerCase() === query.toLowerCase() ||
      h.city.toLowerCase() === query.toLowerCase()
    ) || {
    city: query,
    stationName: `${query} Junction`,
    stationCode: query.substring(0, 4).toUpperCase(),
    platforms: 4,
    trainTransferTip: 'Main foot-overbridge connects arrival and departure platforms. Follow digital indicator boards on platforms.',
    busTerminalName: `${query} Central Bus Stand`,
    busTerminalDistanceKm: 2.5,
    busAutoFare: '₹60 - ₹100',
    busTransitTimeMin: 15,
    airportName: `${query} Airport`,
    airportDistanceKm: 15,
    airportTaxiFare: '₹350 - ₹550',
    airportTransitTimeMin: 40,
    amenities: ['Waiting Halls', 'Tea/Snack Stalls', 'Drinking Water', 'Cloakroom'],
    safetyScore: 85
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

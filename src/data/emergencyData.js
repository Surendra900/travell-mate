export const emergencyNumber = {
  country: 'India',
  primary: '112',
  ambulance: '108',
  stateEmergency: '108',
  police: '100',
  womenHelpline: '1091',
  touristHelpline: '1363',
  source: 'User-selected ambulance contact: 108; integrated SOS remains 112',
  lastVerified: '2026-07-12'
}

export const emergencyFlows = {
  passport: {
    id: 'passport',
    title: 'Lost Passport',
    accent: 'from-cyan-500 to-blue-600',
    summary: 'Police report, passport support, emergency certificate and identity proof guidance.',
    callType: 'Emergency',
    number: emergencyNumber.primary,
    importantPoints: [
      'Move to a safe public place and avoid sharing sensitive details with strangers.',
      'Check bags, hotel desk, taxi/ride app, station lost-and-found and nearby police booth.',
      'File a police/loss report and save the report number.',
      'Collect identity proof: passport copy, visa copy, student/work ID, Aadhaar/PAN if available.',
      'Contact passport/external-affairs support or embassy/consulate if abroad.',
      'Keep digital copies in the offline pack before continuing your journey.'
    ]
  },
  medical: {
    id: 'medical',
    title: 'Medical Emergency',
    accent: 'from-red-600 to-pink-500',
    summary: 'Ambulance call, location sharing, hospital steps, insurance and medical readiness.',
    callType: 'Ambulance',
    number: emergencyNumber.ambulance,
    importantPoints: [
      'Call ambulance immediately if life, injury, breathing, chest pain or bleeding risk is serious.',
      'Capture/share current location with emergency contact and responders.',
      'Tell responders allergies, medicines, blood group and known medical conditions.',
      'Go to the nearest hospital/emergency room and keep bills, reports and prescriptions.',
      'Do not continue travel until cleared by a medical professional.'
    ]
  },
  theft: {
    id: 'theft',
    title: 'Robbery / Theft',
    accent: 'from-orange-600 to-red-500',
    summary: 'Fast safety guidance for theft: move safe, call police, block cards and preserve evidence.',
    callType: 'Police',
    number: emergencyNumber.police,
    importantPoints: [
      'Move to a bright public place first. Do not chase or argue with the thief.',
      'Call police and report time, landmark, stolen item and suspect direction.',
      'Block cards, payment apps and SIM if the phone/wallet was stolen.',
      'Save complaint/reference number, photos, receipts and screenshots for insurance.'
    ]
  }
}

export const emergencyCards = Object.values(emergencyFlows)

export const TRANSIT_HOTLINES = [
  {
    id: 'police-112',
    number: '112',
    title: 'National Emergency / Police',
    desc: 'Unified Police, Fire, Highway Patrol & State Rescue',
    badge: 'National 24/7',
    badgeColor: 'bg-red-500/20 text-red-200 border-red-500/30',
    btnColor: 'bg-red-600 hover:bg-red-500 text-white',
    icon: 'ShieldAlert',
    category: 'police'
  },
  {
    id: 'railway-139',
    number: '139',
    title: 'RailMadad & RPF Security',
    desc: 'Indian Railways Coach Assistance, Onboard Medical, Train Security',
    badge: 'Railways 24/7',
    badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
    btnColor: 'bg-amber-700 hover:bg-amber-600 text-white',
    icon: 'Train',
    category: 'rail'
  },
  {
    id: 'ambulance-108',
    number: '108',
    title: 'Emergency Ambulance & Medical',
    desc: 'State Disaster Medical Response, Critical Trauma Dispatch',
    badge: 'Medical 24/7',
    badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
    btnColor: 'bg-emerald-700 hover:bg-emerald-600 text-white',
    icon: 'HeartPulse',
    category: 'ambulance'
  },
  {
    id: 'women-1090',
    number: '1090',
    title: 'Women Safety & Transit Support',
    desc: 'Anti-Harassment Helpline, Women RPF Escort Desk, Confidential Aid',
    badge: 'Women Safety 24/7',
    badgeColor: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
    btnColor: 'bg-purple-600 hover:bg-purple-500 text-white',
    icon: 'Shield',
    category: 'women'
  }
]

export const TRANSIT_INCIDENT_PROTOCOLS = [
  {
    id: 'coach-medical',
    title: 'Medical Emergency Inside Train Coach',
    tag: 'Rail Onboard',
    tagColor: 'text-red-300 border-red-500/30 bg-red-950/40',
    hotline: '139',
    hotlineLabel: 'Call RailMadad (139)',
    steps: [
      'Locate the Traveling Ticket Examiner (TTE) or Coach Attendant immediately. They carry basic first-aid and can radio the driver & control room.',
      'Dial 139 or SMS 139 from any mobile: state Train Number, Coach, Berth Number, and the patient\'s condition.',
      'Submit request on railmadad.indianrailways.gov.in under "Medical Assistance" for prioritized junction routing.',
      'Railway medical officers and ambulance will be stationed at the very next scheduled stoppage.'
    ]
  },
  {
    id: 'zero-fir',
    title: 'Theft / Robbery & Zero-FIR Filing',
    tag: 'Transit Legal',
    tagColor: 'text-amber-300 border-amber-500/30 bg-amber-950/40',
    hotline: '1930',
    hotlineLabel: 'Call Cyber / Fraud Helpline (1930)',
    steps: [
      'Do not wait until destination. Request the TTE to summon the on-train GRP (Government Railway Police) Escort party.',
      'Demand and fill the "Zero-FIR" form directly while the train is in motion; GRP cannot turn down filing due to jurisdiction.',
      'If phone or wallet was stolen, dial 1930 immediately (National Cyber Crime Reporting) to freeze UPI and banking accounts.',
      'Retain your carbon copy of the FIR or DD (Daily Diary) entry with the officer\'s name and badge number.'
    ]
  },
  {
    id: 'stranded-junction',
    title: 'Stranded at Junction / Late Night Layover',
    tag: 'Station Safety',
    tagColor: 'text-cyan-300 border-cyan-500/30 bg-cyan-950/40',
    hotline: '139',
    hotlineLabel: 'Call RPF / Rail Help (139)',
    steps: [
      'Do not leave the station premises after midnight. Proceed immediately to the 24/7 IRCTC Upper Class Waiting Room or Executive Lounge.',
      'Show your ongoing or delayed PNR ticket to duty staff for free or nominal authorized entry into secured waiting halls.',
      'Check in at the Station Superintendent (SS) or Station Master (SM) booth on Platform 1 for confirmed connecting train status.',
      'When leaving, use only pre-paid police-verified taxi/auto counters or app cabs from primary, brightly lit porticos.'
    ]
  },
  {
    id: 'lost-traveler',
    title: 'Lost Travel Group or Solo Traveler Distress',
    tag: 'Rapid Locate',
    tagColor: 'text-emerald-300 border-emerald-500/30 bg-emerald-950/40',
    hotline: '112',
    hotlineLabel: 'Call Unified SOS (112)',
    steps: [
      'Tap "Copy Alert" or "WhatsApp" in TravelMate to broadcast your live GPS pin and Google Maps coordinates to your group.',
      'Anchor yourself at a prominent public landmark (Platform 1 Main Clock, Station Enquiry Counter, or Airport Info Desk).',
      'Go to the Railway Public Address (PA) announcement booth and request an emergency passenger broadcast by name.',
      'If you suspect you are being followed or harassed, head straight into the nearest RPF/Police post on Platform 1.'
    ]
  }
]


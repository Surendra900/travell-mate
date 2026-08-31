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

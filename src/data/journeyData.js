export const officialPortalUrl = 'https://www.irctc.co.in/nget/train-search'

export const tatkalRules = [
  'Emergency Mode is for emergency ticket preparation only: Train Tatkal, urgent flight, or urgent bus.',
  'Train Tatkal e-ticket preparation is shown as guidance, not guaranteed booking.',
  'AC class Tatkal window opens at 10:00 hrs one day before journey date.',
  'Non-AC class Tatkal window opens at 11:00 hrs one day before journey date.',
  'Live ticket issuance requires authorized ticketing/transport integration.'
]

export const sampleRoutes = [
  { from: 'Hyderabad', to: 'Delhi', mode: 'Train', duration: '26h', risk: 'Medium', score: 82, price: 1450 },
  { from: 'Hyderabad', to: 'Delhi', mode: 'Flight + Train', duration: '5h + 1h', risk: 'Low', score: 90, price: 5200 },
  { from: 'Hyderabad', to: 'Bengaluru', mode: 'Train', duration: '11h', risk: 'Low', score: 91, price: 650 },
  { from: 'Mumbai', to: 'Pune', mode: 'Bus', duration: '4h', risk: 'Low', score: 88, price: 450 },
  { from: 'Delhi', to: 'Jaipur', mode: 'Train + Bus', duration: '4h + 1h', risk: 'Low', score: 86, price: 720 }
]

export const transportComparison = [
  { mode: 'Train', reliability: 83, cost: 'Low', emergencyFit: 'High', note: 'Best for predictable intercity movement and Tatkal-style emergency prep.' },
  { mode: 'Bus', reliability: 72, cost: 'Medium', emergencyFit: 'Medium', note: 'Good backup route in urgent situations and last-mile connection.' },
  { mode: 'Flight', reliability: 78, cost: 'High', emergencyFit: 'High', note: 'Fast but document, baggage and ID failures can hurt.' },
  { mode: 'Flight + Train', reliability: 80, cost: 'High', emergencyFit: 'High', note: 'Best for long distance plus railway last-mile connection.' },
  { mode: 'Flight + Bus', reliability: 73, cost: 'High', emergencyFit: 'Medium', note: 'Useful when final destination has no airport or rail.' }
]

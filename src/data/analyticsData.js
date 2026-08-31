export const adminMetrics = [
  { label: 'Transport Coverage', value: '3 modes', detail: 'Train, bus and flight comparison' },
  { label: 'Monthly Searches', value: '4,280', detail: 'Local analytics dataset' },
  { label: 'Average Travel Score', value: '84/100', detail: 'Local route scoring simulation' },
  { label: 'Emergency Sessions', value: '612', detail: 'Safety mode local events' }
]

export const routeRisks = [
  { route: 'Hyderabad → Delhi', risk: 'Medium', reason: 'Long route; backup train recommended' },
  { route: 'Mumbai → Pune', risk: 'Low', reason: 'Multiple backup modes available' },
  { route: 'Delhi → Jaipur', risk: 'Low', reason: 'Short route with frequent services' },
  { route: 'Chennai → Bengaluru', risk: 'Medium', reason: 'Peak demand can affect urgent booking' }
]

export const bookingFailureAnalysis = [
  { cause: 'OTP delay', percent: 31 },
  { cause: 'Payment failure', percent: 25 },
  { cause: 'Wrong quota/class', percent: 18 },
  { cause: 'No backup route', percent: 16 },
  { cause: 'ID details missing', percent: 10 }
]

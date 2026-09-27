import { findTransportPlace, getProviderDeepLink, getStationCode, getAirportIata, transportPlaces } from '../data/transportData.js'
import { haversineDistanceKm } from './travelMath.js'

function formatHoursMinutes(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = Math.round(totalMinutes % 60)
  return `${h}h ${m > 0 ? `${m}m` : ''}`.trim()
}

/**
 * Finds candidate transit hubs between two locations in India
 */
export function findTransitHubs(fromCity, toCity, maxDetourRatio = 1.35) {
  const fromPlace = findTransportPlace(fromCity)
  const toPlace = findTransportPlace(toCity)
  if (!fromPlace || !toPlace) return []

  const directDist = haversineDistanceKm(fromPlace, toPlace)
  if (!directDist || directDist < 80) return []

  const candidates = []

  for (const place of transportPlaces) {
    if (place.city === fromPlace.city || place.city === toPlace.city) continue
    const d1 = haversineDistanceKm(fromPlace, place)
    const d2 = haversineDistanceKm(place, toPlace)
    if (!d1 || !d2) continue

    const totalDist = d1 + d2
    const ratio = totalDist / directDist

    if (ratio <= maxDetourRatio) {
      candidates.push({
        place,
        city: place.city,
        leg1Km: d1,
        leg2Km: d2,
        totalKm: totalDist,
        detourRatio: ratio
      })
    }
  }

  return candidates.sort((a, b) => a.totalKm - b.totalKm)
}

/**
 * Generates ranked, beginner-friendly multimodal journeys
 */
export function generateMultimodalRoutes({
  from = '',
  to = '',
  date = '',
  passengers = 1,
  budget = 2500
} = {}) {
  const fromPlace = findTransportPlace(from)
  const toPlace = findTransportPlace(to)

  if (!fromPlace || !toPlace || fromPlace.city === toPlace.city) {
    return []
  }

  const directDist = haversineDistanceKm(fromPlace, toPlace) || 500
  const candidateHubs = findTransitHubs(from, to)

  // Pick primary hub and secondary hub
  const primaryHub = candidateHubs[0]?.place || transportPlaces.find(p => ['Vijayawada', 'Nagpur', 'Hyderabad', 'Kanpur', 'Pune', 'Bhopal'].includes(p.city)) || candidateHubs[0]?.place
  const airportHub = candidateHubs.find(h => ['Hyderabad', 'Bengaluru', 'Delhi', 'Mumbai', 'Kolkata', 'Chennai'].includes(h.city))?.place || primaryHub

  const routes = []

  // 1. TIER 1: PAISA VASOOL (Cheapest Budget Hack - Train + Train or Bus + Train)
  if (primaryHub) {
    const leg1Km = haversineDistanceKm(fromPlace, primaryHub) || 200
    const leg2Km = haversineDistanceKm(primaryHub, toPlace) || 300
    
    const leg1DurationMin = Math.round((leg1Km / 65) * 60)
    const leg2DurationMin = Math.round((leg2Km / 65) * 60)
    const transferMin = 105 // 1h 45m safe buffer
    const totalDurationMin = leg1DurationMin + transferMin + leg2DurationMin

    const leg1Fare = Math.max(140, Math.round(leg1Km * 0.55))
    const leg2Fare = Math.max(220, Math.round(leg2Km * 0.55))
    const totalFare = (leg1Fare + leg2Fare) * passengers

    routes.push({
      id: `pv-${fromPlace.city}-${primaryHub.city}-${toPlace.city}`,
      tier: 'paisa-vasool',
      tierLabel: '🟢 Paisa Vasool (Cheapest)',
      tierBadge: 'Maximum Savings',
      totalFare,
      fareFormatted: `₹${totalFare}`,
      totalDuration: formatHoursMinutes(totalDurationMin),
      hubCity: primaryHub.city,
      transferBuffer: '1h 45m safe daylight transfer',
      whyPicked: `Saves up to ₹3,500 vs. flight. Splits into two confirmed train quotas via ${primaryHub.city}.`,
      leg1: {
        legIndex: 1,
        mode: 'Train',
        from: fromPlace.city,
        to: primaryHub.city,
        depart: '07:30',
        arrive: '11:15',
        duration: formatHoursMinutes(leg1DurationMin),
        fare: leg1Fare,
        service: `${fromPlace.city} → ${primaryHub.city} Rail Express`,
        bookingLink: getProviderDeepLink({
          transport: 'Train',
          from: fromPlace.city,
          to: primaryHub.city,
          date
        })
      },
      leg2: {
        legIndex: 2,
        mode: 'Train',
        from: primaryHub.city,
        to: toPlace.city,
        depart: '13:00',
        arrive: '20:30',
        duration: formatHoursMinutes(leg2DurationMin),
        fare: leg2Fare,
        service: `${primaryHub.city} → ${toPlace.city} Connecting Express`,
        bookingLink: getProviderDeepLink({
          transport: 'Train',
          from: primaryHub.city,
          to: toPlace.city,
          date
        })
      }
    })
  }

  // 2. TIER 2: SMART BALANCED (Best Value - Superfast Train + AC Sleeper Bus / Train)
  if (primaryHub) {
    const leg1Km = haversineDistanceKm(fromPlace, primaryHub) || 200
    const leg2Km = haversineDistanceKm(primaryHub, toPlace) || 300

    const leg1DurationMin = Math.round((leg1Km / 75) * 60)
    const leg2DurationMin = Math.round((leg2Km / 50) * 60) // bus avg 50km/h
    const transferMin = 120 // 2h safe buffer
    const totalDurationMin = leg1DurationMin + transferMin + leg2DurationMin

    const leg1Fare = Math.max(380, Math.round(leg1Km * 1.1)) // 3AC
    const leg2Fare = Math.max(550, Math.round(leg2Km * 1.25)) // AC Sleeper Bus
    const totalFare = (leg1Fare + leg2Fare) * passengers

    routes.push({
      id: `sb-${fromPlace.city}-${primaryHub.city}-${toPlace.city}`,
      tier: 'smart-balanced',
      tierLabel: '🔵 Smart Balanced (Best Value)',
      tierBadge: 'Comfort & Speed',
      totalFare,
      fareFormatted: `₹${totalFare}`,
      totalDuration: formatHoursMinutes(totalDurationMin),
      hubCity: primaryHub.city,
      transferBuffer: '2h 00m buffer between Rail & Bus Station',
      whyPicked: `Confirmed AC sleeper travel. Fast daytime train to ${primaryHub.city}, then overnight AC bus.`,
      leg1: {
        legIndex: 1,
        mode: 'Train',
        from: fromPlace.city,
        to: primaryHub.city,
        depart: '14:30',
        arrive: '18:15',
        duration: formatHoursMinutes(leg1DurationMin),
        fare: leg1Fare,
        service: `Superfast 3AC Connector to ${primaryHub.city}`,
        bookingLink: getProviderDeepLink({
          transport: 'Train',
          from: fromPlace.city,
          to: primaryHub.city,
          date
        })
      },
      leg2: {
        legIndex: 2,
        mode: 'Bus',
        from: primaryHub.city,
        to: toPlace.city,
        depart: '20:15',
        arrive: '06:30 (+1)',
        duration: formatHoursMinutes(leg2DurationMin),
        fare: leg2Fare,
        service: `AC Sleeper Coach to ${toPlace.city}`,
        bookingLink: getProviderDeepLink({
          transport: 'Bus',
          from: primaryHub.city,
          to: toPlace.city,
          date
        })
      }
    })
  }

  // 3. TIER 3: EMERGENCY EXPRESS (Fastest Route - Train/Cab to Airport Hub + Flight)
  if (airportHub) {
    const leg1Km = haversineDistanceKm(fromPlace, airportHub) || 200
    const leg2Km = haversineDistanceKm(airportHub, toPlace) || 600

    const leg1DurationMin = Math.round((leg1Km / 75) * 60)
    const leg2DurationMin = 135 // ~2h 15m flight
    const transferMin = 210 // 3.5h safe station-to-airport buffer
    const totalDurationMin = leg1DurationMin + transferMin + leg2DurationMin

    const leg1Fare = Math.max(350, Math.round(leg1Km * 1.1))
    const leg2Fare = Math.max(3200, Math.round(leg2Km * 3.8))
    const totalFare = (leg1Fare + leg2Fare) * passengers

    routes.push({
      id: `ee-${fromPlace.city}-${airportHub.city}-${toPlace.city}`,
      tier: 'emergency-express',
      tierLabel: '⚡ Emergency Express (Fastest)',
      tierBadge: 'Saves 8+ Hours',
      totalFare,
      fareFormatted: `₹${totalFare}`,
      totalDuration: formatHoursMinutes(totalDurationMin),
      hubCity: airportHub.city,
      transferBuffer: '3h 30m safe station-to-airport transit buffer',
      whyPicked: `Fastest possible route for urgent travel. Reach ${airportHub.city} by rail/road, then fly direct.`,
      leg1: {
        legIndex: 1,
        mode: 'Train',
        from: fromPlace.city,
        to: airportHub.city,
        depart: '06:00',
        arrive: '09:45',
        duration: formatHoursMinutes(leg1DurationMin),
        fare: leg1Fare,
        service: `Morning Express to ${airportHub.city}`,
        bookingLink: getProviderDeepLink({
          transport: 'Train',
          from: fromPlace.city,
          to: airportHub.city,
          date
        })
      },
      leg2: {
        legIndex: 2,
        mode: 'Flight',
        from: airportHub.city,
        to: toPlace.city,
        depart: '13:15',
        arrive: '15:30',
        duration: '2h 15m',
        fare: leg2Fare,
        service: `Non-stop Flight (${airportHub.city} → ${toPlace.city})`,
        bookingLink: getProviderDeepLink({
          transport: 'Flight',
          from: airportHub.city,
          to: toPlace.city,
          date
        })
      }
    })
  }

  return routes
}

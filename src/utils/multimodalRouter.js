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

    if (ratio <= maxDetourRatio && d2 < directDist) {
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

  // Direct corridor priority: for corridors under 250 km or where no reasonable intermediate hub exists
  if (directDist <= 250 || candidateHubs.length === 0) {
    const trainDurationMin = Math.round((directDist / 60) * 60)
    const busDurationMin = Math.round((directDist / 45) * 60)

    const trainFare = Math.max(90, Math.round(directDist * 0.65)) * passengers
    const busFare = Math.max(120, Math.round(directDist * 0.95)) * passengers

    return [
      {
        id: `direct-train-${fromPlace.city}-${toPlace.city}`,
        tier: 'paisa-vasool',
        tierLabel: 'Direct Rail Express',
        tierBadge: 'Direct Route',
        totalFare: trainFare,
        fareFormatted: `₹${trainFare}`,
        totalDuration: formatHoursMinutes(trainDurationMin),
        totalDurationMin: trainDurationMin,
        hubCity: 'Direct (No Transfers)',
        transferBuffer: 'No intermediate transfer required',
        whyPicked: `Direct railway corridor (${Math.round(directDist)} km). Frequent express and superfast trains connect these cities directly.`,
        leg1: {
          legIndex: 1,
          mode: 'Train',
          from: fromPlace.city,
          to: toPlace.city,
          depart: null,
          arrive: null,
          departureEstimate: 'Frequent daily services',
          duration: formatHoursMinutes(trainDurationMin),
          fare: trainFare,
          service: `${fromPlace.city} to ${toPlace.city} Direct Express`,
          provenance: 'ESTIMATE',
          scheduleNote: 'Direct corridor route; check live portal for seat availability.',
          bookingLink: getProviderDeepLink({
            transport: 'Train',
            from: fromPlace.city,
            to: toPlace.city,
            date
          })
        }
      },
      {
        id: `direct-bus-${fromPlace.city}-${toPlace.city}`,
        tier: 'smart-balanced',
        tierLabel: 'Direct State or Private Bus',
        tierBadge: 'Frequent Departure',
        totalFare: busFare,
        fareFormatted: `₹${busFare}`,
        totalDuration: formatHoursMinutes(busDurationMin),
        totalDurationMin: busDurationMin,
        hubCity: 'Direct Highway Corridor',
        transferBuffer: 'No transfer required',
        whyPicked: `Direct highway connection via national highway. Non-stop express buses run at regular intervals.`,
        leg1: {
          legIndex: 1,
          mode: 'Bus',
          from: fromPlace.city,
          to: toPlace.city,
          depart: null,
          arrive: null,
          departureEstimate: 'Every 30 to 60 minutes',
          duration: formatHoursMinutes(busDurationMin),
          fare: busFare,
          service: `${fromPlace.city} to ${toPlace.city} Highway Express Bus`,
          provenance: 'ESTIMATE',
          scheduleNote: 'Frequent highway service; board at central bus station.',
          bookingLink: getProviderDeepLink({
            transport: 'Bus',
            from: fromPlace.city,
            to: toPlace.city,
            date
          })
        }
      }
    ]
  }

  // Pick primary hub and secondary hub from candidate hubs
  const primaryHub = candidateHubs[0]?.place || null
  const airportHub = candidateHubs.find(h => ['Hyderabad', 'Bengaluru', 'Delhi', 'Mumbai', 'Kolkata', 'Chennai'].includes(h.city))?.place || primaryHub

  const routes = []

  // 1. TIER 1: PAISA VASOOL (Cheapest Budget Hack Train + Train or Bus + Train)
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
      tierLabel: 'Paisa Vasool (Budget)',
      tierBadge: 'Maximum Savings',
      totalFare,
      fareFormatted: `₹${totalFare}`,
      totalDuration: formatHoursMinutes(totalDurationMin),
      totalDurationMin,
      hubCity: primaryHub.city,
      transferBuffer: '1h 45m safe daylight transfer',
      whyPicked: `Saves up to ₹3,500 vs. flight. Splits into two high-availability train quotas via ${primaryHub.city}.`,
      leg1: {
        legIndex: 1,
        mode: 'Train',
        from: fromPlace.city,
        to: primaryHub.city,
        depart: null,
        arrive: null,
        departureEstimate: 'Daily rail service (verify timetable on portal)',
        duration: formatHoursMinutes(leg1DurationMin),
        fare: leg1Fare,
        service: `${fromPlace.city} to ${primaryHub.city} Rail Express`,
        provenance: 'ESTIMATE',
        scheduleNote: 'Service frequency estimate only; check operator before travelling.',
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
        depart: null,
        arrive: null,
        departureEstimate: 'Connecting rail service (verify timetable on portal)',
        duration: formatHoursMinutes(leg2DurationMin),
        fare: leg2Fare,
        service: `${primaryHub.city} to ${toPlace.city} Connecting Express`,
        provenance: 'ESTIMATE',
        scheduleNote: 'Service frequency estimate only; check operator before travelling.',
        bookingLink: getProviderDeepLink({
          transport: 'Train',
          from: primaryHub.city,
          to: toPlace.city,
          date
        })
      }
    })
  }

  // 2. TIER 2: SMART BALANCED (Best Value Superfast Train + AC Sleeper Bus / Train)
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
      tierLabel: 'Smart Balanced',
      tierBadge: 'Comfort & Speed',
      totalFare,
      fareFormatted: `₹${totalFare}`,
      totalDuration: formatHoursMinutes(totalDurationMin),
      totalDurationMin,
      hubCity: primaryHub.city,
      transferBuffer: '2h 00m buffer between Rail & Bus Station',
      whyPicked: `Scheduled AC sleeper travel. Fast daytime train to ${primaryHub.city}, then overnight AC bus.`,
      leg1: {
        legIndex: 1,
        mode: 'Train',
        from: fromPlace.city,
        to: primaryHub.city,
        depart: null,
        arrive: null,
        departureEstimate: 'Afternoon connector train (verify timetable on portal)',
        duration: formatHoursMinutes(leg1DurationMin),
        fare: leg1Fare,
        service: `Superfast 3AC Connector to ${primaryHub.city}`,
        provenance: 'ESTIMATE',
        scheduleNote: 'Service frequency estimate only; check operator before travelling.',
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
        depart: null,
        arrive: null,
        departureEstimate: 'Frequent overnight departures (every 30–60 min)',
        duration: formatHoursMinutes(leg2DurationMin),
        fare: leg2Fare,
        service: `AC Sleeper Coach to ${toPlace.city}`,
        provenance: 'ESTIMATE',
        scheduleNote: 'Service frequency estimate only; check operator before travelling.',
        bookingLink: getProviderDeepLink({
          transport: 'Bus',
          from: primaryHub.city,
          to: toPlace.city,
          date
        })
      }
    })
  }

  // 3. TIER 3: EMERGENCY EXPRESS (Fastest Route Train/Cab to Airport Hub + Flight)
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
      tierLabel: 'Fastest Route',
      tierBadge: 'Saves 8+ Hours',
      totalFare,
      fareFormatted: `₹${totalFare}`,
      totalDuration: formatHoursMinutes(totalDurationMin),
      totalDurationMin,
      hubCity: airportHub.city,
      transferBuffer: '3h 30m safe station-to-airport transit buffer',
      whyPicked: `Fastest possible route for urgent travel. Reach ${airportHub.city} by rail/road, then fly direct.`,
      leg1: {
        legIndex: 1,
        mode: 'Train',
        from: fromPlace.city,
        to: airportHub.city,
        depart: null,
        arrive: null,
        departureEstimate: 'Morning express departures (verify timetable on portal)',
        duration: formatHoursMinutes(leg1DurationMin),
        fare: leg1Fare,
        service: `Morning Express to ${airportHub.city}`,
        provenance: 'ESTIMATE',
        scheduleNote: 'Service frequency estimate only; check operator before travelling.',
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
        depart: null,
        arrive: null,
        departureEstimate: 'Direct flights operate daily (verify airline schedule on portal)',
        duration: '2h 15m (approx. flight)',
        fare: leg2Fare,
        service: `Non-stop Flight (${airportHub.city} to ${toPlace.city})`,
        provenance: 'ESTIMATE',
        scheduleNote: 'Flight schedule estimate only; verify airline portal before booking.',
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

/**
 * Formats a clean, readable text summary of a multimodal route for WhatsApp sharing
 */
export function formatWhatsAppShareText(route) {
  if (!route) return ''
  const l1 = route.leg1
  const l2 = route.leg2

  const l1Timing = (l1?.depart && l1?.arrive)
    ? `Depart ${l1.depart} (${l1.from}) to Arrive ${l1.arrive} (${l1.to})`
    : `Schedule: ${l1?.departureEstimate || 'Check operator schedule'} · ~${l1?.duration || 'Duration est.'}`

  const l2Timing = (l2?.depart && l2?.arrive)
    ? `Depart ${l2.depart} (${l2.from}) to Arrive ${l2.arrive} (${l2.to})`
    : `Schedule: ${l2?.departureEstimate || 'Check operator schedule'} · ~${l2?.duration || 'Duration est.'}`

  const baseOrigin = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://travelmate-ai-flowzint.vercel.app'

  return [
    ` *TravelMate Recovered Journey Plan*`,
    ` *Route:* ${l1?.from} to ${l2?.to}`,
    ` *Plan:* ${route.tierLabel || route.tier} (${route.tierBadge})`,
    ` *Fare:* ${route.fareFormatted} · *Time:* ${route.totalDuration}`,
    ``,
    `Step 1: *Step 1:* ${l1?.service || `${l1?.mode} to ${l1?.to}`}`,
    `    ${l1Timing} · ₹${l1?.fare}${l1?.provenance === 'ESTIMATE' ? ' (est.)' : ''}`,
    ``,
    ` *Transfer at ${route.hubCity}:*`,
    `   ⏳ ${route.transferBuffer}`,
    ``,
    `Step 2: *Step 2:* ${l2?.service || `${l2?.mode} to ${l2?.to}`}`,
    `    ${l2Timing} · ₹${l2?.fare}${l2?.provenance === 'ESTIMATE' ? ' (est.)' : ''}`,
    ``,
    ` *Why this route:* ${route.whyPicked}`,
    ``,
    ` Stitched automatically by TravelMate:`,
    `${baseOrigin}/planner?from=${encodeURIComponent(l1?.from || '')}&to=${encodeURIComponent(l2?.to || '')}`
  ].join('\n')
}

/**
 * Returns a direct WhatsApp URL pre-filled with the route summary
 */
export function getWhatsAppShareUrl(route) {
  const text = formatWhatsAppShareText(route)
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
}


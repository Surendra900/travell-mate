import { fetchJsonWithTimeout, prepareApiRequest, providerStatus, publicProviderError } from '../_security.js'

const airlineAliases = {
  INDIGO: '6E', 'INDIGO AIRLINES': '6E',
  AIRINDIA: 'AI', 'AIR INDIA': 'AI',
  AIRINDIAEXPRESS: 'IX', 'AIR INDIA EXPRESS': 'IX',
  SPICEJET: 'SG',
  AKASAAIR: 'QP', 'AKASA AIR': 'QP'
}

export function airlineIataCode(value = '') {
  const normalized = String(value || '').trim().toUpperCase().replace(/\s+/g, ' ')
  if (!normalized || normalized === 'ALL' || normalized === 'ALL AIRLINES' || normalized === 'ANY' || normalized === 'OTHER') return ''
  if (/^[A-Z0-9]{2}$/.test(normalized)) return normalized
  return airlineAliases[normalized] || ''
}

const airportAliases = {
  HYDERABAD: 'HYD', SECUNDERABAD: 'HYD', DELHI: 'DEL', 'NEW DELHI': 'DEL',
  RAJAHMUNDRY: 'RJA', RAJAMAHENDRAVARAM: 'RJA', MUMBAI: 'BOM', BOMBAY: 'BOM',
  BENGALURU: 'BLR', BANGALORE: 'BLR', CHENNAI: 'MAA', MADRAS: 'MAA',
  KOCHI: 'COK', COCHIN: 'COK', ERNAKULAM: 'COK', VIJAYAWADA: 'VGA',
  PUNE: 'PNQ', KOLKATA: 'CCU', CALCUTTA: 'CCU', GOA: 'GOI', 'GOA DABOLIM': 'GOI',
  'GOA MOPA': 'GOX', VISAKHAPATNAM: 'VTZ', VIZAG: 'VTZ', TIRUPATI: 'TIR',
  AHMEDABAD: 'AMD', JAIPUR: 'JAI', LUCKNOW: 'LKO', PATNA: 'PAT',
  GUWAHATI: 'GAU', CHANDIGARH: 'IXC', BHUBANESWAR: 'BBI', VARANASI: 'VNS',
  SRINAGAR: 'SXR', JAMMU: 'IXJ', AMRITSAR: 'ATQ', INDORE: 'IDR',
  BHOPAL: 'BHO', NAGPUR: 'NAG', COIMBATORE: 'CJB', TRICHY: 'TRZ',
  TIRUCHIRAPPALLI: 'TRZ', MADURAI: 'IXM', KOZHIKODE: 'CCJ', CALICUT: 'CCJ',
  KANNUR: 'CNN', MANGALURU: 'IXE', MANGALORE: 'IXE', HUBBALLI: 'HBX',
  MYSURU: 'MYQ', MYSORE: 'MYQ', SURAT: 'STV', VADODARA: 'BDQ',
  RAJKOT: 'RAJ', UDAIPUR: 'UDR', JODHPUR: 'JDH', JAISALMER: 'JSA',
  DEHRADUN: 'DED', AYODHYA: 'AYJ', GWALIOR: 'GWL', JABALPUR: 'JLR',
  RAIPUR: 'RPR', RANCHI: 'IXR', BAGDOGRA: 'IXB', SILIGURI: 'IXB',
  IMPHAL: 'IMF', AIZAWL: 'AJL', DIMAPUR: 'DMU', SHILLONG: 'SHL',
  AGARTALA: 'IXA', SILCHAR: 'IXS', DIBRUGARH: 'DIB', 'PORT BLAIR': 'IXZ',
  VIZIANAGARAM: 'VTZ', KOLLAM: 'TRV', QUILON: 'TRV'
}

// Maps Indian Railways station codes to their corresponding or nearest commercial civil airport IATA codes
const railwayToAirportMap = {
  RJY: 'RJA', // Rajahmundry railway station (RJY) -> Rajahmundry Airport (RJA)
  NDLS: 'DEL', DLI: 'DEL', NZM: 'DEL', ANVT: 'DEL', DEE: 'DEL',
  BCT: 'BOM', MMCT: 'BOM', CSMT: 'BOM', CSTM: 'BOM', LTT: 'BOM', BDTS: 'BOM',
  MAS: 'MAA', MS: 'MAA', TBM: 'MAA',
  SBC: 'BLR', YPR: 'BLR', SMVB: 'BLR',
  HYB: 'HYD', SC: 'HYD', KCG: 'HYD',
  HWH: 'CCU', SDAH: 'CCU', KOAA: 'CCU', SHM: 'CCU',
  PNBE: 'PAT', DNR: 'PAT', RJPB: 'PAT',
  BZA: 'VGA', // Vijayawada railway station (BZA) -> Vijayawada Airport (VGA)
  VSKP: 'VTZ', // Visakhapatnam railway station (VSKP) -> Visakhapatnam Airport (VTZ)
  VZM: 'VTZ', // Vizianagaram railway station (VZM) -> nearest airport Visakhapatnam (VTZ)
  QLN: 'TRV', // Kollam railway station (QLN) -> nearest airport Thiruvananthapuram (TRV)
  TVC: 'TRV', KCVL: 'TRV',
  ERS: 'COK', ERN: 'COK',
  ADI: 'AMD',
  PUNE: 'PNQ',
  BSB: 'VNS', DDU: 'VNS',
  CNB: 'KNU',
  ASR: 'ATQ',
  JAT: 'IXJ',
  MYS: 'MYQ',
  GKP: 'GOP',
  NGP: 'NAG',
  TPTY: 'TIR', RU: 'TIR',
  CBE: 'CJB',
  MDU: 'IXM',
  CLT: 'CCJ',
  MAQ: 'IXE',
  ST: 'STV',
  BRC: 'BDQ',
  RJT: 'RAJ',
  UDZ: 'UDR',
  JU: 'JDH',
  JSM: 'JSA',
  DDN: 'DED',
  AY: 'AYJ', AYC: 'AYJ',
  GWL: 'GWL',
  JBP: 'JLR',
  R: 'RPR',
  RNC: 'IXR'
}

const VERIFIED_IATA_SET = new Set([
  'DEL', 'BOM', 'BLR', 'MAA', 'HYD', 'CCU', 'AMD', 'PNQ', 'COK', 'GOI', 'GOX',
  'VGA', 'VTZ', 'TIR', 'RJA', 'PAT', 'GAU', 'TRV', 'BBI', 'IXC', 'VNS', 'IXR',
  'SXR', 'IXJ', 'ATQ', 'IDR', 'BHO', 'NAG', 'CJB', 'TRZ', 'IXM', 'CCJ', 'CNN',
  'IXE', 'HBX', 'MYQ', 'STV', 'BDQ', 'RAJ', 'UDR', 'JDH', 'JSA', 'DED', 'AYJ',
  'GWL', 'JLR', 'RPR', 'IXB', 'IMF', 'AJL', 'DMU', 'SHL', 'IXA', 'IXS', 'DIB',
  'IXZ', 'DXB', 'SIN', 'DOH', 'LHR', 'BKK', 'KUL'
])

export function airportCode(value = '') {
  const normalized = String(value || '').trim().toUpperCase().replace(/\s+/g, ' ')
  if (!normalized) return ''

  // 1. Check parenthesized codes: e.g. "Rajahmundry (RJY)" or "India (QLN)"
  const codeInParen = normalized.match(/\(([A-Z0-9]{2,4})\)/)
  if (codeInParen) {
    const extracted = codeInParen[1]
    if (railwayToAirportMap[extracted]) return railwayToAirportMap[extracted]
    if (VERIFIED_IATA_SET.has(extracted)) return extracted
    const cityPrefix = normalized.replace(/\s*\([A-Z0-9]{2,4}\)\s*/, '').trim()
    if (airportAliases[cityPrefix]) return airportAliases[cityPrefix]
  }

  // 2. Check direct railway-to-airport mapping
  if (railwayToAirportMap[normalized]) return railwayToAirportMap[normalized]

  // 3. Check city/region aliases
  if (airportAliases[normalized]) return airportAliases[normalized]

  // 4. Exact 3-letter IATA code
  if (/^[A-Z]{3}$/.test(normalized)) {
    if (VERIFIED_IATA_SET.has(normalized)) return normalized
  }

  return ''
}

function validDate(value = '') {
  return !value || /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function aviationError(payload, response) {
  const providerError = payload?.error || {}
  const error = new Error(providerError.message || `Aviationstack returned HTTP ${response?.status || 502}.`)
  error.status = response?.status || 502
  error.code = providerError.code || providerError.type || 'AVIATIONSTACK_REQUEST_FAILED'
  return error
}

export function isPlanRestriction(payload) {
  const code = String(payload?.error?.code || payload?.error?.type || '').toLowerCase()
  const message = String(payload?.error?.message || '').toLowerCase()
  return code.includes('function_access_restricted') ||
    code.includes('access_restricted') ||
    message.includes('subscription plan') ||
    message.includes('does not support this api function')
}

async function requestAviationstack(baseUrl, params) {
  return fetchJsonWithTimeout(
    `${baseUrl.replace(/\/$/, '')}/flights?${params.toString()}`,
    { headers: { Accept: 'application/json' }, cache: 'no-store' },
    12_000
  )
}

async function requestSkyscanner(host, key, origin, destination, date) {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
  const searchDate = (date && date >= today) ? date : today
  const url = `https://${host}/api/v1/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${encodeURIComponent(searchDate)}&currency=INR&market=IN&locale=en-GB`
  return fetchJsonWithTimeout(
    url,
    {
      headers: {
        'x-rapidapi-key': key,
        'x-rapidapi-host': host,
        Accept: 'application/json'
      },
      cache: 'no-store'
    },
    15_000
  )
}

function normalizeSkyscannerRows(payload, dep, arr, requestedAirline, airlineIata) {
  const results = Array.isArray(payload?.results) ? payload.results : []
  const currency = payload?.currency || 'INR'
  const filterByAirline = Boolean(airlineIata && requestedAirline && !/^(all|all airlines|any|other)$/i.test(requestedAirline))

  const mapped = []
  for (let index = 0; index < results.length; index++) {
    const item = results[index]
    const leg = item.legs?.[0] || {}
    const firstSegment = leg.segments?.[0] || {}
    const carrierName = item.carriers?.[0] || 'Airline'
    const flightCode = firstSegment.flight || item.id?.split('-')?.[0] || `FLIGHT-${index + 1}`

    if (filterByAirline) {
      const matchName = carrierName.toLowerCase().includes(requestedAirline.toLowerCase())
      const matchCode = flightCode.toUpperCase().startsWith(airlineIata.toUpperCase())
      if (!matchName && !matchCode) continue
    }

    const durMin = leg.dur_min || firstSegment.dur_min || 0
    const hours = Math.floor(durMin / 60)
    const mins = durMin % 60
    const durationStr = durMin ? `${hours ? `${hours}h ` : ''}${mins}m` : 'Direct'
    const stopsStr = leg.stops === 0 ? 'Non-stop' : `${leg.stops} stop${leg.stops > 1 ? 's' : ''}`

    const depTime = leg.dep ? leg.dep.replace(/.*T(\d{2}:\d{2}).*/, '$1') : 'Check airline'
    const arrTime = leg.arr ? leg.arr.replace(/.*T(\d{2}:\d{2}).*/, '$1') : 'Check airline'

    mapped.push({
      id: item.id || `skyscanner-${index}`,
      type: 'flight',
      serviceName: `${carrierName} ${flightCode}`.trim(),
      code: flightCode,
      from: `${leg.from || dep} (${leg.from || dep})`,
      to: `${leg.to || arr} (${leg.to || arr})`,
      departure: depTime,
      arrival: arrTime,
      duration: durationStr,
      stops: stopsStr,
      price: item.price_raw || (typeof item.price === 'number' ? item.price : null),
      priceFormatted: item.price || (item.price_raw ? `₹${item.price_raw.toLocaleString('en-IN')}` : null),
      currency: currency,
      cabins: ['Economy'],
      provider: 'Skyscanner Flights (RapidAPI)',
      sourceBadge: 'LIVE_PRICE_SCHEDULE',
      provenance: 'LIVE_OTA_AGGREGATOR',
      verification: 'Live airfare and schedule from Skyscanner Flights network. Fares subject to live seat inventory.'
    })
  }
  return mapped
}

function normalizeAviationstackRows(payload, dep, arr) {
  const rows = Array.isArray(payload?.data) ? payload.data : []
  return rows.map((item, index) => ({
    id: item.flight?.iata || item.flight?.number || `aviationstack-${index}`,
    type: 'flight',
    serviceName: `${item.airline?.name || 'Airline'} ${item.flight?.iata || item.flight?.number || ''}`.trim(),
    code: item.flight?.iata || item.flight?.icao || item.flight?.number || 'N/A',
    from: `${item.departure?.airport || dep} (${item.departure?.iata || dep})`,
    to: `${item.arrival?.airport || arr} (${item.arrival?.iata || arr})`,
    departure: item.departure?.scheduled || item.departure?.estimated || 'Check airline',
    arrival: item.arrival?.scheduled || item.arrival?.estimated || 'Check airline',
    duration: 'Not supplied by status provider',
    stops: item.flight_status || 'Status unavailable',
    price: null,
    currency: 'INR',
    cabins: ['Economy'],
    provider: 'Aviationstack',
    sourceBadge: 'LIVE_SCHEDULE_ONLY',
    provenance: 'LIVE_SCHEDULE_ONLY',
    verification: 'Live schedule/status data only. Fare, seat inventory and booking require an airline or licensed ticketing provider.'
  }))
}

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { rateLimit: 20 })) return
  const from = req.query.from || req.query.origin || ''
  const to = req.query.to || req.query.destination || ''
  const date = String(req.query.date || '')
  const requestedAirline = String(req.query.airline || 'All').trim() || 'All'
  const airlineIata = airlineIataCode(requestedAirline)
  const wantsAllAirlines = /^(all|all airlines|any|other)$/i.test(requestedAirline)
  const dep = airportCode(from)
  const arr = airportCode(to)

  if (!dep || !arr) {
    return res.status(400).json({ ok: false, mode: 'invalid', sourceBadge: 'Input required', message: 'Use a supported city name or a valid 3-letter IATA airport code.', results: [] })
  }
  if (dep === arr) return res.status(400).json({ ok: false, mode: 'invalid', message: 'Origin and destination airports must be different.', results: [] })
  if (!wantsAllAirlines && !airlineIata) return res.status(400).json({ ok: false, mode: 'invalid', message: 'Choose All airlines or a supported airline/IATA code.', results: [] })
  if (!validDate(date)) return res.status(400).json({ ok: false, mode: 'invalid', message: 'Date must use YYYY-MM-DD format.', results: [] })

  const rapidFlightHost = String(process.env.RAPIDAPI_FLIGHT_HOST || '').trim()
  const rapidFlightKey = String(process.env.RAPIDAPI_FLIGHT_KEY || process.env.RAPIDAPI_KEY || '').trim()
  const hasRapidFlight = Boolean(rapidFlightHost && rapidFlightKey && !/^(your_|replace_|example|demo)/i.test(rapidFlightKey))

  const aviationApiKey = String(process.env.AVIATIONSTACK_API_KEY || '').trim()
  const aviationBaseUrl = process.env.AVIATIONSTACK_BASE_URL || 'https://api.aviationstack.com/v1'
  const hasAviation = Boolean(aviationApiKey && !/^(your_|replace_|example|demo)/i.test(aviationApiKey))

  // 1. Primary: RapidAPI Skyscanner Flights if configured
  if (hasRapidFlight) {
    try {
      const { response, payload } = await requestSkyscanner(rapidFlightHost, rapidFlightKey, dep, arr, date)
      if (response.ok && payload?.success !== false && Array.isArray(payload?.results)) {
        const results = normalizeSkyscannerRows(payload, dep, arr, requestedAirline, airlineIata)
        return res.status(200).json({
          ok: true,
          mode: 'live',
          provider: 'Skyscanner Flights',
          sourceBadge: results.length ? 'LIVE_PRICE_SCHEDULE' : 'PROVIDER_VERIFICATION_REQUIRED',
          message: results.length
            ? `Live flight fares and schedules loaded for ${wantsAllAirlines ? 'all airlines' : requestedAirline}.`
            : 'Skyscanner returned no matching flight itineraries for this route and date.',
          count: results.length,
          requestedDate: date || null,
          requestedAirline: wantsAllAirlines ? 'All airlines' : requestedAirline,
          airlineIata: airlineIata || null,
          airlineFilterApplied: Boolean(airlineIata),
          dateFilterApplied: Boolean(date),
          results
        })
      }
    } catch (_err) {
      // Fall through to Aviationstack if available
    }
  }

  // 2. Secondary / Fallback: Aviationstack
  if (!hasAviation) {
    return res.status(503).json({
      ok: false,
      mode: 'provider-unconfigured',
      provider: 'Flight Provider',
      sourceBadge: 'Provider configuration required',
      message: 'Flight search provider (RAPIDAPI_FLIGHT_HOST or AVIATIONSTACK_API_KEY) is not configured in this deployment. Add credentials in environment settings, then redeploy.',
      results: []
    })
  }

  try {
    const params = new URLSearchParams({ access_key: aviationApiKey, dep_iata: dep, arr_iata: arr, limit: wantsAllAirlines ? '50' : '25' })
    if (date) params.set('flight_date', date)
    if (airlineIata) params.set('airline_iata', airlineIata)

    let { response, payload } = await requestAviationstack(aviationBaseUrl, params)
    let dateFilterApplied = Boolean(date)
    let planRestrictionBypassed = false

    // Some Aviationstack plans accept the key and /flights endpoint but reject the
    // flight_date filter. Retry without that paid-plan function so the user gets an
    // honest current-status check instead of a generic failure.
    if ((!response.ok || payload?.error) && date && isPlanRestriction(payload)) {
      params.delete('flight_date')
      const retry = await requestAviationstack(aviationBaseUrl, params)
      response = retry.response
      payload = retry.payload
      dateFilterApplied = false
      planRestrictionBypassed = true
    }

    if (!response.ok || payload?.error) throw aviationError(payload, response)

    const results = normalizeAviationstackRows(payload, dep, arr)
    let message
    if (planRestrictionBypassed) {
      message = results.length
        ? `Your Aviationstack key works, but this subscription blocks date filtering. Current live route/status rows for ${wantsAllAirlines ? 'all airlines' : requestedAirline} were loaded without the requested date. Verify the exact travel date with the airline.`
        : 'Your Aviationstack key works, but this subscription blocks date filtering. The current route/status check returned no rows without the requested date.'
    } else {
      message = results.length
        ? `Live flight schedule/status data loaded for ${wantsAllAirlines ? 'all airlines' : requestedAirline}.`
        : 'Aviationstack returned no matching flight status rows for this route and date.'
    }

    return res.status(200).json({
      ok: true,
      mode: 'live',
      provider: 'Aviationstack',
      sourceBadge: results.length ? 'LIVE_SCHEDULE_ONLY' : 'PROVIDER_VERIFICATION_REQUIRED',
      message,
      count: results.length,
      requestedDate: date || null,
      requestedAirline: wantsAllAirlines ? 'All airlines' : requestedAirline,
      airlineIata: airlineIata || null,
      airlineFilterApplied: Boolean(airlineIata),
      dateFilterApplied,
      planRestrictionBypassed,
      results
    })
  } catch (error) {
    const restricted = /function_access_restricted|access_restricted/i.test(String(error.code || '')) || /subscription plan|does not support this api function/i.test(String(error.message || ''))
    const safe = publicProviderError(error, 'Flight provider request failed.')
    return res.status(providerStatus(error)).json({
      ok: false,
      mode: restricted ? 'plan-restricted' : 'provider-error',
      provider: 'Aviationstack',
      sourceBadge: 'PROVIDER_VERIFICATION_REQUIRED',
      message: restricted
        ? 'The API key was accepted, but your Aviationstack subscription does not permit this flight function. Upgrade the provider plan or use an airline/booking API; changing the key alone will not unlock it.'
        : safe.message,
      error: restricted ? 'PLAN_RESTRICTED' : safe.error,
      results: []
    })
  }
}

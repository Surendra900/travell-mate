import { fetchJsonWithTimeout, prepareApiRequest, providerStatus } from '../_security.js'

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
  RAJAHMUNDRY: 'RJA', RAJAMAHENDRAVARAM: 'RJA', MUMBAI: 'BOM',
  BENGALURU: 'BLR', BANGALORE: 'BLR', CHENNAI: 'MAA', KOCHI: 'COK',
  ERNAKULAM: 'COK', VIJAYAWADA: 'VGA', PUNE: 'PNQ', KOLKATA: 'CCU',
  GOA: 'GOI', VISAKHAPATNAM: 'VTZ', VIZAG: 'VTZ', TIRUPATI: 'TIR'
}

export function airportCode(value = '') {
  const normalized = String(value || '').trim().toUpperCase().replace(/\s+/g, ' ')
  if (/^[A-Z]{3}$/.test(normalized)) return normalized
  return airportAliases[normalized] || ''
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

async function requestFlights(baseUrl, params) {
  return fetchJsonWithTimeout(
    `${baseUrl.replace(/\/$/, '')}/flights?${params.toString()}`,
    { headers: { Accept: 'application/json' }, cache: 'no-store' },
    12_000
  )
}

function normalizeRows(payload, dep, arr) {
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
    sourceBadge: 'Live API result',
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

  const apiKey = String(process.env.AVIATIONSTACK_API_KEY || '').trim()
  const baseUrl = process.env.AVIATIONSTACK_BASE_URL || 'https://api.aviationstack.com/v1'
  if (!apiKey || /^(your_|replace_|example|demo)/i.test(apiKey)) {
    return res.status(503).json({
      ok: false,
      mode: 'provider-unconfigured',
      provider: 'Aviationstack',
      sourceBadge: 'Provider configuration required',
      message: 'AVIATIONSTACK_API_KEY is not configured in this deployment. Add it to the same Vercel project and environment, then redeploy.',
      results: []
    })
  }

  try {
    const params = new URLSearchParams({ access_key: apiKey, dep_iata: dep, arr_iata: arr, limit: wantsAllAirlines ? '50' : '25' })
    if (date) params.set('flight_date', date)
    if (airlineIata) params.set('airline_iata', airlineIata)

    let { response, payload } = await requestFlights(baseUrl, params)
    let dateFilterApplied = Boolean(date)
    let planRestrictionBypassed = false

    // Some Aviationstack plans accept the key and /flights endpoint but reject the
    // flight_date filter. Retry without that paid-plan function so the user gets an
    // honest current-status check instead of a generic failure.
    if ((!response.ok || payload?.error) && date && isPlanRestriction(payload)) {
      params.delete('flight_date')
      const retry = await requestFlights(baseUrl, params)
      response = retry.response
      payload = retry.payload
      dateFilterApplied = false
      planRestrictionBypassed = true
    }

    if (!response.ok || payload?.error) throw aviationError(payload, response)

    const results = normalizeRows(payload, dep, arr)
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
      sourceBadge: 'Live API result',
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
    return res.status(providerStatus(error)).json({
      ok: false,
      mode: restricted ? 'plan-restricted' : 'provider-error',
      provider: 'Aviationstack',
      sourceBadge: restricted ? 'Provider plan upgrade required' : 'Provider unavailable',
      message: restricted
        ? 'The API key was accepted, but your Aviationstack subscription does not permit this flight function. Upgrade the provider plan or use an airline/booking API; changing the key alone will not unlock it.'
        : error.message || 'Flight provider request failed.',
      error: error.code || 'FLIGHT_PROVIDER_ERROR',
      results: []
    })
  }
}

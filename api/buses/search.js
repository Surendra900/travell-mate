import { fetchJsonWithTimeout, prepareApiRequest, providerStatus, publicProviderError } from '../_security.js'

function rowsFrom(payload) {
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.buses)) return payload.buses
  return []
}

function normalizeBus(row, index, from, to) {
  const depart = String(row.departure || row.departureTime || row.startTime || '').trim()
  const arrive = String(row.arrival || row.arrivalTime || row.endTime || '').trim()
  const price = Number.isFinite(Number(row.price || row.fare)) ? Number(row.price || row.fare) : null
  const availability = String(row.availability || row.seatsAvailable || '').trim()

  const hasSchedule = Boolean(depart && arrive && depart !== 'Check provider' && arrive !== 'Check provider')
  const hasFareOrAvailability = price !== null || Boolean(availability && availability !== 'Check provider')

  let status = 'PROVIDER_VERIFICATION_REQUIRED'
  if (hasSchedule && hasFareOrAvailability) {
    status = 'LIVE_PROVIDER_DATA'
  } else if (hasSchedule) {
    status = 'LIVE_SCHEDULE_ONLY'
  }

  return {
    id: String(row.id || row.busId || row.service_id || `bus-${index}`),
    type: 'bus',
    serviceName: String(row.serviceName || row.operatorName || row.operator || row.name || 'Bus service').slice(0, 160),
    code: String(row.serviceNumber || row.busNumber || row.code || 'N/A').slice(0, 60),
    from: String(row.from || row.source || row.boardingPoint || from).slice(0, 160),
    to: String(row.to || row.destination || row.droppingPoint || to).slice(0, 160),
    departure: depart || 'Check provider',
    depart: depart || 'Check provider',
    arrival: arrive || 'Check provider',
    arrive: arrive || 'Check provider',
    duration: String(row.duration || row.travelTime || 'Check provider').slice(0, 80),
    price,
    currency: String(row.currency || 'INR').slice(0, 8),
    availability: availability || 'Check provider',
    provider: 'Configured bus provider',
    sourceBadge: status,
    provenance: status,
    verification: 'Verify boarding point, live fare, seat, cancellation and operator details before payment.'
  }
}

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { rateLimit: 20 })) return
  const from = String(req.query.from || '').trim().slice(0, 80)
  const to = String(req.query.to || '').trim().slice(0, 80)
  const date = String(req.query.date || '')
  if (!from || !to) return res.status(400).json({ ok: false, mode: 'invalid', message: 'From and To are required.', results: [] })
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ ok: false, mode: 'invalid', message: 'Date must use YYYY-MM-DD format.', results: [] })

  const apiUrl = String(process.env.BUS_API_URL || '').trim()
  const apiKey = String(process.env.BUS_API_KEY || '').trim()
  const allowedHosts = String(process.env.BUS_API_ALLOWED_HOSTS || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

  if (!apiUrl || !apiKey || !allowedHosts.length) {
    return res.status(503).json({
      ok: false,
      mode: 'provider-unconfigured',
      provider: 'Bus provider',
      sourceBadge: 'PROVIDER_VERIFICATION_REQUIRED',
      message: 'Live bus provider is not configured. The local route catalogue remains available separately.',
      results: []
    })
  }

  let url
  try {
    url = new URL(apiUrl)
  } catch {
    return res.status(500).json({
      ok: false,
      mode: 'provider-error',
      message: 'Invalid BUS_API_URL format.',
      results: []
    })
  }

  if (url.protocol !== 'https:') {
    return res.status(500).json({
      ok: false,
      mode: 'provider-error',
      message: 'BUS_API_URL must use HTTPS.',
      results: []
    })
  }

  if (!allowedHosts.includes(url.hostname.toLowerCase())) {
    return res.status(500).json({
      ok: false,
      mode: 'provider-error',
      message: 'BUS_API_URL hostname is not allowlisted.',
      results: []
    })
  }

  try {
    url.searchParams.set('from', from)
    url.searchParams.set('to', to)
    if (date) url.searchParams.set('date', date)

    const { response, payload } = await fetchJsonWithTimeout(url.toString(), {
      headers: {
        Accept: 'application/json',
        'x-api-key': apiKey
      }
    }, 12_000)

    if (!response.ok) {
      const error = new Error(`Bus provider returned HTTP ${response.status}.`)
      error.status = response.status
      error.code = 'PROVIDER_ERROR'
      throw error
    }

    const results = rowsFrom(payload).slice(0, 30).map((row, index) => normalizeBus(row, index, from, to))
    const status = results.length ? (results[0].sourceBadge || 'LIVE_PROVIDER_DATA') : 'LIVE_SCHEDULE_ONLY'

    return res.status(200).json({
      ok: true,
      mode: 'live',
      provider: 'Configured bus provider',
      sourceBadge: status,
      message: results.length ? 'Live bus provider results loaded.' : 'The bus provider returned no matching services.',
      count: results.length,
      results
    })
  } catch (error) {
    const safe = publicProviderError(error, 'Bus provider request failed.')
    return res.status(providerStatus(error)).json({
      ok: false,
      mode: 'provider-error',
      provider: 'Configured bus provider',
      sourceBadge: 'PROVIDER_VERIFICATION_REQUIRED',
      message: safe.message,
      error: safe.error,
      results: []
    })
  }
}

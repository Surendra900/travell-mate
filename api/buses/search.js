import { fetchJsonWithTimeout, prepareApiRequest, providerStatus } from '../_security.js'

function rowsFrom(payload) {
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.buses)) return payload.buses
  return []
}

function normalizeBus(row, index, from, to) {
  return {
    id: String(row.id || row.busId || row.service_id || `bus-${index}`),
    type: 'bus',
    serviceName: String(row.serviceName || row.operatorName || row.operator || row.name || 'Bus service').slice(0, 160),
    code: String(row.serviceNumber || row.busNumber || row.code || 'N/A').slice(0, 60),
    from: String(row.from || row.source || row.boardingPoint || from).slice(0, 160),
    to: String(row.to || row.destination || row.droppingPoint || to).slice(0, 160),
    departure: String(row.departure || row.departureTime || row.startTime || 'Check provider').slice(0, 80),
    arrival: String(row.arrival || row.arrivalTime || row.endTime || 'Check provider').slice(0, 80),
    duration: String(row.duration || row.travelTime || 'Check provider').slice(0, 80),
    price: Number.isFinite(Number(row.price || row.fare)) ? Number(row.price || row.fare) : null,
    currency: String(row.currency || 'INR').slice(0, 8),
    availability: String(row.availability || row.seatsAvailable || 'Check provider').slice(0, 80),
    provider: 'Configured bus provider',
    sourceBadge: 'Live API result',
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
  if (!apiUrl || !apiKey) {
    return res.status(503).json({ ok: false, mode: 'provider-unconfigured', provider: 'Bus provider', sourceBadge: 'Provider configuration required', message: 'Live bus provider is not configured. The local route catalogue remains available separately.', results: [] })
  }

  try {
    const url = new URL(apiUrl)
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('BUS_API_URL must use HTTPS or HTTP.')
    url.searchParams.set('from', from)
    url.searchParams.set('to', to)
    if (date) url.searchParams.set('date', date)
    const { response, payload } = await fetchJsonWithTimeout(url.toString(), { headers: { Accept: 'application/json', Authorization: `Bearer ${apiKey}`, 'x-api-key': apiKey } }, 12_000)
    if (!response.ok) {
      const error = new Error(`Bus provider returned HTTP ${response.status}.`)
      error.status = response.status
      throw error
    }
    const results = rowsFrom(payload).slice(0, 30).map((row, index) => normalizeBus(row, index, from, to))
    return res.status(200).json({ ok: true, mode: 'live', provider: 'Configured bus provider', sourceBadge: 'Live API result', message: results.length ? 'Live bus provider results loaded.' : 'The bus provider returned no matching services.', count: results.length, results })
  } catch (error) {
    return res.status(providerStatus(error)).json({ ok: false, mode: 'provider-error', provider: 'Configured bus provider', sourceBadge: 'Provider unavailable', message: error.message || 'Bus provider request failed.', error: error.code || 'BUS_PROVIDER_ERROR', results: [] })
  }
}

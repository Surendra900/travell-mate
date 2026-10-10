import { fetchJsonWithTimeout, prepareApiRequest, publicProviderError } from '../_security.js'

function usableSecret(value = '') {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  if (/^(your_|replace_|add_|paste_|example|demo|test_|xxx)/i.test(trimmed)) return ''
  if (/(_here|placeholder|dummy|sample)/i.test(trimmed)) return ''
  return trimmed
}

function firstValue(object, keys, fallback = '') {
  for (const key of keys) {
    const value = object?.[key]
    if (value !== undefined && value !== null && String(value).trim() !== '') return value
  }
  return fallback
}

function firstObject(value, depth = 0) {
  if (!value || depth > 5) return null
  if (Array.isArray(value)) return value.find((item) => item && typeof item === 'object') || null
  if (typeof value !== 'object') return null
  const priority = ['data', 'result', 'pnrData', 'pnr_data', 'response', 'details']
  for (const key of priority) {
    const candidate = value[key]
    if (candidate && !Array.isArray(candidate) && typeof candidate === 'object') return candidate
  }
  return value
}

function passengerRows(data = {}) {
  const possible = [
    data.passengerInfo,
    data.passenger_info,
    data.passengers,
    data.passengerList,
    data.passenger_list,
    data.psgn,
    data.PassengerStatus,
    data.PassengerStatusDetails,
    data.passengerStatus
  ]
  return possible.find(Array.isArray) || []
}

export function normalizePnr(payload, pnrNumber) {
  const data = firstObject(payload) || {}
  const passengers = passengerRows(data)
  return {
    pnrNumber: firstValue(data, ['pnrNumber', 'pnr_number', 'pnr', 'Pnr', 'PNR'], pnrNumber),
    trainNumber: firstValue(data, ['trainNumber', 'train_number', 'trainNo', 'train_no', 'TrainNo', 'TrainNumber'], 'Not returned'),
    trainName: firstValue(data, ['trainName', 'train_name', 'TrainName'], 'Not returned'),
    from: firstValue(data, ['sourceStation', 'source_station', 'from', 'boardingPoint', 'boarding_point', 'boarding_station', 'src', 'From'], 'Not returned'),
    to: firstValue(data, ['destinationStation', 'destination_station', 'to', 'reservationUpto', 'reservation_upto', 'dest', 'To'], 'Not returned'),
    journeyDate: firstValue(data, ['dateOfJourney', 'date_of_journey', 'journeyDate', 'journey_date', 'doj', 'train_start_date', 'Doj'], 'Not returned'),
    chartStatus: firstValue(data, ['chartStatus', 'chart_status', 'chart_prepared', 'chartingStatus', 'ChartPrepared'], 'Not returned'),
    bookingStatus: firstValue(data, ['bookingStatus', 'booking_status', 'booking_status_details', 'BookingStatus'], ''),
    currentStatus: firstValue(data, ['currentStatus', 'current_status', 'confirmationStatus', 'status', 'CurrentStatus'], ''),
    passengers: passengers.slice(0, 20).map((item, index) => ({
      serial: firstValue(item, ['serialNo', 'serial_no', 'passengerSerialNumber', 'number', 'PassengerNo'], index + 1),
      bookingStatus: firstValue(item, ['bookingStatus', 'booking_status', 'bookingBerthCode', 'BookingStatus'], 'Not returned'),
      currentStatus: firstValue(item, ['currentStatus', 'current_status', 'confirmationStatus', 'status', 'CurrentStatus'], 'Not returned'),
      coach: firstValue(item, ['coach', 'coachPosition', 'coach_number', 'Coach'], ''),
      berth: firstValue(item, ['berth', 'berthNo', 'berth_number', 'seat', 'Berth'], '')
    })),
    sourceBadge: 'Live PNR API result'
  }
}

function normalizeHost(value = '') {
  const hostValue = usableSecret(value)
  if (!hostValue) return ''
  try {
    const url = new URL(hostValue.includes('://') ? hostValue : `https://${hostValue}`)
    return url.host
  } catch {
    return hostValue.replace(/^https?:\/\//i, '').split('/')[0].trim()
  }
}

function normalizeEndpoint(value = '') {
  const endpoint = usableSecret(value) || '/getPNRStatus/{pnr}'
  return endpoint.trim()
}

export function getPnrProviderConfig() {
  const host = normalizeHost(process.env.RAPIDAPI_PNR_HOST) || 'irctc-indian-railway-pnr-status.p.rapidapi.com'
  const key = usableSecret(process.env.RAPIDAPI_PNR_KEY || process.env.RAPIDAPI_KEY)
  const endpoint = normalizeEndpoint(process.env.RAPIDAPI_PNR_ENDPOINT)
  return { host, key, endpoint }
}

export function buildPnrProviderUrl({ host, endpoint, pnrNumber }) {
  const pnrValue = String(pnrNumber || '').trim()
  const pnr = encodeURIComponent(pnrValue)
  const placeholderPattern = /\{(?:pnr|pnrNumber)\}|:(?:pnr|pnrNumber)|\[(?:pnr|pnrNumber)\]/gi
  const configuredEndpoint = normalizeEndpoint(endpoint)
  const hadPlaceholder = placeholderPattern.test(configuredEndpoint)
  const rawEndpoint = hadPlaceholder ? configuredEndpoint.replace(placeholderPattern, pnr) : configuredEndpoint
  let url

  if (/^https?:\/\//i.test(rawEndpoint)) {
    url = new URL(rawEndpoint)
  } else {
    const path = rawEndpoint.startsWith('/') ? rawEndpoint : `/${rawEndpoint}`
    url = new URL(`https://${normalizeHost(host)}${path}`)
  }

  if (hadPlaceholder) return url.toString()

  const queryNames = ['pnr', 'pnrNumber', 'pnr_number']
  const configuredQuery = queryNames.find((name) => url.searchParams.has(name))
  if (configuredQuery) {
    url.searchParams.set(configuredQuery, pnrValue)
    return url.toString()
  }

  if (/\/\d{10}\/?$/.test(url.pathname)) {
    url.pathname = url.pathname.replace(/\/\d{10}\/?$/, `/${pnr}`)
    return url.toString()
  }

  url.pathname = `${url.pathname.replace(/\/$/, '')}/${pnr}`
  return url.toString()
}

function providerErrorMessage(status, payload) {
  const detail = firstValue(payload || {}, ['message', 'error', 'detail', 'description'], '')
  if (status === 401) return 'The PNR provider rejected the RapidAPI key. Check RAPIDAPI_PNR_KEY or RAPIDAPI_KEY.'
  if (status === 403) return 'The RapidAPI application is not subscribed to this PNR endpoint or the selected plan does not allow it.'
  if (status === 404) return 'The configured PNR endpoint was not found. Use /getPNRStatus or the exact path shown in RapidAPI.'
  if (status === 429) return 'The PNR provider rate limit or quota has been reached. Wait for the reset or review the RapidAPI plan.'
  return detail ? String(detail).slice(0, 300) : `PNR provider returned HTTP ${status}.`
}

function safeProviderStatus(status) {
  return [400, 401, 403, 404, 408, 422, 429].includes(Number(status)) ? Number(status) : 502
}

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { requireAuth: true, rateLimit: 8 })) return

  const pnrNumber = String(req.query.pnr || req.query.pnrNumber || '').replace(/\D/g, '')
  if (!/^\d{10}$/.test(pnrNumber)) {
    return res.status(400).json({
      ok: false,
      mode: 'invalid',
      sourceBadge: 'Input required',
      message: 'Enter a valid 10-digit PNR number.',
      result: null
    })
  }

  const { host, key, endpoint } = getPnrProviderConfig()
  if (!key || !host || !endpoint) {
    return res.status(503).json({
      ok: false,
      mode: 'provider-error',
      provider: 'RapidAPI PNR provider',
      sourceBadge: 'Provider unavailable',
      message: 'PNR service is not configured. Add RAPIDAPI_PNR_KEY (or RAPIDAPI_KEY), RAPIDAPI_PNR_HOST and RAPIDAPI_PNR_ENDPOINT in Vercel.',
      error: 'MISSING_PNR_PROVIDER_CONFIG',
      result: null
    })
  }

  try {
    const url = buildPnrProviderUrl({ host, endpoint, pnrNumber })
    const { response, payload } = await fetchJsonWithTimeout(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-rapidapi-host': host,
        'x-rapidapi-key': key
      }
    }, 12_000)

    if (!response.ok || payload?.success === false || payload?.status === false) {
      const error = new Error(providerErrorMessage(response.status, payload))
      error.status = response.status
      error.code = response.status === 429 ? 'PNR_RATE_LIMITED' : 'PNR_PROVIDER_ERROR'
      throw error
    }

    return res.status(200).json({
      ok: true,
      mode: 'live',
      provider: 'RapidAPI IRCTC PNR Status',
      sourceBadge: 'Live PNR API result',
      message: 'PNR status loaded. Verify final status with Indian Railways before travel.',
      result: normalizePnr(payload, pnrNumber)
    })
  } catch (error) {
    const safe = publicProviderError(error, 'Unable to retrieve PNR status.')
    return res.status(safeProviderStatus(error?.status)).json({
      ok: false,
      mode: 'provider-error',
      provider: 'RapidAPI IRCTC PNR Status',
      sourceBadge: 'Provider unavailable',
      message: safe.message,
      error: safe.error,
      result: null
    })
  }
}

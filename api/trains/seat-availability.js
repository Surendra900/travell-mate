import { prepareApiRequest, providerStatus, publicProviderError } from '../_security.js'
import { callRapidRail, stationCode } from './_rapidapiRail.js'

function normalizeSeat(payload, query) {
  const data = payload?.data || payload || {}
  const availability = Array.isArray(data.availability) ? data.availability : Array.isArray(data.avlDayList) ? data.avlDayList : Array.isArray(data.availability_details) ? data.availability_details : Array.isArray(data) ? data : []
  return {
    trainNo: data.trainNo || data.train_number || query.trainNo,
    classType: query.classType,
    quota: query.quota,
    fromStationCode: query.fromStationCode,
    toStationCode: query.toStationCode,
    date: query.date || data.date || data.journeyDate || '',
    availability: availability.slice(0, 14).map((item, index) => ({
      date: item.date || item.availabilityDate || item.journeyDate || `Option ${index + 1}`,
      status: item.status || item.availabilityStatus || item.current_status || item.availablityStatus || 'Status not returned'
    })),
    sourceBadge: 'Live API result'
  }
}

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { requireAuth: true, rateLimit: 10 })) return
  const query = {
    trainNo: String(req.query.trainNo || req.query.trainNumber || req.query.train || '').replace(/\D/g, ''),
    fromStationCode: stationCode(req.query.fromStationCode || req.query.from || ''),
    toStationCode: stationCode(req.query.toStationCode || req.query.to || ''),
    classType: String(req.query.classType || req.query.class || 'SL').toUpperCase(),
    quota: String(req.query.quota || 'GN').toUpperCase(),
    date: String(req.query.date || req.query.dateOfJourney || '')
  }
  if (!/^\d{5}$/.test(query.trainNo) || !query.fromStationCode || !query.toStationCode) {
    return res.status(400).json({ ok: false, mode: 'invalid', sourceBadge: 'Input required', message: 'A 5-digit train number and valid From/To station codes are required.', result: null })
  }

  try {
    const { date, ...providerQuery } = query
    const payload = await callRapidRail('/api/v2/checkSeatAvailability', providerQuery)
    return res.status(200).json({ ok: true, mode: 'live', provider: 'RapidAPI IRCTC / irctc1', sourceBadge: 'Live API result', message: 'Seat availability loaded.', result: normalizeSeat(payload, query) })
  } catch (error) {
    const safe = publicProviderError(error, 'Seat availability unavailable.')
    return res.status(providerStatus(error)).json({ ok: false, mode: 'provider-error', provider: 'RapidAPI IRCTC / irctc1', sourceBadge: 'Provider unavailable', message: safe.message, error: safe.error, result: null })
  }
}

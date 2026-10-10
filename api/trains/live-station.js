import { prepareApiRequest, providerStatus, publicProviderError } from '../_security.js'
import { callRapidRail, dataRows, stationCode } from './_rapidapiRail.js'

function normalizeStationRow(row, index, fromStationCode, toStationCode) {
  return {
    id: row.train_number || row.trainNo || row.train_no || row.number || `station-${index}`,
    type: 'train',
    serviceName: `${row.train_name || row.trainName || row.name || 'Train'} ${row.train_number || row.trainNo || row.train_no || ''}`.trim(),
    code: row.train_number || row.trainNo || row.train_no || 'N/A',
    from: row.source || row.from || row.from_station_name || fromStationCode,
    to: row.destination || row.to || row.to_station_name || toStationCode || 'Route destination',
    departure: row.sch_dep_time || row.departure || row.departure_time || row.std || row.actual_departure || 'Check provider',
    arrival: row.sch_arr_time || row.arrival || row.arrival_time || row.sta || row.actual_arrival || 'Check provider',
    duration: row.duration || row.travel_time || 'Check provider',
    provider: 'RapidAPI IRCTC / irctc1',
    sourceBadge: 'Live API result',
    verification: 'Live station response. Verify platform and final availability with the official provider.'
  }
}

function normalizeRows(payload, fromStationCode, toStationCode) {
  return dataRows(payload).slice(0, 50).flatMap((row, index) => {
    const nested = Array.isArray(row?.trains) ? row.trains : Array.isArray(row?.train) ? row.train : null
    return nested ? nested.map((item, inner) => normalizeStationRow(item, `${index}-${inner}`, fromStationCode, toStationCode)) : [normalizeStationRow(row, index, fromStationCode, toStationCode)]
  })
}

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { rateLimit: 20 })) return
  const fromStationCode = stationCode(req.query.fromStationCode || req.query.from || req.query.stationCode || '')
  const toStationCode = stationCode(req.query.toStationCode || req.query.to || '')
  const hours = String(req.query.hours || '4')
  if (!fromStationCode) return res.status(400).json({ ok: false, mode: 'invalid', message: 'A valid fromStationCode is required.', results: [] })
  if (!/^(1|2|3|4|6|8|12)$/.test(hours)) return res.status(400).json({ ok: false, mode: 'invalid', message: 'hours must be one of 1, 2, 3, 4, 6, 8, or 12.', results: [] })

  try {
    const payload = await callRapidRail('/api/v3/getLiveStation', { fromStationCode, toStationCode, hours })
    const results = normalizeRows(payload, fromStationCode, toStationCode)
    return res.status(200).json({ ok: true, mode: 'live', provider: 'RapidAPI IRCTC / irctc1', sourceBadge: 'Live API result', message: results.length ? `Live station data loaded for ${fromStationCode}.` : `No live station rows returned for ${fromStationCode}.`, count: results.length, results })
  } catch (error) {
    const safe = publicProviderError(error, 'Live station data unavailable.')
    return res.status(providerStatus(error)).json({ ok: false, mode: 'provider-error', provider: 'RapidAPI IRCTC / irctc1', sourceBadge: 'Provider unavailable', message: safe.message, error: safe.error, results: [] })
  }
}

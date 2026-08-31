import { prepareApiRequest, providerStatus } from '../_security.js'
import { callRapidRail, dataRows, stationCode } from './_rapidapiRail.js'

function normalize(row, index, station) {
  return {
    id: row.train_number || row.trainNo || row.train_no || row.number || `by-station-${index}`,
    type: 'train',
    serviceName: `${row.train_name || row.trainName || row.name || 'Train'} ${row.train_number || row.trainNo || row.train_no || ''}`.trim(),
    code: row.train_number || row.trainNo || row.train_no || 'N/A',
    from: row.source || row.from || row.from_station_name || row.src_name || station,
    to: row.destination || row.to || row.to_station_name || row.dstn_name || 'Route destination',
    departure: row.departure_time || row.sch_dep_time || row.std || row.departure || 'Check provider',
    arrival: row.arrival_time || row.sch_arr_time || row.sta || row.arrival || 'Check provider',
    duration: row.duration || row.travel_time || 'Check provider',
    runningDays: row.run_days || row.running_days || row.days || '',
    provider: 'RapidAPI IRCTC / irctc1',
    sourceBadge: 'Live API result',
    verification: 'Live station response. Verify platform, fare and booking with the official provider.'
  }
}

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { rateLimit: 20 })) return
  const station = stationCode(req.query.stationCode || req.query.station || req.query.fromStationCode || '')
  if (!station) return res.status(400).json({ ok: false, mode: 'invalid', message: 'A valid stationCode is required.', results: [] })
  try {
    const rows = dataRows(await callRapidRail('/api/v3/getTrainsByStation', { stationCode: station })).slice(0, 50).map((row, index) => normalize(row, index, station))
    return res.status(200).json({ ok: true, mode: 'live', provider: 'RapidAPI IRCTC / irctc1', sourceBadge: 'Live API result', message: rows.length ? `Trains by station loaded for ${station}.` : `No trains returned for ${station}.`, count: rows.length, results: rows })
  } catch (error) {
    return res.status(providerStatus(error)).json({ ok: false, mode: 'provider-error', provider: 'RapidAPI IRCTC / irctc1', sourceBadge: 'Provider unavailable', message: error.message, error: error.code || 'TRAINS_BY_STATION_ERROR', results: [] })
  }
}

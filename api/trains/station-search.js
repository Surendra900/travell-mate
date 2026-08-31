import { prepareApiRequest, providerStatus } from '../_security.js'
import { callRapidRail, dataRows } from './_rapidapiRail.js'

function normalize(row, index) {
  return {
    id: row.station_code || row.code || row.stationCode || `station-${index}`,
    name: row.station_name || row.name || row.stationName || row.label || 'Station',
    code: row.station_code || row.code || row.stationCode || 'N/A',
    state: row.state || row.zone || '',
    provider: 'RapidAPI IRCTC / irctc1',
    sourceBadge: 'Live API result'
  }
}

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { rateLimit: 25 })) return
  const query = String(req.query.query || req.query.q || '').trim().slice(0, 80)
  if (query.length < 2) return res.status(400).json({ ok: false, mode: 'invalid', message: 'Enter at least 2 characters for station search.', results: [] })
  try {
    const results = dataRows(await callRapidRail('/api/v1/searchStation', { query })).slice(0, 30).map(normalize)
    return res.status(200).json({ ok: true, mode: 'live', provider: 'RapidAPI IRCTC / irctc1', sourceBadge: 'Live API result', message: results.length ? `Station search loaded for ${query}.` : `No stations returned for ${query}.`, count: results.length, results })
  } catch (error) {
    return res.status(providerStatus(error)).json({ ok: false, mode: 'provider-error', provider: 'RapidAPI IRCTC / irctc1', sourceBadge: 'Provider unavailable', message: error.message, error: error.code || 'STATION_SEARCH_ERROR', results: [] })
  }
}

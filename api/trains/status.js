import { prepareApiRequest, providerStatus } from '../_security.js'
import { callRapidRail } from './_rapidapiRail.js'

function normalizeLive(payload, trainNumber, startDay) {
  const data = payload?.data || payload || {}
  const current = data.current_station_name || data.current_station || data.current_location || data.cur_stn_name || data.last_location || data.status_as_of || data.train_position || data.status
  const delay = data.delay || data.late_by || data.late_by_min || data.delay_in_arrival || data.delay_in_departure || data.avg_delay || data.run_delay
  const route = Array.isArray(data.route) ? data.route : Array.isArray(data.station_list) ? data.station_list : Array.isArray(data.previous_stations) ? data.previous_stations : []
  const next = route.find((item) => item?.is_current_station || item?.station_name === current) || route.find((item) => item?.eta || item?.estimated_arrival || item?.arrival_delay)
  return {
    trainNumber: String(data.train_number || data.trainNo || data.train_no || trainNumber || '').replace(/\D/g, ''),
    trainName: data.train_name || data.trainName || data.name || 'Train live status',
    from: data.source || data.from || data.src_name || data.source_stn_name || data.from_station_name || 'Source not returned',
    to: data.destination || data.to || data.dstn_name || data.destination_stn_name || data.to_station_name || 'Destination not returned',
    currentStation: current || next?.station_name || next?.stationCode || 'Current station not returned',
    status: data.status || data.running_status || data.position || data.train_status || (data.is_run_day === false ? 'Train is not running today' : 'Live provider response loaded'),
    delay: delay !== undefined && delay !== null ? String(delay) : 'Not returned',
    platform: data.platform_number || data.platform || next?.platform_number || 'Check station board',
    updated: data.updated_time || data.status_as_of || data.notification_date || 'Provider did not return an update timestamp',
    startDay,
    sourceBadge: 'Live API result'
  }
}

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { rateLimit: 20 })) return
  const trainNumber = String(req.query.trainNumber || req.query.train || req.query.trainNo || '').replace(/\D/g, '')
  const startDay = String(req.query.startDay || req.query.dayOffset || req.query.day || '0')
  if (!/^\d{5}$/.test(trainNumber)) {
    return res.status(400).json({ ok: false, mode: 'invalid', sourceBadge: 'Input required', message: 'Enter a valid 5-digit train number.', result: null })
  }
  if (!/^[0-7]$/.test(startDay)) {
    return res.status(400).json({ ok: false, mode: 'invalid', message: 'startDay must be between 0 and 7.', result: null })
  }

  try {
    const payload = await callRapidRail('/api/v1/liveTrainStatus', { trainNo: trainNumber, startDay })
    return res.status(200).json({ ok: true, mode: 'live', provider: 'RapidAPI IRCTC / irctc1', sourceBadge: 'Live API result', message: 'Live train running status loaded.', result: normalizeLive(payload, trainNumber, startDay) })
  } catch (error) {
    return res.status(providerStatus(error)).json({ ok: false, mode: 'provider-error', provider: 'RapidAPI IRCTC / irctc1', sourceBadge: 'Provider unavailable', message: error.message, error: error.code || 'TRAIN_STATUS_ERROR', result: null })
  }
}

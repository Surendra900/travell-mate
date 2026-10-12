import { prepareApiRequest, providerStatus, publicProviderError } from '../_security.js'
import { callRapidRail, dataRows, extractStationCode, getRapidConfig, stationCodes } from './_rapidapiRail.js'

function normalizeTrainRow(row, index, from, to, date) {
  const trainNo = row.trainNumber || row.train_number || row.trainNo || row.train_no || row.number || row.code || row.train_num || 'N/A'
  const trainName = row.trainName || row.train_name || row.name || row.train || 'Train option'
  const depart = row.schedule?.departureTime || row.from_std || row.departure_time || row.departure || row.dep_time || row.start_time || row.std || 'Check provider'
  const arrive = row.schedule?.arrivalTime || row.to_sta || row.arrival_time || row.arrival || row.arr_time || row.end_time || row.sta || 'Check provider'
  
  const originExtracted = row.schedule?.origin?.code ? extractStationCode(row.schedule.origin.code) : ''
  const destExtracted = row.schedule?.destination?.code ? extractStationCode(row.schedule.destination.code) : ''
  const fromStationCode = originExtracted || row.from_station_code || row.fromStationCode || row.from_stn_code || row.source_code || row.src || from
  const toStationCode = destExtracted || row.to_station_code || row.toStationCode || row.to_stn_code || row.destination_code || row.dstn || to

  const hasSchedule = Boolean(depart && arrive && depart !== 'Check provider' && arrive !== 'Check provider')
  const hasFareOrAvailability = Boolean(row.fare || row.price || row.classes || row.available_classes || row.inventory?.length)
  let status = 'PROVIDER_VERIFICATION_REQUIRED'
  if (hasSchedule && hasFareOrAvailability) {
    status = 'LIVE_PROVIDER_DATA'
  } else if (hasSchedule) {
    status = 'LIVE_SCHEDULE_ONLY'
  }

  let runningDays = row.run_days || row.running_days || row.days || row.train_runs_on || ''
  if (!runningDays && row.schedule?.runningDays) {
    runningDays = Object.entries(row.schedule.runningDays).filter(([_, active]) => active).map(([day]) => day).join(', ')
  }

  return {
    id: `${trainNo}-${index}`,
    type: 'train',
    serviceName: `${trainName} ${trainNo !== 'N/A' ? `(${trainNo})` : ''}`,
    service: `${trainName} ${trainNo !== 'N/A' ? `(${trainNo})` : ''}`,
    code: String(trainNo),
    fromStationCode: String(fromStationCode || '').toUpperCase(),
    toStationCode: String(toStationCode || '').toUpperCase(),
    from: row.from_station_name || row.from || row.source || row.src_name || row.from_stn_name || fromStationCode || from,
    to: row.to_station_name || row.to || row.destination || row.dstn_name || row.to_stn_name || toStationCode || to,
    departure: depart,
    depart,
    arrival: arrive,
    arrive,
    duration: row.schedule?.duration || row.duration || row.travel_time || row.travelTime || 'Check provider',
    runningDays,
    price: row.fare || row.price || null,
    currency: 'INR',
    cabins: row.class_type || row.classes || row.available_classes || ['SL', '3A', '2A'],
    provider: 'RapidAPI IRCTC',
    sourceBadge: status,
    provenance: status,
    verification: `Live route-train response${date ? ` for ${date}` : ''}. This does not confirm Tatkal quota seats; run the separate TQ seat-availability check and verify booking with an authorized provider.`
  }
}

function candidatePairs(fromCodes, toCodes) {
  const pairs = []
  for (const from of fromCodes) {
    for (const to of toCodes) {
      if (from !== to) pairs.push([from, to])
    }
  }
  return pairs.slice(0, 4)
}

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { rateLimit: 18 })) return
  const { from = '', to = '', date = '', query = '', trainNumber = '' } = req.query
  const fromCodes = stationCodes(req.query.fromStationCode || from)
  const toCodes = stationCodes(req.query.toStationCode || to)
  const searchText = String(query || trainNumber || req.query.train || '').trim().slice(0, 80)

  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return res.status(400).json({ ok: false, mode: 'invalid', message: 'Date must use YYYY-MM-DD format.', results: [] })
  }
  if (fromCodes.length && toCodes.length && fromCodes.some((code) => toCodes.includes(code))) {
    return res.status(400).json({ ok: false, mode: 'invalid', message: 'Origin and destination stations must be different.', results: [] })
  }

  if ((from || to) && (!fromCodes.length || !toCodes.length)) {
    return res.status(400).json({
      ok: false,
      mode: 'invalid',
      sourceBadge: 'Input required',
      message: 'Could not resolve one or both railway stations. Enter an exact station code or use station search.',
      results: []
    })
  }
  if (!fromCodes.length && !toCodes.length && !searchText) {
    return res.status(400).json({ ok: false, mode: 'invalid', message: 'Enter From/To stations or a train number/name.', results: [] })
  }

  try {
    let rows = []
    let selectedPair = null
    const { host } = getRapidConfig()
    const isNewTrainApi = host.includes('irctc-train-api')

    if (fromCodes.length && toCodes.length) {
      for (const [fromStationCode, toStationCode] of candidatePairs(fromCodes, toCodes)) {
        let payload
        if (isNewTrainApi) {
          const parts = date ? date.split('-') : new Date().toISOString().slice(0, 10).split('-')
          const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`
          payload = await callRapidRail('/api/v1/trains-between-stations', {
            startStationCode: fromStationCode,
            endStationCode: toStationCode,
            date: formattedDate
          })
        } else {
          payload = await callRapidRail('/api/v3/trainBetweenStations', { fromStationCode, toStationCode, dateOfJourney: date })
        }
        rows = dataRows(payload)
        selectedPair = [fromStationCode, toStationCode]
        if (rows.length) break
      }
    } else {
      const searchEndpoint = isNewTrainApi ? '/api/v1/search-train' : '/api/v1/searchTrain'
      rows = dataRows(await callRapidRail(searchEndpoint, { query: searchText }))
    }

    const fromLabel = selectedPair?.[0] || from || ''
    const toLabel = selectedPair?.[1] || to || ''
    const results = rows.slice(0, 30).map((row, index) => normalizeTrainRow(row, index, fromLabel, toLabel, date))
    return res.status(200).json({
      ok: true,
      mode: 'live',
      provider: 'RapidAPI IRCTC',
      sourceBadge: 'Live API result',
      message: results.length ? `Live train results loaded${selectedPair ? ` for ${selectedPair[0]} → ${selectedPair[1]}` : ''}.` : 'The provider returned no matching trains.',
      count: results.length,
      results,
      searchedStationPair: selectedPair ? `${selectedPair[0]}-${selectedPair[1]}` : null
    })
  } catch (error) {
    const safe = publicProviderError(error, 'Railway provider request failed.')
    return res.status(providerStatus(error)).json({
      ok: false,
      mode: error.code === 'MISSING_RAPIDAPI_KEY' ? 'provider-unconfigured' : 'provider-error',
      provider: 'RapidAPI IRCTC / irctc1',
      sourceBadge: 'PROVIDER_VERIFICATION_REQUIRED',
      message: `${safe.message} No synthetic train result was generated.`,
      error: safe.error,
      results: []
    })
  }
}

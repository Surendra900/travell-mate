import { requestApiJson } from './apiClient'

function unavailable(kind, message) {
  return {
    ok: false,
    mode: 'unavailable',
    provider: 'Provider unavailable',
    sourceBadge: 'Provider unavailable',
    message: message || `${kind} provider could not be reached.`,
    results: [],
    result: null
  }
}

export async function searchLiveTransport({ transport, from, to, date, adults = 1, trainNumber = '', airline = 'All' }) {
  const normalized = String(transport || '').toLowerCase()
  const endpoint = {
    train: '/api/trains/search', trains: '/api/trains/search',
    flight: '/api/flights/search', flights: '/api/flights/search',
    bus: '/api/buses/search', buses: '/api/buses/search'
  }[normalized] || '/api/trains/search'
  const params = new URLSearchParams({ from: from || '', to: to || '', date: date || '', adults: String(adults || 1) })
  if (trainNumber) params.set('trainNumber', trainNumber)
  if (normalized === 'flight' || normalized === 'flights') params.set('airline', airline || 'All')
  return requestApiJson(`${endpoint}?${params}`)
}

export async function getTrainRunningStatus({ trainNumber, startDay = '0' }) {
  const data = await requestApiJson(`/api/trains/status?${new URLSearchParams({ trainNumber: trainNumber || '', startDay: String(startDay ?? '0') })}`)
  return data || unavailable('Train status')
}

export async function getPNRStatus({ pnr }) {
  const data = await requestApiJson(`/api/trains/pnr?${new URLSearchParams({ pnr: pnr || '' })}`)
  return data || unavailable('PNR')
}

export async function getLiveStation({ fromStationCode, toStationCode = '', hours = '4' }) {
  const data = await requestApiJson(`/api/trains/live-station?${new URLSearchParams({ fromStationCode: fromStationCode || '', toStationCode: toStationCode || '', hours: String(hours || '4') })}`)
  return data || unavailable('Live station')
}

export async function getTrainsByStation({ stationCode }) {
  const data = await requestApiJson(`/api/trains/by-station?${new URLSearchParams({ stationCode: stationCode || '' })}`)
  return data || unavailable('Trains by station')
}

export async function searchStations({ query }) {
  const data = await requestApiJson(`/api/trains/station-search?${new URLSearchParams({ query: query || '' })}`)
  return data || unavailable('Station search')
}

export async function getSeatAvailability({ trainNo, fromStationCode, toStationCode, classType = 'SL', quota = 'GN', date = '' }) {
  const params = new URLSearchParams({ trainNo: trainNo || '', fromStationCode: fromStationCode || '', toStationCode: toStationCode || '', classType, quota, date })
  const data = await requestApiJson(`/api/trains/seat-availability?${params}`)
  return data || unavailable('Seat availability')
}

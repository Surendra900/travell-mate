import { transportPlaces } from '../../src/data/transportData.js'
import { fetchJsonWithTimeout } from '../_security.js'

const manualStationGroups = {
  DELHI: ['NDLS', 'DLI', 'NZM', 'ANVT'],
  'NEW DELHI': ['NDLS', 'DLI', 'NZM', 'ANVT'],
  'HAZRAT NIZAMUDDIN': ['NZM'],
  HAZRATNIZAMUDDIN: ['NZM'],
  HYDERABAD: ['SC', 'HYB', 'KCG'],
  SECUNDERABAD: ['SC', 'HYB', 'KCG'],
  KACHEGUDA: ['KCG'],
  VIJAYAWADA: ['BZA'],
  RAJAHMUNDRY: ['RJY'],
  RAJAMAHENDRAVARAM: ['RJY'],
  RAJAMUNDRY: ['RJY'],
  KARUNAGAPPALLI: ['KPY'],
  KARUNAGAPPALLY: ['KPY'],
  KARUNAGAPALLI: ['KPY'],
  KOLLAM: ['QLN'],
  QUILON: ['QLN'],
  ERNAKULAM: ['ERS', 'ERN'],
  KOCHI: ['ERS', 'ERN'],
  COCHIN: ['ERS', 'ERN'],
  CHENNAI: ['MAS', 'MS', 'TBM'],
  'CHENNAI CENTRAL': ['MAS'],
  BENGALURU: ['SBC', 'YPR', 'SMVB'],
  BANGALORE: ['SBC', 'YPR', 'SMVB'],
  MUMBAI: ['CSMT', 'LTT', 'BDTS', 'BCT'],
  KOLKATA: ['HWH', 'SDAH'],
  HOWRAH: ['HWH'],
  PUNE: ['PUNE'],
  GOA: ['MAO', 'THVM'],
  MADGAON: ['MAO'],
  VISAKHAPATNAM: ['VSKP'],
  VIZAG: ['VSKP'],
  TIRUPATI: ['TPTY'],
  GUNTUR: ['GNT'],
  WARANGAL: ['WL'],
  KAZIPET: ['KZJ']
}

function normalizeAliasKey(value = '') {
  return String(value || '')
    .toUpperCase()
    .replace(/&/g, ' AND ')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function extractStationCode(label = '') {
  const match = String(label || '').toUpperCase().match(/\(([A-Z0-9]{2,5})\)/)
  return match ? match[1] : ''
}

function buildStationAliases() {
  const aliases = {}
  for (const place of transportPlaces || []) {
    const station = extractStationCode(place.train)
    if (!station) continue
    const cityKey = normalizeAliasKey(place.city)
    const configuredGroup = manualStationGroups[cityKey] || [station]
    const candidates = [place.city, place.train, station, ...(Array.isArray(place.aliases) ? place.aliases : [])]
    for (const candidate of candidates) {
      const key = normalizeAliasKey(candidate)
      if (key) aliases[key] = [...new Set(configuredGroup)]
    }
  }
  for (const [name, codes] of Object.entries(manualStationGroups)) aliases[normalizeAliasKey(name)] = codes
  for (const codes of Object.values(manualStationGroups)) {
    for (const station of codes) aliases[station] = [station]
  }
  return aliases
}

const stationAliases = buildStationAliases()

function usableSecret(value = '') {
  const trimmed = String(value || '').trim()
  if (!trimmed) return ''
  if (/^(your_|replace_|add_|paste_|example|demo|test_|xxx)/i.test(trimmed)) return ''
  if (/(_here|placeholder|dummy|sample)/i.test(trimmed)) return ''
  return trimmed
}

export function stationCodes(value = '') {
  const raw = String(value || '').trim()
  if (!raw) return []
  const bracketCode = extractStationCode(raw)
  if (bracketCode) return [bracketCode]
  const aliasKey = normalizeAliasKey(raw)
  if (stationAliases[aliasKey]) return [...stationAliases[aliasKey]]
  const upper = raw.toUpperCase().trim()
  if (/^[A-Z0-9]{2,5}$/.test(upper)) return [upper]
  return []
}

export function stationCode(value = '') {
  return stationCodes(value)[0] || ''
}

export function getRapidConfig() {
  const host = usableSecret(process.env.RAPIDAPI_TRAIN_HOST || process.env.IRCTC_API_HOST) || 'irctc1.p.rapidapi.com'
  const key = usableSecret(process.env.RAPIDAPI_KEY || process.env.TRAIN_RAPIDAPI_KEY || process.env.IRCTC_RAPIDAPI_KEY || process.env.TRAIN_API_KEY || process.env.TRAIN_STATUS_API_KEY)
  const base = usableSecret(process.env.IRCTC_API_BASE_URL) || `https://${host}`
  return { host, key, base }
}

export function hasRapidRailConfig() {
  return Boolean(getRapidConfig().key)
}

export async function callRapidRail(path, params = {}, timeoutMs = 10_000) {
  const { host, key, base } = getRapidConfig()
  if (!key) {
    const missing = new Error('RAPIDAPI_KEY is not configured for this deployment.')
    missing.code = 'MISSING_RAPIDAPI_KEY'
    throw missing
  }

  const url = new URL(path.startsWith('http') ? path : `${base}${path}`)
  Object.entries(params).forEach(([name, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') url.searchParams.set(name, String(value).trim())
  })

  const { response, payload } = await fetchJsonWithTimeout(url.toString(), {
    headers: {
      Accept: 'application/json',
      'x-rapidapi-host': host,
      'x-rapidapi-key': key
    }
  }, timeoutMs)

  const providerMessage = payload?.message || payload?.error || payload?.detail
  if (!response.ok || payload?.success === false || payload?.status === false) {
    if (providerMessage) console.warn('RapidAPI rail provider rejected a request:', String(providerMessage).slice(0, 300))
    const error = new Error(`Train provider rejected the request (HTTP ${response.status}). Check the RapidAPI subscription, endpoint quota and request parameters.`)
    error.status = response.status
    error.code = 'RAPIDAPI_ERROR'
    throw error
  }
  return payload
}

function firstArray(value, depth = 0) {
  if (!value || depth > 5) return null
  if (Array.isArray(value)) return value
  if (typeof value !== 'object') return null
  const priorityKeys = [
    'data', 'results', 'result', 'trains', 'train', 'train_list', 'trainList',
    'train_details', 'trainDetails', 'train_between_stations', 'trainBetweenStations',
    'station', 'stations', 'station_list', 'stationList', 'availability', 'avlDayList'
  ]
  for (const key of priorityKeys) {
    const found = firstArray(value[key], depth + 1)
    if (found) return found
  }
  for (const inner of Object.values(value)) {
    const found = firstArray(inner, depth + 1)
    if (found) return found
  }
  return null
}

export function dataRows(payload) {
  if (Array.isArray(payload)) return payload
  const found = firstArray(payload)
  if (found) return found
  if (payload?.data && typeof payload.data === 'object') return [payload.data]
  return []
}

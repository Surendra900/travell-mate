import { findTransportPlace } from '../data/transportData.js'

const EARTH_RADIUS_KM = 6371

function toRadians(value) {
  return Number(value) * (Math.PI / 180)
}

export function haversineDistanceKm(from, to) {
  if (!from || !to) return null
  const lat1 = Number(from.lat)
  const lng1 = Number(from.lng)
  const lat2 = Number(to.lat)
  const lng2 = Number(to.lng)
  if (![lat1, lng1, lat2, lng2].every(Number.isFinite)) return null

  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2
  const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(EARTH_RADIUS_KM * centralAngle)
}

export function routeDistanceKm(fromValue, toValue) {
  const from = findTransportPlace(fromValue)
  const to = findTransportPlace(toValue)
  if (!from || !to || from.city === to.city) return null
  return haversineDistanceKm(from, to)
}

import { useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Map, MapPinOff, Navigation, WifiOff } from 'lucide-react'
import { findTransportPlace, routeCombos } from '../data/transportData'

const segmentColors = { Train: '#22d3ee', Flight: '#f97316', Bus: '#a3e635' }

function midpoint(a, b, offset = 0) {
  return [(a[0] + b[0]) / 2 + offset, (a[1] + b[1]) / 2 + offset]
}

function pathForPlan(plan) {
  const from = findTransportPlace(plan.from)
  const to = findTransportPlace(plan.to)
  if (!from || !to || from.city === to.city) return null
  const combo = routeCombos.find((item) => item.label === plan.routeCombo) || routeCombos.find((item) => item.label === `${plan.transportMode || 'Train'} only`) || routeCombos[0]
  const start = [from.lat, from.lng]
  const end = [to.lat, to.lng]
  if (combo.sequence.length === 1) return { combo, points: [start, end], labels: [from.city, to.city] }
  const stop = midpoint(start, end, combo.sequence[0] === 'Flight' ? 2.2 : -1.8)
  return { combo, points: [start, stop, end], labels: [from.city, 'Illustrative transfer point', to.city] }
}

export default function RouteMap({ plan }) {
  const containerRef = useRef(null)
  const [online, setOnline] = useState(() => navigator.onLine)
  const route = useMemo(() => pathForPlan(plan), [plan.from, plan.to, plan.routeCombo, plan.transportMode])

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online', update)
      window.removeEventListener('offline', update)
    }
  }, [])

  useEffect(() => {
    if (!online || !route || !containerRef.current) return undefined
    const timers = []
    const map = L.map(containerRef.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: false }).setView([22.9, 79.2], 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    const layer = L.layerGroup().addTo(map)
    const latLngs = route.points.map(([lat, lng]) => L.latLng(lat, lng))
    route.points.forEach(([lat, lng], index) => {
      L.circleMarker([lat, lng], {
        radius: index === 0 || index === route.points.length - 1 ? 8 : 6,
        color: '#ffffff', weight: 2,
        fillColor: index === 0 ? '#22d3ee' : index === route.points.length - 1 ? '#fb7185' : '#facc15',
        fillOpacity: 0.95
      }).bindTooltip(route.labels[index], { permanent: index !== 1, direction: 'top' }).addTo(layer)
    })
    map.fitBounds(L.latLngBounds(latLngs).pad(0.35), { animate: false })

    route.combo.sequence.forEach((mode, index) => {
      const from = latLngs[index]
      const to = latLngs[index + 1]
      const animated = L.polyline([from], { color: segmentColors[mode] || '#22d3ee', weight: 5, opacity: 0.9, dashArray: mode === 'Flight' ? '10 10' : mode === 'Bus' ? '4 8' : undefined }).addTo(layer)
      let current = 1
      const steps = 36
      const timer = window.setInterval(() => {
        const progress = Math.min(current / steps, 1)
        animated.setLatLngs([from, L.latLng(from.lat + (to.lat - from.lat) * progress, from.lng + (to.lng - from.lng) * progress)])
        current += 1
        if (progress >= 1) window.clearInterval(timer)
      }, 30)
      timers.push(timer)
    })

    return () => {
      timers.forEach((timer) => window.clearInterval(timer))
      map.remove()
    }
  }, [online, route])

  return (
    <div className="glass overflow-hidden rounded-3xl p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-sm font-bold text-cyan-200">Route map visualization</p><h3 className="text-2xl font-black text-white">India journey path</h3></div>
        <span className="badge"><Map size={14} /> Leaflet · OpenStreetMap</span>
      </div>
      {!route ? (
        <div className="grid h-[220px] place-items-center rounded-2xl border border-yellow-400/20 bg-slate-950 p-6 text-center text-yellow-100"><div><MapPinOff className="mx-auto mb-3" /><b>Select two supported, different cities or codes.</b><p className="mt-2 text-sm">TravelMate will not invent a map route for unknown locations.</p></div></div>
      ) : online ? (
        <div ref={containerRef} className="h-[320px] overflow-hidden rounded-2xl border border-cyan-400/20 bg-slate-950" aria-label="Journey route map" />
      ) : (
        <div className="grid h-[220px] place-items-center rounded-2xl border border-yellow-400/20 bg-slate-950 p-6 text-center text-yellow-100"><div><WifiOff className="mx-auto mb-3" /><b>Map tiles require internet.</b><p className="mt-2 text-sm">The saved route text remains available offline.</p></div></div>
      )}
      {route && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-300">
          {route.combo.sequence.map((mode, index) => <span key={`${mode}-${index}`} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5"><Navigation className="mr-1 inline" size={13} />{mode}</span>)}
          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5">{route.labels[0]} → {route.labels.at(-1)}</span>
          {route.combo.sequence.length > 1 && <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1.5 text-yellow-100">Transfer point is illustrative, not provider routing</span>}
        </div>
      )}
    </div>
  )
}

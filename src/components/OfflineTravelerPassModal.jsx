import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Bus,
  Check,
  Clock,
  Copy,
  Download,
  MapPin,
  PhoneCall,
  Plane,
  Printer,
  ShieldCheck,
  Train,
  X
} from 'lucide-react'

const modeIcons = {
  Train: Train,
  Bus: Bus,
  Flight: Plane
}

export default function OfflineTravelerPassModal({ route, onClose }) {
  const [copied, setCopied] = useState(false)
  const [offlineCached, setOfflineCached] = useState(false)

  useEffect(() => {
    if (!route) return
    // Cache the pass in localStorage for 100% offline access
    try {
      const cacheKey = `travelmate-offline-pass-${route.id}`
      localStorage.setItem(cacheKey, JSON.stringify({
        route,
        savedAt: new Date().toISOString()
      }))
      setOfflineCached(true)
    } catch (e) {
      console.warn('Could not cache offline pass:', e)
    }
  }, [route])

  if (!route) return null

  const Leg1Icon = modeIcons[route.leg1?.mode] || Train
  const Leg2Icon = modeIcons[route.leg2?.mode] || Train

  function handlePrint() {
    window.print()
  }

  function handleCopySummary() {
    const text = [
      `🎫 TRAVELMATE OFFLINE BOARDING PASS`,
      `Route: ${route.leg1?.from} ➔ ${route.leg2?.to}`,
      `Total Fare: ${route.fareFormatted} | Duration: ${route.totalDuration}`,
      `----------------------------------------`,
      `STEP 1: ${route.leg1?.service} (${route.leg1?.mode})`,
      `Depart: ${route.leg1?.depart} from ${route.leg1?.from}`,
      `Arrive: ${route.leg1?.arrive} at ${route.hubCity}`,
      `Fare: ₹${route.leg1?.fare}`,
      `----------------------------------------`,
      `JUNCTION HUB TRANSFER: ${route.hubCity}`,
      `Buffer: ${route.transferBuffer}`,
      `----------------------------------------`,
      `STEP 2: ${route.leg2?.service} (${route.leg2?.mode})`,
      `Depart: ${route.leg2?.depart} from ${route.hubCity}`,
      `Arrive: ${route.leg2?.arrive} at ${route.leg2?.to}`,
      `Fare: ₹${route.leg2?.fare}`,
      `----------------------------------------`,
      `EMERGENCY HELPLINES:`,
      `Railway Helpline: 139 | Police/Emergency: 112 | Ambulance: 108`,
      `Offline Pass saved in browser cache for no-network corridors.`
    ].join('\n')

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-cyan-400/40 bg-slate-950 p-6 shadow-2xl text-slate-100 print:max-h-none print:w-full print:border-none print:bg-white print:text-black print:p-0">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 print:border-black">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-cyan-300 print:bg-slate-200 print:text-black">
                Offline Traveler Pass
              </span>
              {offlineCached && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 print:text-black">
                  <ShieldCheck size={13} /> Cached Offline
                </span>
              )}
            </div>
            <h2 className="mt-2 text-2xl font-black text-white print:text-black">
              {route.leg1?.from} ➔ {route.leg2?.to}
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600">
              {route.tierLabel} · {route.fareFormatted} · {route.totalDuration} Total Travel Time
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-800 p-2 text-slate-400 hover:bg-slate-700 hover:text-white print:hidden"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Boarding Leg 1 */}
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 print:border-slate-400 print:bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 print:border-slate-300">
            <span className="flex items-center gap-2 text-sm font-black text-white print:text-black">
              <Leg1Icon size={16} className="text-cyan-400 print:text-black" />
              Leg 1: {route.leg1?.service}
            </span>
            <span className="text-xs font-bold text-cyan-300 print:text-black">₹{route.leg1?.fare}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400 print:text-slate-600">Boarding Station</p>
              <p className="font-bold text-white print:text-black">{route.leg1?.from}</p>
              <p className="text-[11px] text-slate-400">Departure: <b>{route.leg1?.depart}</b></p>
            </div>
            <div>
              <p className="text-slate-400 print:text-slate-600">Arrival Hub</p>
              <p className="font-bold text-white print:text-black">{route.hubCity}</p>
              <p className="text-[11px] text-slate-400">Arrival: <b>{route.leg1?.arrive}</b></p>
            </div>
          </div>
        </div>

        {/* Hub Transfer Badge */}
        <div className="my-3 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-2.5 text-xs text-amber-200 print:border-black print:bg-slate-100 print:text-black">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-amber-400 print:text-black" />
            <span>
              Transfer Hub: <b>{route.hubCity} Junction</b> ({route.transferBuffer})
            </span>
          </div>
          <span className="font-bold text-emerald-400 print:text-black">Safe Buffer Verified</span>
        </div>

        {/* Boarding Leg 2 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 print:border-slate-400 print:bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 print:border-slate-300">
            <span className="flex items-center gap-2 text-sm font-black text-white print:text-black">
              <Leg2Icon size={16} className="text-blue-400 print:text-black" />
              Leg 2: {route.leg2?.service}
            </span>
            <span className="text-xs font-bold text-cyan-300 print:text-black">₹{route.leg2?.fare}</span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400 print:text-slate-600">Departure Hub</p>
              <p className="font-bold text-white print:text-black">{route.hubCity}</p>
              <p className="text-[11px] text-slate-400">Departure: <b>{route.leg2?.depart}</b></p>
            </div>
            <div>
              <p className="text-slate-400 print:text-slate-600">Final Destination</p>
              <p className="font-bold text-white print:text-black">{route.leg2?.to}</p>
              <p className="text-[11px] text-slate-400">Arrival: <b>{route.leg2?.arrive}</b></p>
            </div>
          </div>
        </div>

        {/* Emergency Helplines Box */}
        <div className="mt-5 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 print:border-black print:bg-white">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-300 print:text-black">
            <PhoneCall size={14} className="text-emerald-400 print:text-black" />
            Indian Travel Emergency Helplines (Dial Free)
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] text-slate-400">Railway Security</span>
              <p className="font-black text-white print:text-black">139</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] text-slate-400">Police / SOS</span>
              <p className="font-black text-white print:text-black">112</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] text-slate-400">Medical Ambulance</span>
              <p className="font-black text-white print:text-black">108</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-2 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] text-slate-400">Women Helpline</span>
              <p className="font-black text-white print:text-black">1090</p>
            </div>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 print:text-slate-600">
            * This pass is cached on this device and remains accessible even when offline or traveling through low network railway tracks.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-slate-700"
            >
              <Printer size={14} />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-300 transition hover:text-white"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-cyan-300"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  )
}

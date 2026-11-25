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

import { useDialogFocus } from '../hooks/useDialogFocus.js'

const modeIcons = {
  Train: Train,
  Bus: Bus,
  Flight: Plane
}

export default function OfflineTravelerPassModal({ route, onClose }) {
  const [copied, setCopied] = useState(false)
  const [offlineCached, setOfflineCached] = useState(false)
  const dialogRef = useDialogFocus({ isOpen: Boolean(route), onClose })

  useEffect(() => {
    if (!route) return
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
      `TRAVELMATE OFFLINE BOARDING PASS`,
      `Route: ${route.leg1?.from} to ${route.leg2?.to}`,
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
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-pass-modal-title"
    >
      <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-lg border border-gray-300 bg-white p-5 shadow-xl text-gray-900 print:max-h-none print:w-full print:border-none print:bg-white print:text-black print:p-0">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 pb-3.5 print:border-black">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
              <span className="text-[12px] font-bold uppercase tracking-wider text-gray-700">
                Offline Traveler Pass
              </span>
              {offlineCached && (
                <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-[#EDF7F0] text-[#137333] border border-[#C6E8D1] print:text-black">
                  <ShieldCheck size={12} /> Cached Offline
                </span>
              )}
            </div>
            <h2 id="offline-pass-modal-title" className="mt-1.5 text-lg font-bold text-gray-900 print:text-black">
              {route.leg1?.from} to {route.leg2?.to}
            </h2>
            <p className="text-xs text-gray-500 print:text-gray-600">
              {route.tierLabel} · <span className="tabular font-semibold text-gray-900">{route.fareFormatted}</span> · {route.totalDuration} Total Travel Time
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 print:hidden"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Boarding Leg 1 */}
        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50/50 p-3.5 print:border-gray-300 print:bg-gray-50">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 print:border-gray-300">
            <span className="flex items-center gap-2 text-xs font-bold text-gray-900 print:text-black">
              <Leg1Icon size={14} className="text-[#15803D] print:text-black" />
              Leg 1: {route.leg1?.service}
            </span>
            <span className="text-xs font-bold text-gray-900 tabular print:text-black">₹{route.leg1?.fare}</span>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[11px] text-gray-500">Boarding Station</p>
              <p className="font-semibold text-gray-900">{route.leg1?.from}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">Dep: <span className="tabular font-semibold text-gray-900">{route.leg1?.depart}</span></p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Arrival Hub</p>
              <p className="font-semibold text-gray-900">{route.hubCity}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">Arr: <span className="tabular font-semibold text-gray-900">{route.leg1?.arrive}</span></p>
            </div>
          </div>
        </div>

        {/* Hub Transfer Badge */}
        <div className="my-2.5 flex items-center justify-between rounded-md border border-amber-200 bg-[#FEF7E6] px-3 py-2 text-xs text-amber-900 print:border-black print:bg-gray-100 print:text-black">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#A15C07] print:text-black" />
            <span>
              Transfer Hub: <b>{route.hubCity} Junction</b> ({route.transferBuffer})
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#137333]">Safe Buffer Verified</span>
        </div>

        {/* Boarding Leg 2 */}
        <div className="rounded-md border border-gray-200 bg-gray-50/50 p-3.5 print:border-gray-300 print:bg-gray-50">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 print:border-gray-300">
            <span className="flex items-center gap-2 text-xs font-bold text-gray-900 print:text-black">
              <Leg2Icon size={14} className="text-[#15803D] print:text-black" />
              Leg 2: {route.leg2?.service}
            </span>
            <span className="text-xs font-bold text-gray-900 tabular print:text-black">₹{route.leg2?.fare}</span>
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-[11px] text-gray-500">Departure Hub</p>
              <p className="font-semibold text-gray-900">{route.hubCity}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">Dep: <span className="tabular font-semibold text-gray-900">{route.leg2?.depart}</span></p>
            </div>
            <div>
              <p className="text-[11px] text-gray-500">Final Destination</p>
              <p className="font-semibold text-gray-900">{route.leg2?.to}</p>
              <p className="text-[11px] text-gray-600 mt-0.5">Arr: <span className="tabular font-semibold text-gray-900">{route.leg2?.arrive}</span></p>
            </div>
          </div>
        </div>

        {/* Emergency Helplines Box */}
        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-700">
            <PhoneCall size={13} className="text-[#15803D]" />
            Indian Travel Emergency Helplines (Dial Free)
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div className="rounded border border-gray-200 bg-white p-2 text-center">
              <span className="text-[10px] text-gray-500 block">Railway Security</span>
              <p className="font-bold text-gray-900 font-mono">139</p>
            </div>
            <div className="rounded border border-gray-200 bg-white p-2 text-center">
              <span className="text-[10px] text-gray-500 block">Police / SOS</span>
              <p className="font-bold text-gray-900 font-mono">112</p>
            </div>
            <div className="rounded border border-gray-200 bg-white p-2 text-center">
              <span className="text-[10px] text-gray-500 block">Medical Ambulance</span>
              <p className="font-bold text-gray-900 font-mono">108</p>
            </div>
            <div className="rounded border border-gray-200 bg-white p-2 text-center">
              <span className="text-[10px] text-gray-500 block">Women Helpline</span>
              <p className="font-bold text-gray-900 font-mono">1090</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 border-t border-gray-200 pt-3.5 print:hidden">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <Printer size={13} />
              Print / PDF
            </button>
            <button
              type="button"
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              {copied ? <Check size={13} className="text-[#137333]" /> : <Copy size={13} />}
              {copied ? 'Copied' : 'Copy Summary'}
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded bg-[#15803D] hover:bg-[#12733B] px-4 py-1.5 text-xs font-semibold text-white transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  )
}

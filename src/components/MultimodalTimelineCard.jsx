import { useState } from 'react'
import {
  ArrowRight,
  Bus,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Plane,
  Save,
  ShieldCheck,
  Sparkles,
  Train
} from 'lucide-react'

const modeIcons = {
  Train: Train,
  Bus: Bus,
  Flight: Plane
}

export default function MultimodalTimelineCard({ route, onSave }) {
  const [saved, setSaved] = useState(false)

  if (!route) return null

  const Leg1Icon = modeIcons[route.leg1?.mode] || Train
  const Leg2Icon = modeIcons[route.leg2?.mode] || Train

  const tierColors = {
    'paisa-vasool': {
      border: 'border-emerald-400/30',
      badge: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
      price: 'text-emerald-300'
    },
    'smart-balanced': {
      border: 'border-blue-400/30',
      badge: 'bg-blue-400/15 text-blue-300 border-blue-400/30',
      price: 'text-blue-300'
    },
    'emergency-express': {
      border: 'border-amber-400/30',
      badge: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
      price: 'text-amber-300'
    }
  }[route.tier] || {
    border: 'border-cyan-400/30',
    badge: 'bg-cyan-400/15 text-cyan-300 border-cyan-400/30',
    price: 'text-cyan-300'
  }

  function handleSave() {
    setSaved(true)
    onSave?.(route)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <article className={`rounded-3xl border ${tierColors.border} bg-slate-950/80 p-5 shadow-lg backdrop-blur transition hover:border-cyan-400/50`}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-black tracking-wide ${tierColors.badge}`}>
              {route.tierLabel}
            </span>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-300">
              {route.tierBadge}
            </span>
          </div>
          <p className="mt-2 text-xs text-cyan-200/90 font-medium">
            <Sparkles size={13} className="mr-1 inline text-cyan-300" />
            {route.whyPicked}
          </p>
        </div>

        <div className="text-right">
          <p className={`text-2xl font-black ${tierColors.price}`}>{route.fareFormatted}</p>
          <p className="flex items-center justify-end gap-1 text-xs font-bold text-slate-400">
            <Clock size={12} /> {route.totalDuration} total
          </p>
        </div>
      </div>

      {/* Visual Timeline */}
      <div className="mt-4 space-y-3">
        {/* Leg 1 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-black text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                <Leg1Icon size={16} />
              </span>
              Step 1: {route.leg1?.service}
            </span>
            <span className="text-xs font-bold text-cyan-300">₹{route.leg1?.fare}</span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
            <span><b>{route.leg1?.depart}</b> {route.leg1?.from}</span>
            <span className="text-slate-500">── {route.leg1?.duration} ──➔</span>
            <span><b>{route.leg1?.arrive}</b> {route.leg1?.to}</span>
          </div>

          <div className="mt-3 flex justify-end">
            <a
              href={route.leg1?.bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-100 transition hover:bg-cyan-400/20"
            >
              <ExternalLink size={13} /> Book Step 1 ({route.leg1?.mode}) ↗
            </a>
          </div>
        </div>

        {/* Transfer Buffer */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950 px-4 py-2 text-xs font-bold text-slate-300">
          <MapPin size={15} className="text-amber-400" />
          <span>Hub: <b>{route.hubCity}</b> · {route.transferBuffer}</span>
        </div>

        {/* Leg 2 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2 text-sm font-black text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300">
                <Leg2Icon size={16} />
              </span>
              Step 2: {route.leg2?.service}
            </span>
            <span className="text-xs font-bold text-cyan-300">₹{route.leg2?.fare}</span>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
            <span><b>{route.leg2?.depart}</b> {route.leg2?.from}</span>
            <span className="text-slate-500">── {route.leg2?.duration} ──➔</span>
            <span><b>{route.leg2?.arrive}</b> {route.leg2?.to}</span>
          </div>

          <div className="mt-3 flex justify-end">
            <a
              href={route.leg2?.bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-black text-cyan-100 transition hover:bg-cyan-400/20"
            >
              <ExternalLink size={13} /> Book Step 2 ({route.leg2?.mode}) ↗
            </a>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
        <span className="text-xs text-slate-400">
          <ShieldCheck size={14} className="mr-1 inline text-emerald-400" />
          Direct booking with pre-filled route on provider portal
        </span>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-slate-600 hover:text-white"
        >
          {saved ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Save size={14} />}
          {saved ? 'Saved to My Trips' : 'Save Plan'}
        </button>
      </div>
    </article>
  )
}

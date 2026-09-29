import { useState } from 'react'
import {
  ArrowRight,
  Bus,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Info,
  MapPin,
  Plane,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  Train
} from 'lucide-react'
import { formatWhatsAppShareText, getWhatsAppShareUrl } from '../utils/multimodalRouter'
import { getTransitHubGuide } from '../data/transitHubData'
import OfflineTravelerPassModal from './OfflineTravelerPassModal'

const modeIcons = {
  Train: Train,
  Bus: Bus,
  Flight: Plane
}

export default function MultimodalTimelineCard({ route, onSave }) {
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showHubGuide, setShowHubGuide] = useState(false)
  const [showOfflinePass, setShowOfflinePass] = useState(false)

  if (!route) return null

  const Leg1Icon = modeIcons[route.leg1?.mode] || Train
  const Leg2Icon = modeIcons[route.leg2?.mode] || Train

  const hubGuide = getTransitHubGuide({
    hubCity: route.hubCity,
    leg1Mode: route.leg1?.mode,
    leg2Mode: route.leg2?.mode,
    bufferMinutes: 105
  })

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

  function handleCopy() {
    const text = formatWhatsAppShareText(route)
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      }).catch(() => {})
    }
  }

  return (
    <>
      <article className={`rounded-3xl border ${tierColors.border} bg-slate-950/80 p-5 shadow-lg backdrop-blur transition hover:border-cyan-400/50`}>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-black tracking-wide ${tierColors.badge}`}>
                {route.tierLabel}
              </span>
              <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-bold text-slate-300">
                {route.tierBadge}
              </span>
            </div>

            {/* AI Reason Box */}
            <div className="multimodal-ai-reason mt-3 flex items-start gap-2.5 rounded-2xl p-3 shadow-inner">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300">
                <Sparkles size={12} />
              </div>
              <div className="min-w-0">
                <span className="ai-kicker text-[10px] font-black uppercase tracking-wider">Why TravelMate Picked This</span>
                <p className="mt-0.5 text-xs font-semibold leading-relaxed">
                  {route.whyPicked}
                </p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <p className={`text-2xl font-black ${tierColors.price}`}>{route.fareFormatted}</p>
            <p className="flex items-center justify-end gap-1 text-xs font-bold text-slate-400">
              <Clock size={12} /> {route.totalDuration} total
            </p>
          </div>
        </div>

        {/* Visual Progress Track */}
        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-900/60 px-3.5 py-2 text-xs border border-slate-800/80">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-sm"></span>
            <span>{route.leg1?.from}</span>
          </div>

          <div className="mx-2 flex flex-1 items-center justify-center gap-1">
            <div className="h-[2px] w-full bg-gradient-to-r from-cyan-400/80 to-amber-400/80"></div>
            <span className="shrink-0 flex items-center gap-1 rounded-full bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/20">
              <MapPin size={10} /> {route.hubCity} Junction
            </span>
            <div className="h-[2px] w-full bg-gradient-to-r from-amber-400/80 to-blue-400/80"></div>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <span className="h-2 w-2 rounded-full bg-blue-400 shadow-sm"></span>
            <span>{route.leg2?.to}</span>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="mt-4 space-y-3">
          {/* Leg 1 */}
          <div className="multimodal-timeline-leg rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
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

          {/* Transfer Buffer & Junction Navigator */}
          <div className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-3 text-xs text-amber-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-amber-400" />
                <span>Hub: <b>{hubGuide.stationName}</b> · {route.transferBuffer}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowHubGuide(!showHubGuide)}
                className="inline-flex items-center gap-1 rounded-xl border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 transition hover:bg-amber-400/20"
              >
                <Compass size={13} />
                {showHubGuide ? 'Hide Transfer Guide' : 'Station Transfer Guide'}
                {showHubGuide ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            {/* Expanded Junction Transfer Guide */}
            {showHubGuide && (
              <div className="mt-3 border-t border-amber-400/20 pt-3 text-slate-200 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-300">
                    {hubGuide.transferType}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-400">
                    🟢 {hubGuide.safetyScore}% Safe Connection Score
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-300">
                  <b>Navigation Instructions:</b> {hubGuide.transferInstructions}
                </p>

                <p className="text-xs text-amber-200/90">
                  💡 <b>Pro-Tip:</b> {hubGuide.modeSpecificTip}
                </p>

                {hubGuide.amenities && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 mr-1 flex items-center">Hub Amenities:</span>
                    {hubGuide.amenities.map((item) => (
                      <span key={item} className="rounded-lg bg-slate-900/80 px-2 py-0.5 text-[10px] text-slate-300 border border-slate-800">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Leg 2 */}
          <div className="multimodal-timeline-leg rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
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

          <div className="flex flex-wrap items-center gap-2">
            {/* Offline Pass */}
            <button
              type="button"
              onClick={() => setShowOfflinePass(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/25"
              title="View & save offline boarding pass"
            >
              <Download size={13} />
              Offline Pass
            </button>

            {/* 1-Tap WhatsApp Share */}
            <a
              href={getWhatsAppShareUrl(route)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-600/20 px-3 py-1.5 text-xs font-black text-emerald-300 transition hover:bg-emerald-600/30 hover:border-emerald-400"
              title="Share confirmed itinerary on WhatsApp"
            >
              <Share2 size={13} />
              Share on WhatsApp
            </a>

            {/* Copy Itinerary */}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-slate-600 hover:text-white"
              title="Copy itinerary summary"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            {/* Save to My Trips */}
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              {saved ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Save size={13} />}
              {saved ? 'Saved' : 'Save Plan'}
            </button>
          </div>
        </div>
      </article>

      {/* Offline Pass Modal */}
      {showOfflinePass && (
        <OfflineTravelerPassModal
          route={route}
          onClose={() => setShowOfflinePass(false)}
        />
      )}
    </>
  )
}

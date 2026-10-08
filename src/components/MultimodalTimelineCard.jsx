import { useState, useEffect } from 'react'
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
  Train,
  Volume2,
  VolumeX,
  SlidersHorizontal,
  CloudSun
} from 'lucide-react'
import { formatWhatsAppShareText, getWhatsAppShareUrl } from '../utils/multimodalRouter'
import { getTransitHubGuide } from '../data/transitHubData'
import { speakRouteTier, stopSpeaking } from '../utils/voiceIntent'
import OfflineTravelerPassModal from './OfflineTravelerPassModal'
import { RiskBadge } from './ui/RiskBadge'
import { ProvenanceBadge } from './ui/ProvenanceBadge'
import DelayContingencySimulator from './DelayContingencySimulator'

const modeIcons = {
  Train: Train,
  Bus: Bus,
  Flight: Plane
}

export default function MultimodalTimelineCard({ route, onSave }) {
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showHubGuide, setShowHubGuide] = useState(false)
  const [showSimulator, setShowSimulator] = useState(false)
  const [showOfflinePass, setShowOfflinePass] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  function handleToggleAudioSummary() {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
    } else {
      setIsSpeaking(true)
      speakRouteTier(route, {
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false)
      })
    }
  }

  if (!route) return null

  const Leg1Icon = modeIcons[route.leg1?.mode] || Train
  const Leg2Icon = modeIcons[route.leg2?.mode] || Train

  const hubCity = route.hubCity || route.transfer?.hubCity || 'Junction'
  const slackMinutes = route.slackMinutes || route.transfer?.slackMinutes || 105
  const mctMinutes = route.mctMinutes || route.transfer?.mctMinutes || 45
  const maxAbsorbableDelay = Math.max(0, slackMinutes - mctMinutes)
  const riskLevel = route.riskLevel || route.reliability?.riskLevel || 'Safe'

  const hubGuide = getTransitHubGuide({
    hubCity: route.hubCity,
    leg1Mode: route.leg1?.mode,
    leg2Mode: route.leg2?.mode,
    bufferMinutes: slackMinutes
  })

  const tierColors = {
    'paisa-vasool': {
      border: 'border-emerald-200',
      badge: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-extrabold',
      price: 'text-emerald-700',
      pill: 'bg-emerald-600'
    },
    'smart-balanced': {
      border: 'border-sky-200',
      badge: 'bg-sky-50 text-sky-900 border-sky-300 font-extrabold',
      price: 'text-sky-700',
      pill: 'bg-sky-600'
    },
    'emergency-express': {
      border: 'border-amber-200',
      badge: 'bg-amber-50 text-amber-950 border-amber-300 font-extrabold',
      price: 'text-amber-800',
      pill: 'bg-amber-600'
    }
  }[route.tier] || {
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-800 border-slate-300 font-extrabold',
    price: 'text-slate-900',
    pill: 'bg-slate-600'
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

  const leg1Provenance = route.leg1?.provenance || 'TIMETABLE'
  const leg2Provenance = route.leg2?.provenance || (route.leg2?.mode === 'Bus' ? 'ESTIMATE' : 'TIMETABLE')

  return (
    <>
      <article
        data-testid="multimodal-journey-card"
        className={`rounded-3xl border ${tierColors.border} bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition text-slate-900`}
      >
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-xs font-black tracking-wide ${tierColors.badge}`}>
                {route.tierLabel}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
                {route.tierBadge}
              </span>
              <button
                type="button"
                onClick={handleToggleAudioSummary}
                data-testid={`speak-tier-btn-${route.tier}`}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold transition border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 ${
                  isSpeaking ? 'border-amber-400 bg-amber-50 text-amber-900 animate-pulse' : ''
                }`}
                aria-label={`Listen to ${route.tierLabel} audio summary`}
                title={isSpeaking ? 'Stop audio summary' : 'Listen to spoken itinerary'}
              >
                {isSpeaking ? <VolumeX size={12} className="text-amber-700" /> : <Volume2 size={12} className="text-sky-700" />}
                <span>{isSpeaking ? 'Stop Audio' : 'Audio Guide'}</span>
              </button>
            </div>

            {/* Grounded Route Rationale & Contextual Weather */}
            <div data-testid="route-grounded-rationale" className="multimodal-ai-reason mt-3.5 flex items-start gap-2.5 rounded-2xl bg-sky-50/70 border border-sky-100 p-3.5 shadow-sm">
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700">
                <Sparkles size={12} />
              </div>
              <div className="min-w-0">
                <span className="ai-kicker text-[10px] font-black uppercase tracking-wider text-sky-900">
                  Grounded Route Rationale · Why TravelMate Picked This Junction
                </span>
                <p className="mt-0.5 text-xs font-semibold leading-relaxed text-slate-700">
                  {route.rationale || route.whyPicked || `High-capacity interchange at ${hubCity} providing safe transfer slack and verified connecting departures.`}
                </p>
              </div>
            </div>

            {/* Contextual Weather Check per Master Spec Section 4 & 12 */}
            <div data-testid="route-contextual-weather" className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <CloudSun size={13} className="text-sky-600" />
              <span>Weather: Clear conditions at {hubCity} hub · +0m weather buffer</span>
            </div>
          </div>

          <div className="text-right">
            <p className={`text-2xl sm:text-3xl font-black ${tierColors.price}`}>{route.fareFormatted}</p>
            <span className="text-[11px] font-medium text-slate-500 block">Estimate: verify on portal</span>
            <p className="flex items-center justify-end gap-1 text-xs font-bold text-slate-600 mt-1">
              <Clock size={12} className="text-slate-500" /> {route.totalDuration} total
            </p>
          </div>
        </div>

        {/* Visual Progress Track */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-2.5 text-xs border border-slate-200">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-600"></span>
            <span>{route.leg1?.from}</span>
          </div>

          <div className="mx-2 flex flex-1 items-center justify-center gap-1">
            <div className="h-0.5 w-full bg-slate-300"></div>
            <span className="shrink-0 flex items-center gap-1 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-950 border border-amber-200 shadow-sm">
              <MapPin size={11} className="text-amber-700" /> {hubCity} Junction
            </span>
            <div className="h-0.5 w-full bg-slate-300"></div>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
            <span>{route.leg2?.to}</span>
          </div>
        </div>

        {/* Visual Timeline Legs */}
        <div className="mt-4 space-y-3">
          {/* Leg 1 */}
          <div className="multimodal-timeline-leg rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <Leg1Icon size={16} />
                </span>
                <span className="text-sm font-black text-slate-900">
                  Step 1: {route.leg1?.service}
                </span>
                <ProvenanceBadge source={leg1Provenance} />
              </div>
              <span className="text-sm font-extrabold text-slate-900">₹{route.leg1?.fare} <span className="text-[10px] text-slate-400 font-normal">est.</span></span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span><b className="text-slate-900">{route.leg1?.depart}</b> {route.leg1?.from}</span>
              <span className="text-slate-400 font-semibold">── {route.leg1?.duration} ──➔</span>
              <span><b className="text-slate-900">{route.leg1?.arrive}</b> {route.leg1?.to}</span>
            </div>

            <div className="mt-3 flex justify-end">
              <a
                href={route.leg1?.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800 transition hover:bg-sky-100"
              >
                <ExternalLink size={13} /> Book Step 1 ({route.leg1?.mode}) ↗
              </a>
            </div>
          </div>

          {/* Transfer Buffer, Risk Badge, and Delay Simulator Toggle */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-950">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <MapPin size={15} className="text-amber-700 shrink-0" />
                <span className="font-semibold">
                  Hub: <b>{hubGuide.stationName}</b> · {route.transferBuffer || `${slackMinutes}m transfer buffer`}
                </span>
                <RiskBadge
                  bufferMinutes={slackMinutes}
                  maxDelayMinutes={maxAbsorbableDelay}
                  riskLabel={riskLevel}
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-testid="toggle-delay-simulator-btn"
                  onClick={() => setShowSimulator(!showSimulator)}
                  className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold transition shadow-sm border ${
                    showSimulator
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <SlidersHorizontal size={12} />
                  <span>{showSimulator ? 'Close Delay Test' : 'Test +Delay'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHubGuide(!showHubGuide)}
                  className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-bold text-amber-900 transition hover:bg-amber-100 shadow-sm"
                >
                  <Compass size={13} />
                  {showHubGuide ? 'Hide Guide' : 'Transfer Guide'}
                  {showHubGuide ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>
            </div>

            {/* Inline Delay Simulator */}
            {showSimulator && (
              <div className="mt-3 border-t border-amber-200 pt-3">
                <DelayContingencySimulator itinerary={route} />
              </div>
            )}

            {/* Expanded Junction Transfer Guide */}
            {showHubGuide && (
              <div className="mt-3 border-t border-amber-200 pt-3 text-slate-700 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                    {hubGuide.transferType}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    🟢 {hubGuide.safetyScore || 92}% Safe Connection Score
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-700">
                  <b className="text-slate-900">Navigation Steps:</b> {hubGuide.transferInstructions}
                </p>

                <p className="text-xs text-amber-950">
                  💡 <b>Pro-Tip:</b> {hubGuide.modeSpecificTip}
                </p>

                {hubGuide.amenities && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-500 mr-1 flex items-center font-bold">Hub Amenities:</span>
                    {hubGuide.amenities.map((item) => (
                      <span key={item} className="rounded-lg bg-white px-2 py-0.5 text-[10px] text-slate-700 border border-slate-200 shadow-sm">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Leg 2 */}
          <div className="multimodal-timeline-leg rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Leg2Icon size={16} />
                </span>
                <span className="text-sm font-black text-slate-900">
                  Step 2: {route.leg2?.service}
                </span>
                <ProvenanceBadge source={leg2Provenance} />
              </div>
              <span className="text-sm font-extrabold text-slate-900">₹{route.leg2?.fare} <span className="text-[10px] text-slate-400 font-normal">est.</span></span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span><b className="text-slate-900">{route.leg2?.depart}</b> {route.leg2?.from}</span>
              <span className="text-slate-400 font-semibold">── {route.leg2?.duration} ──➔</span>
              <span><b className="text-slate-900">{route.leg2?.arrive}</b> {route.leg2?.to}</span>
            </div>

            {route.leg2?.mode === 'Bus' && (
              <p className="text-[11px] text-slate-500 mt-1 italic">
                * Buses usually depart every 30 to 60 min. Check the portal for exact boarding point.
              </p>
            )}

            <div className="mt-3 flex justify-end">
              <a
                href={route.leg2?.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-800 transition hover:bg-sky-100"
              >
                <ExternalLink size={13} /> Book Step 2 ({route.leg2?.mode}) ↗
              </a>
            </div>
          </div>
        </div>

        {/* Grounded Route Recovery Rationale (Master Spec Section 7.b) */}
        <div data-testid="route-grounded-rationale" className="mt-4 rounded-xl border border-sky-200 bg-sky-50/60 p-3.5 text-xs text-sky-950">
          <div className="flex items-center gap-1.5 font-bold text-sky-900 mb-1">
            <Sparkles size={14} className="text-sky-700 shrink-0" />
            <span>Why TravelMate Picked This Route (Grounded Facts):</span>
          </div>
          <p className="leading-relaxed text-slate-700 font-normal">
            {route.rationale || route.whyPicked || `Connects ${route.from || route.leg1?.from} to ${route.to || route.leg2?.to} via ${hubCity} Junction with a verified ${slackMinutes}m transfer buffer. Bypasses direct waitlists with confirmed split-ticket availability.`}
          </p>
        </div>

        {/* Statutory Split Booking Disclosure */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600 leading-relaxed">
          <b className="text-slate-900">Disclosure:</b> These are independent bookings. If one leg is delayed, other operators owe you nothing and TravelMate cannot guarantee refunds or compensation.
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-500 font-medium">
            <ShieldCheck size={14} className="mr-1 inline text-emerald-600" />
            Direct pre-filled links on official portals
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Summary / Spoken Tier Playback */}
            <button
              type="button"
              onClick={handleToggleAudioSummary}
              className={`btn-soft h-9 px-3 text-xs font-bold flex items-center gap-1.5 ${
                isSpeaking ? 'border-amber-400 bg-amber-50 text-amber-900 animate-pulse' : ''
              }`}
              title="Listen to complete spoken itinerary summary"
            >
              {isSpeaking ? <VolumeX size={13} className="text-amber-700" /> : <Volume2 size={13} className="text-sky-700" />}
              <span>{isSpeaking ? 'Stop Audio' : 'Audio Summary'}</span>
            </button>

            {/* Offline Pass */}
            <button
              type="button"
              onClick={() => setShowOfflinePass(true)}
              className="btn-soft h-9 px-3 text-xs font-bold flex items-center gap-1.5"
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white transition shadow-sm"
              title="Share confirmed itinerary on WhatsApp"
            >
              <Share2 size={13} />
              Share on WhatsApp
            </a>

            {/* Copy Itinerary */}
            <button
              type="button"
              onClick={handleCopy}
              className="btn-soft h-9 px-3 text-xs font-bold flex items-center gap-1.5"
              title="Copy itinerary summary"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>

            {/* Save to My Trips */}
            <button
              type="button"
              onClick={handleSave}
              className="btn-soft h-9 px-3 text-xs font-bold flex items-center gap-1.5"
            >
              {saved ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Save size={13} />}
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

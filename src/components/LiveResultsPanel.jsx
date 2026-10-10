import { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bus,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  Plane,
  RefreshCw,
  Route,
  Save,
  SlidersHorizontal,
  Sparkles,
  TicketCheck,
  Train,
  Users,
  Volume2,
  VolumeX,
  CheckCircle2,
  Compass
} from 'lucide-react'
import BackupPlan from './BackupPlan'
import SourceBadge from './SourceBadge'
import { getProviderDeepLink } from '../data/transportData'
import { generateMultimodalRoutes } from '../utils/multimodalRouter'
import { speakRouteTier, stopSpeaking } from '../utils/voiceIntent'
import MultimodalTimelineCard from './MultimodalTimelineCard'
import StationHopperCard from './StationHopperCard'
import { generateStationHopperHacks } from '../utils/stationHopper'
import PnrPredictorModal from './PnrPredictorModal'
import WaitlistBypassContrast from './WaitlistBypassContrast'
import DelayContingencySimulator from './DelayContingencySimulator'
import { localDateIso } from '../utils/date'

const RouteMap = lazy(() => import('./RouteMap'))

const transportMeta = {
  Train: { icon: Train, label: 'Train' },
  Flight: { icon: Plane, label: 'Flight' },
  Bus: { icon: Bus, label: 'Bus' }
}

function displayValue(value, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback
  return value
}

function ResultCard({ item, transport, plan, onBook, onSave }) {
  const name = item.serviceName || item.service || item.trainName || item.flightNumber || item.operator || `${transport} option`
  const code = item.code || item.trainNo || item.trainNumber || item.flightNumber || item.serviceNumber || ''
  const fare = item.price || item.fare || item.amount
  const source = item.sourceBadge || 'Live API result'

  const departure = displayValue(item.departure || item.depart || item.departureTime, 'Schedule unavailable')
  const arrival = displayValue(item.arrival || item.arrive || item.arrivalTime, 'Schedule unavailable')
  const duration = displayValue(item.duration || item.travelTime, '—')
  const statusText = displayValue(item.status || item.availability, 'Check availability')
  const isAvailable = statusText.toLowerCase().includes('avail') || statusText.toLowerCase().includes('confirm')

  const directLink = getProviderDeepLink({
    transport,
    from: item.from || plan?.from,
    to: item.to || plan?.to,
    date: plan?.date,
    serviceCode: code,
    serviceName: name
  })

  return (
    <article className="live-result-card bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition">
      {/* Top Header Row: Service Name, Code & Fare */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 text-xs font-bold">
              {transport}
            </span>
            <SourceBadge label={source} />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{name}</h3>
          {code && <p className="text-xs font-semibold text-slate-500">{code} · {item.provider || 'Official Transit Provider'}</p>}
        </div>

        <div className="text-right">
          <div className="text-2xl font-black text-slate-900">
            {fare ? `₹${fare}` : 'Check Fare'}
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${
            isAvailable ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {isAvailable && <CheckCircle2 size={12} />}
            {statusText}
          </span>
        </div>
      </div>

      {/* Main Schedule & Timing Row */}
      <div className="my-5 grid grid-cols-3 items-center gap-2 text-center sm:text-left">
        <div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">{departure}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
            {item.from || item.source || plan?.from || 'Origin'}
          </div>
        </div>

        <div className="text-center px-2">
          <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center justify-center gap-1">
            <Clock size={12} />
            <span>{duration}</span>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-full h-0.5 bg-slate-200"></div>
            <div className="absolute w-2 h-2 rounded-full bg-sky-600"></div>
          </div>
          <div className="text-[11px] font-bold text-slate-400 mt-1">Direct</div>
        </div>

        <div className="text-right">
          <div className="text-xl sm:text-2xl font-black text-slate-900">{arrival}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">
            {item.to || item.destination || plan?.to || 'Destination'}
          </div>
        </div>
      </div>

      {/* Provider Verification Notice */}
      <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-600 mb-5 flex items-start gap-2">
        <span className="text-slate-400 mt-0.5 font-bold">ℹ</span>
        <span>{item.verification || 'Provider schedule row. Live seat availability and ticket issue must be finalized on the authorized portal.'}</span>
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        <button
          type="button"
          onClick={() => onBook(item)}
          data-testid="start-demo-booking-btn"
          className="btn-primary mobile-full h-11 text-sm font-bold flex items-center justify-center gap-2"
        >
          <TicketCheck size={16} />
          <span>Book on Portal</span>
        </button>

        <a
          href={directLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-soft mobile-full h-11 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 text-sky-700 hover:text-sky-800"
        >
          <span>Official Portal</span>
          <ExternalLink size={14} />
        </a>

        <button
          type="button"
          onClick={() => onSave?.(item)}
          className="btn-soft mobile-full h-11 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5"
        >
          <Save size={15} />
          <span>Save to Trips</span>
        </button>
      </div>
    </article>
  )
}

const filterOptions = [
  { id: 'all', label: 'All Options' },
  { id: 'contrast', label: 'Bypass Contrast' },
  { id: 'budget', label: 'Under ₹1,000 (Paisa Vasool)' },
  { id: 'balanced', label: 'Sub-₹2,000 (Balanced)' },
  { id: 'fastest', label: 'Fastest (< 12h)' },
  { id: 'map', label: 'Route Map' },
  { id: 'simulator', label: 'Delay Simulator' }
]

export default function LiveResultsPanel({
  open,
  onClose,
  plan,
  results = [],
  status = {},
  onRetry,
  onBookResult,
  onSaveResult,
  onBookBackup,
  allowBackup = true
}) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [showPnrModal, setShowPnrModal] = useState(false)
  const [isSpeakingTop, setIsSpeakingTop] = useState(false)

  const [recoveryTiers, setRecoveryTiers] = useState(null)
  const [recoveryLoading, setRecoveryLoading] = useState(false)

  useEffect(() => {
    if (!open || !plan?.from || !plan?.to) {
      setRecoveryTiers(null)
      return
    }

    let isSubscribed = true
    setRecoveryLoading(true)

    const params = new URLSearchParams({
      from: plan.from,
      to: plan.to,
      date: plan.date || localDateIso()
    })

    fetch(`/api/recovery?${params.toString()}`)
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (!isSubscribed) return
        if (json?.ok && Array.isArray(json.data?.rankedTiers) && json.data.rankedTiers.length > 0) {
          const mapped = json.data.rankedTiers.map(t => ({
            id: t.id,
            tier: t.tier,
            tierLabel: t.tierLabel,
            tierBadge: t.tier === 'paisa-vasool' ? 'Maximum Savings' : t.tier === 'smart-balanced' ? 'Comfort & Speed' : 'Saves 8+ Hours',
            totalFare: t.totalFare,
            fareFormatted: t.fareFormatted,
            totalDuration: t.totalDurationFormatted,
            totalDurationMin: t.totalDurationMin,
            hubCity: t.hubCity,
            transferBuffer: t.transfer?.durationFormatted ? `${t.transfer.durationFormatted} transfer buffer` : t.slackFormatted,
            slackMinutes: t.slackMinutes,
            mctMinutes: t.transfer?.mctMinutes || 45,
            riskLevel: t.reliability?.riskLevel || 'Safe',
            whyPicked: t.whyPicked,
            rationale: t.rationale,
            leg1: t.leg1 ? {
              legIndex: 1,
              mode: t.leg1.mode === 'train' ? 'Train' : t.leg1.mode === 'bus' ? 'Bus' : 'Flight',
              from: t.leg1.from,
              to: t.leg1.to,
              depart: t.leg1.depart,
              arrive: t.leg1.arrive,
              duration: t.leg1.durationFormatted,
              fare: t.leg1.fare,
              service: t.leg1.vehicleName ? `${t.leg1.vehicleName} (${t.leg1.vehicleNumber || ''})` : `${t.leg1.mode} service`,
              provenance: t.leg1.provenance || 'TIMETABLE',
              bookingLink: t.leg1.bookingLink
            } : null,
            leg2: t.leg2 ? {
              legIndex: 2,
              mode: t.leg2.mode === 'train' ? 'Train' : t.leg2.mode === 'bus' ? 'Bus' : 'Flight',
              from: t.leg2.from,
              to: t.leg2.to,
              depart: t.leg2.depart,
              arrive: t.leg2.arrive,
              duration: t.leg2.durationFormatted,
              fare: t.leg2.fare,
              service: t.leg2.vehicleName ? `${t.leg2.vehicleName} (${t.leg2.vehicleNumber || ''})` : `${t.leg2.mode} service`,
              provenance: t.leg2.provenance || (t.leg2.mode === 'train' ? 'TIMETABLE' : 'ESTIMATE'),
              bookingLink: t.leg2.bookingLink
            } : null
          }))
          setRecoveryTiers(mapped)
        } else {
          setRecoveryTiers(null)
        }
      })
      .catch(() => {
        if (isSubscribed) setRecoveryTiers(null)
      })
      .finally(() => {
        if (isSubscribed) setRecoveryLoading(false)
      })

    return () => {
      isSubscribed = false
    }
  }, [open, plan?.from, plan?.to, plan?.date])

  const fallbackRoutes = useMemo(() => {
    if (!open) return []
    return generateMultimodalRoutes({
      from: plan?.from,
      to: plan?.to,
      date: plan?.date,
      passengers: plan?.passengers || 1
    })
  }, [open, plan?.from, plan?.to, plan?.date, plan?.passengers])

  const multimodalRoutes = recoveryTiers && recoveryTiers.length > 0 ? recoveryTiers : fallbackRoutes

  const displayedMultimodalRoutes = useMemo(() => {
    if (!multimodalRoutes || multimodalRoutes.length === 0) return []
    if (activeFilter === 'budget') {
      return multimodalRoutes.filter(r => r.totalFare <= 1000)
    }
    if (activeFilter === 'balanced') {
      return multimodalRoutes.filter(r => r.totalFare <= 2000)
    }
    if (activeFilter === 'fastest') {
      return multimodalRoutes.filter(r => r.tier === 'emergency-express' || (r.totalDurationMin && r.totalDurationMin <= 720))
    }
    return multimodalRoutes
  }, [multimodalRoutes, activeFilter])

  // Sync plan filter if set from voice intent
  useEffect(() => {
    if (plan?.filter && ['budget', 'fastest', 'balanced', 'all', 'contrast', 'map', 'simulator'].includes(plan.filter)) {
      setActiveFilter(plan.filter)
    }
  }, [plan?.filter])

  // Stop speaking when panel closes or unmounts
  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [open])

  // Listen for voice events
  useEffect(() => {
    function handleVoiceFilter(e) {
      if (e.detail?.filter && ['budget', 'fastest', 'balanced', 'all', 'contrast', 'map', 'simulator'].includes(e.detail.filter)) {
        setActiveFilter(e.detail.filter)
      }
    }
    function handleVoiceReadTier(e) {
      const target = e.detail?.targetTier
      if (!multimodalRoutes || multimodalRoutes.length === 0) return
      let targetRoute = multimodalRoutes[0]
      if (target === 'emergency-express') {
        targetRoute = multimodalRoutes.find(r => r.tier === 'emergency-express') || multimodalRoutes[0]
      } else if (target === 'paisa-vasool') {
        targetRoute = multimodalRoutes.find(r => r.tier === 'paisa-vasool') || multimodalRoutes[0]
      } else if (target === 'smart-balanced') {
        targetRoute = multimodalRoutes.find(r => r.tier === 'smart-balanced') || multimodalRoutes[0]
      }
      if (targetRoute) {
        setIsSpeakingTop(true)
        speakRouteTier(targetRoute, {
          onEnd: () => setIsSpeakingTop(false),
          onError: () => setIsSpeakingTop(false)
        })
      }
    }

    window.addEventListener('travelmate:voice-filter', handleVoiceFilter)
    window.addEventListener('travelmate:voice-read-tier', handleVoiceReadTier)
    return () => {
      window.removeEventListener('travelmate:voice-filter', handleVoiceFilter)
      window.removeEventListener('travelmate:voice-read-tier', handleVoiceReadTier)
    }
  }, [multimodalRoutes])

  useEffect(() => {
    if (!open) return undefined
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  const stationHopperHacks = useMemo(() => {
    if (!open || plan?.transportMode !== 'Train') return []
    return generateStationHopperHacks({
      from: plan?.from,
      to: plan?.to,
      date: plan?.date
    })
  }, [open, plan?.from, plan?.to, plan?.date, plan?.transportMode])

  if (!open) return null

  const transport = plan.transportMode || 'Train'
  const MetaIcon = transportMeta[transport]?.icon || Train
  const loading = Boolean(status.loading)
  const hasResults = results.length > 0

  return (
    <div id="live-results-section" className="live-results-workspace mt-8 mb-12 max-w-6xl mx-auto" aria-labelledby="live-results-title">
      <section className="bg-slate-50 rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Results Header */}
        <header className="live-results-header bg-white border-b border-slate-200 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition"
          >
            <ArrowLeft size={16} />
            <span>Back to planner</span>
          </button>

          <div className="flex-1 min-w-[240px]">
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700 mb-0.5">Dedicated provider-results workspace</p>
            <h2 id="live-results-title" className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
              <MetaIcon size={22} className="text-sky-600" />
              <span>{plan.from || 'Origin'}</span>
              <ArrowRight size={18} className="text-slate-400" />
              <span>{plan.to || 'Destination'}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {plan.date} · {plan.passengers || 1} Traveller(s) · {transport}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPnrModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold hover:bg-sky-100 transition"
            >
              <Sparkles size={14} className="text-sky-600" />
              <span>Check PNR</span>
            </button>
            <button
              type="button"
              onClick={onRetry}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
            </button>
          </div>
        </header>

        {/* Results Body Layout */}
        <div className={`live-results-layout p-4 sm:p-8 grid gap-8 ${allowBackup ? "lg:grid-cols-[1fr,360px]" : "grid-cols-1"}`}>
          <main className="order-2 min-w-0 lg:order-1 space-y-6">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mr-1">
                <SlidersHorizontal size={13} /> View:
              </span>
              {filterOptions.map((filter) => {
                const isSelected = activeFilter === filter.id
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      isSelected
                        ? 'bg-sky-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                )
              })}
            </div>

            {/* Waitlist Bypass Contrast View */}
            {(activeFilter === 'all' || activeFilter === 'contrast') && (
              <WaitlistBypassContrast
                directRoute={results[0] || null}
                splitRoute={multimodalRoutes[0] || null}
                from={plan?.from || 'Origin'}
                to={plan?.to || 'Destination'}
                date={plan?.date}
              />
            )}

            {/* Route Map View Tab */}
            {activeFilter === 'map' && (
              <div className="my-2">
                <Suspense fallback={<div className="h-[340px] rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 text-sm">Loading route visualizer...</div>}>
                  <RouteMap plan={plan} />
                </Suspense>
              </div>
            )}

            {/* Delay Simulator Tab */}
            {activeFilter === 'simulator' && (
              <div className="my-2">
                <DelayContingencySimulator itinerary={multimodalRoutes[0] || null} />
              </div>
            )}

            {/* Multi-Modal Smart Combinations Section */}
            {activeFilter !== 'map' && activeFilter !== 'simulator' && multimodalRoutes.length > 0 && (
              <section className="multimodal-container bg-white rounded-3xl border border-sky-200 p-5 sm:p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold mb-1">
                      <Sparkles size={13} className="text-sky-600" />
                      <span>Split-Route Recovery Options</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-950">
                      Multi-Modal Journeys via Regional Junctions
                    </h3>
                    <p className="text-xs text-slate-500">
                      When direct seats are waitlisted, these multi-modal connections bypass the bottleneck via regional interchange hubs.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {displayedMultimodalRoutes.length > 0 && (
                      <button
                        type="button"
                        data-testid="voice-read-top-tier"
                        onClick={() => {
                          if (isSpeakingTop) {
                            stopSpeaking()
                            setIsSpeakingTop(false)
                          } else {
                            setIsSpeakingTop(true)
                            speakRouteTier(displayedMultimodalRoutes[0], {
                              onEnd: () => setIsSpeakingTop(false),
                              onError: () => setIsSpeakingTop(false)
                            })
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                          isSpeakingTop
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isSpeakingTop ? <VolumeX size={14} className="text-amber-600" /> : <Volume2 size={14} />}
                        <span>{isSpeakingTop ? 'Stop Audio' : 'Listen to Top Option'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Multimodal Cards */}
                <div className="mt-5 space-y-4">
                  {displayedMultimodalRoutes.map((route) => (
                    <MultimodalTimelineCard key={route.id} route={route} onSave={onSaveResult} />
                  ))}
                </div>
              </section>
            )}

            {/* Station Hopper Quota Hacks */}
            {activeFilter !== 'map' && activeFilter !== 'simulator' && stationHopperHacks.length > 0 && (
              <StationHopperCard
                hacks={stationHopperHacks}
                from={plan?.from}
                to={plan?.to}
              />
            )}

            {/* Direct Results Section */}
            {activeFilter !== 'map' && activeFilter !== 'simulator' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-slate-900">
                    Direct {transport} Services ({results.length})
                  </h3>
                  <SourceBadge label={hasResults ? 'Live Provider Result' : status.sourceBadge || 'Provider Status'} />
                </div>

                {status.error && (
                  <div data-testid="results-error-state" className="rounded-2xl border border-red-300 bg-red-50 p-6 text-center mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 mx-auto flex items-center justify-center mb-3">
                      <AlertTriangle size={24} />
                    </div>
                    <h4 className="text-base font-extrabold text-red-950">
                      Unable to load direct provider results
                    </h4>
                    <p className="text-sm text-red-700 max-w-lg mx-auto mt-1 leading-relaxed">
                      {status.error || 'The provider API is temporarily unreachable or returned an unexpected response.'}
                    </p>
                    <button
                      type="button"
                      data-testid="error-retry-btn"
                      onClick={onRetry}
                      className="btn-primary mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                    >
                      <RefreshCw size={14} />
                      <span>Retry provider search</span>
                    </button>
                  </div>
                )}

                {loading ? (
                  <div data-testid="results-skeleton-loader" className="grid gap-4 md:grid-cols-2">
                    {[0, 1].map((idx) => (
                      <div key={idx} className="h-48 rounded-2xl bg-white border border-slate-200 p-6 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                        <div className="h-8 bg-slate-200 rounded w-2/3 mb-4"></div>
                        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : hasResults ? (
                  <div className="grid gap-4">
                    {results.map((item, index) => (
                      <ResultCard
                        key={item.id || item.code || index}
                        item={item}
                        transport={transport}
                        plan={plan}
                        onBook={onBookResult}
                        onSave={onSaveResult}
                      />
                    ))}
                  </div>
                ) : (
                  <div data-testid="empty-direct-results" className="rounded-2xl border border-sky-200 bg-sky-50/60 p-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 mx-auto flex items-center justify-center mb-3">
                      <Sparkles size={24} />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      No direct {transport.toLowerCase()} seats available
                    </h4>
                    <p className="text-sm text-slate-600 max-w-lg mx-auto mt-1.5 leading-relaxed">
                      No direct {transport.toLowerCase()}s found. {multimodalRoutes.length > 0 ? `TravelMate found ${multimodalRoutes.length} alternative routes via regional transfer junctions above.` : "Try checking alternative travel dates or exploring the Tatkal emergency desk."}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-xs text-slate-600">
                  <b className="text-slate-900">Demo-booking notice:</b> Choose one provider row and use "Start demo booking" to attach that exact provider result to the saved plan and offline view, then start the guided demo checkout when ready.
                </div>
              </div>
            )}

            {/* Statutory Split Booking Disclosure */}
            <div
              data-testid="statutory-split-disclosure"
              className="rounded-2xl border border-slate-200 bg-slate-100/80 p-4 text-xs text-slate-600 leading-relaxed"
            >
              <b className="text-slate-900">Statutory Booking Notice:</b> These are independent bookings. If one leg is delayed, other operators owe you nothing and TravelMate cannot guarantee refunds or compensation. Always maintain safe transfer buffers.
            </div>
          </main>

          {/* Backup / Side Column */}
          {allowBackup && (
            <aside className="order-1 min-w-0 lg:order-2 space-y-6">
              <div className="sticky top-6">
                <BackupPlan plan={plan} compact onBookBackup={onBookBackup} />
              </div>
            </aside>
          )}
        </div>
      </section>

      <PnrPredictorModal open={showPnrModal} onClose={() => setShowPnrModal(false)} />
    </div>
  )
}

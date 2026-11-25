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
  Compass,
  Zap
} from 'lucide-react'
import BackupPlan from './BackupPlan'
import SourceBadge from './SourceBadge'
import ProvenanceBadge from './ProvenanceBadge'
import NearbyNodeLabel from './NearbyNodeLabel'
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

function displayValue(value, fallback = ': ') {
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
  const duration = displayValue(item.duration || item.travelTime, ': ')
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
    <article className="live-result-card bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition shadow-xs">
      {/* Top Row: Name + Schedule */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        
        {/* Left: Operator / Train Identity */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {code && <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 tabular">{code}</span>}
            <h3 className="text-[15px] font-bold text-gray-900 truncate">{name}</h3>
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-[#15803D] text-white">★ 4.6</span>
            {item.provenance ? <ProvenanceBadge provenance={item.provenance} /> : <SourceBadge label={source} />}
          </div>
          <p className="text-[12px] text-gray-500 mt-0.5">{item.provider || 'Official Transit'} • {item.onTime || 'Schedule Verified'}</p>
          {item.nearbyNote && <NearbyNodeLabel note={item.nearbyNote} distKm={item.nearbyDistKm ?? 0} />}
        </div>

        {/* Right: Clean Horizontal Time Display */}
        <div className="flex items-center gap-4 shrink-0">
          <div>
            <p className="text-[16px] font-bold text-gray-900 tabular">{departure}</p>
            <p className="text-[11px] text-gray-500 truncate max-w-[90px]">{item.from || item.source || plan?.from || 'Origin'}</p>
          </div>
          <div className="text-center w-24">
            <p className="text-[11px] text-gray-500 font-medium">{duration}</p>
            <div className="h-px bg-gray-300 my-1 relative">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] absolute left-1/2 -translate-x-1/2 -top-[2.5px]"></span>
            </div>
            <p className="text-[10px] text-gray-400">Direct</p>
          </div>
          <div className="text-right">
            <p className="text-[16px] font-bold text-gray-900 tabular">{arrival}</p>
            <p className="text-[11px] text-gray-500 truncate max-w-[90px]">{item.to || item.destination || plan?.to || 'Destination'}</p>
          </div>
        </div>
      </div>

      {/* Bottom Row: ConfirmTkt-Style Horizontal Fare / Class Availability Tiles + CTA */}
      <div className="pt-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <div className={`text-left border rounded-md px-3 py-1.5 transition ${isAvailable ? 'bg-[#EDF7F0] border-[#C6E8D1]' : 'bg-[#FEF7E6] border-[#F6DFB1]'}`}>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-gray-900">{transport} Standard</span>
              <span className="text-[13px] font-bold text-gray-900 tabular">{fare ? `₹${fare}` : 'Check Fare'}</span>
            </div>
            <p className={`text-[11px] font-semibold mt-0.5 ${isAvailable ? 'text-[#137333]' : 'text-[#A15C07]'}`}>{statusText}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onBook(item)}
            data-testid="start-demo-booking-btn"
            className="btn-primary mobile-full px-3.5 py-1.5 rounded bg-[#15803D] hover:bg-[#12733B] text-white text-[13px] font-semibold flex items-center gap-1.5"
          >
            <TicketCheck size={14} />
            <span>Book on Portal</span>
          </button>
          <a
            href={directLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-soft mobile-full px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 text-[12px] font-semibold flex items-center gap-1"
          >
            <span>Official Portal</span>
            <ExternalLink size={12} />
          </a>
          <button
            type="button"
            onClick={() => onSave?.(item)}
            className="btn-soft mobile-full p-2 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900"
            title="Save to Trips"
            aria-label="Save to Trips"
          >
            <Save size={14} />
          </button>
        </div>
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
  const transportPlural = transport === 'Flight' ? 'flights' : transport === 'Bus' ? 'buses' : 'trains'
  const MetaIcon = transportMeta[transport]?.icon || Train
  const loading = Boolean(status.loading)
  const hasResults = results.length > 0

  return (
    <div id="live-results-section" className="live-results-workspace mt-4 mb-10 max-w-6xl mx-auto" aria-labelledby="live-results-title">
      <section className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        {/* Results Header */}
        <header className="live-results-header bg-white border-b border-gray-200 px-4 sm:px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition"
          >
            <ArrowLeft size={14} />
            <span>Back to planner</span>
          </button>

          <div className="flex-1 min-w-0">
            <h2 id="live-results-title" className="text-base sm:text-lg font-bold text-gray-900 flex flex-wrap items-center gap-2">
              <MetaIcon size={18} className="text-[#15803D] shrink-0" />
              <span>{plan.from || 'Origin'}</span>
              <ArrowRight size={14} className="text-gray-400 shrink-0" />
              <span>{plan.to || 'Destination'}</span>
            </h2>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">
              {plan.date} · {plan.passengers || 1} Traveller(s) · {transport}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPnrModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold hover:bg-gray-100 transition"
            >
              <Sparkles size={13} className="text-[#15803D]" />
              <span>Check PNR</span>
            </button>
            <button
              type="button"
              onClick={onRetry}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#15803D] hover:bg-[#12733B] text-white text-xs font-semibold transition"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Refreshing…' : 'Refresh'}</span>
            </button>
          </div>
        </header>

        {/* Results Body Layout */}
        <div className={`live-results-layout p-4 sm:p-5 grid gap-5 ${allowBackup ? "lg:grid-cols-[1fr,340px]" : "grid-cols-1"}`}>
          <main className="order-2 min-w-0 lg:order-1 space-y-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-gray-50 p-1.5 rounded-md border border-gray-200 overflow-x-auto max-w-full text-xs">
              <span className="text-[11px] font-bold text-gray-500 flex items-center gap-1 shrink-0 px-2 uppercase tracking-wide">
                <SlidersHorizontal size={12} /> View:
              </span>
              <div className="flex items-center gap-1 shrink-0">
                {filterOptions.map((filter) => {
                  const isSelected = activeFilter === filter.id
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setActiveFilter(filter.id)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                        isSelected
                          ? 'bg-[#15803D] text-white font-semibold shadow-xs'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  )
                })}
              </div>
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
              <section className="multimodal-container bg-white rounded-lg border border-gray-200 p-5 sm:p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EDF7F0] text-[#137333] border border-[#C6E8D1] text-xs font-bold mb-1">
                      <Zap size={13} className="text-[#15803D]" />
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
                    <span>{transport === 'Flight' ? 'Direct Flight Services' : transport === 'Bus' ? 'Direct Bus Services' : 'Direct Train Services'}</span> ({results.length})
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
                ) : !status.error ? (
                  <div data-testid="empty-direct-results" className="rounded-2xl border border-sky-200 bg-sky-50/60 p-8 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 mx-auto flex items-center justify-center mb-3">
                      <Sparkles size={24} />
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900">
                      No direct {transport.toLowerCase()} seats available
                    </h4>
                    <p className="text-sm text-slate-600 max-w-lg mx-auto mt-1.5 leading-relaxed">
                      No direct {transportPlural} found. {displayedMultimodalRoutes.length > 0 ? `TravelMate found ${displayedMultimodalRoutes.length} alternative routes via regional transfer junctions above.` : "Try checking alternative travel dates or exploring the Tatkal emergency desk."}
                    </p>
                  </div>
                ) : null}

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
              <b className="text-slate-900">Independent Booking Notice:</b> Treat each selected leg as a separate booking. A delay on one leg may cause you to miss the next leg. Refund, rebooking, and compensation rights depend on the provider, ticket terms, and applicable law; TravelMate does not guarantee those remedies. Maintain a safe transfer buffer and confirm each provider&apos;s terms.
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

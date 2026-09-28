import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Bus, CalendarDays, ExternalLink, Plane, RefreshCw, Route, Save, SlidersHorizontal, Sparkles, TicketCheck, Train, Users } from 'lucide-react'
import BackupPlan from './BackupPlan'
import SourceBadge from './SourceBadge'
import { getProviderDeepLink } from '../data/transportData'
import { generateMultimodalRoutes } from '../utils/multimodalRouter'
import MultimodalTimelineCard from './MultimodalTimelineCard'

const transportMeta = {
  Train: { icon: Train, label: 'train' },
  Flight: { icon: Plane, label: 'flight' },
  Bus: { icon: Bus, label: 'bus' }
}

function displayValue(value, fallback = 'Check provider') {
  if (value === null || value === undefined || value === '') return fallback
  return value
}

function ResultCard({ item, transport, plan, onBook, onSave }) {
  const name = item.serviceName || item.service || item.trainName || item.flightNumber || item.operator || `${transport} option`
  const code = item.code || item.trainNo || item.trainNumber || item.flightNumber || item.serviceNumber || 'Provider code unavailable'
  const fare = item.price || item.fare || item.amount
  const source = item.sourceBadge || 'Live API result'

  const directLink = getProviderDeepLink({
    transport,
    from: item.from || plan?.from,
    to: item.to || plan?.to,
    date: plan?.date,
    serviceCode: code,
    serviceName: name
  })

  return (
    <article className="live-result-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-2">
            <SourceBadge label={source} />
            <SourceBadge label="Provider verification required" />
          </div>
          <h3 className="break-words text-lg font-black text-white">{name}</h3>
          <p className="mt-1 break-all text-xs text-slate-400">{code} · {item.provider || 'Configured provider'}</p>
        </div>
        <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">
          {fare ? `₹${fare}` : item.mode === 'live' ? 'Live row' : 'API row'}
        </span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <p><b className="text-cyan-100">From:</b> {displayValue(item.from || item.source)}</p>
        <p><b className="text-cyan-100">To:</b> {displayValue(item.to || item.destination)}</p>
        <p><b className="text-cyan-100">Departure:</b> {displayValue(item.departure || item.depart || item.departureTime)}</p>
        <p><b className="text-cyan-100">Arrival:</b> {displayValue(item.arrival || item.arrive || item.arrivalTime)}</p>
        <p><b className="text-cyan-100">Duration:</b> {displayValue(item.duration || item.travelTime)}</p>
        <p><b className="text-cyan-100">Status:</b> {displayValue(item.status || item.availability, 'Verify with provider')}</p>
      </div>

      <p className="mt-4 rounded-xl border border-yellow-300/20 bg-yellow-300/10 p-3 text-xs font-bold text-yellow-100">
        {item.verification || 'This is a provider information row. Fare, seat availability, payment, PNR and ticket issue must be confirmed on an authorized portal.'}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <button type="button" className="btn-primary mobile-full" onClick={() => onBook(item)}>
          <TicketCheck size={16} /> Start demo booking
        </button>
        <a
          href={directLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-soft mobile-full inline-flex items-center justify-center gap-2 font-bold text-cyan-200 hover:text-white"
        >
          <ExternalLink size={16} /> Book on {transport === 'Bus' ? 'RedBus' : transport === 'Flight' ? 'Google Flights' : 'ConfirmTkt'} ↗
        </a>
        <button type="button" className="btn-soft mobile-full" onClick={() => onSave?.(item)}>
          <Save size={16} /> Save plan
        </button>
      </div>
    </article>
  )
}

const filterOptions = [
  { id: 'all', label: 'All Options' },
  { id: 'budget', label: '🟢 Under ₹1,000 (Paisa Vasool)' },
  { id: 'balanced', label: '🔵 Sub-₹2,000 (Balanced)' },
  { id: 'fastest', label: '⚡ Fastest (< 12h)' }
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

  useEffect(() => {
    if (!open) return undefined
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = oldOverflow
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  const multimodalRoutes = useMemo(() => {
    if (!open) return []
    return generateMultimodalRoutes({
      from: plan?.from,
      to: plan?.to,
      date: plan?.date,
      passengers: plan?.passengers || 1
    })
  }, [open, plan?.from, plan?.to, plan?.date, plan?.passengers])

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

  if (!open) return null

  const transport = plan.transportMode || 'Train'
  const MetaIcon = transportMeta[transport]?.icon || Train
  const loading = Boolean(status.loading)
  const hasResults = results.length > 0
  const statusClass = hasResults
    ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
    : status.mode === 'invalid' || status.mode === 'error'
      ? 'border-red-400/30 bg-red-500/10 text-red-100'
      : 'border-yellow-300/25 bg-yellow-300/10 text-yellow-100'

  return (
    <div className="live-results-backdrop" role="dialog" aria-modal="true" aria-labelledby="live-results-title">
      <section className="live-results-workspace">
        <nav className="results-top-nav">
          <Link to="/" className="results-brand">TravelMate</Link>
          <div className="results-nav-links"><Link to="/planner">Search</Link><Link className="active" to="/saved">Trips</Link><Link to="/analyze">Assistant</Link><Link to="/safety">Safety</Link></div>
          <div className="results-nav-actions"><Link className="results-emergency" to="/safety">Emergency</Link><Link to="/">Login</Link></div>
        </nav>

        <header className="live-results-header">
          <button type="button" className="btn-soft shrink-0" onClick={onClose}>
            <ArrowLeft size={17} /> Back to planner
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Dedicated provider-results workspace</p>
            <h2 id="live-results-title" className="mt-1 break-words text-2xl font-black text-white sm:text-3xl">
              {transport} options · {plan.from || 'Origin'} → {plan.to || 'Destination'}
            </h2>
          </div>
          <button type="button" className="btn-primary shrink-0" onClick={onRetry} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> {loading ? 'Checking…' : 'Refresh'}
          </button>
        </header>

        <div className="live-results-summary">
          <span className="status-chip"><MetaIcon size={15} /> {transport}</span>
          <span className="status-chip"><Route size={15} /> {plan.from || 'Origin'} → {plan.to || 'Destination'}</span>
          <span className="status-chip"><CalendarDays size={15} /> {plan.date || 'Date not selected'}</span>
          <span className="status-chip"><Users size={15} /> {plan.passengers || 1} passenger(s)</span>
        </div>

        <div className={`live-results-layout ${allowBackup ? "" : "no-backup"}`}>
          <main className="order-2 min-w-0 lg:order-1">
            {multimodalRoutes.length > 0 && (
              <section className="multimodal-container mb-6 rounded-3xl border border-cyan-400/30 bg-slate-900/95 p-5 shadow-glow">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-400/20 pb-3">
                  <div>
                    <span style={{ color: '#22d3ee' }} className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider">
                      <Sparkles size={14} />
                      Smart Multimodal Alternatives
                    </span>
                    <h3 style={{ color: '#ffffff' }} className="mt-1 text-xl font-black">
                      Intelligent Combined Routes via Junction Hubs
                    </h3>
                    <p style={{ color: '#94a3b8' }} className="mt-1 text-xs">
                      If direct tickets are waitlisted, TravelMate stitched these confirmed combinations.
                    </p>
                  </div>
                  <span className="rounded-full bg-cyan-400/20 px-3 py-1 text-xs font-bold text-cyan-200">
                    {displayedMultimodalRoutes.length} of {multimodalRoutes.length} Ranked Options
                  </span>
                </div>

                {/* Filter Pills */}
                <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-cyan-400/10 pt-3">
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
                    <SlidersHorizontal size={13} className="text-cyan-400" />
                    Filter:
                  </span>
                  {filterOptions.map((filter) => {
                    const isSelected = activeFilter === filter.id
                    return (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setActiveFilter(filter.id)}
                        className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                          isSelected
                            ? 'bg-cyan-400 text-slate-950 shadow-md font-black'
                            : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                        }`}
                      >
                        {filter.label}
                      </button>
                    )
                  })}
                </div>

                <div className="mt-4 space-y-4">
                  {displayedMultimodalRoutes.length > 0 ? (
                    displayedMultimodalRoutes.map((route) => (
                      <MultimodalTimelineCard key={route.id} route={route} onSave={onSaveResult} />
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 p-6 text-center">
                      <p className="text-sm font-bold text-slate-300">
                        No routes match the "{filterOptions.find(f => f.id === activeFilter)?.label}" filter for this journey.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveFilter('all')}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/20 px-4 py-1.5 text-xs font-black text-cyan-300 hover:bg-cyan-500/30"
                      >
                        Show All Available Routes
                      </button>
                    </div>
                  )}
                </div>
              </section>
            )}

            <div className={`rounded-2xl border p-4 text-sm font-bold ${statusClass}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span>{loading ? `Checking the configured ${transport.toLowerCase()} provider…` : status.message || (hasResults ? `${results.length} provider result(s) loaded.` : 'No provider rows were returned.')}</span>
                <SourceBadge label={hasResults ? 'Live API result' : status.sourceBadge || 'Provider status'} />
              </div>
            </div>

            {loading ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[0, 1, 2, 3].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl border border-slate-700/70 bg-slate-900/70" />)}
              </div>
            ) : hasResults ? (
              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {results.map((item, index) => (
                  <ResultCard key={item.id || item.code || index} item={item} transport={transport} plan={plan} onBook={onBookResult} onSave={onSaveResult} />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-red-400/25 bg-red-500/10 p-5 text-red-50">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 shrink-0" size={20} />
                  <div>
                    <h3 className="font-black">No live ticket rows available</h3>
                    <p className="mt-1 text-sm text-red-100/85">Check station or airport codes, API subscription, quota and endpoint compatibility. Use the visible backup panel instead of scrolling to the bottom of the planner.</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm text-cyan-50">
              <b>Demo-booking notice:</b> Choose one provider row and use “Select & save this train” (or flight/bus). Attach that exact provider result to the saved plan and offline view, then start the guided demo checkout when ready. The demo asks for passenger, contact, preference, and payment-type details, but it never charges money or issues a seat, PNR, or ticket. Licensed direct booking is coming soon.
            </div>
          </main>

          {allowBackup && (
            <aside className="order-1 min-w-0 lg:order-2">
              <div className="live-results-backup-sticky">
                <BackupPlan plan={plan} compact onBookBackup={onBookBackup} />
              </div>
            </aside>
          )}
        </div>
      </section>
    </div>
  )
}

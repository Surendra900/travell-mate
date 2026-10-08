import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sparkles, Clock, Ticket } from 'lucide-react'
import NormalPlanner from '../planner/NormalPlanner'
import EmergencyTatkalPlanner from '../planner/EmergencyTatkalPlanner'
import LowNetworkPlanner from '../planner/LowNetworkPlanner'
import { attachPnrStatus, consumeLoadedPlan, saveOfflinePack, savePlan } from '../utils/storage'
import { calculateTravelScore } from '../utils/scoring'
import MasterTrustPanel from '../components/MasterTrustPanel'
import LiveResultsPanel from '../components/LiveResultsPanel'
import PnrPredictorModal from '../components/PnrPredictorModal'
import { getPNRStatus, searchLiveTransport } from '../services/LiveTransportApi'
import { localDateIso } from '../utils/date'
import { getCabinOptions, getProviderDeepLink } from '../data/transportData'

const basePlan = {
  from: '',
  to: '',
  transportMode: 'Train',
  routeCombo: 'Train only',
  airline: 'All',
  date: localDateIso(),
  ticketType: 'Normal',
  quota: 'Normal',
  classType: 'Sleeper (SL)',
  passengers: 1,
  budget: 1500,
  urgency: 'Normal',
  readinessScore: 0
}

function selectedServicePatch(service, transport, fallbackSource = 'Saved provider result') {
  const name = service?.serviceName || service?.service || service?.trainName || service?.name || service?.operator || `${transport} option`
  const code = service?.code || service?.trainNo || service?.trainNumber || service?.flightNumber || service?.serviceNumber || ''
  return {
    selectedService: service,
    selectedServiceCode: code,
    selectedServiceName: name,
    selectedProvider: service?.provider || '',
    liveVerification: service?.verification || '',
    sourceBadge: service?.sourceBadge || fallbackSource
  }
}

export default function Planner({ status, toast, language = 'en' }) {
  const location = useLocation()
  const [manualMode, setManualMode] = useState('normal')
  const [plan, setPlan] = useState(basePlan)
  const [resultsOpen, setResultsOpen] = useState(false)
  const [liveResults, setLiveResults] = useState([])
  const [liveStatus, setLiveStatus] = useState({ loading: false, mode: 'idle', message: '' })
  const [pendingVoiceAction, setPendingVoiceAction] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [showPnrModal, setShowPnrModal] = useState(false)

  const applyVoiceDetail = (detail = {}) => {
    if (detail.mode) setManualMode(detail.mode === 'emergency' ? 'tatkal' : detail.mode)
    if (detail.plan && Object.keys(detail.plan).length) {
      setPlan((old) => ({ ...old, ...detail.plan }))
    }
    setPendingVoiceAction({
      action: detail.action || 'fill-planner',
      plan: detail.plan || {},
      mode: detail.mode || null,
      filter: detail.filter || null,
      targetTier: detail.targetTier || null,
      token: Date.now()
    })
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const from = params.get('from') || ''
    const to = params.get('to') || ''
    const date = params.get('date') || ''
    const requestedMode = params.get('transportMode')
    const demoParam = params.get('demo') === 'true'
    const modeParam = params.get('mode')
    const urgency = params.get('urgency')

    if (demoParam) setIsDemoMode(true)
    if (modeParam === 'tatkal' || urgency === 'Emergency') {
      setManualMode('tatkal')
    } else if (modeParam === 'pnr') {
      setShowPnrModal(true)
    }

    const isTonight = urgency === 'Tonight' || params.get('urgent') === '12h'

    if (from || to || date || ['Train', 'Bus', 'Flight'].includes(requestedMode) || isTonight) {
      setPlan((old) => ({
        ...old,
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        ...(date ? { date } : isTonight ? { date: localDateIso() } : {}),
        ...(isTonight ? { urgency: 'Tonight' } : {}),
        ...(['Train', 'Bus', 'Flight'].includes(requestedMode) ? { transportMode: requestedMode, routeCombo: `${requestedMode} only`, classType: getCabinOptions(requestedMode)[0] } : {})
      }))
    }
  }, [location.search])

  useEffect(() => {
    const loaded = consumeLoadedPlan()
    if (loaded) {
      setPlan((old) => ({ ...old, ...loaded }))
      if (loaded.mode) setManualMode(loaded.mode)
      toast('Loaded saved plan into planner.')
    }

    try {
      const pending = JSON.parse(localStorage.getItem('travelmate-pending-voice-command'))
      if (pending) {
        localStorage.removeItem('travelmate-pending-voice-command')
        applyVoiceDetail(pending)
      }
    } catch {
      localStorage.removeItem('travelmate-pending-voice-command')
    }
  }, [toast])

  useEffect(() => {
    function handleVoiceUpdate(event) {
      applyVoiceDetail(event.detail || {})
    }

    window.addEventListener('travelmate:voice-planner', handleVoiceUpdate)
    return () => window.removeEventListener('travelmate:voice-planner', handleVoiceUpdate)
  }, [toast])



  useEffect(() => {
    if (!pendingVoiceAction) return undefined
    const request = pendingVoiceAction
    setPendingVoiceAction(null)

    const timer = window.setTimeout(async () => {
      const nextPlan = { ...enrichedPlan, ...request.plan }
      const action = request.action

      if (action === 'open-demo-booking') {
        openBooking(nextPlan)
        return
      }
      if (action === 'check-live') {
        setResultsOpen(true)
        await runLiveSearch(nextPlan)
        return
      }
      if (action === 'check-tatkal-live') {
        await runLiveSearch({
          ...nextPlan,
          transportMode: 'Train',
          routeCombo: 'Train only',
          ticketType: 'Tatkal / Emergency',
          quota: 'Tatkal / Emergency',
          urgency: 'Emergency'
        })
        return
      }
      if (action === 'apply-filter') {
        setResultsOpen(true)
        if (request.filter) {
          window.dispatchEvent(new CustomEvent('travelmate:voice-filter', { detail: { filter: request.filter } }))
        }
        return
      }
      if (action === 'show-backup') {
        setResultsOpen(true)
        return
      }
      if (action === 'read-tier') {
        setResultsOpen(true)
        window.dispatchEvent(new CustomEvent('travelmate:voice-read-tier', { detail: { targetTier: request.targetTier } }))
        return
      }
    }, 60)

    return () => window.clearTimeout(timer)
  }, [pendingVoiceAction])

  useEffect(() => {
    setLiveResults([])
    setLiveStatus({ loading: false, mode: 'idle', message: '' })
    setResultsOpen(false)
  }, [plan.transportMode, plan.from, plan.to, plan.date, plan.airline])

  useEffect(() => {
    try {
      localStorage.setItem('travelmate-current-plan', JSON.stringify({
        from: plan.from || '',
        to: plan.to || '',
        transportMode: plan.transportMode || 'Train',
        date: plan.date || '',
        updatedAt: new Date().toISOString()
      }))
    } catch {}
  }, [plan.from, plan.to, plan.transportMode, plan.date])

  const forcedOffline = status.online === false
  const forcedLowSignal = status.recommendedMode === 'low-network'
  const mode = (forcedOffline || forcedLowSignal) ? 'low-network' : manualMode
  const enrichedPlan = useMemo(() => ({
    ...plan,
    mode,
    readinessScore: plan.readinessScore || 0,
    travelScore: calculateTravelScore({ ...plan, mode })
  }), [plan, mode])

  function update(fields) {
    setPlan((old) => ({ ...old, ...fields }))
  }

  function routeReady(nextPlan = enrichedPlan) {
    return Boolean(String(nextPlan.from || '').trim() && String(nextPlan.to || '').trim())
  }

  function openBooking(nextPlan = enrichedPlan) {
    if (!routeReady(nextPlan)) {
      toast('Enter From and To before opening ticket booking.')
      return
    }
    const transport = nextPlan.transportMode || 'Train'
    const link = getProviderDeepLink({
      transport,
      from: nextPlan.from,
      to: nextPlan.to,
      date: nextPlan.date,
      serviceCode: nextPlan.selectedService?.code,
      serviceName: nextPlan.selectedService?.serviceName || nextPlan.selectedServiceName
    })
    if (typeof window !== 'undefined') {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
    toast(`Opening official booking portal (${transport}). Direct booking on operator site.`)
  }

  function openBackupBooking(combo, leg = null) {
    if (!routeReady()) {
      toast('Enter From and To before booking a backup leg.')
      return
    }
    const transportFromLeg = leg?.mode || enrichedPlan.transportMode
    const link = getProviderDeepLink({
      transport: transportFromLeg,
      from: leg?.from || enrichedPlan.from,
      to: leg?.to || enrichedPlan.to,
      date: enrichedPlan.date,
      serviceCode: leg?.code,
      serviceName: leg?.service
    })
    if (typeof window !== 'undefined') {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
    toast(`Opening official portal for backup leg (${transportFromLeg}).`)
  }

  function openServiceBooking(service, groupKey) {
    if (!routeReady()) {
      toast('Enter From and To before booking a ticket.')
      return
    }
    const transportFromGroup = groupKey === 'flights' ? 'Flight' : groupKey === 'buses' ? 'Bus' : 'Train'
    const selected = selectedServicePatch(service, transportFromGroup, 'Planning result')
    setPlan((current) => ({ ...current, ...selected, transportMode: transportFromGroup, routeCombo: `${transportFromGroup} only` }))
    const link = getProviderDeepLink({
      transport: transportFromGroup,
      from: enrichedPlan.from,
      to: enrichedPlan.to,
      date: enrichedPlan.date,
      serviceCode: selected.selectedServiceCode,
      serviceName: selected.selectedServiceName
    })
    setResultsOpen(false)
    if (typeof window !== 'undefined') {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
    toast(`Opening official portal for ${selected.selectedServiceName || transportFromGroup}.`)
  }

  async function runLiveSearch(nextPlan, { announce = true } = {}) {
    const transport = nextPlan.transportMode || 'Train'
    const from = nextPlan.from || ''
    const to = nextPlan.to || ''

    if (!from.trim() || !to.trim()) {
      const missingRoute = { ok: false, mode: 'invalid', results: [], message: 'Enter From and To first.' }
      if (announce) toast(missingRoute.message)
      return missingRoute
    }

    setLiveStatus({ loading: true, mode: 'checking', message: `Checking ${transport} provider endpoint...` })
    const data = await searchLiveTransport({
      transport,
      from,
      to,
      date: nextPlan.date,
      adults: nextPlan.passengers || 1,
      airline: nextPlan.airline || 'All'
    })
    const results = Array.isArray(data.results) ? data.results : []
    const normalized = { ...data, results }
    setLiveResults(results)
    setLiveStatus({
      loading: false,
      mode: data.mode || (data.ok ? 'ready' : 'fallback'),
      message: data.message || `${transport} provider checked.`,
      sourceBadge: data.sourceBadge
    })
    if (announce) {
      toast(results.length ? `${results.length} ${transport.toLowerCase()} provider result(s) loaded.` : data.message || `No ${transport.toLowerCase()} provider rows returned.`)
    }
    return normalized
  }

  async function handleLiveSearch() {
    setResultsOpen(true)
    return runLiveSearch(enrichedPlan)
  }

  async function handleTatkalLiveSearch() {
    return runLiveSearch({
      ...enrichedPlan,
      transportMode: 'Train',
      routeCombo: 'Train only',
      ticketType: 'Tatkal / Emergency',
      quota: 'Tatkal / Emergency',
      urgency: 'Emergency'
    })
  }

  async function handleAssistantPlanApplied(nextPlan) {
    return runLiveSearch({ ...enrichedPlan, ...nextPlan }, { announce: false })
  }

  function openLiveResultBooking(item) {
    const transport = enrichedPlan.transportMode || 'Train'
    const selected = selectedServicePatch(
      item,
      transport,
      liveStatus.mode === 'live' ? 'Live API result' : 'Provider status'
    )
    const link = getProviderDeepLink({
      transport,
      from: item.from || enrichedPlan.from,
      to: item.to || enrichedPlan.to,
      date: enrichedPlan.date,
      serviceCode: selected.selectedServiceCode,
      serviceName: selected.selectedServiceName
    })
    if (typeof window !== 'undefined') {
      window.open(link, '_blank', 'noopener,noreferrer')
    }
    toast(`Opening official portal for ${selected.selectedServiceName || transport}.`)
  }

  function saveLiveResult(item) {
    const transport = enrichedPlan.transportMode || 'Train'
    const selected = selectedServicePatch(
      item,
      transport,
      liveStatus.mode === 'live' ? 'Live API result' : 'Provider status'
    )
    const saved = savePlan({ ...enrichedPlan, ...selected })
    setPlan((current) => ({ ...current, ...selected, id: saved.id }))
    toast(`${saved.selectedService?.serviceName || `${transport} option`} saved with this plan and available in offline mode.`)
  }

  async function handleBookingSaved(completedPlan) {
    if (!completedPlan?.selectedService) {
      toast('Select a specific train, flight or bus before saving a booking.')
      return
    }

    let saved = savePlan(completedPlan)

    if (saved.pnrNumber && (typeof navigator === 'undefined' || navigator.onLine !== false)) {
      const data = await getPNRStatus({ pnr: saved.pnrNumber })
      if (data.result) saved = attachPnrStatus(saved, data.result) || saved
    }

    saveOfflinePack()
    setPlan((current) => ({
      ...current,
      id: saved.id,
      selectedService: saved.selectedService,
      selectedServiceName: saved.selectedServiceName,
      selectedServiceCode: saved.selectedServiceCode,
      pnrNumber: saved.pnrNumber,
      pnrStatus: saved.pnrStatus,
      bookingReference: saved.bookingReference,
      bookingStatus: saved.bookingStatus
    }))

    toast(saved.pnrNumber
      ? 'Booking PNR and latest status were saved automatically for Saved Plans and offline mode.'
      : 'The selected service was saved. This demo does not issue a real PNR; an authorized booking response will attach it automatically.')
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
      <section className="flex flex-col items-stretch justify-between gap-5 lg:flex-row lg:items-end pb-6 border-b border-slate-200">
        <div>
          <span className="badge">Network: {(forcedOffline || forcedLowSignal) ? 'automatic low-network' : 'online'}</span>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            {manualMode === 'tatkal' || manualMode === 'emergency' ? 'Tatkal Desk' : 'Journey Planner'}
          </h1>
          <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-600">
            {manualMode === 'tatkal' || manualMode === 'emergency'
              ? 'Dual-window countdown, verified Tatkal Quota availability, and local passenger preparation.'
              : 'Plan train, flight and bus journeys with verified provider schedules and smart split-routing alternatives.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            data-testid="planner-pnr-status-btn"
            onClick={() => setShowPnrModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold transition shadow-xs"
          >
            <Ticket size={14} className="text-sky-600" />
            <span>Check PNR Status</span>
          </button>

          <div className="planner-mode-tabs bg-white border border-slate-200 shadow-sm grid grid-cols-2 gap-1.5 rounded-2xl p-1.5">
            {[
              ['normal', 'Route Finder'],
              ['tatkal', 'Tatkal Desk']
            ].map(([value, label]) => {
              const active = manualMode === value || (value === 'tatkal' && manualMode === 'emergency')
              const isTatkalTab = value === 'tatkal'
              return (
                <button
                  key={value}
                  type="button"
                  data-testid={`planner-tab-${value}`}
                  className={`min-h-11 rounded-xl px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm transition ${
                    active
                      ? isTatkalTab
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-sky-700 text-white shadow-sm'
                      : isTatkalTab
                        ? 'border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100'
                        : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  onClick={() => !(forcedOffline || forcedLowSignal) && setManualMode(value)}
                  disabled={forcedOffline || forcedLowSignal}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Urgent Departure Mode Active Banner (Master Spec Section 8) */}
      {plan.urgency === 'Tonight' && manualMode !== 'tatkal' && (
        <div
          data-testid="urgent-tonight-banner"
          className="mt-6 rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 text-amber-950 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>Urgent Departure Preset Active (12h)</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  DEPART TONIGHT
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Prioritizing multimodal recovery routes departing within the next 12 hours from current time.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPlan((p) => ({ ...p, urgency: 'Normal' }))}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 transition shrink-0"
          >
            Reset to All Departures
          </button>
        </div>
      )}

      {isDemoMode && (
        <div
          data-testid="demo-mode-banner"
          className="mt-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="text-sm font-black text-amber-950 flex items-center gap-2">
                <span>Demo scenario: illustrative availability</span>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  DEMO MODE
                </span>
              </div>
              <p className="text-xs text-amber-800 mt-0.5">
                Timetable schedules and junction transfers are real computed facts from the canonical graph. Seat availability statuses are illustrative for demonstration purposes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsDemoMode(false)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 transition shrink-0"
          >
            Exit Demo Mode
          </button>
        </div>
      )}

      {(forcedOffline || forcedLowSignal) && (
        <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-5 text-red-900">
          <h2 className="text-lg font-black">Automatic Offline Shift Enabled</h2>
          <p className="mt-1 text-sm text-red-800">The connection is unavailable or too weak for reliable live results. TravelMate has automatically switched to its compact low-network experience using cached route data and local storage.</p>
        </div>
      )}

      <section className="mt-6">
        {mode === 'tatkal' || mode === 'emergency' ? (
          <EmergencyTatkalPlanner
            plan={enrichedPlan}
            update={update}
            onBook={() => openBooking()}
            onBookService={openServiceBooking}
            onBookBackup={undefined}
            onFindLiveTrains={handleTatkalLiveSearch}
            onOpenLiveResults={() => setResultsOpen(true)}
            liveResults={liveResults}
            liveStatus={liveStatus}
            toast={toast}
          />
        ) : mode === 'low-network' ? (
          <LowNetworkPlanner plan={enrichedPlan} update={update} onBook={() => openBooking()} onBookService={openServiceBooking} toast={toast} status={status} />
        ) : (
          <NormalPlanner plan={enrichedPlan} update={update} onBook={() => openBooking()} onFindTicket={handleLiveSearch} onOpenLiveResults={() => setResultsOpen(true)} onBookBackup={openBackupBooking} liveStatus={liveStatus} resultsOpen={resultsOpen} toast={toast} />
        )}
      </section>

      <div className="mt-12">
        <MasterTrustPanel compact />
      </div>

      <LiveResultsPanel
        open={resultsOpen}
        onClose={() => setResultsOpen(false)}
        plan={enrichedPlan}
        results={liveResults}
        status={liveStatus}
        onRetry={handleLiveSearch}
        onBookResult={openLiveResultBooking}
        onSaveResult={saveLiveResult}
        onBookBackup={openBackupBooking}
        allowBackup={manualMode !== 'tatkal' && manualMode !== 'emergency'}
      />

      <PnrPredictorModal
        open={showPnrModal}
        onClose={() => setShowPnrModal(false)}
      />
    </main>
  )
}

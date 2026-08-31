import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import BookingModal from '../components/BookingModal'
import NormalPlanner from '../planner/NormalPlanner'
import EmergencyTatkalPlanner from '../planner/EmergencyTatkalPlanner'
import LowNetworkPlanner from '../planner/LowNetworkPlanner'
import { attachPnrStatus, consumeLoadedPlan, saveOfflinePack, savePlan } from '../utils/storage'
import { calculateTravelScore } from '../utils/scoring'
import SmartAssistant from '../components/SmartAssistant'
import MasterTrustPanel from '../components/MasterTrustPanel'
import LiveResultsPanel from '../components/LiveResultsPanel'
import { getPNRStatus, searchLiveTransport } from '../services/LiveTransportApi'
import { localDateIso } from '../utils/date'
import { getCabinOptions } from '../data/transportData'

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
  const [bookingOpen, setBookingOpen] = useState(false)
  const [bookingPlan, setBookingPlan] = useState(null)
  const [resultsOpen, setResultsOpen] = useState(false)
  const [liveResults, setLiveResults] = useState([])
  const [liveStatus, setLiveStatus] = useState({ loading: false, mode: 'idle', message: '' })
  const [pendingVoiceAction, setPendingVoiceAction] = useState(null)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const from = params.get('from') || ''
    const to = params.get('to') || ''
    const date = params.get('date') || ''
    const requestedMode = params.get('transportMode')
    if (from || to || date || ['Train', 'Bus', 'Flight'].includes(requestedMode)) {
      setPlan((old) => ({
        ...old,
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        ...(date ? { date } : {}),
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

  function applyVoiceDetail(detail = {}) {
    if (detail.mode) setManualMode(detail.mode)
    if (detail.plan && Object.keys(detail.plan).length) {
      setPlan((old) => ({ ...old, ...detail.plan }))
    }
    setPendingVoiceAction({
      action: detail.action || 'fill-planner',
      plan: detail.plan || {},
      mode: detail.mode || null,
      token: Date.now()
    })
  }



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
    setBookingPlan(nextPlan)
    setBookingOpen(true)
  }

  function openBackupBooking(combo, leg = null) {
    if (!routeReady()) {
      toast('Enter From and To before booking a backup leg.')
      return
    }
    const transportFromLeg = leg?.mode || enrichedPlan.transportMode
    setBookingPlan({
      ...enrichedPlan,
      transportMode: transportFromLeg,
      routeCombo: combo?.label || enrichedPlan.routeCombo,
      selectedBackup: combo,
      selectedService: leg ? { ...leg, service: leg.service, code: leg.code } : undefined,
      selectedProvider: leg ? `Backup leg ${leg.leg}` : 'Local backup recommendation'
    })
    setBookingOpen(true)
  }

  function openServiceBooking(service, groupKey) {
    if (!routeReady()) {
      toast('Enter From and To before booking a ticket.')
      return
    }
    const transportFromGroup = groupKey === 'flights' ? 'Flight' : groupKey === 'buses' ? 'Bus' : 'Train'
    const selected = selectedServicePatch(service, transportFromGroup, 'Planning result')
    setPlan((current) => ({ ...current, ...selected, transportMode: transportFromGroup, routeCombo: `${transportFromGroup} only` }))
    setBookingPlan({
      ...enrichedPlan,
      ...selected,
      transportMode: transportFromGroup,
      routeCombo: `${transportFromGroup} only`
    })
    setResultsOpen(false)
    setBookingOpen(true)
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
    const selected = selectedServicePatch(
      item,
      enrichedPlan.transportMode || 'Train',
      liveStatus.mode === 'live' ? 'Live API result' : 'Provider status'
    )
    setPlan((current) => ({ ...current, ...selected }))
    setBookingPlan({ ...enrichedPlan, ...selected })
    setBookingOpen(true)
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
    <main className="mx-auto max-w-7xl px-4 py-7 sm:py-10">
      <section className="flex flex-col items-stretch justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <span className="badge">Network: {(forcedOffline || forcedLowSignal) ? 'automatic low-network' : 'online'}</span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">Journey Planner</h1>
          <p className="mt-2 max-w-3xl text-slate-300">Plan train, flight and bus journeys with live provider checks where available. Every result is labeled as live, verified, fallback, or provider-required.</p>
        </div>
        <div className="planner-mode-tabs glass grid grid-cols-2 gap-1 rounded-2xl p-2">
          {[
            ['normal', 'Normal tickets'],
            ['emergency', 'Tatkal emergency']
          ].map(([value, label]) => {
            const active = manualMode === value
            const emergencyTab = value === 'emergency'
            return (
              <button
                key={value}
                className={`min-h-11 rounded-xl px-2 py-2 text-xs font-bold sm:px-3 sm:text-sm ${
                  active
                    ? emergencyTab ? 'bg-red-500 text-white shadow-danger' : 'bg-cyan-400 text-slate-950'
                    : emergencyTab ? 'border border-red-400/40 bg-red-500/10 text-red-100 hover:bg-red-500/20' : 'text-slate-300 hover:bg-slate-800'
                }`}
                onClick={() => !(forcedOffline || forcedLowSignal) && setManualMode(value)}
                disabled={forcedOffline || forcedLowSignal}
              >
                {label}
              </button>
            )
          })}
        </div>
      </section>

      {(forcedOffline || forcedLowSignal) && (
        <div className="mt-6 rounded-3xl border border-red-400/30 bg-red-500/10 p-5 text-red-50">
          <h2 className="text-xl font-black">Automatic Offline Shift Enabled</h2>
          <p className="mt-2 text-sm text-red-100/90">The connection is unavailable or too weak for reliable live results. TravelMate has automatically switched to its compact low-network experience using cached route data and local storage. No manual mode switch is required.</p>
        </div>
      )}

      <div className="mt-8">
        <MasterTrustPanel compact />
      </div>

      <section className="mt-8">
        {mode === 'emergency' ? (
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
          <NormalPlanner plan={enrichedPlan} update={update} onBook={() => openBooking()} onFindTicket={handleLiveSearch} onOpenLiveResults={() => setResultsOpen(true)} onBookBackup={openBackupBooking} liveStatus={liveStatus} toast={toast} />
        )}
      </section>

      <BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} plan={bookingPlan || enrichedPlan} mode={mode} onSaved={handleBookingSaved} />
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
        allowBackup={manualMode !== 'emergency'}
      />
      <SmartAssistant plan={enrichedPlan} update={update} setManualMode={setManualMode} onPlanApplied={handleAssistantPlanApplied} toast={toast} language={language} />
    </main>
  )
}

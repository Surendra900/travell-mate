import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Bell, Clock, ExternalLink, LoaderCircle, RefreshCw, Ticket, TrainFront, Wifi } from 'lucide-react'
import { tatkalRules } from '../data/journeyData'
import { getCabinOptions, getRouteInputLabels, servicesForMode, transportPlaces } from '../data/transportData'
import TatkalEmergencyTimer from '../components/TatkalEmergencyTimer'
import SeatAvailabilityChecker from './SeatAvailabilityChecker'
import SourceBadge from '../components/SourceBadge'

function Field({ label, children }) {
  return <label className="block text-sm font-bold text-red-100"><span className="mb-2 block">{label}</span>{children}</label>
}

const cityOptions = transportPlaces.map((item) => item.city)

function trainClassOptions() {
  return getCabinOptions('Train').filter((item) => !item.toLowerCase().includes('general'))
}

function isTatkalWindowOpen(classType = '') {
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const isAc = /(ac|cc|ec|1a|2a|3a|3e)/i.test(classType)
  const start = isAc ? 10 * 60 : 11 * 60
  const end = start + 60
  return {
    isAc,
    open: currentMinutes >= start && currentMinutes <= end,
    startText: isAc ? '10:00 AM for AC Tatkal' : '11:00 AM for Non-AC Tatkal',
    alarm5: isAc ? '9:55 AM' : '10:55 AM',
    alarm10: isAc ? '9:50 AM' : '10:50 AM'
  }
}

function trainKey(item = {}, index = 0) {
  return String(item.id || item.code || `${item.service || item.serviceName || 'train'}-${index}`)
}

function normalizedCabins(item = {}) {
  const value = item.cabins || item.classes || []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return value.split(/[,/|]/).map((entry) => entry.trim()).filter(Boolean)
  return []
}

function displayFare(item = {}) {
  const value = item.price ?? item.fare
  return value === null || value === undefined || value === '' ? 'Check provider' : `₹${value}`
}

export default function EmergencyTatkalPlanner({
  plan,
  update,
  onBookService,
  onFindLiveTrains,
  onOpenLiveResults,
  liveResults = [],
  liveStatus = {},
  toast
}) {
  const routeLabels = getRouteInputLabels('Train')
  const [targetTrainKey, setTargetTrainKey] = useState('')
  const localTrainServices = useMemo(
    () => servicesForMode({ ...plan, transportMode: 'Train' }, 'Train'),
    [plan.from, plan.to, plan.date, plan.budget]
  )
  const liveTatkalTrains = useMemo(
    () => (Array.isArray(liveResults) ? liveResults : []).filter((item) => !item.type || String(item.type).toLowerCase() === 'train'),
    [liveResults]
  )
  const hasLiveRows = liveStatus.mode === 'live' && liveTatkalTrains.length > 0
  const displayTrains = hasLiveRows ? liveTatkalTrains : localTrainServices
  const selectedTatkalTrain = displayTrains.find((item, index) => trainKey(item, index) === targetTrainKey) || null
  const bestTatkalTrain = displayTrains.slice().sort((a, b) => Number(b.reliability || 0) - Number(a.reliability || 0))[0] || null
  const emergencyClass = trainClassOptions().includes(plan.classType) ? plan.classType : 'Sleeper (SL)'
  const tatkalWindow = isTatkalWindowOpen(emergencyClass)
  const routeReady = Boolean(String(plan.from || '').trim() && String(plan.to || '').trim())
  const urgentPlan = {
    ...plan,
    transportMode: 'Train',
    routeCombo: 'Train only',
    classType: emergencyClass,
    ticketType: 'Tatkal / Emergency',
    quota: 'Tatkal / Emergency',
    urgency: 'Emergency',
    selectedService: selectedTatkalTrain || plan.selectedService || null
  }

  useEffect(() => {
    if (plan.transportMode !== 'Train' || plan.routeCombo !== 'Train only' || plan.ticketType !== 'Tatkal / Emergency') {
      update({
        transportMode: 'Train',
        routeCombo: 'Train only',
        ticketType: 'Tatkal / Emergency',
        quota: 'Tatkal / Emergency',
        urgency: 'Emergency',
        classType: emergencyClass
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setTargetTrainKey('')
  }, [plan.from, plan.to, plan.date, emergencyClass])

  useEffect(() => {
    if (hasLiveRows && liveTatkalTrains.length === 1) setTargetTrainKey(trainKey(liveTatkalTrains[0], 0))
  }, [hasLiveRows, liveTatkalTrains])

  function setAlarm(minutes) {
    toast?.(`Tatkal alarm prepared ${minutes} minutes before ${tatkalWindow.startText}. Browser alarm is a demo reminder; use a phone alarm for real booking.`)
  }

  function bookSelectedTrain(service = selectedTatkalTrain) {
    if (!service) {
      toast?.('Select a train first and verify the live provider details before proceeding.')
      return
    }
    onBookService?.(service, 'trains')
  }

  async function checkLiveTatkalTrains() {
    if (!routeReady) {
      toast?.('Enter From and To before checking live Tatkal trains.')
      return
    }
    setTargetTrainKey('')
    await onFindLiveTrains?.()
  }

  return (
    <div className="tatkal-layout">
      <div className="danger-glass rounded-3xl p-6 shadow-danger">
        <span className="badge border-red-400/30 bg-red-400/10 text-red-100"><AlertTriangle size={14} /> Emergency Mode · Tatkal trains only</span>
        <h2 className="mt-4 text-3xl font-black text-white">Tatkal train booking preparation</h2>
        <p className="mt-2 text-sm text-red-100/85">Enter the route and check the live train provider. TravelMate can list live route trains and then check Tatkal quota seat/WL data for a selected train when the configured provider supports that endpoint.</p>

        <datalist id="emergency-city-list">
          {cityOptions.map((city) => <option key={city} value={city} />)}
        </datalist>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label={routeLabels.from}><input list="emergency-city-list" className="input" value={plan.from} placeholder={routeLabels.fromPlaceholder} onChange={(e) => update({ from: e.target.value })} /></Field>
          <Field label={routeLabels.to}><input list="emergency-city-list" className="input" value={plan.to} placeholder={routeLabels.toPlaceholder} onChange={(e) => update({ to: e.target.value })} /></Field>
          <Field label="Date"><input className="input date-input" type="date" value={plan.date} onChange={(e) => update({ date: e.target.value })} /></Field>
          <Field label="Class"><select className="input" value={emergencyClass} onChange={(e) => update({ classType: e.target.value })}>{trainClassOptions().map((item) => <option key={item}>{item}</option>)}</select><span className="mt-1 block text-xs text-red-100/60">General / Unreserved is hidden because this mode is for Tatkal preparation.</span></Field>
          <Field label="Passengers"><select className="input" value={Number(plan.passengers || 1)} onChange={(e) => update({ passengers: Number(e.target.value) })}>{[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count}</option>)}</select></Field>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button className="btn-danger inline-flex min-h-12 items-center justify-center gap-2" type="button" onClick={checkLiveTatkalTrains} disabled={Boolean(liveStatus.loading)}>
            {liveStatus.loading ? <LoaderCircle className="animate-spin" size={18} /> : <Wifi size={18} />}
            {liveStatus.loading ? 'Checking live trains...' : 'Check live Tatkal trains'}
          </button>
          <button className="btn-soft inline-flex min-h-12 items-center justify-center gap-2" type="button" onClick={() => onOpenLiveResults?.()} disabled={!liveTatkalTrains.length}>
            <ExternalLink size={18} /> Open full live results
          </button>
        </div>

        <div className={`mt-4 rounded-2xl border p-4 text-sm ${hasLiveRows ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100' : liveStatus.mode === 'provider-error' || liveStatus.mode === 'provider-unconfigured' ? 'border-yellow-300/30 bg-yellow-400/10 text-yellow-100' : 'border-slate-700 bg-slate-950/60 text-slate-300'}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-black">{hasLiveRows ? `${liveTatkalTrains.length} live route train(s) returned` : liveStatus.loading ? 'Live provider check in progress' : 'Live Tatkal route check'}</p>
            <SourceBadge label={hasLiveRows ? 'Live API result' : liveStatus.sourceBadge || 'Provider check required'} />
          </div>
          <p className="mt-2">{liveStatus.message || 'Enter the route and press Check live Tatkal trains. The app does not call the provider automatically, which avoids wasting your API quota.'}</p>
          <p className="mt-2 text-xs font-bold">A train appearing in the route list does not by itself prove Tatkal seats are available. Select a live train and use the Tatkal seat/WL checker below.</p>
        </div>

        <div className="mt-5 rounded-2xl border border-orange-300/30 bg-slate-950/60 p-4 text-sm text-orange-100">
          <p className="flex items-center gap-2 font-black text-white"><Clock size={18} /> Tatkal release window</p>
          <p className="mt-2">{tatkalWindow.open ? 'Tatkal window is currently open for this class reminder.' : `Tatkal tickets are not released right now. Booking normally opens at ${tatkalWindow.startText}.`}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn-soft" onClick={() => setAlarm(5)}><Bell size={16} /> Set alarm 5 min before · {tatkalWindow.alarm5}</button>
            <button className="btn-soft" onClick={() => setAlarm(10)}><Bell size={16} /> Set alarm 10 min before · {tatkalWindow.alarm10}</button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn-danger inline-flex items-center gap-2" onClick={() => bookSelectedTrain()}><Ticket size={18} />Prepare selected train →</button>
          {bestTatkalTrain && <button className="btn-soft" onClick={() => { const index = displayTrains.indexOf(bestTatkalTrain); setTargetTrainKey(trainKey(bestTatkalTrain, index)); toast?.(`${bestTatkalTrain.service || bestTatkalTrain.serviceName} selected.`) }}><TrainFront size={16} /> Select first/best result</button>}
        </div>
      </div>

      <div className="grid gap-5">
        <TatkalEmergencyTimer classType={emergencyClass} />

        <div className="danger-glass rounded-3xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-white">{hasLiveRows ? 'Live trains for Tatkal preparation' : 'Tatkal planning examples'}</h3>
              <p className="mt-1 text-sm text-red-100/80">{hasLiveRows ? 'These rows came from the configured train API. Select one and check TQ seat/WL status below.' : 'No live rows are loaded. These local rows are planning examples, not current trains or seat inventory.'}</p>
            </div>
            <span className="rounded-full bg-red-500/20 px-4 py-2 text-sm font-black text-red-100">{displayTrains.length} trains</span>
          </div>
          <div className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
            {displayTrains.length === 0 && <p className="rounded-2xl border border-yellow-300/25 bg-yellow-400/10 p-4 text-sm font-bold text-yellow-100">No train rows are available. Check the route, date, provider subscription, host and endpoint configuration.</p>}
            {displayTrains.map((item, index) => {
              const key = trainKey(item, index)
              const selected = targetTrainKey === key
              const cabins = normalizedCabins(item)
              return (
                <article key={key} className={`rounded-2xl border p-4 text-sm ${selected ? 'border-emerald-300 bg-emerald-400/10' : 'border-red-300/20 bg-slate-950/60'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="mb-2 flex flex-wrap gap-2"><SourceBadge label={hasLiveRows ? item.sourceBadge || 'Live API result' : item.sourceBadge || 'Local planning dataset'} />{!hasLiveRows && <SourceBadge label="Provider verification required" />}</div>
                      <h4 className="font-black text-white">{item.service || item.serviceName || 'Train option'}</h4>
                      <p className="mt-1 text-xs text-slate-300">{item.from || plan.from} → {item.to || plan.to}</p>
                    </div>
                    <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">{displayFare(item)}</span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-red-50/90 sm:grid-cols-2">
                    <p><b>Train number:</b> {item.code || 'Provider did not return'}</p>
                    <p><b>Depart:</b> {item.depart || item.departure || 'Check provider'}</p>
                    <p><b>Arrive:</b> {item.arrive || item.arrival || 'Check provider'}</p>
                    <p><b>Classes:</b> {cabins.length ? cabins.join(', ') : 'Check provider'}</p>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">{item.verification || (hasLiveRows ? 'Live route row. Tatkal seats, fare and final booking still require a separate provider check.' : 'Local planning example only.')}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-100" onClick={() => setTargetTrainKey(key)}>{selected ? 'Selected train' : 'Select train'}</button>
                    <button className="rounded-xl border border-orange-300/30 bg-orange-400/10 px-3 py-2 text-xs font-black text-orange-100" onClick={() => { setTargetTrainKey(key); bookSelectedTrain(item) }}><Ticket className="mr-1 inline" size={14} />Start Tatkal booking demo</button>
                  </div>
                </article>
              )
            })}
          </div>
          {routeReady && <button className="btn-soft mt-4 inline-flex items-center gap-2" type="button" onClick={checkLiveTatkalTrains} disabled={Boolean(liveStatus.loading)}><RefreshCw className={liveStatus.loading ? 'animate-spin' : ''} size={16} />Refresh live train list</button>}
        </div>

        {selectedTatkalTrain && hasLiveRows && (
          <SeatAvailabilityChecker plan={urgentPlan} selectedService={selectedTatkalTrain} forceTatkal hideTestButton toast={toast} />
        )}


        <div className="rounded-3xl border border-yellow-400/20 bg-yellow-400/10 p-5 text-sm text-yellow-100">
          <h3 className="text-lg font-black">Tatkal guidance</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {tatkalRules.filter((rule) => !rule.toLowerCase().includes('urgent flight') && !rule.toLowerCase().includes('urgent bus')).map((rule) => <li key={rule}>{rule}</li>)}
            <li>Live route results and live Tatkal seat availability are separate provider checks.</li>
            <li>This is a booking demo. Real payment, PNR and ticket issue need licensed and authorized integration.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

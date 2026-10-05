import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  Clock,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Ticket,
  TrainFront,
  Wifi,
  Copy,
  CheckSquare,
  Square,
  UserCheck,
  Zap,
  ShieldCheck,
  Plus,
  Trash2
} from 'lucide-react'
import { tatkalRules } from '../data/journeyData'
import { getCabinOptions, getRouteInputLabels, servicesForMode, transportPlaces } from '../data/transportData'
import TatkalEmergencyTimer from '../components/TatkalEmergencyTimer'
import SeatAvailabilityChecker from './SeatAvailabilityChecker'
import SourceBadge from '../components/SourceBadge'

function Field({ label, children }) {
  return (
    <label className="block text-sm font-bold text-slate-800">
      <span className="mb-1.5 block text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  )
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

  // 1-Click Master Data Passenger Auto-Fill State
  const [passengers, setPassengers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('travelmate-tatkal-master-list'))
      if (Array.isArray(saved) && saved.length) return saved
    } catch {}
    return [
      { id: 1, name: 'Surendra Gedala', age: '24', gender: 'M', berth: 'Lower' }
    ]
  })

  // Pre-Tatkal Checklist State
  const [checklist, setChecklist] = useState({
    login: false,
    masterList: false,
    upiReady: false,
    clipboardReady: false,
    backupRoute: false
  })

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

  function savePassengers(list) {
    setPassengers(list)
    try {
      localStorage.setItem('travelmate-tatkal-master-list', JSON.stringify(list))
    } catch {}
  }

  function addPassenger() {
    if (passengers.length >= 4) {
      toast?.('Tatkal rules allow maximum 4 passengers per booking.')
      return
    }
    const next = [
      ...passengers,
      { id: Date.now(), name: '', age: '', gender: 'M', berth: 'No Preference' }
    ]
    savePassengers(next)
  }

  function removePassenger(id) {
    if (passengers.length <= 1) {
      toast?.('At least 1 passenger is required for Tatkal master data.')
      return
    }
    savePassengers(passengers.filter(p => p.id !== id))
  }

  function updatePassenger(id, field, value) {
    savePassengers(passengers.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  async function copyMasterData() {
    const valid = passengers.filter(p => p.name.trim())
    if (!valid.length) {
      toast?.('Enter at least one passenger name.')
      return
    }
    const formatted = valid.map(p => `${p.name}, ${p.age || '30'}, ${p.gender}, ${p.berth}`).join(' | ')
    try {
      await navigator.clipboard.writeText(formatted)
      toast?.('Master Passenger List copied! Ready for rapid IRCTC paste.')
      setChecklist(prev => ({ ...prev, clipboardReady: true }))
    } catch {
      toast?.('Failed to copy to clipboard.')
    }
  }

  function toggleChecklistItem(key) {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

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
    <div className="tatkal-layout space-y-6">
      {/* Top Countdown Engine */}
      <TatkalEmergencyTimer classType={emergencyClass} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Route Search & Trains Selection */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-950 text-xs font-bold">
                <AlertTriangle size={14} className="text-amber-600" /> Emergency Mode · Tatkal Trains Only
              </span>
              <a
                href="https://www.irctc.co.in/nget/train-search"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-800 hover:bg-sky-100 transition"
              >
                <ExternalLink size={12} /> Open IRCTC Portal
              </a>
            </div>

            <h2 className="mt-4 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Tatkal train booking preparation</h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Enter your route to check live route trains and verify Tatkal Quota (TQ) availability before booking releases at 10:00 AM (AC) or 11:00 AM (Non-AC).
            </p>

            <datalist id="emergency-city-list">
              {cityOptions.map((city) => <option key={city} value={city} />)}
            </datalist>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={routeLabels.from}>
                <input list="emergency-city-list" className="input bg-white text-slate-900 border-slate-300 rounded-xl" value={plan.from} placeholder={routeLabels.fromPlaceholder} onChange={(e) => update({ from: e.target.value })} />
              </Field>
              <Field label={routeLabels.to}>
                <input list="emergency-city-list" className="input bg-white text-slate-900 border-slate-300 rounded-xl" value={plan.to} placeholder={routeLabels.toPlaceholder} onChange={(e) => update({ to: e.target.value })} />
              </Field>
              <Field label="Travel Date">
                <input className="input date-input bg-white text-slate-900 border-slate-300 rounded-xl" type="date" value={plan.date} onChange={(e) => update({ date: e.target.value })} />
              </Field>
              <Field label="Quota Class">
                <select className="input bg-white text-slate-900 border-slate-300 rounded-xl" value={emergencyClass} onChange={(e) => update({ classType: e.target.value })}>
                  {trainClassOptions().map((item) => <option key={item}>{item}</option>)}
                </select>
                <span className="mt-1 block text-xs text-slate-500 font-medium">General is hidden; only Tatkal-eligible classes shown.</span>
              </Field>
              <Field label="Passengers (Max 4 for Tatkal)">
                <select className="input bg-white text-slate-900 border-slate-300 rounded-xl" value={Number(plan.passengers || 1)} onChange={(e) => update({ passengers: Number(e.target.value) })}>
                  {[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count}</option>)}
                </select>
              </Field>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button className="btn-primary inline-flex min-h-12 items-center justify-center gap-2 font-bold" type="button" onClick={checkLiveTatkalTrains} disabled={Boolean(liveStatus.loading)}>
                {liveStatus.loading ? <LoaderCircle className="animate-spin" size={18} /> : <Wifi size={18} />}
                {liveStatus.loading ? 'Checking live trains...' : 'Check live Tatkal trains'}
              </button>
              <button className="btn-soft inline-flex min-h-12 items-center justify-center gap-2 font-bold text-slate-700" type="button" onClick={() => onOpenLiveResults?.()} disabled={!liveTatkalTrains.length}>
                <ExternalLink size={18} /> Open full live results
              </button>
            </div>

            <div className={`mt-4 rounded-2xl border p-4 text-sm ${hasLiveRows ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : liveStatus.mode === 'provider-error' || liveStatus.mode === 'provider-unconfigured' ? 'border-amber-200 bg-amber-50 text-amber-950' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-extrabold">{hasLiveRows ? `${liveTatkalTrains.length} live route train(s) returned` : liveStatus.loading ? 'Live provider check in progress' : 'Live Tatkal route check'}</p>
                <SourceBadge label={hasLiveRows ? 'Live API result' : liveStatus.sourceBadge || 'Provider check required'} />
              </div>
              <p className="mt-2 text-xs leading-relaxed">{liveStatus.message || 'Enter your route and press Check live Tatkal trains to verify trains operating on this corridor.'}</p>
              <p className="mt-2 text-xs font-bold text-sky-900">Select any train below to check real-time Tatkal Quota (TQ) seat and waitlist availability.</p>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-950">
              <p className="flex items-center gap-2 font-black text-slate-900"><Clock size={18} className="text-amber-600" /> Tatkal release window</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-700">{tatkalWindow.open ? 'Tatkal window is currently open for this class.' : `Tatkal tickets are not released right now. Booking opens at ${tatkalWindow.startText}.`}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-soft text-xs bg-white text-slate-800 border-slate-300 font-bold hover:bg-slate-50" onClick={() => setAlarm(5)}><Bell size={14} className="mr-1 inline text-amber-600" /> Alarm 5m before ({tatkalWindow.alarm5})</button>
                <button className="btn-soft text-xs bg-white text-slate-800 border-slate-300 font-bold hover:bg-slate-50" onClick={() => setAlarm(10)}><Bell size={14} className="mr-1 inline text-amber-600" /> Alarm 10m before ({tatkalWindow.alarm10})</button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn-primary inline-flex items-center gap-2 font-bold" onClick={() => bookSelectedTrain()}><Ticket size={18} />Prepare selected train →</button>
              {bestTatkalTrain && (
                <button className="btn-soft text-xs font-bold text-slate-700" onClick={() => { const index = displayTrains.indexOf(bestTatkalTrain); setTargetTrainKey(trainKey(bestTatkalTrain, index)); toast?.(`${bestTatkalTrain.service || bestTatkalTrain.serviceName} selected.`) }}>
                  <TrainFront size={14} className="mr-1 inline text-sky-600" /> Select first/best result
                </button>
              )}
            </div>
          </div>

          {/* Trains Listing */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-black text-slate-900">{hasLiveRows ? 'Live trains for Tatkal preparation' : 'Tatkal corridor train options'}</h3>
                <p className="mt-1 text-xs text-slate-500 font-medium">{hasLiveRows ? 'Select a train and check TQ seat/WL availability below.' : 'Corridor routes shown. Click Check live Tatkal trains above for real-time schedule.'}</p>
              </div>
              <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">{displayTrains.length} trains</span>
            </div>

            <div className="mt-4 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
              {displayTrains.length === 0 && (
                <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-900">
                  No train rows are available. Check the route or refresh.
                </p>
              )}
              {displayTrains.map((item, index) => {
                const key = trainKey(item, index)
                const selected = targetTrainKey === key
                const cabins = normalizedCabins(item)
                return (
                  <article key={key} className={`rounded-2xl border p-4 text-sm transition ${selected ? 'border-sky-500 bg-sky-50/40 shadow-xs ring-1 ring-sky-500/30' : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="mb-2 flex flex-wrap gap-2">
                          <SourceBadge label={hasLiveRows ? item.sourceBadge || 'Live API result' : item.sourceBadge || 'Local planning dataset'} />
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-amber-950 text-[10px] font-bold">TQ Eligible</span>
                        </div>
                        <h4 className="font-extrabold text-slate-900">{item.service || item.serviceName || 'Train option'}</h4>
                        <p className="mt-1 text-xs text-slate-500 font-medium">{item.from || plan.from} → {item.to || plan.to}</p>
                      </div>
                      <span className="rounded-full bg-sky-50 text-sky-900 border border-sky-200 px-3 py-1 text-xs font-black">{displayFare(item)}</span>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                      <p><b>Train number:</b> {item.code || 'N/A'}</p>
                      <p><b>Depart:</b> {item.depart || item.departure || 'Check provider'}</p>
                      <p><b>Arrive:</b> {item.arrive || item.arrival || 'Check provider'}</p>
                      <p><b>Classes:</b> {cabins.length ? cabins.join(', ') : 'Check provider'}</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${selected ? 'bg-sky-600 text-white' : 'border border-slate-200 bg-slate-100 text-slate-800 hover:bg-slate-200'}`} onClick={() => setTargetTrainKey(key)}>
                        {selected ? '✓ Selected Train' : 'Select Train'}
                      </button>
                      <button className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-100" onClick={() => { setTargetTrainKey(key); bookSelectedTrain(item) }}>
                        <Ticket className="mr-1 inline text-amber-600" size={12} /> Start Tatkal Demo
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
            {routeReady && (
              <button className="btn-soft mt-4 inline-flex items-center gap-2 text-xs font-bold text-slate-700" type="button" onClick={checkLiveTatkalTrains} disabled={Boolean(liveStatus.loading)}>
                <RefreshCw className={liveStatus.loading ? 'animate-spin' : ''} size={14} /> Refresh live train list
              </button>
            )}
          </div>

          {selectedTatkalTrain && hasLiveRows && (
            <SeatAvailabilityChecker plan={urgentPlan} selectedService={selectedTatkalTrain} forceTatkal hideTestButton toast={toast} />
          )}
        </div>

        {/* Right Column: Tatkal Auto-Fill Master Data & Pre-Tatkal Checklist */}
        <div className="space-y-6">
          {/* 1-Click Master Data Passenger Auto-Fill Assistant */}
          <div className="rounded-3xl border border-sky-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-sky-100 pb-3">
              <div>
                <span className="badge border-sky-200 bg-sky-50 text-sky-800 text-[10px] font-black tracking-wide">
                  IRCTC SPEED PASS
                </span>
                <h3 className="mt-1 text-lg font-black text-slate-900">Tatkal Auto-Fill Master Data</h3>
                <p className="text-xs text-slate-500 font-medium">Pre-fill passengers for 1-click clipboard copy into IRCTC.</p>
              </div>
              <button
                type="button"
                onClick={addPassenger}
                className="btn-soft inline-flex items-center gap-1 py-1 px-2.5 text-xs font-bold text-slate-700"
                disabled={passengers.length >= 4}
              >
                <Plus size={14} /> Add
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {passengers.map((p, idx) => (
                <div key={p.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-sky-900">Passenger #{idx + 1}</span>
                    {passengers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePassenger(p.id)}
                        className="text-slate-400 hover:text-rose-600 transition"
                        aria-label={`Remove Passenger ${idx + 1}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      className="input py-1 text-xs bg-white text-slate-900 border-slate-300"
                      placeholder="Full Name (as on Govt ID)"
                      value={p.name}
                      onChange={(e) => updatePassenger(p.id, 'name', e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        className="input py-1 text-xs bg-white text-slate-900 border-slate-300"
                        placeholder="Age"
                        type="number"
                        min="1"
                        max="120"
                        value={p.age}
                        onChange={(e) => updatePassenger(p.id, 'age', e.target.value)}
                      />
                      <select
                        className="input py-1 text-xs bg-white text-slate-900 border-slate-300"
                        value={p.gender}
                        onChange={(e) => updatePassenger(p.id, 'gender', e.target.value)}
                      >
                        <option value="M">Male (M)</option>
                        <option value="F">Female (F)</option>
                        <option value="T">Transgender</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-2">
                    <select
                      className="input py-1 text-xs bg-white text-slate-900 border-slate-300"
                      value={p.berth}
                      onChange={(e) => updatePassenger(p.id, 'berth', e.target.value)}
                    >
                      <option value="No Preference">No Berth Preference (Fastest Confirmation)</option>
                      <option value="Lower">Lower Berth</option>
                      <option value="Middle">Middle Berth</option>
                      <option value="Upper">Upper Berth</option>
                      <option value="Side Lower">Side Lower</option>
                      <option value="Side Upper">Side Upper</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-black shadow-xs"
                onClick={copyMasterData}
              >
                <Copy size={14} /> Copy Master Data (IRCTC Quick Paste)
              </button>
            </div>
          </div>

          {/* Pre-Tatkal Rapid Action Checklist */}
          <div className="rounded-3xl border border-amber-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="border-b border-amber-100 pb-3">
              <span className="badge border-amber-300 bg-amber-50 text-amber-900 text-[10px] font-black tracking-wide">
                TACTICAL CHECKLIST
              </span>
              <h3 className="mt-1 text-lg font-black text-slate-900">Pre-Tatkal Golden Hour Checklist</h3>
              <p className="text-xs text-slate-500 font-medium">Complete these 5 actions before the clock strikes 10:00 or 11:00 AM.</p>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              {[
                { key: 'login', text: 'Log in to IRCTC portal at 09:55 AM (AC) or 10:55 AM (Non-AC) to prevent captcha session expiration.' },
                { key: 'masterList', text: 'Verify Passenger Master List is pre-saved in your IRCTC profile under "My Profile".' },
                { key: 'upiReady', text: 'Payment App (Paytm / GPay / IRCTC iMobi) unlocked on your phone for rapid 1-tap OTP approval.' },
                { key: 'clipboardReady', text: 'Master passenger details copied to clipboard using the Auto-Fill tool above.' },
                { key: 'backupRoute', text: 'Multimodal backup route or station hopper alternative identified in TravelMate.' }
              ].map(({ key, text }) => {
                const checked = checklist[key]
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleChecklistItem(key)}
                    className={`w-full text-left flex items-start gap-2.5 p-3 rounded-xl border transition ${
                      checked ? 'border-emerald-300 bg-emerald-50 text-emerald-950 font-medium' : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Square size={16} className="text-slate-400 flex-shrink-0 mt-0.5" />
                    )}
                    <span className={`leading-relaxed text-xs ${checked ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>
                      {text}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Official Tatkal Regulatory Guidance */}
          <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-5 text-sm text-amber-950 shadow-sm">
            <h3 className="text-base font-black flex items-center gap-2 text-amber-900">
              <ShieldCheck size={18} className="text-amber-700" /> Tatkal Rules & Legal Protocol
            </h3>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs text-amber-900/90 leading-relaxed">
              {tatkalRules.filter((rule) => !rule.toLowerCase().includes('urgent flight') && !rule.toLowerCase().includes('urgent bus')).map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
              <li>Tatkal quota tickets do not permit senior citizen or concessionary fares.</li>
              <li>TravelMate simulates booking and prepares live data; final payment is completed on the official IRCTC portal.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import {
  CalendarDays,
  ExternalLink,
  Ticket,
  WifiOff,
  Signal,
  Phone,
  ShieldAlert,
  Train,
  CheckCircle2,
  RefreshCw,
  HardDriveDownload,
  Info
} from 'lucide-react'
import { getOfflinePack, getSavedPlans, saveOfflinePack } from '../utils/storage'
import { warmOfflineCache } from '../utils/offlineMode'
import { localDateIso } from '../utils/date'
import { getCabinOptions, getRouteInputLabels, transportModes, transportPlaces } from '../data/transportData'

function Field({ label, children }) {
  return (
    <label className="block text-xs sm:text-sm font-bold text-slate-700">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}

const cityOptions = Array.from(new Set(transportPlaces.map((item) => item.city).filter(Boolean)))

function serviceForSaved(saved) {
  return saved?.selectedService || null
}

function serviceValue(service, ...keys) {
  for (const key of keys) {
    if (service?.[key] !== undefined && service?.[key] !== null && service?.[key] !== '') return service[key]
  }
  return ''
}

function newestSavedPlan(pack) {
  const packed = (pack?.savedRoutes || []).find((item) => item?.selectedService) || null
  const local = getSavedPlans().find((item) => item?.selectedService) || null
  if (!packed) return local
  if (!local) return packed
  const packedTime = new Date(packed.timestamp || 0).getTime()
  const localTime = new Date(local.timestamp || 0).getTime()
  return localTime >= packedTime ? local : packed
}

function SavedOfflineSnapshot({ pack }) {
  const saved = newestSavedPlan(pack)
  const selectedService = serviceForSaved(saved)

  if (!saved) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded bg-[#EDF7F0] text-[#137333] border border-[#C6E8D1] flex items-center justify-center shrink-0">
            <Ticket size={17} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">No saved offline plan yet</h3>
            <p className="text-xs text-gray-500">Local offline snapshot</p>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-600 leading-relaxed font-normal">
          When internet is available, check live results, choose one exact train or service, save it, and generate the offline pack. That same selected service appears here during no-network use.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#15803D]">Offline Saved Plan</span>
          <h3 className="mt-0.5 text-lg font-bold text-gray-900">{saved.from} to {saved.to}</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Destination: {saved.to} · Mode: {saved.transportMode || 'Train'} · Date: {saved.date || 'Saved date'}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border border-[#C6E8D1] bg-[#EDF7F0] text-[#137333]">
          <CheckCircle2 size={13} /> Stored on this device
        </span>
      </div>

      {selectedService && (
        <div className="mt-3.5 rounded border border-gray-200 bg-gray-50/80 p-3 text-xs text-gray-800 space-y-1">
          <p><b className="text-gray-900">Saved service:</b> {serviceValue(selectedService, 'serviceName', 'service', 'trainName', 'name') || 'Provider service'} ({serviceValue(selectedService, 'code', 'trainNumber', 'trainNo') || 'Code unavailable'})</p>
          <p><b className="text-gray-900">Path:</b> {serviceValue(selectedService, 'from', 'source') || saved.from} to {serviceValue(selectedService, 'to', 'destination') || saved.to}</p>
          <p><b className="text-gray-900">Timing:</b> <span className="tabular">{serviceValue(selectedService, 'departure', 'depart') || 'Check provider'}</span> to <span className="tabular">{serviceValue(selectedService, 'arrival', 'arrive') || 'Check provider'}</span> · {serviceValue(selectedService, 'duration', 'travelTime') || 'Duration unavailable'}</p>
          <p><b className="text-gray-900">Fare estimate:</b> <span className="tabular">{serviceValue(selectedService, 'fare', 'price', 'amount') ? `₹${serviceValue(selectedService, 'fare', 'price', 'amount')}` : 'Check provider'}</span> · {serviceValue(selectedService, 'status', 'availability') || 'Provider verification required'}</p>
        </div>
      )}

      {(saved.pnrNumber || saved.bookingStatus) && (
        <div className="mt-3.5 rounded border border-[#C6E8D1] bg-[#EDF7F0] p-3 text-xs text-[#137333] space-y-1">
          <p><b className="text-gray-900">Automatic PNR:</b> <span className="font-mono font-bold text-gray-900">{saved.pnrNumber || 'No real PNR issued by demo booking'}</span></p>
          {saved.bookingReference && <p><b className="text-gray-900">Booking reference:</b> {saved.bookingReference}</p>}
          {saved.bookingStatus && <p><b className="text-gray-900">Booking state:</b> {saved.bookingStatus}</p>}
          {saved.pnrStatus ? (
            <>
              <p><b className="text-gray-900">Current status:</b> {saved.pnrStatus.currentStatus || 'Check passenger rows'}</p>
              <p><b className="text-gray-900">Booking status:</b> {saved.pnrStatus.bookingStatus || 'Check passenger rows'} · Chart {String(saved.pnrStatus.chartStatus || 'not returned')}</p>
              <p className="text-[11px] text-[#137333]/90">
                Last saved {saved.pnrStatus.checkedAt ? new Date(saved.pnrStatus.checkedAt).toLocaleString() : 'during the latest automatic PNR check'}. Refresh online before travel.
              </p>
            </>
          ) : saved.pnrNumber ? (
            <p className="text-[11px] text-[#137333]/90">The PNR is stored. Its status refreshes automatically when the journey is opened online.</p>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default function LowNetworkPlanner({ plan, update, onBook, onBookService, toast, status }) {
  const selectedMode = plan.transportMode || 'Train'
  const routeLabels = getRouteInputLabels(selectedMode)
  const [offlinePack, setOfflinePack] = useState(() => getOfflinePack())
  const [syncing, setSyncing] = useState(false)
  const lowPlan = { ...plan, transportMode: selectedMode, routeCombo: `${selectedMode} only`, classType: plan.classType || getCabinOptions(selectedMode)[0] }

  const isOffline = status?.online === false
  const isSlow = Boolean(status?.isSlowNetwork)
  const networkReason = isOffline
    ? 'Zero Connectivity (Offline)'
    : isSlow
    ? `Low Cellular Bandwidth (${status?.effectiveType?.toUpperCase() || '2G'})`
    : 'Data-Saving Mode Active'

  function handleTransportChange(value) {
    update({ transportMode: value, routeCombo: `${value} only`, classType: getCabinOptions(value)[0] })
  }

  async function syncOfflineData() {
    setSyncing(true)
    const pack = saveOfflinePack()
    setOfflinePack(pack)
    const result = await warmOfflineCache()
    setSyncing(false)
    toast?.(result.ok ? `Synced offline pack: ${result.saved} assets cached locally.` : 'Offline travel pack updated on this device.')
  }

  return (
    <div className="space-y-6">
      {/* Autonomous Fallback Diagnostic Banner */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-[#EDF7F0] text-[#137333] border border-[#C6E8D1] shrink-0">
              <WifiOff size={20} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded bg-[#EDF7F0] border border-[#C6E8D1] text-[#137333] text-xs font-bold px-2.5 py-0.5">
                  AUTONOMOUS ZERO-NETWORK SHIFT
                </span>
                <span className="inline-flex items-center gap-1.5 rounded bg-gray-100 border border-gray-200 px-2.5 py-0.5 text-[11px] font-mono text-gray-700">
                  {networkReason}
                </span>
              </div>
              <h3 className="mt-1 text-base sm:text-lg font-bold text-gray-900 tracking-tight">
                Low-Network & Offline Journey Engine
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Operating 100% locally from device storage and pre-cached Indian transit datasets. Zero external HTTP requests made.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={syncOfflineData}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded shadow-xs transition"
            >
              <HardDriveDownload size={13} className={syncing ? 'animate-spin text-[#15803D]' : 'text-gray-500'} />
              {syncing ? 'Syncing…' : 'Sync Offline Pack'}
            </button>
            <a
              href="tel:139"
              className="inline-flex items-center gap-1.5 rounded bg-amber-600 hover:bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition"
              aria-label="Call RailMadad (139)"
            >
              <Phone size={13} /> Call 139 (Voice)
            </a>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        {/* Left Card: Offline Route Preparation Form */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-bold border border-[#C6E8D1] bg-[#EDF7F0] text-[#137333]">
            <WifiOff size={13} /> Offline Route Preparation
          </span>
          <h2 className="mt-2 text-lg sm:text-xl font-bold text-gray-900">Offline Route Preparation</h2>
          <p className="mt-1 text-xs text-gray-500 leading-relaxed font-normal">
            Use this when internet is weak. It keeps compact fields and shows locally saved planning data. Live availability still requires internet and an official provider.
          </p>

          <datalist id="low-city-list">
            {cityOptions.map((city) => <option key={city} value={city} />)}
          </datalist>

          <div className="mt-5 grid gap-4">
            <Field label={routeLabels.from}>
              <input
                list="low-city-list"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm transition"
                value={plan.from}
                placeholder={routeLabels.fromPlaceholder}
                onChange={(e) => update({ from: e.target.value })}
              />
            </Field>
            <Field label={routeLabels.to}>
              <input
                list="low-city-list"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm transition"
                value={plan.to}
                placeholder={routeLabels.toPlaceholder}
                onChange={(e) => update({ to: e.target.value })}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Mode of transport">
                <select
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm transition"
                  value={selectedMode}
                  onChange={(e) => handleTransportChange(e.target.value)}
                >
                  {transportModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                </select>
              </Field>
              <Field label="Journey date">
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm transition"
                    type="date"
                    min={localDateIso()}
                    value={plan.date}
                    onChange={(e) => update({ date: e.target.value })}
                  />
                </div>
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Passengers">
                <select
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm transition"
                  value={Number(plan.passengers || 1)}
                  onChange={(e) => update({ passengers: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} passenger{count > 1 ? 's' : ''}</option>)}
                </select>
              </Field>
              <Field label="Class / cabin">
                <select
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm transition"
                  value={lowPlan.classType}
                  onChange={(e) => update({ classType: e.target.value })}
                >
                  {getCabinOptions(selectedMode).map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded bg-[#15803D] hover:bg-[#12733B] text-white font-semibold px-3.5 py-2 text-xs shadow-xs transition"
              onClick={onBook}
            >
              <ExternalLink size={14} /> Start demo booking
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-3.5 py-2 text-xs transition"
              onClick={onBook}
            >
              <Ticket size={14} /> View selected options
            </button>
          </div>
          <p className="mt-2.5 text-xs text-gray-500 font-normal">
            New plans are saved online only after you select an exact provider service.
          </p>
        </div>

        {/* Right Column: Saved Snapshot, Offline Features */}
        <div className="grid gap-5">
          <SavedOfflineSnapshot pack={offlinePack} />

          <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
            <h3 className="text-base font-bold text-gray-900">What stays available offline</h3>
            <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
              {[
                ['Saved route', 'Destination, path, service name, timing and fare estimate from the saved plan.'],
                ['Encrypted documents', 'Secure-vault files remain encrypted in IndexedDB and are never copied into the route pack.'],
                ['Emergency numbers', 'Call or copy emergency railway and medical numbers from local data.'],
                ['Booking preparation', 'Copy the saved route and open official providers once internet connectivity returns.']
              ].map(([title, text]) => (
                <div key={title} className="rounded border border-gray-200 bg-gray-50/70 p-3">
                  <h4 className="font-semibold text-gray-900 text-xs">{title}</h4>
                  <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

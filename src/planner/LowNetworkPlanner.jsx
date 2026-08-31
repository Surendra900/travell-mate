import { useMemo } from 'react'
import { CalendarDays, ExternalLink, Ticket, WifiOff } from 'lucide-react'
import { getOfflinePack, getSavedPlans } from '../utils/storage'
import { getCabinOptions, getRouteInputLabels, transportModes, transportPlaces } from '../data/transportData'
import ServiceOptionsBoard from '../components/ServiceOptionsBoard'

function Field({ label, children }) {
  return <label className="block text-sm font-bold text-lime-100"><span className="mb-2 block">{label}</span>{children}</label>
}

const cityOptions = transportPlaces.map((item) => item.city)

function groupKeyFor(mode = 'Train') {
  return mode === 'Flight' ? 'flights' : mode === 'Bus' ? 'buses' : 'trains'
}

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
      <div className="low-glass rounded-3xl p-5">
        <h3 className="text-2xl font-black text-white">No saved offline plan yet</h3>
        <p className="mt-2 text-sm text-lime-100/85">When internet is available, check live results, choose one exact train or service, save it, and generate the offline pack. That same selected service appears here during no-network use.</p>
      </div>
    )
  }

  return (
    <div className="low-glass rounded-3xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-200">Offline saved plan</p>
          <h3 className="mt-1 text-2xl font-black text-white">{saved.from} → {saved.to}</h3>
          <p className="mt-1 text-sm text-lime-100/85">Destination: {saved.to} · Journey mode: {saved.transportMode || 'Train'} · Date: {saved.date || 'Saved date'}</p>
        </div>
        <span className="badge border-lime-400/30 bg-lime-400/10 text-lime-100">Stored on this device</span>
      </div>
      {selectedService && (
        <div className="mt-4 rounded-2xl border border-lime-300/20 bg-slate-950/70 p-4 text-sm text-lime-50">
          <p><b>Saved service:</b> {serviceValue(selectedService, 'serviceName', 'service', 'trainName', 'name') || 'Provider service'} ({serviceValue(selectedService, 'code', 'trainNumber', 'trainNo') || 'Code unavailable'})</p>
          <p className="mt-1"><b>Path:</b> {serviceValue(selectedService, 'from', 'source') || saved.from} → {serviceValue(selectedService, 'to', 'destination') || saved.to}</p>
          <p className="mt-1"><b>Timing:</b> {serviceValue(selectedService, 'departure', 'depart') || 'Check provider'} → {serviceValue(selectedService, 'arrival', 'arrive') || 'Check provider'} · {serviceValue(selectedService, 'duration', 'travelTime') || 'Duration unavailable'}</p>
          <p className="mt-1"><b>Fare estimate:</b> {serviceValue(selectedService, 'fare', 'price', 'amount') ? `₹${serviceValue(selectedService, 'fare', 'price', 'amount')}` : 'Check provider'} · {serviceValue(selectedService, 'status', 'availability') || 'Provider verification required'}</p>
        </div>
      )}
      {(saved.pnrNumber || saved.bookingStatus) && (
        <div className="mt-4 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4 text-sm text-cyan-50">
          <p><b>Automatic PNR:</b> {saved.pnrNumber || 'No real PNR issued by demo booking'}</p>
          {saved.bookingReference && <p className="mt-1"><b>Booking reference:</b> {saved.bookingReference}</p>}
          {saved.bookingStatus && <p className="mt-1"><b>Booking state:</b> {saved.bookingStatus}</p>}
          {saved.pnrStatus ? (
            <>
              <p className="mt-1"><b>Current status:</b> {saved.pnrStatus.currentStatus || 'Check passenger rows'}</p>
              <p className="mt-1"><b>Booking status:</b> {saved.pnrStatus.bookingStatus || 'Check passenger rows'} · Chart {String(saved.pnrStatus.chartStatus || 'not returned')}</p>
              <p className="mt-1 text-xs text-cyan-100/75">Last saved {saved.pnrStatus.checkedAt ? new Date(saved.pnrStatus.checkedAt).toLocaleString() : 'during the latest automatic PNR check'}. Refresh online before travel.</p>
            </>
          ) : saved.pnrNumber ? (
            <p className="mt-1 text-cyan-100/75">The PNR is stored. Its status refreshes automatically when the journey is opened online.</p>
          ) : null}
        </div>
      )}
      {pack?.secureVaultDocumentCount > 0 && (
        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
          <p className="font-black text-white">Encrypted vault available</p>
          <p className="mt-1">{pack.secureVaultDocumentCount} encrypted document(s) remain in the secure vault. They are not exposed or duplicated in this route snapshot.</p>
        </div>
      )}
    </div>
  )
}

export default function LowNetworkPlanner({ plan, update, onBook, onBookService, toast, status }) {
  const selectedMode = plan.transportMode || 'Train'
  const routeLabels = getRouteInputLabels(selectedMode)
  const offlinePack = useMemo(() => getOfflinePack(), [status?.online])
  const lowPlan = { ...plan, transportMode: selectedMode, routeCombo: `${selectedMode} only`, classType: plan.classType || getCabinOptions(selectedMode)[0] }
  const focusMode = groupKeyFor(selectedMode)

  function handleTransportChange(value) {
    update({ transportMode: value, routeCombo: `${value} only`, classType: getCabinOptions(value)[0] })
  }


  return (
    <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="low-glass rounded-3xl p-5">
        <span className="badge border-lime-400/30 bg-lime-400/10 text-lime-100"><WifiOff size={14} /> Offline / Low-data Mode</span>
        <h2 className="mt-4 text-3xl font-black text-white">Offline route preparation</h2>
        <p className="mt-2 text-sm text-lime-100/85">Use this when internet is weak. It keeps compact fields and shows locally saved planning data. Live availability still requires internet and an official provider.</p>

        <datalist id="low-city-list">
          {cityOptions.map((city) => <option key={city} value={city} />)}
        </datalist>

        <div className="mt-5 grid gap-4">
          <Field label={routeLabels.from}><input list="low-city-list" className="input" value={plan.from} placeholder={routeLabels.fromPlaceholder} onChange={(e) => update({ from: e.target.value })} /></Field>
          <Field label={routeLabels.to}><input list="low-city-list" className="input" value={plan.to} placeholder={routeLabels.toPlaceholder} onChange={(e) => update({ to: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mode of transport"><select className="input" value={selectedMode} onChange={(e) => handleTransportChange(e.target.value)}>{transportModes.map((mode) => <option key={mode}>{mode}</option>)}</select></Field>
            <Field label="Journey date"><div className="relative"><CalendarDays className="pointer-events-none absolute right-3 top-3 text-cyan-200" size={18} /><input className="input date-input pr-10" type="date" value={plan.date} onChange={(e) => update({ date: e.target.value })} /></div></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Passengers"><select className="input" value={Number(plan.passengers || 1)} onChange={(e) => update({ passengers: Number(e.target.value) })}>{[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} passenger{count > 1 ? 's' : ''}</option>)}</select></Field>
            <Field label="Class / cabin"><select className="input" value={lowPlan.classType} onChange={(e) => update({ classType: e.target.value })}>{getCabinOptions(selectedMode).map((item) => <option key={item}>{item}</option>)}</select></Field>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn-primary inline-flex items-center gap-2" onClick={onBook}><ExternalLink size={18} />Start demo booking</button>
          <button className="btn-soft inline-flex items-center gap-2" onClick={onBook}><Ticket size={18} />View selected options</button>
          <span className="rounded-xl border border-lime-300/25 bg-lime-300/10 px-3 py-2 text-xs font-bold text-lime-100">New plans are saved online only after you select an exact provider service.</span>
        </div>
      </div>

      <div className="grid gap-4">
        <SavedOfflineSnapshot pack={offlinePack} />
        <ServiceOptionsBoard plan={lowPlan} compact focusMode={focusMode} onBookService={onBookService} />
        <div className="low-glass rounded-3xl p-5">
          <h3 className="text-2xl font-black text-white">What stays available</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ['Saved route', 'Destination, path, service name, timing and fare estimate from the saved plan.'],
              ['Encrypted documents', 'Secure-vault files remain encrypted in IndexedDB and are never copied into the route pack.'],
              ['Emergency numbers', 'Call/copy emergency numbers from local data.'],
              ['Booking preparation', 'Copy the saved route and open the official provider once internet is available.']
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-lime-400/20 bg-slate-950/70 p-4">
                <h4 className="font-black text-lime-100">{title}</h4>
                <p className="mt-1 text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { MapPinned, MessageSquareText, PhoneCall, RefreshCw, ShieldCheck, WifiOff } from 'lucide-react'
import { getOfflinePack, getSavedPlans, saveOfflinePack } from '../utils/storage'
import { formatEmergencyLocation, getCachedEmergencyLocation, requestEmergencyLocation } from '../utils/locationSafety'
import DocumentVault from './DocumentVault'
import { buildComboLegs, routeCombos } from '../data/transportData'

function savedAt(plan) {
  const value = new Date(plan?.timestamp || 0).getTime()
  return Number.isFinite(value) ? value : 0
}

function newestSavedPlan(pack) {
  const packedPlan = (pack?.savedRoutes || []).find((item) => item?.selectedService) || null
  const localPlan = getSavedPlans().find((item) => item?.selectedService) || null
  if (!packedPlan) return localPlan
  if (!localPlan) return packedPlan
  return savedAt(localPlan) >= savedAt(packedPlan) ? localPlan : packedPlan
}

function bestOfflineBackup(plan) {
  if (!plan) return null
  const backupCombo = routeCombos
    .filter((combo) => combo.label !== (plan.routeCombo || `${plan.transportMode || 'Train'} only`))
    .sort((a, b) => (b.emergencyFit + b.reliability + b.cost) - (a.emergencyFit + a.reliability + a.cost))[0]
  if (!backupCombo) return null
  return { ...backupCombo, legs: buildComboLegs(backupCombo, plan) }
}

function serviceValue(service, ...keys) {
  for (const key of keys) {
    if (service?.[key] !== undefined && service?.[key] !== null && service?.[key] !== '') return service[key]
  }
  return ''
}

function savedService(plan) {
  return plan?.selectedService || null
}


function locationSmsMessage(plan, service, location) {
  const serviceName = serviceValue(service, 'serviceName', 'service', 'trainName', 'name', 'operator')
  const serviceCode = serviceValue(service, 'code', 'trainNumber', 'trainNo', 'flightNumber', 'serviceNumber')
  const locationLine = location
    ? `${Number(location.latitude).toFixed(6)}, ${Number(location.longitude).toFixed(6)} — ${formatEmergencyLocation(location)}`
    : 'GPS location unavailable. Please call me and ask for my nearest landmark.'

  return [
    'TRAVELMATE LOCATION SHARE',
    plan ? `Journey: ${plan.from || 'Origin'} → ${plan.to || 'Destination'}` : 'Journey: No saved route available',
    plan?.date ? `Travel date: ${plan.date}` : '',
    serviceName ? `Saved service: ${serviceName}${serviceCode ? ` (${serviceCode})` : ''}` : '',
    plan?.pnrNumber ? `PNR: ${plan.pnrNumber}` : '',
    plan?.pnrStatus?.currentStatus ? `PNR current status: ${plan.pnrStatus.currentStatus}` : '',
    plan?.pnrStatus?.bookingStatus ? `PNR booking status: ${plan.pnrStatus.bookingStatus}` : '',
    `Current location: ${locationLine}`,
    'Please contact me if I do not respond. For urgent danger in India, call 112.'
  ].filter(Boolean).join('\n')
}

export default function OfflineOnlyMode({ status, toast }) {
  const [sharingLocation, setSharingLocation] = useState(false)
  const pack = getOfflinePack()
  const plan = newestSavedPlan(pack)
  const backup = bestOfflineBackup(plan)
  const service = savedService(plan)

  function refreshPack() {
    saveOfflinePack()
    toast?.('Offline pack updated on this device.')
    window.location.reload()
  }

  async function shareLocationBySms() {
    if (sharingLocation) return
    setSharingLocation(true)

    try {
      const result = await requestEmergencyLocation({ timeout: 12_000, maximumAge: 60_000 })
      const location = result.location || getCachedEmergencyLocation()
      const message = locationSmsMessage(plan, service, location)
      window.location.href = `sms:?body=${encodeURIComponent(message)}`
      toast?.(location
        ? 'SMS opened with your current location and saved journey. Review it and tap Send.'
        : 'SMS opened without GPS. Add a nearby landmark before tapping Send.')
    } finally {
      setSharingLocation(false)
    }
  }

  const serviceName = serviceValue(service, 'serviceName', 'service', 'trainName', 'name', 'operator')
  const serviceCode = serviceValue(service, 'code', 'trainNumber', 'trainNo', 'flightNumber', 'serviceNumber')
  const departure = serviceValue(service, 'departure', 'depart', 'departureTime')
  const arrival = serviceValue(service, 'arrival', 'arrive', 'arrivalTime')
  const fare = serviceValue(service, 'fare', 'price', 'amount')

  return (
    <main className="mx-auto max-w-6xl px-4 py-7 sm:py-10">
      <section className="rounded-[2rem] border border-lime-400/25 bg-lime-400/10 p-6 shadow-glow">
        <span className="badge border-lime-400/30 bg-lime-400/10 text-lime-100"><WifiOff size={14} /> Offline Mode Only</span>
        <h1 className="mt-5 text-3xl font-black text-white sm:text-4xl md:text-5xl">TravelMate Offline Pack</h1>
        <p className="mt-3 max-w-3xl text-lime-100/90">Internet is unavailable, so live search, booking checks, API refresh, maps and heavy comparison panels are hidden. Your newest saved route, exact selected service, PNR and the last successfully checked PNR status remain available.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn-low inline-flex items-center gap-2" onClick={refreshPack}><RefreshCw size={18} /> Refresh local pack</button>
          <button className="btn-primary inline-flex items-center gap-2" onClick={shareLocationBySms} disabled={sharingLocation}><MessageSquareText size={18} /> {sharingLocation ? 'Getting location…' : 'Share location by SMS'}</button>
          <a className="btn-danger inline-flex items-center gap-2" href="tel:112"><PhoneCall size={18} /> Call 112</a>
        </div>
        <p className="mt-3 text-xs text-lime-100/75">GPS can work without internet when device location is enabled. SMS requires cellular service, and you must review and send the message from your phone.</p>
      </section>

      {!plan ? (
        <section className="mt-6 rounded-3xl border border-yellow-400/25 bg-yellow-400/10 p-6 text-yellow-100">
          <h2 className="text-2xl font-black text-white">No saved journey found</h2>
          <p className="mt-2">When internet returns, open Planner, check live results, choose one exact provider service and use “Select & save this train” (or flight/bus). That exact service will then appear here during no-network situations.</p>
        </section>
      ) : (
        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <article className="low-glass rounded-3xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-200">Saved journey snapshot</p>
                <h2 className="mt-2 text-3xl font-black text-white">{plan.from} → {plan.to}</h2>
                <p className="mt-2 text-lime-100/90">Destination: {plan.to} · Journey mode: {plan.transportMode || 'Train'} · Date: {plan.date || 'Saved date'}</p>
                <p className="mt-1 text-sm text-lime-100/85">PNR: {plan.pnrNumber || (plan.bookingStatus ? 'No real PNR issued by demo booking' : 'Waiting for authorized booking provider')}</p>
                {plan.bookingReference && <p className="mt-1 text-sm text-lime-100/85">Booking reference: {plan.bookingReference}</p>}
                {plan.bookingStatus && <p className="mt-1 text-sm text-lime-100/85">Booking state: {plan.bookingStatus}</p>}
                {plan.pnrStatus && <p className="mt-1 text-sm text-lime-100/85">Saved PNR status: {plan.pnrStatus.currentStatus || plan.pnrStatus.bookingStatus || 'Passenger status saved'} · Chart {String(plan.pnrStatus.chartStatus || 'not returned')}</p>}
              </div>
              <span className="rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-slate-950">Offline ready</span>
            </div>
            {service ? (
              <div className="mt-5 rounded-2xl border border-lime-300/20 bg-slate-950/80 p-4 text-sm text-lime-50">
                <p><b className="text-white">Exact saved service:</b> {serviceName || 'Provider service'} ({serviceCode || 'Code unavailable'})</p>
                <p className="mt-1"><b className="text-white">Path:</b> {serviceValue(service, 'from', 'source') || plan.from} → {serviceValue(service, 'to', 'destination') || plan.to}</p>
                <p className="mt-1"><b className="text-white">Timing:</b> {departure || 'Check provider'} → {arrival || 'Check provider'} · {serviceValue(service, 'duration', 'travelTime') || 'Duration unavailable'}</p>
                <p className="mt-1"><b className="text-white">Fare estimate:</b> {fare ? `₹${fare}` : 'Check provider'} · {serviceValue(service, 'status', 'availability') || 'Provider verification required'}</p>
                <p className="mt-1"><b className="text-white">Provider:</b> {service.provider || plan.selectedProvider || 'Provider verification required'}</p>
                <p className="mt-2 text-xs text-yellow-100/90">This is the last saved provider result and PNR snapshot. Final live availability and current PNR status still need official verification.</p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-yellow-300/25 bg-yellow-300/10 p-4 text-sm text-yellow-50">
                No exact service is attached yet. When online, select a live result and use “Select & save this train”.
              </div>
            )}
          </article>

          <article className="glass rounded-3xl p-5">
            <h2 className="flex items-center gap-2 text-2xl font-black text-white"><ShieldCheck className="text-cyan-300" /> Best practical backup</h2>
            {backup ? (
              <div className="mt-4 space-y-3">
                <p className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 font-black text-cyan-100">{backup.label}</p>
                {backup.legs.map((leg) => (
                  <p key={`${backup.label}-${leg.leg}`} className="rounded-xl bg-slate-950/70 p-3 text-sm text-slate-300"><b className="text-white">{leg.mode}:</b> {leg.service} · {leg.depart} → {leg.arrive} · ₹{leg.fare}</p>
                ))}
              </div>
            ) : <p className="mt-3 text-slate-300">No backup stored. Prepare the offline pack after saving an exact provider service.</p>}
          </article>
        </section>
      )}

      <DocumentVault toast={toast} />

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ['Emergency call', 'Use 112 for urgent danger. Browser opens the dialer; user confirms the call.'],
          ['Location sharing', 'Share location by SMS opens the phone message app with GPS coordinates, route, exact saved service, PNR and the last saved PNR status when available.'],
          ['Offline limitation', 'Live status, fresh fares, PNR refresh and new bookings need internet.']
        ].map(([title, text]) => (
          <div key={title} className="rounded-3xl border border-slate-700/70 bg-slate-950/70 p-5">
            <MapPinned className="text-cyan-300" />
            <h3 className="mt-3 font-black text-white">{title}</h3>
            <p className="mt-2 text-sm text-slate-400">{text}</p>
          </div>
        ))}
      </section>
    </main>
  )
}

import { useState } from 'react'
import { MapPinned, MessageSquareText, PhoneCall, RefreshCw, ShieldCheck, WifiOff, CheckCircle2 } from 'lucide-react'
import { getOfflinePack, getSavedPlans, saveOfflinePack } from '../utils/storage'
import { formatEmergencyLocation, getCachedEmergencyLocation, requestEmergencyLocation } from '../utils/locationSafety'
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
    ? `${Number(location.latitude).toFixed(6)}, ${Number(location.longitude).toFixed(6)} :  ${formatEmergencyLocation(location)}`
    : 'GPS location unavailable. Please call me and ask for my nearest landmark.'

  return [
    'TRAVELMATE LOCATION SHARE',
    plan ? `Journey: ${plan.from || 'Origin'} to ${plan.to || 'Destination'}` : 'Journey: No saved route available',
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
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-sky-200 bg-sky-50 text-sky-800">
          <WifiOff size={13} /> Offline Mode Active
        </span>
        <h1 className="mt-4 text-3xl font-black text-slate-950 sm:text-4xl tracking-tight">TravelMate Offline Pack</h1>
        <p className="mt-2 max-w-3xl text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
          Internet is unavailable, so live search, booking checks, API refresh, maps and heavy comparison panels are hidden. Your newest saved route, exact selected service, PNR and the last successfully checked PNR status remain available.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 text-sm transition shadow-2xs" onClick={refreshPack}>
            <RefreshCw size={16} /> Refresh local pack
          </button>
          <button className="inline-flex items-center gap-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold px-4 py-2.5 text-sm shadow-sm transition" onClick={shareLocationBySms} disabled={sharingLocation}>
            <MessageSquareText size={16} /> {sharingLocation ? 'Getting location…' : 'Share location by SMS'}
          </button>
          <a className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 text-sm shadow-sm transition" href="tel:112">
            <PhoneCall size={16} /> Call 112
          </a>
        </div>
        <p className="mt-3 text-xs text-slate-500 font-normal">
          GPS can work without internet when device location is enabled. SMS requires cellular service, and you must review and send the message from your phone.
        </p>
      </section>

      {!plan ? (
        <section className="mt-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">No saved journey found</h2>
          </div>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed font-normal">
            When internet returns, open Planner, check live results, choose one exact provider service and use “Select & save this train” (or flight/bus). That exact service will then appear here during no-network situations.
          </p>
        </section>
      ) : (
        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-sky-700">Saved Journey Snapshot</span>
                <h2 className="mt-1 text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">{plan.from} to {plan.to}</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Destination: {plan.to} · Mode: {plan.transportMode || 'Train'} · Date: {plan.date || 'Saved date'}
                </p>
                <p className="mt-1 text-sm text-slate-600">PNR: {plan.pnrNumber || (plan.bookingStatus ? 'No real PNR issued by demo booking' : 'Waiting for authorized booking provider')}</p>
                {plan.bookingReference && <p className="mt-1 text-sm text-slate-600">Booking reference: {plan.bookingReference}</p>}
                {plan.bookingStatus && <p className="mt-1 text-sm text-slate-600">Booking state: {plan.bookingStatus}</p>}
                {plan.pnrStatus && <p className="mt-1 text-sm text-slate-600">Saved PNR status: {plan.pnrStatus.currentStatus || plan.pnrStatus.bookingStatus || 'Passenger status saved'} · Chart {String(plan.pnrStatus.chartStatus || 'not returned')}</p>}
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 size={13} /> Offline ready
              </span>
            </div>
            {service ? (
              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
                <p><b className="text-slate-950">Exact saved service:</b> {serviceName || 'Provider service'} ({serviceCode || 'Code unavailable'})</p>
                <p className="mt-1"><b className="text-slate-950">Path:</b> {serviceValue(service, 'from', 'source') || plan.from} to {serviceValue(service, 'to', 'destination') || plan.to}</p>
                <p className="mt-1"><b className="text-slate-950">Timing:</b> {departure || 'Check provider'} to {arrival || 'Check provider'} · {serviceValue(service, 'duration', 'travelTime') || 'Duration unavailable'}</p>
                <p className="mt-1"><b className="text-slate-950">Fare estimate:</b> {fare ? `₹${fare}` : 'Check provider'} · {serviceValue(service, 'status', 'availability') || 'Provider verification required'}</p>
                <p className="mt-1"><b className="text-slate-950">Provider:</b> {service.provider || plan.selectedProvider || 'Provider verification required'}</p>
                <p className="mt-2 text-xs text-slate-500">This is the last saved provider result and PNR snapshot. Final live availability and current PNR status still need official verification.</p>
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 font-medium">
                No exact service is attached yet. When online, select a live result and use “Select & save this train”.
              </div>
            )}
          </article>

          <article className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              <ShieldCheck className="text-sky-600" /> Best practical backup
            </h2>
            {backup ? (
              <div className="mt-4 space-y-3">
                <p className="rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 font-bold text-sky-900 text-sm">{backup.label}</p>
                {backup.legs.map((leg) => (
                  <p key={`${backup.label}-${leg.leg}`} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <b className="text-slate-950 font-semibold">{leg.mode}:</b> {leg.service} · {leg.depart} to {leg.arrive} · ₹{leg.fare}
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 font-medium">
                Save a journey with a selected train, bus or flight to see local multi-modal backup legs here.
              </p>
            )}
          </article>
        </section>
      )}
    </main>
  )
}

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  DownloadCloud,
  Hotel,
  Plane,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trash2,
  TrainFront,
  BusFront,
  Clock,
  MapPin
} from 'lucide-react'
import BookingModal from '../components/BookingModal'
import PnrPredictorModal from '../components/PnrPredictorModal'
import OfflinePassModal from '../components/OfflinePassModal'
import {
  attachPnrStatus,
  deletePlan,
  getOfflinePack,
  getSavedPlans,
  saveOfflinePack,
  setLoadedPlan,
  updateSavedPlan
} from '../utils/storage'
import { calculatePlanQualityScore, planVerdict, scoreBreakdown } from '../utils/scoring'
import { getPNRStatus } from '../services/LiveTransportApi'

function serviceValue(service, ...keys) {
  for (const key of keys) {
    if (service?.[key] !== undefined && service?.[key] !== null && service?.[key] !== '') {
      return service[key]
    }
  }
  return ''
}

function iconFor(mode) {
  return mode === 'Flight' ? Plane : mode === 'Bus' ? BusFront : TrainFront
}

export default function SavedPlans({ toast }) {
  const [plans, setPlans] = useState([])
  const [bookingPlan, setBookingPlan] = useState(null)
  const [passPlan, setPassPlan] = useState(null)
  const [offline, setOffline] = useState(null)
  const [pnrLoading, setPnrLoading] = useState({})
  const [showPnrModal, setShowPnrModal] = useState(false)
  const autoPnrStarted = useRef(false)
  const navigate = useNavigate()

  useEffect(() => {
    setPlans(getSavedPlans())
    setOffline(getOfflinePack())
  }, [])

  useEffect(() => {
    if (autoPnrStarted.current || !plans.length || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
      return
    }
    const pending = plans.filter((p) => /^\d{10}$/.test(p.pnrNumber || '') && !p.pnrStatus).slice(0, 3)
    if (!pending.length) return
    autoPnrStarted.current = true
    pending.forEach((plan) => refreshPnr(plan, { automatic: true }))
  }, [plans])

  const exactPlans = plans.filter((plan) => plan.from && plan.to && plan.selectedService)
  const latestPlanTime = exactPlans.reduce((latest, plan) => Math.max(latest, new Date(plan.timestamp || 0).getTime()), 0)
  const offlineTime = offline?.generatedAt ? new Date(offline.generatedAt).getTime() : 0
  const packedExactRoutes = (offline?.savedRoutes || []).filter((plan) => plan.selectedService).length
  const packCurrent = Boolean(offline && exactPlans.length && offlineTime >= latestPlanTime && packedExactRoutes >= exactPlans.length)
  const canGeneratePack = exactPlans.length > 0 && !packCurrent

  function refresh() {
    setPlans(getSavedPlans())
    setOffline(getOfflinePack())
  }

  function openPlan(plan) {
    setLoadedPlan(plan)
    navigate('/planner')
  }

  function remove(id) {
    setPlans(deletePlan(id))
    toast('Saved plan deleted.')
  }

  function makeOfflinePack() {
    if (!exactPlans.length) return toast('Select and save an exact service first.')
    if (packCurrent) return toast('Offline pack is already up to date.')
    const pack = saveOfflinePack()
    setOffline(pack)
    toast('Offline pack generated with your saved journeys.')
  }

  async function refreshPnr(plan, { automatic = false } = {}) {
    const pnr = String(plan.pnrNumber || '').replace(/\D/g, '').slice(0, 10)
    if (!/^\d{10}$/.test(pnr)) return
    setPnrLoading((x) => ({ ...x, [plan.id]: true }))
    const data = await getPNRStatus({ pnr })
    if (data.result) {
      attachPnrStatus(plan, data.result)
      saveOfflinePack()
    }
    setPnrLoading((x) => ({ ...x, [plan.id]: false }))
    refresh()
    if (!automatic) {
      toast(data.result ? 'PNR status refreshed.' : `PNR status unavailable: ${data.message || 'provider unavailable'}`)
    }
  }

  async function handleBookingSaved(completedPlan) {
    if (!bookingPlan?.id || !completedPlan?.selectedService) return
    let updated = updateSavedPlan(bookingPlan.id, completedPlan)
    if (!updated) return toast('The saved plan could not be updated.')
    if (updated.pnrNumber && navigator.onLine !== false) {
      const data = await getPNRStatus({ pnr: updated.pnrNumber })
      if (data.result) updated = attachPnrStatus(updated, data.result) || updated
    }
    saveOfflinePack()
    refresh()
    toast(updated.pnrNumber ? 'Booking PNR and status saved.' : 'Demo booking saved.')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Hero */}
      <section className="bg-white border-b border-slate-200 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold mb-2">
              <Bookmark size={14} className="text-sky-600" />
              <span>Itinerary & Pass Manager</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
              My Trips & Boarding Passes
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Access your upcoming departures, offline passes, and live PNR confirmation status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/planner')}
            className="btn-primary h-12 px-5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-md shadow-sky-600/20"
          >
            <span>＋ Plan a New Trip</span>
          </button>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        {/* Upcoming Journeys Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-slate-950 flex items-center gap-2">
              <CalendarDays size={20} className="text-sky-600" />
              <span>Upcoming Journeys</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500">{plans.length} total saved</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.slice(0, 2).map((plan) => {
              const service = plan.selectedService || {}
              const ModeIcon = iconFor(plan.transportMode)
              const name =
                serviceValue(service, 'serviceName', 'service', 'trainName', 'name', 'operator') ||
                `${plan.transportMode || 'Travel'} Journey`
              const code = serviceValue(service, 'code', 'trainNumber', 'trainNo', 'flightNumber', 'serviceNumber')
              const departure = serviceValue(service, 'departure', 'depart', 'departureTime')
              const arrival = serviceValue(service, 'arrival', 'arrive', 'arrivalTime')

              return (
                <article
                  key={plan.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Date chip & mode */}
                    <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                        <CalendarDays size={13} className="text-slate-500" />
                        <span>{plan.date || 'Date not selected'}</span>
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <ModeIcon size={18} />
                      </div>
                    </div>

                    {/* Title & Route */}
                    <div className="mt-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                        {plan.transportMode || 'Train'} · {plan.ticketType || 'Normal'}
                      </span>
                      <h3 className="text-xl font-extrabold text-slate-950 mt-1">{name}</h3>
                      <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mt-1">
                        <span>{plan.from || 'Origin'}</span>
                        <ArrowRight size={14} className="text-slate-400" />
                        <span>{plan.to || 'Destination'}</span>
                      </p>
                    </div>

                    {/* Meta details */}
                    <div className="grid grid-cols-2 gap-3 mt-5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-400 block font-semibold mb-0.5">Service Code</span>
                        <strong className="text-slate-900 font-bold">{code || 'Verified Provider'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold mb-0.5">Timings</span>
                        <strong className="text-slate-900 font-bold">
                          {departure || '—'} {arrival ? `→ ${arrival}` : ''}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-6 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => openPlan(plan)}
                      className="text-xs font-bold text-sky-700 hover:text-sky-800 inline-flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight size={14} />
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        data-testid={`view-pass-${plan.id}`}
                        onClick={() => setPassPlan(plan)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-800 inline-flex items-center gap-1.5"
                      >
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Boarding Pass</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBookingPlan(plan)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-800 inline-flex items-center gap-1.5"
                      >
                        <Ticket size={14} className="text-sky-600" />
                        <span>Booking</span>
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}

            {plans.length === 0 && (
              <div className="col-span-full bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center">
                <Bookmark size={32} className="mx-auto text-slate-400 mb-3" />
                <h3 className="text-lg font-bold text-slate-900">No trips saved yet</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                  Search any train, bus, or flight in Journey Planner and tap "Save to Trips" to keep it accessible here.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/planner')}
                  className="btn-primary text-sm font-bold"
                >
                  Plan Your First Trip
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Offline Pack Generator */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                <ShieldCheck size={14} /> Zero-Network Ready
              </span>
              <h2 className="text-xl font-black text-slate-950 mt-1">Keep Your Journeys Available Offline</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Download route schedules, offline passes, and encrypted vault IDs directly into device storage.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={!canGeneratePack}
                onClick={makeOfflinePack}
                className="btn-primary h-11 px-4 text-xs font-bold flex items-center gap-2"
              >
                <DownloadCloud size={16} />
                <span>{packCurrent ? 'Pack Up To Date' : 'Generate Offline Pack'}</span>
              </button>
              <button
                type="button"
                onClick={refresh}
                className="btn-soft h-11 px-3 text-xs font-bold flex items-center gap-1.5"
              >
                <RotateCw size={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Saved Routes</span>
              <strong className="text-lg font-black text-slate-900">{exactPlans.length}</strong>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Offline Cached</span>
              <strong className="text-lg font-black text-slate-900">{packedExactRoutes}</strong>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Vault Documents</span>
              <strong className="text-lg font-black text-slate-900">{offline?.secureVaultDocumentCount || 0}</strong>
            </div>
          </div>
        </section>

        {/* Detailed Plans & Automatic PNR status */}
        {plans.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-950">Trip Roster & PNR Status</h2>
            <div className="grid gap-3">
              {plans.map((plan) => {
                const score = plan.planQualityScore || calculatePlanQualityScore(plan)
                const service = plan.selectedService || {}
                const pnr = plan.pnrNumber || ''
                const checking = Boolean(pnrLoading[plan.id])
                const ModeIcon = iconFor(plan.transportMode)

                return (
                  <article
                    key={plan.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ModeIcon size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-sky-700">{plan.transportMode}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-medium text-slate-500">{plan.date}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-0.5">
                          {serviceValue(service, 'serviceName', 'service', 'trainName', 'name', 'operator') ||
                            'Custom Route Plan'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {plan.from} → {plan.to} · {planVerdict(score)} (Score: {score}/100)
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                      <div className="text-right mr-3">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Automatic PNR status
                        </span>
                        <strong className="text-xs font-bold text-slate-800">
                          {pnr ? `PNR ${pnr}` : 'Direct Provider'}
                        </strong>
                      </div>

                      <button
                        type="button"
                        data-testid={`detail-pass-${plan.id}`}
                        onClick={() => setPassPlan(plan)}
                        className="btn-soft h-9 px-3 text-xs font-bold flex items-center gap-1.5"
                      >
                        <ShieldCheck size={14} className="text-emerald-600" />
                        <span>Pass</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => remove(plan.id)}
                        className="btn-soft h-9 px-2.5 text-xs text-red-600 hover:bg-red-50 hover:border-red-200"
                        title="Delete saved plan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )}
      </main>

      <BookingModal
        open={Boolean(bookingPlan)}
        onClose={() => setBookingPlan(null)}
        plan={bookingPlan}
        onSaved={handleBookingSaved}
      />
      <OfflinePassModal
        open={Boolean(passPlan)}
        onClose={() => setPassPlan(null)}
        plan={passPlan}
      />
      <PnrPredictorModal
        open={showPnrModal}
        onClose={() => setShowPnrModal(false)}
      />
    </div>
  )
}

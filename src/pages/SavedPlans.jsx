import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Activity, ArrowRight, Bookmark, CalendarDays, CheckCircle2, DownloadCloud, Hotel, Plane, RotateCw, ShieldCheck, Sparkles, Ticket, Trash2, TrainFront, BusFront } from 'lucide-react'
import BookingModal from '../components/BookingModal'
import PnrPredictorModal from '../components/PnrPredictorModal'
import OfflinePassModal from '../components/OfflinePassModal'
import { attachPnrStatus, deletePlan, getOfflinePack, getSavedPlans, saveOfflinePack, setLoadedPlan, updateSavedPlan } from '../utils/storage'
import { calculatePlanQualityScore, planVerdict, scoreBreakdown } from '../utils/scoring'
import { getPNRStatus } from '../services/LiveTransportApi'

function serviceValue(service, ...keys) {
  for (const key of keys) if (service?.[key] !== undefined && service?.[key] !== null && service?.[key] !== '') return service[key]
  return ''
}
function iconFor(mode) { return mode === 'Flight' ? Plane : mode === 'Bus' ? BusFront : TrainFront }

export default function SavedPlans({ toast }) {
  const [plans, setPlans] = useState([])
  const [bookingPlan, setBookingPlan] = useState(null)
  const [passPlan, setPassPlan] = useState(null)
  const [offline, setOffline] = useState(null)
  const [pnrLoading, setPnrLoading] = useState({})
  const [showPnrModal, setShowPnrModal] = useState(false)
  const [targetPnr, setTargetPnr] = useState('')
  const autoPnrStarted = useRef(false)
  const navigate = useNavigate()

  useEffect(() => { setPlans(getSavedPlans()); setOffline(getOfflinePack()) }, [])
  useEffect(() => {
    if (autoPnrStarted.current || !plans.length || (typeof navigator !== 'undefined' && navigator.onLine === false)) return
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

  function refresh() { setPlans(getSavedPlans()); setOffline(getOfflinePack()) }
  function openPlan(plan) { setLoadedPlan(plan); navigate('/planner') }
  function remove(id) { setPlans(deletePlan(id)); toast('Saved plan deleted.') }
  function makeOfflinePack() {
    if (!exactPlans.length) return toast('Select and save an exact service first.')
    if (packCurrent) return toast('Offline pack is already up to date.')
    const pack = saveOfflinePack(); setOffline(pack); toast('Offline pack generated with your saved journeys.')
  }
  async function refreshPnr(plan, { automatic = false } = {}) {
    const pnr = String(plan.pnrNumber || '').replace(/\D/g, '').slice(0, 10)
    if (!/^\d{10}$/.test(pnr)) return
    setPnrLoading((x) => ({ ...x, [plan.id]: true }))
    const data = await getPNRStatus({ pnr })
    if (data.result) { attachPnrStatus(plan, data.result); saveOfflinePack() }
    setPnrLoading((x) => ({ ...x, [plan.id]: false })); refresh()
    if (!automatic) toast(data.result ? 'PNR status refreshed.' : `PNR status unavailable: ${data.message || 'provider unavailable'}`)
  }
  async function handleBookingSaved(completedPlan) {
    if (!bookingPlan?.id || !completedPlan?.selectedService) return
    let updated = updateSavedPlan(bookingPlan.id, completedPlan)
    if (!updated) return toast('The saved plan could not be updated.')
    if (updated.pnrNumber && navigator.onLine !== false) { const data = await getPNRStatus({ pnr: updated.pnrNumber }); if (data.result) updated = attachPnrStatus(updated, data.result) || updated }
    saveOfflinePack(); refresh(); setBookingPlan(null); toast(updated.pnrNumber ? 'Booking PNR and status saved.' : 'Demo booking saved.')
  }

  return (
    <main className="saved-page">
      <section className="saved-hero">
        <div>
          <h1>My Trips</h1>
          <p>Manage your upcoming adventures and reminisce about past journeys.</p>
        </div>
        <button className="btn-primary saved-plan-button" onClick={() => navigate('/planner')}><span>＋</span> Plan a New Trip</button>
      </section>

      <section className="saved-section">
        <h2><CalendarDays size={21} /> Upcoming</h2>
        <div className="saved-upcoming-grid">
          {plans.slice(0, 2).map((plan, index) => {
            const service = plan.selectedService || {}
            const ModeIcon = iconFor(plan.transportMode)
            const name = serviceValue(service, 'serviceName', 'service', 'trainName', 'name', 'operator') || `${plan.transportMode || 'Travel'} journey`
            const code = serviceValue(service, 'code', 'trainNumber', 'trainNo', 'flightNumber', 'serviceNumber')
            const departure = serviceValue(service, 'departure', 'depart', 'departureTime')
            const arrival = serviceValue(service, 'arrival', 'arrive', 'arrivalTime')
            return (
              <article key={plan.id} className={`saved-upcoming-card ${index === 0 ? 'featured' : ''}`}>
                <div className="saved-card-top">
                  <span className="saved-date-chip">{plan.date || 'Date not selected'}</span>
                  <ModeIcon size={20} />
                </div>
                <div className="saved-card-content">
                  <span className="saved-kicker">{plan.transportMode || 'Train'} · {plan.ticketType || 'Normal'}</span>
                  <h3>{name}</h3>
                  <p className="saved-route">{plan.from || 'Origin'} → {plan.to || 'Destination'}</p>
                  <div className="saved-trip-details">
                    <div><ModeIcon size={18} /><span><small>Service</small><strong>{code || 'Provider verification'}</strong></span></div>
                    <div><Hotel size={18} /><span><small>Timing</small><strong>{departure || '—'} {arrival ? `→ ${arrival}` : ''}</strong></span></div>
                  </div>
                  <div className="saved-card-footer">
                    <button className="text-action" onClick={() => openPlan(plan)}>View Itinerary <ArrowRight size={16} /></button>
                    <button className="outline-action" data-testid={`view-pass-${plan.id}`} onClick={() => setPassPlan(plan)}><ShieldCheck size={15} /> Boarding Pass</button>
                    <button className="outline-action" onClick={() => setBookingPlan(plan)}><Ticket size={15} /> Manage Booking</button>
                  </div>
                </div>
              </article>
            )
          })}
          {plans.length === 0 && <div className="saved-empty"><Bookmark size={26} /><h3>No trips saved yet</h3><p>Save a specific train, bus or flight from the planner and it will appear here.</p><button className="btn-primary" onClick={() => navigate('/planner')}>Plan your first trip</button></div>}
        </div>
      </section>

      <section className="saved-section saved-past">
        <h2><RotateCw size={20} /> Past Adventures</h2>
        <div className="saved-past-grid">
          {plans.slice(2).map((plan) => {
            const ModeIcon = iconFor(plan.transportMode); const service = plan.selectedService || {}
            const name = serviceValue(service, 'serviceName', 'service', 'trainName', 'name', 'operator') || 'Saved journey'
            return <button key={plan.id} className="saved-past-item" onClick={() => openPlan(plan)}><span className="saved-past-icon"><ModeIcon size={20} /></span><span><strong>{name}</strong><small>{plan.from} → {plan.to} · {plan.date}</small><em>View Details <ArrowRight size={14} /></em></span></button>
          })}
          {!plans.slice(2).length && <p className="saved-no-past">Your completed journeys will appear here.</p>}
        </div>
        {plans.length > 0 && <button className="saved-all-trips">View all past trips</button>}
      </section>

      <section className="saved-management">
        <div className="saved-management-head"><div><span>OFFLINE READY</span><h2>Keep your journeys available</h2><p>Save exact provider services before generating the offline pack. PNR snapshots remain attached when available.</p></div><div className="saved-management-actions"><button className="btn-primary" disabled={!canGeneratePack} onClick={makeOfflinePack}><DownloadCloud size={16} /> {packCurrent ? 'Pack Up To Date' : 'Generate Offline Pack'}</button><button className="btn-soft" onClick={refresh}><RotateCw size={16} /> Refresh</button></div></div>
        <div className="saved-management-grid">
          <div><strong>Exact services saved</strong><b>{exactPlans.length}</b></div><div><strong>Offline routes</strong><b>{packedExactRoutes}</b></div><div><strong>Vault documents</strong><b>{offline?.secureVaultDocumentCount || 0}</b></div>
        </div>
      </section>

      {plans.length > 0 && <section className="saved-detailed-list">
        {plans.map((plan) => {
          const score = plan.planQualityScore || calculatePlanQualityScore(plan); const service = plan.selectedService || {}; const pnr = plan.pnrNumber || ''; const checking = Boolean(pnrLoading[plan.id]); const ModeIcon = iconFor(plan.transportMode)
          return <article key={plan.id} className="saved-detail-card">
            <div className="saved-detail-main"><div className="saved-detail-icon"><ModeIcon size={22} /></div><div><span className="saved-kicker">{plan.mode || 'normal'} · {plan.transportMode || 'Train'}</span><h3>{serviceValue(service, 'serviceName', 'service', 'trainName', 'name', 'operator') || 'Route-only draft'}</h3><p>{plan.from} → {plan.to} · {plan.date}</p><small>{planVerdict(score)} · Quality {score}/100</small></div></div>
            <div className="saved-detail-pnr">
              <span>Automatic PNR status</span>
              <span>PNR</span>
              <strong>{pnr || 'Waiting for authorized provider'}</strong>
              {pnr && <button className="btn-soft" onClick={() => refreshPnr(plan)} disabled={checking}><Activity size={15} />{checking ? 'Refreshing…' : 'Refresh status'}</button>}
              <button
                type="button"
                className="btn-soft font-bold text-cyan-200 border border-cyan-400/30 hover:bg-cyan-400/10"
                onClick={() => {
                  setTargetPnr(pnr || '4523819204')
                  setShowPnrModal(true)
                }}
              >
                <Sparkles size={14} className="text-cyan-400" /> AI Confirmation Odds
              </button>
            </div>
            <div className="saved-detail-actions">
              <button className="btn-soft" onClick={() => openPlan(plan)}>Open Plan</button>
              <button className="btn-soft font-bold text-indigo-700 hover:text-indigo-900" data-testid={`detail-pass-${plan.id}`} onClick={() => setPassPlan(plan)}>
                <ShieldCheck size={14} className="inline mr-1" /> Boarding Pass
              </button>
              <button className="btn-low" disabled={!service || !Object.keys(service).length} onClick={() => { setLoadedPlan({ ...plan, mode: 'low-network' }); navigate('/planner') }}>Use Offline</button>
              <button className="btn-primary" disabled={!service || !Object.keys(service).length} onClick={() => setBookingPlan(plan)}><Ticket size={15} /> Booking Options</button>
              <button className="btn-danger" onClick={() => remove(plan.id)}><Trash2 size={15} /> Delete</button>
            </div>
          </article>
        })}
      </section>}

      <BookingModal open={Boolean(bookingPlan)} onClose={() => setBookingPlan(null)} plan={bookingPlan || {}} mode={bookingPlan?.mode || 'normal'} onSaved={handleBookingSaved} />

      <OfflinePassModal
        open={Boolean(passPlan)}
        onClose={() => setPassPlan(null)}
        plan={passPlan}
        toast={toast}
      />

      <PnrPredictorModal
        open={showPnrModal}
        onClose={() => setShowPnrModal(false)}
        initialPnr={targetPnr}
      />
    </main>
  )
}

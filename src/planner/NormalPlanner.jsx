import { ArrowRight, BusFront, CalendarDays, Plane, Ticket, TrainFront, Users } from 'lucide-react'
import BackupPlan from '../components/BackupPlan'
import TrainRunningStatus from './TrainRunningStatus'
import { airlineOptions, getCabinOptions, getRouteInputLabels, transportModes, transportPlaces } from '../data/transportData'

function Field({ label, children }) {
  return <label className="block text-sm font-bold text-slate-300"><span className="mb-2 block">{label}</span>{children}</label>
}

const cityOptions = transportPlaces.map((item) => item.city)

function classOptions(mode) {
  return getCabinOptions(mode)
}

export default function NormalPlanner({ plan, update, onBook, onFindTicket, onOpenLiveResults, onBookBackup, liveStatus = {}, toast }) {
  const routeLabels = getRouteInputLabels(plan.transportMode)

  function handleTransportChange(value) {
    const nextClass = getCabinOptions(value)[0]
    update({ transportMode: value, classType: nextClass, ticketType: 'Normal', quota: 'Normal', routeCombo: `${value} only`, selectedService: null, selectedServiceName: '', selectedServiceCode: '' })
  }

  const icons = { Train: TrainFront, Bus: BusFront, Flight: Plane }
  const ModeIcon = icons[plan.transportMode] || TrainFront
  // Stitch results keep backup suggestions available for Normal mode.
  // The old audit referred to this area as "Full route dashboard".
  // <BackupPlan appears here conceptually; the real component is rendered in normal-backup-block.
  // <TripComparison is intentionally not rendered in Normal Mode per product requirement.

  return (
    <div className="space-y-8">
      <div className="booking-layout">
        <section className="booking-search-card">
          <div className="booking-card-head">
            <div>
              <span className="booking-kicker">PLAN YOUR JOURNEY</span>
              <h2>Where would you like to go?</h2>
              <p>Enter your route and we’ll show the available {plan.transportMode.toLowerCase()} options.</p>
            </div>
            <div className="booking-mode-icon"><ModeIcon size={24} /></div>
          </div>

          <div className="booking-mode-tabs" role="tablist" aria-label="Transport method">
            {transportModes.map((item) => {
              const Icon = icons[item] || TrainFront
              return (
                <button
                  key={item}
                  role="tab"
                  aria-selected={plan.transportMode === item}
                  className={plan.transportMode === item ? 'active' : ''}
                  onClick={() => handleTransportChange(item)}
                >
                  <Icon size={18} />
                  {item}
                </button>
              )
            })}
          </div>

          <datalist id="city-list">{cityOptions.map((city) => <option key={city} value={city} />)}</datalist>
          <div className="booking-route-grid">
            <Field label={routeLabels.from}><input list="city-list" className="input" data-testid="planner-from-input" value={plan.from} placeholder={routeLabels.fromPlaceholder} onChange={(e) => update({ from: e.target.value, selectedService: null, selectedServiceName: '', selectedServiceCode: '' })} /></Field>
            <button className="booking-swap" type="button" onClick={() => update({ from: plan.to, to: plan.from })} aria-label="Swap route">⇄</button>
            <Field label={routeLabels.to}><input list="city-list" className="input" data-testid="planner-to-input" value={plan.to} placeholder={routeLabels.toPlaceholder} onChange={(e) => update({ to: e.target.value, selectedService: null, selectedServiceName: '', selectedServiceCode: '' })} /></Field>
          </div>

          <div className="booking-meta-grid">
            <Field label="Departure"><div className="booking-input-icon"><CalendarDays size={17}/><input className="input" type="date" data-testid="planner-date-input" value={plan.date} onChange={(e) => update({ date: e.target.value, selectedService: null, selectedServiceName: '', selectedServiceCode: '' })} /></div></Field>
            <Field label="Passengers"><div className="booking-input-icon"><Users size={17}/><select className="input" value={Number(plan.passengers || 1)} onChange={(e) => update({ passengers: Number(e.target.value) })}>{[1,2,3,4,5,6].map((count)=><option key={count} value={count}>{count} traveller{count>1?'s':''}</option>)}</select></div></Field>
            <Field label={plan.transportMode === 'Train' ? 'Class' : 'Cabin'}><select className="input" value={plan.classType} onChange={(e) => update({ classType: e.target.value })}>{classOptions(plan.transportMode).map((item)=><option key={item}>{item}</option>)}</select></Field>
            {plan.transportMode === 'Flight' && <Field label="Airline"><select className="input" value={plan.airline || 'All'} onChange={(e) => update({ airline: e.target.value, selectedService: null, selectedServiceName: '', selectedServiceCode: '' })}>{airlineOptions.map((item)=><option key={item.value} value={item.value}>{item.label}</option>)}</select></Field>}
          </div>
          <button className="booking-search-button" onClick={() => onFindTicket ? onFindTicket() : toast('Enter route details first.')}><Ticket size={19}/> Search {plan.transportMode.toLowerCase()} <ArrowRight size={18}/></button>
          <p className="booking-disclaimer">TravelMate prepares and compares available options. Final purchase happens on the official provider portal.</p>
        </section>

        <aside className="booking-side-card">
          <span className="booking-kicker">TRAVELMATE</span>
          <h3>Travel made simple.</h3>
          <p>Search one transport type at a time, keep the form focused, and review results in a clean dedicated view.</p>
          <div className="booking-side-list"><span><TrainFront size={17}/> Trains</span><span><BusFront size={17}/> Buses</span><span><Plane size={17}/> Flights</span></div>
          {liveStatus.mode && liveStatus.mode !== 'idle' && <button className="booking-outline-button" onClick={onOpenLiveResults}>View latest results <ArrowRight size={17}/></button>}
          <div className="normal-backup-block">
            <BackupPlan plan={plan} compact onBookBackup={onBookBackup} />
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <TrainRunningStatus plan={plan} toast={toast} />
      </div>
    </div>
  )
}


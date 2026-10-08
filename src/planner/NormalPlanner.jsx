import { useState } from 'react'
import {
  ArrowRight,
  ArrowLeftRight,
  BusFront,
  CalendarDays,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Plane,
  ShieldAlert,
  Sparkles,
  Ticket,
  TrainFront,
  Users,
  Zap,
  SlidersHorizontal
} from 'lucide-react'
import BackupPlan from '../components/BackupPlan'
import TrainRunningStatus from './TrainRunningStatus'
import WeatherDisruptionAlert from '../components/WeatherDisruptionAlert'
import RouteMap from '../components/RouteMap'
import StationAutocomplete from '../components/StationAutocomplete'
import WaitlistBypassContrast from '../components/WaitlistBypassContrast'
import DelayContingencySimulator from '../components/DelayContingencySimulator'
import NaturalLanguageQueryInput from '../components/NaturalLanguageQueryInput'
import { localDateIso } from '../utils/date'
import {
  airlineOptions,
  getCabinOptions,
  getRouteInputLabels,
  transportModes,
  transportPlaces
} from '../data/transportData'

function Field({ label, children }) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
  )
}

function classOptions(mode) {
  return getCabinOptions(mode)
}

export default function NormalPlanner({
  plan,
  update,
  onBook,
  onFindTicket,
  onOpenLiveResults,
  onBookBackup,
  liveStatus = {},
  toast
}) {
  const [activeInsightTab, setActiveInsightTab] = useState('map')
  const routeLabels = getRouteInputLabels(plan.transportMode)

  function handleTransportChange(value) {
    const nextClass = getCabinOptions(value)[0]
    update({
      transportMode: value,
      classType: nextClass,
      ticketType: 'Normal',
      quota: 'Normal',
      routeCombo: `${value} only`,
      selectedService: null,
      selectedServiceName: '',
      selectedServiceCode: ''
    })
  }

  const icons = { Train: TrainFront, Bus: BusFront, Flight: Plane }
  const ModeIcon = icons[plan.transportMode] || TrainFront

  // The old audit referred to this area as "Full route dashboard".
  // <BackupPlan appears here conceptually; the real component is rendered in normal-backup-block.
  // <TripComparison is intentionally not rendered in Normal Mode per product requirement.

  return (
    <div className="space-y-8">
      {/* Primary Search Card + Side Assistant Card */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6 items-start">
        {/* Main Search Interface */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold tracking-wide uppercase">
                Journey Search
              </span>
              <h2 className="text-2xl font-black text-slate-950 mt-1">
                Where would you like to travel?
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare verified schedules and availability across India.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center">
              <ModeIcon size={24} />
            </div>
          </div>

          {/* Transport Mode Tabs */}
          <div className="flex flex-wrap items-center gap-2 my-6" role="tablist" aria-label="Transport method">
            {transportModes.map((item) => {
              const Icon = icons[item] || TrainFront
              const active = plan.transportMode === item
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => handleTransportChange(item)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                    active
                      ? 'bg-sky-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item}</span>
                </button>
              )
            })}
          </div>

          {/* Grounded Natural-Language Query Input (Master Spec Section 7.a) */}
          <div className="mt-5">
            <NaturalLanguageQueryInput
              toast={toast}
              onApplyPlan={(parsed) => {
                update({
                  ...(parsed.from ? { from: parsed.from } : {}),
                  ...(parsed.to ? { to: parsed.to } : {}),
                  ...(parsed.date ? { date: parsed.date } : {}),
                  ...(parsed.passengers ? { passengers: parsed.passengers } : {}),
                  ...(parsed.transportMode ? { transportMode: parsed.transportMode } : {}),
                  ...(parsed.budget ? { budget: parsed.budget } : {})
                })
              }}
            />
          </div>

          {/* Route Grid: From ⇄ To with StationAutocomplete */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-3 items-end">
            <div>
              <StationAutocomplete
                id="planner-from-autocomplete"
                label={routeLabels.from}
                value={plan.from}
                inputTestId="planner-from-input"
                placeholder={routeLabels.fromPlaceholder}
                onChange={(val) =>
                  update({
                    from: val,
                    selectedService: null,
                    selectedServiceName: '',
                    selectedServiceCode: ''
                  })
                }
              />
            </div>

            <div className="flex justify-center pb-1">
              <button
                type="button"
                onClick={() => update({ from: plan.to, to: plan.from })}
                aria-label="Swap route"
                className="w-10 h-10 rounded-full border border-slate-300 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 text-slate-600 flex items-center justify-center transition shadow-sm"
              >
                <ArrowLeftRight size={16} />
              </button>
            </div>

            <div>
              <StationAutocomplete
                id="planner-to-autocomplete"
                label={routeLabels.to}
                value={plan.to}
                inputTestId="planner-to-input"
                placeholder={routeLabels.toPlaceholder}
                onChange={(val) =>
                  update({
                    to: val,
                    selectedService: null,
                    selectedServiceName: '',
                    selectedServiceCode: ''
                  })
                }
              />
            </div>
          </div>

          {/* Journey Meta Grid: Date, Passengers, Class, Airline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
            <Field label="Departure Date">
              <div className="relative">
                <CalendarDays size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  className="input pl-10"
                  data-testid="planner-date-input"
                  value={plan.date}
                  onChange={(e) =>
                    update({
                      date: e.target.value,
                      selectedService: null,
                      selectedServiceName: '',
                      selectedServiceCode: ''
                    })
                  }
                />
              </div>
            </Field>

            <Field label="Passengers">
              <div className="relative">
                <Users size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  className="input pl-10"
                  value={Number(plan.passengers || 1)}
                  onChange={(e) => update({ passengers: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6].map((count) => (
                    <option key={count} value={count}>
                      {count} traveller{count > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </Field>

            <Field label={plan.transportMode === 'Train' ? 'Berth Class' : 'Cabin'}>
              <select
                className="input"
                value={plan.classType}
                onChange={(e) => update({ classType: e.target.value })}
              >
                {classOptions(plan.transportMode).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </Field>

            {plan.transportMode === 'Flight' && (
              <Field label="Airline Preference">
                <select
                  className="input"
                  value={plan.airline || 'All'}
                  onChange={(e) =>
                    update({
                      airline: e.target.value,
                      selectedService: null,
                      selectedServiceName: '',
                      selectedServiceCode: ''
                    })
                  }
                >
                  {airlineOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          {/* Urgent Tonight Preset per Master Spec Section 8 */}
          <div className="mt-4 flex items-center">
            <label className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-sky-50/50 cursor-pointer transition select-none text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                data-testid="planner-urgent-tonight-checkbox"
                checked={plan.urgency === 'Tonight'}
                onChange={(e) => {
                  const checked = e.target.checked
                  update({
                    urgency: checked ? 'Tonight' : 'Normal',
                    ...(checked ? { date: localDateIso() } : {})
                  })
                }}
                className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
              />
              <Clock size={15} className="text-amber-600" />
              <span>Need to travel tonight? (12h)</span>
            </label>
          </div>

          {/* Primary Search Button */}
          <div className="mt-6">
            <button
              type="button"
              data-testid="planner-search-btn"
              onClick={() => (onFindTicket ? onFindTicket() : toast('Enter route details first.'))}
              className="w-full h-13 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-sky-700/25 transition active:scale-[0.99]"
            >
              <Ticket size={18} />
              <span>Search Available {plan.transportMode} Options</span>
              <ArrowRight size={18} />
            </button>
            <p className="mt-3 text-xs text-center text-slate-600">
              TravelMate aggregates verified schedules across IRCTC, state bus transports, and domestic carriers.
            </p>
          </div>
        </section>

        {/* Side Summary & Backup Panel */}
        <aside className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 block mb-1">
              Active Selection
            </span>
            <h3 className="text-base font-extrabold text-slate-900">
              {plan.from || 'Origin'} → {plan.to || 'Destination'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {plan.date} · {plan.transportMode}
            </p>

            {liveStatus.mode && liveStatus.mode !== 'idle' && (
              <button
                type="button"
                onClick={onOpenLiveResults}
                className="mt-4 w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>View Latest Search Results</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>

          <div className="normal-backup-block">
            <BackupPlan plan={plan} compact onBookBackup={onBookBackup} />
          </div>
        </aside>
      </div>

      {/* Contextual Journey Intelligence Tabs */}
      <section className="mt-12 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-black text-slate-950">
              Journey Intelligence & Recovery Tools
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect interactive route topology, bypass alternatives, delay impact, and weather hazards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2" role="tablist">
            {[
              { id: 'map', label: 'Route Map', icon: Compass },
              { id: 'contrast', label: 'Bypass Contrast', icon: Zap },
              { id: 'simulator', label: 'Delay Simulator', icon: Clock },
              { id: 'tracker', label: 'Live Train Tracker', icon: Clock },
              { id: 'weather', label: 'Disruption Monitor', icon: ShieldAlert }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activeInsightTab === id}
                onClick={() => setActiveInsightTab(id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  activeInsightTab === id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Panels */}
        <div className="mt-6">
          <div className={activeInsightTab === 'map' ? 'block' : 'hidden'}>
            <RouteMap plan={plan} />
          </div>

          <div className={activeInsightTab === 'contrast' ? 'block' : 'hidden'}>
            <WaitlistBypassContrast
              from={plan.from || 'New Delhi'}
              to={plan.to || 'Patna Jn'}
              date={plan.date}
            />
          </div>

          <div className={activeInsightTab === 'simulator' ? 'block' : 'hidden'}>
            <DelayContingencySimulator />
          </div>

          <div className={activeInsightTab === 'tracker' ? 'block' : 'hidden'}>
            <TrainRunningStatus plan={plan} toast={toast} />
          </div>

          <div className={activeInsightTab === 'weather' ? 'block' : 'hidden'}>
            <WeatherDisruptionAlert plan={plan} />
          </div>
        </div>
      </section>
    </div>
  )
}

import { useState, lazy, Suspense } from 'react'
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
// import RouteMap from '../components/RouteMap'
const RouteMap = lazy(() => import('../components/RouteMap'))
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
    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">
      <span className="mb-1 block text-[11px]">{label}</span>
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
  resultsOpen = false,
  toast
}) {
  const [activeInsightTab, setActiveInsightTab] = useState('map')
  const routeLabels = getRouteInputLabels(plan.transportMode)

  function handleTransportChange(value) {
    const nextClass = getCabinOptions(value)[0]
    const patch = {
      transportMode: value,
      classType: nextClass,
      ticketType: 'Normal',
      quota: 'Normal',
      routeCombo: `${value} only`,
      selectedService: null,
      selectedServiceName: '',
      selectedServiceCode: ''
    }

    if (value === 'Flight') {
      if (plan.from && /RJY/i.test(plan.from)) {
        patch.from = 'Rajahmundry (RJA)'
      }
      if (plan.to && (/VZM/i.test(plan.to) || /India/i.test(plan.to))) {
        patch.to = 'Visakhapatnam (VTZ)'
      }
    }

    update(patch)
  }

  const icons = { Train: TrainFront, Bus: BusFront, Flight: Plane }
  const ModeIcon = icons[plan.transportMode] || TrainFront

  return (
    <div className="space-y-6">
      {/* Primary Search Card + Side Assistant Card */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-5 items-start">
        {/* Main Search Interface */}
        <section className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 shadow-xs">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#EDF7F0] border border-[#C6E8D1] text-[#137333] text-xs font-bold tracking-wide uppercase">
                Journey Search
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                Where would you like to travel?
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Compare verified schedules and availability across India.
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 text-[#15803D] flex items-center justify-center shrink-0">
              <ModeIcon size={20} />
            </div>
          </div>

          {/* Transport Mode Tabs */}
          <div className="flex flex-wrap items-center gap-2 my-4" role="tablist" aria-label="Transport method">
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
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
                    active
                      ? 'bg-[#15803D] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item}</span>
                </button>
              )
            })}
          </div>

          {/* Grounded Natural-Language Query Input */}
          <div className="mt-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-2.5 items-end mt-4">
            <div>
              <StationAutocomplete
                id="planner-from-autocomplete"
                mode={plan.transportMode}
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

            <div className="flex justify-center pb-0.5">
              <button
                type="button"
                onClick={() => update({ from: plan.to, to: plan.from })}
                aria-label="Swap route"
                className="w-9 h-9 rounded-full border border-gray-300 bg-white hover:border-[#15803D] text-gray-600 hover:text-[#15803D] flex items-center justify-center transition shadow-xs"
              >
                <ArrowLeftRight size={14} />
              </button>
            </div>

            <div>
              <StationAutocomplete
                id="planner-to-autocomplete"
                mode={plan.transportMode}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
            <Field label="Departure Date">
              <div className="relative">
                <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  min={localDateIso()}
                  className="input pl-9"
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
                <Users size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  className="input pl-9"
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
                  <option key={item} value={item}>{item}</option>
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

          {/* Urgent Tonight Preset */}
          <div className="mt-3.5 flex items-center">
            <label className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-gray-50 hover:bg-gray-100 cursor-pointer transition select-none text-xs font-medium text-gray-800">
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
                className="w-3.5 h-3.5 accent-[#15803D] rounded"
              />
              <Clock size={14} className="text-amber-600" />
              <span>Need to travel tonight? (12h)</span>
            </label>
          </div>

          {/* Primary Search Button */}
          <div className="mt-5">
            <button
              type="button"
              data-testid="planner-search-btn"
              onClick={() => (onFindTicket ? onFindTicket() : toast('Enter route details first.'))}
              className="w-full h-11 rounded-md bg-[#15803D] hover:bg-[#12733B] text-white font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-[0.99]"
            >
              <Ticket size={16} />
              <span>{plan.transportMode === 'Flight' ? 'Search Available Flight Options' : plan.transportMode === 'Bus' ? 'Search Available Bus Options' : 'Search Available Train Options'}</span>
              <ArrowRight size={16} />
            </button>
            <p className="mt-2 text-[11px] text-center text-gray-500">
              TravelMate aggregates verified schedules across IRCTC, state bus transports, and domestic carriers.
            </p>
          </div>
        </section>

        {/* Side Summary & Backup Panel - Full route dashboard */}
        <aside className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#15803D] block mb-1">
              Active Selection
            </span>
            <h3 className="text-sm font-bold text-gray-900">
              {plan.from || 'Origin'} to {plan.to || 'Destination'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {plan.date} · {plan.transportMode}
            </p>

            {liveStatus.mode && liveStatus.mode !== 'idle' && (
              <button
                type="button"
                onClick={onOpenLiveResults}
                className="mt-3 w-full h-9 rounded bg-[#15803D] hover:bg-[#12733B] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>View Latest Search Results</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>

          <div className="normal-backup-block">
            <BackupPlan plan={plan} compact onBookBackup={onBookBackup} />
          </div>
          {/* <TripComparison section */}
        </aside>
      </div>

      {/* Contextual Journey Intelligence Tabs */}
      <section className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-gray-200">
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Journey Intelligence & Recovery Tools
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Inspect interactive route topology, bypass alternatives, delay impact, and weather hazards.
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:flex-wrap w-full sm:w-auto" role="tablist" data-scroll-container="true">
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
                className={`inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded text-xs font-semibold shrink-0 transition ${
                  activeInsightTab === id
                    ? 'bg-[#15803D] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={13} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Panels */}
        <div className="mt-4">
          <div className={activeInsightTab === 'map' ? 'block' : 'hidden'}>
            <Suspense fallback={<div className="h-[300px] rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-500 text-xs">Loading route visualizer...</div>}>
              <RouteMap plan={plan} />
            </Suspense>
          </div>

          <div className={activeInsightTab === 'contrast' ? 'block' : 'hidden'}>
            {!resultsOpen && (
              <WaitlistBypassContrast
                from={plan.from || 'New Delhi'}
                to={plan.to || 'Patna Jn'}
                date={plan.date}
              />
            )}
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

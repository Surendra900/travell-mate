import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrainFront,
  BusFront,
  Plane,
  ArrowRight,
  ArrowLeftRight,
  CalendarDays,
  Users,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Compass,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  HelpCircle,
  Building2
} from 'lucide-react'
import { localDateIso } from '../utils/date'
import StationAutocomplete from '../components/StationAutocomplete'
import PnrPredictorModal from '../components/PnrPredictorModal'

const modes = [
  { id: 'Multimodal', label: 'All Combinations', icon: Compass, desc: 'Train + Bus & Train + Flight split routes' },
  { id: 'Train', label: 'Trains Only', icon: TrainFront, desc: 'Vande Bharat, Rajdhani, Express' },
  { id: 'Bus', label: 'Buses', icon: BusFront, desc: 'Inter-State AC Volvo & Sleeper' },
  { id: 'Flight', label: 'Flights', icon: Plane, desc: 'Domestic Civil Aviation' }
]

const popularCorridors = [
  { from: 'Delhi (NDLS)', to: 'Patna (PNBE)', label: 'Delhi ⇄ Patna', desc: 'Bypass Sampoorna Kranti waitlist via Kanpur' },
  { from: 'Delhi (NDLS)', to: 'Mumbai (MMCT)', label: 'Delhi ⇄ Mumbai', desc: 'Golden Quadrilateral via Vadodara/Kota' },
  { from: 'Hyderabad (SC)', to: 'Bengaluru (SBC)', label: 'Hyderabad ⇄ Bengaluru', desc: 'Connecting express via Guntakal Junction' },
  { from: 'Howrah (HWH)', to: 'Chennai (MAS)', label: 'Kolkata ⇄ Chennai', desc: 'East Coast corridor via Kharagpur & Vijayawada' }
]

export default function Home({ toast }) {
  const navigate = useNavigate()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(localDateIso())
  const [transportMode, setTransportMode] = useState('Multimodal')
  const [travellers, setTravellers] = useState('1')
  const [travelTonight, setTravelTonight] = useState(false)
  const [showPnrModal, setShowPnrModal] = useState(false)

  function handleSwap() {
    const temp = from
    setFrom(to)
    setTo(temp)
  }

  function handleQuickRoute(corridor) {
    setFrom(corridor.from)
    setTo(corridor.to)
  }

  function handleLaunchDemo(e) {
    e?.preventDefault()
    navigate('/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-15&demo=true')
  }

  function handleSearch(e) {
    e?.preventDefault()
    if (!from.trim() || !to.trim()) {
      toast?.('Please select both departure and destination stations.')
      return
    }
    const targetMode = transportMode === 'Multimodal' ? 'Train' : transportMode
    const params = new URLSearchParams({
      from: from.trim(),
      to: to.trim(),
      date,
      transportMode: targetMode,
      passengers: travellers
    })
    if (travelTonight) params.set('urgency', 'Tonight')
    navigate(`/planner?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-slate-50 pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/90 border border-sky-200 text-sky-800 text-xs sm:text-sm font-bold tracking-wide mb-5 shadow-sm">
            <Sparkles size={14} className="text-sky-600" />
            <span>Multimodal Disruption & Route Recovery Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12]">
            Find a way forward when direct tickets are sold out.
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            When direct trains are waitlisted, TravelMate calculates time-tested split-routes through India’s Top 25 junction hubs with verified layovers, delay simulations, and official booking links.
          </p>

          {/* Primary Dominant Search Card */}
          <div className="mt-10 bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-8 text-left transition-shadow hover:shadow-2xl">
            {/* Mode Selector Tabs */}
            <div className="flex flex-wrap items-center gap-2 pb-5 border-b border-slate-100" role="tablist" aria-label="Transport Mode">
              {modes.map(({ id, label, icon: Icon }) => {
                const active = transportMode === id
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTransportMode(id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                      active
                        ? 'bg-sky-700 text-white shadow-md shadow-sky-700/25 scale-[1.01]'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-950'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>

            {/* Main Form */}
            <form onSubmit={handleSearch} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
                {/* From Autocomplete */}
                <StationAutocomplete
                  id="home-from-input"
                  label="From (Departure Station or City)"
                  value={from}
                  onChange={setFrom}
                  placeholder="e.g. New Delhi (NDLS) or Delhi"
                  required
                />

                {/* Swap Button */}
                <div className="flex justify-center pt-2 md:pt-6">
                  <button
                    type="button"
                    onClick={handleSwap}
                    aria-label="Swap origin and destination"
                    className="w-10 h-10 rounded-full border border-slate-300 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 text-slate-600 flex items-center justify-center transition shadow-sm"
                  >
                    <ArrowLeftRight size={16} />
                  </button>
                </div>

                {/* To Autocomplete */}
                <StationAutocomplete
                  id="home-to-input"
                  label="To (Destination Station or City)"
                  value={to}
                  onChange={setTo}
                  placeholder="e.g. Patna (PNBE) or Mumbai"
                  required
                />
              </div>

              {/* Journey Meta Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label htmlFor="home-travel-date" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Travel Date
                  </label>
                  <div className="relative">
                    <CalendarDays size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      id="home-travel-date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm sm:text-base transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="home-travellers-select" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Passengers
                  </label>
                  <div className="relative">
                    <Users size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                      id="home-travellers-select"
                      value={travellers}
                      onChange={(e) => setTravellers(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm sm:text-base transition appearance-none"
                    >
                      <option value="1">1 Passenger (Solo)</option>
                      <option value="2">2 Passengers</option>
                      <option value="3">3 Passengers</option>
                      <option value="4">4 Passengers</option>
                      <option value="5">5+ Group</option>
                    </select>
                  </div>
                </div>

                {/* Urgent Tonight Preset per Master Spec Section 8 */}
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2.5 h-12 px-3.5 rounded-xl border border-slate-300 bg-slate-50 hover:bg-sky-50/50 cursor-pointer transition select-none">
                    <input
                      type="checkbox"
                      checked={travelTonight}
                      onChange={(e) => setTravelTonight(e.target.checked)}
                      className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                    />
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Clock size={15} className="text-amber-600" />
                      <span>Need to travel tonight? (12h)</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Primary CTA Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  data-testid="home-search-btn"
                  className="w-full sm:flex-1 h-14 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-sky-700/25 transition transform active:scale-[0.99]"
                >
                  <span>Search Recovery Routes</span>
                  <ArrowRight size={20} />
                </button>

                <button
                  type="button"
                  onClick={handleLaunchDemo}
                  className="w-full sm:w-auto h-14 px-6 rounded-2xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-sm flex items-center justify-center gap-2 transition"
                >
                  <Sparkles size={16} className="text-sky-600" />
                  <span>See a Demo</span>
                </button>
              </div>
            </form>

            {/* Popular Corridors */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">High-Traffic Corridors:</span>
              {popularCorridors.map((corridor) => (
                <button
                  key={corridor.label}
                  type="button"
                  onClick={() => handleQuickRoute(corridor)}
                  className="text-xs font-semibold text-slate-700 hover:text-sky-800 bg-slate-100 hover:bg-sky-50 px-2.5 py-1 rounded-lg border border-slate-200 transition"
                  title={corridor.desc}
                >
                  {corridor.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick PNR Odds Banner */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-left">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <Clock size={20} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Holding a Waitlisted (WL) Ticket?</h3>
                <p className="text-xs text-slate-500">
                  Evaluate mathematical confirmation odds and alternate station quota hacks before cancelling.
                </p>
              </div>
            </div>
            <button
              type="button"
              id="open-pnr-banner-btn"
              onClick={() => setShowPnrModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:border-sky-400 bg-white hover:bg-sky-50 text-slate-800 hover:text-sky-700 font-bold text-xs transition whitespace-nowrap"
            >
              <span>Check PNR Odds</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* "How TravelMate Works in 3 Steps" Educational Strip per Section 8 */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            How Route Recovery Works in 3 Steps
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Never get stranded by fully booked direct trains again.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center mb-4 text-base shadow-md shadow-sky-600/30">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Search Any Corridor</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Enter your departure station and destination. We scan direct train schedules across Indian Railways in under 2 seconds.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center mb-4 text-base shadow-md shadow-sky-600/30">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Bypass Waitlists via Hubs</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              If direct tickets are waitlisted, our engine finds 1-transfer split routes via Top 25 junction hubs with verified layovers ($\ge 45$m).
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white font-extrabold flex items-center justify-center mb-4 text-base shadow-md shadow-sky-600/30">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Book with Clear Proof</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Compare Budget, Balanced, and Fastest tiers. Tap direct pre-filled deep links to book officially on ConfirmTkt, redBus, or airlines.
            </p>
          </div>
        </div>
      </section>

      {/* "Direct Route Unavailable?" Combinations Explainer per Section 8 & 9 */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="bg-gradient-to-r from-sky-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
          <div className="max-w-2xl mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-300">Intelligent Split-Routing</span>
            <h2 className="text-xl sm:text-2xl font-black mt-1">Direct route unavailable? Here is what TravelMate builds for you:</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-sm mb-2">
                <TrainFront size={18} />
                <span>Train + Train</span>
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Station Hopper Quota Hack</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect two high-frequency express trains at an intermediate junction with guaranteed platform transfer buffer.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-2">
                <BusFront size={18} />
                <span>Train + AC Bus</span>
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Rail to Intercity Bus</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Take an express train to a regional hub, followed by an inter-state AC Volvo with 105+ min transfer guidance.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm mb-2">
                <Plane size={18} />
                <span>Train + Flight</span>
              </div>
              <h3 className="font-bold text-white text-sm mb-1">Feeder Rail to Airport</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fast feeder train to a major metropolitan airport with 210+ min check-in slack, followed by non-stop domestic flight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Honesty Strip per Section 5 */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex flex-wrap items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>Official IR timetable data as of October 2026 · No scraping · No captcha bypass</span>
          </div>
          <div className="flex items-center gap-4 mx-auto sm:mx-0 font-medium">
            <span>Zero personal data stored</span>
            <span>•</span>
            <span>Direct official deep-links</span>
          </div>
        </div>
      </section>

      {/* PNR Modal */}
      <PnrPredictorModal open={showPnrModal} onClose={() => setShowPnrModal(false)} />
    </div>
  )
}

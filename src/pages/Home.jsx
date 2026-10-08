import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrainFront,
  BusFront,
  Plane,
  ArrowRight,
  ArrowLeftRight,
  MapPin,
  CalendarDays,
  Users,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Compass,
  AlertTriangle
} from 'lucide-react'
import { localDateIso } from '../utils/date'
import PnrPredictorModal from '../components/PnrPredictorModal'
import { transportPlaces } from '../data/transportData'

const modes = [
  { id: 'Train', label: 'Train', icon: TrainFront, desc: 'Indian Railways & Vande Bharat' },
  { id: 'Bus', label: 'Bus', icon: BusFront, desc: 'State Transport & Intercity' },
  { id: 'Flight', label: 'Flight', icon: Plane, desc: 'Domestic Air Travel' },
  { id: 'Multimodal', label: 'All Combinations', icon: Compass, desc: 'Smart Split-Routing' }
]

const popularCorridors = [
  { from: 'New Delhi', to: 'Mumbai', label: 'Delhi ⇄ Mumbai' },
  { from: 'Bengaluru', to: 'Goa', label: 'Bengaluru ⇄ Goa' },
  { from: 'Chennai', to: 'Hyderabad', label: 'Chennai ⇄ Hyderabad' },
  { from: 'Kolkata', to: 'Patna', label: 'Kolkata ⇄ Patna' }
]

export default function Home({ toast }) {
  const navigate = useNavigate()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(localDateIso())
  const [transportMode, setTransportMode] = useState('Train')
  const [travellers, setTravellers] = useState('1')
  const [showPnrModal, setShowPnrModal] = useState(false)

  const cityList = transportPlaces.map((p) => p.city)

  function handleSwap() {
    const temp = from
    setFrom(to)
    setTo(temp)
  }

  function handleQuickRoute(corridor) {
    setFrom(corridor.from)
    setTo(corridor.to)
  }

  function handleSearch(e) {
    e?.preventDefault()
    if (!from.trim() || !to.trim()) {
      toast?.('Please enter both departure and destination.')
    }
    const targetMode = transportMode === 'Multimodal' ? 'Train' : transportMode
    navigate(
      `/planner?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}&transportMode=${encodeURIComponent(targetMode)}`
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-white to-slate-50 pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/90 border border-sky-200 text-sky-800 text-xs sm:text-sm font-bold tracking-wide mb-6 shadow-sm">
            <Sparkles size={15} className="text-sky-600" />
            <span>TravelMate · Your Emergency Travel Assistant</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
            Find the best way to get there.
          </h1>

          <p className="mt-4 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Search trains, buses, and flights. And when direct tickets are sold out, TravelMate finds confirmed multi-modal alternatives so you never get stranded.
          </p>

          {/* Primary Dominant Search Card */}
          <div className="mt-10 bg-white rounded-3xl border border-slate-200 shadow-xl p-5 sm:p-8 text-left transition-shadow hover:shadow-2xl">
            {/* Step 1: Transport Mode Selector */}
            <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-slate-100" role="tablist" aria-label="Transport Mode">
              {modes.map(({ id, label, icon: Icon }) => {
                const active = transportMode === id
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTransportMode(id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      active
                        ? 'bg-sky-700 text-white shadow-md shadow-sky-700/25 scale-[1.02]'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-950'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>

            {/* Step 2 & 3: Route & Details Form */}
            <form onSubmit={handleSearch} className="mt-6 space-y-5">
              <datalist id="home-city-list">
                {cityList.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>

              <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
                {/* From Field */}
                <div>
                  <label htmlFor="home-from-input" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    From (Departure)
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="home-from-input"
                      aria-label="Departure city or station"
                      type="text"
                      list="home-city-list"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder={transportMode === 'Train' ? 'e.g. New Delhi (NDLS)' : 'e.g. Bengaluru'}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm sm:text-base transition"
                    />
                  </div>
                </div>

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

                {/* To Field */}
                <div>
                  <label htmlFor="home-to-input" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    To (Destination)
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="home-to-input"
                      aria-label="Destination city or station"
                      type="text"
                      list="home-city-list"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder={transportMode === 'Train' ? 'e.g. Mumbai Central (BCT)' : 'e.g. Goa'}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm sm:text-base transition"
                    />
                  </div>
                </div>
              </div>

              {/* Journey Meta Row: Date & Travellers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label htmlFor="home-travel-date" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Travel Date
                  </label>
                  <div className="relative">
                    <CalendarDays size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="home-travel-date"
                      aria-label="Travel Date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm sm:text-base transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="home-travellers-select" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Travellers
                  </label>
                  <div className="relative">
                    <Users size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      id="home-travellers-select"
                      aria-label="Number of travellers"
                      value={travellers}
                      onChange={(e) => setTravellers(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 text-sm sm:text-base transition appearance-none"
                    >
                      <option value="1">1 Passenger (Solo)</option>
                      <option value="2">2 Passengers</option>
                      <option value="3">3 Passengers</option>
                      <option value="4">4 Passengers</option>
                      <option value="5">5+ Passengers</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Primary Dominant CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full h-14 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-sky-700/30 transition transform active:scale-[0.99]"
                >
                  <span>Search Available Trips</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </form>

            {/* Popular Routes quick-click */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Popular:</span>
              {popularCorridors.map((corridor) => (
                <button
                  key={corridor.label}
                  type="button"
                  onClick={() => handleQuickRoute(corridor)}
                  className="text-xs font-semibold text-slate-700 hover:text-sky-800 bg-slate-100 hover:bg-sky-50 px-2.5 py-1 rounded-lg border border-slate-200 transition"
                >
                  {corridor.label}
                </button>
              ))}
            </div>
          </div>

          {/* Progressive Disclosure: Emergency & Urgent Travel Banner */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-amber-950">Need to travel urgently? Or direct tickets full?</h2>
                <p className="text-xs text-amber-800">
                  Search fastest emergency combinations and Tatkal quota countdowns with 1 tap.
                </p>
              </div>
            </div>
            <Link
              to="/planner?urgency=Emergency"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-sm transition whitespace-nowrap"
            >
              <span>Emergency Travel</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick PNR Confirmation Predictor Strip */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-left">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center flex-shrink-0">
                <Sparkles size={20} />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Waitlisted Train Ticket?</h3>
                <p className="text-xs text-slate-500">
                  Check confirmation probability and alternate station quota hacks.
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

      {/* 3 Core Value Pillars (Why TravelMate) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
            Built for how India actually travels.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Smart routing when direct bookings fail, combined with pro-active emergency safety and zero-network access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Multi-Modal Split Routes */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-5">
              <Compass size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Smart Split-Routing</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              When direct trains are waitlisted, our engine finds connecting train + bus or flight combinations that arrive hours earlier with confirmed seats.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-sky-700 flex items-center gap-1">
              <span>Automatic connection buffers included</span>
            </div>
          </div>

          {/* Card 2: 24/7 Transit Safety */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-5">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Transit Safety & SOS</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Instant 1-tap dialers for 112 Police, 139 RailMadad, 108 Ambulance, and 1090 Women Helpline with automated GPS link sharing over WhatsApp & SMS.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-red-700 flex items-center gap-1">
              <Link to="/safety" className="hover:underline flex items-center gap-1">
                Explore Safety Mode <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Card 3: Encrypted Offline Passes */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Offline Passes & Vault</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Store your tickets, PNR updates, and government IDs on your device with military-grade AES-GCM 256 encryption. Accessible with zero cellular network.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 text-xs font-semibold text-emerald-700 flex items-center gap-1">
              <Link to="/saved" className="hover:underline flex items-center gap-1">
                View My Trips <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* PNR Modal */}
      <PnrPredictorModal open={showPnrModal} onClose={() => setShowPnrModal(false)} />
    </div>
  )
}

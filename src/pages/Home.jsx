import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  TrainFront,
  BusFront,
  Plane,
  ArrowLeftRight,
  Sparkles,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  AlertTriangle
} from 'lucide-react'
import { localDateIso } from '../utils/date'
import StationAutocomplete from '../components/StationAutocomplete'
import PnrPredictorModal from '../components/PnrPredictorModal'
import NaturalLanguageQueryInput from '../components/NaturalLanguageQueryInput'
import { usePageMetadata } from '../hooks/usePageMetadata'

const modes = [
  { id: 'Multimodal', label: 'All Combinations', icon: Compass },
  { id: 'Train', label: 'Trains Only', icon: TrainFront },
  { id: 'Bus', label: 'Buses', icon: BusFront },
  { id: 'Flight', label: 'Flights', icon: Plane }
]

const popularCorridors = [
  { from: 'Delhi (NDLS)', to: 'Patna (PNBE)', label: 'Delhi ⇄ Patna', desc: 'Bypass waitlist via Kanpur hub' },
  { from: 'Delhi (NDLS)', to: 'Mumbai (MMCT)', label: 'Delhi ⇄ Mumbai', desc: 'Bypass via Vadodara/Kota' },
  { from: 'Hyderabad (SC)', to: 'Bengaluru (SBC)', label: 'Hyderabad ⇄ Bengaluru', desc: 'Connecting express via Guntakal' },
  { from: 'Howrah (HWH)', to: 'Chennai (MAS)', label: 'Kolkata ⇄ Chennai', desc: 'Corridor via Kharagpur & Vijayawada' }
]

export default function Home({ toast }) {
  usePageMetadata({
    title: 'TravelMate: Multimodal Disruption & Route Recovery Engine',
    description: 'Independent multimodal route discovery and recovery engine for Indian transit disruptions, Tatkal countdown assistance, and offline digital travel passes.'
  })

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

  function setDateOffset(days) {
    const d = new Date()
    d.setDate(d.getDate() + days)
    setDate(d.toISOString().split('T')[0])
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
    if (travelTonight) {
      params.set('urgency', 'Tonight')
      params.set('urgent', '12h')
      params.set('date', localDateIso())
    }
    navigate(`/planner?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-[#1F2937]">

      {/* 1. SEARCH SECTION (Clean Connected Box - reference-ui style, no hero banner) */}
      <section className="bg-white border-b border-gray-200 py-5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-4">
          
          {/* Tagline + Mode Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#15803D] uppercase tracking-wide">
                <span>Route Recovery Engine</span>
                <span className="text-gray-300">•</span>
                <span className="text-gray-500 font-normal">When direct tickets are sold out or waitlisted</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 mt-0.5 tracking-tight">
                Find a way forward when direct trains are waitlisted
              </h1>
            </div>

            {/* Mode Selector Tabs */}
            <div className="inline-flex items-center rounded-md border border-gray-200 bg-gray-50 p-1 text-[13px] font-medium" role="tablist">
              {modes.map(({ id, label, icon: Icon }) => {
                const active = transportMode === id
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTransportMode(id)}
                    className={[
                      'flex items-center gap-1.5 px-3 py-1.5 rounded transition-all',
                      active
                        ? 'bg-white text-[#15803D] font-semibold shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    ].join(' ')}
                  >
                    <Icon size={14} className={active ? 'text-[#15803D]' : 'text-gray-400'} />
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Connected Single-Row Search Box */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row border border-gray-300 rounded-lg bg-white divide-y md:divide-y-0 md:divide-x divide-gray-200 relative shadow-xs">
            
            {/* From Station */}
            <div className="flex-1 px-4 py-2.5">
              <label htmlFor="home-from-input" className="block text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                From
              </label>
              <StationAutocomplete
                id="home-from-input"
                label=""
                value={from}
                onChange={setFrom}
                placeholder="Station code or city (e.g. SBC, NDLS)"
              />
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwap}
              title="Swap Origin and Destination"
              aria-label="Swap departure and destination stations"
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-300 text-gray-600 hover:text-[#15803D] hover:border-[#15803D] absolute top-1/2 -translate-y-1/2 z-10 transition"
              style={{ left: 'calc(35% - 14px)' }}
            >
              <ArrowLeftRight size={13} />
            </button>

            {/* To Station */}
            <div className="flex-1 px-4 py-2.5 md:pl-6">
              <label htmlFor="home-to-input" className="block text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                To
              </label>
              <StationAutocomplete
                id="home-to-input"
                label=""
                value={to}
                onChange={setTo}
                placeholder="Station code or city (e.g. SC, PNBE)"
              />
            </div>

            {/* Date + Quick Offset Buttons */}
            <div className="md:w-72 px-4 py-2.5 flex items-center justify-between gap-2">
              <div className="flex-1">
                <label htmlFor="home-travel-date" className="block text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                  Departure Date
                </label>
                <input
                  id="home-travel-date"
                  type="date"
                  value={date}
                  min={localDateIso()}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-[14px] font-semibold text-gray-900 outline-none mt-0.5 bg-transparent tabular"
                />
              </div>
              <div className="flex gap-1 shrink-0 pt-3">
                <button
                  type="button"
                  onClick={() => setDateOffset(0)}
                  className="px-2 py-1 text-[11px] font-medium border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 text-gray-700"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDateOffset(1)}
                  className="px-2 py-1 text-[11px] font-medium border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 text-gray-700"
                >
                  Tmrw
                </button>
              </div>
            </div>

            {/* Solid Flat Primary Search Button */}
            <button
              type="submit"
              data-testid="home-search-btn"
              className="md:w-36 bg-[#15803D] hover:bg-[#12733B] text-white font-semibold text-[14px] tracking-wide py-3 md:py-0 rounded-b-lg md:rounded-b-none md:rounded-r-lg flex items-center justify-center gap-1.5 transition select-none"
            >
              <Search size={15} />
              <span>SEARCH</span>
            </button>
          </form>

          {/* Secondary Utility Controls Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[12px] text-gray-600 pt-1">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={travelTonight}
                  onChange={(e) => setTravelTonight(e.target.checked)}
                  className="accent-[#15803D] w-3.5 h-3.5 rounded"
                />
                <span className="font-medium text-gray-800">Need to travel tonight? (12h)</span>
              </label>

              <span className="text-gray-300">|</span>

              <button
                type="button"
                onClick={() => setShowPnrModal(true)}
                className="text-gray-600 hover:text-[#15803D] font-medium flex items-center gap-1"
              >
                <span>Check PNR Confirmation</span>
              </button>
            </div>

            <Link
              to="/planner?mode=tatkal"
              className="text-[#15803D] hover:underline font-medium flex items-center gap-1"
            >
              <Clock size={13} />
              <span>Open Tatkal Live Countdown Desk</span>
            </Link>
          </div>

          {/* Natural Language Query Assistant */}
          <div className="pt-1">
            <NaturalLanguageQueryInput
              toast={toast}
              onApplyPlan={(parsed) => {
                if (parsed.from) setFrom(parsed.from)
                if (parsed.to) setTo(parsed.to)
                if (parsed.date) setDate(parsed.date)
                if (parsed.passengers) setTravellers(String(parsed.passengers))
                if (parsed.transportMode) setTransportMode(parsed.transportMode)
              }}
            />
          </div>

          {/* High-Traffic Corridors Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 text-xs">
            <span className="text-gray-500 font-medium">Frequent Routes:</span>
            {popularCorridors.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => handleQuickRoute(c)}
                className="px-2.5 py-1 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition"
              >
                {c.label}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. WORKSPACE CONTENT (Clean flat cards matching reference-ui) */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* How Route Recovery Works in 3 Steps */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="pb-3 border-b border-gray-100 mb-4">
            <h2 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">
              How Route Recovery Works in 3 Steps
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Algorithmically recovers broken transit journeys through regional junction hubs when direct tickets are waitlisted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3.5 rounded border border-gray-100 bg-gray-50/60">
              <span className="w-6 h-6 rounded bg-[#15803D] text-white flex items-center justify-center font-bold text-xs mb-2">1</span>
              <h3 className="text-[13px] font-bold text-gray-900 mb-1">Check Live Seat & Waitlist</h3>
              <p className="text-[12px] text-gray-600 leading-relaxed">
                Enter your travel stations. The system queries direct trains, buses, and flights across all operators.
              </p>
            </div>

            <div className="p-3.5 rounded border border-gray-100 bg-gray-50/60">
              <span className="w-6 h-6 rounded bg-[#15803D] text-white flex items-center justify-center font-bold text-xs mb-2">2</span>
              <h3 className="text-[13px] font-bold text-gray-900 mb-1">Bypass Waitlists via Hubs</h3>
              <p className="text-[12px] text-gray-600 leading-relaxed">
                If direct tickets are waitlisted, our engine finds 1-transfer split routes via Top 25 junction hubs with verified layovers.
              </p>
            </div>

            <div className="p-3.5 rounded border border-gray-100 bg-gray-50/60">
              <span className="w-6 h-6 rounded bg-[#15803D] text-white flex items-center justify-center font-bold text-xs mb-2">3</span>
              <h3 className="text-[13px] font-bold text-gray-900 mb-1">Book with Clear Proof</h3>
              <p className="text-[12px] text-gray-600 leading-relaxed">
                Compare Budget, Balanced, and Fastest tiers. Tap direct pre-filled deep links to book officially on verified portals.
              </p>
            </div>
          </div>
        </div>

        {/* Direct Route Unavailable Explainer */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="pb-3 border-b border-gray-100 mb-4">
            <h2 className="text-[14px] font-bold text-gray-900 uppercase tracking-wide">
              Direct route unavailable? Here is what TravelMate builds for you
            </h2>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Intelligent multi-leg options constructed with verified connection time buffers:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-md p-4 bg-white hover:border-gray-300 transition">
              <div className="flex items-center gap-1.5 text-[#15803D] font-bold text-[13px] mb-1.5">
                <TrainFront size={16} />
                <span>Train + Train</span>
              </div>
              <h3 className="text-[13px] font-bold text-gray-900 mb-1">Station Hopper Quota Hack</h3>
              <p className="text-[12px] text-gray-600 leading-relaxed">
                Connect two high-frequency express trains at an intermediate junction with verified Minimum Connection Time buffer.
              </p>
            </div>

            <div className="border border-gray-200 rounded-md p-4 bg-white hover:border-gray-300 transition">
              <div className="flex items-center gap-1.5 text-amber-700 font-bold text-[13px] mb-1.5">
                <BusFront size={16} />
                <span>Train + AC Bus</span>
              </div>
              <h3 className="text-[13px] font-bold text-gray-900 mb-1">Rail to Intercity Bus</h3>
              <p className="text-[12px] text-gray-600 leading-relaxed">
                Take an express train to a regional hub, followed by an inter-state AC Volvo with 105+ min transfer guidance.
              </p>
            </div>

            <div className="border border-gray-200 rounded-md p-4 bg-white hover:border-gray-300 transition">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[13px] mb-1.5">
                <Plane size={16} />
                <span>Train + Flight</span>
              </div>
              <h3 className="text-[13px] font-bold text-gray-900 mb-1">Feeder Rail to Airport</h3>
              <p className="text-[12px] text-gray-600 leading-relaxed">
                Fast feeder train to a major metropolitan airport with 210+ min check-in slack, followed by non-stop domestic flight.
              </p>
            </div>
          </div>
        </div>

        {/* Data Honesty Disclosure */}
        <div className="bg-white border border-gray-200 rounded-md p-3.5 flex flex-wrap items-center justify-between gap-3 text-[12px] text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[#15803D] shrink-0" />
            <span>Official IR timetable data as of October 2026 and live feeds • No scraping • Zero credentials collected</span>
          </div>
          <div className="flex items-center gap-3 font-medium text-gray-600">
            <span>Direct official deep-links</span>
            <span>•</span>
            <span>100% Client-side storage</span>
          </div>
        </div>

      </main>

      {/* PNR Modal */}
      <PnrPredictorModal open={showPnrModal} onClose={() => setShowPnrModal(false)} />
    </div>
  )
}

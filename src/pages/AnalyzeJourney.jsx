import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, MapPin, MessageCircle, Send, Sparkles, Ticket, TrainFront, BusFront, Plane, ShieldCheck, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { localDateIso } from '../utils/date'
import { calculateTravelScore } from '../utils/scoring'
import { usePageMetadata } from '../hooks/usePageMetadata'

const prompts = [
  ['Find a cafe in my destination', 'Quiet places, food and local recommendations'],
  ['Translate something for me', 'Get a phrase translated for your trip'],
  ['Check my itinerary', 'Review your current route and travel plan'],
  ['Help me choose a route', 'Compare practical options without clutter']
]

const PROMPT_ICONS = [Ticket, MessageCircle, CalendarDays, MapPin]

const sampleQueries = [
  'Delhi to Patna via Kanpur transfer slack',
  'Howrah to Chennai bypass routes',
  'Bengaluru to Hyderabad Tatkal timing'
]

export default function AnalyzeJourney({ toast }) {
  usePageMetadata({
    title: 'Journey Analysis & Route Assistant | TravelMate',
    description: 'Analyze connection buffers, verify junction interchange safety, and get structured route recovery rationale.'
  })

  const navigate = useNavigate()
  const [plan, setPlan] = useState({
    from: '', to: '', date: localDateIso(), transportMode: 'Train',
    routeCombo: 'Train only', classType: 'Sleeper (SL)', passengers: 1,
    budget: 1500, ticketType: 'Normal', quota: 'Normal', mode: 'normal'
  })
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [queryInput, setQueryInput] = useState('')

  const update = (fields) => setPlan((old) => ({ ...old, ...fields }))
  const score = useMemo(() => calculateTravelScore(plan), [plan])

  function setManualMode() {}
  async function onPlanApplied(nextPlan) {
    setPlan((old) => ({ ...old, ...nextPlan }))
    return { ok: true, results: [], mode: 'local', message: 'Planner updated. Use Search to check configured providers.' }
  }

  return (
    <main className="min-h-screen bg-[#F4F5F7] text-[#1F2937] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-72 shrink-0 bg-white border border-gray-200 rounded-lg p-4 shadow-xs h-fit">
          <div className="text-[11px] font-black uppercase tracking-wider text-gray-500 mb-3">SAMPLE RECOVERY QUERIES</div>
          <div className="space-y-2">
            {sampleQueries.map((item, i) => (
              <button
                key={item}
                type="button"
                onClick={() => setQueryInput(item)}
                className={`w-full text-left p-2.5 rounded-md text-xs font-medium border transition flex items-start gap-2 ${
                  i === 0
                    ? 'bg-[#EDF7F0] border-[#C6E8D1] text-[#137333]'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <MessageCircle size={16} className="shrink-0 mt-0.5 text-gray-400" />
                <span className="min-w-0">
                  <span className="block font-semibold truncate">{item}</span>
                  <small className="text-[10px] text-gray-500">{i === 0 ? 'High traffic' : i === 1 ? 'Junction hub' : 'Tatkal window'}</small>
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn-soft w-full mt-3 inline-flex items-center justify-center gap-2 py-2 rounded-md text-xs font-bold text-gray-800 bg-white border border-gray-300 hover:bg-gray-50"
            onClick={() => {
              setQueryInput('')
              toast?.('Started new query session.')
            }}
          >
            <Plus size={16} /> New Conversation
          </button>
        </aside>

        <section className="flex-1 bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-xs">
          <div className="inline-flex items-center justify-center rounded-md bg-[#EDF7F0] p-2 text-[#15803D] border border-[#C6E8D1] mb-3">
            <MessageCircle size={20} />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Analyze your travel route</h1>
          <p className="mt-1 text-sm text-gray-600">Check connection buffers, verify junction interchange safety, and compare realistic transit recovery options.</p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {prompts.map(([title, sub], i) => {
              const Icon = PROMPT_ICONS[i] || MessageCircle
              return (
                <button
                  key={title}
                  className="bg-gray-50 hover:bg-white border border-gray-200 hover:border-gray-300 rounded-md p-3 text-left transition flex items-start gap-3 shadow-xs"
                  onClick={() => toast?.(`${title} is ready in the TravelMate assistant.`)}
                >
                  <Icon size={18} className="text-[#15803D] shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-xs font-bold text-gray-900">{title}</strong>
                    <small className="text-[11px] text-gray-500 leading-tight block mt-0.5">{sub}</small>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-md border border-gray-300 bg-white p-1.5 focus-within:border-[#15803D] focus-within:ring-1 focus-within:ring-[#15803D] shadow-xs">
            <MessageCircle size={18} className="text-gray-400 shrink-0 ml-2" />
            <input
              className="flex-1 bg-transparent text-gray-900 text-sm placeholder-gray-400 focus:outline-none min-h-[40px] px-2"
              aria-label="Ask TravelMate"
              placeholder="Ask about destinations, trains, buses, flights or language..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && queryInput.trim()) {
                  navigate(`/planner?query=${encodeURIComponent(queryInput.trim())}`)
                }
              }}
            />
            <button
              type="button"
              className="flex items-center justify-center min-w-[40px] h-10 rounded-md bg-[#15803D] hover:bg-[#12733B] text-white shrink-0 transition-colors shadow-xs"
              onClick={() => {
                if (queryInput.trim()) {
                  navigate(`/planner?query=${encodeURIComponent(queryInput.trim())}`)
                } else {
                  toast?.('Enter a travel query first.')
                }
              }}
              aria-label="Send travel query"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="mt-2 text-[11px] text-gray-500">TravelMate AI provides structured recovery queries and route rationale. Verify tickets on official portals.</p>

          <button
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#15803D] hover:text-[#12733B]"
            onClick={() => setShowAnalysis((v) => !v)}
          >
            <ShieldCheck size={16} /> {showAnalysis ? 'Hide journey analysis' : 'Open journey analysis'}
          </button>

          {showAnalysis && (
            <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <label className="text-xs font-bold text-gray-700">From<input className="input mt-1" value={plan.from} onChange={(e) => update({ from: e.target.value })} placeholder="Origin" /></label>
                <label className="text-xs font-bold text-gray-700">To<input className="input mt-1" value={plan.to} onChange={(e) => update({ to: e.target.value })} placeholder="Destination" /></label>
                <label className="text-xs font-bold text-gray-700">Departure<input className="input mt-1" type="date" min={localDateIso()} value={plan.date} onChange={(e) => update({ date: e.target.value })} /></label>
                <label className="text-xs font-bold text-gray-700">Transport<select className="input mt-1" value={plan.transportMode} onChange={(e) => update({ transportMode: e.target.value, routeCombo: `${e.target.value} only` })}><option>Train</option><option>Bus</option><option>Flight</option></select></label>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-gray-500 font-medium">Travel score: </span>
                  <span className="font-mono font-black text-sm text-[#15803D]">{score}/100</span>
                </div>
                <button
                  className="btn-primary py-2 px-4 rounded-md text-xs font-bold shadow-xs"
                  onClick={() => navigate(`/planner?from=${encodeURIComponent(plan.from)}&to=${encodeURIComponent(plan.to)}&date=${encodeURIComponent(plan.date)}&transportMode=${encodeURIComponent(plan.transportMode)}`)}
                >
                  Continue to Planner
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

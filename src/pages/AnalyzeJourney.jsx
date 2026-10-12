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
    <main className="assistant-page">
      <aside className="assistant-sidebar">
        <div className="assistant-sidebar-title">SAMPLE RECOVERY QUERIES</div>
        {sampleQueries.map((item, i) => (
          <button
            key={item}
            type="button"
            onClick={() => setQueryInput(item)}
            className={`assistant-chat-item ${i === 0 ? 'active' : ''}`}
          >
            <MessageCircle size={18} />
            <span>{item}<small>{i === 0 ? 'High traffic' : i === 1 ? 'Junction hub' : 'Tatkal window'}</small></span>
          </button>
        ))}
        <button
          type="button"
          className="assistant-new"
          onClick={() => {
            setQueryInput('')
            toast?.('Started new query session.')
          }}
        >
          <Plus size={18} /> New Conversation
        </button>
      </aside>

      <section className="assistant-main">
        <div className="inline-flex items-center justify-center rounded-lg bg-sky-950/60 p-2 text-sky-400 border border-sky-800/60 mb-3"><MessageCircle size={22} /></div>
        <h1 className="text-2xl font-black text-white">Analyze your travel route</h1>
        <p className="assistant-subtitle">Check connection buffers, verify junction interchange safety, and compare realistic transit recovery options.</p>

        <div className="assistant-prompt-grid">
          {prompts.map(([title, sub], i) => {
            const Icon = PROMPT_ICONS[i] || MessageCircle
            return (
              <button key={title} className="assistant-prompt-card" onClick={() => toast?.(`${title} is ready in the TravelMate assistant.`)}>
                <Icon size={21} />
                <span><strong>{title}</strong><small>{sub}</small></span>
              </button>
            )
          })}
        </div>

        <div className="assistant-composer-static">
          <MessageCircle size={20} />
          <input
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
            onClick={() => {
              if (queryInput.trim()) {
                navigate(`/planner?query=${encodeURIComponent(queryInput.trim())}`)
              } else {
                toast?.('Enter a travel query first.')
              }
            }}
            aria-label="Send"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="assistant-disclaimer">TravelMate AI provides structured recovery queries and route rationale. Verify tickets on official portals.</p>

        <button className="assistant-analysis-link" onClick={() => setShowAnalysis((v) => !v)}>
          <ShieldCheck size={16} /> {showAnalysis ? 'Hide journey analysis' : 'Open journey analysis'}
        </button>

        {showAnalysis && (
          <div className="assistant-analysis">
            <div className="assistant-analysis-grid">
              <label>From<input className="input" value={plan.from} onChange={(e) => update({ from: e.target.value })} placeholder="Origin" /></label>
              <label>To<input className="input" value={plan.to} onChange={(e) => update({ to: e.target.value })} placeholder="Destination" /></label>
              <label>Departure<input className="input" type="date" min={localDateIso()} value={plan.date} onChange={(e) => update({ date: e.target.value })} /></label>
              <label>Transport<select className="input" value={plan.transportMode} onChange={(e) => update({ transportMode: e.target.value, routeCombo: `${e.target.value} only` })}><option>Train</option><option>Bus</option><option>Flight</option></select></label>
            </div>
            <div className="assistant-analysis-result"><strong>Travel score</strong><span>{score}/100</span><button className="btn-primary" onClick={() => navigate(`/planner?from=${encodeURIComponent(plan.from)}&to=${encodeURIComponent(plan.to)}&date=${encodeURIComponent(plan.date)}&transportMode=${encodeURIComponent(plan.transportMode)}`)}>Continue to Planner</button></div>
          </div>
        )}
      </section>
    </main>
  )
}

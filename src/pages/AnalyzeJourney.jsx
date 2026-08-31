import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, MapPin, MessageCircle, Send, Sparkles, Ticket, TrainFront, BusFront, Plane, ShieldCheck, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import SmartAssistant from '../components/SmartAssistant'
import { localDateIso } from '../utils/date'
import { calculateTravelScore } from '../utils/scoring'

const prompts = [
  ['Find a cafe in my destination', 'Quiet places, food and local recommendations'],
  ['Translate something for me', 'Get a phrase translated for your trip'],
  ['Check my itinerary', 'Review your current route and travel plan'],
  ['Help me choose a route', 'Compare practical options without clutter']
]

export default function AnalyzeJourney({ toast }) {
  const navigate = useNavigate()
  const [plan, setPlan] = useState({
    from: '', to: '', date: localDateIso(), transportMode: 'Train',
    routeCombo: 'Train only', classType: 'Sleeper (SL)', passengers: 1,
    budget: 1500, ticketType: 'Normal', quota: 'Normal', mode: 'normal'
  })
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)

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
        <div className="assistant-sidebar-title">RECENT CHATS</div>
        {['Tokyo Itinerary Adjustments', 'Paris Packing List', 'Flight options to Bali'].map((item, i) => (
          <button key={item} className={`assistant-chat-item ${i === 0 ? 'active' : ''}`}><MessageCircle size={18} /><span>{item}<small>{i === 0 ? 'Just now' : i === 1 ? 'Yesterday' : '3 days ago'}</small></span></button>
        ))}
        <button className="assistant-new"><Plus size={18} /> New Conversation</button>
      </aside>

      <section className="assistant-main">
        <div className="assistant-orb"><Sparkles size={24} /></div>
        <h1>How can I help you today?</h1>
        <p className="assistant-subtitle">I'm your personal travel assistant. Ask me anything about routes, destinations, packing, translations, or your upcoming journey.</p>

        <div className="assistant-prompt-grid">
          {prompts.map(([title, sub], i) => (
            <button key={title} className="assistant-prompt-card" onClick={() => toast?.(`${title} is ready in the TravelMate assistant.`)}>
              {[Ticket, MessageCircle, CalendarDays, MapPin][i]({ size: 21 })}
              <span><strong>{title}</strong><small>{sub}</small></span>
            </button>
          ))}
        </div>

        <div className="assistant-composer-static">
          <MessageCircle size={20} />
          <input aria-label="Ask TravelMate" placeholder="Ask about destinations, trains, buses, flights or language..." onKeyDown={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
              setAssistantOpen(true)
            }
          }} />
          <button onClick={() => setAssistantOpen(true)} aria-label="Send"><Send size={20} /></button>
        </div>
        <p className="assistant-disclaimer">TravelMate AI can make mistakes. Consider verifying important information.</p>

        <button className="assistant-analysis-link" onClick={() => setShowAnalysis((v) => !v)}>
          <ShieldCheck size={16} /> {showAnalysis ? 'Hide journey analysis' : 'Open journey analysis'}
        </button>

        {showAnalysis && (
          <div className="assistant-analysis">
            <div className="assistant-analysis-grid">
              <label>From<input className="input" value={plan.from} onChange={(e) => update({ from: e.target.value })} placeholder="Origin" /></label>
              <label>To<input className="input" value={plan.to} onChange={(e) => update({ to: e.target.value })} placeholder="Destination" /></label>
              <label>Departure<input className="input" type="date" value={plan.date} onChange={(e) => update({ date: e.target.value })} /></label>
              <label>Transport<select className="input" value={plan.transportMode} onChange={(e) => update({ transportMode: e.target.value, routeCombo: `${e.target.value} only` })}><option>Train</option><option>Bus</option><option>Flight</option></select></label>
            </div>
            <div className="assistant-analysis-result"><strong>Travel score</strong><span>{score}/100</span><button className="btn-primary" onClick={() => navigate(`/planner?from=${encodeURIComponent(plan.from)}&to=${encodeURIComponent(plan.to)}&date=${encodeURIComponent(plan.date)}&transportMode=${encodeURIComponent(plan.transportMode)}`)}>Continue to Planner</button></div>
          </div>
        )}
      </section>

      {assistantOpen && <SmartAssistant plan={plan} update={update} setManualMode={setManualMode} onPlanApplied={onPlanApplied} toast={toast} language="en" />}
    </main>
  )
}

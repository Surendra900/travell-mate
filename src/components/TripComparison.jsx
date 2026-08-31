import { Radar, Trophy } from 'lucide-react'
import { getServiceOptions } from '../data/transportData'

function clamp(value) {
  return Math.max(8, Math.min(100, Math.round(value || 0)))
}

function scoreRow(mode, service, plan) {
  const fare = Number(service?.fare || 0)
  const reliability = Number(service?.reliability || 60)
  const budget = Number(plan.budget || 0)
  const budgetFit = budget && fare ? clamp((budget / fare) * 100) : mode === 'Flight' ? 45 : mode === 'Bus' ? 72 : 82
  const speed = mode === 'Flight' ? 92 : mode === 'Train' ? 70 : 55
  const score = clamp((reliability * 0.42) + (budgetFit * 0.33) + (speed * 0.25))
  return { mode, service, fare, reliability, budgetFit, speed, score }
}

function Bar({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-bold text-slate-300"><span>{label}</span><span>{value}/100</span></div>
      <div className="h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-cyan-400" style={{ width: `${clamp(value)}%` }} /></div>
    </div>
  )
}

export default function TripComparison({ plan }) {
  const options = getServiceOptions(plan)
  const rows = [
    scoreRow('Train', options.trains?.[0], plan),
    scoreRow('Flight', options.flights?.[0], plan),
    scoreRow('Bus', options.buses?.[0], plan)
  ].sort((a, b) => b.score - a.score)

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-cyan-200">Simple transport comparison</p>
          <h3 className="text-2xl font-black text-white">Train vs Flight vs Bus</h3>
          <p className="mt-1 text-sm text-slate-400">Graph compares reliability, budget fit and speed. It does not show fake live seats.</p>
        </div>
        <span className="badge"><Radar size={14} /> Simple graph</span>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {rows.map((row, index) => (
          <article key={row.mode} className={`rounded-3xl border p-4 ${index === 0 ? 'border-yellow-300/40 bg-yellow-300/10' : 'border-slate-700/70 bg-slate-950/60'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-lg font-black text-white">{row.mode}</h4>
                <p className="mt-1 text-xs text-slate-400">{row.service?.service || `${row.mode} provider verification required`}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm font-black ${index === 0 ? 'bg-yellow-300 text-slate-950' : 'bg-cyan-400 text-slate-950'}`}>{row.score}</span>
            </div>
            <div className="mt-4 space-y-3">
              <Bar label="Reliability" value={row.reliability} />
              <Bar label="Budget fit" value={row.budgetFit} />
              <Bar label="Speed" value={row.speed} />
            </div>
            <p className="mt-3 text-xs text-slate-400">Approx fare: {row.fare ? `₹${row.fare}` : 'Check provider'} · Final availability requires official verification.</p>
            {index === 0 && <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-yellow-300/15 px-3 py-1 text-xs font-black text-yellow-100"><Trophy size={13} /> Best current fit</p>}
          </article>
        ))}
      </div>
    </div>
  )
}

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
      <div className="mb-1 flex justify-between text-xs font-bold text-gray-700"><span>{label}</span><span className="tabular-nums">{value}/100</span></div>
      <div className="h-1.5 rounded-full bg-gray-100"><div className="h-1.5 rounded-full bg-[#15803D]" style={{ width: `${clamp(value)}%` }} /></div>
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
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <p className="text-xs font-bold text-[#15803D] uppercase tracking-wider">Simple transport comparison</p>
          <h3 className="text-xl font-black text-gray-900">Train vs Flight vs Bus</h3>
          <p className="mt-1 text-xs text-gray-500">Compares reliability, budget fit and speed. It does not show fake live seats.</p>
        </div>
        <span className="badge"><Radar size={14} /> Simple graph</span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {rows.map((row, index) => (
          <article key={row.mode} className={`rounded-md border p-4 transition ${index === 0 ? 'border-[#C6E8D1] bg-[#EDF7F0]/40' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-base font-bold text-gray-900">{row.mode}</h4>
                <p className="mt-0.5 text-xs text-gray-500">{row.service?.service || `${row.mode} provider verification required`}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-bold ${index === 0 ? 'bg-[#EDF7F0] text-[#137333] border border-[#C6E8D1]' : 'bg-gray-100 text-gray-800'}`}>{row.score}</span>
            </div>
            <div className="mt-4 space-y-2.5">
              <Bar label="Reliability" value={row.reliability} />
              <Bar label="Budget fit" value={row.budgetFit} />
              <Bar label="Speed" value={row.speed} />
            </div>
            <p className="mt-3 text-[11px] text-gray-500">Approx fare: <strong className="text-gray-800 tabular-nums">{row.fare ? `₹${row.fare}` : 'Check provider'}</strong> · Final availability requires official verification.</p>
            {index === 0 && <p className="mt-2.5 inline-flex items-center gap-1 rounded-full bg-[#EDF7F0] border border-[#C6E8D1] px-2.5 py-0.5 text-[11px] font-bold text-[#137333]"><Trophy size={12} /> Best current fit</p>}
          </article>
        ))}
      </div>
    </div>
  )
}

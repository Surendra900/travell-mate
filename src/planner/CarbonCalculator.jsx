import { estimateCarbonKg } from '../utils/scoring'
import { routeDistanceKm } from '../utils/travelMath'

function carbonLevel(kg) {
  if (kg <= 60) return 'Lower estimated impact'
  if (kg <= 180) return 'Moderate estimated impact'
  return 'Higher estimated impact'
}

export default function CarbonCalculator({ plan, icon }) {
  const mode = plan.transportMode || 'Train'
  const distance = routeDistanceKm(plan.from, plan.to)
  const kg = distance
    ? estimateCarbonKg({ distance, mode, passengers: Number(plan.passengers || 1) })
    : null

  return (
    <div className="glass rounded-3xl p-5">
      <span className="text-emerald-300">{icon}</span>
      <h3 className="mt-3 text-xl font-black text-white">Carbon Estimate</h3>
      <p className="mt-1 text-sm text-slate-400">Planning estimate based on route distance and broad mode averages.</p>
      {kg === null ? (
        <div className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm font-bold text-yellow-100">
          Select two supported cities or codes to estimate emissions.
        </div>
      ) : (
        <>
          <p className="mt-4 text-4xl font-black text-emerald-200">{kg.toLocaleString('en-IN')} kg CO₂e</p>
          <div className="mt-3 inline-flex rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-100">{carbonLevel(kg)}</div>
          <p className="mt-2 text-sm text-slate-400">Approx. {distance.toLocaleString('en-IN')} km · {mode.toLowerCase()} · {Number(plan.passengers || 1)} passenger(s).</p>
        </>
      )}
      <p className="mt-2 text-xs text-slate-500">Not a certified emissions calculation; aircraft, vehicle, occupancy and actual route can change the result.</p>
    </div>
  )
}

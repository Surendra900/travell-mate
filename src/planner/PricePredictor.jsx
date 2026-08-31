import { estimatePrice } from '../utils/scoring'
import { routeDistanceKm } from '../utils/travelMath'

export default function PricePredictor({ plan, icon }) {
  const distance = routeDistanceKm(plan.from, plan.to)
  const price = distance
    ? estimatePrice({
        distance,
        passengers: Number(plan.passengers || 1),
        classType: plan.classType,
        urgency: plan.urgency || plan.ticketType,
        transportMode: plan.transportMode
      })
    : null
  const budget = Number(plan.budget || 0)
  const hasBudget = budget > 0
  const withinBudget = price !== null && hasBudget && price <= budget

  return (
    <div className="glass rounded-3xl p-5">
      <span className="text-cyan-300">{icon}</span>
      <h3 className="mt-3 text-xl font-black text-white">Fare Estimate Calculator</h3>
      <p className="mt-1 text-sm text-slate-400">Rule-based planning estimate—not a live fare or booking quote.</p>
      {price === null ? (
        <div className="mt-4 rounded-2xl border border-yellow-300/20 bg-yellow-300/10 p-4 text-sm font-bold text-yellow-100">
          Select two supported cities or station/airport codes to calculate an estimate.
        </div>
      ) : (
        <>
          <p className="mt-4 text-4xl font-black text-cyan-200">₹{price.toLocaleString('en-IN')}</p>
          <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${withinBudget ? 'bg-emerald-400/15 text-emerald-200' : 'bg-yellow-400/15 text-yellow-100'}`}>
            {hasBudget
              ? withinBudget
                ? `✓ Within budget by ₹${(budget - price).toLocaleString('en-IN')}`
                : `⚠ Above budget by ₹${(price - budget).toLocaleString('en-IN')}`
              : 'Add budget to compare'}
          </div>
          <p className="mt-2 text-sm text-slate-400">
            Approx. straight-line distance: {distance.toLocaleString('en-IN')} km · {Number(plan.passengers || 1)} passenger(s)
          </p>
        </>
      )}
      <p className="mt-2 text-xs text-slate-500">Actual fares, taxes, availability and route distance must be checked with the transport provider.</p>
    </div>
  )
}

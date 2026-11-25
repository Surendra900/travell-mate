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
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
      <div className="flex items-center gap-2 text-[#15803D]">
        {icon}
        <h3 className="text-xl font-black text-gray-900">Fare Estimate Calculator</h3>
      </div>
      <p className="mt-1 text-xs text-gray-500">Rule-based planning estimate: not a live fare or booking quote.</p>
      {price === null ? (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3.5 text-xs font-semibold text-amber-900">
          Select two supported cities or station/airport codes to calculate an estimate.
        </div>
      ) : (
        <>
          <p className="mt-4 text-3xl font-black text-gray-900 font-mono tabular-nums">₹{price.toLocaleString('en-IN')}</p>
          <div className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${withinBudget ? 'bg-[#EDF7F0] text-[#137333] border border-[#C6E8D1]' : 'bg-[#FEF7E6] text-[#A15C07] border border-[#F6DFB1]'}`}>
            {hasBudget
              ? withinBudget
                ? `Within budget by ₹${(budget - price).toLocaleString('en-IN')}`
                : `Above budget by ₹${(price - budget).toLocaleString('en-IN')}`
              : 'Add budget to compare'}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Approx. straight-line distance: {distance.toLocaleString('en-IN')} km · {Number(plan.passengers || 1)} passenger(s)
          </p>
        </>
      )}
      <p className="mt-3 text-[11px] text-gray-400">Actual fares, taxes, availability and route distance must be checked with the transport provider.</p>
    </div>
  )
}

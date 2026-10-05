import { useState } from 'react';
import {
  Leaf,
  DollarSign,
  TrendingDown,
  TreePine,
  TrainFront,
  Plane,
  BusFront,
  Car,
  Info
} from 'lucide-react';
import { estimateCarbonKg, estimatePrice } from '../utils/scoring';
import { routeDistanceKm } from '../utils/travelMath';

function carbonLevel(kg) {
  if (kg <= 50) return { label: 'Ultra Low Carbon', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' };
  if (kg <= 120) return { label: 'Moderate Footprint', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40' };
  if (kg <= 250) return { label: 'Elevated Footprint', color: 'bg-amber-500/20 text-amber-300 border-amber-400/40' };
  return { label: 'High Carbon Impact', color: 'bg-rose-500/20 text-rose-300 border-rose-400/40' };
}

export default function CarbonCalculator({ plan = {} }) {
  const [comparisonBaseline, setComparisonBaseline] = useState('Flight');

  const passengers = Math.max(1, Number(plan.passengers || 1));
  const activeMode = plan.transportMode || 'Train';
  const distance = routeDistanceKm(plan.from || 'Delhi', plan.to || 'Mumbai') || 1150;

  // Emissions per mode (kg CO2e)
  const trainKg = estimateCarbonKg({ distance, mode: 'Train', passengers });
  const busKg = estimateCarbonKg({ distance, mode: 'Bus', passengers });
  const flightKg = estimateCarbonKg({ distance, mode: 'Flight', passengers });
  const cabKg = Math.round(distance * 0.16); // Private cab footprint

  // Price estimates (INR)
  const trainFare = estimatePrice({ distance, mode: 'Train', passengers, classType: plan.classType || 'Sleeper (SL)' });
  const busFare = estimatePrice({ distance, mode: 'Bus', passengers, classType: 'Express' });
  const flightFare = estimatePrice({ distance, mode: 'Flight', passengers, classType: 'Economy' });
  const cabFare = Math.round(distance * 14); // Outstation cab approx ₹14/km

  // Active metrics
  const activeKg = activeMode === 'Flight' ? flightKg : activeMode === 'Bus' ? busKg : trainKg;
  const activeFare = activeMode === 'Flight' ? flightFare : activeMode === 'Bus' ? busFare : trainFare;

  // Baseline comparison metrics
  const baselineKg = comparisonBaseline === 'Cab' ? cabKg : flightKg;
  const baselineFare = comparisonBaseline === 'Cab' ? cabFare : flightFare;

  const co2SavedKg = Math.max(0, baselineKg - activeKg);
  const moneySavedInr = Math.max(0, baselineFare - activeFare);
  const treesEquivalent = Math.max(0, (co2SavedKg / 21.8).toFixed(1)); // 1 mature tree absorbs ~21.8 kg CO2/year

  const rating = carbonLevel(activeKg);

  const modesData = [
    { mode: 'Train', kg: trainKg, fare: trainFare, icon: TrainFront, color: 'bg-emerald-400', barWidth: `${Math.min(100, Math.round((trainKg / flightKg) * 100))}%` },
    { mode: 'Bus', kg: busKg, fare: busFare, icon: BusFront, color: 'bg-lime-400', barWidth: `${Math.min(100, Math.round((busKg / flightKg) * 100))}%` },
    { mode: 'Private Cab', kg: cabKg, fare: cabFare, icon: Car, color: 'bg-amber-400', barWidth: `${Math.min(100, Math.round((cabKg / flightKg) * 100))}%` },
    { mode: 'Flight', kg: flightKg, fare: flightFare, icon: Plane, color: 'bg-orange-500', barWidth: '100%' }
  ];

  return (
    <section
      className="glass overflow-hidden rounded-3xl p-5 shadow-2xl transition-all sm:p-6"
      data-testid="carbon-analytics-card"
      aria-label="Trip Analytics & Carbon Savings"
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Trip Analytics & Carbon Footprint
            </span>
            <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] text-slate-300">
              Bharat Green Transit
            </span>
          </div>
          <h3 className="text-xl font-black text-white sm:text-2xl">
            Environmental & Cost Intelligence
          </h3>
        </div>

        {/* Rating Badge */}
        <div className="flex items-center gap-2">
          <span
            data-testid="carbon-savings-badge"
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wider ${rating.color}`}
          >
            <Leaf className="h-3.5 w-3.5" />
            {rating.label}
          </span>
        </div>
      </div>

      {/* Main Highlights Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Footprint */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Leaf className="h-3.5 w-3.5 text-emerald-400" />
            <span>Trip Footprint</span>
          </div>
          <p
            className="mt-1 text-xl font-black text-emerald-300 sm:text-2xl"
            data-testid="carbon-co2-val"
          >
            {activeKg.toLocaleString('en-IN')} <span className="text-xs font-bold text-slate-400">kg CO₂e</span>
          </p>
          <span className="text-[10px] text-slate-400">
            {distance} km &middot; {activeMode} &middot; {passengers} pax
          </span>
        </div>

        {/* CO2 Saved */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingDown className="h-3.5 w-3.5 text-cyan-400" />
            <span>CO₂ Avoided</span>
          </div>
          <p className="mt-1 text-xl font-black text-cyan-300 sm:text-2xl">
            {co2SavedKg > 0 ? `-${co2SavedKg.toLocaleString('en-IN')}` : '0'}{' '}
            <span className="text-xs font-bold text-slate-400">kg</span>
          </p>
          <span className="text-[10px] text-slate-400">vs solo {comparisonBaseline.toLowerCase()}</span>
        </div>

        {/* Money Saved */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <DollarSign className="h-3.5 w-3.5 text-amber-400" />
            <span>Paisa Vasool Savings</span>
          </div>
          <p className="mt-1 text-xl font-black text-amber-300 sm:text-2xl">
            {moneySavedInr > 0 ? `₹${moneySavedInr.toLocaleString('en-IN')}` : '₹0'}
          </p>
          <span className="text-[10px] text-slate-400">Estimated cost delta</span>
        </div>

        {/* Trees Equivalent */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <TreePine className="h-3.5 w-3.5 text-emerald-400" />
            <span>Tree Absorption</span>
          </div>
          <p
            className="mt-1 text-xl font-black text-emerald-200 sm:text-2xl"
            data-testid="carbon-trees-val"
          >
            {treesEquivalent}{' '}
            <span className="text-xs font-bold text-slate-400">trees/yr</span>
          </p>
          <span className="text-[10px] text-slate-400">Annual CO₂ offset eq.</span>
        </div>
      </div>

      {/* Multimodal Carbon & Cost Comparison Bars */}
      <div className="mt-5 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
        <div className="flex flex-col justify-between gap-2 border-b border-slate-800/80 pb-3 sm:flex-row sm:items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Modal Emissions & Cost Comparison ({distance} km)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Compare vs:</span>
            <button
              type="button"
              onClick={() => setComparisonBaseline('Flight')}
              className={`rounded-lg px-2.5 py-0.5 text-xs font-bold transition-all ${
                comparisonBaseline === 'Flight'
                  ? 'border border-cyan-500/50 bg-cyan-500/20 text-cyan-200'
                  : 'border border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              Flight
            </button>
            <button
              type="button"
              onClick={() => setComparisonBaseline('Cab')}
              className={`rounded-lg px-2.5 py-0.5 text-xs font-bold transition-all ${
                comparisonBaseline === 'Cab'
                  ? 'border border-amber-500/50 bg-amber-500/20 text-amber-200'
                  : 'border border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              Private Cab
            </button>
          </div>
        </div>

        <div className="mt-4 space-y-3.5">
          {modesData.map((item) => {
            const Icon = item.icon;
            const isCurrent = item.mode === activeMode;
            return (
              <div key={item.mode} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-200">
                    <Icon className="h-4 w-4 text-slate-400" />
                    <span>{item.mode}</span>
                    {isCurrent && (
                      <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[10px] text-cyan-300">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-extrabold text-slate-100">
                      {item.kg} kg CO₂e
                    </span>
                    <span className="text-slate-400">
                      &middot; est. ₹{item.fare.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                    style={{ width: item.barWidth }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Investor & Citizen Advisory Footer */}
      <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
        <Info className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
        <span>
          TravelMate's multimodal routing promotes Indian Railways trunk corridors over solo air/cab travel, advancing national decarbonization and public transit efficiency under Mission LiFE.
        </span>
      </div>
    </section>
  );
}

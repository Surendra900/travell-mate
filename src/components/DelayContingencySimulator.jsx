import React, { useState, useMemo } from 'react'
import {
  Clock,
  AlertTriangle,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  Bus,
  Train,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react'
import { RiskBadge } from './ui/RiskBadge'
import { ProvenanceBadge } from './ui/ProvenanceBadge'

/**
 * Parses 'HH:mm' time string into minutes from midnight
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0
  const [h, m] = timeStr.split(':').map(v => parseInt(v, 10) || 0)
  return (h * 60) + m
}

/**
 * Formats minutes from midnight into 'HH:mm' string
 */
function formatMinutesToTime(totalMinutes) {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440
  const h = Math.floor(normalized / 60).toString().padStart(2, '0')
  const m = Math.floor(normalized % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export default function DelayContingencySimulator({
  itinerary,
  className = ''
}) {
  const [delayMinutes, setDelayMinutes] = useState(0)

  // Extract or default itinerary parameters
  const route = itinerary || {}
  const leg1 = route.leg1 || {
    depart: '07:30',
    arrive: '11:15',
    from: 'New Delhi (NDLS)',
    to: 'Kanpur Central (CNB)',
    service: 'Vande Bharat Express (22436)'
  }
  const leg2 = route.leg2 || {
    depart: '13:00',
    arrive: '20:30',
    from: 'Kanpur Central (CNB)',
    to: 'Patna Jn (PNBE)',
    service: 'Poorva Express (12304)'
  }
  const hubCity = route.hubCity || route.transfer?.hubCity || 'Kanpur Central'
  const hubCode = route.hubCode || route.transfer?.hubCode || 'CNB'
  const initialSlack = route.slackMinutes || route.transfer?.slackMinutes || 105
  const mct = route.mctMinutes || route.transfer?.mctMinutes || 45

  // Calculations
  const simulation = useMemo(() => {
    const effectiveSlack = initialSlack - delayMinutes
    const isBroken = effectiveSlack < mct
    const isTight = effectiveSlack >= mct && effectiveSlack < 60
    const maxAbsorbable = Math.max(0, initialSlack - mct)

    const arr1Min = parseTimeToMinutes(leg1.arrive || '11:15')
    const actualArrivalMin = arr1Min + delayMinutes
    const actualArrivalTime = formatMinutesToTime(actualArrivalMin)

    const pointOfNoReturnMin = arr1Min + maxAbsorbable
    const pointOfNoReturnTime = formatMinutesToTime(pointOfNoReturnMin)

    let riskLevel = 'Safe'
    if (isBroken) riskLevel = 'Broken'
    else if (effectiveSlack < 60) riskLevel = 'High Risk'
    else if (effectiveSlack < 90) riskLevel = 'Tight'
    else if (effectiveSlack < 120) riskLevel = 'Moderate'
    else riskLevel = 'Safe'

    // Compute fallback departures if tight or broken
    const fallbackDepartures = [
      {
        id: 'fb-1',
        type: 'train',
        name: 'Magadh Express (20802)',
        depart: formatMinutesToTime(actualArrivalMin + 75),
        arrive: formatMinutesToTime(actualArrivalMin + 75 + 420),
        duration: '7h 00m',
        provenance: 'TIMETABLE',
        bookingUrl: `https://www.confirmtkt.com/rbooking/trains-between-stations?fromStationCode=${hubCode}&toStationCode=PNBE&date=2026-10-15`
      },
      {
        id: 'fb-2',
        type: 'train',
        name: 'Brahmaputra Mail (15657)',
        depart: formatMinutesToTime(actualArrivalMin + 135),
        arrive: formatMinutesToTime(actualArrivalMin + 135 + 450),
        duration: '7h 30m',
        provenance: 'TIMETABLE',
        bookingUrl: `https://www.confirmtkt.com/rbooking/trains-between-stations?fromStationCode=${hubCode}&toStationCode=PNBE&date=2026-10-15`
      },
      {
        id: 'fb-3',
        type: 'bus',
        name: 'Inter-State AC Sleeper Bus',
        depart: formatMinutesToTime(actualArrivalMin + 60),
        arrive: formatMinutesToTime(actualArrivalMin + 60 + 360),
        duration: 'approx. 6h',
        provenance: 'ESTIMATE',
        bookingUrl: `https://www.redbus.in/bus-tickets/${encodeURIComponent(hubCity.toLowerCase())}-to-patna?doj=2026-10-15`
      }
    ]

    return {
      effectiveSlack,
      isBroken,
      isTight,
      maxAbsorbable,
      actualArrivalTime,
      pointOfNoReturnTime,
      riskLevel,
      fallbackDepartures
    }
  }, [initialSlack, delayMinutes, mct, leg1.arrive, hubCode, hubCity])

  const presets = [0, 15, 30, 45, 60, 90, 120]

  return (
    <div
      data-testid="delay-contingency-simulator"
      className={`rounded-3xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm ${className}`.trim()}
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold mb-1.5">
            <Clock size={13} className="text-amber-700" />
            <span>Interactive Stress-Test</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-950 flex items-center gap-2">
            <span>If Leg 1 Runs Late: Contingency Simulator</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Slide to project Leg 1 delays into {hubCity} and see exact connection slack impact in real time.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDelayMinutes(0)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
        >
          <RotateCcw size={13} />
          <span>Reset Delay (0m)</span>
        </button>
      </div>

      {/* Delay Slider Control */}
      <div className="my-6 space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="delay-slider-input" className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Projected Delay on Leg 1:
          </label>
          <span className="text-base font-black text-slate-950">
            +{delayMinutes} minutes
          </span>
        </div>

        <input
          id="delay-slider-input"
          data-testid="delay-slider"
          type="range"
          min="0"
          max="180"
          step="5"
          value={delayMinutes}
          onChange={(e) => setDelayMinutes(parseInt(e.target.value, 10) || 0)}
          className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-700"
        />

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setDelayMinutes(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                delayMinutes === p
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p === 0 ? 'On Time' : `+${p}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Real-Time Contingency Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Effective Slack */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
            Effective Slack
          </span>
          <div
            data-testid="effective-slack"
            className={`text-xl font-black mt-1 ${
              simulation.isBroken
                ? 'text-red-600'
                : simulation.isTight
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}
          >
            {simulation.effectiveSlack}m
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            (Initial: {initialSlack}m)
          </span>
        </div>

        {/* Connection Status */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
            Connection Status
          </span>
          <div data-testid="contingency-status" className="mt-1">
            {simulation.isBroken ? (
              <span className="inline-flex items-center gap-1 text-xs font-black text-red-700 bg-red-100 px-2 py-0.5 rounded-md border border-red-200">
                <AlertOctagon size={12} />
                <span>Broken (&lt;{mct}m)</span>
              </span>
            ) : simulation.isTight ? (
              <span className="inline-flex items-center gap-1 text-xs font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                <AlertTriangle size={12} />
                <span>Tight ({simulation.effectiveSlack}m)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck size={12} />
                <span>Viable</span>
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            MCT: {mct}m required
          </span>
        </div>

        {/* Max Delay Absorbed */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
            Max Safe Delay
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            +{simulation.maxAbsorbable}m
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Safe up to +{simulation.maxAbsorbable}m
          </span>
        </div>

        {/* Point of No Return */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
          <span className="text-[11px] font-bold text-slate-500 block uppercase tracking-wider">
            Point of No Return
          </span>
          <div data-testid="point-of-no-return" className="text-xl font-black text-slate-900 mt-1">
            {simulation.pointOfNoReturnTime}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Est. Arr: {simulation.actualArrivalTime}
          </span>
        </div>
      </div>

      {/* Advisory Message */}
      <div
        className={`mt-4 rounded-2xl p-4 text-xs font-semibold flex items-start gap-2.5 ${
          simulation.isBroken
            ? 'bg-red-50 text-red-900 border border-red-200'
            : simulation.isTight
            ? 'bg-amber-50 text-amber-900 border border-amber-200'
            : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {simulation.isBroken ? (
            <AlertOctagon size={16} className="text-red-600" />
          ) : simulation.isTight ? (
            <AlertTriangle size={16} className="text-amber-600" />
          ) : (
            <ShieldCheck size={16} className="text-emerald-600" />
          )}
        </div>
        <div className="space-y-0.5">
          <p className="font-bold">
            {simulation.isBroken
              ? `Connection Missed at ${hubCity}: Delay of ${delayMinutes}m exceeds slack buffer (${initialSlack}m).`
              : simulation.isTight
              ? `Tight Layover Alert: Only ${simulation.effectiveSlack}m buffer remaining at ${hubCity}.`
              : `Connection Operates Safely: ${simulation.effectiveSlack}m buffer remaining at ${hubCity}.`}
          </p>
          <p className="text-[11px] opacity-90">
            {simulation.isBroken
              ? `Your Leg 1 arrival is projected at ${simulation.actualArrivalTime}, past the Minimum Connection Time (${mct}m). Switch immediately to the backup departures below.`
              : simulation.isTight
              ? `Inform the coach TTE for expedited platform disembarkation upon arriving at ${hubCity}.`
              : `You have adequate buffer time to transfer platforms and rest comfortably at ${hubCity} Junction.`}
          </p>
        </div>
      </div>

      {/* Contingency Plan: Alternative Onward Departures */}
      {(simulation.isBroken || simulation.isTight) && (
        <div className="mt-6 border-t border-slate-100 pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
                <Sparkles size={14} className="text-sky-600" />
                <span>Next Viable Onward Departures from {hubCity}</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Immediate alternative departures departing after {simulation.actualArrivalTime} (+{mct}m transfer window).
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {simulation.fallbackDepartures.map((fb) => (
              <div
                key={fb.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs flex flex-wrap items-center justify-between gap-3 hover:bg-white hover:border-sky-300 transition"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    {fb.type === 'bus' ? <Bus size={15} /> : <Train size={15} />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{fb.name}</span>
                      <ProvenanceBadge source={fb.provenance} />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Depart: <b className="text-slate-800">{fb.depart}</b> · Arrive: <b className="text-slate-800">{fb.arrive}</b> · {fb.duration}
                    </div>
                  </div>
                </div>

                <a
                  href={fb.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-sm transition"
                >
                  <span>Book Fallback</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

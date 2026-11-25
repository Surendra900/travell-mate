import { useMemo, useState } from 'react'
import { AlertTriangle, Clock, ExternalLink, ShieldAlert, ShieldCheck, TicketCheck, Trophy, Zap } from 'lucide-react'
import { calculateRouteComboScore } from '../utils/scoring'
import { buildComboLegs, getProviderDeepLink, routeCombos, servicesForMode } from '../data/transportData'
import { calculateConnectionRisk, generateContingencyOptions } from '../utils/contingencyEngine'

function serviceLooksBlocked(service) {
  const text = `${service?.availability || ''} ${service?.status || ''} ${service?.code || ''}`.toLowerCase()
  return text.includes('no-direct') || text.includes('not recommended') || text.includes('full') || text.includes('unavailable') || Number(service?.reliability || 100) < 55
}

function legBookLabel(mode) {
  if (mode === 'Flight') return 'Demo book flight'
  if (mode === 'Bus') return 'Demo book bus'
  return 'Demo book train'
}

export default function BackupPlan({ plan, compact = false, singleOnly = false, onBookBackup }) {
  const [bookingNotice, setBookingNotice] = useState('')
  const [suggested, setSuggested] = useState(null)
  const [simulatedDelay, setSimulatedDelay] = useState(Number(plan.delayMinutes || plan.connectingDelay || 0))
  const [activeContingency, setActiveContingency] = useState(null)

  const selectedService = servicesForMode(plan, plan.transportMode || 'Train')[0]
  const selectedBlocked = serviceLooksBlocked(selectedService)
  const ranked = useMemo(() => routeCombos
    .map((combo) => ({ ...combo, score: calculateRouteComboScore(combo, plan) }))
    .sort((a, b) => b.score - a.score), [plan])
  const primary = ranked.find((item) => item.label === plan.routeCombo) || ranked[0]
  const backups = ranked.filter((item) => item.label !== primary.label)
  const best = suggested || null

  const connectionRisk = useMemo(() => calculateConnectionRisk(simulatedDelay, 60), [simulatedDelay])
  const contingencyOptions = useMemo(() => generateContingencyOptions(plan, simulatedDelay), [plan, simulatedDelay])

  function suggestBest() {
    setSuggested(backups[0] || primary)
    setBookingNotice('Best backup analyzed. Each leg now has a preparation button so its details can be checked on the official provider portal.')
  }

  function bookLeg(combo, leg) {
    if (onBookBackup && combo && leg) onBookBackup(combo, leg)
    else setBookingNotice('This route can be prepared in the planner. Use the official provider portal for availability and purchase.')
  }

  function activateContingency(option) {
    setActiveContingency(option)
    const leg = {
      leg: 1,
      mode: option.mode,
      service: option.carrier,
      code: option.code,
      depart: option.depart,
      arrive: option.arrive,
      fare: option.fare
    }
    const combo = {
      label: `Contingency: ${option.title}`,
      legs: [leg]
    }
    bookLeg(combo, leg)
    setBookingNotice(`Activated contingency route: ${option.title} (${option.carrier}). Prepared for checkout.`)
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 text-gray-900 shadow-xs" aria-labelledby="backup-title">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <p className="text-xs font-bold text-[#15803D] uppercase tracking-wider">Availability fallback & contingency</p>
          <h3 id="backup-title" className="text-xl font-black text-gray-900">Backup options if selected transport fails</h3>
        </div>
        {!singleOnly && (
          <button
            type="button"
            data-testid="analyze-suggest-backup-btn"
            className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-3 shadow-xs"
            onClick={suggestBest}
          >
            <Trophy size={14} /> Analyze & suggest best
          </button>
        )}
      </div>

      {/* Contingency Delay Simulator Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-xs">
        <span className="font-bold text-gray-800 inline-flex items-center gap-1.5">
          <Clock size={14} className="text-[#15803D]" /> Connecting Leg Delay Simulator:
        </span>
        <div className="flex gap-1.5">
          {[
            { label: 'On Time (0m)', val: 0, tid: 'simulate-delay-0m' },
            { label: 'Minor (+25m)', val: 25, tid: 'simulate-delay-25m' },
            { label: 'Severe (+55m)', val: 55, tid: 'simulate-delay-55m' }
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              data-testid={item.tid}
              onClick={() => setSimulatedDelay(item.val)}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition border ${
                simulatedDelay === item.val
                  ? 'border-[#15803D] bg-[#15803D] text-white shadow-xs'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contingency Trigger Banner */}
      {connectionRisk.contingencyTriggered && (
        <aside
          data-testid="delay-contingency-alert"
          className="mt-4 rounded-md border-l-4 border-l-red-600 border border-gray-200 bg-red-50/50 p-4 text-xs shadow-xs"
        >
          <div className="flex items-center gap-2 text-red-900 font-bold">
            <ShieldAlert size={16} className="text-red-600 shrink-0" />
            <span className="text-sm font-black">Connection Missed Risk Detected ({simulatedDelay} min delay)</span>
          </div>
          <p className="mt-1 text-xs text-red-800 leading-relaxed">
            {connectionRisk.recommendation}
          </p>

          <div className="mt-3 space-y-2">
            {contingencyOptions.map((opt) => (
              <div
                key={opt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-md border border-red-200 bg-white p-3 text-xs shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-xs sm:text-sm">{opt.title}</span>
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-700">{opt.transport}</span>
                  </div>
                  <p className="mt-0.5 text-gray-600">
                    <strong className="text-gray-900">{opt.carrier}</strong> ({opt.code}) · Depart: <span className="tabular">{opt.depart}</span> · Fare: <span className="tabular">₹{opt.fare}</span>
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#137333] font-semibold">{opt.riskReduction}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    data-testid={`activate-contingency-${opt.id}`}
                    onClick={() => activateContingency(opt)}
                    className="rounded-md bg-red-600 px-3 py-1.5 font-bold text-white hover:bg-red-700 transition inline-flex items-center gap-1 shadow-xs"
                  >
                    <Zap size={13} /> Activate Contingency
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      <p className={`mt-4 rounded-md border p-3 text-xs font-bold ${selectedBlocked ? 'border-red-200 bg-red-50 text-red-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
        {selectedBlocked
          ? `${plan.transportMode || 'Selected transport'} may not be practical because availability or reliability is weak. Click Analyze & suggest best for one recommended backup.`
          : singleOnly ? 'Low-network mode keeps only the selected transport visible.' : 'Click Analyze & suggest best to compare the fallback routes and show one clear recommendation.'}
      </p>

      {!best && !singleOnly && !connectionRisk.contingencyTriggered && (
        <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3.5 text-xs text-gray-600">
          <ShieldCheck className="mb-1 text-[#15803D]" size={16} />
          Backup options are hidden until you ask the app to analyze and suggest the best one.
        </div>
      )}

      {best && (
        <article className="mt-4 rounded-md border border-[#C6E8D1] bg-[#EDF7F0] p-4 text-xs shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C6E8D1] pb-2">
            <h4 className="font-bold text-gray-900 text-sm">Suggested best: {best.label}</h4>
            <span className="rounded bg-[#15803D] text-white px-2 py-0.5 text-[11px] font-bold">{best.score}/100</span>
          </div>
          <p className="mt-2 text-xs text-gray-700">{best.note}</p>
          <div className="mt-3 space-y-2">
            {buildComboLegs(best, plan).map((leg) => {
              const legLink = getProviderDeepLink({
                transport: leg.mode,
                from: leg.from || plan.from,
                to: leg.to || plan.to,
                date: plan.date,
                serviceCode: leg.code,
                serviceName: leg.service
              })
              const providerName = leg.mode === 'Bus' ? 'RedBus' : leg.mode === 'Flight' ? 'Google Flights' : 'ConfirmTkt'
              return (
                <div key={`${best.label}-${leg.leg}`} className="rounded-md border border-gray-200 bg-white p-3 text-xs text-gray-800 shadow-xs">
                  <p><b className="text-gray-900">Leg {leg.leg} · {leg.mode}:</b> {leg.service} ({leg.code}) · <span className="tabular">{leg.depart}</span> to <span className="tabular">{leg.arrive}</span> · <span className="tabular">₹{leg.fare}</span></p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <button className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs" onClick={() => bookLeg(best, leg)}>
                      <TicketCheck className="mr-1 inline text-gray-500" size={13} /> {legBookLabel(leg.mode)}
                    </button>
                    <a
                      href={legLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-[#EDF7F0] border border-[#C6E8D1] px-3 py-1.5 text-xs font-bold text-[#137333] hover:bg-green-100 shadow-xs"
                    >
                      <ExternalLink size={12} /> Book on {providerName} ↗
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      )}

      {bookingNotice && (
        <div className="mt-3 rounded-md border border-[#C6E8D1] bg-[#EDF7F0] p-3 text-xs font-bold text-[#137333]">
          {bookingNotice}
        </div>
      )}
    </section>
  )
}

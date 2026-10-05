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
    <section className="glass rounded-3xl p-5" aria-labelledby="backup-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-cyan-200">Availability fallback & contingency</p>
          <h3 id="backup-title" className="text-2xl font-black text-white">Backup options if selected transport fails</h3>
        </div>
        {!singleOnly && (
          <button
            type="button"
            data-testid="analyze-suggest-backup-btn"
            className="btn-primary inline-flex items-center gap-2"
            onClick={suggestBest}
          >
            <Trophy size={16} /> Analyze & suggest best
          </button>
        )}
      </div>

      {/* Contingency Delay Simulator Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-xs">
        <span className="font-bold text-slate-300 inline-flex items-center gap-1.5">
          <Clock size={14} className="text-cyan-400" /> Connecting Leg Delay Simulator:
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
              className={`rounded-lg px-2.5 py-1 font-bold transition ${
                simulatedDelay === item.val
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Severe Delay (>45m) Contingency Alert Banner */}
      {connectionRisk.contingencyTriggered && (
        <aside
          data-testid="contingency-severe-delay-banner"
          className="mt-4 rounded-2xl border border-red-500/50 bg-red-950/40 p-4 text-red-100"
          role="alert"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="mt-0.5 text-red-400 shrink-0" size={20} />
              <div>
                <span className="inline-flex items-center gap-1 rounded-full border border-red-400/40 bg-red-900/60 px-2 py-0.5 text-[11px] font-black uppercase text-red-200">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-400 animate-ping mr-1" />
                  Severe Connecting Delay (+{simulatedDelay}m)
                </span>
                <h4 className="mt-1.5 text-base font-black text-white">
                  Junction Transfer at Critical Risk ({connectionRisk.missedTransferProbability}% Missed Odds)
                </h4>
                <p className="mt-1 text-xs text-red-200 leading-relaxed">
                  Scheduled layover (60m) depleted by primary leg delay. TravelMate Contingency Engine calculated 3 zero-network viable alternatives:
                </p>
              </div>
            </div>
          </div>

          {/* Contingency Option Cards */}
          <div className="mt-4 space-y-2.5">
            {contingencyOptions.map((opt) => (
              <div
                key={opt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-red-500/25 bg-slate-950/80 p-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{opt.title}</span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">{opt.transport}</span>
                  </div>
                  <p className="mt-0.5 text-slate-300">
                    <strong className="text-white">{opt.carrier}</strong> ({opt.code}) · Depart: {opt.depart} · Fare: ₹{opt.fare}
                  </p>
                  <p className="mt-0.5 text-[11px] text-emerald-300 font-medium">✓ {opt.riskReduction}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    data-testid={`activate-contingency-${opt.id}`}
                    onClick={() => activateContingency(opt)}
                    className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white hover:bg-red-500 transition inline-flex items-center gap-1"
                  >
                    <Zap size={13} /> Activate Contingency
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      <p className={`mt-4 rounded-2xl border p-3 text-sm font-bold ${selectedBlocked ? 'border-red-400/25 bg-red-500/10 text-red-100' : 'border-yellow-400/20 bg-yellow-400/10 text-yellow-100'}`}>
        {selectedBlocked
          ? `${plan.transportMode || 'Selected transport'} may not be practical because availability or reliability is weak. Click Analyze & suggest best for one recommended backup.`
          : singleOnly ? 'Low-network mode keeps only the selected transport visible.' : 'Click Analyze & suggest best to compare the fallback routes and show one clear recommendation.'}
      </p>

      {!best && !singleOnly && !connectionRisk.contingencyTriggered && (
        <div className="mt-4 rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4 text-sm text-slate-300">
          <ShieldCheck className="mb-2 text-cyan-200" size={20} />
          Backup options are hidden until you ask the app to analyze and suggest the best one. This keeps the planner simple for demo viewers.
        </div>
      )}

      {best && (
        <article className="mt-4 rounded-2xl border border-yellow-300/40 bg-yellow-300/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-black text-white">Suggested best: {best.label}</h4>
            <span className="rounded-full bg-yellow-300 px-3 py-1 text-xs font-black text-slate-950">{best.score}/100</span>
          </div>
          <p className="mt-2 text-sm text-yellow-100/90">{best.note}</p>
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
                <div key={`${best.label}-${leg.leg}`} className="rounded-xl bg-slate-950/70 p-3 text-sm text-slate-300">
                  <p><b className="text-cyan-100">Leg {leg.leg} · {leg.mode}:</b> {leg.service} ({leg.code}) · {leg.depart} → {leg.arrive} · ₹{leg.fare}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-400/20" onClick={() => bookLeg(best, leg)}>
                      <TicketCheck className="mr-1 inline" size={14} /> {legBookLabel(leg.mode)}
                    </button>
                    <a
                      href={legLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-400/20"
                    >
                      <ExternalLink size={13} /> Book on {providerName} ↗
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </article>
      )}

      {bookingNotice && (
        <div className="mt-4 rounded-xl border border-cyan-400/30 bg-cyan-950/30 p-3 text-xs font-bold text-cyan-200">
          {bookingNotice}
        </div>
      )}
    </section>
  )
}

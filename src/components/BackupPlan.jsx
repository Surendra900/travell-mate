import { useMemo, useState } from 'react'
import { ShieldCheck, TicketCheck, Trophy } from 'lucide-react'
import { calculateRouteComboScore } from '../utils/scoring'
import { buildComboLegs, routeCombos, servicesForMode } from '../data/transportData'

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
  const selectedService = servicesForMode(plan, plan.transportMode || 'Train')[0]
  const selectedBlocked = serviceLooksBlocked(selectedService)
  const ranked = useMemo(() => routeCombos
    .map((combo) => ({ ...combo, score: calculateRouteComboScore(combo, plan) }))
    .sort((a, b) => b.score - a.score), [plan])
  const primary = ranked.find((item) => item.label === plan.routeCombo) || ranked[0]
  const backups = ranked.filter((item) => item.label !== primary.label)
  const best = suggested || null

  function suggestBest() {
    setSuggested(backups[0] || primary)
    setBookingNotice('Best backup analyzed. Each leg now has a preparation button so its details can be checked on the official provider portal.')
  }

  function bookLeg(combo, leg) {
    if (onBookBackup && combo && leg) onBookBackup(combo, leg)
    else setBookingNotice('This route can be prepared in the planner. Use the official provider portal for availability and purchase.')
  }

  return (
    <section className="glass rounded-3xl p-5" aria-labelledby="backup-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-cyan-200">Availability fallback</p>
          <h3 id="backup-title" className="text-2xl font-black text-white">Backup options if selected transport fails</h3>
        </div>
        {!singleOnly && <button className="btn-primary inline-flex items-center gap-2" onClick={suggestBest}><Trophy size={16} /> Analyze & suggest best</button>}
      </div>
      <p className={`mt-4 rounded-2xl border p-3 text-sm font-bold ${selectedBlocked ? 'border-red-400/25 bg-red-500/10 text-red-100' : 'border-yellow-400/20 bg-yellow-400/10 text-yellow-100'}`}>
        {selectedBlocked
          ? `${plan.transportMode || 'Selected transport'} may not be practical because availability or reliability is weak. Click Analyze & suggest best for one recommended backup.`
          : singleOnly ? 'Low-network mode keeps only the selected transport visible.' : 'Click Analyze & suggest best to compare the fallback routes and show one clear recommendation.'}
      </p>

      {!best && !singleOnly && (
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
            {buildComboLegs(best, plan).map((leg) => (
              <div key={`${best.label}-${leg.leg}`} className="rounded-xl bg-slate-950/70 p-3 text-sm text-slate-300">
                <p><b className="text-cyan-100">Leg {leg.leg} · {leg.mode}:</b> {leg.service} ({leg.code}) · {leg.depart} → {leg.arrive} · ₹{leg.fare}</p>
                <button className="mt-2 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-400/20" onClick={() => bookLeg(best, leg)}>
                  <TicketCheck className="mr-1 inline" size={14} /> {legBookLabel(leg.mode)}
                </button>
              </div>
            ))}
          </div>
        </article>
      )}

      {!compact && <p className="mt-3 text-xs text-slate-500">These are local backup recommendations. Final ticket availability must be checked with the official provider.</p>}
      {bookingNotice && <p className="mt-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-xs font-bold text-yellow-100">{bookingNotice}</p>}
    </section>
  )
}

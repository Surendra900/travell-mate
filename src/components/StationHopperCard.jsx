import { useState } from 'react'
import { Sparkles, ArrowRight, CheckCircle2, ExternalLink, HelpCircle, ShieldAlert, Train } from 'lucide-react'

export default function StationHopperCard({ hacks = [], from = '', to = '' }) {
  const [expandedIndex, setExpandedIndex] = useState(0)

  if (!hacks || hacks.length === 0) return null

  return (
    <div className="station-hopper-container rounded-3xl border border-amber-400/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-400/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300">
            <Sparkles size={18} />
          </span>
          <div>
            <span style={{ color: '#fbbf24' }} className="text-[11px] font-black uppercase tracking-wider">
              IRCTC Quota Hack Engine
            </span>
            <h4 style={{ color: '#ffffff' }} className="text-base font-black">
              Same Train, Confirmed Seat Hack 💡
            </h4>
          </div>
        </div>
        <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-200">
          {hacks.length} Confirmed Bypass Option{hacks.length > 1 ? 's' : ''}
        </span>
      </div>

      <p style={{ color: '#cbd5e1' }} className="mt-2.5 text-xs leading-relaxed">
        Direct tickets between <b style={{ color: '#ffffff' }}>{from || 'Origin'}</b> and <b style={{ color: '#ffffff' }}>{to || 'Destination'}</b> are often waitlisted.
        By booking from an originating junction or extending by 1 station, you tap into larger General Quotas with confirmed berths:
      </p>

      <div className="mt-3.5 space-y-3">
        {hacks.map((hack, index) => {
          const isSelected = expandedIndex === index
          return (
            <div
              key={hack.id || index}
              className={`rounded-2xl border p-4 transition ${
                isSelected
                  ? 'border-amber-400/50 bg-slate-950/80 shadow-md'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <div
                className="flex cursor-pointer flex-wrap items-center justify-between gap-2"
                onClick={() => setExpandedIndex(isSelected ? -1 : index)}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-black uppercase text-amber-300">
                    {hack.strategy}
                  </span>
                  <span style={{ color: '#ffffff' }} className="text-sm font-bold">
                    {hack.title}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-emerald-400">
                    🟢 ~{hack.confirmedProbability}% Confirmation
                  </span>
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-black text-cyan-300">
                    +₹{hack.estimatedExtraFare} extra
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 space-y-2.5 border-t border-slate-800/80 pt-3">
                  <p style={{ color: '#e2e8f0' }} className="text-xs leading-relaxed">
                    {hack.description}
                  </p>

                  <div className="grid gap-2 rounded-xl bg-slate-900/90 p-3 sm:grid-cols-2 text-xs border border-slate-800">
                    <div>
                      <span style={{ color: '#94a3b8' }} className="block text-[11px] font-bold">How to Book on IRCTC / App:</span>
                      <strong style={{ color: '#67e8f9' }} className="block font-bold">Book From: {hack.alternateFrom}</strong>
                      <strong style={{ color: '#67e8f9' }} className="block font-bold">Book To: {hack.alternateTo}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#94a3b8' }} className="block text-[11px] font-bold">Your Actual Travel:</span>
                      <span style={{ color: '#ffffff' }} className="block font-medium">Board at: <b style={{ color: '#38bdf8' }}>{hack.actualBoarding}</b></span>
                      <span style={{ color: '#ffffff' }} className="block font-medium">Deboard at: <b style={{ color: '#38bdf8' }}>{hack.actualDeboarding}</b></span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/15 p-2.5 text-[11px] flex items-start gap-2">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-400" />
                    <span style={{ color: '#a7f3d0' }}><b>Legality & Rules:</b> {hack.legalRule}</span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <a
                      href={hack.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-400/40 bg-amber-400/20 px-3.5 py-1.5 text-xs font-black text-amber-200 transition hover:bg-amber-400/30"
                    >
                      <ExternalLink size={13} />
                      {hack.actionLabel}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

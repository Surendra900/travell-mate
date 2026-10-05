import { useState } from 'react'
import { Sparkles, ArrowRight, CheckCircle2, ExternalLink, HelpCircle, ShieldAlert, Train } from 'lucide-react'

export default function StationHopperCard({ hacks = [], from = '', to = '' }) {
  const [expandedIndex, setExpandedIndex] = useState(0)

  if (!hacks || hacks.length === 0) return null

  return (
    <div className="station-hopper-container rounded-3xl border border-amber-200 bg-amber-50/50 p-5 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-sm">
            <Sparkles size={18} />
          </span>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block">
              IRCTC Quota Hack Engine
            </span>
            <h4 className="text-base font-black text-slate-950">
              Same Train, Confirmed Seat Bypass 💡
            </h4>
          </div>
        </div>
        <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-950 shadow-sm">
          {hacks.length} Confirmed Bypass Option{hacks.length > 1 ? 's' : ''}
        </span>
      </div>

      <p className="mt-2.5 text-xs leading-relaxed text-slate-700">
        Direct tickets between <b className="text-slate-950">{from || 'Origin'}</b> and <b className="text-slate-950">{to || 'Destination'}</b> are often waitlisted.
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
                  ? 'border-amber-300 bg-white shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div
                className="flex cursor-pointer flex-wrap items-center justify-between gap-2"
                onClick={() => setExpandedIndex(isSelected ? -1 : index)}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-black uppercase text-amber-900">
                    {hack.strategy}
                  </span>
                  <span className="text-sm font-bold text-slate-950">
                    {hack.title}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-emerald-700">
                    🟢 ~{hack.confirmedProbability}% Confirmation
                  </span>
                  <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                    +₹{hack.estimatedExtraFare} extra
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3">
                  <p className="text-xs leading-relaxed text-slate-700">
                    {hack.description}
                  </p>

                  <div className="grid gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-2 text-xs border border-slate-200">
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500">How to Book on IRCTC / App:</span>
                      <strong className="block font-bold text-sky-800">Book From: {hack.alternateFrom}</strong>
                      <strong className="block font-bold text-sky-800">Book To: {hack.alternateTo}</strong>
                    </div>
                    <div>
                      <span className="block text-[11px] font-bold text-slate-500">Your Actual Travel:</span>
                      <span className="block font-medium text-slate-900">Board at: <b className="text-sky-800">{hack.actualBoarding}</b></span>
                      <span className="block font-medium text-slate-900">Deboard at: <b className="text-sky-800">{hack.actualDeboarding}</b></span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-[11px] flex items-start gap-2 text-emerald-950">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-700" />
                    <span><b>Legality & Rules:</b> {hack.legalRule}</span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <a
                      href={hack.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-100/70 hover:bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-amber-950 transition shadow-sm"
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

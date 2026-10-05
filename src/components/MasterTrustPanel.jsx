import { DatabaseZap, ShieldCheck, WifiOff } from 'lucide-react'
import SourceBadge from './SourceBadge'

const rows = [
  ['Live API result', 'RapidAPI IRCTC / Aviationstack response from serverless backend.'],
  ['Local planning dataset', 'Curated local route examples for planning; not live inventory.'],
  ['Local planning estimate', 'Offline/local estimate shown when an API is missing, blocked, or empty.'],
  ['Provider verification required', 'Final fare, seat, PNR, payment, and ticket issue must be verified by an official provider.']
]

export default function MasterTrustPanel() {
  return (
    <section className="stitch-trust-card bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      <div className="stitch-trust-head flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <p className="stitch-kicker inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 mb-1">
            <ShieldCheck size={16} /> Transparent Data Layer
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950">Every travel result is source-labeled</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            TravelMate does not present local estimates as live inventory. Cards clearly show whether data is an authenticated live API, a curated timetable, or requires provider verification.
          </p>
        </div>
        <div className="stitch-trust-pills flex flex-wrap items-center gap-2">
          <span className="stitch-meta-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <DatabaseZap size={14} className="text-sky-600" /> API-ready backend
          </span>
          <span className="stitch-meta-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <WifiOff size={14} className="text-emerald-600" /> Offline planning examples
          </span>
        </div>
      </div>
      <div className="stitch-trust-grid grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {rows.map(([label, text]) => (
          <div key={label} className="stitch-trust-item p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <SourceBadge label={label} />
            <p className="text-xs text-slate-600 font-medium mt-2 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

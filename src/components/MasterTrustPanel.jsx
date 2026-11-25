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
    <section className="stitch-trust-card bg-white rounded-lg border border-gray-200 p-5 sm:p-6 shadow-xs">
      <div className="stitch-trust-head flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <p className="stitch-kicker inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#15803D] mb-0.5">
            <ShieldCheck size={15} /> Transparent Data Layer
          </p>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Every travel result is source-labeled</h2>
          <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
            TravelMate does not present local estimates as live inventory. Cards clearly show whether data is an authenticated live API, a curated timetable, or requires provider verification.
          </p>
        </div>
        <div className="stitch-trust-pills flex flex-wrap items-center gap-2">
          <span className="stitch-meta-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold">
            <DatabaseZap size={13} className="text-[#15803D]" /> API-ready backend
          </span>
          <span className="stitch-meta-pill inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 text-gray-700 text-xs font-semibold">
            <WifiOff size={13} className="text-[#137333]" /> Offline planning examples
          </span>
        </div>
      </div>
      <div className="stitch-trust-grid grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {rows.map(([label, text]) => (
          <div key={label} className="stitch-trust-item p-3.5 rounded border border-gray-200 bg-gray-50/70">
            <SourceBadge label={label} />
            <p className="text-xs text-gray-600 font-medium mt-1.5 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

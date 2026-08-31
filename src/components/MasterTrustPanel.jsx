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
    <section className="stitch-trust-card">
      <div className="stitch-trust-head">
        <div>
          <p className="stitch-kicker"><ShieldCheck size={17} /> Trust layer</p>
          <h2>Every travel result is source-labeled</h2>
          <p>TravelMate does not present local examples or estimates as live inventory. Cards clearly show whether they came from an API, a local planning dataset, an estimate, or still need provider verification.</p>
        </div>
        <div className="stitch-trust-pills">
          <span className="stitch-meta-pill"><DatabaseZap size={14} /> API-ready backend</span>
          <span className="stitch-meta-pill"><WifiOff size={14} /> Offline planning examples</span>
        </div>
      </div>
      <div className="stitch-trust-grid">
        {rows.map(([label, text]) => (
          <div key={label} className="stitch-trust-item">
            <SourceBadge label={label} />
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

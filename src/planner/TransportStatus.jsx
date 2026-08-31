import { Activity, Bus, Plane, TrainFront } from 'lucide-react'
import { demoRunningStatus } from '../data/transportData'
import SourceBadge from '../components/SourceBadge'

const icons = {
  Train: TrainFront,
  Bus,
  Flight: Plane
}

export default function TransportStatus({ mode = 'Train' }) {
  const rows = demoRunningStatus[mode] || []
  const Icon = icons[mode] || Activity

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-cyan-200">Source-labeled status board</p>
          <h3 className="text-xl font-black text-white">{mode} status board</h3>
        </div>
        <Icon className="text-cyan-300" />
      </div>
      <div className="mt-4 grid gap-3">
        {rows.map((row) => (
          <div key={row.service} className="rounded-2xl border border-slate-700/70 bg-slate-950/60 p-3 text-sm">
            <div className="flex flex-wrap justify-between gap-3">
              <b className="text-white">{row.service}</b>
              <SourceBadge label={mode === 'Flight' ? 'API-ready' : mode === 'Bus' ? 'Local planning estimate' : 'Local planning dataset'} />
            </div>
            <p className="mt-2 text-cyan-200">{row.status}</p>
            <p className="mt-1 text-slate-400">{row.from} → {row.to} · {row.platform}</p>
            <p className="mt-1 text-xs text-slate-500">{row.updated}. Use the provider check panel for Aviationstack/RapidAPI calls.</p>
          </div>
        ))}
      </div>
    </div>
  )
}

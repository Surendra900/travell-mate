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
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs text-gray-900">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <p className="text-xs font-bold text-[#15803D] uppercase tracking-wider">Source-labeled status board</p>
          <h3 className="text-xl font-black text-gray-900">{mode} status board</h3>
        </div>
        <Icon className="text-[#15803D]" />
      </div>
      <div className="mt-4 grid gap-3">
        {rows.map((row) => (
          <div key={row.service} className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
            <div className="flex flex-wrap justify-between gap-3">
              <b className="text-gray-900 text-sm">{row.service}</b>
              <SourceBadge label={mode === 'Flight' ? 'API-ready' : mode === 'Bus' ? 'Local planning estimate' : 'Local planning dataset'} />
            </div>
            <p className="mt-2 text-xs font-bold text-[#137333]">{row.status}</p>
            <p className="mt-1 text-gray-600">{row.from} to {row.to} · {row.platform}</p>
            <p className="mt-1 text-[11px] text-gray-400">{row.updated}. Use the provider check panel for Aviationstack/RapidAPI calls.</p>
          </div>
        ))}
      </div>
    </div>
  )
}

import { Battery, PlugZap, Signal, WifiOff } from 'lucide-react'

export default function StatusBar({ status }) {
  const batteryText = status.batteryLevel === null ? 'Battery --%' : `${status.batteryLevel}%${status.charging ? ' charging' : ''}`
  const connectionParts = []
  if (status.effectiveType && status.effectiveType !== 'unknown') connectionParts.push(status.effectiveType)
  if (status.downlink !== null) connectionParts.push(`${status.downlink} Mbps`)
  const networkText = status.online ? (connectionParts.join(' · ') || 'Online') : 'Offline'
  const low = status.recommendedMode === 'low-network'

  return (
    <div className={`status-strip border-b ${low ? 'border-red-500/30 bg-red-950/45 text-red-100' : 'border-cyan-500/20 bg-slate-950/80 text-cyan-100'}`}>
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-3 py-2 no-scrollbar sm:flex-wrap sm:px-4">
        <span className="status-chip"><Battery size={14} aria-hidden="true" />{batteryText}</span>
        <span className="status-chip">{status.online ? <Signal size={14} aria-hidden="true" /> : <WifiOff size={14} aria-hidden="true" />}{networkText}</span>
        <span className="status-chip"><PlugZap size={14} aria-hidden="true" />{status.online === false ? 'Offline mode' : low ? 'Auto low-network' : 'Normal mode'}</span>
        {status.online === false && <span className="shrink-0 text-xs font-black text-red-100">Emergency and saved data remain available.</span>}
        <span className="hidden text-xs text-slate-400 xl:inline">Device readings depend on browser support.</span>
      </div>
    </div>
  )
}

import { Battery, PlugZap, Signal, WifiOff } from 'lucide-react'

export default function StatusBar({ status }) {
  const batteryText = status.batteryLevel === null ? 'Battery --%' : `${status.batteryLevel}%${status.charging ? ' charging' : ''}`
  const connectionParts = []
  if (status.effectiveType && status.effectiveType !== 'unknown') connectionParts.push(status.effectiveType)
  if (status.downlink !== null) connectionParts.push(`${status.downlink} Mbps`)
  const networkText = status.online ? (connectionParts.join(' · ') || 'Online') : 'Offline'
  const low = status.recommendedMode === 'low-network'

  const isCriticalBattery = status?.batteryLevel !== null && status?.batteryLevel <= 15 && !status?.charging
  const isOffline = status?.online === false
  const isLowNetwork = status?.recommendedMode === 'low-network'

  if (!isOffline && !isLowNetwork && !isCriticalBattery) {
    return null
  }

  return (
    <div className={`status-strip border-b ${isOffline || isLowNetwork ? 'border-red-500/30 bg-red-950/90 text-red-100' : 'border-amber-500/30 bg-amber-950/90 text-amber-100'}`} role="status">
      <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-3 py-2 no-scrollbar sm:flex-wrap sm:px-4 text-xs font-semibold">
        <span className="status-chip"><Battery size={14} aria-hidden="true" />{batteryText}</span>
        <span className="status-chip">{status.online ? <Signal size={14} aria-hidden="true" /> : <WifiOff size={14} aria-hidden="true" />}{networkText}</span>
        <span className="status-chip"><PlugZap size={14} aria-hidden="true" />{isOffline ? 'Offline mode active' : isLowNetwork ? 'Auto low-network active' : 'Critical battery saver'}</span>
        {isOffline && <span className="shrink-0 text-xs font-black text-red-200">Emergency & offline cached data remain available.</span>}
      </div>
    </div>
  )
}

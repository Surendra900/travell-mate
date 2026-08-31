import { Battery, PhoneCall, Siren, WifiOff } from 'lucide-react'

export default function FloatingSOS({ status }) {
  const batteryText = status?.batteryLevel === null || status?.batteryLevel === undefined
    ? 'Battery --%'
    : `Battery ${status.batteryLevel}%${status.charging ? ' charging' : ''}`

  return (
    <div className="floating-sos">
      <div className="sos-status-card">
        <div className="flex items-center gap-2"><Battery size={14} aria-hidden="true" /> {batteryText}</div>
        {status?.online === false && <div className="mt-1 flex items-center gap-2 text-red-100"><WifiOff size={14} aria-hidden="true" /> Offline mode active</div>}
      </div>
      <a
        href="tel:112"
        aria-label="Call emergency number 112 now"
        className="sos-call-button"
        onClick={() => {
          try { localStorage.setItem('travelmate-last-sos-click', new Date().toISOString()) } catch {}
        }}
      >
        <span className="sos-icon"><Siren size={22} aria-hidden="true" /></span>
        <span className="sos-copy">
          <span className="block text-base">SOS</span>
          <span className="sos-subcopy"><PhoneCall size={13} aria-hidden="true" /> Call 112</span>
        </span>
      </a>
    </div>
  )
}

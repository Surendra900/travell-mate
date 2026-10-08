import { useEffect, useState } from 'react'
import { CheckCircle2, LocateFixed, MapPin, ShieldCheck } from 'lucide-react'
import {
  formatEmergencyLocation,
  getCachedEmergencyLocation,
  getLocationOnboardingChoice,
  queryLocationPermission,
  refreshLocationWhenAlreadyAllowed,
  requestEmergencyLocation,
  setLocationOnboardingChoice
} from '../utils/locationSafety'

export default function LocationPermissionGate({ toast }) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('checking')
  const [location, setLocation] = useState(() => getCachedEmergencyLocation())

  useEffect(() => {
    let active = true
    async function initialize() {
      const permission = await queryLocationPermission()
      if (!active) return
      setStatus(permission)

      if (permission === 'granted') {
        const result = await refreshLocationWhenAlreadyAllowed()
        if (!active) return
        if (result.location) setLocation(result.location)
        setLocationOnboardingChoice('enabled')
        setOpen(false)
        return
      }

      // Spec Section 15: Never auto-open on cold load without user gesture.
      // Remains closed until explicitly invoked via user action in Safety Mode or emergency tools.
      setOpen(false)
    }
    initialize()

    function handleOpenRequest() {
      setOpen(true)
    }
    window.addEventListener('travelmate:open-location-gate', handleOpenRequest)
    return () => {
      active = false
      window.removeEventListener('travelmate:open-location-gate', handleOpenRequest)
    }
  }, [])

  async function enableLocation() {
    setBusy(true)
    const result = await requestEmergencyLocation({ maximumAge: 0 })
    setBusy(false)

    if (result.ok) {
      setLocation(result.location)
      setStatus('granted')
      setLocationOnboardingChoice('enabled')
      setOpen(false)
      toast?.('Location enabled for emergency sharing on this device.')
      return
    }

    setStatus(result.reason)
    if (result.reason === 'denied') {
      toast?.('Location was denied. You can enable it later from browser site settings or Safety Mode.')
    } else {
      toast?.('Location could not be captured. You can continue and try again later.')
    }
  }

  function continueWithoutLocation() {
    setLocationOnboardingChoice('skipped')
    setOpen(false)
    toast?.('Continued without location. Emergency messages will ask you to add a landmark.')
  }

  if (!open) return null

  return (
    <div className="location-gate fixed inset-0 z-[130] grid place-items-center overflow-y-auto bg-slate-950/95 p-3 backdrop-blur-xl" role="dialog" aria-modal="true" aria-label="Location permission setup">
      <div className="glass my-3 w-full max-w-xl rounded-3xl p-5 shadow-glow sm:p-7">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cyan-400 text-slate-950"><LocateFixed size={25} /></div>
          <div>
            <p className="badge"><ShieldCheck size={14} /> Emergency location setup</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">Allow location before using TravelMate</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">When you later tap WhatsApp or SMS in Safety Mode, TravelMate will refresh your GPS location and place it in the emergency message automatically.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm">
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-cyan-50">
            <p className="font-black"><MapPin size={16} className="mr-2 inline" />What is stored</p>
            <p className="mt-1 text-cyan-100/85">Only the latest coordinates, accuracy and capture time are stored locally in this browser. They are not sent to TravelMate servers.</p>
          </div>
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-yellow-100">
            WhatsApp and SMS will open with a prepared message. Your phone still requires you to review it and tap Send; a website cannot silently send messages on your behalf.
          </div>
          {location && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-xs text-emerald-100 break-all">
              <CheckCircle2 size={16} className="mr-2 inline" />Saved location available: {formatEmergencyLocation(location)}
            </div>
          )}
          {status === 'denied' && (
            <div className="rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-red-100">Location is blocked. Use the lock icon beside the website address → Site settings → Location → Allow, then reload.</div>
          )}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button className="btn-primary mobile-full inline-flex items-center justify-center gap-2" type="button" onClick={enableLocation} disabled={busy}>
            <MapPin size={18} /> {busy ? 'Requesting location…' : 'Allow and continue'}
          </button>
          <button className="btn-soft mobile-full" type="button" onClick={continueWithoutLocation}>Continue without location</button>
        </div>
      </div>
    </div>
  )
}

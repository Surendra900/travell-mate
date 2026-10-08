import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, WifiOff } from 'lucide-react'
import { getOfflineCacheStatus } from '../utils/offlineMode'

export default function OfflineModeBanner({ status, toast }) {
  const [cacheCount, setCacheCount] = useState(0)
  const offline = status?.online === false

  useEffect(() => {
    let mounted = true
    getOfflineCacheStatus().then((info) => {
      if (mounted && info.supported) setCacheCount(info.count)
    })
    return () => { mounted = false }
  }, [offline])

  if (!offline) {
    return null
  }

  return (
    <div className="sticky top-0 z-[70] border-b border-red-300 bg-white px-4 py-3 text-red-900 shadow-danger backdrop-blur-xl" role="alert" aria-live="assertive">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <WifiOff className="mt-0.5 shrink-0 text-red-200" size={22} />
          <div>
            <p className="font-black">Offline Mode Active · Internet/data is dead</p>
            <p className="text-sm text-red-800/90">The app has automatically shifted to Low Network mode. Live ticket availability, maps and status updates are disabled. Saved plans, offline pack, important points and emergency numbers remain available.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-slate-950" to="/planner">Open Offline Planner</Link>
          <Link className="rounded-full border border-red-300 px-4 py-2 text-sm font-bold text-red-900" to="/safety"><ShieldAlert size={16} className="inline" /> Safety Mode</Link>
        </div>
      </div>
    </div>
  )
}

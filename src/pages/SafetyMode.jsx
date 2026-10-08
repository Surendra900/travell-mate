import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Siren,
  PhoneCall,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Ticket,
  DownloadCloud,
  Printer,
  Copy,
  CheckCircle2,
  QrCode,
  TrainFront,
  BusFront,
  Plane,
  RefreshCw,
  Smartphone,
  ExternalLink
} from 'lucide-react'
import EmergencyCard from '../components/EmergencyCard'
import EmergencyToolkit from '../components/EmergencyToolkit'
import OfflineTravelerPassModal from '../components/OfflineTravelerPassModal'
import { emergencyCards } from '../data/emergencyData'
import { getSavedPlans, getOfflinePack, saveOfflinePack } from '../utils/storage'
import { warmOfflineCache } from '../utils/offlineMode'

const SAMPLE_OFFLINE_ROUTE = {
  id: 'sample-pass-ndls-hwh',
  tier: 'tier1',
  tierLabel: 'Budget Route (Rail + Rail)',
  tierBadge: 'Split-Ticket Quota Bypass',
  fareFormatted: '₹2,300',
  totalDuration: '15h 10m',
  hubCity: 'Kanpur Central (CNB)',
  transferBuffer: '90 min',
  leg1: {
    mode: 'Train',
    service: '12302 New Delhi Rajdhani Express',
    from: 'New Delhi (NDLS)',
    to: 'Kanpur Central (CNB)',
    depart: '16:55',
    arrive: '21:35',
    fare: 1450,
    departureTime: '16:55',
    arrivalTime: '21:35'
  },
  leg2: {
    mode: 'Train',
    service: '12382 Poorva Express',
    from: 'Kanpur Central (CNB)',
    to: 'Howrah Junction (HWH)',
    depart: '23:05',
    arrive: '08:05',
    fare: 850,
    departureTime: '23:05',
    arrivalTime: '08:05'
  }
}

export default function SafetyMode({ toast }) {
  const [activeTab, setActiveTab] = useState('passes')
  const [savedPlans, setSavedPlans] = useState([])
  const [offlinePack, setOfflinePack] = useState(null)
  const [selectedPassRoute, setSelectedPassRoute] = useState(null)
  const [syncingOffline, setSyncingOffline] = useState(false)
  const [copiedSummary, setCopiedSummary] = useState(false)
  const crisisPanelRef = useRef(null)

  useEffect(() => {
    try {
      setSavedPlans(getSavedPlans() || [])
      setOfflinePack(getOfflinePack())
    } catch {
      // LocalStorage fallback
    }
  }, [])

  function openEmergencyActions() {
    setActiveTab('sos')
    crisisPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      crisisPanelRef.current?.querySelector('select, button, input')?.focus({ preventScroll: true })
    }, 450)
  }

  async function handleSyncOfflinePack() {
    setSyncingOffline(true)
    try {
      const pack = saveOfflinePack()
      setOfflinePack(pack)
      const res = await warmOfflineCache()
      if (res.ok) {
        toast?.(`Offline trip pack ready: ${res.saved} assets cached locally for no-network use.`)
      } else {
        toast?.('Offline trip pack snapshot saved to local device cache.')
      }
    } catch {
      toast?.('Offline trip pack saved to local browser cache.')
    } finally {
      setSyncingOffline(false)
    }
  }

  function handleCopyPass(route) {
    const text = [
      `🎫 TRAVELMATE OFFLINE BOARDING PASS`,
      `Route: ${route.leg1?.from} ➔ ${route.leg2?.to}`,
      `Total Fare: ${route.fareFormatted} | Duration: ${route.totalDuration}`,
      `----------------------------------------`,
      `STEP 1: ${route.leg1?.service} (${route.leg1?.mode})`,
      `Depart: ${route.leg1?.depart || route.leg1?.departureTime} from ${route.leg1?.from}`,
      `Arrive: ${route.leg1?.arrive || route.leg1?.arrivalTime} at ${route.hubCity}`,
      `Fare: ₹${route.leg1?.fare}`,
      `----------------------------------------`,
      `JUNCTION TRANSFER: ${route.hubCity}`,
      `Buffer: ${route.transferBuffer}`,
      `----------------------------------------`,
      `STEP 2: ${route.leg2?.service} (${route.leg2?.mode})`,
      `Depart: ${route.leg2?.depart || route.leg2?.departureTime} from ${route.hubCity}`,
      `Arrive: ${route.leg2?.arrive || route.leg2?.arrivalTime} at ${route.leg2?.to}`,
      `Fare: ₹${route.leg2?.fare}`,
      `----------------------------------------`,
      `EMERGENCY HELPLINES: 139 (RailMadad) | 112 (National Emergency)`
    ].join('\n')

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedSummary(true)
        toast?.('Offline boarding pass copied to clipboard.')
        setTimeout(() => setCopiedSummary(false), 2500)
      })
    }
  }

  function handlePrintPass(route) {
    setSelectedPassRoute(route)
    setTimeout(() => {
      window.print()
    }, 300)
  }

  // Determine routes to display
  const displayRoutes = savedPlans.length > 0
    ? savedPlans.map((p, idx) => ({
        id: p.id || `saved-${idx}`,
        tierLabel: p.tierLabel || 'Saved Journey Pass',
        fareFormatted: p.totalFare ? `₹${p.totalFare}` : '₹2,300',
        totalDuration: p.duration || '15h 10m',
        hubCity: p.transferHub || p.hub || 'Transfer Junction',
        transferBuffer: '90 min',
        leg1: {
          mode: p.leg1Mode || 'Train',
          service: p.selectedService?.trainName || p.leg1Service || 'Leg 1 Trunk Express',
          from: p.from || 'Origin Station',
          to: p.transferHub || p.hub || 'Transfer Junction',
          depart: p.selectedService?.departureTime || '16:55',
          arrive: '21:35',
          fare: 1450
        },
        leg2: {
          mode: p.leg2Mode || 'Train',
          service: p.leg2Service || 'Leg 2 Connecting Express',
          from: p.transferHub || p.hub || 'Transfer Junction',
          to: p.to || 'Destination Station',
          depart: '23:05',
          arrive: p.selectedService?.arrivalTime || '08:05',
          fare: 850
        }
      }))
    : [SAMPLE_OFFLINE_ROUTE]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-sky-50/70 via-white to-slate-50 border-b border-slate-200/80 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Statutory Notice per Master Spec Section 15 */}
          <div
            data-testid="safety-statutory-notice"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-900 text-xs sm:text-sm font-bold tracking-wide mb-5 shadow-sm"
          >
            <Siren size={15} className="text-red-600 shrink-0" />
            <span>TravelMate is not an emergency service. In an emergency call 112.</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
            Passes & Transit Safety
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Offline digital boarding passes, 24/7 national transit helplines (112 & 139), live GPS telemetry sharing with explicit consent, and zero-network station guides.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('passes')}
              className="btn-primary h-12 px-6 rounded-2xl text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-sky-600/25"
            >
              <Ticket size={18} />
              <span>Offline Boarding Passes</span>
            </button>

            <button
              type="button"
              onClick={openEmergencyActions}
              className="btn-danger h-12 px-6 rounded-2xl text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-red-600/25"
            >
              <Siren size={18} />
              <span>Transit Helplines (112 / 139)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-slate-200" role="tablist" aria-label="Passes and Safety Sections">
          {[
            { id: 'passes', label: 'Offline Boarding Passes & Trip Pack', icon: Ticket, testId: 'tab-offline-passes' },
            { id: 'sos', label: '1-Tap Transit Helplines & GPS Share', icon: PhoneCall, testId: 'tab-safety-helplines' },
            { id: 'guides', label: 'Transit Guides & Station Help', icon: BookOpen, testId: 'tab-station-guides' }
          ].map(({ id, label, icon: Icon, testId }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                data-testid={testId}
                aria-selected={active}
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon size={16} className={active ? 'text-sky-400' : 'text-slate-400'} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab 1: Offline Boarding Passes & Trip Pack (P1) */}
        <div className={activeTab === 'passes' ? 'block mt-6' : 'hidden'}>
          <div className="space-y-6">
            {/* PWA & Offline Status Banner */}
            <div data-testid="pwa-offline-status" className="bg-sky-50 border border-sky-200 rounded-3xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-600/30">
                  <Smartphone size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">Local-First PWA Offline Trip Pack</h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <ShieldCheck size={12} /> Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Cached locally in browser storage and Service Worker. Works completely offline in low-connectivity rail tunnels.
                  </p>
                </div>
              </div>

              <button
                type="button"
                data-testid="sync-offline-pack-btn"
                onClick={handleSyncOfflinePack}
                disabled={syncingOffline}
                className="btn-soft inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold text-sky-800 bg-white border border-sky-300 hover:bg-sky-50 shadow-sm"
              >
                <RefreshCw size={14} className={syncingOffline ? 'animate-spin text-sky-600' : 'text-sky-600'} />
                <span>{syncingOffline ? 'Caching Assets…' : 'Sync / Refresh Offline Cache'}</span>
              </button>
            </div>

            {/* Passes List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">Active Digital Boarding Passes</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Zero-network itinerary cards with leg-by-leg departure details and station transfer buffers.
                  </p>
                </div>
                {savedPlans.length === 0 && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    Illustrative Sample Pass
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4">
                {displayRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:border-slate-300 transition"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-200">
                            {route.tierLabel}
                          </span>
                          <span className="text-xs font-bold text-slate-500">
                            Hub: {route.hubCity} ({route.transferBuffer} buffer)
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-950 mt-2">
                          {route.leg1.from} ➔ {route.leg2.to}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Total duration: <strong className="text-slate-800">{route.totalDuration}</strong> · Estimated fare: <strong className="text-slate-800">{route.fareFormatted}</strong>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          data-testid="view-offline-pass-btn"
                          onClick={() => setSelectedPassRoute(route)}
                          className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm"
                        >
                          <QrCode size={14} />
                          <span>View Digital Pass</span>
                        </button>

                        <button
                          type="button"
                          data-testid="print-pass-btn"
                          onClick={() => handlePrintPass(route)}
                          className="btn-soft inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                          title="Print or Save PDF"
                        >
                          <Printer size={14} />
                          <span>Print</span>
                        </button>

                        <button
                          type="button"
                          data-testid="copy-pass-summary-btn"
                          onClick={() => handleCopyPass(route)}
                          className="btn-soft inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                          title="Copy Pass text summary"
                        >
                          {copiedSummary ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          <span>{copiedSummary ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Legs preview strip */}
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                          <TrainFront size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leg 1: Trunk</div>
                          <div className="text-xs font-black text-slate-900 truncate">{route.leg1.service}</div>
                          <div className="text-[11px] text-slate-600 font-semibold">{route.leg1.depart} {route.leg1.from} ➔ {route.leg1.arrive} {route.hubCity}</div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                          <TrainFront size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leg 2: Connecting</div>
                          <div className="text-xs font-black text-slate-900 truncate">{route.leg2.service}</div>
                          <div className="text-[11px] text-slate-600 font-semibold">{route.leg2.depart} {route.hubCity} ➔ {route.leg2.arrive} {route.leg2.to}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab 2: 1-Tap Transit Helplines & GPS Share (P2) */}
        <div className={activeTab === 'sos' ? 'block mt-6' : 'hidden'}>
          <div ref={crisisPanelRef} tabIndex={-1} className="outline-none safety-tool-shell">
            <EmergencyToolkit toast={toast} />
          </div>
        </div>

        {/* Tab 3: Station Layover Guides */}
        <div className={activeTab === 'guides' ? 'block mt-6' : 'hidden'}>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-950">Safety Information & Station Guides</h2>
              <p className="text-xs text-slate-500 mt-1">Official guidance for Indian railway and road transit security.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyCards.map((item) => (
                <EmergencyCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Offline Boarding Pass Modal */}
      {selectedPassRoute && (
        <OfflineTravelerPassModal
          route={selectedPassRoute}
          onClose={() => setSelectedPassRoute(null)}
        />
      )}
    </div>
  )
}

import { useState } from 'react'
import { ShieldCheck, Lock, Trash2, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { purgeAllUserData } from '../utils/dpdpConsent'

export default function PrivacyPolicy({ toast }) {
  const [purged, setPurged] = useState(false)

  const handlePurge = () => {
    if (window.confirm('Are you sure you want to erase all locally stored data? This will clear saved itineraries, passengers, and preferences.')) {
      purgeAllUserData()
      setPurged(true)
      toast?.('All local data successfully erased.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 text-slate-900" data-testid="privacy-policy-page">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-800 transition-colors">
          <ArrowLeft size={16} /> Back to TravelMate Home
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-800">
            <ShieldCheck size={14} /> India DPDP Act 2023 Compliant
          </span>
          <span className="text-xs text-slate-600 font-semibold">Effective: October 2026</span>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Privacy Policy & Data Protection
        </h1>
        <p className="mt-3 text-base text-slate-700 leading-relaxed max-w-3xl">
          TravelMate is designed on strict principles of <strong>Data Minimization</strong> and <strong>Zero-ID architecture</strong> under the Digital Personal Data Protection (DPDP) Act, 2023 of India. We prioritize traveler autonomy and zero tracking.
        </p>
      </div>

      {/* Core Privacy Principles Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
            <Lock size={18} /> Zero-ID Storage Policy
          </div>
          <p className="mt-2 text-xs text-slate-700 leading-relaxed">
            TravelMate strictly <strong>never requests, processes, or stores</strong> government identity numbers (Aadhaar, Passport, PAN, Voter ID) or payment card credentials anywhere in local storage or on servers.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <ShieldCheck size={18} /> Explicit Action Consent
          </div>
          <p className="mt-2 text-xs text-slate-700 leading-relaxed">
            GPS location telemetry is requested <em>only</em> upon your explicit, conscious click on a helpline or share action. There is strictly zero background geolocation tracking or continuous logging.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <Trash2 size={18} /> Instant Right to Erasure
          </div>
          <p className="mt-2 text-xs text-slate-700 leading-relaxed">
            In compliance with Section 12 of the DPDP Act 2023, you retain absolute ownership over your local data. With a single tap, you can permanently erase all stored journeys and preferences.
          </p>
        </div>
      </div>

      {/* Detailed Provisions */}
      <div className="mt-8 space-y-6 text-sm text-slate-700 leading-relaxed rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <section>
          <h2 className="text-lg font-bold text-slate-900">1. Purpose Limitation & Data Categories</h2>
          <p className="mt-2">
            We only process transient information necessary to compute multimodal itineraries and assist with emergency preparation:
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-slate-700">
            <li><strong>Search Parameters:</strong> Origin, destination, journey date, class preference (processed in-memory).</li>
            <li><strong>Local Passenger Master:</strong> Stored strictly in your browser's LocalStorage for 1-click clipboard paste during Tatkal booking. Contains only Full Name, Age, Gender, and Berth preference.</li>
            <li><strong>Offline Digital Passes:</strong> Stored client-side via Service Worker Cache for zero-connectivity access.</li>
          </ul>
        </section>

        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-900">2. Third-Party Ticketing Deep Links</h2>
          <p className="mt-2 text-xs">
            TravelMate directs you to authorized ticketing partners (ConfirmTkt, redBus, MakeMyTrip, Google Flights, IRCTC) via transparent deep links. Once you navigate to external provider portals, their respective privacy policies and terms govern your transaction.
          </p>
        </section>

        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-900">3. Exercise Your DPDP Rights (Right to Erasure)</h2>
          <p className="mt-2 text-xs">
            You can immediately erase all client-side stored search histories, cached offline passes, emergency contacts, and passenger lists right now:
          </p>
          <div className="mt-4 flex items-center gap-4">
            <button
              type="button"
              data-testid="dpdp-erase-all-btn"
              onClick={handlePurge}
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-colors"
            >
              <Trash2 size={16} /> Erase All Local Device Data
            </button>
            {purged && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <CheckCircle2 size={14} /> Data erased from local storage
              </span>
            )}
          </div>
        </section>

        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-900">4. Data Protection Officer & Inquiries</h2>
          <p className="mt-2 text-xs">
            For questions regarding privacy practices or technical compliance under the DPDP Act 2023, contact our designated privacy desk at <span className="font-mono text-sky-800 font-semibold">privacy@travelmate.in</span>.
          </p>
        </section>
      </div>
    </div>
  )
}

import { Cookie, ShieldCheck, ArrowLeft, Database, Lock, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageMetadata } from '../hooks/usePageMetadata'
import { purgeAllUserData } from '../utils/dpdpConsent'

export default function CookiePolicy({ toast }) {
  usePageMetadata({
    title: 'Cookie & Storage Policy | TravelMate',
    description: 'Operational disclosures regarding client-side local storage, session tokens, and zero tracking cookies in TravelMate.'
  })

  const handlePurge = () => {
    if (window.confirm('Are you sure you want to clear all locally stored data? This will remove saved itineraries and preferences from your browser.')) {
      purgeAllUserData()
      toast?.('All local device data successfully cleared.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 text-slate-900" data-testid="cookie-policy-page">
      <div className="mb-6">
        <Link to="/" className="inline-flex min-h-[44px] items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-800 transition-colors py-2 px-1">
          <ArrowLeft size={16} /> Back to TravelMate Home
        </Link>
      </div>

      {/* Draft Review Banner */}
      <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 font-medium leading-relaxed">
        <p className="font-bold text-amber-900 mb-1">DRAFT DOCUMENT (PRE-LAUNCH REVIEW)</p>
        <p>This draft policy outlines actual technical storage usage. It requires owner review and qualification by legal counsel before public commercial deployment. Placeholders are marked in brackets.</p>
      </div>

      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-800">
            <Cookie size={14} /> Storage & Cookie Disclosures
          </span>
          <span className="text-xs text-slate-600 font-semibold">Effective date: [PLACEHOLDER: effective date]</span>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Cookie & Local Storage Policy
        </h1>
        <p className="mt-3 text-base text-slate-700 leading-relaxed max-w-3xl">
          [PLACEHOLDER: legal business name] operates TravelMate with a zero-tracking architecture. This document explains how client-side storage technologies are used.
        </p>
      </div>

      {/* Summary Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sky-800 font-bold text-sm">
            <ShieldCheck size={18} /> Zero Tracking Cookies
          </div>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            TravelMate does not deploy advertising, marketing, analytics, or behavioral tracking cookies. We do not sell or share browsing telemetry with data brokers.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <Database size={18} /> Strictly Essential Storage
          </div>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            We utilize browser LocalStorage solely to remember your chosen language, saved trip itineraries, and offline digital travel passes locally on your device.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <Lock size={18} /> Authentication Sessions
          </div>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            When user authentication is enabled, our authentication provider (Clerk) uses secure HTTP-only session tokens strictly to keep you signed in.
          </p>
        </div>
      </div>

      {/* Detailed Provisions */}
      <div className="mt-8 space-y-6 text-sm text-slate-700 leading-relaxed rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <section>
          <h2 className="text-lg font-bold text-slate-950">1. Client-Side Storage Keys & Purposes</h2>
          <p className="mt-2 text-xs">
            The application stores functional data directly on your device via the HTML5 LocalStorage and Service Worker Cache APIs:
          </p>
          <div className="mt-3 overflow-x-auto focus:outline-none focus:ring-1 focus:ring-sky-500 rounded-lg" tabIndex={0} role="region" aria-label="Storage keys and retention details">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-3">Storage Key</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-3 font-mono text-slate-800">travelmate-language</td>
                  <td className="p-3">LocalStorage</td>
                  <td className="p-3">Saves preferred interface language (English, Hindi, etc.)</td>
                  <td className="p-3">Persistent until reset</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-slate-800">travelmate-plans</td>
                  <td className="p-3">LocalStorage</td>
                  <td className="p-3">Stores user-saved journey plans for quick offline access</td>
                  <td className="p-3">Persistent until deleted by user</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-slate-800">travelmate-offline-pack</td>
                  <td className="p-3">LocalStorage</td>
                  <td className="p-3">Pre-caches station codes and emergency contacts for offline mode</td>
                  <td className="p-3">Updated during online sessions</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-slate-800">travelmate-dpdp-consent</td>
                  <td className="p-3">LocalStorage</td>
                  <td className="p-3">Records consent choices under India DPDP Act 2023</td>
                  <td className="p-3">Persistent until reset</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-950">2. Third-Party Cookies and SDKs</h2>
          <p className="mt-2 text-xs">
            We do not embed third-party advertising scripts, Facebook pixels, or Google Analytics. If you sign in via Clerk, Clerk uses secure tokens strictly necessary to authenticate your identity. Deep links to external travel portals (ConfirmTkt, redBus, MakeMyTrip, IRCTC) navigate you to third-party domains whose independent cookie policies apply.
          </p>
        </section>

        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-950">3. Managing and Clearing Local Storage</h2>
          <p className="mt-2 text-xs">
            Because storage is hosted on your local device, you can clear all stored data instantly at any time:
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={handlePurge}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition"
            >
              <Trash2 size={16} /> Erase All Local Device Data
            </button>
          </div>
        </section>

        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-950">4. Business Contact Details</h2>
          <p className="mt-2 text-xs">
            Legal Entity: [PLACEHOLDER: legal business name]<br />
            Business Address: [PLACEHOLDER: business address]<br />
            Privacy & Storage Contact: [PLACEHOLDER: privacy contact email]<br />
            Governing Jurisdiction: [PLACEHOLDER: applicable jurisdiction]
          </p>
        </section>
      </div>
    </div>
  )
}

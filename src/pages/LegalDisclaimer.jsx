import { AlertTriangle, ArrowLeft, ShieldAlert, Database, CloudSun, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LegalDisclaimer() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 text-slate-100" data-testid="legal-disclaimer-page">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-cyan-400 hover:text-cyan-300">
          <ArrowLeft size={16} /> Back to TravelMate Home
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-3xl border border-red-500/30 bg-red-950/20 p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-red-200">
            <ShieldAlert size={14} /> Mandatory Statutory Disclosure
          </span>
          <span className="text-xs text-slate-400 font-medium">October 2026</span>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
          Legal & Statutory Disclaimers
        </h1>
        <p className="mt-3 text-base text-red-200 leading-relaxed max-w-3xl">
          Important legal boundaries regarding emergency assistance, algorithmic predictions, and open data sources.
        </p>
      </div>

      {/* Disclaimers List */}
      <div className="mt-8 space-y-6 text-sm text-slate-300 leading-relaxed rounded-3xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
        {/* Emergency Services */}
        <section className="rounded-2xl border border-red-500/40 bg-red-950/30 p-5">
          <div className="flex items-center gap-2 text-red-300 font-black text-base">
            <Phone size={20} className="animate-pulse" /> 1. Emergency Services & Public Safety
          </div>
          <p className="mt-2 text-xs text-red-100 leading-relaxed">
            <strong>TravelMate is not an emergency service. In an emergency call 112.</strong>
          </p>
          <p className="mt-2 text-xs text-red-200/90 leading-relaxed">
            The emergency toolkit provides direct carrier phone dialers and coordinates copying for personal convenience. TravelMate does not operate private rescue teams, police units, or medical personnel.
          </p>
        </section>

        {/* PNR and Availability Predictions */}
        <section className="border-t border-slate-800 pt-6">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-base">
            <AlertTriangle size={18} /> 2. Waitlist (WL/RAC) Predictions & Availability Estimates
          </div>
          <p className="mt-2 text-xs leading-relaxed">
            All confirmation odds (e.g. "82% High Chance") and delay risk badges are <strong>mathematical heuristic estimates</strong> derived from historical cancellation distributions and class quotas. They do <em>not</em> represent guaranteed chart allocations. Final berth confirmation remains exclusively under the jurisdiction of the Indian Railways Passenger Reservation System (PRS).
          </p>
        </section>

        {/* Open Data Licensing & Attribution */}
        <section className="border-t border-slate-800 pt-6">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-base">
            <Database size={18} /> 3. Data Attribution & Open Licenses
          </div>
          <p className="mt-2 text-xs leading-relaxed">
            TravelMate utilizes transparent, publicly licensed open datasets and APIs:
          </p>
          <ul className="mt-2 space-y-2 text-xs text-slate-300 list-disc list-inside">
            <li><strong>Indian Railways Timetables:</strong> Open data sources published under the Government Open Data License (GODL-India) and Open Database License (ODbL). Timetable data is current as of October 2026.</li>
            <li><strong>Geographic & Map Imagery:</strong> Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="text-cyan-400 underline">OpenStreetMap</a> contributors, licensed under the Open Database License.</li>
            <li><strong>Atmospheric & Weather Observations:</strong> Weather alerts powered by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="text-cyan-400 underline">Open-Meteo</a> under the Creative Commons Attribution 4.0 International (CC BY 4.0) license.</li>
          </ul>
        </section>

        {/* Independence Disclaimer */}
        <section className="border-t border-slate-800 pt-6">
          <h2 className="text-base font-bold text-white">4. Independent Non-Affiliation Notice</h2>
          <p className="mt-2 text-xs leading-relaxed">
            TravelMate AI is an independent software application developed for research, innovation, and traveler convenience. It is not affiliated with, endorsed by, or operated by the Ministry of Railways, Indian Railway Catering and Tourism Corporation (IRCTC), Centre for Railway Information Systems (CRIS), or any state road transport corporation.
          </p>
        </section>
      </div>
    </div>
  )
}

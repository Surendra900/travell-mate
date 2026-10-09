import { AlertTriangle, ArrowLeft, ShieldAlert, Database, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LegalDisclaimer() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 text-slate-900" data-testid="legal-disclaimer-page">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-800 transition-colors">
          <ArrowLeft size={16} /> Back to TravelMate Home
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-3xl border border-red-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-red-800">
            <ShieldAlert size={14} /> Mandatory Statutory Disclosure
          </span>
          <span className="text-xs text-slate-600 font-semibold">October 2026</span>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Legal & Statutory Disclaimers
        </h1>
        <p className="mt-3 text-base text-slate-700 leading-relaxed max-w-3xl">
          Important legal boundaries regarding emergency assistance, algorithmic predictions, and open data sources.
        </p>
      </div>

      {/* Disclaimers List */}
      <div className="mt-8 space-y-6 text-sm text-slate-700 leading-relaxed rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Emergency Services */}
        <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex items-center gap-2 text-red-800 font-black text-base">
            <Phone size={20} className="animate-pulse text-red-700" /> 1. Emergency Services & Public Safety
          </div>
          <p className="mt-2 text-xs text-red-950 font-bold leading-relaxed">
            TravelMate is not an emergency service. In an emergency call 112.
          </p>
          <p className="mt-2 text-xs text-red-900 leading-relaxed">
            The emergency toolkit provides direct carrier phone dialers and coordinates copying for personal convenience. TravelMate does not operate private rescue teams, police units, or medical personnel.
          </p>
        </section>

        {/* PNR and Availability Predictions */}
        <section className="border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-base">
            <AlertTriangle size={18} /> 2. Waitlist (WL/RAC) Predictions & Availability Estimates
          </div>
          <p className="mt-2 text-xs text-slate-700 leading-relaxed">
            All confirmation odds (e.g. &quot;82% High Chance&quot;) and delay risk badges are <strong>mathematical heuristic estimates</strong> derived from historical cancellation distributions and class quotas. They do <em>not</em> represent guaranteed chart allocations. Final berth confirmation remains exclusively under the jurisdiction of the Indian Railways Passenger Reservation System (PRS).
          </p>
        </section>

        {/* Open Data Licensing & Attribution */}
        <section className="border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2 text-sky-800 font-bold text-base">
            <Database size={18} /> 3. Data Attribution & Open Licenses
          </div>
          <p className="mt-2 text-xs text-slate-700 leading-relaxed">
            TravelMate utilizes transparent, publicly licensed open datasets and APIs:
          </p>
          <ul className="mt-2 space-y-2 text-xs text-slate-700 list-disc list-inside">
            <li><strong>Indian Railways Timetables:</strong> Open data sources published under the Government Open Data License (GODL-India) and Open Database License (ODbL). Timetable data is current as of October 2026.</li>
            <li><strong>Geographic & Map Imagery:</strong> Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="text-sky-700 hover:text-sky-800 underline font-semibold">OpenStreetMap</a> contributors, licensed under the Open Database License.</li>
            <li><strong>Atmospheric & Weather Observations:</strong> Weather alerts powered by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="text-sky-700 hover:text-sky-800 underline font-semibold">Open-Meteo</a> under the Creative Commons Attribution 4.0 International (CC BY 4.0) license.</li>
          </ul>
        </section>

        {/* Independence Disclaimer */}
        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-base font-bold text-slate-900">4. Independent Non-Affiliation Notice</h2>
          <p className="mt-2 text-xs text-slate-700 leading-relaxed">
            TravelMate AI is an independent software application developed for research, innovation, and traveler convenience. It is not affiliated with, endorsed by, or operated by the Ministry of Railways, Indian Railway Catering and Tourism Corporation (IRCTC), Centre for Railway Information Systems (CRIS), or any state road transport corporation.
          </p>
        </section>

        {/* Unbundled Multi-Ticket & Split-Routing Liability Disclaimer (C-15) */}
        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-base font-bold text-slate-900">5. Unbundled Multi-Ticket Bookings & Missed Connection Risk</h2>
          <p className="mt-2 text-xs text-slate-700 leading-relaxed">
            Multi-modal itineraries, split-tickets, and junction recovery transfers recommended by TravelMate consist of <strong>unbundled, independent passenger tickets</strong> booked under separate Passenger Name Records (PNRs) or booking transaction references across different transport operators.
          </p>
          <ul className="mt-2 space-y-1.5 text-xs text-slate-700 list-disc list-inside">
            <li><strong>Separate Contracts of Carriage:</strong> Each ticket represents an isolated contract between the passenger and the respective carrier (Indian Railways, state transport corporation, or airline).</li>
            <li><strong>No Cross-Carrier Delay Liability:</strong> If the primary leg (Leg 1) experiences delays, mechanical breakdowns, or cancellations, downstream carriers (Leg 2) have no statutory obligation to delay departure, offer free rebooking, or provide a refund.</li>
            <li><strong>Buffer & Insurance Recommendation:</strong> While TravelMate algorithmically enforces Minimum Connection Times (&ge; 45 minutes) and displays statistical delay absorption margins, travelers are advised to allow 90+ minutes buffer during severe weather periods or obtain independent domestic travel insurance.</li>
          </ul>
        </section>
      </div>
    </div>
  )
}


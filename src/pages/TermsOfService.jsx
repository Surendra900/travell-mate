import { FileText, ArrowLeft, ExternalLink, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePageMetadata } from '../hooks/usePageMetadata'

export default function TermsOfService() {
  usePageMetadata({
    title: 'Terms of Service & Operational Disclosures | TravelMate',
    description: 'Operational guidelines, independent deep linking disclosures, and limitation of liability for TravelMate.'
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 text-slate-900" data-testid="terms-of-service-page">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-800 transition-colors">
          <ArrowLeft size={16} /> Back to TravelMate Home
        </Link>
      </div>

      {/* Draft Review Banner */}
      <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-950 font-medium leading-relaxed">
        <p className="font-bold text-amber-900 mb-1">DRAFT TERMS (PRE-LAUNCH REVIEW)</p>
        <p>These draft terms describe actual operational features and third-party ticketing disclaimers. They require owner review and qualification by legal counsel before public commercial deployment. Placeholders are marked in brackets.</p>
      </div>

      {/* Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-300 bg-sky-50 px-3 py-1 text-xs font-black uppercase tracking-wider text-sky-800">
            <FileText size={14} /> Legal Terms & Conditions
          </span>
          <span className="text-xs text-slate-600 font-semibold">Effective date: [PLACEHOLDER: effective date]</span>
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-base text-slate-700 leading-relaxed max-w-3xl">
          Please review these terms before using the TravelMate Multimodal Disruption & Route Recovery platform. By using this service, you agree to these transparent operational guidelines.
        </p>
      </div>

      {/* Core Operational Disclosures */}
      <div className="mt-8 space-y-6 text-sm text-slate-700 leading-relaxed rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <section>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-sky-700" /> 1. Nature of the Service
          </h2>
          <p className="mt-2 text-xs leading-relaxed">
            TravelMate is an <strong>independent itinerary discovery and route recovery engine</strong> designed to assist travelers when direct train quotas are waitlisted or unavailable. TravelMate computes multi-modal combinations across trains, inter-city buses, and flights through major regional junction hubs.
          </p>
        </section>

        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ExternalLink size={18} className="text-amber-800" /> 2. Independent Booking & Deep Linking
          </h2>
          <p className="mt-2 text-xs leading-relaxed">
            <strong>TravelMate does not sell tickets, process payments, or issue bookings.</strong> All ticket reservations must be completed independently by the user directly on official operator portals (such as IRCTC, ConfirmTkt, redBus, MakeMyTrip, or airline sites). Split itineraries require purchasing separate tickets for each leg.
          </p>
          <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950 font-medium leading-relaxed">
            <strong>Independent Legs Notice:</strong> If one leg is delayed or missed, onward carriers do not automatically refund or reschedule subsequent separate bookings. Users are advised to adhere to recommended transfer slack buffers.
          </div>
        </section>

        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-700" /> 3. No Automated Booking or Captcha Bypass
          </h2>
          <p className="mt-2 text-xs leading-relaxed">
            TravelMate strictly prohibits and does not engage in automated bot bookings, unauthorized script generation, captcha circumvention, or credential storage. The Tatkal Desk provides only client-side passenger clipboard formatting to assist manual booking on official portals.
          </p>
        </section>

        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-900">4. Limitation of Liability</h2>
          <p className="mt-2 text-xs leading-relaxed">
            Timetable schedules, platform numbers, fare estimates, and delay metrics are provided for informational assistance based on open timetable databases and historical patterns. TravelMate is not liable for schedule changes, delays, cancellations, missed connections, or carrier policy modifications.
          </p>
        </section>

        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-900">5. Payments, Fees, and Refund Policy</h2>
          <p className="mt-2 text-xs leading-relaxed">
            TravelMate does not process commercial transactions, charge booking fees, or collect passenger payments. All ticketing and payment transactions occur directly on third-party operator portals. TravelMate does not issue refunds: [PLACEHOLDER: refund eligibility and process; owner and legal review required]. Any cancellations or refunds are governed solely by the respective transport operator's fare rules.
          </p>
        </section>

        <section className="border-t border-slate-200 pt-6">
          <h2 className="text-lg font-bold text-slate-900">6. Governing Law</h2>
          <p className="mt-2 text-xs leading-relaxed">
            These terms are governed by the laws of India. Any disputes arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts of [PLACEHOLDER: applicable jurisdiction].
          </p>
        </section>
      </div>
    </div>
  )
}


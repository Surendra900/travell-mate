import React from 'react'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrainFront,
  Zap
} from 'lucide-react'
import { RiskBadge } from './ui/RiskBadge'
import { ProvenanceBadge } from './ui/ProvenanceBadge'

export default function WaitlistBypassContrast({
  directRoute = null,
  splitRoute = null,
  from = 'New Delhi',
  to = 'Patna Jn',
  date = '2026-10-15',
  onSelectSplitRoute = null,
  className = ''
}) {
  // Direct route defaults / extraction
  const direct = directRoute || {
    trainNumber: '12304',
    trainName: 'Poorva Express',
    departTime: '17:40',
    arriveTime: '06:50 (+1)',
    durationFormatted: '13h 10m',
    status: 'WL 54 / REGRET',
    fareFormatted: '₹1,580',
    bookingUrl: `https://www.confirmtkt.com/rbooking/trains-between-stations?fromStationCode=NDLS&toStationCode=PNBE&date=${date}`
  }

  // Split route defaults / extraction
  const split = splitRoute || {
    tierLabel: '🟢 Paisa Vasool (Cheapest)',
    hubCity: 'Kanpur Central',
    totalDuration: '11h 45m',
    totalFare: '₹1,240',
    fareFormatted: '₹1,240',
    slackMinutes: 105,
    maxAbsorbableDelay: 60,
    riskLevel: 'Safe',
    whyPicked: 'Splits journey into two confirmed regional quotas via Kanpur Central, bypassing direct waitlist.',
    leg1: {
      mode: 'Train',
      service: 'Vande Bharat Express (22436)',
      depart: '06:00',
      arrive: '10:08',
      from: 'NDLS',
      to: 'CNB',
      fare: '₹710',
      status: 'Available (42 Seats)',
      bookingLink: `https://www.confirmtkt.com/rbooking/trains-between-stations?fromStationCode=NDLS&toStationCode=CNB&date=${date}`
    },
    leg2: {
      mode: 'Train',
      service: 'Tejas Rajdhani Express (20502)',
      depart: '11:53',
      arrive: '17:45',
      from: 'CNB',
      to: 'PNBE',
      fare: '₹530',
      status: 'Available (18 Seats)',
      bookingLink: `https://www.confirmtkt.com/rbooking/trains-between-stations?fromStationCode=CNB&toStationCode=PNBE&date=${date}`
    }
  }

  const directStatus = direct.status || 'Waitlisted (WL 48)'
  const isDirectWaitlisted = !directStatus.toLowerCase().includes('avail') && !directStatus.toLowerCase().includes('cnf')

  return (
    <section
      data-testid="waitlist-bypass-contrast"
      className={`rounded-3xl border-2 border-sky-300 bg-white p-5 sm:p-7 shadow-lg ${className}`.trim()}
    >
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-950 font-black text-xs uppercase tracking-wider">
            <Zap size={13} className="text-amber-700" />
            Waitlist Bypass Engine
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 mt-1.5 flex items-center gap-2">
            <span>Direct vs. Split-Route Recovery Contrast</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare the direct train bottleneck against the regional junction bypass option.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ProvenanceBadge source="TIMETABLE" />
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        {/* Left Side: The Direct Train (Waitlist Wall) */}
        <div
          data-testid="contrast-direct-card"
          className="rounded-2xl border-2 border-red-200 bg-red-50/40 p-5 sm:p-6 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-red-100">
              <span className="text-xs font-black uppercase tracking-wider text-red-800 flex items-center gap-1.5">
                <ShieldAlert size={15} className="text-red-600" />
                Direct Train Status (Waitlist Wall)
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-red-100 text-red-900 border border-red-300">
                {directStatus}
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-black text-slate-900">
                {direct.trainName || 'Direct Trunk Train'}
                {direct.trainNumber && <span className="text-xs text-slate-500 ml-1.5">({direct.trainNumber})</span>}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {from} → {to} · Direct Route
              </p>
            </div>

            {/* Direct Timings */}
            <div className="my-4 grid grid-cols-3 items-center gap-2 text-center sm:text-left bg-white/80 rounded-xl p-3 border border-red-100">
              <div>
                <div className="text-lg font-black text-slate-900">{direct.departTime || '17:40'}</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">{from}</div>
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-slate-500 flex items-center justify-center gap-1">
                  <Clock size={12} />
                  <span>{direct.durationFormatted || '13h 10m'}</span>
                </div>
                <div className="text-[10px] text-red-600 font-bold mt-0.5">No Transfers</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-slate-900">{direct.arriveTime || '06:50'}</div>
                <div className="text-[11px] font-bold text-slate-500 uppercase">{to}</div>
              </div>
            </div>

            {/* Direct Disruption Assessment */}
            <div className="rounded-xl bg-red-100/70 border border-red-200 p-3 text-xs text-red-950 space-y-1">
              <p className="font-bold">❌ Bottleneck Identified:</p>
              <p className="text-[11px] leading-relaxed">
                Direct tickets for this corridor are heavily oversubscribed. High probability of remaining waitlisted without berth allotment on chart preparation.
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-red-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              Fare: <b className="text-slate-900">{direct.fareFormatted || '₹1,580'}</b>
            </span>
            <a
              href={direct.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-300 bg-white hover:bg-red-50 text-xs font-bold text-red-800 transition shadow-sm"
            >
              <span>Check IRCTC WL</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Right Side: Split-Route Recovery Alternative */}
        <div
          data-testid="contrast-split-card"
          className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/40 p-5 sm:p-6 flex flex-col justify-between shadow-sm"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Sparkles size={15} className="text-emerald-700" />
                Split-Route Alternative (Waitlist Bypass)
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Seats Available</span>
              </span>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Via {split.hubCity} Junction</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                  1 Transfer
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {split.whyPicked || `Splits journey into two confirmed regional quotas via ${split.hubCity}.`}
              </p>
            </div>

            {/* Split Route Legs Breakdown */}
            <div className="my-4 space-y-2.5">
              {/* Leg 1 */}
              <div className="rounded-xl bg-white p-3 border border-emerald-200 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1.5 text-sky-800">
                    <TrainFront size={14} />
                    Leg 1: {split.leg1?.service || 'Train to Hub'}
                  </span>
                  <span className="text-emerald-700">{split.leg1?.status || 'Available'}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-slate-600 text-[11px]">
                  <span>{split.leg1?.depart || '06:00'} ({split.leg1?.from || from})</span>
                  <span>──➔</span>
                  <span>{split.leg1?.arrive || '10:08'} ({split.leg1?.to || split.hubCity})</span>
                </div>
              </div>

              {/* Transfer buffer & Risk Badge */}
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-100/60 border border-emerald-200 text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1">
                  <Clock size={12} />
                  <span>Transfer Buffer: {split.slackMinutes || 105}m</span>
                </span>
                <RiskBadge
                  bufferMinutes={split.slackMinutes || 105}
                  maxDelayMinutes={split.maxAbsorbableDelay || 60}
                  riskLabel={split.riskLevel || 'Safe'}
                />
              </div>

              {/* Leg 2 */}
              <div className="rounded-xl bg-white p-3 border border-emerald-200 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className="flex items-center gap-1.5 text-blue-800">
                    <TrainFront size={14} />
                    Leg 2: {split.leg2?.service || 'Connecting Train'}
                  </span>
                  <span className="text-emerald-700">{split.leg2?.status || 'Available'}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-slate-600 text-[11px]">
                  <span>{split.leg2?.depart || '11:53'} ({split.leg2?.from || split.hubCity})</span>
                  <span>──➔</span>
                  <span>{split.leg2?.arrive || '17:45'} ({split.leg2?.to || to})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-600">
                Total: <b className="text-slate-900 text-base">{split.fareFormatted || '₹1,240'}</b>
              </span>
              <span className="text-[11px] text-slate-500 ml-2">
                · {split.totalDuration || '11h 45m'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={split.leg1?.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-sm transition"
              >
                <span>Book Leg 1 ↗</span>
              </a>
              <a
                href={split.leg2?.bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
              >
                <span>Book Leg 2 ↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Independent Booking Disclosure */}
      <div
        data-testid="statutory-split-disclosure"
        className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 leading-relaxed"
      >
        <b className="text-slate-900">Statutory Booking Notice:</b> These are independent bookings. If one leg is delayed, other operators owe you nothing and TravelMate cannot guarantee refunds or compensation. Always maintain safe transfer buffers.
      </div>
    </section>
  )
}

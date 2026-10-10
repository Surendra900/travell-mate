import React from 'react'
import { Radio, Database, Calculator, AlertTriangle, CalendarCheck } from 'lucide-react'

export function ProvenanceBadge({
  source = 'TIMETABLE',
  timestamp = '',
  className = ''
}) {
  const norm = String(source || 'TIMETABLE').trim().toUpperCase()

  if (norm === 'LIVE_PROVIDER_DATA' || (norm.includes('LIVE') && !norm.includes('SCHEDULE'))) {
    return (
      <span
        title={timestamp ? `Live provider confirmed at ${timestamp}` : 'Live data confirmed from official provider'}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`.trim()}
      >
        <Radio size={11} className="text-emerald-600 animate-pulse" />
        <span>LIVE DATA{timestamp ? ` (${timestamp})` : ''}</span>
      </span>
    )
  }

  if (norm === 'LIVE_SCHEDULE_ONLY') {
    return (
      <span
        title="Live provider schedule verified. Confirm live seat availability at booking portal."
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 ${className}`.trim()}
      >
        <CalendarCheck size={11} className="text-teal-600" />
        <span>LIVE SCHEDULE</span>
      </span>
    )
  }

  if (norm === 'PROVIDER_VERIFICATION_REQUIRED') {
    return (
      <span
        title="Provider verification required on official booking portal."
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 ${className}`.trim()}
      >
        <AlertTriangle size={11} className="text-amber-600" />
        <span>VERIFY PROVIDER</span>
      </span>
    )
  }

  if (norm.includes('TIMETABLE') || norm.includes('DATASET')) {
    return (
      <span
        title="Official timetable dataset. Times are scheduled."
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200 ${className}`.trim()}
      >
        <Database size={11} className="text-sky-600" />
        <span>TIMETABLE</span>
      </span>
    )
  }

  // ESTIMATE (computed / parametric heuristic)
  return (
    <span
      title="Computed route estimate. Fares and frequencies are approximate; verify on official portal."
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300 ${className}`.trim()}
    >
      <Calculator size={11} className="text-slate-600" />
      <span>ESTIMATE</span>
    </span>
  )
}

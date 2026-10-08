import React from 'react'
import { Radio, Database, Calculator } from 'lucide-react'

export function ProvenanceBadge({
  source = 'TIMETABLE',
  timestamp = '',
  className = ''
}) {
  const norm = String(source || 'TIMETABLE').toUpperCase()

  if (norm.includes('LIVE')) {
    return (
      <span
        title={timestamp ? `Live provider confirmed at ${timestamp}` : 'Live data from official provider'}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`.trim()}
      >
        <Radio size={11} className="text-emerald-600 animate-pulse" />
        <span>LIVE{timestamp ? ` (${timestamp})` : ''}</span>
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 ${className}`.trim()}
    >
      <Calculator size={11} className="text-amber-600" />
      <span>ESTIMATE</span>
    </span>
  )
}

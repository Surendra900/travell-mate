import React from 'react'
import { ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon } from 'lucide-react'

export function RiskBadge({
  bufferMinutes = 120,
  riskLabel = '',
  maxDelayMinutes = null,
  className = ''
}) {
  let label = riskLabel
  if (!label) {
    if (bufferMinutes >= 120) label = 'Safe'
    else if (bufferMinutes >= 90) label = 'Moderate'
    else if (bufferMinutes >= 60) label = 'Tight'
    else label = 'High Risk'
  }

  const norm = label.toLowerCase()

  if (norm.includes('safe')) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 ${className}`.trim()}>
        <ShieldCheck size={13} className="text-emerald-600" />
        <span>Safe Buffer ({bufferMinutes}m)</span>
        {maxDelayMinutes != null && <span className="font-normal text-emerald-700">· Safe up to +{maxDelayMinutes}m delay</span>}
      </span>
    )
  }

  if (norm.includes('moderate')) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 ${className}`.trim()}>
        <ShieldCheck size={13} className="text-blue-600" />
        <span>Moderate ({bufferMinutes}m)</span>
      </span>
    )
  }

  if (norm.includes('tight')) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 ${className}`.trim()}>
        <AlertTriangle size={13} className="text-amber-600" />
        <span>Tight Layover ({bufferMinutes}m)</span>
      </span>
    )
  }

  // High Risk (<60 min)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-800 border border-red-200 ${className}`.trim()}>
      <AlertOctagon size={13} className="text-red-600" />
      <span>High Risk (&lt;60m)</span>
    </span>
  )
}

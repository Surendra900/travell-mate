/**
 * ProvenanceBadge — Agent 02: Frontend
 * Shows data-source quality for every result card.
 * Per docs/UI_UX_SPEC.md §2
 */

import { CheckCircle2, Clock, HelpCircle, AlertTriangle } from 'lucide-react'

const CONFIG = {
  LIVE_PROVIDER_DATA: {
    label: 'Live Data',
    icon: CheckCircle2,
    classes: 'border-[#C6E8D1] bg-[#EDF7F0] text-[#137333]',
  },
  TIMETABLE: {
    label: 'Timetable (2016)',
    icon: Clock,
    classes: 'border-[#F6DFB1] bg-[#FEF7E6] text-[#A15C07]',
  },
  ESTIMATE: {
    label: 'Estimate',
    icon: HelpCircle,
    classes: 'border-gray-200 bg-gray-50 text-gray-700',
  },
  PROVIDER_VERIFICATION_REQUIRED: {
    label: 'Verify before booking',
    icon: AlertTriangle,
    classes: 'border-[#F8B4B4] bg-[#FDF2F2] text-[#9B1C1C]',
  },
}

const DEFAULT = {
  label: 'Unknown source',
  icon: HelpCircle,
  classes: 'border-gray-200 bg-gray-50 text-gray-500',
}

/**
 * @param {{ provenance: string, className?: string }} props
 */
export default function ProvenanceBadge({ provenance, className = '' }) {
  const cfg = CONFIG[provenance] ?? DEFAULT
  const Icon = cfg.icon

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-semibold ${cfg.classes} ${className}`}
      aria-label={cfg.label}
      title={provenance}
    >
      <Icon size={12} aria-hidden="true" />
      <span>{cfg.label}</span>
    </span>
  )
}

/** Utility — returns the CSS class string without rendering */
export function provenanceBadgeClass(provenance) {
  return (CONFIG[provenance] ?? DEFAULT).classes
}

/** Utility — returns the label string without rendering */
export function provenanceBadgeLabel(provenance) {
  return (CONFIG[provenance] ?? DEFAULT).label
}

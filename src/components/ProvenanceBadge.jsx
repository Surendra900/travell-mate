/**
 * ProvenanceBadge — Agent 02: Frontend
 * Shows data-source quality for every result card.
 * Per docs/UI_UX_SPEC.md §2
 */

const CONFIG = {
  LIVE_PROVIDER_DATA: {
    label: 'Live Data',
    icon: '✦',
    classes: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-200',
  },
  TIMETABLE: {
    label: 'Timetable (2016)',
    icon: '🕐',
    classes: 'border-amber-500/40 bg-amber-950/40 text-amber-200',
  },
  ESTIMATE: {
    label: 'Estimate',
    icon: '~',
    classes: 'border-slate-500/40 bg-slate-800/60 text-slate-400',
  },
  PROVIDER_VERIFICATION_REQUIRED: {
    label: 'Verify before booking',
    icon: '⚠',
    classes: 'border-red-500/40 bg-red-950/40 text-red-400',
  },
}

const DEFAULT = {
  label: 'Unknown source',
  icon: '?',
  classes: 'border-slate-600/40 bg-slate-800/60 text-slate-500',
}

/**
 * @param {{ provenance: string, className?: string }} props
 */
export default function ProvenanceBadge({ provenance, className = '' }) {
  const cfg = CONFIG[provenance] ?? DEFAULT
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium ${cfg.classes} ${className}`}
      aria-label={cfg.label}
      title={provenance}
    >
      <span aria-hidden="true">{cfg.icon}</span>
      {cfg.label}
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

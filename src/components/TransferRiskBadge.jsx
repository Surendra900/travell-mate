/**
 * TransferRiskBadge — Agent 02: Frontend
 * Shows transfer risk level at a connection point in a combination route card.
 * Per docs/UI_UX_SPEC.md §4
 *
 * @param {{
 *   risk: 'LOW' | 'MEDIUM' | 'HIGH',
 *   bufferMinutes: number,
 *   mctMinutes: number,
 *   message?: string,
 * }} props
 */

const RISK_CONFIG = {
  LOW: {
    icon: '✓',
    label: 'Safe Connection',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/40',
    text: 'text-emerald-200',
  },
  MEDIUM: {
    icon: '⚡',
    label: 'Tight Connection',
    bg: 'bg-amber-950/50',
    border: 'border-amber-500/40',
    text: 'text-amber-200',
  },
  HIGH: {
    icon: '⚠',
    label: 'High Risk',
    bg: 'bg-red-950/60',
    border: 'border-red-500/50',
    text: 'text-red-200',
  },
}

export default function TransferRiskBadge({ risk = 'LOW', bufferMinutes, mctMinutes, message }) {
  const cfg = RISK_CONFIG[risk] ?? RISK_CONFIG.LOW
  const ariaLabel = `${cfg.label}: ${bufferMinutes} min buffer, MCT ${mctMinutes} min`

  return (
    <div
      className={`rounded-md border px-3 py-2 text-xs ${cfg.bg} ${cfg.border} ${cfg.text}`}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="flex items-center gap-1 font-semibold">
        <span>{cfg.icon}</span>
        <span>{cfg.label}</span>
      </div>
      {(bufferMinutes !== undefined && mctMinutes !== undefined) && (
        <div className="mt-0.5 opacity-80">
          {bufferMinutes} min buffer · MCT {mctMinutes} min
        </div>
      )}
      {message && (
        <div className="mt-0.5 italic opacity-70">{message}</div>
      )}
    </div>
  )
}

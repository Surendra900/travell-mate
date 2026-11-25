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

import { Check, Zap, AlertTriangle } from 'lucide-react'

const RISK_CONFIG = {
  LOW: {
    icon: Check,
    label: 'Safe Connection',
    bg: 'bg-[#EDF7F0]',
    border: 'border-[#C6E8D1]',
    text: 'text-[#137333]',
  },
  MEDIUM: {
    icon: Zap,
    label: 'Tight Connection',
    bg: 'bg-[#FEF7E6]',
    border: 'border-[#F6DFB1]',
    text: 'text-[#A15C07]',
  },
  HIGH: {
    icon: AlertTriangle,
    label: 'High Risk',
    bg: 'bg-[#FDF2F2]',
    border: 'border-[#F8B4B4]',
    text: 'text-[#9B1C1C]',
  },
}

export default function TransferRiskBadge({ risk = 'LOW', bufferMinutes, mctMinutes, message }) {
  const cfg = RISK_CONFIG[risk] ?? RISK_CONFIG.LOW
  const Icon = cfg.icon
  const ariaLabel = `${cfg.label}: ${bufferMinutes} min buffer, MCT ${mctMinutes} min`

  return (
    <div
      className={`rounded-md border px-3 py-2 text-xs font-medium ${cfg.bg} ${cfg.border} ${cfg.text}`}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="flex items-center gap-1.5 font-bold">
        <Icon size={14} className="shrink-0" />
        <span>{cfg.label}</span>
      </div>
      {(bufferMinutes !== undefined && mctMinutes !== undefined) && (
        <div className="mt-0.5 opacity-90 tabular-nums">
          {bufferMinutes} min buffer · MCT {mctMinutes} min
        </div>
      )}
      {message && (
        <div className="mt-0.5 opacity-80">{message}</div>
      )}
    </div>
  )
}

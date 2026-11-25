/**
 * NearbyNodeLabel — Agent 02: Frontend
 * Shows the nearby-station/airport fallback label beneath a station name.
 * Per docs/UI_UX_SPEC.md §3
 *
 * @param {{ note: string, distKm: number }} props
 *   note    — the string from nearbyLabel() e.g. "From Kollam Jn, 65 km from your origin"
 *   distKm  — numeric distance for colour decision (amber when >50 km, slate when ≤50 km)
 */
export default function NearbyNodeLabel({ note, distKm = 0 }) {
  if (!note) return null

  const colourClass = distKm > 50 ? 'text-amber-300' : 'text-slate-400'

  return (
    <p
      className={`text-xs mt-0.5 flex items-center gap-1 ${colourClass}`}
      role="note"
      aria-label={note}
    >
      <span aria-hidden="true">📍</span>
      {note}
    </p>
  )
}

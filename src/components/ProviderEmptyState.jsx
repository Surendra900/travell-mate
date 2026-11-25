/**
 * ProviderEmptyState — Agent 02: Frontend
 * Shown immediately (no spinner) when a mode returns provider-unconfigured or no results.
 * Per docs/UI_UX_SPEC.md §7
 *
 * @param {{
 *   mode: 'train' | 'bus' | 'flight' | 'combination',
 *   reason?: string,
 *   onSwitchTrain?: () => void,
 *   onSwitchFlight?: () => void,
 * }} props
 */

const MODE_META = {
  train: { icon: '🚂', label: 'Train Search' },
  bus:   { icon: '🚌', label: 'Bus Search' },
  flight:{ icon: '✈️',  label: 'Flight Search' },
  combination: { icon: '🗺️', label: 'Combination Search' },
}

export default function ProviderEmptyState({
  mode = 'bus',
  reason = 'Provider not configured. Results will appear here once an API is connected.',
  onSwitchTrain,
  onSwitchFlight,
}) {
  const meta = MODE_META[mode] ?? MODE_META.bus

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-700/50 bg-slate-900 px-6 py-10 text-center text-sm text-slate-400">
      <span className="text-4xl" aria-hidden="true">{meta.icon}</span>
      <p className="font-semibold text-slate-300">{meta.label}</p>
      <p>{reason}</p>
      {(onSwitchTrain || onSwitchFlight) && (
        <div className="mt-2 flex gap-3">
          {onSwitchTrain && (
            <button
              onClick={onSwitchTrain}
              className="rounded-md border border-slate-600 px-3 py-1 text-xs hover:bg-slate-800"
            >
              🚂 Try Train
            </button>
          )}
          {onSwitchFlight && (
            <button
              onClick={onSwitchFlight}
              className="rounded-md border border-slate-600 px-3 py-1 text-xs hover:bg-slate-800"
            >
              ✈️ Try Flight
            </button>
          )}
        </div>
      )}
    </div>
  )
}

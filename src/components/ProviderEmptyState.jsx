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

import { TrainFront, BusFront, Plane, MapPin } from 'lucide-react'

const MODE_META = {
  train: { icon: TrainFront, label: 'Train Search' },
  bus:   { icon: BusFront, label: 'Bus Search' },
  flight:{ icon: Plane, label: 'Flight Search' },
  combination: { icon: MapPin, label: 'Combination Search' },
}

export default function ProviderEmptyState({
  mode = 'bus',
  reason = 'Provider not configured. Results will appear here once an API is connected.',
  onSwitchTrain,
  onSwitchFlight,
}) {
  const meta = MODE_META[mode] ?? MODE_META.bus
  const Icon = meta.icon

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500 shadow-xs">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
        <Icon size={24} />
      </div>
      <p className="font-bold text-gray-900">{meta.label}</p>
      <p className="text-xs text-gray-500 max-w-sm">{reason}</p>
      {(onSwitchTrain || onSwitchFlight) && (
        <div className="mt-2 flex gap-2">
          {onSwitchTrain && (
            <button
              onClick={onSwitchTrain}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
            >
              <TrainFront size={14} /> Try Train
            </button>
          )}
          {onSwitchFlight && (
            <button
              onClick={onSwitchFlight}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
            >
              <Plane size={14} /> Try Flight
            </button>
          )}
        </div>
      )}
    </div>
  )
}

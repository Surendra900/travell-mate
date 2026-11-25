/**
 * CombinationRouteCard — Agent 02: Frontend
 * Full multi-leg route card with transfer risk badges and provenance.
 * Per docs/UI_UX_SPEC.md §5
 *
 * @param {{ route: import('../types/routeSchema').TravelRoute }} props
 */
import { TrainFront, BusFront, Plane } from 'lucide-react'
import ProvenanceBadge from './ProvenanceBadge.jsx'
import TransferRiskBadge from './TransferRiskBadge.jsx'
import NearbyNodeLabel from './NearbyNodeLabel.jsx'

function ModeIcon({ mode, className = "w-4 h-4 text-[#15803D]" }) {
  if (mode === 'Flight') return <Plane className={className} />
  if (mode === 'Bus') return <BusFront className={className} />
  return <TrainFront className={className} />
}

function LegCard({ leg, labelledById }) {
  return (
    <div
      className="rounded border border-gray-200 bg-gray-50/60 p-3 text-xs"
      aria-labelledby={labelledById}
    >
      <div id={labelledById} className="flex items-center justify-between gap-2 mb-1">
        <span className="font-semibold text-gray-900 flex items-center gap-1.5">
          <ModeIcon mode={leg.mode} /> {leg.mode}
        </span>
        <ProvenanceBadge provenance={leg.provenance} />
      </div>

      {leg.serviceName && (
        <p className="text-gray-800 font-semibold">{leg.serviceName}</p>
      )}

      <div className="flex items-center gap-2 text-gray-500 text-[11px] mt-1">
        <span className="font-medium text-gray-700">{leg.from?.name ?? leg.from}</span>
        {leg.depart && <span className="tabular font-semibold text-gray-900">{leg.depart}</span>}
        <span>→</span>
        <span className="font-medium text-gray-700">{leg.to?.name ?? leg.to}</span>
        {leg.arrive && <span className="tabular font-semibold text-gray-900">{leg.arrive}</span>}
      </div>

      {leg.nearbyNote && (
        <NearbyNodeLabel note={leg.nearbyNote} distKm={leg.nearbyDistKm} />
      )}

      <div className="flex items-center gap-3 mt-1.5 text-gray-600 text-[11px]">
        {leg.durationMin && <span>{Math.floor(leg.durationMin / 60)}h {leg.durationMin % 60}m</span>}
        {leg.fare != null && <span className="font-semibold text-gray-900 tabular">₹{leg.fare.toLocaleString('en-IN')}</span>}
      </div>

      {leg.bookingLink && (
        <a
          href={leg.bookingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs font-semibold text-[#15803D] hover:underline"
        >
          Book Leg ↗
        </a>
      )}
    </div>
  )
}

export default function CombinationRouteCard({ route }) {
  if (!route?.legs?.length) return null

  const legs = route.legs
  const totalFare = route.totalFare
  const totalMin = route.totalDurationMin
  const modeLabels = legs.map(l => l.mode).join(' + ')

  return (
    <article
      className="rounded-lg border border-gray-200 bg-white p-4 shadow-xs"
      aria-label={`Combination route: ${modeLabels}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-gray-100">
        <div>
          <span className="text-sm font-bold text-gray-900">{modeLabels}</span>
          <div className="text-xs text-gray-500 mt-0.5">
            {totalMin != null && `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`}
            {totalFare != null && <span className="tabular font-semibold text-gray-900"> · ₹{totalFare.toLocaleString('en-IN')}</span>}
          </div>
        </div>
        <ProvenanceBadge provenance={route.provenance} />
      </div>

      {/* Legs + Transfer badges */}
      <div className="flex flex-col gap-2">
        {legs.map((leg, i) => {
          const labelId = `leg-heading-${i}`
          return (
            <div key={i}>
              <LegCard leg={leg} labelledById={labelId} />

              {/* Transfer badge between legs */}
              {i < legs.length - 1 && leg.transferInfo && (
                <div className="my-2 px-1">
                  <TransferRiskBadge
                    risk={leg.transferInfo.risk}
                    bufferMinutes={leg.transferInfo.bufferMinutes}
                    mctMinutes={leg.transferInfo.mctMinutes}
                    message={leg.transferInfo.message}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </article>
  )
}

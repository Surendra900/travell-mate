/**
 * CombinationRouteCard — Agent 02: Frontend
 * Full multi-leg route card with transfer risk badges and provenance.
 * Per docs/UI_UX_SPEC.md §5
 *
 * @param {{ route: import('../types/routeSchema').TravelRoute }} props
 */
import ProvenanceBadge from './ProvenanceBadge.jsx'
import TransferRiskBadge from './TransferRiskBadge.jsx'
import NearbyNodeLabel from './NearbyNodeLabel.jsx'

const MODE_ICON = { Train: '🚂', Bus: '🚌', Flight: '✈️' }

function LegCard({ leg, labelledById }) {
  const icon = MODE_ICON[leg.mode] ?? '🚍'
  return (
    <div
      className="rounded-lg border border-slate-700/50 bg-slate-800/60 p-3 text-sm"
      aria-labelledby={labelledById}
    >
      <div id={labelledById} className="flex items-center justify-between gap-2 mb-1">
        <span className="font-semibold text-slate-100">
          {icon} {leg.mode}
        </span>
        <ProvenanceBadge provenance={leg.provenance} />
      </div>

      {leg.serviceName && (
        <p className="text-slate-300 font-medium">{leg.serviceName}</p>
      )}

      <div className="flex items-center gap-2 text-slate-400 text-xs mt-1">
        <span>{leg.from?.name ?? leg.from}</span>
        {leg.depart && <span>{leg.depart}</span>}
        <span>→</span>
        <span>{leg.to?.name ?? leg.to}</span>
        {leg.arrive && <span>{leg.arrive}</span>}
      </div>

      {leg.nearbyNote && (
        <NearbyNodeLabel note={leg.nearbyNote} distKm={leg.nearbyDistKm} />
      )}

      <div className="flex items-center gap-3 mt-1 text-slate-400 text-xs">
        {leg.durationMin && <span>{Math.floor(leg.durationMin / 60)}h {leg.durationMin % 60}m</span>}
        {leg.fare != null && <span>₹{leg.fare.toLocaleString('en-IN')}</span>}
      </div>

      {leg.bookingLink && (
        <a
          href={leg.bookingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
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
  const modeLabels = legs.map(l => `${MODE_ICON[l.mode] ?? ''} ${l.mode}`).join(' + ')

  return (
    <article
      className="rounded-xl border border-slate-700/50 bg-slate-900 p-4 shadow-md"
      aria-label={`Combination route: ${modeLabels}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-sm font-semibold text-slate-100">{modeLabels}</span>
          <div className="text-xs text-slate-400 mt-0.5">
            {totalMin != null && `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`}
            {totalFare != null && ` · ₹${totalFare.toLocaleString('en-IN')}`}
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

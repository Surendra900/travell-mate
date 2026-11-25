import React from 'react'

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`bg-slate-200 animate-pulse rounded ${className}`.trim()}
      aria-hidden="true"
      {...props}
    />
  )
}

export function SkeletonLine({ className = '' }) {
  return <Skeleton className={`h-4 ${className}`} />
}

export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-tm-sm p-5 sm:p-6 ${className}`.trim()}
      aria-hidden="true"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="text-right space-y-1 shrink-0">
          <Skeleton className="h-8 w-20 ml-auto" />
          <Skeleton className="h-5 w-24 rounded-full ml-auto" />
        </div>
      </div>
      {/* Timing row */}
      <div className="flex items-center gap-6 mb-4">
        <div className="space-y-1">
          <Skeleton className="h-6 w-14" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex-1 flex items-center gap-2">
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-px flex-1" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="h-6 w-14 ml-auto" />
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
      </div>
      {/* CTA row */}
      <div className="flex gap-2 justify-end">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 3, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-label="Loading results…">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export default Skeleton

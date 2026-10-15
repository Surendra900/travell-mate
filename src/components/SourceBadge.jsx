const styles = {
  'Live API result': 'border-emerald-200 bg-emerald-50 text-emerald-800',
  'LIVE_PROVIDER_DATA': 'border-emerald-200 bg-emerald-50 text-emerald-800',
  'LIVE_SCHEDULE_ONLY': 'border-sky-200 bg-sky-50 text-sky-800',
  'TIMETABLE (circa 2016)': 'border-teal-200 bg-teal-50 text-teal-800',
  'Timetable (community snapshot, about 2016)': 'border-teal-200 bg-teal-50 text-teal-800',
  'Live delay unavailable': 'border-slate-200 bg-slate-100 text-slate-700',
  'Local planning dataset': 'border-sky-200 bg-sky-50 text-sky-800',
  'Local planning estimate': 'border-amber-200 bg-amber-50 text-amber-800',
  'Provider verification required': 'border-amber-200 bg-amber-50 text-amber-800',
  'Input required': 'border-slate-200 bg-slate-100 text-slate-600',
  'API-ready': 'border-sky-200 bg-sky-50 text-sky-800'
}

export function sourceBadgeLabel(value, mode = '') {
  if (value) return value
  if (mode === 'live') return 'Live API result'
  if (mode === 'fallback' || mode === 'local-fallback' || mode === 'frontend-fallback') return 'Local planning estimate'
  if (mode === 'invalid') return 'Input required'
  return 'Local planning dataset'
}

export default function SourceBadge({ label, mode, className = '' }) {
  const text = sourceBadgeLabel(label, mode)
  const style = styles[text] || styles['Provider verification required']
  return <span className={`inline-flex items-center rounded-md border px-3 py-1 text-[11px] font-bold ${style} ${className}`}>{text}</span>
}

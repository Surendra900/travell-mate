const styles = {
  'Live API result': 'border-emerald-500/50 bg-emerald-950 text-emerald-200',
  'LIVE_PROVIDER_DATA': 'border-emerald-500/50 bg-emerald-950 text-emerald-200',
  'LIVE_SCHEDULE_ONLY': 'border-sky-500/50 bg-sky-950 text-sky-200',
  'TIMETABLE (circa 2016)': 'border-teal-500/50 bg-teal-950 text-teal-200',
  'Timetable (community snapshot, about 2016)': 'border-teal-500/50 bg-teal-950 text-teal-200',
  'Live delay unavailable': 'border-slate-500/50 bg-slate-900 text-slate-300',
  'Local planning dataset': 'border-cyan-500/50 bg-cyan-950 text-cyan-200',
  'Local planning estimate': 'border-amber-500/50 bg-amber-950 text-amber-200',
  'Provider verification required': 'border-orange-500/50 bg-orange-950 text-orange-200',
  'Input required': 'border-slate-600 bg-slate-900 text-slate-200',
  'API-ready': 'border-sky-500/50 bg-sky-950 text-sky-200'
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

const styles = {
  'Live API result': 'border-emerald-300/40 bg-emerald-300/15 text-emerald-100',
  'Local planning dataset': 'border-cyan-300/40 bg-cyan-300/15 text-cyan-100',
  'Local planning estimate': 'border-yellow-300/40 bg-yellow-300/15 text-yellow-100',
  'Provider verification required': 'border-orange-300/40 bg-orange-300/15 text-orange-100',
  'Input required': 'border-slate-500/50 bg-slate-700/40 text-slate-200',
  'API-ready': 'border-indigo-300/40 bg-indigo-300/15 text-indigo-100'
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
  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black ${style} ${className}`}>{text}</span>
}

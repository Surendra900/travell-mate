import { Link } from 'react-router-dom'
import { ArrowRight, ShieldAlert } from 'lucide-react'

export default function EmergencyCard({ item }) {
  return (
    <Link to={`/safety/${item.id}`} className="group rounded-lg border border-gray-200 bg-white p-4 shadow-xs transition hover:border-[#15803D] hover:shadow-sm">
      <div className="mb-3 h-9 w-9 rounded bg-[#EDF7F0] border border-[#C6E8D1] text-[#137333] flex items-center justify-center">
        <ShieldAlert size={18} />
      </div>
      <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{item.summary}</p>
      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
        Open action flow <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

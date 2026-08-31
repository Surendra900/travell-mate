import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function EmergencyCard({ item }) {
  return (
    <Link to={`/safety/${item.id}`} className="glass group rounded-3xl p-5 transition hover:-translate-y-1 hover:border-cyan-300/40">
      <div className={`mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br ${item.accent} shadow-lg`} />
      <h3 className="text-xl font-black text-white">{item.title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-300">{item.summary}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-200">
        Open action flow <ArrowRight size={16} className="transition group-hover:translate-x-1" />
      </span>
    </Link>
  )
}

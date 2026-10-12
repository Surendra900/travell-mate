import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Search, ShieldAlert, Compass } from 'lucide-react'
import { usePageMetadata } from '../hooks/usePageMetadata'

export default function NotFound() {
  usePageMetadata({
    title: 'Page Not Found (404) | TravelMate',
    description: 'The requested route does not exist. Navigate back to TravelMate home or search for transit routes.'
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center text-slate-900" data-testid="not-found-page">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 mb-6">
          <AlertCircle size={32} />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-700">
          HTTP 404
        </span>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
          Page not found
        </h1>

        <p className="mt-3 text-base text-slate-600 max-w-md mx-auto leading-relaxed">
          The destination or URL you requested does not exist on TravelMate. It may have been moved or entered incorrectly.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-sky-700 hover:bg-sky-800 text-white px-5 py-2.5 text-sm font-bold shadow-sm transition"
          >
            <ArrowLeft size={16} /> Back to TravelMate Home
          </Link>

          <Link
            to="/planner"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 hover:border-sky-400 bg-white hover:bg-sky-50 text-slate-800 hover:text-sky-800 px-5 py-2.5 text-sm font-bold shadow-sm transition"
          >
            <Search size={16} /> Open Route Finder
          </Link>

          <Link
            to="/safety"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 hover:border-red-400 bg-white hover:bg-red-50 text-slate-800 hover:text-red-700 px-5 py-2.5 text-sm font-bold shadow-sm transition"
          >
            <ShieldAlert size={16} /> Passes & Safety Hub
          </Link>
        </div>
      </div>
    </div>
  )
}

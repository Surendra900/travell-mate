import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, Search, ShieldAlert, Compass } from 'lucide-react'
import { usePageMetadata } from '../hooks/usePageMetadata'

export default function NotFound() {
  usePageMetadata({
    title: 'Page Not Found (404) | TravelMate',
    description: 'The requested route does not exist. Navigate back to TravelMate home or search for transit routes.'
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center text-gray-900" data-testid="not-found-page">
      <div className="rounded-lg border border-gray-200 bg-white p-8 sm:p-12 shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-amber-50 border border-amber-200 text-amber-600 mb-6">
          <AlertCircle size={28} />
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gray-700">
          HTTP 404
        </span>

        <h1 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
          Page not found
        </h1>

        <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
          The destination or URL you requested does not exist on TravelMate. It may have been moved or entered incorrectly.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md bg-[#15803D] hover:bg-[#12733B] text-white px-5 py-2.5 text-sm font-bold shadow-xs transition"
          >
            <ArrowLeft size={16} /> Back to TravelMate Home
          </Link>

          <Link
            to="/planner"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-800 px-5 py-2.5 text-sm font-bold shadow-xs transition"
          >
            <Search size={16} /> Open Route Finder
          </Link>

          <Link
            to="/safety"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-md border border-gray-300 hover:border-red-300 bg-white hover:bg-red-50 text-gray-800 hover:text-red-700 px-5 py-2.5 text-sm font-bold shadow-xs transition"
          >
            <ShieldAlert size={16} /> Passes & Safety Hub
          </Link>
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import { captureException } from '../utils/errorMonitoring'

export default class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('TravelMate page render failed:', error, info)
    captureException(error, { componentStack: info?.componentStack })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:py-20" role="alert">
        <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-50 shadow-danger sm:p-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="mt-1 shrink-0 text-red-300" size={28} />
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-red-200">Page recovery</p>
              <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">This TravelMate page could not load</h1>
              <p className="mt-3 text-sm leading-6 text-red-100/90">
                The rest of the website is still available. Reload this page once. If the problem remains after a new deployment, clear the old service-worker cache.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
                  <RefreshCw size={17} /> Reload page
                </button>
                <button type="button" className="btn-soft" onClick={() => window.location.assign('/')}>
                  <Home size={17} /> Go to home
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
}

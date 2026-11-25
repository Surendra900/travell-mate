import { NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, TrainFront, ShieldAlert, Bookmark, X, Volume2, Sparkles, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import LanguageSelector from './LanguageSelector'
import AccountMenu from './AccountMenu'

const nav = [
  { to: '/planner', label: 'Route Finder', icon: Search },
  { to: '/planner?mode=tatkal', label: 'Tatkal Desk', icon: Clock },
  { to: '/safety', label: 'Passes & Safety', icon: ShieldAlert },
  { to: '/saved', label: 'Saved Trips', icon: Bookmark }
]

export default function Navbar({ language, onLanguageChange, authEnabled, onOpenProfile, onOpenVoiceGate, onOpenDemoTour }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  function isItemActive(to) {
    const [path, query] = to.split('?')
    if (location.pathname !== path) return false
    const currentParams = new URLSearchParams(location.search)
    if (query) {
      const targetParams = new URLSearchParams(query)
      for (const [key, val] of targetParams.entries()) {
        if (currentParams.get(key) !== val) return false
      }
      return true
    }
    if (path === '/planner') {
      return currentParams.get('mode') !== 'tatkal' && currentParams.get('mode') !== 'emergency'
    }
    return true
  }

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }

    const mql = window.matchMedia('(min-width: 1024px)')
    function handleMediaChange(e) {
      if (e.matches) setOpen(false)
    }
    if (mql.matches) setOpen(false)
    if (mql.addEventListener) {
      mql.addEventListener('change', handleMediaChange)
    } else {
      mql.addListener(handleMediaChange)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', handleKeyDown)
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleMediaChange)
      } else {
        mql.removeListener(handleMediaChange)
      }
    }
  }, [open])

  return (
    <>
      {/* Skip to main */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-white focus:text-tm-primary focus:rounded-lg focus:shadow-tm-lg focus:font-semibold focus:text-sm"
      >
        Skip to main content
      </a>

      <header className="bg-slate-900 sticky top-0 z-50 shadow-lg" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 text-white font-black text-lg tracking-tight min-w-0 shrink focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg"
          >
            <span className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md shrink-0">
              <TrainFront size={20} />
            </span>
            <span className="font-extrabold tracking-tight shrink-0">TravelMate</span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden lg:grid lg:grid-cols-4 items-center gap-1 lg:max-w-4xl" aria-label="Primary navigation">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = isItemActive(to)
              return (
                <NavLink
                  key={to}
                  to={to}
                  aria-current={active ? 'page' : null}
                  className={[
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400',
                    active
                      ? 'bg-sky-500/20 text-sky-300 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  ].join(' ')}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </NavLink>
              )
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onOpenDemoTour}
              className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-500/40 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 hover:text-sky-200 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              aria-label="See a Demo"
              data-testid="navbar-demo-tour-btn"
            >
              <Sparkles size={13} />
              <span>Demo</span>
            </button>

            <button
              type="button"
              onClick={onOpenVoiceGate}
              className="hidden sm:flex items-center justify-center w-9 h-9 rounded-lg border border-white/15 bg-white/10 text-slate-300 hover:text-sky-300 hover:border-sky-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition"
              title="Voice Accessibility Mode (Alt+B)"
              aria-label="Voice Accessibility Mode (Alt+B)"
              data-testid="navbar-voice-gate-btn"
            >
              <Volume2 size={16} />
            </button>

            <div className="text-slate-300">
              <LanguageSelector language={language} onChange={onLanguageChange} compact />
            </div>

            <div className="hidden lg:flex items-center">
              <AccountMenu authEnabled={authEnabled} onOpenProfile={onOpenProfile} />
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] p-2 text-slate-300 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-lg transition"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              data-testid="navbar-mobile-toggle-btn"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div
            id="mobile-navigation"
            role="navigation"
            aria-label="Mobile navigation"
            className="tm-mobile-menu lg:hidden bg-slate-800 border-t border-white/10 px-4 py-4 space-y-1 shadow-xl max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
          >
            <div className="space-y-0.5">
              {nav.map(({ to, label, icon: Icon }) => {
                const active = isItemActive(to)
                return (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : null}
                    className={[
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium min-h-[44px] transition',
                      active ? 'bg-sky-500/20 text-sky-300' : 'text-slate-200 hover:bg-white/10 hover:text-white'
                    ].join(' ')}
                  >
                    <Icon size={18} className="shrink-0" />
                    <span>{label}</span>
                  </NavLink>
                )
              })}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-1">Language</div>
              <LanguageSelector language={language} onChange={(lang) => { onLanguageChange(lang); setOpen(false) }} />
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-1">Quick Tools</div>
              <button
                type="button"
                onClick={() => { setOpen(false); onOpenVoiceGate?.() }}
                data-testid="mobile-navbar-voice-gate-btn"
                className="flex items-center justify-between w-full min-h-[44px] px-4 py-2.5 rounded-lg border border-white/15 bg-white/5 text-slate-200 text-sm font-medium hover:bg-white/10 transition"
              >
                <span className="flex items-center gap-2.5">
                  <Volume2 size={18} className="text-sky-400" />
                  <span>Voice Assistant</span>
                </span>
                <span className="text-xs text-slate-400">Alt+B</span>
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); onOpenDemoTour?.() }}
                data-testid="mobile-navbar-demo-tour-btn"
                className="flex items-center gap-2.5 w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-300 text-sm font-medium hover:bg-sky-500/25 transition"
              >
                <Sparkles size={18} className="text-sky-400" />
                <span>Explore Demo</span>
              </button>
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1 mb-1">Account</div>
              <AccountMenu
                authEnabled={authEnabled}
                onOpenProfile={() => { setOpen(false); onOpenProfile?.() }}
                mobile
              />
            </div>
          </div>
        )}
      </header>
    </>
  )
}

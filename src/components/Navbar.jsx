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
    if (mql.matches) {
      setOpen(false)
    }

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
    <header className="tm-nav bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="tm-nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        <NavLink to="/" className="tm-brand flex items-center gap-2.5 text-slate-950 font-black text-lg sm:text-xl tracking-tight min-w-0 shrink">
          <span className="tm-brand-icon w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30 shrink-0">
            <TrainFront size={20} />
          </span>
          <span className="font-extrabold text-slate-900 tracking-tight shrink-0" title="TravelMate">TravelMate</span>
        </NavLink>

        <nav className="tm-nav-links hidden lg:grid lg:grid-cols-4 items-center gap-1.5 lg:max-w-3xl" aria-label="Primary navigation">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = isItemActive(to)
            return (
              <NavLink
                key={to}
                to={to}
                aria-current={active ? 'page' : null}
                className={
                  `tm-nav-link px-3 py-2 rounded-md text-xs sm:text-sm font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                    active
                      ? 'bg-sky-50 text-sky-700 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="tm-nav-actions flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenDemoTour}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold transition shadow-sm"
            title="See a Demo scenario"
            aria-label="See a Demo"
            data-testid="navbar-demo-tour-btn"
          >
            <Sparkles size={14} className="text-sky-600" />
            <span>See a Demo</span>
          </button>

          <button
            type="button"
            onClick={onOpenVoiceGate}
            className="hidden sm:flex items-center justify-center w-9 h-9 rounded-md border border-slate-300 bg-white text-slate-700 hover:text-sky-600 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition"
            title="Voice Accessibility Mode (Alt+B)"
            aria-label="Voice Accessibility Mode (Alt+B)"
            data-testid="navbar-voice-gate-btn"
          >
            <Volume2 size={16} />
          </button>

          <LanguageSelector language={language} onChange={onLanguageChange} compact />

          <div className="hidden lg:flex items-center gap-2">
            <AccountMenu authEnabled={authEnabled} onOpenProfile={onOpenProfile} />
          </div>

          <button
            className="tm-menu lg:hidden flex items-center justify-center min-w-[44px] min-h-[44px] p-2 text-slate-700 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md"
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

      {open && (
        <div
          id="mobile-navigation"
          role="navigation"
          aria-label="Mobile navigation"
          className="tm-mobile-menu md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3 shadow-xl max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] animate-in fade-in slide-in-from-top-2"
        >
          <div className="space-y-1">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = isItemActive(to)
              return (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : null}
                  className={
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold min-h-[44px] transition ${
                      active ? 'bg-sky-50 text-sky-700 font-extrabold' : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon size={18} className="text-slate-500 shrink-0" />
                  <span>{label}</span>
                </NavLink>
              )
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Language</div>
            <LanguageSelector language={language} onChange={(lang) => { onLanguageChange(lang); setOpen(false) }} />
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Quick Tools</div>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onOpenVoiceGate?.()
              }}
              data-testid="mobile-navbar-voice-gate-btn"
              className="flex items-center justify-between w-full min-h-[44px] px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm font-bold hover:bg-slate-100 transition"
            >
              <span className="flex items-center gap-2.5">
                <Volume2 size={18} className="text-sky-600" />
                <span>Voice Assistant</span>
              </span>
              <span className="text-xs text-slate-500 font-semibold">Alt+B</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onOpenDemoTour?.()
              }}
              data-testid="mobile-navbar-demo-tour-btn"
              className="flex items-center gap-2.5 w-full min-h-[44px] px-4 py-2.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-sm font-bold hover:bg-sky-100 transition"
            >
              <Sparkles size={18} className="text-sky-600" />
              <span>Explore Demo Scenarios</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Account & Access</div>
            <AccountMenu
              authEnabled={authEnabled}
              onOpenProfile={() => {
                setOpen(false)
                onOpenProfile?.()
              }}
              mobile
            />
          </div>
        </div>
      )}
    </header>
  )
}

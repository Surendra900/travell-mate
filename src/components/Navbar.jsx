import { NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, TrainFront, ShieldAlert, Bookmark, X, Volume2, Sparkles, Clock, Check } from 'lucide-react'
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-1.5 focus:bg-white focus:text-[#15803D] focus:border focus:border-gray-300 focus:rounded focus:font-semibold focus:text-xs"
      >
        Skip to main content
      </a>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40" role="banner">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          
          {/* Brand + Navigation */}
          <div className="flex items-center gap-6 lg:gap-8 min-w-0">
            <NavLink
              to="/"
              className="flex items-center gap-2 text-gray-900 font-bold text-[17px] tracking-tight shrink-0 focus:outline-none"
            >
              <span className="w-7 h-7 rounded bg-[#15803D] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                TM
              </span>
              <span className="font-bold tracking-tight">TravelMate</span>
            </NavLink>

            {/* Desktop Tabs */}
            <nav className="hidden lg:grid lg:grid-cols-4 items-center h-14 text-[13px] font-medium lg:max-w-4xl" aria-label="Primary navigation">
              {nav.map(({ to, label, icon: Icon }) => {
                const active = isItemActive(to)
                return (
                  <NavLink
                    key={to}
                    to={to}
                    aria-current={active ? 'page' : null}
                    className={[
                      'h-full px-3.5 border-b-2 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap',
                      active
                        ? 'border-[#15803D] text-[#15803D] font-semibold'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    ].join(' ')}
                  >
                    <Icon size={14} className={active ? 'text-[#15803D]' : 'text-gray-400'} />
                    <span>{label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-3 text-[13px]">
            {/* Subtle Offline Ready Status */}
            <span className="hidden sm:inline-flex items-center gap-1 text-gray-500 font-medium text-xs">
              <Check size={14} className="text-[#15803D] stroke-[2.5]" />
              <span>Offline Ready</span>
            </span>

            {/* Demo Trigger */}
            <button
              type="button"
              onClick={onOpenDemoTour}
              className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1 rounded border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium transition"
              aria-label="See a Demo"
              data-testid="navbar-demo-tour-btn"
            >
              <Sparkles size={12} className="text-[#15803D]" />
              <span>Demo</span>
            </button>

            {/* Voice Accessibility Gate */}
            <button
              type="button"
              onClick={onOpenVoiceGate}
              className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition"
              title="Voice Accessibility Mode (Alt+B)"
              aria-label="Voice Accessibility Mode (Alt+B)"
              data-testid="navbar-voice-gate-btn"
            >
              <Volume2 size={15} />
            </button>

            {/* Compact Language Selector */}
            <LanguageSelector language={language} onChange={onLanguageChange} compact />

            {/* Account / Login Button */}
            <div className="hidden lg:flex items-center">
              <AccountMenu authEnabled={authEnabled} onOpenProfile={onOpenProfile} />
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 p-1.5 text-gray-600 hover:text-gray-900 rounded border border-gray-200 hover:bg-gray-50"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              data-testid="navbar-mobile-toggle-btn"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {open && (
          <div
            id="mobile-navigation"
            role="navigation"
            aria-label="Mobile navigation"
            className="tm-mobile-menu lg:hidden bg-white border-b border-gray-200 px-4 py-3 space-y-2 shadow-md max-h-[calc(100dvh-3.5rem)] overflow-y-auto safe-bottom"
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
                    className={[
                      'flex items-center gap-3 px-3 py-2.5 rounded text-[13px] font-medium transition',
                      active ? 'bg-[#EDF7F0] text-[#137333] font-semibold' : 'text-gray-700 hover:bg-gray-50'
                    ].join(' ')}
                  >
                    <Icon size={16} className={active ? 'text-[#15803D]' : 'text-gray-400'} />
                    <span>{label}</span>
                  </NavLink>
                )
              })}
            </div>

            <div className="pt-2 border-t border-gray-100 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-1">Language</span>
              <LanguageSelector language={language} onChange={(lang) => { onLanguageChange(lang); setOpen(false) }} />
            </div>

            <div className="pt-2 border-t border-gray-100 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-1">Quick Tools</span>
              <button
                type="button"
                onClick={() => { setOpen(false); onOpenVoiceGate?.() }}
                data-testid="mobile-navbar-voice-gate-btn"
                className="flex items-center justify-between w-full px-3 py-2 rounded border border-gray-200 bg-gray-50 text-gray-700 text-xs font-medium hover:bg-gray-100"
              >
                <span className="flex items-center gap-2">
                  <Volume2 size={15} className="text-[#15803D]" />
                  <span>Voice Assistant</span>
                </span>
                <span className="text-[11px] text-gray-400">Alt+B</span>
              </button>
              <button
                type="button"
                onClick={() => { setOpen(false); onOpenDemoTour?.() }}
                data-testid="mobile-navbar-demo-tour-btn"
                className="flex items-center gap-2 w-full px-3 py-2 rounded bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium hover:bg-gray-100"
              >
                <Sparkles size={14} className="text-[#15803D]" />
                <span>Explore Demo</span>
              </button>
            </div>

            <div className="pt-2 border-t border-gray-100 flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 px-1">Account</span>
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

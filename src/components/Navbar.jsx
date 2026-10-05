import { NavLink } from 'react-router-dom'
import { Menu, Search, TrainFront, ShieldAlert, Bookmark, CircleHelp, X, Volume2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import LanguageSelector from './LanguageSelector'
import AccountMenu from './AccountMenu'

const nav = [
  { to: '/planner', label: 'Plan Trip', icon: Search },
  { to: '/saved', label: 'My Trips', icon: Bookmark },
  { to: '/safety', label: 'Safety & SOS', icon: ShieldAlert },
  { to: '/analyze', label: 'Assistant', icon: CircleHelp }
]

export default function Navbar({ language, onLanguageChange, authEnabled, onOpenProfile, onOpenVoiceGate, onOpenDemoTour }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="tm-nav bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="tm-nav-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        <NavLink to="/" className="tm-brand flex items-center gap-2.5 text-slate-950 font-black text-xl tracking-tight">
          <span className="tm-brand-icon w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/30">
            <TrainFront size={20} />
          </span>
          <span className="font-extrabold text-slate-900">TravelMate</span>
        </NavLink>

        <nav className="tm-nav-links hidden md:flex items-center gap-1.5 grid-cols-4 lg:max-w-4xl" aria-label="Primary navigation">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `tm-nav-link px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 font-extrabold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="tm-nav-actions flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenDemoTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold transition shadow-sm"
            title="Judge & Investor Demo Tour"
            aria-label="Judge & Investor Demo Tour"
            data-testid="navbar-demo-tour-btn"
          >
            <Sparkles size={14} className="text-sky-600" />
            <span className="hidden sm:inline">Demo Tour</span>
          </button>

          <button
            type="button"
            onClick={onOpenVoiceGate}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:text-sky-600 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition"
            title="Voice Accessibility Gate (Alt+B)"
            aria-label="Voice Accessibility Mode (Alt+B)"
            data-testid="navbar-voice-gate-btn"
          >
            <Volume2 size={16} />
          </button>

          <LanguageSelector language={language} onChange={onLanguageChange} compact />
          <AccountMenu authEnabled={authEnabled} onOpenProfile={onOpenProfile} compact />

          <button
            className="tm-menu md:hidden p-2 text-slate-700 hover:text-slate-950"
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="tm-mobile-menu md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 grid-cols-4 shadow-xl">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                  isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={18} className="text-slate-500" />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="pt-3 mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onOpenDemoTour?.()
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sky-300 bg-sky-50 text-xs font-bold text-sky-800"
              aria-label="Judge & Investor Demo Tour"
              data-testid="mobile-navbar-demo-tour-btn"
            >
              <Sparkles size={14} className="text-sky-600" />
              <span>Judge Tour</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onOpenVoiceGate?.()
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700"
              aria-label="Voice Accessibility Mode (Alt+B)"
            >
              <Volume2 size={16} />
              <span>Voice A11y</span>
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

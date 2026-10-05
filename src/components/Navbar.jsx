import { NavLink } from 'react-router-dom'
import { Menu, Search, TrainFront, ShieldAlert, Bookmark, CircleHelp, X, Volume2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import LanguageSelector from './LanguageSelector'
import AccountMenu from './AccountMenu'

const nav = [
  { to: '/planner', label: 'Explore', icon: Search },
  { to: '/saved', label: 'My Trips', icon: Bookmark },
  { to: '/analyze', label: 'Assistant', icon: CircleHelp },
  { to: '/safety', label: 'Safety', icon: ShieldAlert }
]

export default function Navbar({ language, onLanguageChange, authEnabled, onOpenProfile, onOpenVoiceGate, onOpenDemoTour }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="tm-nav">
      <div className="tm-nav-inner">
        <NavLink to="/" className="tm-brand">
          <span className="tm-brand-icon"><TrainFront size={20} /></span>
          <span>TravelMate</span>
        </NavLink>

        <nav className="tm-nav-links grid-cols-4 lg:max-w-4xl" aria-label="Primary navigation">
          {nav.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `tm-nav-link ${isActive ? 'active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="tm-nav-actions">
          <button
            type="button"
            onClick={onOpenDemoTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-400/50 bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20 text-xs font-black uppercase tracking-wider transition-all"
            title="Judge & Investor Demo Tour"
            aria-label="Judge & Investor Demo Tour"
            data-testid="navbar-demo-tour-btn"
          >
            <Sparkles size={14} className="text-indigo-600" />
            <span>Judge Tour</span>
          </button>
          <button
            type="button"
            onClick={onOpenVoiceGate}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-300 bg-white text-slate-700 hover:text-indigo-600 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-sm transition-all"
            title="Voice Accessibility Gate (Alt+B)"
            aria-label="Voice Accessibility Mode (Alt+B)"
            data-testid="navbar-voice-gate-btn"
          >
            <Volume2 size={18} />
          </button>
          <LanguageSelector language={language} onChange={onLanguageChange} compact />
          <AccountMenu authEnabled={authEnabled} onOpenProfile={onOpenProfile} compact />
        </div>

        <button className="tm-menu" onClick={() => setOpen((v) => !v)} aria-label="Open menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="tm-mobile-menu grid-cols-4">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}>
              <Icon size={17} /> {label}
            </NavLink>
          ))}
          <div className="col-span-full pt-3 mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => { setOpen(false); onOpenDemoTour?.(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-400/50 bg-indigo-500/10 text-xs font-black uppercase text-indigo-700"
              aria-label="Judge & Investor Demo Tour"
              data-testid="mobile-navbar-demo-tour-btn"
            >
              <Sparkles size={14} className="text-indigo-600" />
              <span>Judge Tour</span>
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); onOpenVoiceGate?.(); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700"
              aria-label="Voice Accessibility Mode (Alt+B)"
            >
              <Volume2 size={16} /> Voice A11y (Alt+B)
            </button>
            <LanguageSelector language={language} onChange={onLanguageChange} compact />
            <AccountMenu authEnabled={authEnabled} onOpenProfile={onOpenProfile} compact />
          </div>
        </div>
      )}
    </header>
  )
}

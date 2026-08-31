import { NavLink } from 'react-router-dom'
import { Menu, Search, TrainFront, ShieldAlert, Bookmark, CircleHelp, X } from 'lucide-react'
import { useState } from 'react'
import LanguageSelector from './LanguageSelector'
import AccountMenu from './AccountMenu'

const nav = [
  { to: '/planner', label: 'Explore', icon: Search },
  { to: '/saved', label: 'My Trips', icon: Bookmark },
  { to: '/analyze', label: 'Assistant', icon: CircleHelp },
  { to: '/safety', label: 'Safety', icon: ShieldAlert }
]

export default function Navbar({ language, onLanguageChange, authEnabled, onOpenProfile }) {
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
        </div>
      )}
    </header>
  )
}

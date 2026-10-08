import { NavLink } from 'react-router-dom'
import { TrainFront } from 'lucide-react'

export default function Footer({ onOpenPrivacy }) {
  return (
    <footer className="tm-footer">
      <div className="tm-footer-rule" />
      <div className="tm-footer-inner">
        <div className="tm-footer-brand">
          <NavLink to="/" className="tm-footer-logo"><TrainFront size={18} /> <span>TravelMate</span></NavLink>
          <p>Your intelligent serenity companion. Navigating the world with precision and care.</p>
          <small>© 2026 TravelMate AI. Your intelligent serenity companion.</small>
        </div>
        <div className="tm-footer-col">
          <strong>Company</strong>
          <span>About Us</span><span>Careers</span>
          <button type="button" data-testid="footer-privacy-link" className="text-left cursor-pointer hover:underline" onClick={onOpenPrivacy}>
            Privacy & DPDP Act
          </button>
        </div>
        <div className="tm-footer-col">
          <strong>Resources</strong>
          <NavLink to="/safety">Safety Hub</NavLink><span>App Store</span><span>Google Play</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2 border-t border-slate-800/60 text-center text-xs text-slate-400">
        <p>Timetable data as of October 2026 · Map data © OpenStreetMap contributors · Weather data by Open-Meteo</p>
        <p className="text-[11px] text-slate-500 mt-1">
          TravelMate is a multimodal route discovery and recovery engine. Tickets are finalized directly on official operator portals. In an emergency, dial 112 or 139.
        </p>
      </div>
    </footer>
  )
}

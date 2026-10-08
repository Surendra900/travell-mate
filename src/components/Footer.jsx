import { NavLink } from 'react-router-dom'
import { TrainFront } from 'lucide-react'

export default function Footer({ onOpenPrivacy, onOpenFeedback }) {
  return (
    <footer className="tm-footer" data-testid="app-footer">
      <div className="tm-footer-rule" />
      <div className="tm-footer-inner">
        <div className="tm-footer-brand">
          <NavLink to="/" className="tm-footer-logo"><TrainFront size={18} /> <span>TravelMate</span></NavLink>
          <p>The Multimodal Disruption & Route Recovery Engine. Navigating complex journeys with algorithmic precision.</p>
          <small>© 2026 TravelMate AI. Built for India transit recovery.</small>
        </div>
        <div className="tm-footer-col">
          <strong>Compliance & Legal</strong>
          <NavLink to="/privacy" data-testid="footer-privacy-link">Privacy Policy (DPDP)</NavLink>
          <NavLink to="/terms" data-testid="footer-terms-link">Terms of Service</NavLink>
          <NavLink to="/disclaimer" data-testid="footer-disclaimer-link">Statutory Disclaimers</NavLink>
          <button type="button" data-testid="footer-dpdp-modal-btn" className="text-left cursor-pointer hover:underline text-xs text-slate-400" onClick={onOpenPrivacy}>
            Manage DPDP Consent
          </button>
        </div>
        <div className="tm-footer-col">
          <strong>Resources & Support</strong>
          <NavLink to="/safety">Passes & Safety Hub</NavLink>
          <NavLink to="/planner?mode=tatkal">Tatkal Desk</NavLink>
          <button type="button" data-testid="footer-feedback-btn" className="text-left cursor-pointer hover:underline text-cyan-400 font-bold" onClick={onOpenFeedback}>
            Give Feedback
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-2 border-t border-slate-800/60 text-center text-xs text-slate-400">
        <p>Timetable data as of October 2026 · Map data © OpenStreetMap contributors · Weather data by Open-Meteo</p>
        <p className="text-[11px] text-slate-500 mt-1">
          TravelMate is an independent multimodal route discovery and recovery engine. Tickets are finalized directly on official operator portals. In an emergency, dial 112 or 139.
        </p>
      </div>
    </footer>
  )
}

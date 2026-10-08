import { NavLink } from 'react-router-dom'
import { TrainFront } from 'lucide-react'

export default function Footer({ onOpenPrivacy, onOpenFeedback }) {
  return (
    <footer className="tm-footer bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto" data-testid="app-footer">
      <div className="tm-footer-rule bg-slate-800 h-px" />
      <div className="tm-footer-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="tm-footer-brand md:col-span-2">
          <NavLink to="/" className="tm-footer-logo inline-flex items-center gap-2 text-white font-bold text-lg">
            <TrainFront size={20} className="text-sky-400" />
            <span>TravelMate</span>
          </NavLink>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed max-w-md">
            The Multimodal Disruption & Route Recovery Engine. Navigating complex journeys with algorithmic precision.
          </p>
          <small className="block mt-3 text-xs text-slate-400">
            © 2026 TravelMate AI. Built for India transit recovery.
          </small>
        </div>
        <div className="tm-footer-col flex flex-col gap-2.5 text-sm">
          <strong className="text-white font-bold mb-1">Compliance & Legal</strong>
          <NavLink to="/privacy" data-testid="footer-privacy-link" className="text-slate-300 hover:text-white transition-colors">
            Privacy Policy (DPDP)
          </NavLink>
          <NavLink to="/terms" data-testid="footer-terms-link" className="text-slate-300 hover:text-white transition-colors">
            Terms of Service
          </NavLink>
          <NavLink to="/disclaimer" data-testid="footer-disclaimer-link" className="text-slate-300 hover:text-white transition-colors">
            Statutory Disclaimers
          </NavLink>
          <button
            type="button"
            data-testid="footer-dpdp-modal-btn"
            className="text-left cursor-pointer hover:underline text-xs text-slate-300 hover:text-white transition-colors"
            onClick={onOpenPrivacy}
          >
            Manage DPDP Consent
          </button>
        </div>
        <div className="tm-footer-col flex flex-col gap-2.5 text-sm">
          <strong className="text-white font-bold mb-1">Resources & Support</strong>
          <NavLink to="/safety" className="text-slate-300 hover:text-white transition-colors">
            Passes & Safety Hub
          </NavLink>
          <NavLink to="/planner?mode=tatkal" className="text-slate-300 hover:text-white transition-colors">
            Tatkal Desk
          </NavLink>
          <button
            type="button"
            data-testid="footer-feedback-btn"
            className="text-left cursor-pointer hover:underline text-sky-400 hover:text-sky-300 font-bold text-sm transition-colors"
            onClick={onOpenFeedback}
          >
            Give Feedback
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 pt-4 pb-6 border-t border-slate-800 text-center text-xs text-slate-300">
        <p>Timetable data as of October 2026 · Map data © OpenStreetMap contributors · Weather data by Open-Meteo</p>
        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed max-w-3xl mx-auto">
          TravelMate is an independent multimodal route discovery and recovery engine. Tickets are finalized directly on official operator portals. In an emergency, dial 112 or 139.
        </p>
      </div>
    </footer>
  )
}


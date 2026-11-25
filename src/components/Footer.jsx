import { NavLink } from 'react-router-dom'

export default function Footer({ onOpenPrivacy, onOpenFeedback }) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto text-gray-600 text-xs" data-testid="app-footer">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-[#15803D] text-white flex items-center justify-center font-bold text-xs">TM</span>
            <span className="font-bold text-[15px] text-gray-900 tracking-tight">TravelMate</span>
          </div>
          <p className="text-[12px] text-gray-500 leading-relaxed max-w-sm">
            Multimodal transit recovery engine for Indian Railways disruptions, Tatkal countdown assistance, and offline digital travel passes.
          </p>
          <p className="text-[11px] text-gray-500 pt-1">
            © {new Date().getFullYear()} TravelMate. Built for Indian transit route recovery.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="font-semibold text-gray-900 uppercase tracking-wide text-[11px]">Compliance & Legal</p>
          <NavLink to="/privacy" data-testid="footer-privacy-link" className="hover:text-gray-900 py-1">
            Privacy Policy (DPDP)
          </NavLink>
          <NavLink to="/terms" data-testid="footer-terms-link" className="hover:text-gray-900 py-1">
            Terms of Service
          </NavLink>
          <NavLink to="/disclaimer" data-testid="footer-disclaimer-link" className="hover:text-gray-900 py-1">
            Statutory Disclaimers
          </NavLink>
          <NavLink to="/cookies" data-testid="footer-cookies-link" className="hover:text-gray-900 py-1">
            Cookie & Storage Policy
          </NavLink>
          <button
            type="button"
            data-testid="footer-dpdp-modal-btn"
            className="text-left cursor-pointer hover:underline text-[11px] text-gray-500 hover:text-gray-900 py-1"
            onClick={onOpenPrivacy}
          >
            Manage DPDP Consent
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="font-semibold text-gray-900 uppercase tracking-wide text-[11px]">Resources & Support</p>
          <NavLink to="/safety" className="hover:text-gray-900 py-1">
            Passes & Safety Hub
          </NavLink>
          <NavLink to="/planner?mode=tatkal" className="hover:text-gray-900 py-1">
            Tatkal Desk
          </NavLink>
          <button
            type="button"
            data-testid="footer-feedback-btn"
            className="text-left cursor-pointer hover:underline text-[#15803D] font-semibold py-1"
            onClick={onOpenFeedback}
          >
            Give Feedback
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100 py-4 bg-gray-50 text-center text-[11px] text-gray-600 px-4">
        <p>Timetable data: Indian Railways community snapshot & live provider feeds. Tickets are finalized directly on official operator portals.</p>
      </div>
    </footer>
  )
}

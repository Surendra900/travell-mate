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
    </footer>
  )
}

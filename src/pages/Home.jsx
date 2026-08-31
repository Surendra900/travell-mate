import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, BusFront, CalendarDays, ChevronRight, Info, MapPin, MessageCircle, Plane, ShieldCheck, Sparkles, TrainFront, Users } from 'lucide-react'
import { useState } from 'react'
import { localDateIso } from '../utils/date'

const recommendations = [
  ['Goa', 'Beach escape', 'From ₹1,250'],
  ['Manali', 'Mountain getaway', 'From ₹2,490'],
  ['Kochi', 'Weekend trip', 'From ₹980']
]

const modes = [
  { name: 'Train', label: 'Train', icon: TrainFront },
  { name: 'Bus', label: 'Bus', icon: BusFront },
  { name: 'Flight', label: 'Flight', icon: Plane }
]

export default function Home() {
  const navigate = useNavigate()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(localDateIso())
  const [transportMode, setTransportMode] = useState('Train')
  const [travellers, setTravellers] = useState('1')

  const search = () => navigate(`/planner?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}&transportMode=${encodeURIComponent(transportMode)}`)

  return (
    <main className="tm-page sketch-home">
      <section className="sketch-shell">
        <div className="sketch-intro">
          <span><Sparkles size={16} /> Intelligent Serenity</span>
          <h1>Your Journey,<br /><span style={{ background: 'linear-gradient(90deg,#630ed4,#00687a)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Redefined by AI</span></h1>
          <p>Intelligent route planning, real-time safety, and seamless travel at your fingertips. Discover the world with a companion that understands your every move.</p>
          <div className="sketch-actions">
            <button className="sketch-primary" onClick={() => navigate('/planner')}>Plan a Trip <ArrowRight size={17} /></button>
            <button className="sketch-secondary" onClick={() => document.getElementById('safety-hub')?.scrollIntoView({ behavior: 'smooth' })}>How it works</button>
          </div>
        </div>

        <section className="sketch-search-card" aria-label="Travel search">
          <div className="sketch-tabs" role="tablist">
            {modes.map(({ name, label, icon: Icon }) => (
              <button key={name} className={transportMode === name ? 'active' : ''} onClick={() => setTransportMode(name)} role="tab" aria-selected={transportMode === name}>
                <Icon size={17} /> {label}
              </button>
            ))}
          </div>

          <div className="sketch-form-row route">
            <label>
              From
              <div style={{ position: 'relative' }}>
                <MapPin size={17} style={{ position: 'absolute', left: 14, top: 16, color: '#7b7487' }} />
                <input style={{ paddingLeft: 42 }} value={from} onChange={(e) => setFrom(e.target.value)} placeholder={transportMode === 'Train' ? 'Departure station' : 'Departure city'} />
              </div>
            </label>
            <button className="sketch-swap" onClick={() => { const x = from; setFrom(to); setTo(x) }} aria-label="Swap origin and destination">⇄</button>
            <label>
              To
              <div style={{ position: 'relative' }}>
                <MapPin size={17} style={{ position: 'absolute', left: 14, top: 16, color: '#7b7487' }} />
                <input style={{ paddingLeft: 42 }} value={to} onChange={(e) => setTo(e.target.value)} placeholder={transportMode === 'Train' ? 'Arrival station' : 'Arrival city'} />
              </div>
            </label>
          </div>

          <div className="sketch-form-row details">
            <label><span><CalendarDays size={15} /> Departure</span><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
            <label><span><Users size={15} /> Travellers</span><select value={travellers} onChange={(e) => setTravellers(e.target.value)}><option value="1">1 Passenger</option><option value="2">2 Passengers</option><option value="3">3 Passengers</option><option value="4">4 Passengers</option></select></label>
          </div>

          <button className="sketch-search" onClick={search}>Search Routes <ArrowRight size={18} /></button>
        </section>
      </section>

      <section id="safety-hub" className="home-safety-section">
        <div className="home-section-heading">
          <h2>Peace of Mind, Integrated.</h2>
          <p>Experience travel with an invisible layer of protection. Our safety features are designed to be proactive, not intrusive.</p>
        </div>
        <div className="home-safety-grid">
          <div className="home-location-card">
            <div className="home-feature-icon"><MapPin size={28} /></div>
            <div>
              <span className="home-chip"><ShieldCheck size={15} /> Emergency Location Setup</span>
              <h3>Allow location before using TravelMate</h3>
              <p>When you later tap WhatsApp or SMS in Safety Mode, TravelMate will refresh your GPS location and place it in the emergency message automatically.</p>
              <div className="home-info-box"><Info size={18} /><div><strong>What is stored</strong><p>Only the latest coordinates, accuracy and capture time are stored locally in this browser. They are not sent to TravelMate servers.</p></div></div>
              <div className="home-actions"><button className="sketch-primary" onClick={() => navigate('/safety')}>Allow and continue <MapPin size={17} /></button><button className="sketch-secondary" onClick={() => navigate('/safety')}>Continue without location</button></div>
            </div>
          </div>
          <button className="home-ai-card" onClick={() => navigate('/analyze')}>
            <div><div className="home-ai-icon"><MessageCircle size={24} /></div><h3>Meet Your AI Assistant</h3><p>Real-time translations, local etiquette tips, and dynamic itinerary adjustments on the fly.</p></div>
            <div className="home-ai-preview"><span><Sparkles size={16} /></span><i /></div>
          </button>
        </div>
      </section>

      <section className="sketch-recommended">
        <div className="sketch-section-title">
          <div><span>DISCOVER</span><h2>Recommended for you</h2></div>
          <Link to="/planner">View all <ChevronRight size={16} /></Link>
        </div>
        <div className="sketch-trip-grid">
          {recommendations.map(([city, type, price], i) => (
            <button className={`sketch-trip trip-${i}`} key={city} onClick={() => navigate(`/planner?to=${encodeURIComponent(city)}&transportMode=${encodeURIComponent(transportMode)}`)}>
              <div className="trip-overlay"><span>{type}</span><strong>{city}</strong><small>{price} <ArrowRight size={15} /></small></div>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

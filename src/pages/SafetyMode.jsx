import { useRef } from 'react'
import { Siren } from 'lucide-react'
import EmergencyCard from '../components/EmergencyCard'
import DocumentVault from '../components/DocumentVault'
import EmergencyToolkit from '../components/EmergencyToolkit'
import { emergencyCards } from '../data/emergencyData'

export default function SafetyMode({ toast }) {
  const crisisPanelRef = useRef(null)

  function openEmergencyActions() {
    crisisPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      crisisPanelRef.current?.querySelector('select, button, input')?.focus({ preventScroll: true })
    }, 450)
  }

  return (
    <main className="safety-page">
      <section className="safety-hero">
        <span className="badge border-red-400/30 bg-red-400/10 text-red-100"><Siren size={14} /> Current Location: India · Emergency Number: 112</span>
        <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-6xl">Safety Mode</h1>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">Fast crisis actions. Refresh your location, prepare WhatsApp or SMS alerts, call emergency services, save trusted contacts, and keep key guidance ready on this device.</p>
        <button className="btn-danger safety-danger mobile-full shadow-danger" onClick={openEmergencyActions}><Siren size={20} /> SOS - Send Emergency Alert</button>
      </section>

      <div ref={crisisPanelRef} tabIndex={-1} className="scroll-mt-24 outline-none safety-tool-shell">
        <EmergencyToolkit toast={toast} />
      </div>

      <section className="card-grid mt-10 safety-cards">
        {emergencyCards.map((item) => <EmergencyCard key={item.id} item={item} />)}
      </section>

      <div className="safety-vault"><DocumentVault toast={toast} /></div>
    </main>
  )
}

import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Siren,
  PhoneCall,
  ShieldCheck,
  FileLock2,
  Languages,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import EmergencyCard from '../components/EmergencyCard'
import DocumentVault from '../components/DocumentVault'
import EmergencyToolkit from '../components/EmergencyToolkit'
import EmergencyPhraseCards from '../components/EmergencyPhraseCards'
import { emergencyCards } from '../data/emergencyData'

export default function SafetyMode({ toast }) {
  const [activeTab, setActiveTab] = useState('sos')
  const crisisPanelRef = useRef(null)

  function openEmergencyActions() {
    setActiveTab('sos')
    crisisPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.setTimeout(() => {
      crisisPanelRef.current?.querySelector('select, button, input')?.focus({ preventScroll: true })
    }, 450)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-red-50/70 via-white to-slate-50 border-b border-slate-200/80 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100 border border-red-200 text-red-800 text-xs sm:text-sm font-bold tracking-wide mb-5 shadow-sm">
            <Siren size={15} className="text-red-600" />
            <span>24/7 National Emergency Hotline: 112 & RailMadad: 139</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 tracking-tight">
            Transit Safety & Emergency Center
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Immediate crisis dialers, live GPS telemetry sharing with trusted contacts, zero-network incident protocols, and your encrypted document vault.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={openEmergencyActions}
              className="btn-danger h-12 px-6 rounded-2xl text-sm font-extrabold flex items-center gap-2 shadow-lg shadow-red-600/25"
            >
              <Siren size={18} />
              <span>SOS — Trigger Emergency Alert</span>
            </button>

            <Link
              to="/planner?urgency=Emergency"
              className="btn-soft h-12 px-6 rounded-2xl text-sm font-bold flex items-center gap-2"
            >
              <span>Emergency Route Planner</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Area with Clean Tabs */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-6 border-b border-slate-200" role="tablist" aria-label="Safety Hub Sections">
          {[
            { id: 'sos', label: '1-Tap SOS & Helplines', icon: PhoneCall },
            { id: 'phrases', label: 'Regional Transit Phrases', icon: Languages },
            { id: 'guides', label: 'Incident Protocols', icon: BookOpen },
            { id: 'vault', label: 'Encrypted Document Vault', icon: FileLock2 }
          ].map(({ id, label, icon: Icon }) => {
            const active = activeTab === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon size={16} className={active ? 'text-sky-400' : 'text-slate-400'} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab 1: SOS & Helplines */}
        <div className={activeTab === 'sos' ? 'block mt-6' : 'hidden'}>
          <div ref={crisisPanelRef} tabIndex={-1} className="outline-none safety-tool-shell">
            <EmergencyToolkit toast={toast} />
          </div>
        </div>

        {/* Tab 2: Regional Phrases */}
        <div className={activeTab === 'phrases' ? 'block mt-6' : 'hidden'}>
          <EmergencyPhraseCards toast={toast} />
        </div>

        {/* Tab 3: Incident Guides */}
        <div className={activeTab === 'guides' ? 'block mt-6' : 'hidden'}>
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-black text-slate-950">Safety Information & Protocols</h2>
              <p className="text-xs text-slate-500 mt-1">Detailed crisis advice verified for Indian railway and road transit.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emergencyCards.map((item) => (
                <EmergencyCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>

        {/* Tab 4: Encrypted Document Vault */}
        <div className={activeTab === 'vault' ? 'block mt-6' : 'hidden'}>
          <div className="safety-vault">
            <DocumentVault toast={toast} />
          </div>
        </div>
      </main>
    </div>
  )
}

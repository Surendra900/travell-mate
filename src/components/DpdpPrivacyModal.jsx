import { useState, useEffect } from 'react'
import { CheckCircle2, Database, Globe, Mic, ShieldAlert, ShieldCheck, Trash2, X } from 'lucide-react'
import { getDpdpConsent, purgeAllUserData, updateDpdpConsent } from '../utils/dpdpConsent'

export default function DpdpPrivacyModal({ open, onClose, toast }) {
  const [consent, setConsent] = useState(getDpdpConsent())
  const [purging, setPurging] = useState(false)

  useEffect(() => {
    if (open) {
      setConsent(getDpdpConsent())
    }
  }, [open])

  if (!open) return null

  function handleToggle(key) {
    if (key === 'essential_storage') return
    const updated = updateDpdpConsent({ [key]: !consent[key] })
    setConsent(updated)
    toast?.('Privacy preferences updated.')
  }

  async function handleEraseAllData() {
    const confirmed = window.confirm(
      'Are you sure you want to permanently erase ALL data? This will purge all saved trips, delete your encrypted document vault, and reset all app preferences. This action cannot be undone.'
    )
    if (!confirmed) return

    setPurging(true)
    try {
      await purgeAllUserData()
      toast?.('All local data permanently deleted.')
      window.setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    } catch (err) {
      console.error('Data erasure error:', err)
      setPurging(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dpdp-modal-title"
      data-testid="dpdp-privacy-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    >
      <div className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-indigo-500/30 bg-slate-950 p-6 text-white shadow-2xl">
        <button
          type="button"
          aria-label="Close privacy modal"
          data-testid="dpdp-close-button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/30 text-indigo-400">
            <ShieldCheck size={24} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-950 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
              India DPDP Act 2023 Compliant
            </span>
            <h2 id="dpdp-modal-title" className="text-xl font-black text-white">
              Privacy & Consent Manager
            </h2>
          </div>
        </div>

        {/* Fiduciary Notice */}
        <div className="mt-5 rounded-2xl border border-indigo-900/50 bg-indigo-950/30 p-4 text-xs text-slate-300 leading-relaxed">
          <p className="font-bold text-indigo-200">Data Fiduciary Transparency:</p>
          <p className="mt-1">
            TravelMate AI operates on a <strong className="text-white">Zero-Knowledge Architecture</strong>. Your itineraries, Aadhaar/ID passes, and encryption keys are stored exclusively on your device in IndexedDB. No personal documents or location histories are uploaded or sold.
          </p>
        </div>

        {/* Consent Controls */}
        <div className="mt-5 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Granular Processing Consents
          </h3>

          {/* Essential Storage */}
          <div className="flex items-start justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <div className="flex items-start gap-3">
              <Database size={18} className="mt-0.5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Essential Local Storage (Mandatory)</p>
                <p className="text-xs text-slate-400">
                  AES-GCM encrypted document vault and cached offline app shell. Never leaves device.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300">
              Required
            </span>
          </div>

          {/* Emergency GPS Telemetry */}
          <div className="flex items-start justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <div className="flex items-start gap-3">
              <ShieldAlert size={18} className="mt-0.5 text-amber-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Emergency Location Telemetry</p>
                <p className="text-xs text-slate-400">
                  Generates GPS coordinates for 112/139 SMS and WhatsApp SOS alerts when triggered by user.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={consent.emergency_telemetry}
              onClick={() => handleToggle('emergency_telemetry')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${consent.emergency_telemetry ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${consent.emergency_telemetry ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Multilingual AI */}
          <div className="flex items-start justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <div className="flex items-start gap-3">
              <Globe size={18} className="mt-0.5 text-cyan-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">SambaNova AI Translation</p>
                <p className="text-xs text-slate-400">
                  Processes user transit prompts for 10 regional Indian languages via SambaNova Cloud.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={consent.ai_translation}
              onClick={() => handleToggle('ai_translation')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${consent.ai_translation ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${consent.ai_translation ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Voice Processing */}
          <div className="flex items-start justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
            <div className="flex items-start gap-3">
              <Mic size={18} className="mt-0.5 text-purple-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">In-Browser Speech Processing</p>
                <p className="text-xs text-slate-400">
                  Web Speech API voice accessibility queries processed locally on browser runtime.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={consent.voice_processing}
              onClick={() => handleToggle('voice_processing')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${consent.voice_processing ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${consent.voice_processing ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Right to Erasure / Right to be Forgotten */}
        <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-950/20 p-4">
          <div className="flex items-center gap-2 text-sm font-black text-red-300">
            <Trash2 size={16} /> Right to Erasure (DPDP Act Sec. 12)
          </div>
          <p className="mt-1 text-xs text-slate-300">
            You hold the statutory right to delete all personal data at any moment. This permanently wipes your encrypted vault, offline boarding passes, and custom settings.
          </p>
          <button
            type="button"
            data-testid="dpdp-erase-all-button"
            disabled={purging}
            onClick={handleEraseAllData}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-red-500/50 bg-red-900/60 px-4 py-2 text-xs font-bold text-red-200 hover:bg-red-800 hover:text-white transition"
          >
            <Trash2 size={14} /> {purging ? 'Erasing…' : 'Erase All My Data & Reset App'}
          </button>
        </div>

        {/* Footer actions */}
        <div className="mt-5 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            data-testid="dpdp-done-button"
            onClick={onClose}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

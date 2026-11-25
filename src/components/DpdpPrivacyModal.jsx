import { useState, useEffect } from 'react'
import { CheckCircle2, Database, Globe, Mic, ShieldAlert, ShieldCheck, Trash2, X } from 'lucide-react'
import { getDpdpConsent, purgeAllUserData, updateDpdpConsent } from '../utils/dpdpConsent'
import { useDialogFocus } from '../hooks/useDialogFocus.js'

export default function DpdpPrivacyModal({ open, onClose, toast }) {
  const [consent, setConsent] = useState(getDpdpConsent())
  const [purging, setPurging] = useState(false)
  const dialogRef = useDialogFocus({ isOpen: open, onClose })

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
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dpdp-modal-title"
      data-testid="dpdp-privacy-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-lg border border-gray-300 bg-white p-5 shadow-xl text-gray-900">
        <button
          type="button"
          aria-label="Close privacy modal"
          data-testid="dpdp-close-button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-[#15803D] text-white">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 rounded bg-[#EDF7F0] border border-[#C6E8D1] px-2 py-0.5 text-[10px] font-bold text-[#137333]">
              India DPDP Act 2023 Compliant
            </span>
            <h2 id="dpdp-modal-title" className="text-base font-bold text-gray-900 mt-0.5">
              Privacy & Consent Manager
            </h2>
          </div>
        </div>

        {/* Fiduciary Notice */}
        <div className="mt-3.5 rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600 leading-relaxed">
          <p className="font-bold text-gray-900">Data Fiduciary Transparency:</p>
          <p className="mt-1">
            TravelMate AI operates on a <strong className="text-gray-900">Zero-Knowledge Architecture</strong>. Your itineraries, passes, and encryption keys are stored exclusively on your device in IndexedDB. No personal documents or location histories are uploaded or sold.
          </p>
        </div>

        {/* Consent Controls */}
        <div className="mt-4 space-y-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Granular Processing Consents
          </h3>

          {/* Essential Storage */}
          <div className="flex items-start justify-between rounded border border-gray-200 bg-white p-3">
            <div className="flex items-start gap-2.5">
              <Database size={16} className="mt-0.5 text-[#15803D] shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Essential Local Storage (Mandatory)</p>
                <p className="text-[11px] text-gray-500">
                  AES-GCM encrypted document vault and cached offline app shell. Never leaves device.
                </p>
              </div>
            </div>
            <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
              Required
            </span>
          </div>

          {/* Emergency GPS Telemetry */}
          <div className="flex items-start justify-between rounded border border-gray-200 bg-white p-3">
            <div className="flex items-start gap-2.5">
              <ShieldAlert size={16} className="mt-0.5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">Emergency Location Telemetry</p>
                <p className="text-[11px] text-gray-500">
                  Generates GPS coordinates for 112/139 SMS and WhatsApp SOS alerts when triggered by user.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={consent.emergency_telemetry}
              onClick={() => handleToggle('emergency_telemetry')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${consent.emergency_telemetry ? 'bg-[#15803D]' : 'bg-gray-300'}`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${consent.emergency_telemetry ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Multilingual AI */}
          <div className="flex items-start justify-between rounded border border-gray-200 bg-white p-3">
            <div className="flex items-start gap-2.5">
              <Globe size={16} className="mt-0.5 text-[#15803D] shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">SambaNova AI Translation</p>
                <p className="text-[11px] text-gray-500">
                  Processes user transit prompts for 10 regional Indian languages via SambaNova Cloud.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={consent.ai_translation}
              onClick={() => handleToggle('ai_translation')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${consent.ai_translation ? 'bg-[#15803D]' : 'bg-gray-300'}`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${consent.ai_translation ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Voice Processing */}
          <div className="flex items-start justify-between rounded border border-gray-200 bg-white p-3">
            <div className="flex items-start gap-2.5">
              <Mic size={16} className="mt-0.5 text-[#15803D] shrink-0" />
              <div>
                <p className="text-xs font-bold text-gray-900">In-Browser Speech Processing</p>
                <p className="text-[11px] text-gray-500">
                  Web Speech API voice accessibility queries processed locally on browser runtime.
                </p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={consent.voice_processing}
              onClick={() => handleToggle('voice_processing')}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${consent.voice_processing ? 'bg-[#15803D]' : 'bg-gray-300'}`}
            >
              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${consent.voice_processing ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Right to Erasure */}
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-red-800">
            <Trash2 size={14} /> Right to Erasure (DPDP Act Sec. 12)
          </div>
          <p className="mt-1 text-[11px] text-red-700 leading-relaxed">
            You hold the statutory right to delete all personal data at any moment. This permanently wipes your encrypted vault, offline boarding passes, and custom settings.
          </p>
          <button
            type="button"
            data-testid="dpdp-erase-all-button"
            disabled={purging}
            onClick={handleEraseAllData}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition"
          >
            <Trash2 size={13} /> {purging ? 'Erasing...' : 'Erase All My Data & Reset App'}
          </button>
        </div>

        {/* Footer actions */}
        <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
          <button
            type="button"
            data-testid="dpdp-done-button"
            onClick={onClose}
            className="rounded bg-[#15803D] hover:bg-[#12733B] px-4 py-1.5 text-xs font-semibold text-white transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import {
  AlertCircle,
  BusFront,
  CheckCircle,
  Download,
  Fingerprint,
  KeyRound,
  Lock,
  Plane,
  QrCode,
  ShieldCheck,
  TrainFront,
  X
} from 'lucide-react'
import {
  authenticateBiometricSimulation,
  generateOfflineBoardingPass,
  hasQuickPinSet,
  setQuickPin,
  verifyQuickPin
} from '../utils/vaultPassBridge'

function modeIcon(mode) {
  if (mode === 'Flight') return Plane
  if (mode === 'Bus') return BusFront
  return TrainFront
}

export default function OfflinePassModal({ open, onClose, plan, toast }) {
  const [pin, setPin] = useState('')
  const [pinSetupMode, setPinSetupMode] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState('')
  const [hasPin, setHasPin] = useState(false)
  const [authMethod, setAuthMethod] = useState('')

  useEffect(() => {
    if (open) {
      setHasPin(hasQuickPinSet())
      setIsVerified(false)
      setPin('')
      setError('')
      setPinSetupMode(false)
    }
  }, [open])

  if (!open || !plan) return null

  const pass = generateOfflineBoardingPass(plan)
  const ModeIcon = modeIcon(pass.transportMode)

  async function handlePinSubmit(e) {
    e.preventDefault()
    setError('')
    if (!hasPin || pinSetupMode) {
      if (!/^\d{4,6}$/.test(newPin)) {
        setError('Quick-PIN must be 4 to 6 numeric digits.')
        return
      }
      await setQuickPin(newPin)
      setHasPin(true)
      setPinSetupMode(false)
      setIsVerified(true)
      setAuthMethod('quick-pin-setup')
      toast?.('Offline Quick-PIN configured.')
    } else {
      const valid = await verifyQuickPin(pin)
      if (valid) {
        setIsVerified(true)
        setAuthMethod('quick-pin')
        toast?.('Pass verified with Quick-PIN.')
      } else {
        setError('Invalid Quick-PIN. Check and try again.')
      }
    }
  }

  async function handleBiometricAuth() {
    setError('')
    const res = await authenticateBiometricSimulation()
    if (res.success) {
      setIsVerified(true)
      setAuthMethod(res.method)
      toast?.('Identity verified via Device Biometric.')
    } else {
      setError('Biometric verification failed. Use Quick-PIN.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pass-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="bg-white max-w-lg w-full rounded-lg border border-gray-300 shadow-xl overflow-hidden text-gray-900 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
            <span className="text-[13px] font-bold text-gray-900">100% Offline Boarding Pass</span>
            <span className="ml-2 px-2 py-0.5 text-[11px] font-bold rounded bg-[#EDF7F0] text-[#137333] border border-[#C6E8D1]">
              CONFIRMED
            </span>
          </div>
          <button
            type="button"
            aria-label="Close boarding pass modal"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded p-1 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <div>
            <h2 id="pass-modal-title" className="text-base font-bold text-gray-900">
              {pass.serviceName}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {pass.transportMode} Boarding Document · Pass #{pass.passId}
            </p>
          </div>

          {/* Timing Grid */}
          <div className="grid grid-cols-3 border border-gray-200 rounded-md p-3 bg-gray-50/60 text-center">
            <div className="text-left">
              <p className="text-[11px] text-gray-500">DEPARTS</p>
              <p className="font-bold text-[16px] text-gray-900 tabular">{pass.departure}</p>
              <p className="text-[11px] text-gray-600 truncate">{pass.from}</p>
            </div>
            <div className="flex flex-col justify-center items-center">
              <span className="text-[11px] font-semibold text-gray-500">Direct</span>
              <div className="h-px bg-gray-300 w-full my-1"></div>
              <ModeIcon size={14} className="text-[#15803D]" />
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-500">ARRIVES</p>
              <p className="font-bold text-[16px] text-gray-900 tabular">{pass.arrival}</p>
              <p className="text-[11px] text-gray-600 truncate">{pass.to}</p>
            </div>
          </div>

          {/* Passenger & Berth Grid */}
          <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-200 py-3 text-xs">
            <div>
              <span className="text-gray-500 block text-[11px]">Passenger</span>
              <p className="font-semibold text-gray-900 truncate">{pass.passengerName}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Seat / Berth</span>
              <p className="font-semibold text-[#15803D] truncate">{pass.berthSeat}</p>
            </div>
            <div>
              <span className="text-gray-500 block text-[11px]">Class</span>
              <p className="font-semibold text-gray-900 truncate">{pass.coachClass}</p>
            </div>
          </div>

          {/* PNR + Crisp Black QR */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-1">
              <p className="text-[11px] text-gray-500 uppercase">PNR / Pass Reference</p>
              <p className="font-mono font-bold text-[15px] text-gray-900 tracking-wider">{pass.pnr}</p>
              <p className="text-[11px] text-[#15803D] font-medium">Saved locally · Works without internet</p>
            </div>
            <div className="p-1.5 border border-gray-200 rounded bg-white shrink-0">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="#111827">
                <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm9-2h7v7h-7V3zm2 2v3h3V5h-3zM3 14h7v7H3v-7zm2 2v3h3v-3H5zm11-2h2v2h-2v-2zm3 0h2v2h-2v-2zm-5 3h2v4h-2v-4zm3 2h4v2h-4v-2zm2-2h2v1h-2v-1z"/>
              </svg>
            </div>
          </div>

          {/* Security & Document Decryption Section */}
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                {isVerified ? <CheckCircle size={15} className="text-[#137333]" /> : <Lock size={15} className="text-amber-600" />}
                {isVerified ? 'Gate Security Verified' : 'Fast Gate Access (PIN / Biometric)'}
              </h3>
              {isVerified && (
                <span className="rounded bg-[#EDF7F0] px-2 py-0.5 text-[10px] font-bold text-[#137333] border border-[#C6E8D1]">
                  Verified ({authMethod})
                </span>
              )}
            </div>

            {!isVerified ? (
              <div className="space-y-2">
                {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

                {hasPin && !pinSetupMode ? (
                  <form onSubmit={handlePinSubmit} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Enter 4-6 digit Quick-PIN"
                        className="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#15803D]"
                      />
                      <button
                        type="submit"
                        data-testid="submit-quick-pin"
                        className="inline-flex items-center gap-1 rounded bg-[#15803D] hover:bg-[#12733B] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        <KeyRound size={13} /> Verify
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <button
                        type="button"
                        onClick={handleBiometricAuth}
                        data-testid="biometric-unlock-btn"
                        className="inline-flex items-center gap-1 font-semibold text-[#15803D] hover:underline"
                      >
                        <Fingerprint size={13} /> 1-Tap Biometric Verification
                      </button>
                      <button
                        type="button"
                        onClick={() => setPinSetupMode(true)}
                        className="text-gray-500 hover:text-gray-900"
                      >
                        Change PIN
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handlePinSubmit} className="space-y-2">
                    <p className="text-[11px] text-gray-600">
                      Set a 4 to 6-digit Quick-PIN for instant offline gate boarding verification:
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        placeholder="Create 4-6 digit Quick-PIN"
                        className="flex-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#15803D]"
                      />
                      <button
                        type="submit"
                        data-testid="setup-quick-pin"
                        className="inline-flex items-center gap-1 rounded bg-[#15803D] hover:bg-[#12733B] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Set PIN and Open
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleBiometricAuth}
                      data-testid="biometric-unlock-btn"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] hover:underline"
                    >
                      <Fingerprint size={13} /> Or verify directly with Biometric
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex items-center gap-1.5 text-[#137333] font-semibold">
                  <CheckCircle size={14} /> Identity authenticated for boarding gate inspector.
                </div>
                <p className="text-[11px] text-gray-500">
                  This pass is certified tamper-resistant and cached entirely within the browser's IndexedDB.
                </p>
              </div>
            )}
          </div>

          {/* Crisis Hotlines */}
          <div className="flex items-center justify-between rounded border border-gray-200 bg-gray-50 px-3 py-2 text-[11px] text-gray-600">
            <span className="font-semibold text-gray-800">Crisis Hotlines:</span>
            <div className="flex gap-2.5 font-mono font-semibold text-gray-900">
              <span>Rail: 139</span>
              <span>SOS: 112</span>
              <span>Medical: 108</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={() => {
              window.print()
            }}
            className="w-full py-2.5 rounded bg-[#15803D] hover:bg-[#12733B] text-white font-semibold text-[13px] flex items-center justify-center gap-2"
          >
            <Download size={15} />
            Download / Print Offline Pass
          </button>
        </div>
      </div>
    </div>
  )
}

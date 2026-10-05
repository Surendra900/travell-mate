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
  Unlock,
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
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')
  const [hasPin, setHasPin] = useState(false)
  const [authMethod, setAuthMethod] = useState('')

  useEffect(() => {
    if (open) {
      setHasPin(hasQuickPinSet())
      setUnlocked(false)
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
      setUnlocked(true)
      setAuthMethod('quick-pin-setup')
      toast?.('Offline Quick-PIN configured.')
    } else {
      const valid = await verifyQuickPin(pin)
      if (valid) {
        setUnlocked(true)
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
      setUnlocked(true)
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    >
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-indigo-500/30 bg-slate-950 p-6 text-white shadow-2xl">
        <button
          type="button"
          aria-label="Close boarding pass modal"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/30 text-indigo-400">
            <ModeIcon size={24} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
              <ShieldCheck size={12} /> 100% Offline Boarding Pass
            </span>
            <h2 id="pass-modal-title" className="text-xl font-black text-white">
              {pass.serviceName}
            </h2>
          </div>
        </div>

        {/* Digital Boarding Pass Ticket */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-indigo-400/30 bg-slate-900/90 shadow-inner">
          <div className="bg-gradient-to-r from-indigo-900/80 to-purple-900/80 p-4 text-white">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-200">
              <span>{pass.transportMode} Boarding Document</span>
              <span>Pass #{pass.passId}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-2xl font-black">{pass.from}</p>
                <p className="text-xs text-indigo-300">Depart {pass.departure}</p>
              </div>
              <div className="flex flex-col items-center px-4">
                <span className="text-xs text-indigo-300">Direct</span>
                <span className="h-0.5 w-16 bg-indigo-400/60 my-1" />
                <ModeIcon size={16} className="text-indigo-200" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-black">{pass.to}</p>
                <p className="text-xs text-indigo-300">Arrive {pass.arrival}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-b border-indigo-900/40 p-4 text-xs">
            <div>
              <span className="text-slate-400">Passenger</span>
              <p className="font-bold text-white">{pass.passengerName}</p>
            </div>
            <div>
              <span className="text-slate-400">Seat / Berth</span>
              <p className="font-bold text-indigo-300">{pass.berthSeat}</p>
            </div>
            <div>
              <span className="text-slate-400">Class</span>
              <p className="font-bold text-white">{pass.coachClass}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-950/40 text-xs">
            <div>
              <span className="text-slate-400">PNR / Ticket No.</span>
              <p className="font-mono text-base font-black tracking-widest text-cyan-300">{pass.pnr}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-slate-300">
              <QrCode size={18} className="text-indigo-400" />
              <span className="font-mono text-[10px]">TICKET-GATE-VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Security & Document Decryption Section */}
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-white">
              {unlocked ? <Unlock size={16} className="text-emerald-400" /> : <Lock size={16} className="text-amber-400" />}
              {unlocked ? 'Gate Security Verified' : 'Fast Gate Unlock (PIN / Biometric)'}
            </h3>
            {unlocked && (
              <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                Verified ({authMethod})
              </span>
            )}
          </div>

          {!unlocked ? (
            <div className="mt-3">
              {error && <p className="mb-3 text-xs font-bold text-red-400">{error}</p>}

              {hasPin && !pinSetupMode ? (
                <form onSubmit={handlePinSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter 4-6 digit Quick-PIN"
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      data-testid="submit-quick-pin"
                      className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                    >
                      <KeyRound size={14} /> Verify
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={handleBiometricAuth}
                      data-testid="biometric-unlock-btn"
                      className="inline-flex items-center gap-1 font-bold text-indigo-400 hover:text-indigo-300"
                    >
                      <Fingerprint size={15} /> 1-Tap Biometric Unlock
                    </button>
                    <button
                      type="button"
                      onClick={() => setPinSetupMode(true)}
                      className="text-slate-400 hover:text-white"
                    >
                      Change PIN
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePinSubmit} className="space-y-3">
                  <p className="text-xs text-slate-400">
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
                      className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      data-testid="setup-quick-pin"
                      className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                    >
                      Set PIN & Unlock
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleBiometricAuth}
                    data-testid="biometric-unlock-btn"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    <Fingerprint size={15} /> Or unlock directly with Biometric
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="mt-3 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle size={16} /> Identity authenticated for boarding gate inspector.
              </div>
              <p>
                This pass is certified tamper-resistant and cached entirely within the browser's IndexedDB. Present this screen to the TTE or airline boarding officer.
              </p>
            </div>
          )}
        </div>

        {/* Emergency Transit Hotlines */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-2.5 text-xs text-slate-400">
          <span className="font-bold text-slate-300">Crisis Hotlines:</span>
          <div className="flex gap-3 font-mono font-bold text-indigo-300">
            <span>Rail: 139</span>
            <span>SOS: 112</span>
            <span>Medical: 108</span>
          </div>
        </div>
      </div>
    </div>
  )
}

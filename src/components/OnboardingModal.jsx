import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Save, UserRound, Info, X } from 'lucide-react'
import { useDialogFocus } from '../hooks/useDialogFocus.js'
import { TrainFront } from 'lucide-react'

const PROFILE_KEY = 'travelmate-user-profile'

export function getUserProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null } catch { return null }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, savedAt: new Date().toISOString(), localOnly: true }))
}

function FieldLabel({ htmlFor, label, optional }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label}
      {optional && <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>}
    </label>
  )
}

function FormInput({ id, ...props }) {
  return (
    <input
      id={id}
      className="w-full min-h-[44px] px-3.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20 transition"
      {...props}
    />
  )
}

export default function OnboardingModal({ toast, forceOpen = false, onClose }) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', irctcUsername: '', emergencyContact: '' })

  function close() {
    setOpen(false)
    onClose?.()
  }

  const dialogRef = useDialogFocus({ isOpen: open, onClose: close })

  useEffect(() => {
    if (!forceOpen) return
    const existing = getUserProfile()
    if (existing) setProfile((old) => ({ ...old, ...existing }))
    setSaved(false)
    setOpen(true)
  }, [forceOpen])

  const validProfile = useMemo(() => (
    profile.name.trim().length >= 2 &&
    (!profile.phone || /^[0-9]{10}$/.test(profile.phone.trim())) &&
    (!profile.email || /.+@.+\..+/.test(profile.email.trim()))
  ), [profile])

  function handleSave() {
    if (!validProfile) {
      toast?.('Use a name with at least 2 characters and valid optional phone/email fields.')
      return
    }
    saveProfile(profile)
    window.dispatchEvent(new Event('travelmate:profile-updated'))
    setSaved(true)
    toast?.('Local device profile saved.')
  }

  if (!open) return null

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      aria-describedby="profile-modal-desc"
    >
      <div className="bg-white w-full max-w-xl rounded-xl shadow-tm-modal max-h-[90dvh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center shrink-0">
              <UserRound size={18} className="text-white" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base font-bold text-slate-900">
                Local Device Profile
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Stored only in this browser</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            aria-label="Close profile dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <p id="profile-modal-desc" className="text-sm text-slate-600 leading-relaxed mb-5">
            This is not an account or identity verification. Clerk handles sign-in when configured.
            These optional details stay in this browser and are cleared when the signed-in account changes or signs out.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="pm-name" label="Full name" />
              <FormInput
                id="pm-name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Passenger name as on government ID"
                autoComplete="name"
              />
            </div>
            <div>
              <FieldLabel htmlFor="pm-phone" label="Phone number" optional />
              <FormInput
                id="pm-phone"
                inputMode="numeric"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="10-digit mobile"
                autoComplete="tel"
              />
            </div>
            <div>
              <FieldLabel htmlFor="pm-email" label="Email" optional />
              <FormInput
                id="pm-email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="name@domain.in"
                autoComplete="email"
              />
            </div>
            <div>
              <FieldLabel htmlFor="pm-irctc" label="IRCTC username" optional />
              <FormInput
                id="pm-irctc"
                value={profile.irctcUsername}
                onChange={(e) => setProfile({ ...profile, irctcUsername: e.target.value })}
                placeholder="For manual portal entry"
                autoComplete="username"
              />
            </div>
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="pm-emergency" label="Emergency contact phone" optional />
              <FormInput
                id="pm-emergency"
                inputMode="numeric"
                value={profile.emergencyContact}
                onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                placeholder="Family or trusted contact"
              />
            </div>

            {/* Info box */}
            <div className="sm:col-span-2 flex gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200">
              <Info size={16} className="text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-slate-600 leading-relaxed">
                Local browser storage is convenient, not a secure identity store. Do not enter passwords, card data, OTPs, Aadhaar numbers or passport numbers here.
              </p>
            </div>

            <button
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-lg bg-sky-700 hover:bg-sky-800 text-white font-semibold text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
              onClick={handleSave}
              disabled={!validProfile}
            >
              <Save size={16} />
              Save local profile
            </button>
          </div>

          {saved && (
            <div
              className="mt-4 flex gap-3 p-4 rounded-lg border border-emerald-200 bg-emerald-50"
              role="status"
            >
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-800 text-sm">Local profile saved</p>
                <p className="text-xs text-emerald-700 mt-0.5">No OTP or identity verification was performed.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Save, UserRound, Info, X } from 'lucide-react'
import { useDialogFocus } from '../hooks/useDialogFocus.js'

const PROFILE_KEY = 'travelmate-user-profile'

export function getUserProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null } catch { return null }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, savedAt: new Date().toISOString(), localOnly: true }))
}

function FieldLabel({ htmlFor, label, optional }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-gray-700 mb-1">
      {label}
      {optional && <span className="ml-1 text-[11px] font-normal text-gray-500">(optional)</span>}
    </label>
  )
}

function FormInput({ id, ...props }) {
  return (
    <input
      id={id}
      className="w-full min-h-[40px] px-3 rounded-md border border-gray-300 bg-white text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] transition"
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
      className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Edit local TravelMate profile"
      aria-labelledby="profile-modal-title"
      aria-describedby="profile-modal-desc"
    >
      <div className="bg-white w-full max-w-lg rounded-lg border border-gray-300 shadow-xl max-h-[90dvh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-200 bg-gray-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#15803D] text-white flex items-center justify-center shrink-0">
              <UserRound size={16} />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-sm font-bold text-gray-900">
                Local Device Profile
              </h2>
              <p className="text-[11px] text-gray-500">Stored only in this browser</p>
            </div>
          </div>
          <button
            type="button"
            onClick={close}
            className="w-8 h-8 flex items-center justify-center rounded text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition focus:outline-none"
            aria-label="Close profile dialog"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <p id="profile-modal-desc" className="text-xs text-gray-600 leading-relaxed mb-4">
            This is not an account or identity verification. Clerk handles sign-in when configured.
            These optional details stay in this browser and are cleared when the signed-in account changes or signs out.
          </p>

          <div className="grid gap-3.5 sm:grid-cols-2">
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

            {/* High-Contrast Clear Info Box */}
            <div className="sm:col-span-2 flex gap-2.5 p-3 rounded-md bg-amber-50 border border-amber-200">
              <Info size={16} className="text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                Local browser storage is convenient, not a secure identity store. Do not enter passwords, card data, OTPs, Aadhaar numbers or passport numbers here.
              </p>
            </div>

            <button
              className="sm:col-span-2 inline-flex items-center justify-center gap-2 min-h-[44px] px-6 rounded-md bg-[#15803D] hover:bg-[#12733B] text-white font-semibold text-sm transition focus:outline-none focus:ring-2 focus:ring-[#15803D]/40 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="mt-3.5 flex gap-2.5 p-3 rounded-md border border-[#C6E8D1] bg-[#EDF7F0]"
              role="status"
            >
              <CheckCircle2 size={16} className="text-[#137333] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#137333] text-xs">Local profile saved</p>
                <p className="text-[11px] text-[#137333]/90 mt-0.5">No OTP or identity verification was performed.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

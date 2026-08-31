import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Save, UserRound } from 'lucide-react'

const PROFILE_KEY = 'travelmate-user-profile'

export function getUserProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null } catch { return null }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...profile, savedAt: new Date().toISOString(), localOnly: true }))
}

export default function OnboardingModal({ toast, forceOpen = false, onClose }) {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({ name: '', phone: '', email: '', irctcUsername: '', emergencyContact: '' })

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

  function close() {
    setOpen(false)
    onClose?.()
  }

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
    <div className="fixed inset-0 z-[90] grid place-items-start bg-slate-950/85 p-3 pt-4 backdrop-blur-md sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Edit local TravelMate profile">
      <div className="glass max-h-[calc(100dvh-1rem)] w-full max-w-2xl overflow-y-auto rounded-3xl p-4 pb-8 shadow-glow sm:max-h-[92vh] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="badge border-cyan-300/30 bg-cyan-300/10 text-cyan-100"><UserRound size={14} /> Local device profile</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">Booking and emergency details</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">This is not an account or identity verification. Clerk handles sign-in when configured. These optional details stay in this browser and are cleared when the signed-in account changes or signs out.</p>
          </div>
          <button className="dialog-close-button dialog-close-text" type="button" onClick={close} aria-label="Close profile" title="Close profile">Close</button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">Full name</span><input className="input" value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} placeholder="Your name" /></label>
          <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">Phone number <span className="text-slate-400">(optional)</span></span><input className="input" inputMode="numeric" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit mobile" /></label>
          <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">Email <span className="text-slate-400">(optional)</span></span><input className="input" type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} placeholder="you@example.com" /></label>
          <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">IRCTC username <span className="text-slate-400">(optional)</span></span><input className="input" value={profile.irctcUsername} onChange={(event) => setProfile({ ...profile, irctcUsername: event.target.value })} placeholder="For manual portal entry" /></label>
          <label className="text-sm font-bold text-cyan-100 sm:col-span-2"><span className="mb-2 block">Emergency contact phone <span className="text-slate-400">(optional)</span></span><input className="input" inputMode="numeric" value={profile.emergencyContact} onChange={(event) => setProfile({ ...profile, emergencyContact: event.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="Family or trusted contact" /></label>
          <div className="sm:col-span-2 rounded-2xl border border-yellow-400/25 bg-yellow-400/10 p-4 text-sm text-yellow-100">
            Local browser storage is convenient, not a secure identity store. Do not enter passwords, card data, OTPs, Aadhaar numbers or passport numbers here.
          </div>
          <button className="btn-primary sm:col-span-2 inline-flex items-center justify-center gap-2" type="button" onClick={handleSave}><Save size={18} />Save local profile</button>
        </div>

        {saved && (
          <div className="mt-5 rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-5 text-emerald-100" role="status">
            <CheckCircle2 className="mb-2" />
            <p className="font-black text-white">Local profile saved</p>
            <p className="mt-1 text-sm">No OTP or identity verification was performed.</p>
          </div>
        )}
      </div>
    </div>
  )
}

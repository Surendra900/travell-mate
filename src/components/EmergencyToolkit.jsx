import { useEffect, useMemo, useState } from 'react'
import { Copy, MapPin, MessageCircle, Phone, Send, ShieldAlert, UserPlus, WifiOff } from 'lucide-react'
import { saveOfflinePack, getOfflinePack } from '../utils/storage'
import { warmOfflineCache } from '../utils/offlineMode'
import {
  buildEmergencyAlert,
  formatEmergencyLocation,
  getCachedEmergencyLocation,
  getCurrentTripContext,
  queryLocationPermission,
  requestEmergencyLocation,
  setLocationOnboardingChoice
} from '../utils/locationSafety'

const CONTACT_KEY = 'travelmate-emergency-contacts'

function getContacts() {
  try {
    return JSON.parse(localStorage.getItem(CONTACT_KEY)) || []
  } catch {
    return []
  }
}

function saveContacts(contacts) {
  localStorage.setItem(CONTACT_KEY, JSON.stringify(contacts.slice(0, 8)))
}

function normalizeIndianPhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length === 10) return `91${digits}`
  return digits
}

function getProfileEmergencyContact() {
  try {
    const profile = JSON.parse(localStorage.getItem('travelmate-user-profile'))
    if (profile?.emergencyContact) {
      return [{ id: 'profile-emergency', name: 'Profile emergency contact', phone: profile.emergencyContact, relation: 'Saved profile' }]
    }
  } catch {}
  return []
}

export default function EmergencyToolkit({ toast, compact = false }) {
  const [contacts, setContacts] = useState(() => {
    const saved = getContacts()
    const profileContact = getProfileEmergencyContact()
    const merged = [...profileContact, ...saved]
    return merged.filter((item, index, list) => list.findIndex((x) => x.phone === item.phone) === index)
  })
  const [contact, setContact] = useState({ name: '', phone: '', relation: 'Family' })
  const [location, setLocation] = useState(() => getCachedEmergencyLocation())
  const [locationPermission, setLocationPermission] = useState('checking')
  const [locationBusy, setLocationBusy] = useState(false)
  const [emergencyType, setEmergencyType] = useState('General emergency')
  const [offlinePack, setOfflinePack] = useState(() => getOfflinePack())

  useEffect(() => {
    let active = true
    queryLocationPermission().then((state) => {
      if (active) setLocationPermission(state)
    })
    function handleLocation(event) {
      if (event.detail) {
        setLocation(event.detail)
        setLocationPermission('granted')
      }
    }
    window.addEventListener('travelmate:location-updated', handleLocation)
    return () => {
      active = false
      window.removeEventListener('travelmate:location-updated', handleLocation)
    }
  }, [])

  const tripContext = getCurrentTripContext()
  const alertMessage = useMemo(() => buildEmergencyAlert({
    emergencyType,
    location,
    contacts,
    tripContext
  }), [emergencyType, location, contacts, tripContext])

  async function copy(text, label = 'Copied') {
    try {
      await navigator.clipboard.writeText(text)
      toast?.(label)
    } catch {
      toast?.('Copy failed. Long press and copy manually.')
    }
  }

  async function captureLocation({ announce = true } = {}) {
    setLocationBusy(true)
    const result = await requestEmergencyLocation({ maximumAge: 15000 })
    setLocationBusy(false)

    if (result.location) setLocation(result.location)
    if (result.ok) {
      setLocationPermission('granted')
      setLocationOnboardingChoice('enabled')
      if (announce) toast?.('Current location refreshed.')
      return result.location
    }

    setLocationPermission(result.reason)
    if (result.location) {
      if (announce) toast?.('Fresh GPS failed. Using the last location saved on this device.')
      return result.location
    }

    if (announce) {
      const messages = {
        denied: 'Location is blocked. Enable it from browser site settings, or add a landmark manually.',
        timeout: 'GPS timed out. Try outdoors or add a landmark manually.',
        unsupported: 'This browser does not support GPS location.',
        unavailable: 'GPS location is currently unavailable.'
      }
      toast?.(messages[result.reason] || 'Location could not be captured.')
    }
    return null
  }

  async function getLocation() {
    const loc = await captureLocation()
    await copy(formatEmergencyLocation(loc), loc ? 'Location refreshed and copied.' : 'Location instruction copied.')
  }

  function messageFor(locationValue) {
    return buildEmergencyAlert({
      emergencyType,
      location: locationValue,
      contacts,
      tripContext: getCurrentTripContext()
    })
  }

  async function openWhatsApp(phone = '') {
    const popup = window.open('about:blank', '_blank')
    const loc = await captureLocation({ announce: false })
    const message = messageFor(loc)
    try { await navigator.clipboard.writeText(message) } catch {}
    const normalized = normalizeIndianPhone(phone)
    const url = normalized
      ? `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`
    if (popup) {
      popup.opener = null
      popup.location.href = url
    } else {
      window.location.href = url
    }
    toast?.(loc
      ? 'WhatsApp opened with the current location included. Review and tap Send.'
      : 'WhatsApp opened. Add a landmark before tapping Send because GPS is unavailable.')
  }

  async function openSms(phone = '') {
    const target = String(phone || '').replace(/\D/g, '')
    if (!target) {
      toast?.('Save or select an emergency contact before opening SMS.')
      return
    }
    const loc = await captureLocation({ announce: false })
    const message = messageFor(loc)
    try { await navigator.clipboard.writeText(message) } catch {}
    window.location.href = `sms:${target}?body=${encodeURIComponent(message)}`
    toast?.(loc
      ? 'SMS opened with the current location included. Review and tap Send.'
      : 'SMS opened. Add a landmark before tapping Send because GPS is unavailable.')
  }

  async function shareWhatsAppContacts() {
    const targets = contacts.filter((item) => normalizeIndianPhone(item.phone))
    if (targets.length === 0) {
      toast?.('Save at least one emergency contact first.')
      return
    }
    await openWhatsApp(targets[0].phone)
    if (targets.length > 1) {
      toast?.(`Opened WhatsApp for ${targets[0].name}. The alert is copied; send it to the other saved contacts one at a time.`)
    }
  }

  async function shareSmsContact() {
    const target = contacts.find((item) => String(item.phone || '').replace(/\D/g, ''))
    if (!target) {
      toast?.('Save at least one emergency contact first.')
      return
    }
    await openSms(target.phone)
  }

  async function handleCall112() {
    const loc = await captureLocation({ announce: false })
    const message = messageFor(loc)
    try { await navigator.clipboard.writeText(message) } catch {}
    toast?.('Opening 112 dialer. Emergency message with location is copied for sharing.')
    window.location.href = 'tel:112'
  }

  async function prepareOffline() {
    const pack = saveOfflinePack()
    setOfflinePack(pack)
    const result = await warmOfflineCache()
    if (result.ok) toast?.(`Offline emergency pack ready: ${result.saved} files cached.`)
    else toast?.('Emergency offline pack saved. Browser cache support may be limited.')
  }

  function addContact() {
    if (!contact.name.trim() || !contact.phone.trim()) {
      toast?.('Enter contact name and phone number.')
      return
    }
    const savedOnly = contacts.filter((item) => item.id !== 'profile-emergency')
    const nextSaved = [{ ...contact, id: Date.now() }, ...savedOnly].slice(0, 8)
    saveContacts(nextSaved)
    const profileContact = getProfileEmergencyContact()
    const next = [...profileContact, ...nextSaved]
    setContacts(next)
    setContact({ name: '', phone: '', relation: 'Family' })
    toast?.('Emergency contact saved on this device.')
  }

  function removeContact(id) {
    if (id === 'profile-emergency') {
      toast?.('Edit profile setup to change this contact.')
      return
    }
    const nextSaved = contacts.filter((item) => item.id !== id && item.id !== 'profile-emergency')
    saveContacts(nextSaved)
    const next = [...getProfileEmergencyContact(), ...nextSaved]
    setContacts(next)
  }

  const locationLabel = location
    ? formatEmergencyLocation(location)
    : locationPermission === 'denied'
      ? 'Location blocked in browser settings.'
      : 'No location saved yet.'

  return (
    <section className={`${compact ? '' : 'mt-10'} danger-glass rounded-3xl p-5 shadow-danger`} aria-label="SOS Emergency Alert">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="badge border-red-400/30 bg-red-500/20 text-red-100"><ShieldAlert size={14} /> SOS Emergency Alert</p>
          <h2 className="mt-3 text-3xl font-black text-white">One tap crisis panel</h2>
          <p className="mt-2 max-w-3xl text-sm text-red-100/85">TravelMate refreshes your location when you tap WhatsApp or SMS and inserts it into the emergency message automatically.</p>
          <p className="mt-2 max-w-3xl text-xs text-yellow-100/90">Your phone still requires a final tap on Send. Websites cannot silently send WhatsApp or SMS messages, and they cannot send GPS directly to 112.</p>
        </div>
        <button className="btn-danger inline-flex items-center gap-2 text-lg" onClick={handleCall112}><Phone size={20} /> Call 112 now</button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-4">
          <div className="rounded-2xl border border-red-300/30 bg-red-950/50 p-4">
            <label className="text-sm font-black text-red-100">Emergency type</label>
            <select className="input mt-2" value={emergencyType} onChange={(e) => setEmergencyType(e.target.value)}>
              {['General emergency', 'Lost passport', 'Medical emergency', 'Robbery or theft', 'Unsafe location', 'Urgent travel escape'].map((item) => <option key={item}>{item}</option>)}
            </select>
            <div className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-xs text-cyan-50">
              <p className="font-black">Location status: {locationPermission}</p>
              <p className="mt-1 break-all">{locationLabel}</p>
              {tripContext && <p className="mt-1 font-bold">Travel plan included: {tripContext}</p>}
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <button className="btn-primary inline-flex items-center justify-center gap-2" onClick={getLocation} disabled={locationBusy}><MapPin size={16} /> {locationBusy ? 'Locating…' : 'Refresh location'}</button>
              <button className="btn-soft inline-flex items-center justify-center gap-2" onClick={() => copy(alertMessage, 'Emergency message copied.')}><Copy size={16} /> Copy alert</button>
              <button className="btn-soft inline-flex items-center justify-center gap-2" onClick={() => openWhatsApp()}><MessageCircle size={16} /> WhatsApp</button>
              <button className="btn-soft inline-flex items-center justify-center gap-2" onClick={shareWhatsAppContacts}><Send size={16} /> WhatsApp saved</button>
              <button className="btn-soft inline-flex items-center justify-center gap-2" onClick={shareSmsContact}><Send size={16} /> SMS saved</button>
            </div>
            <p className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-xs font-bold text-yellow-100">If location was allowed during startup, WhatsApp and SMS normally open without another permission prompt. TravelMate still refreshes GPS first so an old position is not sent.</p>
          </div>

          <div className="rounded-2xl border border-lime-300/30 bg-lime-400/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-200">Offline emergency pack</p>
            <h3 className="mt-1 text-2xl font-black text-white">{offlinePack ? 'Prepared on this device' : 'Not prepared yet'}</h3>
            <p className="mt-2 text-sm text-lime-100/85">Stores emergency guidance, saved route snapshots and transport details. Encrypted documents remain separate in the secure vault.</p>
            <button className="btn-low mt-4 inline-flex items-center gap-2" onClick={prepareOffline}><WifiOff size={18} /> Prepare offline</button>
            {offlinePack?.generatedAt && <p className="mt-3 text-xs font-bold text-lime-100">Last prepared: {new Date(offlinePack.generatedAt).toLocaleString()}</p>}
            {offlinePack?.secureVaultDocumentCount > 0 && <p className="mt-3 text-xs font-bold text-cyan-100">Encrypted vault documents on this device: {offlinePack.secureVaultDocumentCount}. They are not copied into the offline pack.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-400/25 bg-slate-950/60 p-4">
          <h3 className="text-2xl font-black text-white">Emergency contact vault</h3>
          <p className="mt-1 text-xs text-cyan-100">Local-only. Each WhatsApp or SMS button refreshes GPS and prepares the message for that contact.</p>
          <div className="mt-4 grid gap-3">
            <input className="input" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Contact name" />
            <input className="input" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="Phone number" />
            <select className="input" value={contact.relation} onChange={(e) => setContact({ ...contact, relation: e.target.value })}>
              {['Family', 'Friend', 'Doctor', 'Insurance', 'University/Company', 'Travel coordinator'].map((item) => <option key={item}>{item}</option>)}
            </select>
            <button className="btn-primary inline-flex items-center justify-center gap-2" onClick={addContact}><UserPlus size={18} /> Save contact</button>
          </div>
          <div className="mt-4 space-y-3">
            {contacts.length === 0 && <p className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm text-slate-300">No emergency contacts saved yet.</p>}
            {contacts.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-black text-white">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.relation} · {item.phone}</p>
                  </div>
                  <button className="text-xs text-red-200" onClick={() => removeContact(item.id)}>Remove</button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a className="rounded-lg bg-red-500 px-3 py-2 text-xs font-black text-white" href={`tel:${item.phone}`}>Call</a>
                  <button className="rounded-lg border border-cyan-400/30 px-3 py-2 text-xs font-bold text-cyan-100" onClick={() => copy(`${item.name}: ${item.phone}`, 'Contact copied')}>Copy</button>
                  <button className="rounded-lg border border-emerald-400/30 px-3 py-2 text-xs font-bold text-emerald-100" onClick={() => openSms(item.phone)}><Send size={12} className="mr-1 inline" />SMS + location</button>
                  <button className="rounded-lg border border-emerald-400/30 px-3 py-2 text-xs font-bold text-emerald-100" onClick={() => openWhatsApp(item.phone)}><MessageCircle size={12} className="mr-1 inline" />WhatsApp + location</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

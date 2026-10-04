import { useEffect, useMemo, useState } from 'react'
import {
  Copy,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldAlert,
  UserPlus,
  WifiOff,
  Train,
  HeartPulse,
  Shield,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Radio,
  Navigation,
  Compass,
  CheckCircle2,
  Volume2,
  VolumeX
} from 'lucide-react'
import { saveOfflinePack, getOfflinePack } from '../utils/storage'
import { warmOfflineCache } from '../utils/offlineMode'
import { speakProtocolGuidance, stopSpeaking } from '../utils/voiceIntent'
import {
  buildEmergencyAlert,
  formatEmergencyLocation,
  getCachedEmergencyLocation,
  getCurrentTripContext,
  locationMapUrl,
  queryLocationPermission,
  requestEmergencyLocation,
  setLocationOnboardingChoice
} from '../utils/locationSafety'
import { TRANSIT_HOTLINES, TRANSIT_INCIDENT_PROTOCOLS } from '../data/emergencyData'

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
  const [expandedProtocol, setExpandedProtocol] = useState('coach-medical')
  const [speakingProtocolId, setSpeakingProtocolId] = useState(null)

  useEffect(() => {
    return () => {
      stopSpeaking()
    }
  }, [])

  useEffect(() => {
    function handleVoiceDial(e) {
      const hotline = e.detail?.hotline
      if (hotline) {
        toast?.(`Voice Trigger: Emergency Hotline ${hotline} ready. Tap Call to connect.`)
      }
    }
    window.addEventListener('travelmate:voice-dial', handleVoiceDial)
    return () => window.removeEventListener('travelmate:voice-dial', handleVoiceDial)
  }, [toast])

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

  async function handleHotlineCall(hotline) {
    const loc = await captureLocation({ announce: false })
    try {
      const locText = formatEmergencyLocation(loc)
      await navigator.clipboard.writeText(locText)
    } catch {}
    toast?.(`Opening ${hotline.number} (${hotline.title}). Location copied to clipboard for operator.`)
    window.location.href = `tel:${hotline.number}`
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

  const googleMapsUrl = location?.latitude && location?.longitude
    ? location.mapUrl || locationMapUrl(location.latitude, location.longitude)
    : null

  const gpsAccuracyText = location?.accuracy != null
    ? `±${Math.round(location.accuracy)} m`
    : 'Unknown'

  const isHighAccuracy = location?.accuracy != null && location.accuracy <= 35

  return (
    <section className={`${compact ? '' : 'mt-10'} danger-glass rounded-3xl p-5 sm:p-6 shadow-danger`} aria-label="SOS Emergency Alert">
      {/* Top Header & Fast 112 Action */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-red-500/20 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge border-red-400/30 bg-red-500/20 text-red-100 font-bold tracking-wide">
              <ShieldAlert size={14} className="text-red-400" /> SOS Emergency Alert & Crisis Desk
            </span>
            <span className="badge border-emerald-400/30 bg-emerald-500/20 text-emerald-100 font-bold">
              India 24/7 Active
            </span>
          </div>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">One-Tap Crisis Panel</h2>
          <p className="mt-2 max-w-3xl text-sm text-red-100/90 leading-relaxed">
            TravelMate refreshes your GPS coordinates when you tap any helpline, WhatsApp, or SMS, automatically copying your location to the clipboard for instant dispatch.
          </p>
        </div>
        <button
          className="btn-danger inline-flex items-center gap-2 text-lg px-6 py-3 font-black shadow-lg shadow-red-900/50 hover:scale-[1.02] transition-transform"
          onClick={handleCall112}
          aria-label="Call 112 National Emergency"
        >
          <Phone size={22} className="animate-pulse" /> Call 112 now
        </button>
      </div>

      {/* 4-Hotline Indian Transit Emergency Grid */}
      <div className="mt-6" aria-label="Indian Transit Emergency Hotlines">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
            Dedicated National Transit Helplines (1-Tap Dial & Location Copy)
          </h3>
          <span className="text-xs text-slate-400">Direct carrier dialers</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TRANSIT_HOTLINES.map((hotline) => {
            const Icon = hotline.category === 'police' ? ShieldAlert
              : hotline.category === 'rail' ? Train
              : hotline.category === 'ambulance' ? HeartPulse
              : Shield

            return (
              <div
                key={hotline.id}
                className="relative flex flex-col justify-between rounded-2xl border border-slate-700/60 bg-slate-900/80 p-4 transition-all hover:border-slate-500"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${hotline.badgeColor}`}>
                      {hotline.badge}
                    </span>
                    <span className="font-mono text-xl font-black tracking-tight text-white">{hotline.number}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Icon size={18} className="text-slate-200" />
                    <h4 className="font-black text-sm text-white leading-tight">{hotline.title}</h4>
                  </div>
                  <p className="mt-1 text-xs text-slate-300/80 leading-relaxed">{hotline.desc}</p>
                </div>
                <button
                  type="button"
                  data-testid={`hotline-call-${hotline.id}`}
                  onClick={() => handleHotlineCall(hotline)}
                  className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-black shadow transition-all ${hotline.btnColor}`}
                  aria-label={`Call ${hotline.title} on ${hotline.number}`}
                >
                  <Phone size={14} /> Call {hotline.number}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Grid: Telemetry + Dispatch Composer vs Contacts Vault */}
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-5">
          {/* Live GPS Telemetry Card */}
          <div className="rounded-2xl border border-cyan-400/30 bg-slate-950/70 p-4 shadow-inner">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Navigation size={18} className="text-cyan-400" />
                <h4 className="text-sm font-black uppercase tracking-wider text-cyan-200">
                  Live GPS Broadcast Engine
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-black ${
                  isHighAccuracy ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                  location ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                  'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}>
                  <Radio size={12} className={locationBusy ? 'animate-spin' : ''} />
                  {isHighAccuracy ? 'Satellite Fix Locked' : location ? 'Approximate Fix' : 'GPS Offline'}
                </span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-300">
                  Acc: {gpsAccuracyText}
                </span>
              </div>
            </div>

            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-slate-400">Coordinates:</span>
                <span className="font-mono text-cyan-200 text-right">
                  {location?.latitude != null ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : 'Unavailable'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-slate-400">Status:</span>
                <span className="text-slate-200 text-right capitalize">{locationPermission}</span>
              </div>
              {location?.capturedAt && (
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-slate-400">Timestamp:</span>
                  <span className="text-slate-300 text-right">{new Date(location.capturedAt).toLocaleTimeString()}</span>
                </div>
              )}
              {tripContext && (
                <div className="mt-2 rounded-lg bg-cyan-950/40 p-2 text-cyan-100 border border-cyan-800/40">
                  <span className="font-bold text-cyan-300">Active Transit Context:</span> {tripContext}
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                className="btn-primary inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold"
                onClick={getLocation}
                disabled={locationBusy}
                aria-label="Refresh GPS Location"
              >
                <Compass size={14} className={locationBusy ? 'animate-spin' : ''} />
                {locationBusy ? 'Locating…' : 'Refresh location'}
              </button>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn-soft inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold"
                  aria-label="Open location in Google Maps"
                >
                  <ExternalLink size={14} /> Open Maps
                </a>
              )}
              <button
                type="button"
                className="btn-soft inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold"
                onClick={() => copy(googleMapsUrl || locationLabel, 'Maps pin link copied.')}
                aria-label="Copy Google Maps link"
              >
                <Copy size={14} /> Copy Pin Link
              </button>
            </div>
          </div>

          {/* Emergency Alert Dispatch Form */}
          <div className="rounded-2xl border border-red-300/30 bg-red-950/50 p-4">
            <label htmlFor="emergency-type-select" className="text-sm font-black text-red-100">
              Emergency Dispatch Type
            </label>
            <select
              id="emergency-type-select"
              className="input mt-2 font-bold"
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
            >
              {[
                'General emergency',
                'Lost passport',
                'Medical emergency',
                'Robbery or theft',
                'Unsafe location',
                'Urgent travel escape'
              ].map((item) => <option key={item}>{item}</option>)}
            </select>

            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-900/20 p-3 text-xs text-red-200">
              <p className="font-mono text-[11px] leading-relaxed break-all">{locationLabel}</p>
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <button className="btn-soft inline-flex items-center justify-center gap-2" onClick={() => copy(alertMessage, 'Emergency message copied.')}>
                <Copy size={16} /> Copy alert
              </button>
              <button className="btn-soft inline-flex items-center justify-center gap-2" onClick={() => openWhatsApp()}>
                <MessageCircle size={16} /> WhatsApp
              </button>
              <button className="btn-soft inline-flex items-center justify-center gap-2" onClick={shareWhatsAppContacts}>
                <Send size={16} /> WhatsApp saved
              </button>
              <button className="btn-soft inline-flex items-center justify-center gap-2 sm:col-span-3" onClick={shareSmsContact}>
                <Send size={16} /> SMS saved
              </button>
            </div>

            <p className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-xs font-bold text-yellow-100">
              If location was allowed during startup, WhatsApp and SMS normally open without another permission prompt. TravelMate still refreshes GPS first so an old position is not sent.
            </p>
          </div>

          {/* Offline Emergency Pack Status */}
          <div className="rounded-2xl border border-lime-300/30 bg-lime-950/30 p-4">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-200">Offline Emergency Pack</p>
            <h3 className="mt-1 text-2xl font-black text-white">{offlinePack ? 'Prepared on this device' : 'Not prepared yet'}</h3>
            <p className="mt-2 text-sm text-lime-100/85">
              Stores emergency transit guidance, cached offline routes, and station safety contacts directly on your browser storage.
            </p>
            <button className="btn-low mt-4 inline-flex items-center gap-2" onClick={prepareOffline}>
              <WifiOff size={18} /> Prepare offline
            </button>
            {offlinePack?.generatedAt && (
              <p className="mt-3 text-xs font-bold text-lime-100">
                Last prepared: {new Date(offlinePack.generatedAt).toLocaleString()}
              </p>
            )}
            {offlinePack?.secureVaultDocumentCount > 0 && (
              <p className="mt-2 text-xs font-bold text-cyan-100">
                Encrypted vault documents on this device: {offlinePack.secureVaultDocumentCount}. They are not copied into the offline pack.
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Local Emergency Contact Vault */}
        <div className="flex flex-col rounded-2xl border border-cyan-400/25 bg-slate-950/70 p-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <div>
              <h3 className="text-xl font-black text-white">Emergency Contact Vault</h3>
              <p className="mt-0.5 text-xs text-cyan-100">Local-only encrypted storage. One-tap instant SMS & WhatsApp dispatch.</p>
            </div>
            <span className="badge border-cyan-400/30 bg-cyan-500/10 text-cyan-200 text-xs font-bold">
              {contacts.length} / 8 Saved
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              addContact()
            }}
            className="mt-4 grid gap-2.5"
            aria-label="Add Emergency Contact"
          >
            <input
              className="input"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              placeholder="Contact name (e.g. Rahul Sharma)"
              aria-label="Contact name"
            />
            <input
              className="input"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              placeholder="10-digit Indian phone (e.g. 9876543210)"
              type="tel"
              aria-label="Phone number"
            />
            <select
              className="input"
              value={contact.relation}
              onChange={(e) => setContact({ ...contact, relation: e.target.value })}
              aria-label="Relationship"
            >
              {['Family', 'Friend', 'Doctor', 'Insurance', 'University/Company', 'Travel coordinator'].map((item) => <option key={item}>{item}</option>)}
            </select>
            <button type="submit" className="btn-primary inline-flex items-center justify-center gap-2">
              <UserPlus size={18} /> Save contact
            </button>
          </form>

          <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
            {contacts.length === 0 && (
              <p className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center text-sm text-slate-400">
                No emergency contacts saved yet. Add trusted family or transit coordinators above for instant 1-tap SOS.
              </p>
            )}
            {contacts.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-700/70 bg-slate-900/80 p-3 shadow-sm transition hover:border-slate-600">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-black text-white text-sm">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.relation} · +91 {item.phone}</p>
                  </div>
                  <button
                    className="text-xs font-bold text-red-300 hover:text-red-100 transition"
                    onClick={() => removeContact(item.id)}
                    aria-label={`Remove ${item.name}`}
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <a
                    className="rounded-lg bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-black text-white inline-flex items-center gap-1 shadow"
                    href={`tel:${item.phone}`}
                    aria-label={`Call ${item.name}`}
                  >
                    <Phone size={12} /> Call
                  </a>
                  <button
                    className="rounded-lg border border-cyan-400/30 hover:bg-cyan-950/40 px-3 py-1.5 text-xs font-bold text-cyan-100 inline-flex items-center gap-1"
                    onClick={() => copy(`${item.name}: ${item.phone}`, 'Contact copied')}
                  >
                    <Copy size={12} /> Copy
                  </button>
                  <button
                    className="rounded-lg border border-emerald-400/30 hover:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-100 inline-flex items-center gap-1"
                    onClick={() => openSms(item.phone)}
                  >
                    <Send size={12} /> SMS + location
                  </button>
                  <button
                    className="rounded-lg border border-emerald-400/30 hover:bg-emerald-950/40 px-3 py-1.5 text-xs font-bold text-emerald-100 inline-flex items-center gap-1"
                    onClick={() => openWhatsApp(item.phone)}
                  >
                    <MessageCircle size={12} /> WhatsApp + location
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Offline Transit Incident Protocols Section */}
      <div className="mt-8 border-t border-slate-800 pt-6" aria-label="Offline Transit Incident Protocols">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="badge border-cyan-400/30 bg-cyan-500/10 text-cyan-200 text-xs font-black tracking-wide">
              ZERO-NETWORK READINESS
            </span>
            <h3 className="mt-1 text-2xl font-black text-white">
              Offline Transit Incident Protocols
            </h3>
            <p className="text-xs text-slate-300">
              Verified legal and operational procedures for Indian Railways, transit junctions, and solo traveler safety.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {TRANSIT_INCIDENT_PROTOCOLS.map((protocol) => {
            const isExpanded = expandedProtocol === protocol.id
            return (
              <div
                key={protocol.id}
                className="rounded-2xl border border-slate-700/70 bg-slate-900/80 p-4 transition-all hover:border-slate-500"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${protocol.tagColor}`}>
                      {protocol.tag}
                    </span>
                    <h4 className="mt-1 text-base font-black text-white">{protocol.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (speakingProtocolId === protocol.id) {
                          stopSpeaking()
                          setSpeakingProtocolId(null)
                        } else {
                          setSpeakingProtocolId(protocol.id)
                          speakProtocolGuidance(protocol, {
                            onEnd: () => setSpeakingProtocolId(null),
                            onError: () => setSpeakingProtocolId(null)
                          })
                        }
                      }}
                      data-testid={`speak-protocol-header-${protocol.id}`}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold transition ${
                        speakingProtocolId === protocol.id
                          ? 'border border-amber-400 bg-amber-400/20 text-amber-300 animate-pulse'
                          : 'border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20'
                      }`}
                      aria-label={`Listen audio for ${protocol.id}`}
                      title="Listen to crisis protocol steps aloud"
                    >
                      {speakingProtocolId === protocol.id ? <VolumeX size={11} className="text-amber-300" /> : <Volume2 size={11} />}
                      <span>{speakingProtocolId === protocol.id ? 'Stop' : 'Listen'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedProtocol(isExpanded ? null : protocol.id)}
                      className="rounded-lg p-1 text-slate-400 hover:text-white"
                      aria-label={isExpanded ? `Collapse ${protocol.title}` : `Expand ${protocol.title}`}
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 border-t border-slate-800/80 pt-3">
                    <ol className="space-y-2 text-xs text-slate-200">
                      {protocol.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="flex-shrink-0 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-black text-cyan-300">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 pt-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (speakingProtocolId === protocol.id) {
                            stopSpeaking()
                            setSpeakingProtocolId(null)
                          } else {
                            setSpeakingProtocolId(protocol.id)
                            speakProtocolGuidance(protocol, {
                              onEnd: () => setSpeakingProtocolId(null),
                              onError: () => setSpeakingProtocolId(null)
                            })
                          }
                        }}
                        data-testid={`speak-protocol-${protocol.id}`}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition ${
                          speakingProtocolId === protocol.id
                            ? 'border border-amber-400 bg-amber-400/20 text-amber-300 animate-pulse'
                            : 'border border-cyan-400/30 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25'
                        }`}
                        aria-label={`Listen to ${protocol.title} instructions aloud`}
                      >
                        {speakingProtocolId === protocol.id ? <VolumeX size={12} className="text-amber-300" /> : <Volume2 size={12} />}
                        <span>{speakingProtocolId === protocol.id ? 'Stop Audio' : 'Listen Steps Aloud'}</span>
                      </button>
                      <a
                        href={`tel:${protocol.hotline}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-black text-white shadow"
                        aria-label={protocol.hotlineLabel}
                      >
                        <Phone size={12} /> {protocol.hotlineLabel}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Prominent Legal Safety Notice */}
      <div className="mt-8 rounded-2xl border border-yellow-500/40 bg-yellow-950/30 p-4 text-yellow-100 flex items-start gap-3">
        <AlertTriangle size={24} className="text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-black text-yellow-300 uppercase tracking-wider block mb-0.5">
            Legal Safety & Transit Notice
          </span>
          TravelMate AI is a personal transit aid, itinerary coordinator, and offline readiness assistant. It is NOT an official government dispatch system or a replacement for public emergency personnel. In any active crime, physical hazard, derailment, or life-threatening situation, dial <strong>112 (Unified SOS)</strong> or <strong>139 (Indian Railways RailMadad)</strong> immediately from your mobile carrier dialer.
        </div>
      </div>
    </section>
  )
}

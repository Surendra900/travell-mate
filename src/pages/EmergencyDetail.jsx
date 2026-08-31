import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { emergencyFlows, emergencyNumber } from '../data/emergencyData'

const CONTACT_KEY = 'travelmate-emergency-contacts'

function getContacts() {
  try {
    return JSON.parse(localStorage.getItem(CONTACT_KEY)) || []
  } catch {
    return []
  }
}

function normalizeIndianPhone(phone = '') {
  const digits = String(phone).replace(/\D/g, '')
  if (digits.length === 10) return `91${digits}`
  return digits
}

export default function EmergencyDetail({ toast }) {
  const { id } = useParams()
  const flow = emergencyFlows[id]

  if (!flow) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Link to="/safety" className="btn-soft inline-flex items-center gap-2"><ArrowLeft size={16} />Back to Safety Mode</Link>
        <h1 className="mt-6 text-3xl font-black text-white">Emergency flow not found</h1>
      </main>
    )
  }

  async function copy(text, label = 'Copied') {
    try {
      await navigator.clipboard.writeText(text)
      toast?.(label)
    } catch {
      toast?.('Copy failed. Long press and copy manually.')
    }
  }

  function captureLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve('Location unavailable. Enter nearest landmark manually.')
        return
      }
      navigator.geolocation.getCurrentPosition((pos) => {
        resolve(`https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`)
      }, () => resolve('Location permission denied. Share nearest landmark manually.'), { enableHighAccuracy: true, timeout: 9000 })
    })
  }

  async function shareMedicalLocation(channel = 'sms') {
    const loc = await captureLocation()
    const contacts = getContacts()
    const first = contacts.find((item) => normalizeIndianPhone(item.phone))
    const message = `MEDICAL EMERGENCY\nMy current location: ${loc}\nPlease call me and help me reach ambulance ${emergencyNumber.ambulance} / emergency ${emergencyNumber.primary}.`
    await copy(message, 'Medical location alert copied.')

    if (!first) {
      toast?.('No saved emergency contact. Alert copied; add a contact in Safety Mode.')
      return
    }

    if (channel === 'whatsapp') {
      window.open(`https://wa.me/${normalizeIndianPhone(first.phone)}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
      toast?.('Opening WhatsApp for saved emergency contact. Press send to confirm.')
      return
    }

    window.location.href = `sms:${first.phone}?body=${encodeURIComponent(message)}`
    toast?.('Opening SMS for saved emergency contact. Press send to confirm.')
  }

  const points = flow.importantPoints || flow.checklist || []
  const medicalTarget = getContacts().find((item) => normalizeIndianPhone(item.phone))

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Link to="/safety" className="btn-soft inline-flex items-center gap-2"><ArrowLeft size={16} />Back to Safety Mode</Link>
      <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass rounded-3xl p-6">
          <span className="badge">Country context: India · Verify before production</span>
          <div className={`mt-5 h-16 w-16 rounded-3xl bg-gradient-to-br ${flow.accent}`} />
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white">{flow.title}</h1>
          <p className="mt-3 text-slate-300">{flow.summary}</p>

          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/10 p-4">
            <p className="text-sm text-red-100">{flow.callType} number</p>
            <p className="mt-1 text-4xl font-black text-white">{flow.number}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={`tel:${flow.number}`} className="btn-danger inline-flex items-center gap-2"><Phone size={18} />Call Now</a>
              <button className="btn-soft inline-flex items-center gap-2" onClick={() => copy(flow.number, 'Number copied.')}><Copy size={18} />Copy</button>
            </div>
          </div>

          {id === 'medical' && (
            <div className="mt-5 rounded-2xl border border-cyan-400/25 bg-cyan-400/10 p-4 text-sm text-cyan-100">
              <h2 className="text-lg font-black text-white">Medical location alert</h2>
              <p className="mt-2">This shows exactly who receives the location alert. Browser security does not allow silent GPS/SMS/ambulance calls; the app opens SMS/WhatsApp/dialer and the user confirms send/call.</p>
              <p className="mt-3 rounded-xl border border-cyan-300/20 bg-slate-950/70 p-3 font-bold text-cyan-50">SMS/WhatsApp target: {medicalTarget ? `${medicalTarget.name} · ${medicalTarget.phone}` : 'No saved emergency contact yet. Add one in Safety Mode first.'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-primary inline-flex items-center gap-2" onClick={() => shareMedicalLocation('sms')}><MapPin size={16} />Open SMS with location</button>
                <button className="btn-soft inline-flex items-center gap-2" onClick={() => shareMedicalLocation('whatsapp')}><MessageCircle size={16} />Open WhatsApp to contact</button>
                <a className="btn-danger inline-flex items-center gap-2" href={`tel:${emergencyNumber.ambulance}`}><Send size={16} />Open ambulance dialer {emergencyNumber.ambulance}</a>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-sm text-yellow-100">
            <b>Accuracy policy:</b> This demo uses structured emergency guidance. Real deployment must verify country, city and provider data regularly.
          </div>
        </div>

        <section className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black text-white">Important points</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {points.map((step) => (
              <div key={step} className="rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4 text-slate-200">
                {step}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

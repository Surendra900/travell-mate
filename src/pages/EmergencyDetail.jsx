import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy, MapPin, MessageCircle, Phone, Send } from 'lucide-react'
import { emergencyFlows, emergencyNumber } from '../data/emergencyData'
import { usePageMetadata } from '../hooks/usePageMetadata'

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

  usePageMetadata({
    title: flow?.title ? `${flow.title} | TravelMate Emergency Guide` : 'Emergency Guide | TravelMate',
    description: 'Emergency step-by-step assistance, official helpline dialers, and coordinate sharing.'
  })

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
    <main className="mx-auto max-w-6xl px-4 py-10 bg-[#F4F5F7] min-h-screen text-[#1F2937]">
      <Link to="/safety" className="btn-soft inline-flex items-center gap-2"><ArrowLeft size={16} />Back to Safety Mode</Link>
      <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
          <span className="badge">Country context: India · Verify before production</span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-gray-900">{flow.title}</h1>
          <p className="mt-2 text-sm text-gray-600">{flow.summary}</p>

          <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-bold text-red-800">{flow.callType} number</p>
            <p className="mt-1 text-3xl font-black text-red-900 font-mono tabular-nums">{flow.number}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={`tel:${flow.number}`} className="btn-danger inline-flex items-center gap-2"><Phone size={18} />Call Now</a>
              <button className="btn-soft inline-flex items-center gap-2" onClick={() => copy(flow.number, 'Number copied.')}><Copy size={18} />Copy</button>
            </div>
          </div>

          {id === 'medical' && (
            <div className="mt-5 rounded-md border border-gray-200 bg-gray-50 p-4 text-xs text-gray-700">
              <h2 className="text-sm font-bold text-gray-900">Medical location alert</h2>
              <p className="mt-1.5 leading-relaxed">This shows exactly who receives the location alert. Browser security does not allow silent GPS/SMS/ambulance calls; the app opens SMS/WhatsApp/dialer and the user confirms send/call.</p>
              <p className="mt-3 rounded-md border border-gray-200 bg-white p-2.5 font-bold text-gray-800">SMS/WhatsApp target: {medicalTarget ? `${medicalTarget.name} · ${medicalTarget.phone}` : 'No saved emergency contact yet. Add one in Safety Mode first.'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-primary inline-flex items-center gap-2" onClick={() => shareMedicalLocation('sms')}><MapPin size={16} />Open SMS with location</button>
                <button className="btn-soft inline-flex items-center gap-2" onClick={() => shareMedicalLocation('whatsapp')}><MessageCircle size={16} />Open WhatsApp to contact</button>
                <a className="btn-danger inline-flex items-center gap-2" href={`tel:${emergencyNumber.ambulance}`}><Send size={16} />Open ambulance dialer {emergencyNumber.ambulance}</a>
              </div>
            </div>
          )}

          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <b>Accuracy policy:</b> This demo uses structured emergency guidance. Real deployment must verify country, city and provider data regularly.
          </div>
        </div>

        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-black text-gray-900">Important points</h2>
          </div>
          <div className="mt-4 grid gap-3">
            {points.map((step) => (
              <div key={step} className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 font-medium">
                {step}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

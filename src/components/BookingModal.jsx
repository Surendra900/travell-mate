import { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  CreditCard,
  ExternalLink,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  TicketCheck,
  UserRound,
  UsersRound,
  X
} from 'lucide-react'
import { officialPortals } from '../data/transportData'
import SourceBadge from './SourceBadge'

const paymentOptions = [
  ['UPI', 'Choose a UPI app during a real provider checkout.'],
  ['Debit / credit card', 'A real provider would securely collect card details.'],
  ['Net banking', 'A real provider would redirect to the selected bank.'],
  ['Wallet', 'A real provider would show supported wallet partners.'],
  ['Pay at provider', 'Continue later on the authorized provider portal.']
]

const stepLabels = ['Journey', 'Passengers', 'Contact', 'Payment', 'Confirmation']

function selectedServiceLabel(service, transport = 'Travel') {
  const safeService = service && typeof service === 'object' ? service : {}
  return safeService.serviceName || safeService.service || safeService.name || safeService.trainName || safeService.operator || `${transport} route option`
}

function selectedServiceCode(service) {
  const safeService = service && typeof service === 'object' ? service : {}
  return safeService.code || safeService.trainNo || safeService.trainNumber || safeService.flightNumber || safeService.serviceNumber || 'Provider code unavailable'
}

function preferenceConfig(transport) {
  if (transport === 'Train') {
    return {
      label: 'Berth preference',
      options: ['No berth preference', 'Lower berth', 'Middle berth', 'Upper berth', 'Side lower', 'Side upper']
    }
  }

  if (transport === 'Flight') {
    return {
      label: 'Seat preference',
      options: ['No seat preference', 'Window seat', 'Aisle seat', 'Middle seat']
    }
  }

  return {
    label: 'Seat preference',
    options: ['No seat preference', 'Window seat', 'Aisle seat', 'Lower deck', 'Upper deck']
  }
}

function passengerTemplate(index, transport) {
  const preference = preferenceConfig(transport)

  return {
    fullName: '',
    age: '',
    gender: '',
    nationality: 'Indian',
    seatPreference: preference.options[0],
    mealPreference: 'No meal preference',
    idType: 'Government photo ID',
    specialAssistance: '',
    label: `Passenger ${index + 1}`
  }
}

function createPassengers(count, transport) {
  return Array.from({ length: count }, (_, index) => passengerTemplate(index, transport))
}

function demoReference() {
  const date = new Date()
  const day = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('')
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `TM-DEMO-${day}-${random}`
}

function numericFare(service, plan) {
  const candidate = service?.price ?? service?.fare ?? service?.amount ?? plan?.budget
  const normalized = Number(String(candidate ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(normalized) && normalized > 0 ? normalized : null
}

export default function BookingModal({ open, onClose, plan = {}, mode = 'normal', onSaved }) {
  const transport = plan.transportMode || 'Train'
  const portal = officialPortals[transport] || officialPortals.Train
  const service = plan.selectedService || null
  const sourceBadge = service?.sourceBadge || plan.sourceBadge || 'Planning result'
  const passengerCount = Math.max(1, Math.min(6, Number(plan.passengers || 1)))
  const farePerPassenger = numericFare(service, plan)
  const estimatedTotal = farePerPassenger ? Math.round(farePerPassenger * passengerCount) : null
  const preference = preferenceConfig(transport)

  const [step, setStep] = useState(0)
  const [passengers, setPassengers] = useState(() => createPassengers(passengerCount, transport))
  const [contact, setContact] = useState({
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    emergencyName: '',
    emergencyPhone: '',
    updates: true,
    insurance: false
  })
  const [paymentType, setPaymentType] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [reference, setReference] = useState('')
  const [copyNotice, setCopyNotice] = useState('')

  const serviceIdentity = `${selectedServiceCode(service)}-${selectedServiceLabel(service, transport)}`

  useEffect(() => {
    if (!open) return
    setStep(0)
    setPassengers(createPassengers(passengerCount, transport))
    setContact({
      mobile: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      emergencyName: '',
      emergencyPhone: '',
      updates: true,
      insurance: false
    })
    setPaymentType('')
    setConsent(false)
    setError('')
    setReference('')
    setCopyNotice('')
  }, [open, passengerCount, transport, serviceIdentity])

  const bookingSummary = useMemo(() => {
    const lines = [
      'TRAVELMATE DEMO BOOKING — NOT A REAL TICKET',
      `Demo reference: ${reference || 'Generated after confirmation'}`,
      `Route: ${plan.from || 'Origin'} → ${plan.to || 'Destination'}`,
      `Date: ${plan.date || 'Not selected'}`,
      `Transport: ${transport}`,
      `Class/cabin: ${plan.classType || 'Not selected'}`,
      `Service: ${selectedServiceLabel(service, transport)}`,
      `Service code: ${selectedServiceCode(service)}`,
      `Passengers: ${passengers.map((item) => item.fullName || item.label).join(', ')}`,
      `Contact: ${contact.mobile || 'Not entered'} · ${contact.email || 'Not entered'}`,
      `Payment type selected: ${paymentType || 'Not selected'}`,
      estimatedTotal ? `Illustrative total: ₹${estimatedTotal}` : 'Illustrative total: verify with provider',
      'No money was charged. No seat, PNR, ticket, fare, or booking was confirmed.',
      'Licensed and authorized direct booking is coming soon. Complete real booking on the official provider portal.'
    ]
    return lines.join('\n')
  }, [contact.email, contact.mobile, estimatedTotal, passengers, paymentType, plan.classType, plan.date, plan.from, plan.to, reference, service, transport])

  if (!open) return null

  function updatePassenger(index, field, value) {
    setPassengers((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  function validateCurrentStep() {
    if (step === 1) {
      const incomplete = passengers.find((item) => !item.fullName.trim() || !item.age || !item.gender || !item.nationality.trim() || !item.idType)
      if (incomplete) return 'Complete the required passenger name, age, gender, nationality, and ID-type fields.'
      if (passengers.some((item) => Number(item.age) < 1 || Number(item.age) > 120)) return 'Passenger age must be between 1 and 120.'
    }

    if (step === 2) {
      if (!/^\d{10}$/.test(contact.mobile)) return 'Enter a valid 10-digit mobile number.'
      if (!/^\S+@\S+\.\S+$/.test(contact.email)) return 'Enter a valid email address.'
      if (contact.pincode && !/^\d{6}$/.test(contact.pincode)) return 'Enter a valid 6-digit PIN code or leave it blank.'
      if (contact.emergencyPhone && !/^\d{10}$/.test(contact.emergencyPhone)) return 'Emergency-contact phone must contain 10 digits or remain blank.'
    }

    if (step === 3) {
      if (!paymentType) return 'Choose a payment type for the demo.'
      if (!consent) return 'Confirm that you understand this is only a demo booking and no payment or ticket will be created.'
    }

    return ''
  }

  function goNext() {
    const validationError = validateCurrentStep()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setStep((current) => Math.min(4, current + 1))
  }

  function goBack() {
    setError('')
    setStep((current) => Math.max(0, current - 1))
  }

  function confirmDemoBooking() {
    const validationError = validateCurrentStep()
    if (validationError) {
      setError(validationError)
      return
    }

    const nextReference = demoReference()
    const returnedPnr = plan.booking?.pnrNumber || plan.booking?.pnr || plan.ticket?.pnrNumber || plan.ticket?.pnr || service?.pnrNumber || service?.pnr || ''
    const bookingStatus = returnedPnr
      ? 'Authorized booking PNR received'
      : 'Demo completed — no real ticket or PNR issued'

    setReference(nextReference)
    setError('')
    setStep(4)

    onSaved?.({
      ...plan,
      selectedService: service,
      bookingReference: nextReference,
      bookingStatus,
      booking: {
        ...(plan.booking || {}),
        reference: nextReference,
        status: returnedPnr ? 'pnr-received' : 'demo-completed',
        pnrNumber: returnedPnr
      }
    })
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(bookingSummary)
      setCopyNotice('Demo booking summary copied.')
    } catch {
      setCopyNotice('Clipboard access was blocked. Use the visible summary instead.')
    }
  }

  function resetDemo() {
    setStep(0)
    setPassengers(createPassengers(passengerCount, transport))
    setContact({ mobile: '', email: '', address: '', city: '', state: '', pincode: '', emergencyName: '', emergencyPhone: '', updates: true, insurance: false })
    setPaymentType('')
    setConsent(false)
    setReference('')
    setError('')
    setCopyNotice('')
  }

  function openPortal() {
    window.open(portal, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="modal-backdrop fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-slate-950/85 p-2 backdrop-blur sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="demo-booking-title">
      <div className="modal-card demo-booking-card my-2 w-full max-w-5xl rounded-3xl border border-cyan-400/25 bg-slate-950 p-4 shadow-glow sm:my-8 sm:p-6">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="badge border-orange-300/40 bg-orange-300/10 text-orange-100"><ShieldAlert size={14} /> Demo only · no payment · no real ticket</p>
            <h2 id="demo-booking-title" className="mt-3 text-2xl font-black text-white sm:text-3xl">TravelMate demo booking</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">This walkthrough collects the normal information a booking app would request, but it never sends payment details, reserves a seat, creates a PNR, or issues a ticket. Licensed and authorized direct booking is coming soon.</p>
          </div>
          <button className="dialog-close-button" type="button" onClick={onClose} aria-label="Close demo booking" title="Close demo booking"><X size={22} /></button>
        </header>

        <div className="demo-stepper mt-5" aria-label="Demo booking progress">
          {stepLabels.map((label, index) => (
            <div key={label} className={`demo-step ${index === step ? 'is-active' : ''} ${index < step ? 'is-complete' : ''}`}>
              <span>{index < step ? <CheckCircle2 size={15} /> : index + 1}</span>
              <b>{label}</b>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-2xl border border-orange-300/30 bg-orange-300/10 p-4 text-sm font-bold text-orange-50">
          <ShieldCheck className="mr-2 inline" size={17} /> All information remains only in this open demo form and is cleared when the flow is restarted or the page is reloaded. Do not enter real card, UPI PIN, bank password, OTP, Aadhaar number, passport number, or other secret credentials.
        </div>

        {step === 0 && (
          <section className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Journey selected</p>
                  <h3 className="mt-2 text-2xl font-black text-white">{plan.from || 'Origin'} → {plan.to || 'Destination'}</h3>
                  <p className="mt-2 text-sm text-slate-300">{plan.date || 'Date not selected'} · {transport} · {plan.classType || 'Class not selected'} · {passengerCount} passenger(s)</p>
                </div>
                <SourceBadge label={sourceBadge} />
              </div>

              <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm text-slate-300">
                <h4 className="font-black text-white">{selectedServiceLabel(service, transport)}</h4>
                <p className="mt-1">Code: {selectedServiceCode(service)} · Provider: {service?.provider || 'Verify with authorized provider'}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <p><b className="text-cyan-100">Departure:</b> {service?.departure || service?.depart || 'Verify with provider'}</p>
                  <p><b className="text-cyan-100">Arrival:</b> {service?.arrival || service?.arrive || 'Verify with provider'}</p>
                  <p><b className="text-cyan-100">Status:</b> {service?.status || service?.availability || 'Provider verification required'}</p>
                  <p><b className="text-cyan-100">Illustrative total:</b> {estimatedTotal ? `₹${estimatedTotal}` : 'Verify with provider'}</p>
                </div>
              </div>
            </div>

            <aside className="rounded-2xl border border-yellow-300/25 bg-yellow-300/10 p-4 text-sm text-yellow-50">
              <TicketCheck size={24} />
              <h3 className="mt-3 text-xl font-black">What this demo will ask</h3>
              <ul className="mt-3 space-y-2 text-yellow-50/90">
                <li>• Passenger names, ages, gender, ID type, and seat preferences</li>
                <li>• Mobile, email, address, and emergency-contact details</li>
                <li>• Optional updates, assistance, meals, and insurance preference</li>
                <li>• Payment type only — never payment credentials</li>
                <li>• Final demo confirmation with a non-ticket reference</li>
              </ul>
            </aside>
          </section>
        )}

        {step === 1 && (
          <section className="mt-5">
            <div className="flex items-center gap-3">
              <UsersRound className="text-cyan-200" size={24} />
              <div>
                <h3 className="text-xl font-black text-white">Passenger details</h3>
                <p className="text-sm text-slate-400">Use sample information for this demo. No ID number is requested.</p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {passengers.map((passenger, index) => (
                <article key={passenger.label} className="rounded-2xl border border-slate-700 bg-slate-900/65 p-4">
                  <h4 className="flex items-center gap-2 font-black text-white"><UserRound size={17} /> Passenger {index + 1}</h4>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">Full name *</span><input className="input" value={passenger.fullName} onChange={(event) => updatePassenger(index, 'fullName', event.target.value)} placeholder="Demo passenger name" /></label>
                    <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">Age *</span><input className="input" inputMode="numeric" type="number" min="1" max="120" value={passenger.age} onChange={(event) => updatePassenger(index, 'age', event.target.value)} placeholder="Age" /></label>
                    <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">Gender *</span><select className="input" value={passenger.gender} onChange={(event) => updatePassenger(index, 'gender', event.target.value)}><option value="">Select</option><option>Female</option><option>Male</option><option>Transgender</option><option>Prefer not to say</option></select></label>
                    <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">Nationality *</span><input className="input" value={passenger.nationality} onChange={(event) => updatePassenger(index, 'nationality', event.target.value)} /></label>
                    <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">ID type *</span><select className="input" value={passenger.idType} onChange={(event) => updatePassenger(index, 'idType', event.target.value)}><option>Government photo ID</option><option>Aadhaar / national ID</option><option>Passport</option><option>Driving licence</option><option>Student / senior-citizen ID</option></select></label>
                    <label className="text-sm font-bold text-cyan-100">
                      <span className="mb-2 block">{preference.label}</span>
                      <select className="input" value={passenger.seatPreference} onChange={(event) => updatePassenger(index, 'seatPreference', event.target.value)}>
                        {preference.options.map((option) => <option key={option}>{option}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">Meal preference</span><select className="input" value={passenger.mealPreference} onChange={(event) => updatePassenger(index, 'mealPreference', event.target.value)}><option>No meal preference</option><option>Vegetarian</option><option>Non-vegetarian</option><option>Vegan</option><option>Jain meal</option><option>Child meal</option></select></label>
                    <label className="text-sm font-bold text-cyan-100 sm:col-span-2"><span className="mb-2 block">Special assistance <span className="text-slate-400">(optional)</span></span><input className="input" value={passenger.specialAssistance} onChange={(event) => updatePassenger(index, 'specialAssistance', event.target.value)} placeholder="Wheelchair, medical assistance, travelling with infant, etc." /></label>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="mt-5">
            <h3 className="text-xl font-black text-white">Contact and traveller preferences</h3>
            <p className="mt-1 text-sm text-slate-400">A real provider uses these details for booking updates. This demo does not transmit them.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">Mobile number *</span><input className="input" inputMode="numeric" value={contact.mobile} onChange={(event) => setContact({ ...contact, mobile: event.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10-digit mobile" /></label>
              <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">Email address *</span><input className="input" type="email" value={contact.email} onChange={(event) => setContact({ ...contact, email: event.target.value })} placeholder="demo@example.com" /></label>
              <label className="text-sm font-bold text-cyan-100 sm:col-span-2"><span className="mb-2 block">Address</span><input className="input" value={contact.address} onChange={(event) => setContact({ ...contact, address: event.target.value })} placeholder="House / street / area" /></label>
              <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">City</span><input className="input" value={contact.city} onChange={(event) => setContact({ ...contact, city: event.target.value })} /></label>
              <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">State</span><input className="input" value={contact.state} onChange={(event) => setContact({ ...contact, state: event.target.value })} /></label>
              <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">PIN code</span><input className="input" inputMode="numeric" value={contact.pincode} onChange={(event) => setContact({ ...contact, pincode: event.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="6 digits" /></label>
              <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">Emergency-contact name</span><input className="input" value={contact.emergencyName} onChange={(event) => setContact({ ...contact, emergencyName: event.target.value })} /></label>
              <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">Emergency-contact phone</span><input className="input" inputMode="numeric" value={contact.emergencyPhone} onChange={(event) => setContact({ ...contact, emergencyPhone: event.target.value.replace(/\D/g, '').slice(0, 10) })} placeholder="10 digits" /></label>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300"><input className="mt-1" type="checkbox" checked={contact.updates} onChange={(event) => setContact({ ...contact, updates: event.target.checked })} /><span><b className="text-white">Journey updates</b><br />Demo preference for SMS/email alerts.</span></label>
              <label className="flex items-start gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300"><input className="mt-1" type="checkbox" checked={contact.insurance} onChange={(event) => setContact({ ...contact, insurance: event.target.checked })} /><span><b className="text-white">Travel insurance</b><br />Demo preference only; no policy is purchased.</span></label>
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="mt-5">
            <div className="flex items-center gap-3"><CreditCard className="text-cyan-200" size={24} /><div><h3 className="text-xl font-black text-white">Choose payment type</h3><p className="text-sm text-slate-400">Only the payment category is requested. Never enter payment credentials in this demo.</p></div></div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {paymentOptions.map(([name, description]) => (
                <label key={name} className={`demo-payment-option ${paymentType === name ? 'is-selected' : ''}`}>
                  <input type="radio" name="paymentType" value={name} checked={paymentType === name} onChange={(event) => setPaymentType(event.target.value)} />
                  <span><b>{name}</b><small>{description}</small></span>
                </label>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-100">
              No amount will be charged. TravelMate will not request a card number, CVV, expiry date, UPI ID, UPI PIN, OTP, bank login, or wallet password.
            </div>

            <label className="mt-4 flex items-start gap-3 rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-4 text-sm text-cyan-50">
              <input className="mt-1" type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
              <span><b>I understand this is a demo booking.</b><br />No real booking, seat, fare, payment, PNR, ticket, refund right, or travel entitlement will be created. Licensed direct booking is coming soon.</span>
            </label>
          </section>
        )}

        {step === 4 && (
          <section className="mt-5 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300"><CheckCircle2 size={38} /></div>
            <p className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-emerald-200">Demo confirmation only</p>
            <h3 className="mt-2 text-3xl font-black text-white">Demo booking completed</h3>
            <p className="mx-auto mt-3 max-w-2xl text-slate-300">The walkthrough is complete. Nothing was booked and no money was charged. Use the authorized provider portal for a real reservation.</p>

            <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-5 text-left">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-200">Non-ticket demo reference</p>
                  <p className="mt-1 break-all text-xl font-black text-white">{reference}</p>
                </div>
                <SourceBadge label="Demo only" />
              </div>
              <div className="mt-4 grid gap-3 text-sm text-slate-200 sm:grid-cols-2">
                <p><b className="text-white">Route:</b> {plan.from || 'Origin'} → {plan.to || 'Destination'}</p>
                <p><b className="text-white">Date:</b> {plan.date || 'Not selected'}</p>
                <p><b className="text-white">Service:</b> {selectedServiceLabel(service, transport)}</p>
                <p><b className="text-white">Passengers:</b> {passengerCount}</p>
                <p><b className="text-white">Payment type:</b> {paymentType}</p>
                <p><b className="text-white">PNR status:</b> Demo only — no PNR issued</p>
                <p><b className="text-white">Illustrative total:</b> {estimatedTotal ? `₹${estimatedTotal}` : 'Verify with provider'}</p>
              </div>
            </div>

            <div className="mx-auto mt-5 max-w-3xl rounded-2xl border border-orange-300/30 bg-orange-300/10 p-4 text-sm font-bold text-orange-50">
              This reference is not a PNR or ticket number. Direct booking requires commercial licences, provider authorization, secure payment processing, settlement, cancellation/refund handling, and customer support. That integration is coming soon.
            </div>

            {copyNotice && <p className="mx-auto mt-4 max-w-3xl rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-3 text-sm font-bold text-cyan-50" role="status">{copyNotice}</p>}
          </section>
        )}

        {error && <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm font-bold text-red-100" role="alert">{error}</p>}

        <footer className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-800 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            {step > 0 && step < 4 && <button className="btn-soft inline-flex items-center justify-center gap-2" type="button" onClick={goBack}><ChevronLeft size={17} />Back</button>}
            {step === 4 && <button className="btn-soft inline-flex items-center justify-center gap-2" type="button" onClick={resetDemo}><RotateCcw size={17} />Start another demo</button>}
            <button className="btn-soft" type="button" onClick={onClose}>{step === 4 ? 'Close' : 'Cancel demo'}</button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {step < 3 && <button className="btn-primary inline-flex items-center justify-center gap-2" type="button" onClick={goNext}>Continue <ChevronRight size={17} /></button>}
            {step === 3 && <button className="btn-primary inline-flex items-center justify-center gap-2" type="button" onClick={confirmDemoBooking}><TicketCheck size={18} />Confirm demo booking — no charge</button>}
            {step === 4 && <>
              <button className="btn-soft inline-flex items-center justify-center gap-2" type="button" onClick={copySummary}><ClipboardCopy size={17} />Copy demo summary</button>
              <button className="btn-primary inline-flex items-center justify-center gap-2" type="button" onClick={openPortal}><ExternalLink size={17} />Open official provider for real booking</button>
            </>}
          </div>
        </footer>
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { HelpCircle, Info, X } from 'lucide-react'

export const GLOSSARY_TERMS = {
  WL: {
    term: 'WL',
    fullName: 'Waitlist',
    short: 'No seat allocated yet; moves up on cancellations.',
    definition: 'Waitlist tickets permit travel only if cancellations move your status to RAC or Confirmed before charting. E-tickets remaining in full WL after charting are automatically cancelled and refunded by IRCTC.',
    officialRule: 'IRCTC Rule: Fully waitlisted e-ticket passengers are not permitted to board trains.'
  },
  RAC: {
    term: 'RAC',
    fullName: 'Reservation Against Cancellation',
    short: 'Guaranteed seat / boarding right; sitting berth shared.',
    definition: 'RAC grants a legal right to board the train with a guaranteed sitting seat (typically sharing a Side Lower berth). If passengers with confirmed berths cancel before or during chart preparation, RAC tickets get upgraded to full sleeping berths.',
    officialRule: 'Indian Railways Rule: RAC passengers have boarding rights. Upgraded to full berth on berth vacancy.'
  },
  PNR: {
    term: 'PNR',
    fullName: 'Passenger Name Record',
    short: '10-digit unique booking reservation identifier.',
    definition: 'A 10-digit unique code issued by the Indian Railways Passenger Reservation System (PRS) containing your train number, date of travel, passenger details, booking quota, coach and berth allocation.',
    officialRule: 'Verification: Check status on official Indian Railways portal (indianrail.gov.in) or NTES.'
  },
  Tatkal: {
    term: 'Tatkal',
    fullName: 'Emergency Booking Quota',
    short: 'Short-notice quota opening at 10 AM (AC) & 11 AM (Non-AC) IST.',
    definition: 'Tatkal is a premium reservation quota released by Indian Railways one day prior to train journey date from origin. AC classes (1A, 2A, 3A, CC, 3E) open strictly at 10:00 AM IST; Non-AC classes (SL, 2S) open at 11:00 AM IST. Senior citizen and other concessions are not applicable.',
    officialRule: 'Booking Rules: Maximum 4 passengers per PNR. No refund on cancellation of confirmed Tatkal tickets.'
  },
  Junction: {
    term: 'Junction',
    fullName: 'Railway Hub Interchange',
    short: 'High-connectivity hub where 2+ rail corridors meet.',
    definition: 'A major railway junction where multiple regional and trunk rail lines converge (e.g. Pt. Deen Dayal Upadhyaya / Mughalsarai, Itarsi, Katpadi). TravelMate uses high-frequency junctions as transfer hubs to bypass point-to-point waitlist walls with verified split routes.',
    officialRule: 'Transfer Tip: Maintain at least 45 minutes Minimum Connection Time (MCT) between trains.'
  }
}

export default function GlossaryTooltip({ term = 'WL', children, className = '' }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const data = GLOSSARY_TERMS[term] || {
    term,
    fullName: term,
    short: 'Indian Railways Transit Term',
    definition: 'Refer to official Indian Railways passenger guidelines.',
    officialRule: 'indianrail.gov.in'
  }

  useEffect(() => {
    if (!open) return undefined
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', handleOutside)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handleOutside)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <span ref={containerRef} className={`relative inline-flex items-center align-baseline ${className}`}>
      <button
        type="button"
        data-testid={`glossary-tooltip-${term}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen((v) => !v)
          }
        }}
        aria-expanded={open}
        aria-label={`Glossary definition for ${data.fullName} (${data.term})`}
        className="inline-flex items-center gap-0.5 text-inherit hover:text-sky-700 underline decoration-dotted decoration-sky-400 underline-offset-2 transition cursor-help focus:outline-none focus:ring-2 focus:ring-sky-500 rounded"
      >
        {children || <span className="font-bold">{data.term}</span>}
        <HelpCircle size={11} className="inline opacity-60 text-sky-600 ml-0.5" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="tooltip"
          data-testid="glossary-popover"
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 sm:w-80 p-3.5 rounded-2xl bg-white text-slate-900 border border-sky-200 shadow-xl shadow-slate-900/10 text-xs animate-in fade-in zoom-in-95"
        >
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-700">
                Transit Glossary
              </span>
              <h4 className="font-black text-slate-950 text-sm">
                {data.fullName} <span className="text-slate-400 font-medium">({data.term})</span>
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Close glossary definition"
            >
              <X size={13} />
            </button>
          </div>

          <p className="mt-2 text-slate-600 leading-relaxed font-normal">
            {data.definition}
          </p>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="font-medium">{data.officialRule}</span>
          </div>

          {/* Tooltip caret */}
          <div className="absolute left-1/2 -translate-x-1/2 top-full w-2.5 h-2.5 bg-white border-b border-r border-sky-200 rotate-45 -mt-1.5" />
        </div>
      )}
    </span>
  )
}

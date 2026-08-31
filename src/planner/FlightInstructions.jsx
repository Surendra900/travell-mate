import { Luggage, Plane } from 'lucide-react'
import { airlineRules } from '../data/transportData'

export default function FlightInstructions({ airline = 'All' }) {
  const rules = airlineRules[airline] || airlineRules.Other

  return (
    <div className="rounded-3xl border border-sky-400/25 bg-sky-400/10 p-5 text-sm text-sky-100">
      <div className="flex items-center gap-2">
        <Plane size={20} />
        <h3 className="text-lg font-black">Flight-specific instructions</h3>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-sky-400/20 bg-slate-950/60 p-4">
          <p className="font-black"><Luggage className="mr-1 inline" size={16} />Cabin baggage</p>
          <p className="mt-1 text-sky-100/85">{rules.cabin}</p>
        </div>
        <div className="rounded-2xl border border-sky-400/20 bg-slate-950/60 p-4">
          <p className="font-black">Check-in baggage</p>
          <p className="mt-1 text-sky-100/85">{rules.checkIn}</p>
        </div>
      </div>
      <ul className="mt-3 list-disc space-y-1 pl-5">
        {rules.instructions.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <p className="mt-3 text-xs text-sky-200/70">Baggage kilograms vary by airline, route, cabin class and fare. This guide shows instructions, not legal guarantee.</p>
    </div>
  )
}

import { Luggage, Plane } from 'lucide-react'
import { airlineRules } from '../data/transportData'

export default function FlightInstructions({ airline = 'All' }) {
  const rules = airlineRules[airline] || airlineRules.Other

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-gray-700 shadow-xs">
      <div className="flex items-center gap-2 text-gray-900">
        <Plane size={20} className="text-[#15803D]" />
        <h3 className="text-lg font-bold">Flight-specific instructions</h3>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3.5">
          <p className="font-bold text-gray-900"><Luggage className="mr-1 inline text-gray-600" size={16} />Cabin baggage</p>
          <p className="mt-1 text-xs text-gray-600">{rules.cabin}</p>
        </div>
        <div className="rounded-md border border-gray-200 bg-gray-50 p-3.5">
          <p className="font-bold text-gray-900">Check-in baggage</p>
          <p className="mt-1 text-xs text-gray-600">{rules.checkIn}</p>
        </div>
      </div>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-gray-600">
        {rules.instructions.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <p className="mt-3 text-[11px] text-gray-500">Baggage kilograms vary by airline, route, cabin class and fare. This guide shows instructions, not legal guarantee.</p>
    </div>
  )
}

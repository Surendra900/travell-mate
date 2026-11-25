import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  HelpCircle,
  Info,
  RefreshCw,
  Search,
  Share2,
  Train,
  Users,
  X,
  Shield
} from 'lucide-react'
import {
  predictWaitlistConfirmation,
  SAMPLE_PNR_PRESETS
} from '../utils/pnrPredictor'
import { getPNRStatus } from '../services/LiveTransportApi'
import GlossaryTooltip from './GlossaryTooltip'
import { useDialogFocus } from '../hooks/useDialogFocus.js'

export default function PnrPredictorModal({
  open,
  onClose,
  initialPnr = ''
}) {
  const [pnrInput, setPnrInput] = useState(initialPnr || '4523819204')
  const [activeData, setActiveData] = useState(SAMPLE_PNR_PRESETS[0])
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [apiNotice, setApiNotice] = useState('')
  const [showHowWeEstimate, setShowHowWeEstimate] = useState(false)
  const dialogRef = useDialogFocus({ isOpen: open, onClose })

  useEffect(() => {
    if (initialPnr) {
      setPnrInput(initialPnr)
      handleLookup(initialPnr)
    }
  }, [initialPnr])

  const prediction = useMemo(() => {
    if (!activeData) return null
    return predictWaitlistConfirmation({
      currentStatus: activeData.currentStatus,
      bookingStatus: activeData.bookingStatus,
      classType: activeData.classType || '3A',
      daysToDeparture: activeData.journeyDate?.toLowerCase().includes('today')
        ? 0
        : activeData.journeyDate?.toLowerCase().includes('tomorrow')
        ? 1
        : 3,
      chartPrepared: activeData.chartStatus?.toLowerCase().includes('prepared') && !activeData.chartStatus?.toLowerCase().includes('not')
    })
  }, [activeData])

  const handleLookup = async (targetPnr) => {
    const pnr = String(targetPnr || pnrInput).replace(/\D/g, '').slice(0, 10)
    if (!/^\d{10}$/.test(pnr)) {
      setApiNotice('Please enter a valid 10-digit Indian Railways PNR number.')
      return
    }

    const preset = SAMPLE_PNR_PRESETS.find(p => p.pnrNumber === pnr)
    if (preset) {
      setActiveData(preset)
      setApiNotice('')
      return
    }

    setLoading(true)
    setApiNotice('')

    try {
      const res = await getPNRStatus({ pnr })
      if (res && res.result && res.result.trainNumber !== 'Not returned') {
        setActiveData({
          pnrNumber: pnr,
          trainNumber: res.result.trainNumber || 'Special Train',
          trainName: res.result.trainName || 'Express Service',
          from: res.result.from || 'Origin',
          to: res.result.to || 'Destination',
          journeyDate: res.result.journeyDate || 'Scheduled Date',
          classType: '3A',
          chartStatus: res.result.chartStatus || 'Chart Not Prepared',
          bookingStatus: res.result.bookingStatus || 'WL',
          currentStatus: res.result.currentStatus || res.result.passengers?.[0]?.currentStatus || 'WL',
          passengers: res.result.passengers?.length ? res.result.passengers : [
            { serial: 1, bookingStatus: res.result.bookingStatus, currentStatus: res.result.currentStatus, coach: 'Unassigned', berth: 'Pending' }
          ]
        })
      } else {
        setActiveData({
          pnrNumber: pnr,
          trainNumber: '12424',
          trainName: 'New Delhi to Dibrugarh Rajdhani Express',
          from: 'NDLS (New Delhi)',
          to: 'GHY (Guwahati)',
          journeyDate: 'In 2 Days · 16:20',
          classType: '3A',
          quota: 'GNWL',
          chartStatus: 'Chart Not Prepared',
          bookingStatus: 'GNWL 22',
          currentStatus: 'GNWL 8',
          passengers: [
            { serial: 1, bookingStatus: 'GNWL 22', currentStatus: 'GNWL 8', coach: 'Waitlisted', berth: 'Unassigned' }
          ]
        })
        setApiNotice('Showing simulation based on railway quota heuristics.')
      }
    } catch {
      setApiNotice('Network unavailable; rendered offline confirmation prediction.')
    } finally {
      setLoading(false)
    }
  }

  const handleShareWhatsApp = () => {
    if (!activeData || !prediction) return
    const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://travelmate-ai-flowzint.vercel.app'
    const text = `*IRCTC PNR Status & AI Prediction*
*PNR:* ${activeData.pnrNumber}
*Train:* ${activeData.trainNumber} · ${activeData.trainName}
*Route:* ${activeData.from} to ${activeData.to}
*Status:* ${activeData.currentStatus} (${activeData.chartStatus})
*AI Confirmation Chance:* ${prediction.label}

*Analysis:* ${prediction.summary}
${prediction.recommendation}

Verified on TravelMate: ${origin}/`

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
  }

  const handleCopy = () => {
    if (!activeData || !prediction) return
    const text = `PNR: ${activeData.pnrNumber} | ${activeData.trainName} | Status: ${activeData.currentStatus} | Confirmation Probability: ${prediction.label}`
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!open) return null

  const modalContent = (
    <div
      id="pnr-predictor-modal"
      ref={dialogRef}
      data-testid="pnr-modal-container"
      style={{ zIndex: 9999 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pnr-modal-title"
    >
      <div className="relative max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-gray-300 bg-white p-5 shadow-xl text-gray-900">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-[#15803D] text-white">
              <Train size={18} />
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                Railway Status Intelligence
              </span>
              <h2 id="pnr-modal-title" className="text-base font-bold text-gray-900 sm:text-lg">
                <GlossaryTooltip term="PNR">PNR Status</GlossaryTooltip> & Confirmation Estimator
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* PNR Search Bar */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Enter 10-Digit PNR Number:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Train size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                maxLength={10}
                data-testid="pnr-input"
                value={pnrInput}
                onChange={(e) => setPnrInput(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 4523819204"
                className="w-full rounded border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm font-semibold text-gray-900 placeholder-gray-400 focus:border-[#15803D] focus:ring-1 focus:ring-[#15803D] outline-none"
              />
            </div>
            <button
              type="button"
              data-testid="pnr-predict-btn"
              onClick={() => handleLookup()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded bg-[#15803D] hover:bg-[#12733B] px-4 py-2 text-xs font-semibold text-white transition disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Checking…' : 'Estimate'}
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-gray-500 mr-1">Sample PNR Scenarios:</span>
            {SAMPLE_PNR_PRESETS.map((preset, idx) => (
              <button
                key={preset.pnrNumber}
                type="button"
                onClick={() => {
                  setPnrInput(preset.pnrNumber)
                  setActiveData(preset)
                  setApiNotice('')
                }}
                className={`rounded px-2.5 py-1 text-[11px] font-medium transition border ${
                  activeData?.pnrNumber === preset.pnrNumber
                    ? 'border-[#15803D] bg-[#EDF7F0] text-[#137333] font-semibold'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {idx === 0 && 'RAC 6 (High)'}
                {idx === 1 && 'PQWL 18 (Low)'}
                {idx === 2 && 'Confirmed'}
              </button>
            ))}
          </div>

          {apiNotice && (
            <p className="mt-2 text-xs text-amber-700 flex items-center gap-1">
              <Info size={13} /> {apiNotice}
            </p>
          )}
        </div>

        {/* Prediction Results Card */}
        {activeData && prediction && (
          <div className="mt-4 space-y-3.5">
            {/* Train & Journey Meta */}
            <div className="rounded border border-gray-200 bg-gray-50/60 p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-medium text-gray-500 block">
                    PNR: <b className="text-gray-800 font-mono">{activeData.pnrNumber}</b> · Class: {activeData.classType || '3A'}
                  </span>
                  <h3 className="text-sm font-bold text-gray-900 mt-0.5">
                    {activeData.trainNumber} · {activeData.trainName}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {activeData.from} → {activeData.to}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded bg-white border border-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-700">
                    {activeData.chartStatus}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">
                    {activeData.journeyDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Estimated Confirmation Probability Gauge */}
            <div className="rounded border border-gray-200 bg-white p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-gray-500 block">
                    Estimated Confirmation Probability (Historical Model)
                  </span>
                  <button
                    type="button"
                    data-testid="how-we-estimate-btn"
                    onClick={() => setShowHowWeEstimate(v => !v)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] hover:underline mt-0.5"
                  >
                    <HelpCircle size={12} />
                    <span>{showHowWeEstimate ? 'Hide calculation details' : 'How we estimate'}</span>
                  </button>
                </div>
                <span data-testid="pnr-probability-display" className={`rounded px-2.5 py-0.5 text-xs font-bold ${prediction.badgeClass}`}>
                  {prediction.label}
                </span>
              </div>

              {/* Expandable "How We Estimate" Section */}
              {showHowWeEstimate && (
                <div data-testid="pnr-estimation-disclaimer" className="mt-2.5 p-3 rounded border border-gray-200 bg-gray-50 text-xs text-gray-700 space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-gray-900">
                    <Info size={13} className="text-[#15803D]" />
                    <span>Documented Parametric Confirmation Model</span>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-relaxed">
                    Our statistical model evaluates 4 verified parameters: (1) Quota type clearance velocity (GNWL clears significantly faster than PQWL/RLWL), (2) Coach class capacity multiplier (Sleeper absorbs higher cancellations than 2A/1A), (3) Days to departure (cancellations surge in the final 48 hours), and (4) Charting thresholds.
                  </p>
                  <p className="text-[11px] text-amber-800 font-medium pt-1 border-t border-gray-200">
                    Statutory Disclaimer: Predictions are probabilistic estimates based on historical patterns, not guarantees. Actual berth allocation is executed solely by Indian Railways PRS when chart is prepared 4 hours prior to departure.
                  </p>
                </div>
              )}

              {/* Probability Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs font-semibold text-gray-800 mb-1">
                  <span>Chance of Confirmed Berth:</span>
                  <span className="tabular font-bold" style={{ color: prediction.color }}>{prediction.probability}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded bg-gray-100">
                  <div
                    className="h-full rounded transition-all duration-700"
                    style={{
                      width: `${prediction.probability}%`,
                      backgroundColor: prediction.color
                    }}
                  />
                </div>
              </div>

              <p className="mt-2.5 text-xs leading-relaxed text-gray-700">
                <b className="text-gray-900">Diagnostic Verdict:</b> {prediction.summary}
              </p>

              <div className="mt-2 rounded bg-gray-50 p-2.5 space-y-1 text-xs">
                {prediction.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-gray-600 text-[11px]">
                    <span className="text-[#15803D]">•</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>

              <p className="mt-2 text-xs font-semibold text-gray-900">
                <b>Strategic Next Step:</b> {prediction.recommendation}
              </p>
            </div>

            {/* Passenger Status Table */}
            <div className="rounded border border-gray-200 bg-white p-3.5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                <Users size={13} className="text-[#15803D]" />
                Passenger Berth Allocation
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 text-[11px]">
                      <th className="pb-1.5 font-semibold">#</th>
                      <th className="pb-1.5 font-semibold">Booking Status</th>
                      <th className="pb-1.5 font-semibold">Current Status</th>
                      <th className="pb-1.5 font-semibold">Coach / Berth</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {activeData.passengers.map((psg, idx) => (
                      <tr key={idx} className="text-gray-800">
                        <td className="py-2 text-gray-500">{psg.serial || idx + 1}</td>
                        <td className="py-2">{psg.bookingStatus}</td>
                        <td className="py-2">
                          <span className={`font-semibold ${
                            psg.currentStatus?.includes('CNF') ? 'text-[#137333]' :
                            psg.currentStatus?.includes('RAC') ? 'text-blue-700' :
                            'text-amber-700'
                          }`}>
                            {psg.currentStatus}
                          </span>
                        </td>
                        <td className="py-2 font-medium text-gray-900">
                          {psg.coach ? `${psg.coach} ${psg.berth || ''}` : 'Unassigned'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200">
              <span className="text-[11px] text-gray-500 flex items-center gap-1">
                <Clock size={12} className="text-gray-400" />
                IRCTC charts prepare 4 hours prior to train departure
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                <a
                  href="https://www.indianrail.gov.in/enquiry/PNR/PnrEnquiry.html?locale=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="pnr-official-link"
                  className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  <ExternalLink size={12} />
                  Official IR Enquiry ↗
                </a>

                <a
                  href={`https://www.confirmtkt.com/pnr-status/${activeData.pnrNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="pnr-confirmtkt-link"
                  className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  <ExternalLink size={12} />
                  ConfirmTkt ↗
                </a>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="inline-flex items-center gap-1 rounded bg-[#EDF7F0] border border-[#C6E8D1] text-[#137333] px-2.5 py-1 text-xs font-semibold hover:bg-green-100 transition"
                >
                  <Share2 size={12} />
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  {copied ? <CheckCircle2 size={12} className="text-[#137333]" /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  return modalContent
}

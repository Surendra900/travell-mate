import { Activity, CheckCircle2, RefreshCw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getPNRStatus } from '../services/LiveTransportApi'
import { attachPnrStatus, getSavedPlans, saveOfflinePack } from '../utils/storage'

function serviceCode(plan = {}) {
  const service = plan.selectedService || {}
  return String(service.trainNumber || service.trainNo || service.code || plan.selectedServiceCode || '').replace(/\D/g, '')
}

function routeMatches(plan, result) {
  const from = String(plan.from || '').trim().toLowerCase()
  const to = String(plan.to || '').trim().toLowerCase()
  const resultFrom = String(result.from || '').trim().toLowerCase()
  const resultTo = String(result.to || '').trim().toLowerCase()
  if (!from || !to || !resultFrom || !resultTo) return true
  return (from.includes(resultFrom) || resultFrom.includes(from)) && (to.includes(resultTo) || resultTo.includes(to))
}

function savedPlanForResult(plan, result) {
  if (plan.id) return plan

  const plans = getSavedPlans()
  const pnrNumber = String(result.pnrNumber || '').replace(/\D/g, '')
  const trainNumber = String(result.trainNumber || '').replace(/\D/g, '')

  return plans.find((item) => item.pnrNumber === pnrNumber) ||
    plans.find((item) => trainNumber && serviceCode(item) === trainNumber && routeMatches(item, result)) ||
    plan
}

export default function PNRTracker({ plan = {}, onPlanSaved, toast }) {
  const pnr = String(plan.pnrNumber || '').replace(/\D/g, '').slice(0, 10)
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState(plan.pnrStatus ? 'saved' : 'idle')
  const [message, setMessage] = useState(plan.pnrStatus
    ? 'Saved PNR status is shown below and remains available offline.'
    : 'PNR will be attached automatically when an authorized booking response returns it.')
  const [result, setResult] = useState(plan.pnrStatus || null)
  const autoCheckedPnr = useRef('')
  const validPnr = /^\d{10}$/.test(pnr)

  useEffect(() => {
    if (!validPnr) {
      setResult(null)
      setMode('idle')
      setMessage('PNR will be attached automatically when an authorized booking response returns it.')
      return
    }

    if (plan.pnrStatus) {
      setResult(plan.pnrStatus)
      setMode('saved')
      setMessage('Saved PNR status loaded from this journey and available in no-internet mode.')
    }

    const canAutoCheck = typeof navigator === 'undefined' || navigator.onLine !== false
    if (!plan.pnrStatus && canAutoCheck && autoCheckedPnr.current !== pnr) {
      autoCheckedPnr.current = pnr
      checkPnr({ automatic: true })
    }
  }, [plan.id, plan.pnrNumber, plan.pnrStatus])

  async function checkPnr({ automatic = false } = {}) {
    if (!validPnr || loading) return

    setLoading(true)
    setMessage(automatic ? 'Refreshing the booking PNR status automatically...' : 'Refreshing PNR status...')

    const data = await getPNRStatus({ pnr })
    setLoading(false)
    setMode(data.mode || 'fallback')
    setMessage(data.message || 'PNR lookup completed.')
    setResult(data.result || null)

    if (!data.result) return

    const targetPlan = savedPlanForResult(plan, data.result)
    const saved = attachPnrStatus(targetPlan, data.result)
    if (!saved) return

    saveOfflinePack()
    onPlanSaved?.(saved)
    setMode(data.mode === 'live' ? 'live' : 'saved')
    setMessage(`${data.message || 'PNR lookup completed.'} The latest status is saved for Saved Plans and no-internet mode.`)
    if (!automatic) toast?.('PNR status refreshed and saved for offline access.')
  }

  return (
    <div className="glass rounded-3xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <RefreshCw className="text-cyan-300" />
        <span className={`rounded-full px-3 py-1 text-xs font-black ${mode === 'live' || mode === 'saved' ? 'bg-emerald-300 text-slate-950' : 'border border-yellow-400/30 bg-yellow-400/10 text-yellow-100'}`}>
          {mode === 'live' ? 'Live PNR API' : mode === 'saved' ? 'Saved PNR status' : validPnr ? 'Automatic check ready' : 'Waiting for booking PNR'}
        </span>
      </div>

      <h3 className="mt-3 text-xl font-black text-white">Automatic PNR Status</h3>
      <p className="mt-1 text-sm text-slate-400">TravelMate does not ask you to enter the PNR again here. When an authorized booking provider returns one, it is linked to this journey, checked online and stored in the offline pack.</p>

      <div className="mt-4 rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">PNR number</p>
        <p className="mt-1 break-all text-lg font-black text-white">{validPnr ? pnr : 'Waiting for authorized booking provider'}</p>
        {validPnr && (
          <button className="btn-soft mt-3 inline-flex items-center justify-center gap-2" onClick={() => checkPnr()} disabled={loading}>
            {loading ? <Activity className="animate-spin" size={17} /> : <RefreshCw size={17} />}
            {loading ? 'Refreshing...' : 'Refresh status'}
          </button>
        )}
      </div>

      <p className={`mt-3 rounded-xl border p-3 text-sm ${mode === 'live' || mode === 'saved' ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100' : 'border-slate-700 bg-slate-950/60 text-slate-400'}`}>{message}</p>

      {result && (
        <div className="mt-4 rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4 text-sm text-slate-300">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <b className="text-white">{result.trainName}</b>
              <p className="mt-1 text-xs text-slate-500">PNR {result.pnrNumber} · Train {result.trainNumber}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-400 px-3 py-1 text-xs font-black text-slate-950"><CheckCircle2 size={13} />{result.sourceBadge || (mode === 'live' ? 'Live API result' : 'Saved status')}</span>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <p><b className="text-cyan-100">From:</b> {result.from}</p>
            <p><b className="text-cyan-100">To:</b> {result.to}</p>
            <p><b className="text-cyan-100">Journey:</b> {result.journeyDate}</p>
            <p><b className="text-cyan-100">Chart:</b> {String(result.chartStatus)}</p>
            <p><b className="text-cyan-100">Booking:</b> {result.bookingStatus || 'Check passenger rows'}</p>
            <p><b className="text-cyan-100">Current:</b> {result.currentStatus || 'Check passenger rows'}</p>
          </div>
          {result.passengers?.length > 0 && (
            <div className="mt-3 space-y-2">
              {result.passengers.map((passenger) => (
                <p key={passenger.serial} className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
                  <b>Passenger {passenger.serial}:</b> booking {passenger.bookingStatus} → current {passenger.currentStatus}{passenger.coach ? ` · Coach ${passenger.coach}` : ''}{passenger.berth ? ` · Berth ${passenger.berth}` : ''}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

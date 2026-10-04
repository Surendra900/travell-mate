import { useEffect, useMemo, useRef, useState } from 'react'
import { AlarmClock, BellOff, Clock, TrainFront, Zap, CheckCircle2, AlertCircle } from 'lucide-react'

function nextWindow(hour) {
  const now = new Date()
  const target = new Date(now)
  target.setHours(hour, 0, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target
}

function formatDelta(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hh = String(Math.floor(total / 3600)).padStart(2, '0')
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const ss = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function beep() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = 880
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7)
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.75)
  } catch {}
}

export default function TatkalEmergencyTimer({ classType = 'Sleeper' }) {
  const [now, setNow] = useState(() => new Date())
  const [alarmEnabled, setAlarmEnabled] = useState(false)
  const [alarmLeadMinutes, setAlarmLeadMinutes] = useState(5)
  const [alarmFired, setAlarmFired] = useState(false)
  const lastActive = useRef(false)

  const isAc = /AC|1A|2A|3A|3E|CC|EC|Business|Premium/i.test(classType)
  const targetAc = useMemo(() => nextWindow(10), [now.toDateString()])
  const targetNonAc = useMemo(() => nextWindow(11), [now.toDateString()])

  const target = isAc ? targetAc : targetNonAc
  const diff = target - now
  const diffAc = targetAc - now
  const diffNonAc = targetNonAc - now

  const active = diff <= alarmLeadMinutes * 60 * 1000
  const urgent = diff <= 5 * 60 * 1000

  // Check if Tatkal window is currently open (10:00 to 11:00 for AC, 11:00 to 12:00 for Non-AC)
  const currentHour = now.getHours()
  const isAcWindowLive = currentHour === 10
  const isNonAcWindowLive = currentHour === 11
  const isCurrentClassWindowLive = isAc ? isAcWindowLive : isNonAcWindowLive

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!lastActive.current && active && alarmEnabled && !alarmFired) {
      setAlarmFired(true)
      beep()
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Tatkal reminder: ${alarmLeadMinutes} minutes left`, {
          body: 'Open the official IRCTC portal, keep OTP/payment ready, and prepare your backup route.'
        })
      }
      window.alert(`Tatkal window reminder: ${alarmLeadMinutes} minutes left. Keep OTP, payment and backup route ready.`)
    }
    lastActive.current = active
  }, [active, alarmEnabled, alarmFired, alarmLeadMinutes])

  async function enableAlarm() {
    setAlarmEnabled(true)
    setAlarmFired(false)
    beep()
    if ('Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission() } catch {}
    }
  }

  function disableAlarm() {
    setAlarmEnabled(false)
    setAlarmFired(false)
    lastActive.current = false
  }

  return (
    <div className="rounded-3xl border border-orange-400/40 bg-gradient-to-br from-red-950/95 via-orange-950/80 to-slate-950/90 p-5 sm:p-6 shadow-danger">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-orange-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="badge border-orange-400/30 bg-orange-500/20 text-orange-200 font-bold tracking-wide">
              <Clock size={14} className="text-orange-300" /> Tatkal Emergency Countdown Engine
            </span>
            <span className="badge border-emerald-400/30 bg-emerald-500/20 text-emerald-200 text-xs font-mono">
              IST Sync (UTC+5:30)
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <h3 className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-white">
              {isCurrentClassWindowLive ? 'LIVE NOW' : formatDelta(diff)}
            </h3>
            {isCurrentClassWindowLive && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-black uppercase text-white animate-pulse">
                <Zap size={12} /> Window Open
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-orange-200/80">
            System Clock: <strong className="font-mono text-white">{now.toLocaleTimeString()}</strong> · Active Mode: <strong className="text-orange-300">{isAc ? 'AC Classes (10:00 AM IST)' : 'Non-AC / Sleeper (11:00 AM IST)'}</strong>
          </p>
        </div>

        {/* Dual Window Tracker */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`rounded-xl border p-2.5 transition ${
            isAc ? 'border-amber-400 bg-amber-500/20 text-amber-100 shadow' : 'border-slate-800 bg-slate-900/60 text-slate-400'
          }`}>
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold">AC Tatkal</span>
              <span className="font-mono font-black text-amber-300">10:00 AM</span>
            </div>
            <p className="mt-1 font-mono text-[11px]">{isAcWindowLive ? 'OPEN' : formatDelta(diffAc)}</p>
            {isAc && <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-wider text-amber-300">Selected Class</span>}
          </div>

          <div className={`rounded-xl border p-2.5 transition ${
            !isAc ? 'border-orange-400 bg-orange-500/20 text-orange-100 shadow' : 'border-slate-800 bg-slate-900/60 text-slate-400'
          }`}>
            <div className="flex items-center justify-between gap-1">
              <span className="font-bold">Non-AC Tatkal</span>
              <span className="font-mono font-black text-orange-300">11:00 AM</span>
            </div>
            <p className="mt-1 font-mono text-[11px]">{isNonAcWindowLive ? 'OPEN' : formatDelta(diffNonAc)}</p>
            {!isAc && <span className="mt-1 inline-block text-[9px] font-black uppercase tracking-wider text-orange-300">Selected Class</span>}
          </div>
        </div>
      </div>

      {/* Alarm & Readiness Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs font-bold text-orange-200">
            Reminder Lead:
            <select
              className="input ml-2 py-1 px-2 text-xs bg-slate-900 border-slate-700"
              value={alarmLeadMinutes}
              onChange={(e) => {
                setAlarmLeadMinutes(Number(e.target.value))
                setAlarmFired(false)
              }}
            >
              <option value={5}>5 minutes before opening</option>
              <option value={10}>10 minutes before opening</option>
              <option value={15}>15 minutes before opening</option>
            </select>
          </label>

          <button
            type="button"
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition-all ${
              alarmEnabled
                ? 'bg-emerald-400 text-slate-950 shadow-md shadow-emerald-950'
                : 'bg-slate-900 text-orange-100 border border-orange-400/40 hover:bg-slate-800'
            }`}
            onClick={enableAlarm}
            aria-label="Set Tatkal Reminder Alarm"
          >
            <AlarmClock size={14} className="mr-1.5 inline" />
            {alarmEnabled ? `Alarm Active (${alarmLeadMinutes}m)` : 'Set browser alarm'}
          </button>

          {alarmEnabled && (
            <button
              type="button"
              className="rounded-xl bg-red-600/80 hover:bg-red-500 px-2.5 py-1.5 text-xs font-black text-white"
              onClick={disableAlarm}
              aria-label="Disable Tatkal Reminder Alarm"
            >
              <BellOff size={14} className="mr-1 inline" /> Disable
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs">
          {urgent && !isCurrentClassWindowLive && (
            <span className="rounded-full bg-red-600 px-3 py-1 font-black text-white animate-bounce">
              🚨 Final 5 Mins · Login IRCTC Now!
            </span>
          )}
          {active && !urgent && !isCurrentClassWindowLive && (
            <span className="rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-1 font-bold text-amber-200">
              Prep Window Active ({alarmLeadMinutes}m lead)
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

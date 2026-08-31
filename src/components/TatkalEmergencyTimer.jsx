import { useEffect, useMemo, useRef, useState } from 'react'
import { AlarmClock, BellOff, Clock, TrainFront } from 'lucide-react'

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
  const isAc = /AC|1A|2A|3A|CC|EC|Business|Premium/i.test(classType)
  const openingHour = isAc ? 10 : 11
  const target = useMemo(() => nextWindow(openingHour), [openingHour, now.toDateString()])
  const diff = target - now
  const active = diff <= alarmLeadMinutes * 60 * 1000
  const urgent = diff <= 5 * 60 * 1000

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
          body: 'Open the official portal, keep OTP/payment ready, and use your backup route if booking fails.'
        })
      }
      window.alert(`Tatkal window reminder: ${alarmLeadMinutes} minutes left. Keep OTP, payment and backup route ready.`)
    }
    lastActive.current = active
  }, [active, alarmEnabled, alarmFired])

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
    <div className="rounded-3xl border border-orange-300/40 bg-gradient-to-br from-red-950/90 to-orange-950/70 p-5 shadow-danger">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="badge border-orange-300/30 bg-orange-300/10 text-orange-100"><Clock size={14} /> Tatkal emergency timer</p>
          <h3 className="mt-3 text-3xl font-black text-white">{formatDelta(diff)}</h3>
          <p className="mt-1 text-sm text-orange-100/85">Current time: <b>{now.toLocaleTimeString()}</b></p>
          <p className="mt-1 text-sm text-orange-100/85">Next {isAc ? 'AC / premium' : 'Non-AC / sleeper'} Tatkal prep window: {target.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-orange-200/30 bg-slate-950/60 p-4 text-sm text-orange-100">
          <p><TrainFront size={16} className="mr-1 inline" /> AC Tatkal opens: 10:00 AM</p>
          <p className="mt-1">Non-AC Tatkal opens: 11:00 AM</p>
          <p className="mt-2 rounded-xl border border-orange-200/20 bg-slate-950/70 p-2 text-xs">Wait until the Tatkal window opens. You can set a reminder 5 or 10 minutes before the correct class window.</p>
          <label className="mt-3 block text-xs font-black text-orange-100">Alarm lead time
            <select className="input mt-1" value={alarmLeadMinutes} onChange={(e) => { setAlarmLeadMinutes(Number(e.target.value)); setAlarmFired(false) }}>
              <option value={5}>5 minutes before</option>
              <option value={10}>10 minutes before</option>
            </select>
          </label>
          <p className={`mt-2 rounded-full px-3 py-1 text-center font-black ${active ? 'bg-red-500 text-white' : 'bg-orange-300 text-slate-950'}`}>{active ? `${alarmLeadMinutes}-minute reminder window active` : 'Prepare details now'}</p>
          {urgent && <p className="mt-2 rounded-full bg-red-600 px-3 py-1 text-center font-black text-white">Very close · keep OTP ready</p>}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className={`rounded-xl px-3 py-2 text-xs font-black ${alarmEnabled ? 'bg-emerald-400 text-slate-950' : 'bg-slate-900 text-orange-100 border border-orange-300/30'}`} onClick={enableAlarm}>
              <AlarmClock size={14} className="mr-1 inline" /> {alarmEnabled ? `Alarm on ${alarmLeadMinutes}m` : 'Set alarm'}
            </button>
            <button className={`rounded-xl px-3 py-2 text-xs font-black ${!alarmEnabled ? 'bg-slate-800 text-slate-400' : 'bg-red-500 text-white'}`} onClick={disableAlarm}>
              <BellOff size={14} className="mr-1 inline" /> Disable
            </button>
          </div>
          <p className="mt-2 text-[11px] text-orange-100/70">Browser alarm needs one click to enable sound/notification permission. You can disable it anytime.</p>
        </div>
      </div>
    </div>
  )
}

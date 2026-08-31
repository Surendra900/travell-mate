import { useMemo, useState } from 'react'
import { Activity, Search, TrainFront } from 'lucide-react'
import { getServiceOptions } from '../data/transportData'
import { getTrainRunningStatus } from '../services/LiveTransportApi'

function extractTrainNumber(service = '') {
  return String(service).match(/\b\d{5}\b/)?.[0] || ''
}

export default function TrainRunningStatus({ plan, toast }) {
  const firstTrain = useMemo(() => getServiceOptions(plan).trains?.[0], [plan])
  const [trainNumber, setTrainNumber] = useState(extractTrainNumber(firstTrain?.service || firstTrain?.code))
  const [startDay, setStartDay] = useState('0')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [mode, setMode] = useState('idle')
  const [message, setMessage] = useState('Enter a 5-digit train number. Results are shown only when the live provider responds.')

  async function checkStatus() {
    const clean = String(trainNumber || '').replace(/\D/g, '')
    if (!/^\d{5}$/.test(clean)) {
      setStatus(null)
      setMode('invalid')
      setMessage('Enter a valid 5-digit train number.')
      toast?.('Enter a valid train number first.')
      return
    }
    setLoading(true)
    const data = await getTrainRunningStatus({ trainNumber: clean, startDay })
    setLoading(false)
    setMode(data.mode || 'error')
    setMessage(data.message || 'Train status request completed.')
    setStatus(data.ok && data.result ? data.result : null)
  }

  return (
    <div className="glass rounded-3xl p-5 md:col-span-2">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-sm font-bold text-cyan-200">Train running status</p><h3 className="text-xl font-black text-white">Live location / delay checker</h3></div>
        <TrainFront className="text-cyan-300" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_0.7fr_auto]">
        <input className="input" value={trainNumber} placeholder="Enter train no. e.g. 19038" onChange={(event) => setTrainNumber(event.target.value.replace(/\D/g, '').slice(0, 5))} />
        <select className="input" value={startDay} onChange={(event) => setStartDay(event.target.value)} title="0 means the train started today.">
          <option value="0">Started today</option><option value="1">Started yesterday</option><option value="2">Started 2 days ago</option><option value="3">Started 3 days ago</option>
        </select>
        <button className="btn-primary inline-flex items-center justify-center gap-2 whitespace-nowrap" onClick={checkStatus} disabled={loading}>{loading ? <Activity className="animate-spin" size={17} /> : <Search size={17} />}{loading ? 'Checking…' : 'Check Status'}</button>
      </div>
      <p className={`mt-4 rounded-xl border p-3 text-sm ${mode === 'live' ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100' : 'border-yellow-400/20 bg-yellow-400/10 text-yellow-100'}`}>{message}</p>
      {status && (
        <div className="mt-4 rounded-2xl border border-slate-700/70 bg-slate-950/70 p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2"><b className="text-white">{status.trainName} ({status.trainNumber})</b><span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-slate-950">Live API result</span></div>
          <p className="mt-2 text-slate-300"><b className="text-cyan-100">Current location:</b> {status.currentStation}</p>
          <p className="mt-1 text-slate-300"><b className="text-cyan-100">Status:</b> {status.status}</p>
          <p className="mt-1 text-slate-300"><b className="text-cyan-100">Delay:</b> {status.delay} · <b className="text-cyan-100">Platform:</b> {status.platform}</p>
          <p className="mt-1 text-slate-300"><b className="text-cyan-100">Updated:</b> {status.updated}</p>
        </div>
      )}
    </div>
  )
}

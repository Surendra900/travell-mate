import { Activity, RadioTower, Search, TrainFront } from 'lucide-react'
import { useState } from 'react'
import { getLiveStation, getTrainsByStation, searchStations } from '../services/LiveTransportApi'
import SourceBadge from '../components/SourceBadge'

const stationHints = ['SC', 'HYB', 'NDLS', 'BZA', 'VSKP', 'MAS', 'SBC', 'CSMT', 'HWH', 'PUNE', 'TPTY', 'GNT']

export default function LiveStationDashboard({ icon }) {
  const [fromStationCode, setFromStationCode] = useState('SC')
  const [toStationCode, setToStationCode] = useState('NDLS')
  const [hours, setHours] = useState('4')
  const [stationQuery, setStationQuery] = useState('Secunderabad')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('idle')
  const [message, setMessage] = useState('Live station works by station code. Search station first, select the code, then click Live station or Trains by station.')
  const [rows, setRows] = useState([])
  const [stations, setStations] = useState([])

  async function checkStation() {
    if (!fromStationCode.trim()) {
      setMessage('Enter fromStationCode first.')
      return
    }
    setLoading(true)
    const data = await getLiveStation({ fromStationCode, toStationCode, hours })
    setLoading(false)
    setMode(data.mode || 'fallback')
    setMessage(data.message || 'Live station lookup completed.')
    setRows(Array.isArray(data.results) ? data.results.slice(0, 30) : [])
  }

  async function checkTrainsByStation() {
    if (!fromStationCode.trim()) {
      setMessage('Enter station code first.')
      return
    }
    setLoading(true)
    const data = await getTrainsByStation({ stationCode: fromStationCode })
    setLoading(false)
    setMode(data.mode || 'fallback')
    setMessage(data.message || 'Trains-by-station lookup completed.')
    setRows(Array.isArray(data.results) ? data.results.slice(0, 50) : [])
  }

  async function runStationSearch() {
    if (!stationQuery.trim()) {
      setMessage('Enter station search text first.')
      return
    }
    setLoading(true)
    const data = await searchStations({ query: stationQuery })
    setLoading(false)
    setMode(data.mode || 'fallback')
    setMessage(data.message || 'Station search completed.')
    setStations(Array.isArray(data.results) ? data.results.slice(0, 12) : [])
  }

  return (
    <div className="glass rounded-3xl p-5 md:col-span-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-cyan-300">{icon || <RadioTower size={20} />}</span>
          <h3 className="mt-3 text-xl font-black text-white">Live Station + Train Board</h3>
          <p className="mt-1 text-sm text-slate-400">Search any Indian railway station, then load live station departures or trains by station. This does not query every Indian station at once, because the API requires one station code per request.</p>
        </div>
        <SourceBadge label={mode === 'live' ? 'Live API result' : mode === 'idle' ? 'API-ready' : 'Local planning estimate'} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_0.6fr]">
        <input className="input" value={fromStationCode} onChange={(e) => setFromStationCode(e.target.value.toUpperCase().slice(0, 5))} placeholder="From station e.g. SC" />
        <input className="input" value={toStationCode} onChange={(e) => setToStationCode(e.target.value.toUpperCase().slice(0, 5))} placeholder="To station optional e.g. NDLS" />
        <select className="input" value={hours} onChange={(e) => setHours(e.target.value)}>
          <option value="1">1 hour</option>
          <option value="2">2 hours</option>
          <option value="4">4 hours</option>
          <option value="8">8 hours</option>
        </select>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn-primary inline-flex items-center justify-center gap-2" onClick={checkStation} disabled={loading}>{loading ? <Activity className="animate-spin" size={17} /> : <Search size={17} />}Live station</button>
        <button className="btn-soft inline-flex items-center justify-center gap-2" onClick={checkTrainsByStation} disabled={loading}><TrainFront size={17} />Trains by station</button>
        {stationHints.map((code) => <button key={code} className="rounded-lg border border-slate-700 px-2 py-1 text-xs font-bold text-slate-300 hover:bg-slate-800" onClick={() => setFromStationCode(code)}>{code}</button>)}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input className="input" value={stationQuery} onChange={(e) => setStationQuery(e.target.value)} placeholder="Search station name/code e.g. BZA" />
        <button className="btn-soft inline-flex items-center justify-center gap-2" onClick={runStationSearch} disabled={loading}><Search size={17} />Search station</button>
      </div>

      <p className={`mt-3 rounded-xl border p-3 text-sm ${mode === 'live' ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100' : 'border-slate-700 bg-slate-950/60 text-slate-400'}`}>{message}</p>

      {rows.length > 0 && (
        <p className="mt-4 text-xs font-bold text-slate-400">Showing {rows.length} provider rows. Use a specific station code for accurate live data.</p>
      )}

      {stations.length > 0 && (
        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3">
          <h4 className="font-black text-white">Station search results</h4>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {stations.map((station) => (
              <button key={`${station.code}-${station.name}`} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-left text-sm text-slate-300 hover:border-cyan-300/50" onClick={() => setFromStationCode(station.code)}>
                <b className="text-white">{station.name}</b><br />Code: {station.code}{station.state ? ` · ${station.state}` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {rows.map((row, index) => (
            <div key={`${row.code}-${index}`} className="rounded-2xl border border-slate-700/70 bg-slate-950/70 p-3 text-sm text-slate-300">
              <div className="flex items-start justify-between gap-3"><b className="text-white">{row.serviceName}</b><SourceBadge label={row.sourceBadge || 'Live API result'} /></div>
              <p className="mt-2"><b className="text-cyan-100">Route:</b> {row.from} → {row.to}</p>
              <p className="mt-1"><b className="text-cyan-100">Time:</b> {row.departure} → {row.arrival}</p>
              <p className="mt-2 text-xs text-yellow-100/80">{row.verification}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

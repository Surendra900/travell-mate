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
    <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs md:col-span-2 text-gray-900">
      <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <span className="text-[#15803D]">{icon || <RadioTower size={20} />}</span>
          <h3 className="mt-2 text-xl font-black text-gray-900">Live Station + Train Board</h3>
          <p className="mt-1 text-xs text-gray-500">Search any Indian railway station, then load live station departures or trains by station. This does not query every Indian station at once, because the API requires one station code per request.</p>
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
        <button className="btn-primary inline-flex items-center justify-center gap-2 text-xs py-2 px-3" onClick={checkStation} disabled={loading}>{loading ? <Activity className="animate-spin" size={15} /> : <Search size={15} />}Live station</button>
        <button className="btn-soft inline-flex items-center justify-center gap-2 text-xs py-2 px-3" onClick={checkTrainsByStation} disabled={loading}><TrainFront size={15} />Trains by station</button>
        {stationHints.map((code) => <button key={code} className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-bold text-gray-700 hover:bg-gray-50" onClick={() => setFromStationCode(code)}>{code}</button>)}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <input className="input" value={stationQuery} onChange={(e) => setStationQuery(e.target.value)} placeholder="Search station name/code e.g. BZA" />
        <button className="btn-soft inline-flex items-center justify-center gap-2 text-xs py-2 px-3" onClick={runStationSearch} disabled={loading}><Search size={15} />Search station</button>
      </div>

      <p className={`mt-3 rounded-md border p-3 text-xs ${mode === 'live' ? 'border-[#C6E8D1] bg-[#EDF7F0] text-[#137333]' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>{message}</p>

      {rows.length > 0 && (
        <p className="mt-4 text-xs font-bold text-gray-500">Showing {rows.length} provider rows. Use a specific station code for accurate live data.</p>
      )}

      {stations.length > 0 && (
        <div className="mt-4 rounded-md border border-gray-200 bg-gray-50 p-3">
          <h4 className="font-bold text-gray-900 text-xs">Station search results</h4>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {stations.map((station) => (
              <button key={`${station.code}-${station.name}`} className="rounded-md border border-gray-200 bg-white p-2.5 text-left text-xs text-gray-800 hover:border-[#15803D]" onClick={() => setFromStationCode(station.code)}>
                <b className="text-gray-900">{station.name}</b><br />Code: {station.code}{station.state ? ` · ${station.state}` : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      {rows.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {rows.map((row, index) => (
            <div key={`${row.code}-${index}`} className="rounded-md border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-xs">
              <div className="flex items-start justify-between gap-3"><b className="text-gray-900 text-sm">{row.serviceName}</b><SourceBadge label={row.sourceBadge || 'Live API result'} /></div>
              <p className="mt-2"><b className="text-gray-800">Route:</b> {row.from} to {row.to}</p>
              <p className="mt-1"><b className="text-gray-800">Time:</b> {row.departure} to {row.arrival}</p>
              <p className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-sm">{row.verification}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Sparkles, ArrowRight, Check, X, LoaderCircle, Mic } from 'lucide-react'

export default function NaturalLanguageQueryInput({ onApplyPlan, toast }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsedData, setParsedData] = useState(null)
  const [isListening, setIsListening] = useState(false)

  async function handleParse(e) {
    e?.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'parse_query',
          query: query.trim()
        })
      })

      const data = await res.json()
      if (data.ok && data.data) {
        setParsedData(data.data)
        toast?.('Query parsed successfully. Review the understood parameters below.')
      } else {
        toast?.('Could not extract complete route. Please use the form fields below.')
      }
    } catch (err) {
      console.warn('AI query parse error, falling back to form:', err)
      toast?.('Network error parsing query. Please enter your journey in the form.')
    } finally {
      setLoading(false)
    }
  }

  function handleApply() {
    if (!parsedData) return
    onApplyPlan?.({
      from: parsedData.origin,
      to: parsedData.destination,
      ...(parsedData.date ? { date: parsedData.date } : {}),
      ...(parsedData.modePreferences && parsedData.modePreferences !== 'Any' ? { transportMode: parsedData.modePreferences } : {}),
      ...(parsedData.passengers ? { passengers: parsedData.passengers } : {}),
      ...(parsedData.budget ? { budget: parsedData.budget } : {})
    })
    toast?.(`Applied route: ${parsedData.origin} to ${parsedData.destination}`)
    setParsedData(null)
    setQuery('')
  }

  function handleVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast?.('Speech recognition not supported in this browser.')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-IN'
      recognition.interimResults = false

      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onerror = () => {
        setIsListening(false)
        toast?.('Voice input error. Please type your query.')
      }
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || ''
        if (transcript) {
          setQuery(transcript)
          toast?.(`Voice heard: "${transcript}"`)
        }
      }

      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  return (
    <div className="w-full mb-6">
      <form onSubmit={handleParse} className="relative">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-sky-200 bg-sky-50/60 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition">
          <div className="pl-3 text-sky-700 shrink-0">
            <Sparkles size={18} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            data-testid="ai-query-input"
            placeholder="Type in plain words: e.g. 'Tomorrow morning train from Delhi to Patna for 2 passengers'"
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none py-2 px-1"
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            aria-label="Voice input query"
            className={`p-2 rounded-xl transition ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-500 hover:text-sky-700 hover:bg-sky-100'}`}
          >
            <Mic size={16} />
          </button>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            data-testid="ai-parse-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white text-xs font-bold transition shrink-0"
          >
            {loading ? <LoaderCircle size={14} className="animate-spin" /> : <span>Parse</span>}
          </button>
        </div>
      </form>

      {/* "I understood: ..." with editable chips per Section 7.a */}
      {parsedData && (
        <div data-testid="ai-understood-banner" className="mt-3 p-4 rounded-2xl border border-sky-300 bg-white shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <Check size={14} />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                I understood:
              </span>
            </div>
            <button
              type="button"
              onClick={() => setParsedData(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              aria-label="Dismiss parsed chips"
            >
              <X size={14} />
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div data-testid="chip-origin" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 text-xs font-bold text-sky-950">
              <span className="text-slate-500 font-normal">From:</span>
              <span>{parsedData.origin}</span>
            </div>

            <div data-testid="chip-destination" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 text-xs font-bold text-sky-950">
              <span className="text-slate-500 font-normal">To:</span>
              <span>{parsedData.destination}</span>
            </div>

            {parsedData.date && (
              <div data-testid="chip-date" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900">
                <span className="text-slate-500 font-normal">Date:</span>
                <span>{parsedData.date}</span>
              </div>
            )}

            <div data-testid="chip-mode" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900">
              <span className="text-slate-500 font-normal">Mode:</span>
              <span>{parsedData.modePreferences || 'Any'}</span>
            </div>

            <div data-testid="chip-passengers" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900">
              <span className="text-slate-500 font-normal">Passengers:</span>
              <span>{parsedData.passengers || 1}</span>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setParsedData(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              data-testid="apply-ai-chips-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-extrabold shadow-sm transition"
            >
              <span>Apply to Form</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

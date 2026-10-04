import { useEffect, useRef, useState } from 'react'
import { LoaderCircle, Mic, MicOff, Search, X } from 'lucide-react'

const MAX_RECORDING_MS = 12_000

const speechLocales = {
  en: 'en-IN', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN',
  mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN', ur: 'ur-PK', es: 'es-ES', fr: 'fr-FR', de: 'de-DE'
}

function cleanCommand(text = '') {
  return String(text).replace(/\s+/g, ' ').trim()
}

function speechRecognitionConstructor() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

function preferredMimeType() {
  if (typeof MediaRecorder === 'undefined') return ''
  return [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4'
  ].find((type) => MediaRecorder.isTypeSupported?.(type)) || ''
}

async function blobToBase64(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer())
  let binary = ''
  const size = 0x8000
  for (let index = 0; index < bytes.length; index += size) {
    binary += String.fromCharCode(...bytes.subarray(index, index + size))
  }
  return btoa(binary)
}

export default function VoiceSearchButton({ onSearch, language = 'en' }) {
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [typedSearch, setTypedSearch] = useState('')
  const [status, setStatus] = useState('Tap the mic and say a route, like train from Hyderabad to Delhi.')
  const recognitionRef = useRef(null)
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const timeoutRef = useRef(null)
  const cancelRef = useRef(false)
  const heardRef = useRef(false)

  const nativeSpeechSupported = Boolean(speechRecognitionConstructor())
  const recorderSupported = typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia) && typeof MediaRecorder !== 'undefined'
  const supported = nativeSpeechSupported || recorderSupported
  const listening = phase === 'listening'
  const transcribing = phase === 'transcribing'

  useEffect(() => () => cleanupAll(true), [])

  function cleanupRecognition(cancel = true) {
    cancelRef.current = cancel
    const recognition = recognitionRef.current
    recognitionRef.current = null
    if (recognition) {
      recognition.onstart = null
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      try { recognition.abort() } catch {}
    }
  }

  function cleanupRecording(cancel = true) {
    cancelRef.current = cancel
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = null
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      try { recorder.stop() } catch {}
    }
    recorderRef.current = null
    for (const track of streamRef.current?.getTracks?.() || []) track.stop()
    streamRef.current = null
  }

  function cleanupAll(cancel = true) {
    cleanupRecognition(cancel)
    cleanupRecording(cancel)
  }

  function submit(value) {
    const clean = cleanCommand(value)
    if (!clean) {
      setStatus('Enter or say a search first.')
      return
    }
    const result = onSearch?.(clean)
    setStatus(result?.message || 'Search applied.')
    setTypedSearch('')
    if (result?.ok) {
      window.setTimeout(() => setOpen(false), 450)
    }
  }

  async function normalizeSpokenCommand(heard) {
    const transcriptText = cleanCommand(heard)
    if (!transcriptText) return
    setTranscript(transcriptText)
    setPhase('transcribing')
    setStatus(language === 'en' ? 'Applying your voice command…' : 'Translating and applying your voice command…')

    try {
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ transcript: transcriptText, language })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.ok) throw new Error(data.message || `Voice service failed (${response.status}).`)
      setPhase('idle')
      submit(String(data.command || transcriptText))
    } catch (error) {
      setPhase('idle')
      if (language === 'en') {
        submit(transcriptText)
      } else {
        setStatus(error.message || 'Could not translate the voice command. Type the route below instead.')
      }
    }
  }

  async function transcribeRecordedAudio(blob, mimeType) {
    setPhase('transcribing')
    setStatus('Converting your recording into a travel command…')
    try {
      const audio = await blobToBase64(blob)
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ audio, mimeType, language })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.ok) throw new Error(data.message || `Voice service failed (${response.status}).`)
      const heard = cleanCommand(data.transcript)
      setTranscript(heard)
      setPhase('idle')
      if (!heard) {
        setStatus('No speech was detected. Try again closer to the microphone.')
        return
      }
      submit(String(data.command || heard))
    } catch (error) {
      setPhase('idle')
      setStatus(error.message || 'Voice transcription failed. Type the search below instead.')
    }
  }

  function startBrowserRecognition() {
    const SpeechRecognition = speechRecognitionConstructor()
    if (!SpeechRecognition) return false

    cleanupAll(true)
    cancelRef.current = false
    heardRef.current = false
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = speechLocales[language] || language || 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setPhase('listening')
      setStatus('Listening… speak clearly. Voice recognition stops automatically when you finish.')
    }
    recognition.onresult = (event) => {
      heardRef.current = true
      const heard = event.results?.[event.resultIndex || 0]?.[0]?.transcript || event.results?.[0]?.[0]?.transcript || ''
      recognitionRef.current = null
      normalizeSpokenCommand(heard)
    }
    recognition.onerror = (event) => {
      recognitionRef.current = null
      setPhase('idle')
      const code = String(event?.error || '')
      if (code === 'not-allowed' || code === 'service-not-allowed') {
        setStatus('Microphone permission is blocked. Click the lock icon beside the address, allow Microphone, reload, and try again.')
      } else if (code === 'no-speech') {
        setStatus('No speech was detected. Try again and speak closer to the microphone.')
      } else if (code === 'audio-capture') {
        setStatus('No working microphone was found. Check your input device or type the route below.')
      } else {
        setStatus(`Voice recognition stopped: ${code || 'unknown browser error'}. Try again or type the route below.`)
      }
    }
    recognition.onend = () => {
      recognitionRef.current = null
      if (cancelRef.current || heardRef.current) return
      setPhase('idle')
      setStatus('Listening ended without a result. Tap the mic and try again.')
    }

    try {
      recognition.start()
      return true
    } catch (error) {
      recognitionRef.current = null
      setPhase('idle')
      setStatus(`Could not start voice recognition: ${error?.message || 'unknown browser error'}.`)
      return false
    }
  }

  async function startRecorderFallback() {
    if (!recorderSupported) {
      setStatus('This browser cannot use voice search. Use current Chrome or Edge, or type the route below.')
      return
    }

    cleanupAll(true)
    cancelRef.current = false
    try {
      setStatus('Requesting microphone permission…')
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      })
      streamRef.current = stream
      chunksRef.current = []

      const mimeType = preferredMimeType()
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
      recorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data?.size) chunksRef.current.push(event.data)
      }
      recorder.onerror = () => {
        cleanupRecording(true)
        setPhase('idle')
        setStatus('The browser could not record the microphone. Check microphone permission and try again.')
      }
      recorder.onstop = async () => {
        window.clearTimeout(timeoutRef.current)
        const outputType = recorder.mimeType?.split(';')[0] || mimeType.split(';')[0] || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: outputType })
        chunksRef.current = []
        for (const track of stream.getTracks()) track.stop()
        streamRef.current = null
        recorderRef.current = null
        if (cancelRef.current) {
          setPhase('idle')
          return
        }
        if (blob.size < 300) {
          setPhase('idle')
          setStatus('No audio was captured. Check the microphone and try again.')
          return
        }
        await transcribeRecordedAudio(blob, outputType)
      }

      recorder.start(250)
      setPhase('listening')
      setStatus('Listening… speak clearly, then tap the mic again to stop.')
      timeoutRef.current = window.setTimeout(() => stopListening(), MAX_RECORDING_MS)
    } catch (error) {
      cleanupRecording(true)
      setPhase('idle')
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setStatus('Microphone permission is blocked. Click the lock icon beside the address, allow Microphone, reload, and try again.')
      } else if (error?.name === 'NotFoundError') {
        setStatus('No microphone was found on this device. Connect one or type the route below.')
      } else {
        setStatus(`Could not start the microphone: ${error?.message || 'unknown browser error'}.`)
      }
    }
  }

  async function startListening() {
    setOpen(true)
    setTranscript('')
    if (!supported) {
      setStatus('This browser cannot use voice search. Use current Chrome or Edge, or type the route below.')
      return
    }
    if (!startBrowserRecognition()) await startRecorderFallback()
  }

  function stopListening() {
    window.clearTimeout(timeoutRef.current)
    const recognition = recognitionRef.current
    if (recognition) {
      setStatus('Finishing voice recognition…')
      try { recognition.stop() } catch {}
      return
    }
    const recorder = recorderRef.current
    if (recorder?.state === 'recording') {
      setStatus('Finishing recording…')
      try { recorder.stop() } catch {}
      return
    }
    setPhase('idle')
  }

  function closePanel() {
    if (listening) cleanupAll(true)
    setPhase('idle')
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const handleEscape = (event) => {
      if (event.key === 'Escape') closePanel()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <div className="voice-root">
      {open && (
        <section id="travelmate-voice-search" className="voice-panel" role="dialog" aria-modal="true" aria-label="Voice search panel">
          <header className="dialog-panel-header">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-black text-cyan-100"><Search size={17} aria-hidden="true" /> Voice Search</p>
              <p className="mt-1 text-xs text-slate-400">Speak naturally. Route requests fill the planner first; Tatkal requests open Tatkal mode; the demo booking opens only when you explicitly say “open demo booking”.</p>
            </div>
            <button type="button" className="dialog-close-button" onClick={closePanel} aria-label="Close voice search" title="Close voice search">
              <X size={22} aria-hidden="true" />
            </button>
          </header>

          <div className="mt-3 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3" aria-live="polite">
            <p className="text-xs font-bold text-cyan-100">{status}</p>
            {transcript && <p className="mt-2 text-xs text-slate-200"><span>Heard:</span> <span data-no-translate>{transcript}</span></p>}
          </div>

          <button
            type="button"
            className={`mt-3 mobile-full ${listening ? 'btn-danger' : 'btn-soft'}`}
            onClick={listening ? stopListening : startListening}
            disabled={transcribing}
          >
            {transcribing ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : listening ? <MicOff size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
            {transcribing ? 'Processing voice…' : listening ? 'Stop listening' : 'Start listening'}
          </button>

          <div className="mt-3 grid gap-2">
            <label className="text-xs font-black text-cyan-100" htmlFor="voice-search-fallback">Type route search</label>
            <input
              id="voice-search-fallback"
              className="input"
              value={typedSearch}
              onChange={(event) => setTypedSearch(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && submit(typedSearch)}
              placeholder="Example: tickets from Hyderabad to Delhi by train"
            />
            <button type="button" className="btn-primary" data-testid="voice-search-submit" onClick={() => submit(typedSearch)}>Search</button>
          </div>

          <div className="mt-3 grid gap-2 text-xs">
            {[
              'tickets from Hyderabad to Delhi by train',
              'tatkal from Kochi to Chennai',
              'check live flights from Delhi to Mumbai',
              'open demo booking',
              'open safety'
            ].map((example) => (
              <button key={example} type="button" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-left font-bold text-slate-300 hover:bg-slate-800" onClick={() => submit(example)}>
                {example}
              </button>
            ))}
          </div>
        </section>
      )}

      {!open && (
        <button
          type="button"
          className="voice-launcher floating-voice-action"
          data-testid="voice-search-launcher"
          onClick={startListening}
          disabled={transcribing}
          aria-label={transcribing ? 'Processing voice search' : 'Start voice search'}
          title="Voice search"
          aria-controls="travelmate-voice-search"
          aria-expanded="false"
        >
          {transcribing ? <LoaderCircle className="animate-spin" size={22} aria-hidden="true" /> : <Mic size={22} aria-hidden="true" />}
        </button>
      )}
    </div>
  )
}

import { useEffect, useRef, useState, useCallback } from 'react'
import { Volume2, VolumeX, Mic, Eye, EyeOff, X, Sparkles, CheckCircle2 } from 'lucide-react'

const BLIND_MODE_KEY = 'travelmate-blind-mode'

export function getBlindModePreference() {
  try {
    return localStorage.getItem(BLIND_MODE_KEY) // 'enabled' | 'disabled' | null
  } catch {
    return null
  }
}

export function setBlindModePreference(val) {
  try {
    localStorage.setItem(BLIND_MODE_KEY, val)
    window.dispatchEvent(new CustomEvent('travelmate:blind-mode-changed', { detail: { mode: val } }))
  } catch {}
}

export default function BlindVoiceGate({ forceOpen = false, onClose, toast, onModeChange }) {
  const [open, setOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioPlayed, setAudioPlayed] = useState(false)
  const [activePreference, setActivePreference] = useState(() => getBlindModePreference())
  const yesButtonRef = useRef(null)
  const recognitionRef = useRef(null)
  const spokenRef = useRef(false)

  const speakPrompt = useCallback((text = "Welcome to TravelMate AI. Are you blind or visually impaired? Say 'Yes' to enable voice assistant mode, or say 'No' to continue with standard visual mode.") => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.lang = 'en-IN'

      utterance.onend = () => {
        setAudioPlayed(true)
        startListening()
      }
      utterance.onerror = () => {
        setAudioPlayed(true)
        startListening()
      }

      window.speechSynthesis.speak(utterance)
      spokenRef.current = true
    } catch {
      setAudioPlayed(true)
    }
  }, [])

  const startListening = useCallback(() => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRec) return

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch {}
      }

      const rec = new SpeechRec()
      rec.continuous = false
      rec.interimResults = false
      rec.lang = 'en-IN'

      rec.onstart = () => setIsListening(true)
      rec.onend = () => setIsListening(false)
      rec.onerror = () => setIsListening(false)

      rec.onresult = (event) => {
        const text = String(event.results[0]?.[0]?.transcript || '').trim().toLowerCase()
        setTranscript(text)

        if (/yes|yeah|yep|haan|blind|enable|voice|audio/i.test(text)) {
          enableBlindMode('voice')
        } else if (/no|nah|nope|nahi|disable|cancel|standard|visual/i.test(text)) {
          disableBlindMode('voice')
        } else if (/repeat|again|pardon|what/i.test(text)) {
          speakPrompt()
        }
      }

      recognitionRef.current = rec
      rec.start()
    } catch {
      setIsListening(false)
    }
  }, [speakPrompt])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch {}
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])

  // Check initial gate state or forceOpen
  useEffect(() => {
    if (forceOpen) {
      setOpen(true)
      speakPrompt()
      return
    }

    // Only auto-prompt on the main home landing page ('/')
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      return
    }

    const current = getBlindModePreference()
    if (!current) {
      // Prompt first-time visitors once per session on home landing
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('travelmate-blind-gate-shown') === 'true') {
        return
      }
      try { sessionStorage.setItem('travelmate-blind-gate-shown', 'true') } catch {}

      setOpen(true)
      // Slight delay to allow DOM to settle and user gesture readiness
      const timer = setTimeout(() => {
        speakPrompt()
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [forceOpen, speakPrompt])

  // Alt + B keyboard shortcut listener
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.altKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault()
        setOpen(true)
        speakPrompt()
      }
      if (open && e.key === 'Escape') {
        e.preventDefault()
        closeGate()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, speakPrompt])

  // Focus trap to YES button when open
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        yesButtonRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    } else {
      stopListening()
      try { window.speechSynthesis?.cancel() } catch {}
    }
  }, [open, stopListening])

  function enableBlindMode(source = 'button') {
    stopListening()
    setBlindModePreference('enabled')
    setActivePreference('enabled')
    onModeChange?.(true)
    toast?.('Voice Accessibility Mode Enabled.')

    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel()
        const confirmUtterance = new SpeechSynthesisUtterance('Voice accessibility mode enabled. All key transit options and alarms will be announced.')
        confirmUtterance.lang = 'en-IN'
        window.speechSynthesis.speak(confirmUtterance)
      } catch {}
    }

    setOpen(false)
    onClose?.()
  }

  function disableBlindMode(source = 'button') {
    stopListening()
    setBlindModePreference('disabled')
    setActivePreference('disabled')
    onModeChange?.(false)
    toast?.('Standard Visual Mode Selected.')

    if (window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel()
        const confirmUtterance = new SpeechSynthesisUtterance('Standard mode selected.')
        confirmUtterance.lang = 'en-IN'
        window.speechSynthesis.speak(confirmUtterance)
      } catch {}
    }

    setOpen(false)
    onClose?.()
  }

  function closeGate() {
    stopListening()
    try { window.speechSynthesis?.cancel() } catch {}
    setOpen(false)
    onClose?.()
  }

  return (
    <>
      {/* Persistent Accessibility Banner / Shortcut Bar when mode is active or accessible trigger */}
      {activePreference === 'enabled' && (
        <div className="bg-yellow-400 text-black px-4 py-2 text-sm font-black flex items-center justify-between shadow-md border-b-2 border-black z-40 relative" role="status" aria-live="polite">
          <div className="flex items-center gap-2">
            <Volume2 className="animate-pulse" size={18} />
            <span>Voice Accessibility Mode Active (Spoken Audio Guidance Enabled)</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="bg-black text-yellow-300 px-3 py-1 rounded text-xs uppercase tracking-wider font-extrabold hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-black"
            aria-label="Open Voice Accessibility Settings"
          >
            Settings (Alt+B)
          </button>
        </div>
      )}

      {/* Full-Screen Accessible Blind Voice Gate Dialog */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-6 backdrop-blur-lg"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="blind-gate-title"
          aria-describedby="blind-gate-desc"
          data-testid="blind-voice-gate"
        >
          <div className="relative w-full max-w-2xl rounded-3xl border-4 border-yellow-400 bg-neutral-950 p-6 sm:p-10 shadow-2xl text-white">
            {/* Header info */}
            <div className="flex items-center justify-between gap-4 border-b border-neutral-800 pb-4">
              <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400/20 px-3.5 py-1.5 text-sm font-extrabold text-yellow-300 border border-yellow-400/40">
                <Volume2 size={16} /> Accessible Voice Gate · Press Alt+B anytime
              </span>
              <button
                type="button"
                onClick={closeGate}
                className="rounded-xl border border-neutral-700 bg-neutral-900 p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-yellow-400"
                aria-label="Close accessibility prompt"
                title="Close prompt (Escape)"
              >
                <X size={22} />
              </button>
            </div>

            {/* Main Spoken Question */}
            <div className="mt-8 text-center sm:text-left">
              <h1 id="blind-gate-title" className="text-3xl sm:text-5xl font-black tracking-tight text-yellow-300 leading-tight">
                Are you blind or visually impaired?
              </h1>
              <p id="blind-gate-desc" className="mt-4 text-lg sm:text-xl font-medium text-neutral-300 leading-relaxed">
                TravelMate AI features an end-to-end hands-free voice engine. Say <strong className="text-yellow-400">&ldquo;Yes&rdquo;</strong> into your microphone or tap below to enable spoken audio guides, automatic route readouts, and voice emergency triggers.
              </p>
            </div>

            {/* Listening indicator */}
            <div className="mt-6 flex items-center justify-center sm:justify-start gap-3 rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-neutral-800 text-neutral-400'}`}>
                <Mic size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {isListening ? 'Listening for your voice response…' : 'Microphone standby'}
                </p>
                <p className="text-xs text-neutral-400">
                  {transcript ? `Heard: "${transcript}"` : 'Say "Yes" or "No", or use the buttons below'}
                </p>
              </div>
            </div>

            {/* Action buttons with ultra-high contrast */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                ref={yesButtonRef}
                type="button"
                onClick={() => enableBlindMode('button')}
                className="flex items-center justify-center gap-3 rounded-2xl bg-yellow-400 px-6 py-5 text-xl font-black text-black shadow-lg hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-white transition-all transform active:scale-95"
                data-testid="blind-gate-yes"
              >
                <EyeOff size={24} />
                YES - Enable Voice Mode
              </button>

              <button
                type="button"
                onClick={() => disableBlindMode('button')}
                className="flex items-center justify-center gap-3 rounded-2xl border-2 border-neutral-700 bg-neutral-900 px-6 py-5 text-xl font-bold text-white hover:bg-neutral-800 focus:outline-none focus:ring-4 focus:ring-yellow-400 transition-all"
                data-testid="blind-gate-no"
              >
                <Eye size={24} />
                NO - Standard Mode
              </button>
            </div>

            {/* Replay audio guidance */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-neutral-800 text-sm text-neutral-400">
              <button
                type="button"
                onClick={() => speakPrompt()}
                className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-bold underline underline-offset-4 focus:ring-2 focus:ring-yellow-400 p-1 rounded"
              >
                <Volume2 size={16} /> Replay Audio Prompt
              </button>

              <span>Press <kbd className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-xs text-neutral-200 border border-neutral-700">Tab</kbd> to navigate · <kbd className="rounded bg-neutral-800 px-2 py-0.5 font-mono text-xs text-neutral-200 border border-neutral-700">Esc</kbd> to dismiss</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

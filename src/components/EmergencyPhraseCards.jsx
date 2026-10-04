import { useState } from 'react'
import { Volume2, Copy, Check, MessageSquareShare, Globe2 } from 'lucide-react'
import { languages, phraseTranslations } from '../data/languageData'

export default function EmergencyPhraseCards({ toast }) {
  const [selectedLang, setSelectedLang] = useState('hi')
  const [copiedKey, setCopiedKey] = useState(null)
  const [speakingKey, setSpeakingKey] = useState(null)

  const regionalLanguages = [
    { code: 'hi', label: 'हिन्दी' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'kn', label: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'മലയാളം' },
    { code: 'mr', label: 'मराठी' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'gu', label: 'ગુજરાતી' },
    { code: 'pa', label: 'ਪੰਜਾਬੀ' },
    { code: 'ur', label: 'اردو' }
  ]

  const currentLangObj = languages[selectedLang] || languages.hi

  function handleSpeak(phrase, key) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      toast?.('Text-to-speech is not supported in this browser.')
      return
    }

    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(phrase)
      utterance.lang = currentLangObj.bcp47 || 'hi-IN'
      utterance.rate = 0.9 // Slightly slower for clarity during emergencies

      setSpeakingKey(key)
      utterance.onend = () => setSpeakingKey(null)
      utterance.onerror = () => setSpeakingKey(null)

      window.speechSynthesis.speak(utterance)
    } catch {
      setSpeakingKey(null)
      toast?.('Audio playback unavailable.')
    }
  }

  function handleCopy(phrase, key, label) {
    navigator.clipboard?.writeText(phrase).then(() => {
      setCopiedKey(key)
      toast?.(`Copied phrase in ${currentLangObj.name}: "${phrase}"`)
      window.setTimeout(() => setCopiedKey(null), 2000)
    }).catch(() => {
      toast?.('Failed to copy phrase.')
    })
  }

  return (
    <section className="emergency-phrase-section mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-label="Regional Emergency Phrases">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Globe2 size={18} />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Regional Emergency Phrases
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Show or speak essential emergency phrases to locals, RPF, or doctors across Indian states without language friction.
          </p>
        </div>

        {/* Language selector pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:max-w-md">
          {regionalLanguages.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => setSelectedLang(code)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                selectedLang === code
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              aria-pressed={selectedLang === code}
              data-no-translate
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3" dir={currentLangObj.dir || 'ltr'}>
        {phraseTranslations.map((item) => {
          const phraseText = item[selectedLang] || item.hi
          const isCopied = copiedKey === item.key
          const isSpeaking = speakingKey === item.key

          return (
            <div
              key={item.key}
              className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-sm"
            >
              <div className="flex-1">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  {item.label}
                </span>
                <p className="mt-1 text-lg font-bold text-slate-900 leading-snug" data-no-translate>
                  {phraseText}
                </p>
                <p className="mt-1 text-xs text-slate-500 italic">
                  &ldquo;{item.en}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleSpeak(phraseText, item.key)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                    isSpeaking
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-400'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                  title={`Speak aloud in ${currentLangObj.name}`}
                  aria-label={`Speak ${item.label} in ${currentLangObj.name}`}
                >
                  <Volume2 size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(phraseText, item.key, item.label)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${
                    isCopied
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-400'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                  title="Copy phrase"
                  aria-label={`Copy ${item.label}`}
                >
                  {isCopied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

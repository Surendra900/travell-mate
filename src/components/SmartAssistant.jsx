import { useEffect, useRef, useState } from 'react'
import { Bot, CheckCircle2, LoaderCircle, Send, Sparkles, X } from 'lucide-react'

const samplePrompts = [
  'Tickets Kochi to Chennai by train.',
  'Book me a Delhi to Mumbai flight tomorrow.',
  'What should I carry for an overnight train?',
  'Make this an emergency journey plan.'
]

function greeting(language) {
  const greetings = {
    hi: 'नमस्ते! मैं आपकी यात्रा की योजना, बजट, परिवहन और सुरक्षा में मदद कर सकता हूँ।',
    te: 'నమస్కారం! ప్రయాణ ప్రణాళిక, బడ్జెట్, రవాణా మరియు భద్రతలో నేను సహాయం చేస్తాను.',
    ta: 'வணக்கம்! பயணத் திட்டம், செலவு, போக்குவரத்து மற்றும் பாதுகாப்பில் உதவுகிறேன்.',
    kn: 'ನಮಸ್ಕಾರ! ಪ್ರಯಾಣ ಯೋಜನೆ, ಬಜೆಟ್, ಸಾರಿಗೆ ಮತ್ತು ಸುರಕ್ಷತೆಯಲ್ಲಿ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.',
    ml: 'നമസ്കാരം! യാത്രാ പദ്ധതി, ബജറ്റ്, ഗതാഗതം, സുരക്ഷ എന്നിവയിൽ സഹായിക്കാം.',
    mr: 'नमस्कार! प्रवास नियोजन, बजेट, वाहतूक आणि सुरक्षिततेबाबत मी मदत करू शकतो.',
    bn: 'নমস্কার! ভ্রমণ পরিকল্পনা, বাজেট, পরিবহন ও নিরাপত্তায় সাহায্য করতে পারি।',
    gu: 'નમસ્તે! મુસાફરી આયોજન, બજેટ, પરિવહન અને સુરક્ષામાં હું મદદ કરી શકું છું.',
    ur: 'السلام علیکم! میں سفر کی منصوبہ بندی، بجٹ، ٹرانسپورٹ اور حفاظت میں مدد کر سکتا ہوں۔',
    es: '¡Hola! Puedo ayudarte con rutas, presupuesto, transporte y seguridad de viaje.',
    fr: 'Bonjour ! Je peux vous aider avec les itinéraires, le budget, le transport et la sécurité.',
    de: 'Hallo! Ich helfe bei Route, Budget, Verkehrsmittel und Reisesicherheit.'
  }
  return greetings[language] || 'Hi! Ask naturally—even with short phrases or minor spelling mistakes. I can fill a route, check configured provider APIs, answer travel questions, and explain the TravelMate demo-booking flow.'
}

function cleanHistory(messages) {
  return messages.slice(-10).map(({ role, content }) => ({ role, content }))
}

function resultLine(item, transport) {
  const name = item?.serviceName || item?.service || item?.airline || item?.provider || `${transport} option`
  const code = item?.code ? ` — ${item.code}` : ''
  const departure = item?.departure || item?.depart
  const arrival = item?.arrival || item?.arrive
  const timing = departure || arrival ? ` · ${departure || 'Check departure'} → ${arrival || 'Check arrival'}` : ''
  return `• ${name}${code}${timing}`
}

function providerSummary(data, nextPlan) {
  const transport = nextPlan.transportMode || 'Transport'
  const route = `${nextPlan.from || 'From'} to ${nextPlan.to || 'To'}`
  const results = Array.isArray(data?.results) ? data.results : []

  if (!results.length) {
    return `I filled ${route} in the planner. The ${transport.toLowerCase()} provider check did not return a service name or number: ${data?.message || 'no provider rows were available'}. I will not invent one. You can still tap “Check live schedule/status” and retry after confirming the API subscription and route details. Direct booking remains a demo; licensed/authorized in-app booking is coming soon.`
  }

  const source = data?.mode === 'live' ? 'Live provider API suggestions' : 'Provider/fallback suggestions'
  const lines = results.slice(0, 5).map((item) => resultLine(item, transport)).join('\n')
  return `${source} for ${route}:\n${lines}\n\nVerify the selected service on the official provider before travel. In TravelMate, choose a result and tap “Start demo booking”. The current flow is a demo using configured train, flight, and bus APIs; the guided form only simulates passenger details, contact details, payment-type choice, and confirmation; no payment, ticket, seat, or PNR is created. Licensed/authorized direct booking is coming soon.`
}

async function localizeAssistantText(language, text) {
  const source = String(text || '').trim()
  if (!source || language === 'en') return { text: source, localized: true }
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ language, strings: [source] })
    })
    const data = await response.json().catch(() => ({}))
    const translated = data?.translations?.[source]
    if (!response.ok || !data.ok || !translated) return { text: source, localized: false }
    return { text: String(translated).trim(), localized: true }
  } catch {
    return { text: source, localized: false }
  }
}

export default function SmartAssistant({ plan, update, setManualMode, onPlanApplied, toast, language = 'en', embedded = false }) {
  const [open, setOpen] = useState(Boolean(embedded))
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState(() => [{ role: 'assistant', content: greeting(language), localized: true }])
  const listRef = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    // A language change starts a fresh conversation so old assistant messages do not remain
    // in the previous language. User-entered planner fields are preserved separately.
    setMessages([{ role: 'assistant', content: greeting(language), localized: true }])
    setPrompt('')
  }, [language])

  useEffect(() => {
    if (!open || embedded) return undefined
    const previousOverflow = document.body.style.overflow
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleEscape)
    }
  }, [open, embedded])

  async function sendMessage(value = prompt) {
    const message = String(value || '').trim()
    if (!message || loading) return

    const userMessage = { role: 'user', content: message }
    const history = cleanHistory(messages)
    setMessages((current) => [...current, userMessage])
    setPrompt('')
    setLoading(true)

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ message, history, plan, language })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.ok) throw new Error(data.message || `Assistant request failed (${response.status}).`)

      const reply = String(data.reply || 'I could not generate a useful answer. Please try again.').trim()
      setMessages((current) => [...current, { role: 'assistant', content: reply, localized: true }])

      let nextPlan = plan
      if (data.applyPlan && data.planPatch && Object.keys(data.planPatch).length) {
        nextPlan = { ...plan, ...data.planPatch }
        update?.(data.planPatch)
        if (data.plannerMode) setManualMode?.(data.plannerMode)
        toast?.('The assistant filled your planner. Review the fields and provider results before travel.')
      }

      if (data.shouldCheckProviders && onPlanApplied) {
        const providerData = await onPlanApplied(nextPlan)
        const summary = await localizeAssistantText(language, providerSummary(providerData, nextPlan))
        setMessages((current) => [...current, {
          role: 'assistant',
          content: summary.text,
          localized: summary.localized
        }])
      }
    } catch (error) {
      const missingKey = /SAMBANOVA_API_KEY|not configured/i.test(error.message || '')
      const fallback = missingKey
        ? 'The AI service is not configured on this deployment. Add SAMBANOVA_API_KEY in this exact Vercel project for Preview and Production, then redeploy.'
        : `I could not reach the AI service just now. ${error.message || 'Please try again.'}`
      const reply = await localizeAssistantText(language, fallback)
      setMessages((current) => [...current, { role: 'assistant', content: reply.text, localized: reply.localized, error: true }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {!embedded && !open && (
        <button
          type="button"
          className="assistant-launcher"
          onClick={() => setOpen(true)}
          aria-expanded="false"
          aria-controls="travelmate-smart-assistant"
        >
          <Bot size={21} aria-hidden="true" /><span className="assistant-launcher-label">Smart Assistant</span>
        </button>
      )}

      {open && (
        <section id="travelmate-smart-assistant" className={`assistant-panel ${embedded ? 'assistant-panel-embedded' : ''}`} role="dialog" aria-modal="true" aria-label="AI travel assistant">
          <header className="assistant-panel-header">
            <div className="assistant-panel-header-copy">
              <p className="badge"><Sparkles size={14} aria-hidden="true" /> AI travel assistant</p>
              <h3 className="mt-3 text-xl font-black text-white">Ask TravelMate</h3>
              <p className="mt-1 text-xs text-slate-400">Ask in your own words. Short phrases and minor spelling mistakes are supported. TravelMate can fill the planner, check configured provider APIs, and explain the demo-booking flow. Licensed direct booking is coming soon.</p>
            </div>
            <button type="button" className="dialog-close-button assistant-close-button" onClick={() => setOpen(false)} aria-label="Close Smart Assistant" title="Close assistant"><X size={22} aria-hidden="true" /></button>
          </header>

          <div ref={listRef} className="assistant-messages mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  data-no-translate={message.role === 'user' || message.localized ? '' : undefined}
                  className={`assistant-message max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'bg-cyan-400 font-semibold text-slate-950'
                    : message.error
                      ? 'border border-red-400/30 bg-red-500/10 text-red-100'
                      : 'border border-slate-700 bg-slate-900 text-slate-100'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-300">
                  <LoaderCircle className="animate-spin" size={16} aria-hidden="true" /> Thinking and checking the planner…
                </div>
              </div>
            )}
          </div>

          <div className="assistant-prompts mt-3">
            {samplePrompts.map((item) => (
              <button key={item} type="button" className="assistant-prompt-chip" onClick={(event) => setPrompt(event.currentTarget.textContent || item)}>
                {item}
              </button>
            ))}
          </div>

          <div className="assistant-composer mt-3 flex min-w-0 items-end gap-2">
            <textarea
              className="input min-h-[52px] min-w-0 max-h-32 flex-1 resize-y"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Example: tiket from Kochi to Chennai by train"
              disabled={loading}
            />
            <button type="button" className="btn-primary assistant-send" onClick={() => sendMessage()} disabled={loading || !prompt.trim()} aria-label="Send message">
              {loading ? <LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> : <Send size={18} aria-hidden="true" />}
            </button>
          </div>

          <p className="assistant-hint mt-2 flex items-center gap-1.5 text-[11px] text-slate-500"><CheckCircle2 size={13} aria-hidden="true" /> Natural route phrases are applied when the origin and destination are clear. Ambiguous requests require clarification. Review all API results before proceeding.</p>
        </section>
      )}
    </>
  )
}

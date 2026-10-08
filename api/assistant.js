import { createSambaNovaResponse } from './_sambanova.js'
import { prepareApiRequest, readJsonBody, providerStatus } from './_security.js'

const languageNames = {
  en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil', kn: 'Kannada', ml: 'Malayalam',
  mr: 'Marathi', bn: 'Bengali', gu: 'Gujarati', ur: 'Urdu', es: 'Spanish', fr: 'French', de: 'German'
}

const allowedTransports = new Set(['Train', 'Flight', 'Bus'])
const allowedModes = new Set(['normal', 'emergency', 'low-network'])

function todayInIndia() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

function cleanText(value, max = 1200) {
  return String(value || '').replace(/\0/g, '').trim().slice(0, max)
}

function cleanPlan(value = {}) {
  return {
    from: cleanText(value.from, 80),
    to: cleanText(value.to, 80),
    date: /^\d{4}-\d{2}-\d{2}$/.test(String(value.date || '')) ? String(value.date) : '',
    transportMode: allowedTransports.has(value.transportMode) ? value.transportMode : 'Train',
    passengers: Math.min(6, Math.max(1, Number(value.passengers || 1))),
    budget: Math.min(1_000_000, Math.max(0, Number(value.budget || 0))),
    urgency: cleanText(value.urgency, 30),
    classType: cleanText(value.classType, 60),
    routeCombo: cleanText(value.routeCombo, 80)
  }
}

function cleanHistory(value) {
  if (!Array.isArray(value)) return []
  return value.slice(-4).map((item) => ({
    role: item?.role === 'assistant' ? 'assistant' : 'user',
    content: cleanText(item?.content, 450)
  })).filter((item) => item.content)
}

export function normalizeTravelMessage(message) {
  return cleanText(message, 1200)
    .replace(/[–—→➡➜➔]/g, ' to ')
    .replace(/\b(?:fron|frm|froom)\b/gi, 'from')
    .replace(/\b(?:too|2)\b/gi, 'to')
    .replace(/\b(?:tiketd|tikets?|tickts?|tikt|tikcet|tickit|ticktes)\b/gi, 'ticket')
    .replace(/\b(?:bok|boook|buk|boking|bookng)\b/gi, 'book')
    .replace(/\b(?:flite|fligt|flght|aeroplane)\b/gi, 'flight')
    .replace(/\b(?:trian|trane|railwy)\b/gi, 'train')
    .replace(/\b(?:buss|buseses)\b/gi, 'bus')
    .replace(/\b(?:destnation|destinaton|destionation)\b/gi, 'destination')
    .replace(/\s+/g, ' ')
    .trim()
}

function trimPlace(value) {
  return cleanText(value, 80)
    .replace(/^[\s,.:;|/\\-]+|[\s,.:;|/\\-]+$/g, '')
    .replace(/\b(?:please|kindly)$/i, '')
    .trim()
}

function removeIntentHead(value) {
  let text = trimPlace(value)
  const patterns = [
    /^(?:please\s+|kindly\s+)?(?:can|could|will|would)\s+you\s+/i,
    /^(?:please\s+|kindly\s+)?(?:i\s+)?(?:want|need|would\s+like|am\s+looking\s+for)\s+(?:to\s+)?/i,
    /^(?:please\s+|kindly\s+)?(?:find|show|give|search|check|suggest|plan|make|prepare)\s+(?:me\s+)?/i,
    /^(?:a\s+|an\s+|some\s+)?(?:book|booking|reserve|reservation|purchase|ticket|tickets|trip|journey|route|travel)\s+(?:me\s+)?(?:for\s+|on\s+)?(?:a\s+|an\s+|some\s+)?/i,
    /^(?:me\s+)?(?:a\s+|an\s+|some\s+)/i,
    /^(?:by\s+)?(?:train|rail|railway|flight|plane|airline|bus|coach)\s+/i
  ]

  let changed = true
  while (changed) {
    changed = false
    for (const pattern of patterns) {
      const next = text.replace(pattern, '').trim()
      if (next !== text) {
        text = next
        changed = true
      }
    }
  }
  return trimPlace(text)
}

function trimDestinationTail(value) {
  const first = String(value || '').split(/\b(?:by|via|using|on|for|with|tomorrow|today|tonight|next\s+week|next\s+month|under|budget|passengers?|class|cabin|urgent|emergency|tickets?|booking|book|reserve|reservation|flight|flights|plane|planes|train|trains|bus|buses|coach|please|kindly)\b/i)[0]
  return trimPlace(first)
}

function routePair(fromValue, toValue) {
  const from = removeIntentHead(fromValue)
  const to = trimDestinationTail(toValue)
  if (!from || !to || from.length < 2 || to.length < 2) return null
  if (/^(?:how|what|where|when|why|who)$/i.test(from)) return null
  if (from.toLowerCase() === to.toLowerCase()) return null
  return { from, to }
}

function detectTransport(text) {
  if (/\b(?:flight|plane|air\s*travel|airline|fly|flying)\b/i.test(text)) return 'Flight'
  if (/\b(?:bus|coach|roadways?)\b/i.test(text)) return 'Bus'
  if (/\b(?:train|rail|railway)\b/i.test(text)) return 'Train'
  return ''
}

function transportPatch(transportMode) {
  if (transportMode === 'Flight') return { transportMode: 'Flight', routeCombo: 'Flight only', classType: 'Economy' }
  if (transportMode === 'Bus') return { transportMode: 'Bus', routeCombo: 'Bus only', classType: 'AC Seater' }
  if (transportMode === 'Train') return { transportMode: 'Train', routeCombo: 'Train only', classType: 'Sleeper (SL)' }
  return {}
}

export function extractRouteIntent(message) {
  const text = normalizeTravelMessage(message)
  const lower = text.toLowerCase()
  const transportMode = detectTransport(text)
  const patch = transportPatch(transportMode)
  const bookingIntent = /\b(?:book|booking|ticket|tickets|reserve|reservation|purchase|fare|seat)\b/i.test(lower)
  const travelCue = Boolean(transportMode || bookingIntent || /\b(?:travel|trip|journey|route|go|going|reach|depart|arrive)\b/i.test(lower))

  const patterns = [
    /\bfrom\s+(.{2,100}?)\s+(?:to|towards|until|going\s+to|destination\s+(?:is|:)?)\s+(.{2,160})$/i,
    /\borigin\s*(?:is|:)?\s*(.{2,100}?)\s+(?:destination|dest)\s*(?:is|:)?\s*(.{2,160})$/i,
    /\bbetween\s+(.{2,100}?)\s+and\s+(.{2,160})$/i
  ]

  let pair = null
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      pair = routePair(match[1], match[2])
      if (pair) break
    }
  }

  if (!pair && travelCue) {
    const broad = text.match(/^(.{2,120}?)\s+(?:to|towards)\s+(.{2,160})$/i)
    if (broad) pair = routePair(broad[1], broad[2])
  }

  if (pair) Object.assign(patch, pair)

  return {
    patch,
    routeDetected: Boolean(pair),
    bookingIntent,
    transportDetected: Boolean(transportMode),
    normalizedMessage: text
  }
}

const responseSchema = {
  type: 'object',
  properties: {
    reply: { type: 'string' },
    applyPlan: { type: 'boolean' },
    mode: { type: ['string', 'null'], enum: ['normal', 'emergency', 'low-network', null] },
    planPatch: {
      type: 'object',
      properties: {
        from: { type: ['string', 'null'] },
        to: { type: ['string', 'null'] },
        date: { type: ['string', 'null'] },
        transportMode: { type: ['string', 'null'], enum: ['Train', 'Flight', 'Bus', null] },
        passengers: { type: ['integer', 'null'], minimum: 1, maximum: 6 },
        budget: { type: ['number', 'null'], minimum: 0, maximum: 1000000 },
        urgency: { type: ['string', 'null'] },
        classType: { type: ['string', 'null'] },
        routeCombo: { type: ['string', 'null'] }
      },
      required: ['from', 'to', 'date', 'transportMode', 'passengers', 'budget', 'urgency', 'classType', 'routeCombo'],
      additionalProperties: false
    }
  },
  required: ['reply', 'applyPlan', 'mode', 'planPatch'],
  additionalProperties: false
}

function sanitizePatch(raw = {}) {
  const patch = {}
  if (raw.from) patch.from = cleanText(raw.from, 80)
  if (raw.to) patch.to = cleanText(raw.to, 80)
  if (raw.date && /^\d{4}-\d{2}-\d{2}$/.test(raw.date)) patch.date = raw.date
  if (allowedTransports.has(raw.transportMode)) patch.transportMode = raw.transportMode
  if (Number.isInteger(raw.passengers)) patch.passengers = Math.min(6, Math.max(1, raw.passengers))
  if (Number.isFinite(raw.budget)) patch.budget = Math.min(1_000_000, Math.max(0, raw.budget))
  if (raw.urgency) patch.urgency = cleanText(raw.urgency, 30)
  if (raw.classType) patch.classType = cleanText(raw.classType, 60)
  if (raw.routeCombo) patch.routeCombo = cleanText(raw.routeCombo, 80)
  return patch
}

function needsDisclosure(reply) {
  const text = String(reply || '')
  return !(/\bdemo\b/i.test(text) && /\b(?:licen[cs]e|authori[sz](?:ed|ation)|coming soon)\b/i.test(text))
}

function bookingDisclosure(plan) {
  const route = plan.from && plan.to ? ` for ${plan.from} to ${plan.to}` : ''
  return `TravelMate booking demo${route}: review the route, tap “Check live schedule/status”, choose an API-labelled train, flight, or bus result, and tap “Prepare official booking”. Direct payment, ticket issuance, and confirmed PNR/booking are not active inside TravelMate yet. This is a demo booking flow using live provider APIs where configured; licensed/authorized in-app booking is coming soon.`
}

function shouldCheckProvider(currentPlan, patch, intent) {
  const nextPlan = { ...currentPlan, ...patch }
  return Boolean(
    nextPlan.from && nextPlan.to &&
    (intent.routeDetected || intent.bookingIntent || intent.transportDetected || patch.from || patch.to || patch.transportMode)
  )
}

function localFallbackReply(currentPlan, patch, intent, error) {
  const nextPlan = { ...currentPlan, ...patch }
  const route = nextPlan.from && nextPlan.to ? `${nextPlan.from} to ${nextPlan.to}` : 'your current route'
  const transport = nextPlan.transportMode || 'selected transport'
  const reason = error?.code === 'SAMBANOVA_NOT_CONFIGURED'
    ? 'The conversational AI key is not configured on this deployment.'
    : 'The conversational AI service is temporarily unavailable.'
  const action = intent.routeDetected
    ? `I still understood the request and filled ${route} using ${transport}.`
    : `I can still explain the TravelMate booking flow for ${route}.`
  return `${reason} ${action}\n\n${bookingDisclosure(nextPlan)}`
}

function generalLocalFallbackReply(message, currentPlan, error) {
  const text = normalizeTravelMessage(message).toLowerCase()
  if (/^(?:hi|hii+|hello|hey|namaste|good morning|good evening)[.! ]*$/.test(text)) {
    return 'Hi! I’m TravelMate. I can help with routes, trains, flights, buses, packing, safety, and the TravelMate demo-booking flow. The live AI provider is responding slowly right now, but you can still tell me your From, To, and transport mode.'
  }
  if (/overnight train|what should i carry|packing|pack for/.test(text)) {
    return 'For an overnight train, carry a valid ID, ticket or PNR details, phone charger and power bank, water, light food, basic medicines, a small lock, tissues, sanitizer, and a light blanket or shawl. Keep valuables close and verify coach and platform details through an official railway source.'
  }
  if (/book|booking|ticket|tickets/.test(text)) {
    return bookingDisclosure(currentPlan)
  }
  if (/emergency|unsafe|danger|ambulance|police/.test(text)) {
    return 'For immediate danger in India, call 112. For an ambulance, call 108. Use TravelMate Safety Mode to prepare an SMS or WhatsApp message with your current location.'
  }
  const reason = error?.code === 'PROVIDER_TIMEOUT'
    ? 'The live AI provider took too long to respond.'
    : 'The live AI provider is temporarily unavailable.'
  return `${reason} You can still enter a route such as “train from Kochi to Chennai”, and TravelMate will fill the planner and check configured provider APIs.`
}

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { methods: ['POST'], rateLimit: 18, useGlobalAuth: false })) return

  let message = ''
  let currentPlan = cleanPlan({})
  let deterministicIntent = extractRouteIntent('')

  try {
    const body = await readJsonBody(req, 64_000)

    // Feature 7.a: Grounded Natural-Language Query to Structured JSON
    if (body?.action === 'parse_query') {
      const { parseNaturalLanguageQuery } = await import('../server/adapters/aiProvider.js')
      try {
        const parsed = await parseNaturalLanguageQuery(body.query || '')
        return res.status(200).json({ ok: true, mode: 'grounded-query', data: parsed })
      } catch (err) {
        return res.status(400).json({ ok: false, error: err.message })
      }
    }

    // Feature 7.b: Grounded Route Rationale (strictly 2 sentences from computed facts)
    if (body?.action === 'route_rationale') {
      const { generateRouteRationale } = await import('../server/adapters/aiProvider.js')
      try {
        const rationale = await generateRouteRationale(body.facts || {})
        return res.status(200).json({ ok: true, mode: 'grounded-rationale', rationale })
      } catch (err) {
        return res.status(400).json({ ok: false, error: err.message })
      }
    }

    message = cleanText(body.message, 1200)
    if (!message) return res.status(400).json({ ok: false, mode: 'invalid', message: 'Enter a message for the assistant.' })

    const languageCode = Object.hasOwn(languageNames, body.language) ? body.language : 'en'
    const language = languageNames[languageCode]
    currentPlan = cleanPlan(body.plan)
    const history = cleanHistory(body.history)
    const conversation = history.map((item) => ({ role: item.role, content: item.content }))
    conversation.push({ role: 'user', content: message })

    deterministicIntent = extractRouteIntent(message)
    const routeRule = `Understand natural travel requests without requiring one fixed sentence pattern. Tolerate minor spelling mistakes, missing punctuation, short commands, and informal phrases such as “tickets Kochi to Chennai”, “book me Delhi Mumbai flight”, “need train between Pune and Goa”, or “go from Hyderabad to Bengaluru”. Infer origin, destination, transport, date, passenger count, class, and budget only when reasonably clear. If the origin or destination is ambiguous, ask one concise clarification question instead of guessing. When a clear route is present, set applyPlan=true and return the fields in planPatch even when the user did not use the words “update” or “fill”. If transport is omitted, retain the currently selected transport mode.`
    const bookingRule = `Whenever the user gives a route or asks about tickets/booking, include a short “How booking works in TravelMate” explanation: (1) TravelMate fills the planner, (2) the user taps Check live schedule/status, (3) live provider APIs may return train names/numbers, flight numbers, or bus services, (4) the user selects a result and taps Prepare official booking. State clearly that current booking is a demo; TravelMate does not issue tickets, take payment, create a PNR, or confirm seats. Licensed/authorized direct in-app booking is coming soon. Never invent a train name, train number, flight number, bus operator, schedule, price, or availability; those suggestions must come from the provider API results shown by the app.`
    const instructions = `You are TravelMate, a friendly, practical travel-planning assistant for India. Respond in ${language}. Be conversational like a helpful chat assistant, concise, and honest. You may answer any ordinary travel-planning question, not only commands that match a template. You can help with routes, transport choices, budgets, packing, preparation, accessibility, safety, and how to use this app. ${routeRule} ${bookingRule} Never claim that a ticket is booked, a fare is live, or a seat is confirmed unless the user independently verifies it with an official provider. Never invent live schedules, prices, availability, emergency events, or legal/medical facts. For urgent danger, tell the user to call the relevant emergency service immediately. Current planner state: ${JSON.stringify(currentPlan)}. Fill only fields supported by the user's words; leave unsupported fields null. Use ISO YYYY-MM-DD dates when inferable. Today in India is ${todayInIndia()}.`

    const primaryModel = process.env.SAMBANOVA_ASSISTANT_MODEL || process.env.SAMBANOVA_MODEL || 'Meta-Llama-3.3-70B-Instruct'
    const fallbackModel = process.env.SAMBANOVA_FALLBACK_MODEL || 'Meta-Llama-3.3-70B-Instruct'
    const requestAssistant = (model, timeoutMs, maxOutputTokens) => createSambaNovaResponse({
      input: conversation,
      instructions,
      model,
      maxOutputTokens,
      timeoutMs,
      reasoningEffort: 'low',
      schema: responseSchema,
      schemaName: 'travelmate_assistant_reply'
    })

    let assistantResponse
    try {
      assistantResponse = await requestAssistant(primaryModel, 32_000, 1200)
    } catch (error) {
      const shouldRetryFastModel = error?.code === 'PROVIDER_TIMEOUT' && fallbackModel && fallbackModel !== primaryModel
      if (!shouldRetryFastModel) throw error
      assistantResponse = await requestAssistant(fallbackModel, 20_000, 900)
    }

    const { text, json } = assistantResponse

    const parsed = json || JSON.parse(text)
    const modelPatch = sanitizePatch(parsed.planPatch)
    const deterministicPatch = sanitizePatch(deterministicIntent.patch)
    const patch = { ...modelPatch, ...deterministicPatch }
    const mode = allowedModes.has(parsed.mode) ? parsed.mode : null
    const nextPlan = { ...currentPlan, ...patch }
    const hasRouteChange = Boolean(patch.from || patch.to)
    const shouldExplainBooking = deterministicIntent.routeDetected || deterministicIntent.bookingIntent || hasRouteChange
    let reply = cleanText(parsed.reply, 4000)

    if (shouldExplainBooking && needsDisclosure(reply)) {
      reply = `${reply}\n\n${bookingDisclosure(nextPlan)}`.trim()
    }

    const shouldCheckProviders = shouldCheckProvider(currentPlan, patch, deterministicIntent)
    const applyPlan = Boolean(Object.keys(patch).length && (parsed.applyPlan || deterministicIntent.routeDetected || hasRouteChange))

    return res.status(200).json({
      ok: true,
      mode: 'ai',
      provider: 'SambaNova',
      reply,
      applyPlan,
      plannerMode: mode,
      planPatch: patch,
      shouldCheckProviders,
      bookingDemo: shouldExplainBooking
    })
  } catch (error) {
    const deterministicPatch = sanitizePatch(deterministicIntent.patch)
    const canUseLocalFallback = Boolean(
      (deterministicIntent.routeDetected || deterministicIntent.bookingIntent) &&
      ({ ...currentPlan, ...deterministicPatch }).from &&
      ({ ...currentPlan, ...deterministicPatch }).to
    )

    if (canUseLocalFallback) {
      return res.status(200).json({
        ok: true,
        mode: 'local-fallback',
        provider: 'TravelMate route parser',
        reply: localFallbackReply(currentPlan, deterministicPatch, deterministicIntent, error),
        applyPlan: Boolean(Object.keys(deterministicPatch).length),
        plannerMode: null,
        planPatch: deterministicPatch,
        shouldCheckProviders: shouldCheckProvider(currentPlan, deterministicPatch, deterministicIntent),
        bookingDemo: true,
        warning: error.message || 'SambaNova was unavailable.'
      })
    }

    const recoverable = ['PROVIDER_TIMEOUT', 'SAMBANOVA_REQUEST_FAILED', 'SAMBANOVA_EMPTY_RESPONSE', 'SAMBANOVA_INVALID_JSON'].includes(error?.code)
    if (recoverable) {
      return res.status(200).json({
        ok: true,
        mode: 'local-fallback',
        provider: 'TravelMate local assistant',
        reply: generalLocalFallbackReply(message, currentPlan, error),
        applyPlan: false,
        plannerMode: null,
        planPatch: {},
        shouldCheckProviders: false,
        bookingDemo: /book|booking|ticket/i.test(message),
        warning: error.message || 'SambaNova was unavailable.'
      })
    }

    const status = Number(error.status || providerStatus(error))
    return res.status(status).json({
      ok: false,
      mode: error.code === 'SAMBANOVA_NOT_CONFIGURED' ? 'provider-unconfigured' : 'provider-error',
      provider: 'SambaNova',
      message: error.message || 'The AI assistant could not respond.',
      error: error.code || 'SAMBANOVA_ASSISTANT_ERROR'
    })
  }
}

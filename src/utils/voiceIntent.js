const CITY_ALIASES = {
  dilli: 'Delhi',
  bombay: 'Mumbai',
  bangalore: 'Bengaluru',
  blr: 'Bengaluru',
  calcutta: 'Kolkata',
  madras: 'Chennai',
  hydrabad: 'Hyderabad',
  banaras: 'Varanasi',
  kashi: 'Varanasi',
  cochin: 'Kochi',
  trivandrum: 'Thiruvananthapuram',
  vizag: 'Visakhapatnam',
  poona: 'Pune',
  amdavad: 'Ahmedabad',
  bbsr: 'Bhubaneswar'
}

function cleanText(value = '') {
  return String(value)
    .replace(/[–—→➡➜]/g, ' to ')
    .replace(/\b(?:fron|frm|froom)\b/gi, 'from')
    .replace(/\b(?:too|2)\b/gi, 'to')
    .replace(/\b(?:tiketd|tikets?|tickts?|tikt|tikcet|tickit|ticktes)\b/gi, 'ticket')
    .replace(/\b(?:bok|boook|buk|boking|bookng)\b/gi, 'book')
    .replace(/\b(?:flite|fligt|flght|aeroplane)\b/gi, 'flight')
    .replace(/\b(?:trian|trane|railwy)\b/gi, 'train')
    .replace(/\b(?:buss|buseses)\b/gi, 'bus')
    .replace(/\b(?:tatkl|tatkaal|tatkal ticketing)\b/gi, 'tatkal')
    .replace(/[^a-z0-9\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleCase(value = '') {
  return String(value)
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function resolveCityAlias(name = '') {
  const clean = name.trim().toLowerCase()
  return CITY_ALIASES[clean] || titleCase(name)
}

function trimLocation(value = '') {
  return String(value)
    .replace(/^[\s,.:;|/\\-]+|[\s,.:;|/\\-]+$/g, '')
    .replace(/\b(?:please|kindly)$/i, '')
    .trim()
}

function stripLeadingIntent(value = '') {
  let text = trimLocation(value)
  const patterns = [
    /^(?:please\s+|kindly\s+)?(?:can|could|will|would)\s+you\s+/i,
    /^(?:please\s+|kindly\s+)?(?:i\s+)?(?:want|need|would\s+like|am\s+looking\s+for)\s+(?:to\s+)?/i,
    /^(?:please\s+|kindly\s+)?(?:find|show|give|search|check|suggest|plan|make|prepare|open)\s+(?:me\s+)?/i,
    /^(?:a\s+|an\s+|some\s+)?(?:book|booking|reserve|reservation|purchase|ticket|tickets|trip|journey|route|travel)\s+(?:for\s+|on\s+)?/i,
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
  return trimLocation(text)
}

function trimDestination(value = '') {
  return trimLocation(String(value).split(/\b(?:by|via|using|on|for|with|tomorrow|today|tonight|next\s+week|next\s+month|under|budget|passengers?|people|class|cabin|urgent|emergency|tatkal|tickets?|booking|book|reserve|reservation|please|kindly|live|available|status|schedule)\b/i)[0])
}

function routePair(fromValue, toValue) {
  const from = stripLeadingIntent(fromValue)
  const to = trimDestination(toValue)
  if (!from || !to || from.length < 2 || to.length < 2) return null
  if (from.toLowerCase() === to.toLowerCase()) return null
  return { from: resolveCityAlias(from), to: resolveCityAlias(to) }
}

function detectRoute(text) {
  const patterns = [
    /\bfrom\s+(.{2,100}?)\s+(?:to|towards|until|going\s+to|destination\s+(?:is|:)?)\s+(.{2,160})$/i,
    /\borigin\s*(?:is|:)?\s*(.{2,100}?)\s+(?:destination|dest)\s*(?:is|:)?\s*(.{2,160})$/i,
    /\bbetween\s+(.{2,100}?)\s+and\s+(.{2,160})$/i
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (!match) continue
    const pair = routePair(match[1], match[2])
    if (pair) return pair
  }

  const broad = text.match(/^(.{2,120}?)\s+(?:to|towards)\s+(.{2,160})$/i)
  return broad ? routePair(broad[1], broad[2]) : null
}

function detectTransport(text) {
  if (/\b(?:flight|plane|air\s*travel|airline|fly|flying)\b/i.test(text)) return 'Flight'
  if (/\b(?:bus|coach|roadways?)\b/i.test(text)) return 'Bus'
  if (/\b(?:train|rail|railway|tatkal)\b/i.test(text)) return 'Train'
  return ''
}

function transportPatch(transportMode) {
  if (transportMode === 'Flight') return { transportMode: 'Flight', routeCombo: 'Flight only', classType: 'Economy' }
  if (transportMode === 'Bus') return { transportMode: 'Bus', routeCombo: 'Bus only', classType: 'AC Seater' }
  if (transportMode === 'Train') return { transportMode: 'Train', routeCombo: 'Train only', classType: 'Sleeper (SL)' }
  return {}
}

export function extractVoiceDate(text = '', baseDate = new Date()) {
  const lower = String(text).toLowerCase()
  const d = new Date(baseDate)

  if (/\b(?:today|tonight)\b/i.test(lower)) {
    return {
      date: d.toISOString().split('T')[0],
      label: 'today',
      timeOfDay: /\btonight\b/i.test(lower) ? 'night' : 'anytime'
    }
  }

  if (/\bday\s+after\s+tomorrow\b/i.test(lower)) {
    d.setDate(d.getDate() + 2)
    return {
      date: d.toISOString().split('T')[0],
      label: 'day after tomorrow',
      timeOfDay: /\bmorning\b/i.test(lower) ? 'morning' : /\bnight\b/i.test(lower) ? 'night' : 'anytime'
    }
  }

  if (/\btomorrow\b/i.test(lower)) {
    d.setDate(d.getDate() + 1)
    return {
      date: d.toISOString().split('T')[0],
      label: 'tomorrow',
      timeOfDay: /\bmorning\b/i.test(lower) ? 'morning' : /\bevening\b/i.test(lower) ? 'evening' : /\bnight\b/i.test(lower) ? 'night' : 'anytime'
    }
  }

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  for (let i = 0; i < daysOfWeek.length; i++) {
    const dayName = daysOfWeek[i]
    if (new RegExp(`\\b(?:next\\s+)?${dayName}\\b`, 'i').test(lower)) {
      const currentDay = d.getDay()
      let diff = i - currentDay
      if (diff <= 0) diff += 7
      d.setDate(d.getDate() + diff)
      return {
        date: d.toISOString().split('T')[0],
        label: `next ${dayName}`,
        timeOfDay: 'anytime'
      }
    }
  }

  return null
}

export function speakRouteConfirmation(parsedIntent, options = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null

  const { plan } = parsedIntent || {}
  if (!plan?.from || !plan?.to) return null

  const mode = plan.transportMode || 'multimodal transport'
  const dateStr = plan.dateLabel ? ` for ${plan.dateLabel}` : ''
  const spokenText = `Routing from ${plan.from} to ${plan.to} by ${mode}${dateStr}. Reviewing options.`

  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(spokenText)
    utterance.lang = options.lang || 'en-IN'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
    return spokenText
  } catch {
    return null
  }
}

export function parseVoiceIntent(rawCommand = '') {
  const normalized = cleanText(rawCommand)
  const lower = normalized.toLowerCase()
  if (!lower) return { intent: 'none', action: 'none', plan: {}, mode: null, routeDetected: false, message: 'No voice search captured.' }

  const hasTatkal = /\b(?:tatkal|emergency\s+(?:ticket|train|booking))\b/i.test(lower)
  const hasTravelWords = /\b(?:planner|ticket|tickets|route|train|flight|bus|travel|trip|journey|book|booking|tatkal)\b/i.test(lower)
  const explicitSafety = /\b(?:open\s+)?safety(?:\s+mode)?\b|\bsos\b|\bambulance\b|\bpolice\b|\brobbery\b|\baccident\b|\bmedical\s+emergency\b/i.test(lower)

  if (explicitSafety || (lower === 'emergency' && !hasTravelWords)) {
    return { intent: 'safety', action: 'open-safety', plan: {}, mode: null, routeDetected: false, message: 'Opened Safety Mode.' }
  }
  if (/\b(?:open\s+)?saved(?:\s+plans?)?\b/i.test(lower)) {
    return { intent: 'saved', action: 'open-saved', plan: {}, mode: null, routeDetected: false, message: 'Opened Saved Plans.' }
  }
  if (/\b(?:open\s+)?analy[sz]e(?:\s+journey)?\b|\banalysis\b/i.test(lower)) {
    return { intent: 'analyze', action: 'open-analyze', plan: {}, mode: null, routeDetected: false, message: 'Opened Analyze Journey.' }
  }

  const route = detectRoute(normalized)
  const transportMode = detectTransport(normalized)
  const plan = { ...transportPatch(transportMode) }
  if (route) Object.assign(plan, route)

  // Extract date if present
  const dateInfo = extractVoiceDate(rawCommand)
  if (dateInfo) {
    plan.date = dateInfo.date
    plan.dateLabel = dateInfo.label
    plan.timeOfDay = dateInfo.timeOfDay
  }

  const budgetMatch = lower.match(/(?:under|budget|below)\s*(?:rs|rupees)?\s*(\d+)/)
  const passengerMatch = lower.match(/(\d+)\s*(?:passenger|passengers|people|person)/)
  if (budgetMatch) plan.budget = Number(budgetMatch[1])
  if (passengerMatch) plan.passengers = Math.min(6, Math.max(1, Number(passengerMatch[1])))

  const lowNetwork = /\b(?:low\s+signal|offline|low\s+network)\b/i.test(lower)
  const mode = hasTatkal ? 'emergency' : lowNetwork ? 'low-network' : 'normal'
  if (hasTatkal) {
    Object.assign(plan, transportPatch('Train'), {
      ticketType: 'Tatkal / Emergency',
      quota: 'Tatkal / Emergency',
      urgency: 'Emergency'
    })
  }

  const explicitDemoBooking = /\b(?:open|start|show|begin|launch|continue)\s+(?:the\s+)?(?:demo\s+)?booking\b|\b(?:demo\s+booking|booking\s+demo)\b/i.test(lower)
  const explicitLiveCheck = /\b(?:check|show|find|search|refresh)\b.{0,35}\b(?:live|available|availability|schedule|status)\b|\b(?:live|available)\b.{0,35}\b(?:train|flight|bus|ticket|tickets)\b/i.test(lower)
  const action = explicitDemoBooking
    ? 'open-demo-booking'
    : hasTatkal && explicitLiveCheck
      ? 'check-tatkal-live'
      : hasTatkal
        ? 'open-tatkal'
        : explicitLiveCheck
          ? 'check-live'
          : 'fill-planner'

  const shouldOpenPlanner = hasTravelWords || Boolean(route) || Boolean(transportMode) || explicitDemoBooking || explicitLiveCheck || lowNetwork
  if (!shouldOpenPlanner) {
    return { intent: 'home', action: 'open-home', plan: {}, mode: null, routeDetected: false, message: 'Try saying train from Hyderabad to Delhi.' }
  }

  const routeText = route ? `${route.from} to ${route.to}` : 'the planner'
  const messages = {
    'open-demo-booking': route ? `Filled ${routeText} and opened the demo booking.` : 'Opened the demo booking for the current planner route.',
    'check-tatkal-live': route ? `Opened Tatkal mode for ${routeText} and started the live train check.` : 'Opened Tatkal mode and started the live train check.',
    'open-tatkal': route ? `Filled ${routeText} and opened Tatkal mode.` : 'Opened Tatkal emergency mode.',
    'check-live': route ? `Filled ${routeText} and started the live provider check.` : 'Started the live provider check for the current route.',
    'fill-planner': route ? `Filled ${routeText}. Review the planner and choose when to check live results.` : 'Opened the planner. Add or review the journey details.'
  }

  return {
    intent: 'planner',
    action,
    plan,
    mode,
    routeDetected: Boolean(route),
    normalized,
    message: messages[action]
  }
}

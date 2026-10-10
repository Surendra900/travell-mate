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

export function formatTierSpeechSummary(route) {
  if (!route) return ''
  const tierName = String(route.tierLabel || 'Alternative route').replace(/[🟢🔵⚡]/g, '').trim()
  const fare = route.totalFare ? `${route.totalFare} rupees` : 'Standard fare'
  const duration = route.totalDuration || 'calculated duration'
  const leg1Timing = route.leg1?.depart ? `, departing at ${route.leg1.depart}` : (route.leg1?.departureEstimate ? `, ${route.leg1.departureEstimate}` : '')
  const leg1 = route.leg1 ? `Step 1: ${route.leg1.mode} from ${route.leg1.from} to ${route.leg1.to}${leg1Timing}.` : ''
  const transfer = route.transferBuffer ? `Transfer: ${route.transferBuffer} at ${route.hubCity} Junction.` : ''
  const leg2Timing = route.leg2?.arrive ? `, arriving at ${route.leg2.arrive}` : ''
  const leg2 = route.leg2 ? `Step 2: ${route.leg2.mode} from ${route.leg2.from} to ${route.leg2.to}${leg2Timing}.` : ''
  const why = route.whyPicked ? `Why picked: ${route.whyPicked}` : ''

  return `${tierName}. Total fare is ${fare}, journey duration is ${duration}. ${leg1} ${transfer} ${leg2} ${why}`.trim()
}

export function speakRouteTier(route, options = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const summary = formatTierSpeechSummary(route)
  if (!summary) return null

  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(summary)
    utterance.lang = options.lang || 'en-IN'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    if (options.onStart) utterance.onstart = options.onStart
    if (options.onEnd) utterance.onend = options.onEnd
    if (options.onError) utterance.onerror = options.onError
    window.speechSynthesis.speak(utterance)
    return summary
  } catch {
    return null
  }
}

export function speakEmergencyConfirmation(emergencyType = 'general', options = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null

  const texts = {
    police: 'Emergency alert. Connecting to Police 112. Stay calm, sharing your GPS location.',
    ambulance: 'Medical alert. Connecting to Ambulance 108. Stay calm.',
    medical: 'Medical alert. Connecting to Ambulance 108. Stay calm.',
    railway: 'Railway emergency alert. Connecting to Railway Helpline 139.',
    women: 'Emergency alert. Connecting to Women Safety Helpline 1090.',
    general: 'Emergency Mode Activated. National emergency hotlines 112, 139, and 108 are ready.'
  }

  const spokenText = texts[emergencyType] || texts.general

  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(spokenText)
    utterance.lang = options.lang || 'en-IN'
    utterance.rate = 1.05
    utterance.pitch = 1.0
    window.speechSynthesis.speak(utterance)
    return spokenText
  } catch {
    return null
  }
}

export function speakProtocolGuidance(protocol, options = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !protocol) return null

  const steps = Array.isArray(protocol.steps)
    ? protocol.steps.map((s, i) => `Step ${i + 1}: ${s}`).join('. ')
    : ''
  const spokenText = `${protocol.title}. ${steps}. Standard helpline is ${protocol.hotlineLabel || protocol.hotline}.`.trim()

  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(spokenText)
    utterance.lang = options.lang || 'en-IN'
    utterance.rate = 1.0
    utterance.pitch = 1.0
    if (options.onStart) utterance.onstart = options.onStart
    if (options.onEnd) utterance.onend = options.onEnd
    if (options.onError) utterance.onError = options.onError
    window.speechSynthesis.speak(utterance)
    return spokenText
  } catch {
    return null
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel()
    } catch {}
  }
}

export function parseVoiceIntent(rawCommand = '') {
  const normalized = cleanText(rawCommand)
  const lower = normalized.toLowerCase()
  if (!lower) return { intent: 'none', action: 'none', plan: {}, mode: null, routeDetected: false, message: 'No voice search captured.' }

  const hasTatkal = /\b(?:tatkal|emergency\s+(?:ticket|train|booking))\b/i.test(lower)
  const hasTravelWords = /\b(?:planner|ticket|tickets|route|train|flight|bus|travel|trip|journey|book|booking|tatkal)\b/i.test(lower)
  const explicitSafety = /\b(?:help|help\s+me|save\s+me|emergency|safety(?:\s+mode)?|sos|police|ambulance|danger|accident|robbery|theft|harassment|trapped|attack|stranded|medical\s+emergency)\b/i.test(lower)

  if (explicitSafety && !hasTravelWords && !detectRoute(normalized)) {
    let emergencyType = 'general'
    let hotline = '112'
    let message = 'Opened Emergency Mode: Emergency SOS active.'

    if (/\b(?:police|robbery|theft|attack|danger|harassment)\b/i.test(lower)) {
      emergencyType = 'police'
      hotline = '112'
      message = 'Emergency Mode: Police Helpline 112 ready.'
    } else if (/\b(?:ambulance|medical|doctor|hospital|injury)\b/i.test(lower)) {
      emergencyType = 'medical'
      hotline = '108'
      message = 'Emergency Mode: Medical Ambulance 108 ready.'
    } else if (/\b(?:railway|train\s+emergency|rpf)\b/i.test(lower)) {
      emergencyType = 'railway'
      hotline = '139'
      message = 'Emergency Mode: Indian Railway 139 ready.'
    } else if (/\b(?:women|eve\s+teasing)\b/i.test(lower)) {
      emergencyType = 'women'
      hotline = '1090'
      message = 'Emergency Mode: Women Helpline 1090 ready.'
    }

    return {
      intent: 'safety',
      action: 'open-safety',
      emergencyType,
      hotline,
      plan: {},
      mode: null,
      routeDetected: false,
      message
    }
  }
  if (/\b(?:open\s+)?saved(?:\s+plans?)?\b/i.test(lower)) {
    return { intent: 'saved', action: 'open-saved', plan: {}, mode: null, routeDetected: false, message: 'Opened Saved Plans.' }
  }
  if (/\b(?:open\s+)?analy[sz]e(?:\s+journey)?\b|\banalysis\b/i.test(lower)) {
    return { intent: 'analyze', action: 'open-analyze', plan: {}, mode: null, routeDetected: false, message: 'Opened Analyze Journey.' }
  }

  // Voice Tier Readout Command (e.g., "read fastest route", "speak budget tier")
  const isReadTierCommand = /\b(?:read|speak|listen\s+to|tell\s+me)\b.{0,30}\b(?:route|routes|tier|option|options|fastest|cheapest|budget|balanced)\b/i.test(lower)
  if (isReadTierCommand && !detectRoute(normalized)) {
    const targetTier = /\b(?:fastest|flight|express|quickest)\b/i.test(lower)
      ? 'emergency-express'
      : /\b(?:cheapest|budget|paisa|paisa\s+vasool)\b/i.test(lower)
        ? 'paisa-vasool'
        : /\b(?:balanced|value|best\s+value)\b/i.test(lower)
          ? 'smart-balanced'
          : 'top'
    return {
      intent: 'planner',
      action: 'read-tier',
      targetTier,
      plan: {},
      mode: null,
      routeDetected: false,
      message: `Reading ${targetTier === 'top' ? 'top' : targetTier} route summary aloud.`
    }
  }

  // Pure Voice Filter Command (without new route)
  const isCheapestFilterOnly = /\b(?:cheapest|lowest\s+fare|budget\s+route|cheap\s+ticket)\b/i.test(lower) && !detectRoute(normalized)
  const isFastestFilterOnly = /\b(?:fastest\s+route|quickest\s+route|fastest\s+option|emergency\s+express)\b/i.test(lower) && !detectRoute(normalized)
  const isBalancedFilterOnly = /\b(?:balanced\s+route|best\s+value|smart\s+balanced)\b/i.test(lower) && !detectRoute(normalized)
  const isBackupFilterOnly = /\b(?:show\s+backup|backup\s+routes?|multimodal\s+options?|alternate\s+routes?)\b/i.test(lower) && !detectRoute(normalized)

  if (isCheapestFilterOnly) {
    return { intent: 'planner', action: 'apply-filter', filter: 'budget', plan: {}, mode: null, routeDetected: false, message: 'Filtered to cheapest budget routes.' }
  }
  if (isFastestFilterOnly) {
    return { intent: 'planner', action: 'apply-filter', filter: 'fastest', plan: {}, mode: null, routeDetected: false, message: 'Filtered to fastest emergency express routes.' }
  }
  if (isBalancedFilterOnly) {
    return { intent: 'planner', action: 'apply-filter', filter: 'balanced', plan: {}, mode: null, routeDetected: false, message: 'Filtered to best value balanced routes.' }
  }
  if (isBackupFilterOnly) {
    return { intent: 'planner', action: 'show-backup', plan: {}, mode: null, routeDetected: false, message: 'Showing multimodal backup route alternatives.' }
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

  // Filter preference inside route command
  if (/\b(?:cheapest|lowest\s+fare|budget)\b/i.test(lower)) plan.filter = 'budget'
  if (/\b(?:fastest|quickest|urgent)\b/i.test(lower)) plan.filter = 'fastest'
  if (/\b(?:balanced|best\s+value)\b/i.test(lower)) plan.filter = 'balanced'

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

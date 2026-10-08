import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { airlineIataCode, airportCode } from '../api/flights/search.js'
import { stationCodes } from '../api/trains/_rapidapiRail.js'
import { buildPnrProviderUrl, normalizePnr } from '../api/trains/pnr.js'
import { localDateIso } from '../src/utils/date.js'
import { parseVoiceIntent } from '../src/utils/voiceIntent.js'
import { routeDistanceKm } from '../src/utils/travelMath.js'
import { emergencyNumber } from '../src/data/emergencyData.js'
import { extractRouteIntent, normalizeTravelMessage } from '../api/assistant.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function walk(directory) {
  const files = []
  for (const name of readdirSync(directory)) {
    if (['node_modules', 'dist', '.vercel', '.git'].includes(name)) continue
    const full = path.join(directory, name)
    if (statSync(full).isDirectory()) files.push(...walk(full))
    else files.push(full)
  }
  return files
}


test('assistant route parser tolerates common ticket, from and transport typos', () => {
  const normalized = normalizeTravelMessage('tiketd fron Kochi too Chennai by trian')
  assert.equal(normalized, 'ticket from Kochi to Chennai by train')
  const intent = extractRouteIntent('tiketd fron Kochi too Chennai by trian')
  assert.equal(intent.bookingIntent, true)
  assert.equal(intent.routeDetected, true)
  assert.equal(intent.patch.from, 'Kochi')
  assert.equal(intent.patch.to, 'Chennai')
  assert.equal(intent.patch.transportMode, 'Train')
})

test('assistant route parser accepts informal route phrases without a fixed template', () => {
  const ticketRoute = extractRouteIntent('tickets Kochi to Chennai by bus')
  assert.equal(ticketRoute.patch.from, 'Kochi')
  assert.equal(ticketRoute.patch.to, 'Chennai')
  assert.equal(ticketRoute.patch.transportMode, 'Bus')

  const betweenRoute = extractRouteIntent('reserve a seat between Delhi and Mumbai by flite')
  assert.equal(betweenRoute.patch.from, 'Delhi')
  assert.equal(betweenRoute.patch.to, 'Mumbai')
  assert.equal(betweenRoute.patch.transportMode, 'Flight')
})



test('voice route requests fill the planner without opening demo booking', () => {
  const intent = parseVoiceIntent('tickets from Kochi to Chennai by train')
  assert.equal(intent.intent, 'planner')
  assert.equal(intent.action, 'fill-planner')
  assert.equal(intent.mode, 'normal')
  assert.equal(intent.plan.from, 'Kochi')
  assert.equal(intent.plan.to, 'Chennai')
  assert.equal(intent.plan.transportMode, 'Train')
})

test('voice Tatkal requests open emergency mode without opening booking', () => {
  const intent = parseVoiceIntent('tatkal from Kochi to Chennai')
  assert.equal(intent.action, 'open-tatkal')
  assert.equal(intent.mode, 'emergency')
  assert.equal(intent.plan.from, 'Kochi')
  assert.equal(intent.plan.to, 'Chennai')
  assert.equal(intent.plan.transportMode, 'Train')
  assert.equal(intent.plan.quota, 'Tatkal / Emergency')
})

test('voice demo booking requires an explicit demo-booking command', () => {
  assert.equal(parseVoiceIntent('book ticket from Delhi to Mumbai').action, 'fill-planner')
  assert.equal(parseVoiceIntent('open demo booking').action, 'open-demo-booking')
  assert.equal(parseVoiceIntent('check live trains from Delhi to Mumbai').action, 'check-live')
  assert.equal(parseVoiceIntent('check live tatkal trains from Delhi to Mumbai').action, 'check-tatkal-live')
})

test('voice panel closes after a successful action so the planner is visible', () => {
  const source = readFileSync(path.join(root, 'src/components/VoiceSearchButton.jsx'), 'utf8')
  assert.match(source, /if \(result\?\.ok\)/)
  assert.match(source, /setOpen\(false\)/)
})

test('localDateIso uses the local calendar date', () => {
  assert.equal(localDateIso(new Date(2026, 0, 2, 3, 4, 5)), '2026-01-02')
  assert.equal(localDateIso(new Date(2026, 0, 2, 3, 4, 5), 1), '2026-01-03')
})

test('airport aliases are case-insensitive and do not guess unknown cities', () => {
  assert.equal(airportCode('new delhi'), 'DEL')
  assert.equal(airportCode('cok'), 'COK')
  assert.equal(airportCode('Not a real airport'), '')
})

test('airline selector supports All and maps supported airlines to IATA codes', () => {
  assert.equal(airlineIataCode('All'), '')
  assert.equal(airlineIataCode('IndiGo'), '6E')
  assert.equal(airlineIataCode('Air India'), 'AI')
  assert.equal(airlineIataCode('QP'), 'QP')
})

test('large-city railway aliases include multiple terminals', () => {
  assert.deepEqual(stationCodes('Hyderabad'), ['SC', 'HYB', 'KCG'])
  assert.deepEqual(stationCodes('New Delhi'), ['NDLS', 'DLI', 'NZM', 'ANVT'])
})

test('route distance is based on mapped coordinates, not a fixed constant', () => {
  const distance = routeDistanceKm('Delhi', 'Mumbai')
  assert.ok(distance > 1100 && distance < 1200, `unexpected Delhi–Mumbai distance: ${distance}`)
  assert.equal(routeDistanceKm('Unknown place', 'Mumbai'), null)
})



test('robbery mode uses the standard important-points panel without the fast-action-only block', () => {
  const detail = readFileSync(path.join(root, 'src/pages/EmergencyDetail.jsx'), 'utf8')
  const data = readFileSync(path.join(root, 'src/data/emergencyData.js'), 'utf8')
  assert.equal(detail.includes('Fast action only'), false)
  assert.equal(detail.includes('Important points'), true)
  assert.equal(data.includes('hideImportantPoints'), false)
})
test('ambulance contact is configured as 108 while integrated SOS remains 112', () => {
  assert.equal(emergencyNumber.ambulance, '108')
  assert.equal(emergencyNumber.primary, '112')
})

test('translation, browser voice and AI assistant are connected to server APIs', () => {
  const translation = readFileSync(path.join(root, 'src/components/GlobalTranslationLayer.jsx'), 'utf8')
  const voice = readFileSync(path.join(root, 'src/components/VoiceSearchButton.jsx'), 'utf8')
  const assistantApi = readFileSync(path.join(root, 'api/assistant.js'), 'utf8')
  assert.match(translation, /\/api\/translate/)
  assert.match(voice, /SpeechRecognition|webkitSpeechRecognition/)
  assert.match(voice, /\/api\/voice\/transcribe/)
  assert.match(assistantApi, /extractRouteIntent|parse/)
})

test('service worker never runtime-caches API responses', () => {
  const sw = readFileSync(path.join(root, 'public/sw.js'), 'utf8')
  assert.match(sw, /pathname\.startsWith\('\/api\/'\)/)
  assert.match(sw, /cache:\s*'no-store'/)
})

test('package lock does not contain the inaccessible internal registry', () => {
  const lock = readFileSync(path.join(root, 'package-lock.json'), 'utf8')
  assert.equal(lock.includes('packages.applied-caas-gateway'), false)
})

test('runtime source no longer depends on OPENAI_API_KEY', () => {
  const runtimeFiles = walk(root).filter((file) => {
    const relative = path.relative(root, file)
    return (relative.startsWith(`api${path.sep}`) || relative.startsWith(`src${path.sep}`)) && /\.(js|jsx)$/.test(file)
  })
  for (const file of runtimeFiles) {
    assert.equal(readFileSync(file, 'utf8').includes('OPENAI_API_KEY'), false, path.relative(root, file))
  }
})

test('SambaNova translation endpoint returns a source-to-translation map', async () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.SAMBANOVA_API_KEY
  const originalBase = process.env.SAMBANOVA_BASE_URL
  let calledUrl = ''
  try {
    process.env.SAMBANOVA_API_KEY = 'sn-valid-test-key'
    process.env.SAMBANOVA_BASE_URL = 'https://api.sambanova.ai/v1/'
    globalThis.fetch = async (url) => {
      calledUrl = String(url)
      return new Response(JSON.stringify({
        choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ translations: [{ source: 'Home', translation: 'होम' }] }) } }]
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const { default: handler } = await import('../api/translate.js')
    const output = await callHandler(handler, {}, { method: 'POST', body: { language: 'hi', strings: ['Home'] }, url: '/api/translate' })
    assert.equal(output.status, 200)
    assert.equal(output.body.translations.Home, 'होम')
    assert.equal(calledUrl, 'https://api.sambanova.ai/v1/chat/completions')
  } finally {
    globalThis.fetch = originalFetch
    restoreEnv('SAMBANOVA_API_KEY', originalKey)
    restoreEnv('SAMBANOVA_BASE_URL', originalBase)
  }
})

test('SambaNova assistant endpoint returns a friendly reply and planner patch', async () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.SAMBANOVA_API_KEY
  try {
    process.env.SAMBANOVA_API_KEY = 'sn-valid-test-key'
    globalThis.fetch = async () => new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({
        reply: 'Sure — I updated the route. Please verify live schedules before booking.',
        applyPlan: true,
        mode: 'normal',
        planPatch: { from: 'Kochi', to: 'Chennai', date: '2026-07-20', transportMode: 'Train', passengers: 1, budget: 1500, urgency: 'Normal', classType: 'Sleeper (SL)', routeCombo: 'Train only' }
      }) } } ]
    }), { status: 200, headers: { 'content-type': 'application/json' } })
    const { default: handler } = await import('../api/assistant.js')
    const output = await callHandler(handler, {}, {
      method: 'POST',
      body: { language: 'en', message: 'Plan Kochi to Chennai', history: [], plan: {} },
      url: '/api/assistant'
    })
    assert.equal(output.status, 200)
    assert.equal(output.body.mode, 'ai')
    assert.equal(output.body.provider, 'SambaNova')
    assert.equal(output.body.applyPlan, true)
    assert.equal(output.body.planPatch.to, 'Chennai')
  } finally {
    globalThis.fetch = originalFetch
    restoreEnv('SAMBANOVA_API_KEY', originalKey)
  }
})


test('SambaNova assistant retries once when structured JSON is truncated by the token limit', async () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.SAMBANOVA_API_KEY
  let calls = 0
  const tokenBudgets = []
  try {
    process.env.SAMBANOVA_API_KEY = 'sn-valid-test-key'
    globalThis.fetch = async (_url, options) => {
      calls += 1
      tokenBudgets.push(JSON.parse(options.body).max_completion_tokens)
      if (calls === 1) {
        return new Response(JSON.stringify({
          error: {
            code: 'invalid_json',
            message: 'Model did not output valid JSON. The output was truncated before a complete JSON object could be generated because the maximum token limit was reached.'
          }
        }), { status: 400, headers: { 'content-type': 'application/json' } })
      }
      return new Response(JSON.stringify({
        choices: [{
          finish_reason: 'stop',
          message: {
            content: JSON.stringify({
              reply: 'Pack water, a light blanket, medicines, an ID, and a charged phone for an overnight train.',
              applyPlan: false,
              mode: null,
              planPatch: { from: null, to: null, date: null, transportMode: null, passengers: null, budget: null, urgency: null, classType: null, routeCombo: null }
            })
          }
        }]
      }), { status: 200, headers: { 'content-type': 'application/json' } })
    }

    const { default: handler } = await import('../api/assistant.js')
    const output = await callHandler(handler, {}, {
      method: 'POST',
      body: { language: 'en', message: 'What should I carry for an overnight train?', history: [], plan: {} },
      url: '/api/assistant'
    })

    assert.equal(output.status, 200)
    assert.equal(output.body.mode, 'ai')
    assert.equal(calls, 2)
    assert.ok(tokenBudgets[1] > tokenBudgets[0])
  } finally {
    globalThis.fetch = originalFetch
    restoreEnv('SAMBANOVA_API_KEY', originalKey)
  }
})

test('voice endpoint accepts browser-recognized English speech without uploading audio', async () => {
  const originalKey = process.env.SAMBANOVA_API_KEY
  try {
    process.env.SAMBANOVA_API_KEY = 'sn-valid-test-key'
    const { default: handler } = await import('../api/voice/transcribe.js')
    const output = await callHandler(handler, {}, {
      method: 'POST',
      body: { language: 'en', transcript: 'flight from Kochi to Chennai' },
      url: '/api/voice/transcribe'
    })
    assert.equal(output.status, 200)
    assert.equal(output.body.provider, 'SambaNova')
    assert.equal(output.body.transcript, 'flight from Kochi to Chennai')
    assert.equal(output.body.command, 'flight from Kochi to Chennai')
  } finally {
    restoreEnv('SAMBANOVA_API_KEY', originalKey)
  }
})

test('flight handler uses the server-side key and returns normalized live rows', async () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.AVIATIONSTACK_API_KEY
  try {
    process.env.AVIATIONSTACK_API_KEY = 'valid-test-key'
    globalThis.fetch = async () => new Response(JSON.stringify({ data: [{ airline: { name: 'Example Air' }, flight: { iata: 'EX101' }, departure: { airport: 'Delhi', iata: 'DEL', scheduled: '2026-07-20T10:00:00+00:00' }, arrival: { airport: 'Mumbai', iata: 'BOM', scheduled: '2026-07-20T12:00:00+00:00' }, flight_status: 'scheduled' }] }), { status: 200, headers: { 'content-type': 'application/json' } })
    const { default: handler } = await import('../api/flights/search.js')
    const output = await callHandler(handler, { from: 'Delhi', to: 'Mumbai', date: '2026-07-20' })
    assert.equal(output.status, 200)
    assert.equal(output.body.mode, 'live')
    assert.equal(output.body.results[0].code, 'EX101')
  } finally {
    globalThis.fetch = originalFetch
    restoreEnv('AVIATIONSTACK_API_KEY', originalKey)
  }
})

test('All airlines omits airline_iata while a selected airline sends the provider filter', async () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.AVIATIONSTACK_API_KEY
  const urls = []
  try {
    process.env.AVIATIONSTACK_API_KEY = 'valid-test-key'
    globalThis.fetch = async (url) => {
      urls.push(String(url))
      return new Response(JSON.stringify({ data: [] }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const { default: handler } = await import('../api/flights/search.js')
    const allOutput = await callHandler(handler, { from: 'Kochi', to: 'Chennai', date: '2026-07-20', airline: 'All' })
    const indigoOutput = await callHandler(handler, { from: 'Kochi', to: 'Chennai', date: '2026-07-20', airline: 'Indigo' })
    assert.equal(allOutput.status, 200)
    assert.equal(allOutput.body.airlineFilterApplied, false)
    assert.doesNotMatch(urls[0], /airline_iata=/)
    assert.equal(indigoOutput.body.airlineFilterApplied, true)
    assert.match(urls[1], /airline_iata=6E/)
  } finally {
    globalThis.fetch = originalFetch
    restoreEnv('AVIATIONSTACK_API_KEY', originalKey)
  }
})

test('flight handler retries without flight_date when the provider plan blocks that function', async () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.AVIATIONSTACK_API_KEY
  const urls = []
  try {
    process.env.AVIATIONSTACK_API_KEY = 'valid-test-key'
    globalThis.fetch = async (url) => {
      urls.push(String(url))
      if (urls.length === 1) {
        return new Response(JSON.stringify({ error: { code: 'function_access_restricted', message: 'Your current subscription plan does not support this API function.' } }), { status: 200, headers: { 'content-type': 'application/json' } })
      }
      return new Response(JSON.stringify({ data: [{ airline: { name: 'Example Air' }, flight: { iata: 'EX202' }, departure: { airport: 'Kochi', iata: 'COK', scheduled: '2026-07-12T10:00:00+00:00' }, arrival: { airport: 'Chennai', iata: 'MAA', scheduled: '2026-07-12T11:10:00+00:00' }, flight_status: 'active' }] }), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const { default: handler } = await import('../api/flights/search.js')
    const output = await callHandler(handler, { from: 'Kochi', to: 'Chennai', date: '2026-07-20' })
    assert.equal(output.status, 200)
    assert.equal(output.body.mode, 'live')
    assert.equal(output.body.planRestrictionBypassed, true)
    assert.equal(output.body.dateFilterApplied, false)
    assert.equal(urls.length, 2)
    assert.match(urls[0], /flight_date=2026-07-20/)
    assert.doesNotMatch(urls[1], /flight_date=/)
  } finally {
    globalThis.fetch = originalFetch
    restoreEnv('AVIATIONSTACK_API_KEY', originalKey)
  }
})

function restoreEnv(name, value) {
  if (value === undefined) delete process.env[name]
  else process.env[name] = value
}

function callHandler(handler, query = {}, request = {}) {
  return new Promise((resolve, reject) => {
    const output = { status: 200, headers: {}, body: null }
    const response = {
      setHeader(name, value) { output.headers[name] = value },
      status(code) { output.status = code; return this },
      json(body) { output.body = body; resolve(output); return this }
    }
    Promise.resolve(handler({
      method: request.method || 'GET',
      query,
      headers: request.headers || {},
      body: request.body,
      url: request.url || '/api/test'
    }, response)).catch(reject)
  })
}

test('assistant deterministically fills From, To and transport for explicit route text', async () => {
  const originalFetch = globalThis.fetch
  const originalKey = process.env.SAMBANOVA_API_KEY
  try {
    process.env.SAMBANOVA_API_KEY = 'sn-valid-test-key'
    globalThis.fetch = async () => new Response(JSON.stringify({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({
        reply: 'I can help with that route.',
        applyPlan: false,
        mode: null,
        planPatch: { from: null, to: null, date: null, transportMode: null, passengers: null, budget: null, urgency: null, classType: null, routeCombo: null }
      }) } }]
    }), { status: 200, headers: { 'content-type': 'application/json' } })

    const { default: handler } = await import('../api/assistant.js')
    const output = await callHandler(handler, {}, {
      method: 'POST',
      body: { language: 'en', message: 'I want a train from Kochi to Chennai tomorrow', history: [], plan: {} },
      url: '/api/assistant'
    })

    assert.equal(output.status, 200)
    assert.equal(output.body.applyPlan, true)
    assert.equal(output.body.planPatch.from, 'Kochi')
    assert.equal(output.body.planPatch.to, 'Chennai')
    assert.equal(output.body.planPatch.transportMode, 'Train')
    assert.equal(output.body.shouldCheckProviders, true)
    assert.match(output.body.reply, /demo booking flow/i)
    assert.match(output.body.reply, /coming soon/i)
  } finally {
    globalThis.fetch = originalFetch
    restoreEnv('SAMBANOVA_API_KEY', originalKey)
  }
})

test('Smart Assistant route parsing extracts routes and handles assistant intents', () => {
  const assistantApi = readFileSync(path.join(root, 'api/assistant.js'), 'utf8')
  assert.match(assistantApi, /extractRouteIntent/)
  assert.match(assistantApi, /normalizeTravelMessage/)
})

test('mobile interface uses a structured navigation grid and safe floating action dock', () => {
  const navbar = readFileSync(path.join(root, 'src/components/Navbar.jsx'), 'utf8')
  const styles = readFileSync(path.join(root, 'src/index.css'), 'utf8')
  const voice = readFileSync(path.join(root, 'src/components/VoiceSearchButton.jsx'), 'utf8')

  assert.match(navbar, /grid-cols-4/)
  assert.match(styles, /env\(safe-area-inset-bottom\)/)
  assert.match(voice, /voice-panel/)
  assert.match(voice, /Stop listening/)
})

test('mobile controls avoid the previous global full-width button regression', () => {
  const styles = readFileSync(path.join(root, 'src/index.css'), 'utf8')
  const app = readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  assert.match(styles, /\.mobile-full\s*\{\s*width: 100% !important;/s)
  assert.match(styles, /\.btn-primary,[\s\S]*width: auto !important;/)
  assert.match(app, /app-toast/)
})

test('emergency alert includes current location, trip context and emergency contacts', async () => {
  const { buildEmergencyAlert } = await import('../src/utils/locationSafety.js')
  const alert = buildEmergencyAlert({
    emergencyType: 'Medical emergency',
    location: {
      latitude: 10,
      longitude: 76,
      accuracy: 25,
      capturedAt: '2026-07-15T10:00:00.000Z',
      mapUrl: 'https://maps.google.com/?q=10.000000,76.000000'
    },
    tripContext: 'Train: Kochi → Chennai',
    contacts: [{ name: 'Family', phone: '9999999999' }]
  })
  assert.match(alert, /Medical emergency/)
  assert.match(alert, /maps\.google\.com/)
  assert.match(alert, /Train: Kochi → Chennai/)
  assert.match(alert, /Family \(9999999999\)/)
  assert.match(alert, /Ambulance: 108/)
})

test('startup location gate and emergency sharing refresh GPS before WhatsApp or SMS', () => {
  const app = readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  const gate = readFileSync(path.join(root, 'src/components/LocationPermissionGate.jsx'), 'utf8')
  const toolkit = readFileSync(path.join(root, 'src/components/EmergencyToolkit.jsx'), 'utf8')
  assert.match(app, /LocationPermissionGate/)
  assert.match(gate, /Allow and continue/)
  assert.match(gate, /requestEmergencyLocation/)
  assert.match(toolkit, /openWhatsApp/)
  assert.match(toolkit, /openSms/)
  assert.match(toolkit, /captureLocation\(\{ announce: false \}\)/)
  assert.match(toolkit, /Review and tap Send/)
})

test('all supported languages provide translated core navigation and action labels', async () => {
  const { languages } = await import('../src/data/languageData.js')
  const required = ['home', 'safety', 'planner', 'saved', 'analyze', 'emergencyCopilot', 'helpMatters', 'enterSafety', 'downloadPack', 'bookTicket', 'savePlan', 'openPortal']
  for (const [code, item] of Object.entries(languages)) {
    for (const key of required) assert.ok(String(item.labels?.[key] || '').trim(), `${code}.${key}`)
    if (code !== 'en') {
      const identical = required.filter((key) => item.labels[key] === languages.en.labels[key])
      assert.equal(identical.length, 0, `${code} still has English core labels: ${identical.join(', ')}`)
    }
  }
})

test('complete-language layer translates long copy, placeholders, button values and document metadata', () => {
  const source = readFileSync(path.join(root, 'src/components/GlobalTranslationLayer.jsx'), 'utf8')
  const apiSource = readFileSync(path.join(root, 'api/translate.js'), 'utf8')
  assert.match(source, /text\.length > 1400/)
  assert.match(source, /visibleValueAttribute/)
  assert.match(source, /node\.tagName === 'META'/)
  assert.match(source, /document\.head/)
  assert.match(source, /translation-status/)
  assert.match(apiSource, /readJsonBody\(req, 120_000\)/)
  assert.match(apiSource, /Translate every sentence and paragraph completely/)
})

test('partial translation failures do not render the old gold warning popup', () => {
  const source = readFileSync(path.join(root, 'src/components/GlobalTranslationLayer.jsx'), 'utf8')
  const styles = readFileSync(path.join(root, 'src/index.css'), 'utf8')
  assert.doesNotMatch(source, /PARTIAL_TEXT/)
  assert.doesNotMatch(source, /TriangleAlert/)
  assert.doesNotMatch(source, /translation-status-warning/)
  assert.doesNotMatch(styles, /translation-status-warning/)
  assert.match(source, /if \(state !== 'working'\) return null/)
})

test('voice UI preserves user text while localizing placeholder text', () => {
  const voice = readFileSync(path.join(root, 'src/components/VoiceSearchButton.jsx'), 'utf8')
  assert.match(voice, /<span>Heard:<\/span> <span data-no-translate>\{transcript\}<\/span>/)
  assert.doesNotMatch(voice, /placeholder="Example: train from Hyderabad to Delhi"\s+data-no-translate/)
})


test('dedicated PNR provider URL supports path, placeholder and full-URL configuration', () => {
  assert.equal(
    buildPnrProviderUrl({
      host: 'irctc-indian-railway-pnr-status.p.rapidapi.com',
      endpoint: '/getPNRStatus',
      pnrNumber: '8148735219'
    }),
    'https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/8148735219'
  )
  assert.equal(
    buildPnrProviderUrl({
      host: 'ignored.example',
      endpoint: 'https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/{pnr}',
      pnrNumber: '8148735219'
    }),
    'https://irctc-indian-railway-pnr-status.p.rapidapi.com/getPNRStatus/8148735219'
  )
})

test('PNR normalizer accepts common provider field names without exposing raw payloads', () => {
  const result = normalizePnr({
    data: {
      Pnr: '8148735219',
      TrainNo: '12321',
      TrainName: 'Example Express',
      From: 'HWH',
      To: 'BCT',
      Doj: '20-07-2026',
      ChartPrepared: true,
      PassengerStatus: [
        { PassengerNo: 1, BookingStatus: 'WL/10', CurrentStatus: 'CNF', Coach: 'B2', Berth: '31' }
      ]
    }
  }, '8148735219')
  assert.equal(result.pnrNumber, '8148735219')
  assert.equal(result.trainNumber, '12321')
  assert.equal(result.trainName, 'Example Express')
  assert.equal(result.passengers[0].currentStatus, 'CNF')
  assert.equal(result.passengers[0].coach, 'B2')
  assert.equal('raw' in result, false)
})

test('PNR provider configuration stays separate from train-search host', () => {
  const source = readFileSync(path.join(root, 'api/trains/pnr.js'), 'utf8')
  const envExample = readFileSync(path.join(root, '.env.local.example'), 'utf8')
  assert.match(source, /RAPIDAPI_PNR_HOST/)
  assert.match(source, /RAPIDAPI_PNR_ENDPOINT/)
  assert.match(source, /RAPIDAPI_PNR_KEY \|\| process\.env\.RAPIDAPI_KEY/)
  assert.doesNotMatch(source, /callRapidRail\('/)
  assert.match(envExample, /RAPIDAPI_PNR_HOST=["']?irctc-indian-railway-pnr-status\.p\.rapidapi\.com["']?/)
})

test('live provider tickets open in a dedicated results workspace instead of a bottom result block', () => {
  const planner = readFileSync(path.join(root, 'src/pages/Planner.jsx'), 'utf8')
  const workspace = readFileSync(path.join(root, 'src/components/LiveResultsPanel.jsx'), 'utf8')
  assert.match(planner, /LiveResultsPanel/)
  assert.match(planner, /setResultsOpen\(true\)/)
  assert.doesNotMatch(planner, /Live API \/ fallback status/)
  assert.match(workspace, /Dedicated provider-results workspace/)
  assert.match(workspace, /Back to planner/)
  assert.match(workspace, /Demo-booking notice/)
})

test('backup suggestions are visible near the route form and inside live results', () => {
  const normalPlanner = readFileSync(path.join(root, 'src/planner/NormalPlanner.jsx'), 'utf8')
  const workspace = readFileSync(path.join(root, 'src/components/LiveResultsPanel.jsx'), 'utf8')
  const formIndex = normalPlanner.indexOf('Full route dashboard')
  const backupIndex = normalPlanner.indexOf('<BackupPlan')
  const comparisonIndex = normalPlanner.indexOf('<TripComparison')
  assert.ok(formIndex >= 0 && backupIndex > formIndex)
  assert.ok(backupIndex < comparisonIndex, 'backup plan should appear before comparison and analytics sections')
  assert.match(workspace, /<BackupPlan plan=\{plan\} compact/)
  assert.match(workspace, /order-1 min-w-0 lg:order-2/)
})

test('main navigation keeps complete labels visible without ellipsis', () => {
  const navbar = readFileSync(path.join(root, 'src/components/Navbar.jsx'), 'utf8')
  const styles = readFileSync(path.join(root, 'src/index.css'), 'utf8')
  assert.match(navbar, /grid-cols-4/)
  assert.match(navbar, /lg:max-w-4xl/)
  assert.doesNotMatch(styles, /\.nav-item span \{[\s\S]*?text-overflow:\s*ellipsis/)
  assert.match(styles, /\.nav-item span \{[\s\S]*?white-space:\s*normal/)
})

test('deep link provider generates valid URLs without collecting payment credentials', () => {
  const results = readFileSync(path.join(root, 'src/components/LiveResultsPanel.jsx'), 'utf8')
  const transportData = readFileSync(path.join(root, 'src/data/transportData.js'), 'utf8')

  assert.match(transportData, /getProviderDeepLink/)
  assert.match(transportData, /confirmtkt\.com/)
  assert.match(transportData, /redbus\.in/)
  assert.match(transportData, /google\.com\/travel\/flights/)
  assert.equal(/name=\"(?:cardNumber|cvv|upiPin|bankPassword)\"|\b(?:cardNumber|upiPin|bankPassword)\s*:/i.test(transportData), false)
  assert.match(results, /Book on Portal/)
})

test('route-level error boundary prevents a component exception from leaving a blank page', () => {
  const app = readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  const boundary = readFileSync(path.join(root, 'src/components/PageErrorBoundary.jsx'), 'utf8')
  assert.match(app, /<PageErrorBoundary key=\{location\.pathname\}>/)
  assert.match(boundary, /This TravelMate page could not load/)
  assert.match(boundary, /window\.location\.reload\(\)/)
})

test('Tatkal emergency mode loads live route trains and exposes a separate TQ availability check', () => {
  const tatkal = readFileSync(path.join(root, 'src/planner/EmergencyTatkalPlanner.jsx'), 'utf8')
  const planner = readFileSync(path.join(root, 'src/pages/Planner.jsx'), 'utf8')
  const seat = readFileSync(path.join(root, 'src/planner/SeatAvailabilityChecker.jsx'), 'utf8')
  assert.match(tatkal, /Check live Tatkal trains/)
  assert.match(tatkal, /liveResults/)
  assert.match(tatkal, /SeatAvailabilityChecker/)
  assert.match(planner, /handleTatkalLiveSearch/)
  assert.match(planner, /onFindLiveTrains=\{handleTatkalLiveSearch\}/)
  assert.match(seat, /forceTatkal \? 'TQ'/)
  assert.match(seat, /Check Tatkal seats/)
})

test('live train route results preserve station codes for the Tatkal seat checker', () => {
  const trainSearch = readFileSync(path.join(root, 'api/trains/search.js'), 'utf8')
  assert.match(trainSearch, /fromStationCode:/)
  assert.match(trainSearch, /toStationCode:/)
  assert.match(trainSearch, /does not confirm Tatkal quota seats/)
})


test('voice dialog uses large non-shrinking close controls', () => {
  const voice = readFileSync(path.join(root, 'src/components/VoiceSearchButton.jsx'), 'utf8')
  const styles = readFileSync(path.join(root, 'src/index.css'), 'utf8')
  assert.match(voice, /className="dialog-close-button"/)
  assert.match(styles, /\.dialog-close-button[\s\S]*?flex:\s*0 0 48px/)
  assert.match(styles, /\.dialog-close-button[\s\S]*?min-width:\s*48px/)
})

test('assistant chat drawer is pruned per Master Spec Section 4', () => {
  const exists = existsSync(path.join(root, 'src/components/SmartAssistant.jsx'))
  assert.equal(exists, false, 'SmartAssistant.jsx must not exist')
})

test('saved plans use automatic booking PNR status and keep the snapshot offline', () => {
  const savedPlans = readFileSync(path.join(root, 'src/pages/SavedPlans.jsx'), 'utf8')
  const offlineMode = readFileSync(path.join(root, 'src/components/OfflineOnlyMode.jsx'), 'utf8')
  const storage = readFileSync(path.join(root, 'src/utils/storage.js'), 'utf8')

  assert.match(savedPlans, /Automatic PNR status/)
  assert.equal(savedPlans.includes('placeholder="10-digit PNR"'), false)
  assert.equal(savedPlans.includes('Save PNR & check status'), false)
  assert.match(savedPlans, /saveOfflinePack\(\)/)
  assert.match(offlineMode, /Saved PNR status/)
  assert.match(storage, /bookingReference/)
  assert.match(storage, /bookingStatus/)
})

test('in-app booking modal is pruned in favor of verified direct deep links per Master Spec Section 4', () => {
  const exists = existsSync(path.join(root, 'src/components/BookingModal.jsx'))
  assert.equal(exists, false, 'BookingModal.jsx must not exist')
})

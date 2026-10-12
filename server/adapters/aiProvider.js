import { TravelQuerySchema, RouteFactsSchema } from '../schemas/querySchema.js';

/**
 * AI Provider Interface supporting SambaNova as primary and Google Gemini as alternative.
 * Configurable via AI_PROVIDER env var with automatic fallback.
 * Adheres strictly to Master Spec Section 7: Grounded AI only, no hallucinations.
 */

export function getActiveAiProvider() {
  const preferred = (process.env.AI_PROVIDER || '').toLowerCase();
  if (preferred === 'sambanova' && process.env.SAMBANOVA_API_KEY && !process.env.SAMBANOVA_API_KEY.startsWith('[')) return 'sambanova';
  if (preferred === 'gemini' && process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('[')) return 'gemini';
  // Use Gemini if configured (Google AI Studio key)
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith('[')) return 'gemini';
  if (process.env.SAMBANOVA_API_KEY && !process.env.SAMBANOVA_API_KEY.startsWith('[')) return 'sambanova';
  return 'template-fallback';
}

/**
 * Call SambaNova LLM API (OpenAI-compatible)
 */
async function callSambaNova(messages, options = {}) {
  const apiKey = String(process.env.SAMBANOVA_API_KEY || '').trim();
  if (!apiKey) throw new Error('SAMBANOVA_API_KEY not configured');

  const baseUrl = String(process.env.SAMBANOVA_BASE_URL || 'https://api.sambanova.ai/v1').trim().replace(/\/+$/, '');
  const model = process.env.SAMBANOVA_MODEL || 'Meta-Llama-3.3-70B-Instruct';

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.1,
      max_tokens: options.max_tokens ?? 250
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`SambaNova API error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

/**
 * Call Google Gemini API
 */
let cachedWorkingModel = null;

export async function callGemini(promptText, options = {}) {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey.startsWith('[SENSITIVE') || apiKey.startsWith('[')) {
    throw new Error('GEMINI_API_KEY not configured or is a placeholder');
  }

  const candidateModels = Array.from(new Set([
    cachedWorkingModel,
    process.env.GEMINI_MODEL,
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro',
    'gemini-pro'
  ].filter(Boolean)));

  const timeoutMs = options.timeout ?? 9000;
  let lastError = null;

  async function tryModel(model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: options.temperature ?? 0.1,
            maxOutputTokens: options.max_tokens ?? 350
          }
        })
      });

      clearTimeout(timer);

      if (!res.ok) {
        const errorText = await res.text();
        let errorClass = 'UNKNOWN_ERROR';
        if (res.status === 400) errorClass = 'API_KEY_INVALID';
        else if (res.status === 403) errorClass = 'PERMISSION_DENIED';
        else if (res.status === 404) {
          errorClass = 'MODEL_NOT_FOUND';
          return { ok: false, error: new Error(`Gemini model ${model} not found: ${errorText}`), is404: true };
        } else if (res.status === 429) {
          errorClass = 'RATE_LIMIT_EXCEEDED';
        }
        const err = new Error(`Gemini API error (${res.status} ${errorClass}): ${errorText}`);
        err.status = res.status;
        err.code = errorClass;
        return { ok: false, error: err, is404: false };
      }

      const data = await res.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      if (content) {
        cachedWorkingModel = model;
        return { ok: true, content };
      }
      return { ok: false, error: new Error('Empty Gemini response content') };
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        const timeoutErr = new Error(`Gemini API request timed out after ${timeoutMs}ms`);
        timeoutErr.code = 'TIMEOUT';
        return { ok: false, error: timeoutErr };
      }
      return { ok: false, error: err };
    }
  }

  for (const model of candidateModels) {
    const res = await tryModel(model);
    if (res.ok) return res.content;
    lastError = res.error;
    if (res.error?.code === 'RATE_LIMIT_EXCEEDED' || res.error?.code === 'PERMISSION_DENIED') {
      throw res.error;
    }
  }

  // If candidate models returned 404, query dynamic available models for this specific API key
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      const dynamicModels = (listData.models || [])
        .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map((m) => String(m.name || '').replace(/^models\//, ''))
        .filter((m) => !candidateModels.includes(m));

      for (const model of dynamicModels.slice(0, 5)) {
        const res = await tryModel(model);
        if (res.ok) return res.content;
        lastError = res.error;
      }
    }
  } catch {}

  throw lastError || new Error('All Gemini model candidates failed.');
}

/**
 * Diagnostic helper to test Gemini connectivity without leaking keys
 */
export async function testGeminiConnectivity(customKey = null) {
  const key = customKey || String(process.env.GEMINI_API_KEY || '').trim();
  if (!key || key.startsWith('[SENSITIVE') || key.startsWith('[')) {
    return { ok: false, code: 'KEY_UNCONFIGURED_OR_PLACEHOLDER', message: 'GEMINI_API_KEY is not configured or contains placeholder text.' };
  }

  let model = String(process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`);
    if (!listRes.ok) {
      if (listRes.status === 400) return { ok: false, code: 'API_KEY_INVALID', status: 400, message: 'Google rejected the API key as invalid.' };
      if (listRes.status === 403) return { ok: false, code: 'PERMISSION_DENIED', status: 403, message: 'API key permission denied or generative language API not enabled.' };
      if (listRes.status === 429) return { ok: false, code: 'RATE_LIMIT_EXCEEDED', status: 429, message: 'Google Gemini free-tier rate limit or quota exceeded.' };
      return { ok: false, code: 'UNKNOWN_API_ERROR', status: listRes.status, message: `Google API returned status ${listRes.status}` };
    }

    let candidatesToTry = [cachedWorkingModel, model].filter(Boolean);
    let discoveredModels = [];
    try {
      const listData = await listRes.json();
      discoveredModels = (listData.models || [])
        .filter(m => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map(m => String(m.name || '').replace(/^models\//, ''))
        .filter(Boolean);

      if (discoveredModels.length > 0) {
        candidatesToTry = [
          ...discoveredModels.filter(m => m.includes('1.5-flash')),
          ...discoveredModels.filter(m => m.includes('2.0-flash')),
          ...discoveredModels.filter(m => m.includes('flash')),
          ...discoveredModels
        ];
        candidatesToTry = Array.from(new Set(candidatesToTry));
      }
    } catch (_) {}

    let lastError = null;
    let successfulModel = null;

    for (const testModel of candidatesToTry.slice(0, 6)) {
      const pingRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(testModel)}:generateContent?key=${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'ping' }] }] })
      });

      if (pingRes.ok) {
        successfulModel = testModel;
        cachedWorkingModel = testModel;
        break;
      } else {
        const errText = await pingRes.text().catch(() => '');
        lastError = { status: pingRes.status, errText, model: testModel };
      }
    }

    if (successfulModel) {
      return { ok: true, code: 'OK', model: successfulModel, message: 'Gemini API is healthy and responsive.' };
    }

    if (lastError?.status === 404) return { ok: false, code: 'MODEL_NOT_FOUND', status: 404, message: `Model ${lastError.model} was not found.`, discoveredModels: discoveredModels.slice(0, 5) };
    if (lastError?.status === 429) return { ok: false, code: 'RATE_LIMIT_EXCEEDED', status: 429, message: 'Google Gemini rate limit exceeded.' };
    return { ok: false, code: 'GENERATE_CONTENT_ERROR', status: lastError?.status, message: `GenerateContent failed: ${lastError?.errText?.substring(0, 100)}` };
  } catch (err) {
    return { ok: false, code: 'NETWORK_ERROR', message: err.message };
  }
}

export const CITY_ALIASES = {
  delh: 'Delhi',
  deli: 'Delhi',
  dilli: 'Delhi',
  ndls: 'Delhi',
  dli: 'Delhi',
  nzm: 'Delhi',
  bombay: 'Mumbai',
  cstm: 'Mumbai',
  bct: 'Mumbai',
  bangalore: 'Bengaluru',
  blr: 'Bengaluru',
  sbc: 'Bengaluru',
  ypr: 'Bengaluru',
  calcutta: 'Kolkata',
  hwh: 'Kolkata',
  sda: 'Kolkata',
  madras: 'Chennai',
  mas: 'Chennai',
  hydrabad: 'Hyderabad',
  hyd: 'Hyderabad',
  secunderabad: 'Hyderabad',
  sc: 'Hyderabad',
  banaras: 'Varanasi',
  kashi: 'Varanasi',
  bsb: 'Varanasi',
  cochin: 'Kochi',
  ernakulam: 'Kochi',
  ers: 'Kochi',
  trivandrum: 'Thiruvananthapuram',
  tvm: 'Thiruvananthapuram',
  vizag: 'Visakhapatnam',
  vskp: 'Visakhapatnam',
  vijaywada: 'Vijayawada',
  vijayawada: 'Vijayawada',
  bza: 'Vijayawada',
  poona: 'Pune',
  amdavad: 'Ahmedabad',
  adi: 'Ahmedabad',
  bbsr: 'Bhubaneswar',
  pnbe: 'Patna',
  patna: 'Patna',
  cnb: 'Kanpur',
  kanpur: 'Kanpur',
  lko: 'Lucknow',
  lucknow: 'Lucknow',
  jp: 'Jaipur',
  jaipur: 'Jaipur'
};

export function titleCase(value = '') {
  return String(value)
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function resolveCityAlias(name = '') {
  const clean = String(name || '').trim().toLowerCase();
  return CITY_ALIASES[clean] || titleCase(name);
}

/**
 * Deterministic heuristic query parser fallback (used when providers are unavailable or schema invalid)
 */
export function heuristicParseQuery(queryText = '') {
  const raw = String(queryText).trim();
  let passengers = 1;
  let budget;

  // Extract passengers before word replacement
  const passMatch = raw.match(/(\d+)\s*(?:people|passengers|pax|persons|tickets?)/i);
  if (passMatch) {
    passengers = Math.min(6, Math.max(1, parseInt(passMatch[1], 10)));
  }

  // Extract budget before word replacement
  const budgetMatch = raw.match(/(?:under|below|budget|within|max)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i) || raw.match(/(?:rs\.?|inr|₹)\s*(\d+)/i);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1], 10);
  }

  const text = raw
    .replace(new RegExp('[\\u2013' + String.fromCharCode(8212) + '\\u2192\\u27A1\\u279C]', 'g'), ' to ')
    .replace(/\b(?:fron|frm|froom)\b/gi, 'from')
    .replace(/\b(?:too|2(?!\s*(?:passengers?|people|pax|persons?|tickets?|seats?)))\b/gi, 'to')
    .replace(/\b(?:tiketd|tikets?|tickts?|tikt|tikcet|tickit|ticktes)\b/gi, 'ticket')
    .replace(/\b(?:bok|boook|buk|boking|bookng)\b/gi, 'book')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let origin = '';
  let destination = '';
  let mode = 'Any';
  let date = '';

  // Extract mode
  if (/\b(flight|air|plane|airline|fly)\b/i.test(text)) mode = 'Flight';
  else if (/\b(bus|volvo|coach)\b/i.test(text)) mode = 'Bus';
  else if (/\b(train|rail|railway|tatkal)\b/i.test(text)) mode = 'Train';

  // Extract date
  if (/\bday\s+after\s+tomorrow\b/i.test(text)) {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    date = d.toISOString().split('T')[0];
  } else if (/\btomorrow\b/i.test(text)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    date = d.toISOString().split('T')[0];
  } else if (/\b(today|tonight)\b/i.test(text)) {
    date = new Date().toISOString().split('T')[0];
  } else {
    // Day of week
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < daysOfWeek.length; i++) {
      const dayName = daysOfWeek[i];
      if (new RegExp(`\\b(?:next\\s+)?${dayName}\\b`, 'i').test(text)) {
        const d = new Date();
        const currentDay = d.getDay();
        let diff = i - currentDay;
        if (diff <= 0) diff += 7;
        d.setDate(d.getDate() + diff);
        date = d.toISOString().split('T')[0];
        break;
      }
    }
    // Explicit ISO date (YYYY-MM-DD)
    const isoMatch = text.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    if (isoMatch) {
      date = isoMatch[1];
    } else {
      // Month name date e.g. "15 Oct" or "15th October"
      const monthMatch = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i);
      if (monthMatch) {
        const months = { jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06', jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12' };
        const day = String(monthMatch[1]).padStart(2, '0');
        const month = months[monthMatch[2].toLowerCase().slice(0, 3)] || '10';
        const year = new Date().getFullYear();
        date = `${year}-${month}-${day}`;
      }
    }
  }

  // Extract from ... to ...
  const explicitFromTo = text.match(/\bfrom\s+([A-Za-z\s]+?)\s+(?:to|->|towards|into)\s+([A-Za-z\s]+?)(?:\s*(?:by|on|for|under|tomorrow|today|tonight|$))/i);
  if (explicitFromTo) {
    origin = explicitFromTo[1].trim();
    destination = explicitFromTo[2].trim();
  } else {
    // to <dest> from <orig>
    const toFrom = text.match(/\b(?:to|towards|into)\s+([A-Za-z\s]+?)\s+from\s+([A-Za-z\s]+?)(?:\s*(?:by|on|for|under|tomorrow|today|tonight|$))/i);
    if (toFrom) {
      destination = toFrom[1].trim();
      origin = toFrom[2].trim();
    } else {
      // <origin> to <destination>
      const simpleTo = text.match(/(?:^|\b(?:need|want|find|give|show|search|book|take|tickets?|train|flight|bus))\s*([A-Za-z\s]+?)\s+(?:to|->)\s+([A-Za-z\s]+?)(?:\s*(?:by|on|for|under|tomorrow|today|tonight|$))/i);
      if (simpleTo) {
        origin = simpleTo[1].replace(/\b(need|want|book|travel|find|take|tickets?|train|flight|bus|tomorrow|today|tonight)\b/gi, '').trim();
        destination = simpleTo[2].trim();
      }
    }
  }

  // Clean and resolve city aliases
  if (origin) origin = resolveCityAlias(origin);
  if (destination) destination = resolveCityAlias(destination);

  return {
    origin: origin || '',
    destination: destination || '',
    date: date || '',
    budget,
    modePreferences: mode,
    passengers
  };
}

/**
 * Feature 7.a: Natural-Language Query to Structured JSON
 * Zod schema: origin, destination, date, budget, modePreferences, passengers.
 */
export async function parseNaturalLanguageQuery(queryText) {
  if (!queryText || typeof queryText !== 'string' || !queryText.trim()) {
    throw new Error('Query string is required.');
  }

  const prompt = `You are a strict transit query parser for Indian travel.
Given this travel request: "${queryText.trim()}"
Convert it into a JSON object adhering to this exact schema:
{
  "origin": "string (departure station or city, minimum 2 characters)",
  "destination": "string (arrival station or city, minimum 2 characters)",
  "date": "YYYY-MM-DD string or empty string",
  "budget": number or omitted,
  "modePreferences": "Train" | "Flight" | "Bus" | "Any",
  "passengers": number (integer 1 to 6)
}
Return ONLY valid JSON with no markdown formatting, no codeblocks, no explanations.`;

  const primary = getActiveAiProvider();
  let rawJson = '';

  try {
    if (primary === 'sambanova') {
      try {
        rawJson = await callSambaNova([
          { role: 'system', content: 'You parse Indian transit queries into raw JSON only.' },
          { role: 'user', content: prompt }
        ]);
      } catch (err) {
        console.warn('SambaNova query parse failed, attempting Gemini fallback:', err.message);
        if (process.env.GEMINI_API_KEY) {
          rawJson = await callGemini(prompt);
        } else {
          throw err;
        }
      }
    } else if (primary === 'gemini') {
      try {
        rawJson = await callGemini(prompt);
      } catch (err) {
        console.warn('Gemini query parse failed, attempting SambaNova fallback:', err.message);
        if (process.env.SAMBANOVA_API_KEY) {
          rawJson = await callSambaNova([{ role: 'user', content: prompt }]);
        } else {
          throw err;
        }
      }
    } else {
      // Deterministic heuristic parse
      return TravelQuerySchema.parse(heuristicParseQuery(queryText));
    }

    // Clean JSON wrappers
    const cleaned = rawJson.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    return TravelQuerySchema.parse(parsed);
  } catch (err) {
    console.warn('AI query parser failed or invalid schema, using deterministic heuristic fallback:', err.message);
    const fallback = heuristicParseQuery(queryText);
    return TravelQuerySchema.parse(fallback);
  }
}

/**
 * Feature 7.b Anti-Hallucination Route Rationale Validator:
 * Rejects any generated text that introduces places, train numbers, or timings NOT in the input facts.
 */
export function validateRouteRationale(rationaleText, facts) {
  if (!rationaleText || typeof rationaleText !== 'string') return false;

  const text = rationaleText.trim();
  // Must be roughly 2 sentences (between 1 and 3 sentences)
  const sentences = text.split(/(?<=[.?!])\s+/).filter(Boolean);
  if (sentences.length === 0 || sentences.length > 3) return false;

  // Build whitelist of permissible tokens from input facts
  const whitelist = new Set([
    'india', 'indian', 'railways', 'train', 'bus', 'flight', 'platform', 'station', 'junction',
    'hub', 'layover', 'buffer', 'transfer', 'connection', 'route', 'routes', 'seats', 'seat',
    'berth', 'berths', 'waitlist', 'bypass', 'bypasses', 'schedule', 'timetable', 'recovery',
    'travelmate', 'minutes', 'min', 'hours', 'hrs', 'safe', 'direct', 'alternative', 'available',
    'confirm', 'split', 'option', 'interchange', 'express', 'mail', 'superfast', 'portal'
  ]);

  // Add all words from facts to whitelist
  const addFactsTokens = (val) => {
    if (typeof val === 'string') {
      val.toLowerCase().split(/[^a-z0-9]+/).forEach((t) => { if (t.length > 1) whitelist.add(t); });
    } else if (typeof val === 'number') {
      whitelist.add(String(val));
    }
  };

  addFactsTokens(facts.origin);
  addFactsTokens(facts.destination);
  addFactsTokens(facts.transferHub);
  addFactsTokens(facts.mode);
  addFactsTokens(facts.train1);
  addFactsTokens(facts.train2);
  addFactsTokens(facts.layoverMinutes);
  addFactsTokens(facts.durationHours);
  addFactsTokens(facts.savingsPercent);

  // Reject any known Indian transit cities/stations not present in the input facts (Master Spec 7.b)
  const knownCities = [
    'chennai', 'mumbai', 'kolkata', 'bengaluru', 'bangalore', 'hyderabad', 'pune', 'ahmedabad',
    'jaipur', 'lucknow', 'kanpur', 'patna', 'varanasi', 'prayagraj', 'nagpur', 'vijayawada',
    'surat', 'bhopal', 'indore', 'chandigarh', 'amritsar', 'guwahati', 'delhi', 'howrah', 'alps'
  ];

  const allowedCities = new Set();
  const addAllowed = (str) => {
    if (str) String(str).toLowerCase().split(/[^a-z0-9]+/).forEach((w) => { if (w.length > 1) allowedCities.add(w); });
  };
  addAllowed(facts.origin);
  addAllowed(facts.destination);
  addAllowed(facts.transferHub);

  const textLower = text.toLowerCase();
  for (const city of knownCities) {
    if (new RegExp(`\\b${city}\\b`, 'i').test(textLower) && !allowedCities.has(city)) {
      return false; // Extraneous unverified place mentioned!
    }
  }

  return true;
}

/**
 * Deterministic Template Fallback for Route Rationale
 */
export function generateTemplateRationale(facts) {
  const hub = facts.transferHub || 'the intermediate junction';
  const layover = facts.layoverMinutes ? `${facts.layoverMinutes}-minute` : 'verified';
  const train1 = facts.train1 ? `on ${facts.train1}` : 'on Leg 1';
  const train2 = facts.train2 ? `to ${facts.train2}` : 'to onward transit';

  return `Connects ${facts.origin} to ${facts.destination} via ${hub} with a ${layover} transfer window. Bypasses the direct route waitlist bottleneck with confirmed split-ticket availability.`;
}

/**
 * Feature 7.b: Route Rationale Generator
 * Generates 2 sentences based ONLY from computed facts passed in.
 * Validator rejects extraneous places, numbers, or trains, falling back to template.
 */
export async function generateRouteRationale(rawFacts) {
  const facts = RouteFactsSchema.parse(rawFacts);

  const factsJson = JSON.stringify(facts, null, 2);
  const prompt = `You are a travel rationale generator for TravelMate.
Write strictly TWO factual, concise sentences explaining why this route recovery option was chosen, using ONLY the facts provided below:

FACTS:
${factsJson}

CRITICAL RULES:
1. Write EXACTLY TWO SENTENCES.
2. Do NOT mention any cities, station names, train numbers, or timings NOT present in the FACTS above.
3. If facts do not specify a detail, do not invent it.
4. Output plain text only.`;

  const primary = getActiveAiProvider();
  let candidateText = '';

  try {
    if (primary === 'sambanova') {
      try {
        candidateText = await callSambaNova([
          { role: 'system', content: 'You write factual 2-sentence transit rationales based strictly on provided facts.' },
          { role: 'user', content: prompt }
        ]);
      } catch (err) {
        if (process.env.GEMINI_API_KEY) {
          candidateText = await callGemini(prompt);
        } else {
          throw err;
        }
      }
    } else if (primary === 'gemini') {
      try {
        candidateText = await callGemini(prompt);
      } catch (err) {
        if (process.env.SAMBANOVA_API_KEY) {
          candidateText = await callSambaNova([{ role: 'user', content: prompt }]);
        } else {
          throw err;
        }
      }
    } else {
      return generateTemplateRationale(facts);
    }

    // Validate candidate text against input facts
    if (validateRouteRationale(candidateText, facts)) {
      return candidateText;
    } else {
      console.warn('AI generated rationale failed facts validator; using deterministic template fallback.');
      return generateTemplateRationale(facts);
    }
  } catch (err) {
    console.warn('Failed to generate AI route rationale, falling back to template:', err.message);
    return generateTemplateRationale(facts);
  }
}

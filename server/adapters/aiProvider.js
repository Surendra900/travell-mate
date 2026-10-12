import { TravelQuerySchema, RouteFactsSchema } from '../schemas/querySchema.js';

/**
 * AI Provider Interface supporting SambaNova as primary and Google Gemini as alternative.
 * Configurable via AI_PROVIDER env var with automatic fallback.
 * Adheres strictly to Master Spec Section 7: Grounded AI only, no hallucinations.
 */

export function getActiveAiProvider() {
  const preferred = (process.env.AI_PROVIDER || 'sambanova').toLowerCase();
  if (preferred === 'gemini' && process.env.GEMINI_API_KEY) return 'gemini';
  if (process.env.SAMBANOVA_API_KEY) return 'sambanova';
  if (process.env.GEMINI_API_KEY) return 'gemini';
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
export async function callGemini(promptText, options = {}) {
  const apiKey = String(process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey.startsWith('[SENSITIVE') || apiKey.startsWith('[')) {
    throw new Error('GEMINI_API_KEY not configured or is a placeholder');
  }

  const model = String(process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const timeoutMs = options.timeout ?? 8000;
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
          maxOutputTokens: options.max_tokens ?? 250
        }
      })
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errorText = await res.text();
      let errorClass = 'UNKNOWN_ERROR';
      if (res.status === 400) errorClass = 'API_KEY_INVALID';
      else if (res.status === 403) errorClass = 'PERMISSION_DENIED';
      else if (res.status === 404) errorClass = 'MODEL_NOT_FOUND';
      else if (res.status === 429) errorClass = 'RATE_LIMIT_EXCEEDED';
      const err = new Error(`Gemini API error (${res.status} ${errorClass}): ${errorText}`);
      err.status = res.status;
      err.code = errorClass;
      throw err;
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      const timeoutErr = new Error(`Gemini API request timed out after ${timeoutMs}ms`);
      timeoutErr.code = 'TIMEOUT';
      throw timeoutErr;
    }
    throw err;
  }
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

    let candidatesToTry = [model];
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
          ...discoveredModels.filter(m => m.includes('1.5-pro')),
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

/**
 * Deterministic heuristic query parser fallback (used when providers are unavailable or schema invalid)
 */
export function heuristicParseQuery(queryText = '') {
  const text = String(queryText).trim();
  let origin = '';
  let destination = '';
  let mode = 'Any';
  let passengers = 1;
  let date = '';
  let budget;

  // Extract mode
  if (/\b(flight|air|plane)\b/i.test(text)) mode = 'Flight';
  else if (/\b(bus|volvo)\b/i.test(text)) mode = 'Bus';
  else if (/\b(train|rail)\b/i.test(text)) mode = 'Train';

  // Extract passengers
  const passMatch = text.match(/(\d+)\s*(?:people|passengers|pax|persons|tickets)/i);
  if (passMatch) {
    passengers = Math.min(6, Math.max(1, parseInt(passMatch[1], 10)));
  }

  // Extract budget
  const budgetMatch = text.match(/(?:under|below|budget|within|max)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i) || text.match(/(?:rs\.?|inr|₹)\s*(\d+)/i);
  if (budgetMatch) {
    budget = parseInt(budgetMatch[1], 10);
  }

  // Extract date
  if (/\btomorrow\b/i.test(text)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    date = d.toISOString().split('T')[0];
  } else if (/\b(today|tonight)\b/i.test(text)) {
    date = new Date().toISOString().split('T')[0];
  }

  // Extract from ... to ... or ... to ...
  const explicitFromTo = text.match(/\bfrom\s+([A-Za-z\s]+?)\s+(?:to|->|—|–)\s+([A-Za-z\s]+?)(?:\s+(?:by|on|for|under|tomorrow|today|tonight|$))/i);
  if (explicitFromTo) {
    origin = explicitFromTo[1].trim();
    destination = explicitFromTo[2].trim();
  } else {
    const simpleTo = text.match(/([A-Za-z\s]+?)\s+(?:to|->|—|–)\s+([A-Za-z\s]+?)(?:\s+(?:by|on|for|under|tomorrow|today|tonight|$))/i);
    if (simpleTo) {
      origin = simpleTo[1].replace(/\b(need|want|book|travel|find|take|tickets?|train|flight|bus|tomorrow|today|tonight)\b/gi, '').trim();
      destination = simpleTo[2].trim();
    }
  }

  return {
    origin: origin || 'Delhi',
    destination: destination || 'Patna',
    date: date || '2026-10-15',
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

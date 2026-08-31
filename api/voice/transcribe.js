import { configuredSambaNovaKey, createSambaNovaResponse, sambaNovaError } from '../_sambanova.js'
import { prepareApiRequest, readJsonBody } from '../_security.js'

const mimeExtensions = {
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mp4': 'mp4',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/x-wav': 'wav'
}

function safeLanguage(value = '') {
  const code = String(value || '').toLowerCase().split('-')[0]
  return /^[a-z]{2}$/.test(code) ? code : 'en'
}

function cleanTranscript(value, max = 4000) {
  return String(value || '').replace(/\0/g, '').replace(/\s+/g, ' ').trim().slice(0, max)
}

async function commandFromTranscript(transcript, languageCode) {
  if (languageCode === 'en') return transcript
  try {
    const translated = await createSambaNovaResponse({
      input: transcript,
      instructions: 'Translate this spoken travel-app command into concise English. Preserve Indian city names, station and airport codes, dates, numbers, transport words, and intent. Return only the translated command with no explanation.',
      model: process.env.SAMBANOVA_TRANSLATION_MODEL || process.env.SAMBANOVA_MODEL || 'gpt-oss-120b',
      maxOutputTokens: 420,
      reasoningEffort: 'low',
      timeoutMs: 15_000
    })
    return translated.text?.trim() || transcript
  } catch {
    return transcript
  }
}

async function transcribeWithSambaStack({ apiKey, body, languageCode }) {
  const audioBaseUrl = String(process.env.SAMBANOVA_AUDIO_BASE_URL || '').trim().replace(/\/+$/, '')
  if (!audioBaseUrl) {
    const error = new Error('Server audio transcription is not available on SambaCloud. Use Chrome or Edge browser voice recognition, or configure SAMBANOVA_AUDIO_BASE_URL for a SambaStack deployment with Whisper.')
    error.status = 501
    error.code = 'SAMBANOVA_AUDIO_NOT_AVAILABLE'
    throw error
  }

  const mimeType = String(body.mimeType || 'audio/webm').split(';')[0].toLowerCase()
  const extension = mimeExtensions[mimeType]
  if (!extension) {
    const error = new Error('Unsupported audio format.')
    error.status = 400
    error.code = 'UNSUPPORTED_AUDIO_FORMAT'
    throw error
  }

  const raw = String(body.audio || '').replace(/^data:[^;]+;base64,/, '')
  if (!raw || raw.length > 3_300_000 || !/^[A-Za-z0-9+/=\s]+$/.test(raw)) {
    const error = new Error('The voice recording is missing or too large.')
    error.status = 400
    error.code = 'INVALID_AUDIO'
    throw error
  }

  const bytes = Buffer.from(raw, 'base64')
  if (!bytes.length || bytes.length > 2_400_000) {
    const error = new Error('Keep voice recordings below about 15 seconds.')
    error.status = 413
    error.code = 'AUDIO_TOO_LARGE'
    throw error
  }

  const form = new FormData()
  form.append('file', new Blob([bytes], { type: mimeType }), `travelmate-voice.${extension}`)
  form.append('model', process.env.SAMBANOVA_TRANSCRIBE_MODEL || 'Whisper-Large-v3')
  form.append('response_format', 'json')
  form.append('language', languageCode)
  form.append('prompt', 'Travel planning in India. Common words include TravelMate, train, flight, bus, Tatkal, Hyderabad, Delhi, Mumbai, Bengaluru, Chennai, Kochi, Vijayawada, airport, station, safety, emergency and saved plans.')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25_000)
  let response
  let payload
  try {
    response = await fetch(`${audioBaseUrl}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.SAMBANOVA_AUDIO_API_KEY || apiKey}` },
      body: form,
      signal: controller.signal
    })
    const text = await response.text()
    try { payload = text ? JSON.parse(text) : {} } catch { payload = { text } }
  } finally {
    clearTimeout(timeout)
  }

  if (!response.ok || payload?.error) throw sambaNovaError(payload, response)
  return cleanTranscript(payload?.text)
}

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { methods: ['POST'], rateLimit: 10, useGlobalAuth: false })) return

  try {
    const apiKey = configuredSambaNovaKey()
    if (!apiKey) return res.status(503).json({ ok: false, mode: 'provider-unconfigured', message: 'SAMBANOVA_API_KEY is required for voice command processing.' })

    const body = await readJsonBody(req, 3_600_000)
    const languageCode = safeLanguage(body.language)

    let transcript = cleanTranscript(body.transcript)
    if (!transcript && body.audio) transcript = await transcribeWithSambaStack({ apiKey, body, languageCode })
    if (!transcript) return res.status(422).json({ ok: false, mode: 'no-speech', message: 'No clear speech was detected. Try again closer to the microphone.' })

    const command = await commandFromTranscript(transcript, languageCode)
    return res.status(200).json({ ok: true, mode: 'transcribed', provider: 'SambaNova', transcript, command })
  } catch (error) {
    const timedOut = error?.name === 'AbortError'
    return res.status(timedOut ? 504 : Number(error.status || 502)).json({
      ok: false,
      mode: error.code === 'SAMBANOVA_AUDIO_NOT_AVAILABLE' ? 'browser-speech-required' : 'provider-error',
      message: timedOut ? 'Voice transcription timed out. Try a shorter recording.' : error.message || 'Voice command processing failed.',
      error: error.code || 'VOICE_PROCESSING_ERROR'
    })
  }
}

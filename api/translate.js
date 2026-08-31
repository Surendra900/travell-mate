import { createSambaNovaResponse } from './_sambanova.js'
import { prepareApiRequest, readJsonBody, providerStatus } from './_security.js'

const languageNames = {
  en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil', kn: 'Kannada', ml: 'Malayalam',
  mr: 'Marathi', bn: 'Bengali', gu: 'Gujarati', ur: 'Urdu', es: 'Spanish', fr: 'French', de: 'German'
}

function clean(value, max = 1400) {
  return String(value || '').replace(/\0/g, '').trim().slice(0, max)
}

const translationSchema = {
  type: 'object',
  properties: {
    translations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          source: { type: 'string' },
          translation: { type: 'string' }
        },
        required: ['source', 'translation'],
        additionalProperties: false
      }
    }
  },
  required: ['translations'],
  additionalProperties: false
}

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { methods: ['POST'], rateLimit: 30, useGlobalAuth: false })) return

  try {
    const body = await readJsonBody(req, 120_000)
    const languageCode = Object.hasOwn(languageNames, body.language) ? body.language : 'en'
    if (languageCode === 'en') return res.status(200).json({ ok: true, language: 'en', translations: {} })

    const unique = []
    const seen = new Set()
    let totalCharacters = 0
    for (const value of Array.isArray(body.strings) ? body.strings : []) {
      const text = clean(value)
      if (!text || seen.has(text)) continue
      if (totalCharacters + text.length > 12_000) break
      seen.add(text)
      unique.push(text)
      totalCharacters += text.length
      if (unique.length >= 40) break
    }
    if (!unique.length) return res.status(200).json({ ok: true, language: languageCode, translations: {} })

    const language = languageNames[languageCode]
    const instructions = `Translate visible user-interface text from English into ${language}. Translate every sentence and paragraph completely, including help text, warnings, button labels, placeholders and accessibility labels. Preserve TravelMate, provider/airline/operator names, airport and railway station codes, route names, dates, times, numbers, currency values, URLs, email addresses, placeholders like {name}, and symbols. Keep line breaks and punctuation where practical. Use natural, concise wording suitable for a travel and emergency application. Do not add explanations. Return exactly one translation for every source string and copy each source field exactly.`

    const { text, json } = await createSambaNovaResponse({
      input: JSON.stringify({ strings: unique }),
      instructions,
      model: process.env.SAMBANOVA_TRANSLATION_MODEL || process.env.SAMBANOVA_MODEL || 'gpt-oss-120b',
      maxOutputTokens: 4096,
      reasoningEffort: 'low',
      schema: translationSchema,
      schemaName: 'travelmate_complete_ui_translations'
    })

    const parsed = json || JSON.parse(text)
    const translations = {}
    for (const item of Array.isArray(parsed.translations) ? parsed.translations : []) {
      const source = clean(item.source)
      const translation = clean(item.translation, 2400)
      if (seen.has(source) && translation && translation !== source) translations[source] = translation
    }

    res.setHeader('Cache-Control', 'no-store, max-age=0')
    return res.status(200).json({ ok: true, language: languageCode, translations })
  } catch (error) {
    const status = Number(error.status || providerStatus(error))
    return res.status(status).json({
      ok: false,
      mode: error.code === 'SAMBANOVA_NOT_CONFIGURED' ? 'provider-unconfigured' : 'provider-error',
      message: error.message || 'Translation service could not respond.',
      error: error.code || 'TRANSLATION_ERROR'
    })
  }
}

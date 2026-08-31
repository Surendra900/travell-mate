import { fetchJsonWithTimeout } from './_security.js'

export function configuredSambaNovaKey() {
  const key = String(process.env.SAMBANOVA_API_KEY || '').trim()
  if (!key || /^(your_|replace_|example|demo)/i.test(key)) return ''
  return key
}

export function sambaNovaBaseUrl() {
  return String(process.env.SAMBANOVA_BASE_URL || 'https://api.sambanova.ai/v1').trim().replace(/\/+$/, '')
}

function cleanContent(value) {
  if (typeof value === 'string') return value.trim()
  if (!Array.isArray(value)) return ''
  return value.map((part) => {
    if (typeof part === 'string') return part
    if (typeof part?.text === 'string') return part.text
    return ''
  }).filter(Boolean).join('\n').trim()
}

export function sambaNovaOutputText(payload) {
  const choiceText = cleanContent(payload?.choices?.[0]?.message?.content)
  if (choiceText) return choiceText
  if (typeof payload?.output_text === 'string') return payload.output_text.trim()

  const parts = []
  for (const item of Array.isArray(payload?.output) ? payload.output : []) {
    if (item?.type !== 'message') continue
    for (const content of Array.isArray(item.content) ? item.content : []) {
      if ((content?.type === 'output_text' || content?.type === 'text') && typeof content.text === 'string') {
        parts.push(content.text)
      }
    }
  }
  return parts.join('\n').trim()
}

export function sambaNovaError(payload, response) {
  const error = new Error(
    payload?.error?.message ||
    payload?.message ||
    `SambaNova returned HTTP ${response?.status || 502}.`
  )
  error.status = response?.status || 502
  error.code = payload?.error?.code || payload?.error?.type || 'SAMBANOVA_REQUEST_FAILED'
  error.payload = payload
  return error
}

function normalizeMessages(input, instructions) {
  const messages = []
  if (instructions) messages.push({ role: 'system', content: String(instructions) })

  if (Array.isArray(input)) {
    for (const item of input) {
      const role = item?.role === 'assistant' ? 'assistant' : 'user'
      const content = cleanContent(item?.content)
      if (content) messages.push({ role, content })
    }
  } else {
    const content = cleanContent(input)
    if (content) messages.push({ role: 'user', content })
  }

  return messages
}

function isTokenLimitFailure(error, payload) {
  const message = `${error?.message || ''} ${payload?.error?.message || ''}`.toLowerCase()
  return /maximum token|max(?:imum)?[_ -]?(?:output|completion)?[_ -]?tokens|token limit|truncat|valid json|context length/.test(message)
}

function completionWasCutOff(payload) {
  const finishReason = String(payload?.choices?.[0]?.finish_reason || payload?.usage?.stop_reason || '').toLowerCase()
  return finishReason === 'length' || finishReason === 'max_tokens' || finishReason === 'max_output_tokens'
}


function parseStructuredJson(text) {
  const source = String(text || '').trim()
  const candidates = [
    source,
    source.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  ]
  const firstBrace = source.indexOf('{')
  const lastBrace = source.lastIndexOf('}')
  if (firstBrace >= 0 && lastBrace > firstBrace) candidates.push(source.slice(firstBrace, lastBrace + 1))

  for (const candidate of candidates) {
    try { return JSON.parse(candidate) } catch { /* try the next candidate */ }
  }
  return null
}

function nextTokenBudget(current) {
  return Math.min(4096, Math.max(1600, current * 2))
}

export async function createSambaNovaResponse({
  input,
  instructions,
  model = process.env.SAMBANOVA_MODEL || 'Meta-Llama-3.3-70B-Instruct',
  maxOutputTokens = 1200,
  schema,
  schemaName = 'travelmate_response',
  timeoutMs = 45_000,
  reasoningEffort = 'low',
  retryOnTokenLimit = true
}) {
  const apiKey = configuredSambaNovaKey()
  if (!apiKey) {
    const error = new Error('SAMBANOVA_API_KEY is not configured in this deployment.')
    error.status = 503
    error.code = 'SAMBANOVA_NOT_CONFIGURED'
    throw error
  }

  const messages = normalizeMessages(input, instructions)
  if (!messages.length) {
    const error = new Error('The SambaNova request contained no usable input.')
    error.status = 400
    error.code = 'SAMBANOVA_EMPTY_INPUT'
    throw error
  }

  let tokenBudget = Math.min(4096, Math.max(256, Number(maxOutputTokens) || 1200))
  const attempts = retryOnTokenLimit ? 2 : 1
  let lastError

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const body = {
      model,
      messages,
      max_completion_tokens: tokenBudget,
      reasoning_effort: ['low', 'medium', 'high'].includes(reasoningEffort) ? reasoningEffort : 'low',
      do_sample: false,
      stream: false
    }

    if (schema) {
      body.response_format = {
        type: 'json_schema',
        json_schema: {
          name: schemaName,
          strict: true,
          schema
        }
      }
    }

    const { response, payload } = await fetchJsonWithTimeout(
      `${sambaNovaBaseUrl()}/chat/completions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(body)
      },
      timeoutMs
    )

    if (!response.ok || payload?.error) {
      const error = sambaNovaError(payload, response)
      lastError = error
      if (attempt + 1 < attempts && isTokenLimitFailure(error, payload)) {
        tokenBudget = nextTokenBudget(tokenBudget)
        continue
      }
      throw error
    }

    const text = sambaNovaOutputText(payload)
    const cutOff = completionWasCutOff(payload)
    const json = schema && text ? parseStructuredJson(text) : null
    if (text && !cutOff && (!schema || json)) return { payload, text, json }

    const invalidJson = Boolean(schema && text && !json)
    const error = new Error(
      cutOff
        ? 'SambaNova stopped before completing the response because the output-token limit was reached.'
        : invalidJson
          ? 'SambaNova returned malformed structured JSON.'
          : 'SambaNova returned an empty response.'
    )
    error.status = 502
    error.code = cutOff
      ? 'SAMBANOVA_OUTPUT_TRUNCATED'
      : invalidJson
        ? 'SAMBANOVA_INVALID_JSON'
        : 'SAMBANOVA_EMPTY_RESPONSE'
    lastError = error

    if (attempt + 1 < attempts && (cutOff || invalidJson)) {
      tokenBudget = nextTokenBudget(tokenBudget)
      continue
    }
    throw error
  }

  throw lastError || new Error('SambaNova could not complete the request.')
}

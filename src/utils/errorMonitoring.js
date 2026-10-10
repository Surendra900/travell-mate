/**
 * TravelMate Lightweight & Privacy-Safe Error Monitoring
 *
 * Adheres strictly to Digital Personal Data Protection (DPDP) Act 2023:
 * Automatically scrubs PNR numbers, phone numbers, GPS coordinates, and personal emails
 * prior to recording or transmitting diagnostic error telemetry.
 */

const ERROR_BUFFER_LIMIT = 20
const errorBuffer = []

// PII Regex Patterns
const PNR_REGEX = /\b[0-9]{10}\b/g
const PHONE_REGEX = /\b(?:\+91[\s-]?)?[6-9]\d{9}\b/g
const COORD_REGEX = /[-+]?([1-8]?\d(?:\.\d+)?|90(?:\.0+)?),\s*[-+]?(180(?:\.0+)?|(?:(?:1[0-7]\d)|(?:[1-9]?\d))(?:\.\d+)?)/g
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g

/**
 * Scrubs personally identifiable information (PII) from strings or objects.
 */
export function scrubPii(value) {
  if (value === null || value === undefined) return value
  if (typeof value === 'string') {
    return value
      .replace(EMAIL_REGEX, '[SCRUBBED_EMAIL]')
      .replace(PHONE_REGEX, '[SCRUBBED_PHONE]')
      .replace(PNR_REGEX, '[SCRUBBED_PNR]')
      .replace(COORD_REGEX, '[SCRUBBED_COORDS]')
  }
  if (Array.isArray(value)) {
    return value.map(scrubPii)
  }
  if (typeof value === 'object') {
    const cleaned = {}
    for (const [k, v] of Object.entries(value)) {
      // Direct scrub for known sensitive keys
      if (/^(pnr|pnrNumber|phone|mobile|coordinates|lat|lon|latitude|longitude|passengerName)$/i.test(k)) {
        cleaned[k] = '[SCRUBBED_SENSITIVE]'
      } else {
        cleaned[k] = scrubPii(v)
      }
    }
    return cleaned
  }
  return value
}

/**
 * Returns configured Sentry DSN from environment, if any.
 */
export function getSentryDsn() {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env.VITE_SENTRY_DSN || import.meta.env.NEXT_PUBLIC_SENTRY_DSN || ''
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN || ''
    }
  } catch {}
  return ''
}

/**
 * Captures an exception, scrubs all PII, and records the telemetry event.
 */
export function captureException(error, context = {}) {
  const dsn = getSentryDsn()
  const rawMessage = error instanceof Error ? error.message : String(error || 'Unknown error')
  const rawStack = error instanceof Error ? error.stack : ''

  const event = {
    timestamp: new Date().toISOString(),
    type: 'error',
    message: scrubPii(rawMessage),
    stack: scrubPii(rawStack),
    context: scrubPii(context)
  }

  errorBuffer.push(event)
  if (errorBuffer.length > ERROR_BUFFER_LIMIT) {
    errorBuffer.shift()
  }

  // If Sentry DSN configured, dispatch over Sentry envelope API or browser fetch
  if (dsn && typeof fetch === 'function') {
    try {
      // Basic Sentry HTTP envelope format
      const dsnUrl = new URL(dsn)
      const projectId = dsnUrl.pathname.replace(/^\//, '')
      const envelopeEndpoint = `${dsnUrl.protocol}//${dsnUrl.host}/api/${projectId}/envelope/`
      const authHeader = `Sentry sentry_version=7, sentry_client=travelmate/2.5.1, sentry_key=${dsnUrl.username}`

      const envelopeHeader = JSON.stringify({
        event_id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID().replace(/-/g, '') : Date.now().toString(16),
        sent_at: new Date().toISOString()
      })
      const itemHeader = JSON.stringify({ type: 'event' })
      const itemPayload = JSON.stringify({
        message: event.message,
        level: 'error',
        extra: event.context,
        timestamp: Math.floor(Date.now() / 1000)
      })

      fetch(envelopeEndpoint, {
        method: 'POST',
        headers: {
          'X-Sentry-Auth': authHeader,
          'Content-Type': 'application/x-sentry-envelope'
        },
        body: `${envelopeHeader}\n${itemHeader}\n${itemPayload}`,
        keepalive: true
      }).catch(() => {
        // Safe fail-open; errors during telemetry transmission must never disrupt user experience
      })
    } catch {
      // Ignore transmission issues in non-browser or offline states
    }
  }

  return event
}

/**
 * Captures an informational or warning telemetry message.
 */
export function captureMessage(message, level = 'info', context = {}) {
  const event = {
    timestamp: new Date().toISOString(),
    type: level,
    message: scrubPii(String(message)),
    context: scrubPii(context)
  }

  errorBuffer.push(event)
  if (errorBuffer.length > ERROR_BUFFER_LIMIT) {
    errorBuffer.shift()
  }

  return event
}

/**
 * Returns the diagnostic ring buffer of recent errors (PII-scrubbed).
 */
export function getRecentErrors() {
  return [...errorBuffer]
}

/**
 * Clears the error ring buffer.
 */
export function clearErrors() {
  errorBuffer.length = 0
}

/**
 * Initializes global browser error tracking handlers.
 */
export function initErrorMonitoring() {
  if (typeof window === 'undefined') return

  if (!window.__travelmateErrorHandlersRegistered) {
    window.__travelmateErrorHandlersRegistered = true

    window.addEventListener('error', (event) => {
      captureException(event.error || event.message, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      captureException(event.reason, {
        type: 'unhandledrejection'
      })
    })
  }
}

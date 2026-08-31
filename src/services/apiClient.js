let tokenProvider = null

export function configureApiTokenProvider(provider) {
  tokenProvider = typeof provider === 'function' ? provider : null
}

export async function requestApiJson(url, options = {}) {
  const controller = new AbortController()
  const timeoutMs = Number(options.timeoutMs || 15_000)
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)

  try {
    let token = ''
    if (tokenProvider) {
      try { token = await tokenProvider() || '' } catch { token = '' }
    }

    const response = await fetch(url, {
      ...options,
      cache: 'no-store',
      credentials: 'same-origin',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    })

    const data = await response.json().catch(() => ({
      ok: false,
      mode: 'error',
      message: `The server returned HTTP ${response.status} without a JSON response.`
    }))

    return {
      ...data,
      httpStatus: response.status,
      ok: response.ok && data.ok !== false
    }
  } catch (error) {
    const message = error?.name === 'AbortError'
      ? 'The request timed out. Try again.'
      : error?.message || 'The request failed.'
    return { ok: false, mode: 'network-error', message, results: [], result: null }
  } finally {
    window.clearTimeout(timeout)
  }
}

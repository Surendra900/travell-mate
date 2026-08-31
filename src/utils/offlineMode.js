const OFFLINE_CACHE = 'travelmate-ai-offline-runtime-v1'

export function browserIsOffline() {
  return typeof navigator !== 'undefined' ? !navigator.onLine : false
}

export async function warmOfflineCache() {
  if (typeof window === 'undefined' || !('caches' in window)) return { ok: false, reason: 'Cache API unsupported' }

  const urls = new Set([
    '/',
    '/index.html',
    '/planner',
    '/safety',
    '/saved',
    '/analyze',
    '/manifest.webmanifest'
  ])

  document.querySelectorAll('script[src], link[rel="stylesheet"][href], link[rel="modulepreload"][href], link[rel="icon"][href]').forEach((node) => {
    const url = node.getAttribute('src') || node.getAttribute('href')
    if (url && !url.startsWith('http')) urls.add(url)
  })

  try {
    const cache = await caches.open(OFFLINE_CACHE)
    const results = await Promise.allSettled([...urls].map((url) => cache.add(url)))
    const saved = results.filter((item) => item.status === 'fulfilled').length
    return { ok: true, saved, total: urls.size }
  } catch (error) {
    return { ok: false, reason: error?.message || 'Unable to prepare offline cache' }
  }
}

export async function getOfflineCacheStatus() {
  if (typeof window === 'undefined' || !('caches' in window)) return { supported: false, count: 0 }
  const cache = await caches.open(OFFLINE_CACHE)
  const keys = await cache.keys()
  return { supported: true, count: keys.length }
}

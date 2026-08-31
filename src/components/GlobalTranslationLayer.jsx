import { useEffect, useRef, useState } from 'react'
import { Languages, LoaderCircle } from 'lucide-react'

const TRANSLATABLE_ATTRIBUTES = ['placeholder', 'title', 'aria-label', 'alt']
const SKIP_SELECTOR = [
  '[data-no-translate]',
  'script',
  'style',
  'code',
  'pre',
  'noscript',
  'svg',
  '.leaflet-container',
  '.leaflet-control-container',
  '[contenteditable="true"]'
].join(',')

const TRANSLATING_TEXT = {
  en: 'Updating the website language…',
  hi: 'वेबसाइट की भाषा बदली जा रही है…',
  te: 'వెబ్‌సైట్ భాషను మార్చుతున్నాము…',
  ta: 'இணையதள மொழி மாற்றப்படுகிறது…',
  kn: 'ವೆಬ್‌ಸೈಟ್ ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಲಾಗುತ್ತಿದೆ…',
  ml: 'വെബ്‌സൈറ്റ് ഭാഷ മാറ്റുന്നു…',
  mr: 'वेबसाइटची भाषा बदलत आहे…',
  bn: 'ওয়েবসাইটের ভাষা পরিবর্তন করা হচ্ছে…',
  gu: 'વેબસાઇટની ભાષા બદલાઈ રહી છે…',
  ur: 'ویب سائٹ کی زبان تبدیل کی جا رہی ہے…',
  es: 'Actualizando el idioma del sitio…',
  fr: 'Mise à jour de la langue du site…',
  de: 'Die Website-Sprache wird aktualisiert…'
}

function storageKey(language) {
  return `travelmate-ui-translations-v3:${language}`
}

function readCache(language) {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(language)) || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

function writeCache(language, cache) {
  try {
    const entries = Object.entries(cache).slice(-2500)
    localStorage.setItem(storageKey(language), JSON.stringify(Object.fromEntries(entries)))
  } catch {
    // Translation remains available for the current session when storage is unavailable/full.
  }
}

function isSkipped(node) {
  const element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement
  return !element || Boolean(element.closest(SKIP_SELECTOR))
}

function shouldTranslate(value = '') {
  const text = String(value).replace(/\s+/g, ' ').trim()
  if (text.length < 2 || text.length > 1400) return false
  // Most application source copy is English. This avoids retranslating API/user content
  // that is already in a selected non-Latin language.
  if (!/[A-Za-z]/.test(text)) return false
  if (/^(https?:\/\/|www\.|mailto:|tel:|sms:|geo:)/i.test(text)) return false
  if (/^[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(text)) return false
  if (/^[A-Z0-9_-]{2,10}$/.test(text)) return false
  if (/^[-+]?\d[\d\s.,:/%-]*$/.test(text)) return false
  if (/^[A-Z]{2,5}\s*(?:→|->|–|—)\s*[A-Z]{2,5}$/.test(text)) return false
  if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) return false
  return true
}

function splitWhitespace(value = '') {
  const match = String(value).match(/^(\s*)([\s\S]*?)(\s*)$/)
  return { before: match?.[1] || '', core: match?.[2] || '', after: match?.[3] || '' }
}

function batchesFor(strings) {
  const batches = []
  let batch = []
  let characters = 0
  for (const text of strings) {
    const nextSize = characters + text.length
    if (batch.length && (batch.length >= 18 || nextSize > 5200)) {
      batches.push(batch)
      batch = []
      characters = 0
    }
    batch.push(text)
    characters += text.length
  }
  if (batch.length) batches.push(batch)
  return batches
}

async function requestTranslations(language, strings, signal) {
  const response = await fetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    cache: 'no-store',
    signal,
    body: JSON.stringify({ language, strings })
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.ok) throw new Error(data.message || `Translation request failed (${response.status}).`)
  return data.translations && typeof data.translations === 'object' ? data.translations : {}
}

async function requestWithRetry(language, strings, signal) {
  try {
    return await requestTranslations(language, strings, signal)
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    await new Promise((resolve) => window.setTimeout(resolve, 450))
    return requestTranslations(language, strings, signal)
  }
}

function visibleValueAttribute(element) {
  if (element?.tagName !== 'INPUT') return false
  return ['button', 'submit', 'reset'].includes(String(element.type || '').toLowerCase())
}

export default function GlobalTranslationLayer({ language = 'en' }) {
  const runIdRef = useRef(0)
  const textMetaRef = useRef(new WeakMap())
  const attributeMetaRef = useRef(new WeakMap())
  const [state, setState] = useState('idle')

  useEffect(() => {
    if (typeof document === 'undefined' || !document.body) return undefined

    const runId = ++runIdRef.current
    const controller = new AbortController()
    const textMeta = textMetaRef.current
    const attributeMeta = attributeMetaRef.current
    const cache = readCache(language)
    let observer
    let timer
    let translating = false

    setState(language === 'en' ? 'idle' : 'working')
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr'

    function sourceForText(node) {
      const current = String(node.nodeValue || '')
      const existing = textMeta.get(node)
      if (existing && current === existing.rendered) return existing.source
      const { core } = splitWhitespace(current)
      textMeta.set(node, { source: core, rendered: current })
      return core
    }

    function sourceForAttribute(element, attribute) {
      const current = element.getAttribute(attribute) || ''
      let attributes = attributeMeta.get(element)
      if (!attributes) {
        attributes = new Map()
        attributeMeta.set(element, attributes)
      }
      const existing = attributes.get(attribute)
      if (existing && current === existing.rendered) return existing.source
      attributes.set(attribute, { source: current, rendered: current })
      return current
    }

    function addAttributeTarget(targets, strings, node, attribute) {
      if (!node.hasAttribute(attribute)) return
      const source = sourceForAttribute(node, attribute)
      if (!shouldTranslate(source)) return
      targets.push({ type: 'attribute', node, attribute, source })
      strings.add(source)
    }

    function collect(startRoots = [document.body, document.head]) {
      const targets = []
      const strings = new Set()

      for (const start of startRoots) {
        if (!start || isSkipped(start)) continue
        const roots = start.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? Array.from(start.childNodes) : [start]
        for (const root of roots) {
          if (!root || isSkipped(root)) continue
          if (root.nodeType === Node.TEXT_NODE) {
            const source = sourceForText(root)
            if (shouldTranslate(source)) {
              targets.push({ type: 'text', node: root, source })
              strings.add(source)
            }
            continue
          }
          if (root.nodeType !== Node.ELEMENT_NODE) continue

          const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
          let node = root
          while (node) {
            if (!isSkipped(node)) {
              if (node.nodeType === Node.TEXT_NODE) {
                const source = sourceForText(node)
                if (shouldTranslate(source)) {
                  targets.push({ type: 'text', node, source })
                  strings.add(source)
                }
              } else if (node.nodeType === Node.ELEMENT_NODE) {
                for (const attribute of TRANSLATABLE_ATTRIBUTES) addAttributeTarget(targets, strings, node, attribute)
                if (visibleValueAttribute(node)) addAttributeTarget(targets, strings, node, 'value')
                if (node.tagName === 'META' && String(node.getAttribute('name') || '').toLowerCase() === 'description') {
                  addAttributeTarget(targets, strings, node, 'content')
                }
              }
            }
            node = walker.nextNode()
          }
        }
      }

      return { targets, strings: Array.from(strings) }
    }

    function renderTargets(targets, dictionary) {
      if (runIdRef.current !== runId) return
      translating = true
      observer?.disconnect()
      try {
        for (const target of targets) {
          if (!target.node?.isConnected) continue
          const translated = language === 'en' ? target.source : dictionary[target.source]
          if (!translated) continue

          if (target.type === 'text') {
            const current = String(target.node.nodeValue || '')
            const { before, after } = splitWhitespace(current)
            const rendered = `${before}${translated}${after}`
            if (current !== rendered) target.node.nodeValue = rendered
            textMeta.set(target.node, { source: target.source, rendered })
          } else {
            if (target.node.getAttribute(target.attribute) !== translated) {
              target.node.setAttribute(target.attribute, translated)
            }
            let attributes = attributeMeta.get(target.node)
            if (!attributes) {
              attributes = new Map()
              attributeMeta.set(target.node, attributes)
            }
            attributes.set(target.attribute, { source: target.source, rendered: translated })
          }
        }
      } finally {
        translating = false
        observer?.observe(document.documentElement, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
          attributeFilter: [...TRANSLATABLE_ATTRIBUTES, 'value', 'content']
        })
      }
    }

    async function translateRoots(showStatus = false) {
      if (translating || runIdRef.current !== runId) return
      if (showStatus && language !== 'en') setState('working')
      const { targets, strings } = collect()
      if (!targets.length) {
        setState('idle')
        return
      }

      if (language === 'en') {
        renderTargets(targets, {})
        setState('idle')
        return
      }

      const missing = strings.filter((text) => !cache[text])
      let hadFailure = false
      for (const batch of batchesFor(missing)) {
        if (runIdRef.current !== runId) return
        try {
          const received = await requestWithRetry(language, batch, controller.signal)
          if (runIdRef.current !== runId) return
          Object.assign(cache, received)
          writeCache(language, cache)
        } catch (error) {
          if (error?.name === 'AbortError') return
          hadFailure = true
          console.warn('TravelMate full-page translation unavailable:', error.message)
          break
        }
      }

      renderTargets(targets, cache)
      const untranslated = strings.some((text) => !cache[text])
      setState(hadFailure || untranslated ? 'partial' : 'idle')
    }

    observer = new MutationObserver((mutations) => {
      if (translating || runIdRef.current !== runId) return
      const relevant = mutations.some((mutation) => {
        const target = mutation.target?.nodeType === Node.TEXT_NODE ? mutation.target.parentElement : mutation.target
        return target && !isSkipped(target)
      })
      if (!relevant) return
      clearTimeout(timer)
      timer = window.setTimeout(() => translateRoots(false), 180)
    })

    translateRoots(true)
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES, 'value', 'content']
    })

    return () => {
      controller.abort()
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [language])

  // Keep translation failures silent in the interface. Existing translated text and
  // cached translations remain visible, while untranslated copy falls back to English.
  // Only the short in-progress indicator is shown during an active language change.
  if (state !== 'working') return null
  return (
    <div className="translation-status" role="status" aria-live="polite" data-no-translate>
      <LoaderCircle className="animate-spin" size={17} aria-hidden="true" />
      <Languages size={17} aria-hidden="true" />
      <span>{TRANSLATING_TEXT[language] || TRANSLATING_TEXT.en}</span>
    </div>
  )
}

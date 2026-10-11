import fs from 'node:fs'
import path from 'node:path'
import { BASE_URL, ROUTES, withBrowser, createPage } from './common.mjs'

const EMOJI_AND_SYMBOLS_REGEX = /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE00}-\u{FE0F}✓✔✕✖★☆⚡➡➜→←↑↓▲▼►◄◆◇■□●○]/u

function scanSourceFiles(dir, violations) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanSourceFiles(fullPath, violations)
      }
    } else if (/\.(jsx?|tsx?|html|json|md)$/.test(entry.name)) {
      if (fullPath.includes('scripts\\launch-checks') || fullPath.includes('scripts/launch-checks')) {
        continue
      }
      const content = fs.readFileSync(fullPath, 'utf8')
      const lines = content.split('\n')
      lines.forEach((line, index) => {
        const match = line.match(EMOJI_AND_SYMBOLS_REGEX)
        if (match) {
          violations.push({
            type: 'source-emoji',
            file: fullPath,
            line: index + 1,
            symbol: match[0],
            snippet: line.trim().slice(0, 80)
          })
        }
      })
    }
  }
}

export async function runScanner() {
  const violations = []
  scanSourceFiles(path.resolve('src'), violations)
  scanSourceFiles(path.resolve('public'), violations)

  const indexHtml = path.resolve('index.html')
  if (fs.existsSync(indexHtml)) {
    const content = fs.readFileSync(indexHtml, 'utf8')
    content.split('\n').forEach((line, index) => {
      const match = line.match(EMOJI_AND_SYMBOLS_REGEX)
      if (match) {
        violations.push({
          type: 'source-emoji',
          file: indexHtml,
          line: index + 1,
          symbol: match[0],
          snippet: line.trim().slice(0, 80)
        })
      }
    })
  }

  await withBrowser(async (browser) => {
    const { context, page } = await createPage(browser)
    try {
      for (const route of ROUTES) {
        const url = `${BASE_URL}${route}`
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
        await page.waitForTimeout(500)

        const title = await page.title()
        if (EMMOJI_TEST(title)) {
          violations.push({
            type: 'rendered-emoji-title',
            route,
            detail: `Page title contains emoji or banned symbol: ${title}`
          })
        }

        const domHits = await page.evaluate(() => {
          const regex = /[\u{1F300}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE00}-\u{FE0F}✓✔✕✖★☆⚡➡➜→←↑↓▲▼►◄◆◇■□●○]/u
          const hits = []
          const elements = document.querySelectorAll('*')
          for (const el of elements) {
            // Check direct text node content
            for (const child of el.childNodes) {
              if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent || ''
                const m = text.match(regex)
                if (m) {
                  hits.push({
                    tag: el.tagName.toLowerCase(),
                    symbol: m[0],
                    text: text.trim().slice(0, 60)
                  })
                }
              }
            }
            // Check attributes
            for (const attr of ['alt', 'aria-label', 'placeholder', 'title']) {
              const val = el.getAttribute(attr) || ''
              const m = val.match(regex)
              if (m) {
                hits.push({
                  tag: el.tagName.toLowerCase(),
                  attr,
                  symbol: m[0],
                  text: val.trim().slice(0, 60)
                })
              }
            }
          }
          return hits
        })

        for (const hit of domHits) {
          violations.push({
            type: 'rendered-emoji-dom',
            route,
            detail: JSON.stringify(hit)
          })
        }
      }
    } finally {
      await context.close()
    }
  })

  return violations
}

function EMMOJI_TEST(str) {
  return EMOJI_AND_SYMBOLS_REGEX.test(str || '')
}

if (process.argv[1] && process.argv[1].endsWith('emoji.mjs')) {
  runScanner().then((violations) => {
    if (violations.length > 0) {
      console.error(`FAILED: Found ${violations.length} emoji/symbol violations:`)
      console.error(JSON.stringify(violations, null, 2))
      process.exit(1)
    } else {
      console.log('PASSED: No emoji or emoji-like symbols found.')
      process.exit(0)
    }
  }).catch((err) => {
    console.error('Scanner error:', err)
    process.exit(1)
  })
}

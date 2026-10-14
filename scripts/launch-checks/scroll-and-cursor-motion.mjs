import fs from 'node:fs'
import path from 'node:path'
import { BASE_URL, ROUTES, withBrowser, createPage } from './common.mjs'

const BANNED_SCROLL_CURSOR_PATTERNS = [
  /\bwhileInView\b/,
  /\buseScroll\b/,
  /\bScrollTrigger\b/,
  /\bAOS\b/,
  /\bLenis\b/,
  /\blocomotive-scroll\b/,
  /\bparallax\b/i,
  /\banimation-timeline\b/i,
  /\bmarquee\b/i,
  /\bcursor:\s*none\b/i,
  /\bcursor-none\b/i
]

function scanSourceFiles(dir, violations) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanSourceFiles(fullPath, violations)
      }
    } else if (/\.(jsx?|tsx?|html|css)$/.test(entry.name)) {
      if (fullPath.includes('scripts\\launch-checks') || fullPath.includes('scripts/launch-checks')) {
        continue
      }
      const content = fs.readFileSync(fullPath, 'utf8')
      const lines = content.split('\n')
      lines.forEach((line, index) => {
        for (const pattern of BANNED_SCROLL_CURSOR_PATTERNS) {
          if (pattern.test(line)) {
            violations.push({
              type: 'source-scroll-cursor-pattern',
              file: fullPath,
              line: index + 1,
              pattern: pattern.toString(),
              snippet: line.trim().slice(0, 80)
            })
            break
          }
        }
      })
    }
  }
}

export async function runScanner() {
  const violations = []
  scanSourceFiles(path.resolve('src'), violations)
  const indexHtml = path.resolve('index.html')
  if (fs.existsSync(indexHtml)) {
    const content = fs.readFileSync(indexHtml, 'utf8')
    content.split('\n').forEach((line, index) => {
      for (const pattern of BANNED_SCROLL_CURSOR_PATTERNS) {
        if (pattern.test(line)) {
          violations.push({
            type: 'source-scroll-cursor-pattern',
            file: indexHtml,
            line: index + 1,
            pattern: pattern.toString(),
            snippet: line.trim().slice(0, 80)
          })
          break
        }
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

        const pageViolations = await page.evaluate(() => {
          const results = []
          const elements = document.querySelectorAll('*')
          for (const el of elements) {
            const style = window.getComputedStyle(el)
            if (style.cursor === 'none') {
              results.push({
                tag: el.tagName.toLowerCase(),
                issue: 'Computed cursor is none'
              })
            }
            const dur = parseFloat(style.animationDuration) || 0
            const transDur = parseFloat(style.transitionDuration) || 0
            if (dur > 0.25) {
              results.push({
                tag: el.tagName.toLowerCase(),
                issue: `Animation duration ${dur}s exceeds 200ms limit`
              })
            }
            if (transDur > 0.25) {
              results.push({
                tag: el.tagName.toLowerCase(),
                issue: `Transition duration ${transDur}s exceeds 200ms limit`
              })
            }
          }
          return results
        })

        for (const v of pageViolations) {
          violations.push({
            type: 'rendered-motion-issue',
            route,
            detail: JSON.stringify(v)
          })
        }
      }
    } finally {
      await context.close()
    }
  })

  return violations
}

if (process.argv[1] && process.argv[1].endsWith('scroll-and-cursor-motion.mjs')) {
  runScanner().then((violations) => {
    if (violations.length > 0) {
      console.error(`FAILED: Found ${violations.length} scroll or cursor motion violations:`)
      console.error(JSON.stringify(violations, null, 2))
      process.exit(1)
    } else {
      console.log('PASSED: No scroll-jacking, parallax, marquee, custom cursor, or excessive animation duration found.')
      process.exit(0)
    }
  }).catch((err) => {
    console.error('Scanner error:', err)
    process.exit(1)
  })
}

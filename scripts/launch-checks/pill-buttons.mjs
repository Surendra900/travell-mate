import fs from 'node:fs'
import path from 'node:path'
import { BASE_URL, ROUTES, withBrowser, createPage } from './common.mjs'

const BANNED_BUTTON_CLASSES = /\b(rounded-full|rounded-3xl|rounded-2xl)\b/i

function scanSourceFiles(dir, violations) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanSourceFiles(fullPath, violations)
      }
    } else if (/\.(jsx?|tsx?|html)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8')
      const lines = content.split('\n')
      lines.forEach((line, index) => {
        if (/<button|<Link|<a\b|role=["']button["']|type=["']submit["']/i.test(line) || /btn\b/i.test(line)) {
          if (BANNED_BUTTON_CLASSES.test(line)) {
            violations.push({
              type: 'source-pill-button-class',
              file: fullPath,
              line: index + 1,
              detail: `Button or link with excessive border radius class: ${line.trim().slice(0, 100)}`
            })
          }
        }
      })
    }
  }
}

export async function runScanner() {
  const violations = []
  scanSourceFiles(path.resolve('src'), violations)

  await withBrowser(async (browser) => {
    const { context, page } = await createPage(browser)
    try {
      for (const route of ROUTES) {
        const url = `${BASE_URL}${route}`
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
        await page.waitForTimeout(500)

        const pageViolations = await page.evaluate(() => {
          const results = []
          const elements = document.querySelectorAll('button, a[role="button"], input[type="submit"], input[type="button"], [role="button"]')
          for (const el of elements) {
            const style = window.getComputedStyle(el)
            const h = el.offsetHeight || 0
            if (h === 0) continue

            const parseRadius = (val) => {
              const m = (val || '').match(/([\d.]+)px/)
              return m ? parseFloat(m[1]) : 0
            }

            const rTopLeft = parseRadius(style.borderTopLeftRadius)
            const rTopRight = parseRadius(style.borderTopRightRadius)
            const rBottomRight = parseRadius(style.borderBottomRightRadius)
            const rBottomLeft = parseRadius(style.borderBottomLeftRadius)
            const maxRadius = Math.max(rTopLeft, rTopRight, rBottomRight, rBottomLeft)

            const textSnippet = (el.innerText || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40)

            if (maxRadius >= 9999 || maxRadius >= (h / 2) || maxRadius > 8) {
              results.push({
                tag: el.tagName.toLowerCase(),
                text: textSnippet,
                class: el.className,
                computedRadius: `${maxRadius}px`,
                elementHeight: `${h}px`
              })
            }
          }
          return results
        })

        for (const v of pageViolations) {
          violations.push({
            type: 'rendered-pill-button',
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

if (process.argv[1] && process.argv[1].endsWith('pill-buttons.mjs')) {
  runScanner().then((violations) => {
    if (violations.length > 0) {
      console.error(`FAILED: Found ${violations.length} pill button violations:`)
      console.error(JSON.stringify(violations, null, 2))
      process.exit(1)
    } else {
      console.log('PASSED: No pill buttons found. All buttons within 4px to 8px corner radius.')
      process.exit(0)
    }
  }).catch((err) => {
    console.error('Scanner error:', err)
    process.exit(1)
  })
}

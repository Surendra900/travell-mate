import fs from 'node:fs'
import path from 'node:path'
import { BASE_URL, ROUTES, withBrowser, createPage } from './common.mjs'

const PLACEHOLDER_PATTERNS = [
  /lorem ipsum/i,
  /\bTODO\b/,
  /\bFIXME\b/,
  /\bexample\.com\b/i,
  /localhost:(5173|3000|8080)/i,
  /\bYour Name\b/i,
  /\btest data\b/i
]

function scanSourceFiles(dir, violations) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanSourceFiles(fullPath, violations)
      }
    } else if (/\.(jsx?|tsx?|html|json)$/.test(entry.name)) {
      if (fullPath.includes('scripts\\launch-checks') || fullPath.includes('scripts/launch-checks')) {
        continue
      }
      const content = fs.readFileSync(fullPath, 'utf8')
      const lines = content.split('\n')
      lines.forEach((line, index) => {
        // Check console.log calls in production code
        if (/\bconsole\.log\(/.test(line)) {
          violations.push({
            type: 'source-console-log',
            file: fullPath,
            line: index + 1,
            detail: `Production console.log found: ${line.trim().slice(0, 80)}`
          })
        }
        for (const pattern of PLACEHOLDER_PATTERNS) {
          if (pattern.test(line)) {
            violations.push({
              type: 'source-placeholder',
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
  scanSourceFiles(path.resolve('public'), violations)

  await withBrowser(async (browser) => {
    const { context, page } = await createPage(browser)
    try {
      for (const route of ROUTES) {
        const url = `${BASE_URL}${route}`
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
        await page.waitForTimeout(500)

        const pageViolations = await page.evaluate(() => {
          const results = []
          const bannedRegex = [
            'lorem ipsum',
            '\\bTODO\\b',
            '\\bFIXME\\b',
            'example\\.com',
            '\\bYour Name\\b',
            '\\btest data\\b'
          ]
          const elements = document.querySelectorAll('*')
          for (const el of elements) {
            for (const child of el.childNodes) {
              if (child.nodeType === Node.TEXT_NODE) {
                const text = (child.textContent || '').trim()
                if (text.length > 0) {
                  for (const b of bannedRegex) {
                    if (new RegExp(b, 'i').test(text)) {
                      results.push({
                        tag: el.tagName.toLowerCase(),
                        pattern: b,
                        text: text.slice(0, 80)
                      })
                      break
                    }
                  }
                }
              }
            }
          }
          return results
        })

        for (const v of pageViolations) {
          violations.push({
            type: 'rendered-placeholder',
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

if (process.argv[1] && process.argv[1].endsWith('placeholders.mjs')) {
  runScanner().then((violations) => {
    if (violations.length > 0) {
      console.error(`FAILED: Found ${violations.length} placeholder / console.log violations:`)
      console.error(JSON.stringify(violations, null, 2))
      process.exit(1)
    } else {
      console.log('PASSED: No lorem ipsum, placeholder contacts, TODOs, or console.log statements found.')
      process.exit(0)
    }
  }).catch((err) => {
    console.error('Scanner error:', err)
    process.exit(1)
  })
}

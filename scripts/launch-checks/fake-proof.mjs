import fs from 'node:fs'
import path from 'node:path'
import { BASE_URL, ROUTES, withBrowser, createPage } from './common.mjs'

const FAKE_PROOF_PATTERNS = [
  /\b\d+([kKmM]|\+)\s*(users|travelers|passengers|customers|bookings|trips|reviews)\b/i,
  /\btrusted by\b/i,
  /\btestimonials?\b/i,
  /\brating(s)?\s*:\s*[45](\.\d)?/i,
  /\b5\s*stars?\b/i,
  /\bcount-?up\b/i,
  /\bcounter\b/i
]

function scanSourceFiles(dir, violations) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanSourceFiles(fullPath, violations)
      }
    } else if (/\.(jsx?|tsx?|html)$/.test(entry.name)) {
      if (fullPath.includes('scripts\\launch-checks') || fullPath.includes('scripts/launch-checks')) {
        continue
      }
      const content = fs.readFileSync(fullPath, 'utf8')
      const lines = content.split('\n')
      lines.forEach((line, index) => {
        // Exclude internal operational counters like loop index or tatkal time countdown
        if (line.includes('countdownTimer') || line.includes('tatkal') || line.includes('import ')) {
          return
        }
        for (const pattern of FAKE_PROOF_PATTERNS) {
          if (pattern.test(line)) {
            violations.push({
              type: 'source-fake-proof',
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
            '\\b\\d+([kKmM]|\\+)\\s*(users|travelers|passengers|customers|bookings|trips|reviews)\\b',
            '\\btrusted by\\b',
            '\\btestimonials?\\b',
            '\\b5\\s*stars?\\b'
          ]

          const allElements = document.querySelectorAll('*')
          for (const el of allElements) {
            for (const child of el.childNodes) {
              if (child.nodeType === Node.TEXT_NODE) {
                const text = (child.textContent || '').trim()
                if (text.length > 0) {
                  for (const patternStr of bannedRegex) {
                    const reg = new RegExp(patternStr, 'i')
                    if (reg.test(text)) {
                      results.push({
                        tag: el.tagName.toLowerCase(),
                        pattern: patternStr,
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
            type: 'rendered-fake-proof',
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

if (process.argv[1] && process.argv[1].endsWith('fake-proof.mjs')) {
  runScanner().then((violations) => {
    if (violations.length > 0) {
      console.error(`FAILED: Found ${violations.length} fake proof / testimonial violations:`)
      console.error(JSON.stringify(violations, null, 2))
      process.exit(1)
    } else {
      console.log('PASSED: No fake proof, testimonials, star ratings, or fabricated user statistics found.')
      process.exit(0)
    }
  }).catch((err) => {
    console.error('Scanner error:', err)
    process.exit(1)
  })
}

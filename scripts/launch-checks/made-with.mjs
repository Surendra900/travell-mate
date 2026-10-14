import fs from 'node:fs'
import path from 'node:path'
import { BASE_URL, ROUTES, withBrowser, createPage } from './common.mjs'

const BANNED_BUILDER_PATTERNS = [
  /\blovable(\.dev)?\b/i,
  /\bbolt(\.new)?\b/i,
  /\bv0\.dev\b/i,
  /\breplit\b/i,
  /\bemergent\b/i,
  /\bgpt engineer\b/i,
  /\bmade with (ai|love|react|vite)\b/i,
  /\bbuilt with (ai|lovable|bolt|v0)\b/i,
  /\bpowered by (ai|lovable|bolt)\b/i,
  /\bvite \+ react\b/i,
  /\bvite app\b/i,
  /\/vite\.svg\b/i
]

function scanSourceFiles(dir, violations) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanSourceFiles(fullPath, violations)
      }
    } else if (/\.(jsx?|tsx?|html|json|webmanifest)$/.test(entry.name)) {
      if (fullPath.includes('scripts\\launch-checks') || fullPath.includes('scripts/launch-checks')) {
        continue
      }
      const content = fs.readFileSync(fullPath, 'utf8')
      const lines = content.split('\n')
      lines.forEach((line, index) => {
        for (const pattern of BANNED_BUILDER_PATTERNS) {
          if (pattern.test(line)) {
            violations.push({
              type: 'source-made-with-tag',
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

  const rootFiles = ['index.html', 'package.json']
  for (const f of rootFiles) {
    const full = path.resolve(f)
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, 'utf8')
      content.split('\n').forEach((line, index) => {
        for (const pattern of BANNED_BUILDER_PATTERNS) {
          if (pattern.test(line)) {
            violations.push({
              type: 'source-made-with-tag',
              file: full,
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

  await withBrowser(async (browser) => {
    const { context, page } = await createPage(browser)
    try {
      for (const route of ROUTES) {
        const url = `${BASE_URL}${route}`
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
        await page.waitForTimeout(500)

        const title = await page.title()
        if (/vite \+ react|vite app|react app/i.test(title)) {
          violations.push({
            type: 'rendered-template-title',
            route,
            detail: `Template title detected: ${title}`
          })
        }

        const hits = await page.evaluate(() => {
          const results = []
          const bannedRegex = [
            '\\blovable\\b',
            '\\bbolt\\.new\\b',
            '\\bv0\\.dev\\b',
            '\\bmade with (ai|love|react)\\b',
            '\\bpowered by ai\\b'
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

        for (const h of hits) {
          violations.push({
            type: 'rendered-made-with-element',
            route,
            detail: JSON.stringify(h)
          })
        }
      }
    } finally {
      await context.close()
    }
  })

  return violations
}

if (process.argv[1] && process.argv[1].endsWith('made-with.mjs')) {
  runScanner().then((violations) => {
    if (violations.length > 0) {
      console.error(`FAILED: Found ${violations.length} builder / AI tag violations:`)
      console.error(JSON.stringify(violations, null, 2))
      process.exit(1)
    } else {
      console.log('PASSED: No site builder tags, "Made with AI" marks, or template remnants found.')
      process.exit(0)
    }
  }).catch((err) => {
    console.error('Scanner error:', err)
    process.exit(1)
  })
}

import fs from 'node:fs'
import path from 'node:path'
import { BASE_URL, ROUTES, withBrowser, createPage } from './common.mjs'

const UNICODE_EM_DASH = /[\u2014\u2015]/g
const HTML_ENTITY_MDASH = /&mdash;/gi
const ESCAPED_MDASH = /\\u2014/gi
const SPACED_HYPHEN_DASH = /\s-\s/g

function isDoubleHyphenDash(line) {
  // Ignore HTML comments, CSS custom properties, JS decrement, CLI flags, markdown frontmatter
  if (line.includes('<!--') || line.includes('-->') || line.includes('--tw-') || line.includes('---')) {
    return false
  }
  if (/\b[a-zA-Z0-9]+--[a-zA-Z0-9]+\b/.test(line)) {
    return true
  }
  if (/\s--\s/.test(line)) {
    return true
  }
  return false
}

function isSpacedDashViolation(line, fullPath) {
  if (line.includes('git -') || line.includes('npm -') || line.includes('node -') || line.includes('curl -')) {
    return false
  }
  if (!/\s-\s/.test(line)) return false

  // If Markdown, JSON, HTML or plaintext file, every spaced hyphen is a dash violation
  if (/\.(md|json|html|txt)$/.test(fullPath)) return true

  // Comments in code: spaced hyphen is a dash violation
  if (/^\s*(?:\/\/|\/\*|\*)/.test(line)) return true

  // Strip template literal interpolations ${...} to test copy text only
  const copyPart = line.replace(/\$\{([^}]+)\}/g, ' ')

  // Check string literals
  const stringMatches = copyPart.match(/(["'`])(?:(?=(\\?))\2.)*?\1/g) || []
  for (const str of stringMatches) {
    if (/\s-\s/.test(str)) {
      return true
    }
  }

  // Check JSX text outside tags: > ... - ... <
  const jsxTextMatches = copyPart.match(/>([^<]+)</g) || []
  for (const jt of jsxTextMatches) {
    if (/\s-\s/.test(jt)) {
      return true
    }
  }

  return false
}

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
        if (UNICODE_EM_DASH.test(line)) {
          violations.push({
            type: 'source-unicode-em-dash',
            file: fullPath,
            line: index + 1,
            detail: `Found U+2014/U+2015 in: ${line.trim().slice(0, 100)}`
          })
        }
        if (HTML_ENTITY_MDASH.test(line)) {
          violations.push({
            type: 'source-entity-mdash',
            file: fullPath,
            line: index + 1,
            detail: `Found &mdash; in: ${line.trim().slice(0, 100)}`
          })
        }
        if (ESCAPED_MDASH.test(line)) {
          violations.push({
            type: 'source-escaped-mdash',
            file: fullPath,
            line: index + 1,
            detail: `Found \\u2014 in: ${line.trim().slice(0, 100)}`
          })
        }
        if (isSpacedDashViolation(line, fullPath)) {
          violations.push({
            type: 'source-spaced-hyphen-dash',
            file: fullPath,
            line: index + 1,
            detail: `Found spaced hyphen dash in: ${line.trim().slice(0, 100)}`
          })
        }
        if (isDoubleHyphenDash(line)) {
          violations.push({
            type: 'source-double-hyphen-dash',
            file: fullPath,
            line: index + 1,
            detail: `Found double hyphen dash in: ${line.trim().slice(0, 100)}`
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

  const rootFiles = ['index.html', 'README.md']
  for (const f of rootFiles) {
    const full = path.resolve(f)
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, 'utf8')
      content.split('\n').forEach((line, index) => {
        if (UNICODE_EM_DASH.test(line)) {
          violations.push({
            type: 'source-unicode-em-dash',
            file: full,
            line: index + 1,
            detail: `Found U+2014/U+2015 in: ${line.trim().slice(0, 100)}`
          })
        }
        if (HTML_ENTITY_MDASH.test(line)) {
          violations.push({
            type: 'source-entity-mdash',
            file: full,
            line: index + 1,
            detail: `Found &mdash; in: ${line.trim().slice(0, 100)}`
          })
        }
        if (isDoubleHyphenDash(line)) {
          violations.push({
            type: 'source-double-hyphen-dash',
            file: full,
            line: index + 1,
            detail: `Found double hyphen dash in: ${line.trim().slice(0, 100)}`
          })
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
        if (/[\u2014\u2015]|\s-\s|--/.test(title)) {
          violations.push({
            type: 'rendered-em-dash-title',
            route,
            detail: `Page title contains dash violation: ${title}`
          })
        }

        const metas = await page.evaluate(() => {
          const results = []
          const metaElements = document.querySelectorAll('meta')
          for (const m of metaElements) {
            const val = m.getAttribute('content') || ''
            if (/[\u2014\u2015]|&mdash;|\\u2014|\s-\s/.test(val)) {
              results.push({
                name: m.getAttribute('name') || m.getAttribute('property'),
                content: val
              })
            }
          }
          return results
        })

        for (const m of metas) {
          violations.push({
            type: 'rendered-em-dash-meta',
            route,
            detail: `Meta tag ${m.name} contains dash violation: ${m.content}`
          })
        }

        const textViolations = await page.evaluate(() => {
          const results = []
          const all = document.querySelectorAll('*')
          for (const el of all) {
            const tag = el.tagName.toLowerCase()
            if (['script', 'style', 'noscript'].includes(tag)) continue
            for (const child of el.childNodes) {
              if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent || ''
                if (/[\u2014\u2015]/.test(text)) {
                  results.push({
                    tag: el.tagName.toLowerCase(),
                    text: text.trim().slice(0, 80)
                  })
                }
              }
            }
          }
          return results
        })

        for (const tv of textViolations) {
          violations.push({
            type: 'rendered-em-dash-text',
            route,
            detail: JSON.stringify(tv)
          })
        }
      }
    } finally {
      await context.close()
    }
  })

  return violations
}

if (process.argv[1] && process.argv[1].endsWith('em-dash.mjs')) {
  runScanner().then((violations) => {
    if (violations.length > 0) {
      console.error(`FAILED: Found ${violations.length} em dash / dash pattern violations:`)
      console.error(JSON.stringify(violations, null, 2))
      process.exit(1)
    } else {
      console.log('PASSED: No em dashes, double hyphens, or spaced hyphens found.')
      process.exit(0)
    }
  }).catch((err) => {
    console.error('Scanner error:', err)
    process.exit(1)
  })
}

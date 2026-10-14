import fs from 'node:fs'
import path from 'node:path'
import { BASE_URL, ROUTES, withBrowser, createPage } from './common.mjs'

const BANNED_PATTERNS = [
  /\brevolutioniz(e|es|ed|ing)\b/i,
  /\bunlock(s|ed|ing)?\b/i,
  /\bunleash(es|ed|ing)?\b/i,
  /\belevat(e|es|ed|ing)\b/i,
  /\bempower(s|ed|ing)?\b/i,
  /\bsupercharg(e|es|ed|ing)\b/i,
  /\bseamless(ly)?\b/i,
  /\beffortless(ly)?\b/i,
  /\bcutting-edge\b/i,
  /\bnext-generation\b/i,
  /\bgame-?changer\b/i,
  /\ball-in-one\b/i,
  /\brobust\b/i,
  /\bholistic\b/i,
  /\bleverag(e|es|ed|ing)\b/i,
  /in today'?s fast-paced world/i,
  /take it to the next level/i,
  /your ultimate/i,
  /whether you are/i,
  /not just .+ but/i,
  /welcome to/i,
  /!/
]

function hasSlopCopyViolation(line, pattern) {
  if (pattern.toString() === '/!/') {
    // Exclude boolean equality / inequality operators
    if (/!==|!=/.test(line)) return false
    // Check if exclamation mark is strictly inside string quotes or JSX text
    const inSingle = /'[^'\\]*(?:\\.[^'\\]*)*!'/.test(line)
    const inDouble = /"[^"\\]*(?:\\.[^"\\]*)*!"/.test(line)
    const inBacktick = /`[^`\\]*(?:\\.[^`\\]*)*!`/.test(line)
    const inJsx = />[^<]*![^<]*</.test(line)
    return inSingle || inDouble || inBacktick || inJsx
  }
  return pattern.test(line)
}

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
        // Exclude JS code logic comments or test assertions
        if (line.includes('//') || line.includes('import ') || line.includes('console.')) {
          return
        }
        const checkableLine = line.replace(/data-testid="[^"]*"/g, '')
        for (const pattern of BANNED_PATTERNS) {
          if (hasSlopCopyViolation(checkableLine, pattern)) {
            violations.push({
              type: 'source-slop-copy',
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

  const heroTexts = []

  await withBrowser(async (browser) => {
    const { context, page } = await createPage(browser)
    try {
      for (const route of ROUTES) {
        const url = `${BASE_URL}${route}`
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
        await page.waitForTimeout(500)

        const pageData = await page.evaluate(() => {
          const bannedRegexStrings = [
            '\\brevolutioniz(e|es|ed|ing)\\b',
            '\\bunlock(s|ed|ing)?\\b',
            '\\bunleash(es|ed|ing)?\\b',
            '\\belevat(e|es|ed|ing)\\b',
            '\\bempower(s|ed|ing)?\\b',
            '\\bsupercharg(e|es|ed|ing)\\b',
            '\\bseamless(ly)?\\b',
            '\\beffortless(ly)?\\b',
            '\\bcutting-edge\\b',
            '\\bnext-generation\\b',
            '\\bgame-?changer\\b',
            '\\ball-in-one\\b',
            '\\brobust\\b',
            '\\bholistic\\b',
            '\\bleverag(e|es|ed|ing)\\b',
            'in today\'?s fast-paced world',
            'take it to the next level',
            'your ultimate',
            'whether you are',
            'not just .+ but',
            'welcome to',
            '!'
          ]

          const slopHits = []
          const elements = document.querySelectorAll('h1, h2, h3, p, span, button, a, div')
          for (const el of elements) {
            for (const child of el.childNodes) {
              if (child.nodeType === Node.TEXT_NODE) {
                const text = (child.textContent || '').trim()
                if (text.length > 0) {
                  for (const regStr of bannedRegexStrings) {
                    const reg = new RegExp(regStr, 'i')
                    if (reg.test(text)) {
                      slopHits.push({
                        tag: el.tagName.toLowerCase(),
                        pattern: regStr,
                        text: text.slice(0, 100)
                      })
                      break
                    }
                  }
                }
              }
            }
          }

          const h1 = document.querySelector('h1')?.innerText?.trim() || ''
          const sub = document.querySelector('h1 + p, main p')?.innerText?.trim() || ''

          return { slopHits, hero: { h1, sub } }
        })

        heroTexts.push({ route, hero: pageData.hero })

        for (const hit of pageData.slopHits) {
          violations.push({
            type: 'rendered-slop-copy',
            route,
            detail: JSON.stringify(hit)
          })
        }
      }
    } finally {
      await context.close()
    }
  })

  return { violations, heroTexts }
}

if (process.argv[1] && process.argv[1].endsWith('slop-copy.mjs')) {
  runScanner().then(({ violations, heroTexts }) => {
    console.log('--- HERO HEADLINE AUDIT ---')
    heroTexts.forEach((item) => {
      console.log(`Route: ${item.route}`)
      console.log(`  H1: ${item.hero.h1}`)
      console.log(`  Sub: ${item.hero.sub}`)
    })
    console.log('---------------------------')

    if (violations.length > 0) {
      console.error(`FAILED: Found ${violations.length} slop copy violations:`)
      console.error(JSON.stringify(violations, null, 2))
      process.exit(1)
    } else {
      console.log('PASSED: No banned slop words, vague marketing phrases, or exclamation marks found.')
      process.exit(0)
    }
  }).catch((err) => {
    console.error('Scanner error:', err)
    process.exit(1)
  })
}

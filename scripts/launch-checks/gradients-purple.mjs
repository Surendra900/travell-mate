import fs from 'node:fs'
import path from 'node:path'
import { BASE_URL, ROUTES, withBrowser, createPage } from './common.mjs'

const BANNED_TW_CLASSES = /\b(from|via|to|bg|text|border|fill|stroke)-(purple|violet|indigo|fuchsia)(-[a-z0-9]+)?\b/gi
const GRADIENT_TEXT_PATTERN = /bg-clip-text\s+text-transparent/i

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

function parseRgbString(str) {
  const match = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
  if (match) {
    return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]) }
  }
  return null
}

function isPurpleHsl(h, s) {
  return h >= 245 && h <= 330 && s > 25
}

function scanSourceFiles(dir, violations) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        scanSourceFiles(fullPath, violations)
      }
    } else if (/\.(jsx?|tsx?|html|css)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8')
      const lines = content.split('\n')
      lines.forEach((line, index) => {
        const twMatches = line.match(BANNED_TW_CLASSES)
        if (twMatches) {
          violations.push({
            type: 'source-tailwind-class',
            file: fullPath,
            line: index + 1,
            detail: `Found banned utility classes: ${twMatches.join(', ')}`
          })
        }
        if (GRADIENT_TEXT_PATTERN.test(line)) {
          violations.push({
            type: 'source-gradient-text',
            file: fullPath,
            line: index + 1,
            detail: 'Gradient text detected (bg-clip-text with text-transparent)'
          })
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
      const twMatches = line.match(BANNED_TW_CLASSES)
      if (twMatches) {
        violations.push({
          type: 'source-tailwind-class',
          file: indexHtml,
          line: index + 1,
          detail: `Found banned utility classes: ${twMatches.join(', ')}`
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

        const pageViolations = await page.evaluate(() => {
          const results = []
          function parseRgb(str) {
            const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i)
            return m ? { r: Number(m[1]), g: Number(m[2]), b: Number(m[3]) } : null
          }
          function rgbToHslObj(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h = 0, s = 0, l = (max + min) / 2;
            if (max !== min) {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
              }
              h *= 60;
            }
            return { h, s: s * 100, l: l * 100 };
          }

          const allElements = document.querySelectorAll('*')
          for (const el of allElements) {
            const style = window.getComputedStyle(el)
            const bgImg = style.backgroundImage || ''
            if (bgImg && bgImg !== 'none' && bgImg.includes('gradient')) {
              const colorMatches = bgImg.match(/rgba?\([^)]+\)/gi) || []
              for (const col of colorMatches) {
                const rgb = parseRgb(col)
                if (rgb) {
                  const hsl = rgbToHslObj(rgb.r, rgb.g, rgb.b)
                  if (hsl.h >= 245 && hsl.h <= 330 && hsl.s > 25) {
                    results.push({
                      tag: el.tagName.toLowerCase(),
                      class: el.className,
                      gradient: bgImg.slice(0, 100),
                      color: col,
                      hsl
                    })
                  }
                }
              }
            }
            if (style.webkitBackgroundClip === 'text' || style.backgroundClip === 'text') {
              if (bgImg.includes('gradient')) {
                results.push({
                  tag: el.tagName.toLowerCase(),
                  class: el.className,
                  detail: 'Rendered gradient text element detected'
                })
              }
            }
          }
          return results
        })

        for (const v of pageViolations) {
          violations.push({
            type: 'rendered-gradient',
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

if (process.argv[1] && process.argv[1].endsWith('gradients-purple.mjs')) {
  runScanner().then((violations) => {
    if (violations.length > 0) {
      console.error(`FAILED: Found ${violations.length} purple gradient / utility class violations:`)
      console.error(JSON.stringify(violations, null, 2))
      process.exit(1)
    } else {
      console.log('PASSED: No purple gradients or banned utility classes found.')
      process.exit(0)
    }
  }).catch((err) => {
    console.error('Scanner error:', err)
    process.exit(1)
  })
}

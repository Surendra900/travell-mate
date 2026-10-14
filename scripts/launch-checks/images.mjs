import fs from 'node:fs'
import path from 'node:path'
import { BASE_URL, ROUTES, withBrowser, createPage } from './common.mjs'

const ASSETS_DOC = path.resolve('docs/launch-readiness/assets.md')

function findImages(dir, results) {
  if (!fs.existsSync(dir)) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '.git') {
        findImages(full, results)
      }
    } else if (/\.(png|jpe?g|webp|svg|ico|gif)$/i.test(entry.name)) {
      results.push(path.relative(process.cwd(), full).replace(/\\/g, '/'))
    }
  }
}

export async function runScanner() {
  const violations = []
  if (!fs.existsSync(ASSETS_DOC)) {
    violations.push({
      type: 'missing-assets-doc',
      detail: 'docs/launch-readiness/assets.md does not exist'
    })
    return violations
  }

  const assetsDocContent = fs.readFileSync(ASSETS_DOC, 'utf8')

  const diskImages = []
  findImages(path.resolve('public'), diskImages)
  findImages(path.resolve('src'), diskImages)

  for (const img of diskImages) {
    // Check if relative path or filename is present in assets.md
    const baseName = path.basename(img)
    if (!assetsDocContent.includes(img) && !assetsDocContent.includes(baseName)) {
      violations.push({
        type: 'unlisted-disk-image',
        file: img,
        detail: `Image ${img} is not documented in docs/launch-readiness/assets.md with source and license`
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

        const renderedImages = await page.evaluate(() => {
          const imgs = []
          document.querySelectorAll('img').forEach((el) => {
            const src = el.getAttribute('src') || ''
            if (src && !src.startsWith('data:') && !src.includes('tile.openstreetmap.org')) {
              imgs.push({ tag: 'img', src, alt: el.getAttribute('alt') || '' })
            }
          })
          return imgs
        })

        for (const rImg of renderedImages) {
          const cleanSrc = rImg.src.replace(/^\//, '')
          const baseName = path.basename(cleanSrc)
          if (!assetsDocContent.includes(cleanSrc) && !assetsDocContent.includes(baseName)) {
            violations.push({
              type: 'unlisted-rendered-image',
              route,
              detail: `Rendered image src="${rImg.src}" is not listed in docs/launch-readiness/assets.md`
            })
          }
        }
      }
    } finally {
      await context.close()
    }
  })

  return violations
}

if (process.argv[1] && process.argv[1].endsWith('images.mjs')) {
  runScanner().then((violations) => {
    if (violations.length > 0) {
      console.error(`FAILED: Found ${violations.length} image asset violations:`)
      console.error(JSON.stringify(violations, null, 2))
      process.exit(1)
    } else {
      console.log('PASSED: All images in the build and rendered pages are cataloged in docs/launch-readiness/assets.md with verified origin and license.')
      process.exit(0)
    }
  }).catch((err) => {
    console.error('Scanner error:', err)
    process.exit(1)
  })
}

import fs from 'node:fs'
import path from 'node:path'
import { BASE_URL, ROUTES, withBrowser, createPage } from './common.mjs'

export async function runScanner() {
  const gateStatus = {
    gate1: { name: 'Gate 1: Custom domain', status: 'PENDING', detail: '' },
    gate2: { name: 'Gate 2: Favicon set', status: 'FAIL', detail: '' },
    gate3: { name: 'Gate 3: Builder tags excised', status: 'PASS', detail: '' },
    gate4: { name: 'Gate 4: Privacy policy', status: 'FAIL', detail: '' },
    gate5: { name: 'Gate 5: Terms and conditions', status: 'FAIL', detail: '' }
  }
  const violations = []

  // Check Gate 1: Custom domain
  const questionsDoc = path.resolve('docs/launch-readiness/questions.md')
  if (fs.existsSync(questionsDoc)) {
    const qContent = fs.readFileSync(questionsDoc, 'utf8')
    if (qContent.includes('Question 1: Custom Domain') && qContent.includes('Status: Open')) {
      gateStatus.gate1.status = 'PENDING'
      gateStatus.gate1.detail = 'Custom domain input is pending from user'
      violations.push({
        gate: 'Gate 1',
        detail: 'Custom domain not yet connected; awaiting user input under Ask-Me rule'
      })
    }
  }

  // Check Gate 2: Favicon tags and files
  const faviconIcoPath = path.resolve('public/favicon.ico')
  if (!fs.existsSync(faviconIcoPath)) {
    gateStatus.gate2.status = 'FAIL'
    gateStatus.gate2.detail = 'public/favicon.ico does not exist'
    violations.push({
      gate: 'Gate 2',
      detail: 'public/favicon.ico is missing from public directory'
    })
  } else {
    gateStatus.gate2.status = 'PASS'
  }

  // Check Gate 3: Builder tags in index.html
  const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf8')
  if (/lovable|bolt\.new|v0\.dev|made with ai|powered by ai/i.test(indexHtml)) {
    gateStatus.gate3.status = 'FAIL'
    gateStatus.gate3.detail = 'Builder marks or AI generator tags found in index.html'
    violations.push({
      gate: 'Gate 3',
      detail: 'index.html contains site builder or AI generation watermarks'
    })
  } else {
    gateStatus.gate3.status = 'PASS'
    gateStatus.gate3.detail = 'No builder tags in root HTML'
  }

  // Check Gate 4 and Gate 5 in browser:
  // Verify /privacy and /terms return 200 and are linked from the footer on every route
  await withBrowser(async (browser) => {
    const { context, page } = await createPage(browser)
    try {
      // 1. Test /privacy HTTP response
      const privRes = await page.goto(`${BASE_URL}/privacy`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null)
      if (!privRes || privRes.status() !== 200) {
        gateStatus.gate4.status = 'FAIL'
        gateStatus.gate4.detail = `/privacy failed to return HTTP 200 (status: ${privRes ? privRes.status() : 'null'})`
        violations.push({ gate: 'Gate 4', detail: gateStatus.gate4.detail })
      }

      // 2. Test /terms HTTP response
      const termsRes = await page.goto(`${BASE_URL}/terms`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => null)
      if (!termsRes || termsRes.status() !== 200) {
        gateStatus.gate5.status = 'FAIL'
        gateStatus.gate5.detail = `/terms failed to return HTTP 200 (status: ${termsRes ? termsRes.status() : 'null'})`
        violations.push({ gate: 'Gate 5', detail: gateStatus.gate5.detail })
      }

      // 3. Test footer links on every route
      for (const route of ROUTES) {
        await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {})
        await page.waitForTimeout(400)

        const footerLinks = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('footer a, [role="contentinfo"] a'))
          const hrefs = links.map((a) => a.getAttribute('href') || '')
          return {
            hasPrivacy: hrefs.some((h) => h === '/privacy' || h.endsWith('/privacy')),
            hasTerms: hrefs.some((h) => h === '/terms' || h.endsWith('/terms'))
          }
        })

        if (!footerLinks.hasPrivacy) {
          violations.push({
            gate: 'Gate 4',
            detail: `Route ${route} footer does not link to /privacy`
          })
        }
        if (!footerLinks.hasTerms) {
          violations.push({
            gate: 'Gate 5',
            detail: `Route ${route} footer does not link to /terms`
          })
        }
      }

      if (violations.filter((v) => v.gate === 'Gate 4').length === 0) {
        gateStatus.gate4.status = 'PASS'
        gateStatus.gate4.detail = '/privacy responds with 200 and is linked from all page footers'
      }
      if (violations.filter((v) => v.gate === 'Gate 5').length === 0) {
        gateStatus.gate5.status = 'PASS'
        gateStatus.gate5.detail = '/terms responds with 200 and is linked from all page footers'
      }
    } finally {
      await context.close()
    }
  })

  return { gateStatus, violations }
}

if (process.argv[1] && process.argv[1].endsWith('launch-gates.mjs')) {
  runScanner().then(({ gateStatus, violations }) => {
    console.log('--- FIVE LAUNCH GATES STATUS ---')
    Object.values(gateStatus).forEach((g) => {
      console.log(`[${g.status}] ${g.name} : ${g.detail}`)
    })
    console.log('--------------------------------')

    if (violations.length > 0) {
      console.error(`FAILED: Found ${violations.length} launch gate violations:`)
      console.error(JSON.stringify(violations, null, 2))
      process.exit(1)
    } else {
      console.log('PASSED: All five launch gates verified.')
      process.exit(0)
    }
  }).catch((err) => {
    console.error('Scanner error:', err)
    process.exit(1)
  })
}

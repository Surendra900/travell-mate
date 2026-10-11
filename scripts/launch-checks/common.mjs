import { chromium } from 'playwright'

export const BASE_URL = process.env.TARGET_URL || 'http://127.0.0.1:5173'

export const ROUTES = [
  '/',
  '/planner',
  '/safety',
  '/safety/medical',
  '/saved',
  '/analyze',
  '/privacy',
  '/terms',
  '/disclaimer'
]

export async function withBrowser(fn) {
  const browser = await chromium.launch({ headless: true })
  try {
    return await fn(browser)
  } finally {
    await browser.close()
  }
}

export async function createPage(browser, viewport = { width: 1440, height: 900 }) {
  const context = await browser.newContext({ viewport })
  const page = await context.newPage()
  page.setDefaultTimeout(15000)
  return { context, page }
}

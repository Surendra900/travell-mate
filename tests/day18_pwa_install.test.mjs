import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('Day 18: public/manifest.webmanifest adheres to PWA installability specification', () => {
  const raw = fs.readFileSync(path.join(root, 'public/manifest.webmanifest'), 'utf8')
  const manifest = JSON.parse(raw)

  assert.equal(manifest.display, 'standalone', 'PWA display must be standalone')
  assert.equal(manifest.start_url, '/', 'start_url must be root /')
  assert.ok(manifest.name.includes('TravelMate AI'), 'Full name must include TravelMate AI')
  assert.ok(manifest.short_name.includes('TravelMate'), 'Short name must be present')
  assert.equal(manifest.theme_color, '#630ed4', 'Theme color must match brand primary purple')
  assert.equal(manifest.background_color, '#faf8ff', 'Background color must match brand background')

  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 3, 'Must provide at least 3 icons')
  assert.ok(manifest.icons.some((i) => i.sizes === '192x192'), 'Must have 192x192 icon')
  assert.ok(manifest.icons.some((i) => i.sizes === '512x512' && i.purpose === 'any'), 'Must have 512x512 any icon')
  assert.ok(manifest.icons.some((i) => i.purpose === 'maskable'), 'Must provide maskable icon')

  assert.ok(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 3, 'Must declare at least 3 app shortcuts')
  assert.ok(manifest.shortcuts.some((s) => s.url === '/safety'), 'Must provide shortcut to Safety Mode')
  assert.ok(manifest.shortcuts.some((s) => s.url === '/saved'), 'Must provide shortcut to Saved Passes')
})

test('Day 18: public/sw.js implements offline app shell caching and zero-API leak safety', () => {
  const sw = fs.readFileSync(path.join(root, 'public/sw.js'), 'utf8')
  assert.match(sw, /CACHE_NAME/, 'Must define CACHE_NAME')
  assert.match(sw, /APP_SHELL/, 'Must define APP_SHELL list')
  assert.match(sw, /self\.skipWaiting\(\)/, 'Must call skipWaiting during install')
  assert.match(sw, /self\.clients\.claim\(\)/, 'Must claim clients on activate')
  assert.match(sw, /url\.pathname\.startsWith\('\/api\/'\)/, 'Must bypass API routes to prevent token caching')
  assert.match(sw, /cache:\s*['"]no-store['"]/, 'API requests must enforce no-store')
  assert.match(sw, /caches\.match\('\/index\.html'\)/, 'Must fallback to /index.html for navigation when offline')
})

test('Day 18: PwaInstallBanner.jsx captures install prompts and declares accessible controls', () => {
  const banner = fs.readFileSync(path.join(root, 'src/components/PwaInstallBanner.jsx'), 'utf8')
  assert.match(banner, /beforeinstallprompt/, 'Must listen to beforeinstallprompt event')
  assert.match(banner, /appinstalled/, 'Must listen to appinstalled event')
  assert.match(banner, /data-testid="pwa-install-banner"/, 'Must provide pwa-install-banner container testid')
  assert.match(banner, /data-testid="pwa-install-button"/, 'Must provide pwa-install-button testid')
  assert.match(banner, /data-testid="pwa-dismiss-button"/, 'Must provide pwa-dismiss-button testid')
  assert.match(banner, /100% Offline Ready/, 'Must feature 100% Offline Ready badge')
})

test('Day 18: App.jsx mounts PwaInstallBanner globally', () => {
  const app = fs.readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  assert.match(app, /import PwaInstallBanner from '\.\/components\/PwaInstallBanner'/, 'Must import PwaInstallBanner')
  assert.match(app, /<PwaInstallBanner \/>/, 'Must render PwaInstallBanner in app shell')
})

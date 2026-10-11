import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

const SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="108" fill="#0f172a"/>
  <!-- Circular Transit Guideline -->
  <circle cx="256" cy="256" r="184" fill="none" stroke="#1e293b" stroke-width="14" stroke-dasharray="16 12"/>
  <circle cx="256" cy="256" r="148" fill="none" stroke="#0284c7" stroke-width="8" opacity="0.6"/>
  <!-- Crossing Railway Junction / Compass Needles -->
  <path d="M256 64 L294 220 L448 256 L294 292 L256 448 L218 292 L64 256 L218 220 Z" fill="#0284c7"/>
  <!-- North / Main Direction Highlight -->
  <path d="M256 64 L294 220 L256 256 Z" fill="#38bdf8"/>
  <path d="M256 64 L218 220 L256 256 Z" fill="#0ea5e9"/>
  <!-- East / West Wings -->
  <path d="M448 256 L294 220 L256 256 Z" fill="#38bdf8"/>
  <path d="M64 256 L218 292 L256 256 Z" fill="#0284c7"/>
  <!-- Central Transit Hub Junction Node -->
  <circle cx="256" cy="256" r="44" fill="#0f172a" stroke="#38bdf8" stroke-width="8"/>
  <circle cx="256" cy="256" r="22" fill="#38bdf8"/>
  <!-- Small Junction Marker -->
  <circle cx="256" cy="256" r="10" fill="#f8fafc"/>
</svg>`

function buildIcoBuffer(images) {
  // images: array of { width, height, buffer }
  const count = images.length
  const headerSize = 6
  const dirEntrySize = 16
  const dirSize = count * dirEntrySize
  let currentOffset = headerSize + dirSize

  const header = Buffer.alloc(headerSize)
  header.writeUInt16LE(0, 0) // Reserved
  header.writeUInt16LE(1, 2) // Type 1 = ICO
  header.writeUInt16LE(count, 4) // Count

  const dirEntries = []
  const dataBuffers = []

  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize)
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0)
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1)
    entry.writeUInt8(0, 2) // Color palette
    entry.writeUInt8(0, 3) // Reserved
    entry.writeUInt16LE(1, 4) // Color planes
    entry.writeUInt16LE(32, 6) // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8) // Size
    entry.writeUInt32LE(currentOffset, 12) // Offset

    dirEntries.push(entry)
    dataBuffers.push(img.buffer)
    currentOffset += img.buffer.length
  }

  return Buffer.concat([header, ...dirEntries, ...dataBuffers])
}

async function main() {
  const publicDir = path.resolve('public')
  const iconsDir = path.join(publicDir, 'icons')
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true })

  // 1. Write favicon.svg
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), SVG_CONTENT, 'utf8')
  console.log('Saved public/favicon.svg')

  // 2. Launch browser to render PNGs
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setContent(`<!DOCTYPE html><html><body style="margin:0;padding:0;overflow:hidden;background:transparent;">${SVG_CONTENT}</body></html>`)

  const sizes = [16, 32, 48, 180, 192, 512]
  const pngBuffers = {}

  for (const size of sizes) {
    await page.setViewportSize({ width: size, height: size })
    const svgEl = await page.$('svg')
    await svgEl.evaluate((el, s) => {
      el.setAttribute('width', String(s))
      el.setAttribute('height', String(s))
    }, size)
    const buf = await svgEl.screenshot({ omitBackground: true, type: 'png' })
    pngBuffers[size] = buf
  }

  await browser.close()

  // 3. Save individual PNGs
  fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), pngBuffers[180])
  fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), pngBuffers[192])
  fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), pngBuffers[512])
  fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), pngBuffers[512])
  console.log('Saved public/icons PNGs (180, 192, 512, maskable-512)')

  // 4. Build and save favicon.ico
  const icoData = buildIcoBuffer([
    { width: 16, height: 16, buffer: pngBuffers[16] },
    { width: 32, height: 32, buffer: pngBuffers[32] },
    { width: 48, height: 48, buffer: pngBuffers[48] }
  ])
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoData)
  console.log(`Saved public/favicon.ico (${icoData.length} bytes)`)
}

main().catch(err => {
  console.error('Favicon generation error:', err)
  process.exit(1)
})

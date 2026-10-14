import fs from 'node:fs'
import path from 'node:path'
import { DEVICE_MATRIX, ROUTE_STATES } from '../tests/mobile/matrix.js'

const outputPath = 'docs/mobile/screenshots/index.html'

let cardsHtml = ''

for (const dev of DEVICE_MATRIX) {
  cardsHtml += `
    <section class="device-group" id="dev-${dev.id}">
      <div class="device-header">
        <h2>${dev.name} <span class="badge">${dev.width}x${dev.height}px</span></h2>
      </div>
      <div class="grid">
  `

  for (const route of ROUTE_STATES) {
    const beforeRel = `before/${dev.id}/${route.id}.png`
    const afterRel = `after/${dev.id}/${route.id}.png`
    const beforeExists = fs.existsSync(path.join('docs/mobile/screenshots', beforeRel))
    const afterExists = fs.existsSync(path.join('docs/mobile/screenshots', afterRel))

    cardsHtml += `
      <div class="comparison-card" data-device="${dev.id}" data-route="${route.id}">
        <div class="card-header">
          <h3>${route.name}</h3>
          <code>${route.path}</code>
        </div>
        <div class="comparison-panes">
          <div class="pane before-pane">
            <div class="pane-label label-before">BEFORE (BASELINE)</div>
            ${beforeExists ? `<a href="${beforeRel}" target="_blank"><img src="${beforeRel}" alt="Before: ${route.name} on ${dev.name}" loading="lazy" /></a>` : '<div class="missing">Baseline unavailable</div>'}
          </div>
          <div class="pane after-pane">
            <div class="pane-label label-after">AFTER (FIXED)</div>
            ${afterExists ? `<a href="${afterRel}" target="_blank"><img src="${afterRel}" alt="After: ${route.name} on ${dev.name}" loading="lazy" /></a>` : '<div class="missing">Pending after capture</div>'}
          </div>
        </div>
      </div>
    `
  }

  cardsHtml += `
      </div>
    </section>
  `
}

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>TravelMate Mobile UI Matrix: Before vs After Gallery</title>
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --border: #334155;
      --text: #f8fafc;
      --muted: #94a3b8;
      --primary: #0284c7;
      --success: #10b981;
      --danger: #ef4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.5;
      padding: 24px;
    }
    header {
      max-width: 1400px;
      margin: 0 auto 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--border);
    }
    h1 { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 8px; }
    p.lead { color: var(--muted); font-size: 15px; max-width: 800px; }
    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 20px;
    }
    .filter-btn {
      background: var(--card-bg);
      color: var(--text);
      border: 1px solid var(--border);
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: background 0.2s;
    }
    .filter-btn:hover { background: #27354f; }
    .device-group {
      max-width: 1400px;
      margin: 0 auto 48px;
    }
    .device-header {
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .device-header h2 { font-size: 22px; font-weight: 700; color: #38bdf8; }
    .badge {
      background: #0369a1;
      color: #fff;
      font-size: 12px;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 600;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(440px, 1fr));
      gap: 24px;
    }
    .comparison-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .card-header {
      padding: 12px 16px;
      background: #182234;
      border-bottom: 1px solid var(--border);
    }
    .card-header h3 { font-size: 15px; font-weight: 700; color: #fff; }
    .card-header code { font-size: 12px; color: #94a3b8; font-family: monospace; display: block; margin-top: 2px; }
    .comparison-panes {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding: 12px;
      background: #0b1120;
    }
    .pane {
      display: flex;
      flex-direction: column;
      position: relative;
      background: #000;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #1e293b;
    }
    .pane-label {
      padding: 4px 8px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-align: center;
    }
    .label-before { background: #7f1d1d; color: #fecaca; }
    .label-after { background: #064e3b; color: #a7f3d0; }
    .pane img {
      width: 100%;
      height: 360px;
      object-fit: cover;
      object-position: top;
      display: block;
      transition: opacity 0.2s;
    }
    .pane img:hover { opacity: 0.9; }
    .missing {
      height: 360px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <header>
    <h1>TravelMate Mobile UI Matrix: Before vs After Evidence</h1>
    <p class="lead">Side-by-side visual regression review across all 13 viewports (320px to 1440px) and 16 route states. Tap any image to view the full unscaled screenshot.</p>
    <div class="filters">
      <a href="#dev-mobile-320" class="filter-btn">320px (WCAG Reflow)</a>
      <a href="#dev-mobile-360" class="filter-btn">360px (Android)</a>
      <a href="#dev-mobile-375" class="filter-btn">375px (iPhone SE)</a>
      <a href="#dev-mobile-390" class="filter-btn">390px (iPhone 13/14)</a>
      <a href="#dev-mobile-393" class="filter-btn">393px (Pixel)</a>
      <a href="#dev-mobile-412" class="filter-btn">412px (Galaxy)</a>
      <a href="#dev-mobile-430" class="filter-btn">430px (iPhone Max)</a>
      <a href="#dev-landscape-740" class="filter-btn">740x360 Landscape</a>
      <a href="#dev-landscape-844" class="filter-btn">844x390 Landscape</a>
      <a href="#dev-tablet-768" class="filter-btn">768px iPad</a>
      <a href="#dev-tablet-1024" class="filter-btn">1024px iPad</a>
      <a href="#dev-desktop-1280" class="filter-btn">1280px Desktop</a>
      <a href="#dev-desktop-1440" class="filter-btn">1440px Desktop</a>
    </div>
  </header>

  <main>
    ${cardsHtml}
  </main>
</body>
</html>
`

fs.writeFileSync(outputPath, html, 'utf8')
console.log(`Gallery generated successfully at: ${outputPath}`)

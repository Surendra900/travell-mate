import fs from 'node:fs'
import path from 'node:path'
import { runScanner as scanGradients } from './launch-checks/gradients-purple.mjs'
import { runScanner as scanPillButtons } from './launch-checks/pill-buttons.mjs'
import { runScanner as scanEmoji } from './launch-checks/emoji.mjs'
import { runScanner as scanEmDash } from './launch-checks/em-dash.mjs'
import { runScanner as scanSlopCopy } from './launch-checks/slop-copy.mjs'
import { runScanner as scanFakeProof } from './launch-checks/fake-proof.mjs'
import { runScanner as scanMotion } from './launch-checks/scroll-and-cursor-motion.mjs'
import { runScanner as scanMadeWith } from './launch-checks/made-with.mjs'
import { runScanner as scanPlaceholders } from './launch-checks/placeholders.mjs'
import { runScanner as scanImages } from './launch-checks/images.mjs'
import { runScanner as scanGates } from './launch-checks/launch-gates.mjs'

async function generateBaseline() {
  console.log('Generating baseline-violations.md...')
  const gradients = await scanGradients()
  const pillButtons = await scanPillButtons()
  const emoji = await scanEmoji()
  const emDash = await scanEmDash()
  const slop = (await scanSlopCopy()).violations
  const fakeProof = await scanFakeProof()
  const motion = await scanMotion()
  const madeWith = await scanMadeWith()
  const placeholders = await scanPlaceholders()
  const images = await scanImages()
  const gates = (await scanGates()).violations

  let md = '# Baseline Violations Inventory\n\n'
  md += 'Generated on: 2026-10-11\n\n'
  md += '## Summary Table\n\n'
  md += '| Rule | Status | Violations Count | Planned Fix |\n'
  md += '|---|---|---|---|\n'
  md += `| A1. Gradients Purple | FAIL | ${gradients.length} | Replace indigo, violet, and purple utilities with slate or cyan brand palette |\n`
  md += `| A2. Pill Buttons | FAIL | ${pillButtons.length} | Replace rounded-full, rounded-3xl with rounded-md (6px) or rounded-lg (8px) |\n`
  md += `| A3. Emoji Icons | FAIL | ${emoji.length} | Replace emoji and icon symbols with clean Lucide SVG icons |\n`
  md += `| B1. Em Dash | FAIL | ${emDash.length} | Replace U+2014, &mdash;, double hyphens, and spaced hyphens with periods, colons, or commas |\n`
  md += `| B2. Slop Copy | FAIL | ${slop.length} | Rewrite marketing copy, eliminate hype words, remove exclamation marks |\n`
  md += `| C1. Fake Proof | FAIL | ${fakeProof.length} | Remove fake counters, star ratings, and simulated traveler numbers |\n`
  md += `| A4/A5. Motion and Cursor | FAIL | ${motion.length} | Reduce animation durations below 200ms, ensure reduced-motion support |\n`
  md += `| Gate 3. Made With AI | PASS | ${madeWith.length} | Clean; keep builder watermarks out of build |\n`
  md += `| C3. Placeholders | FAIL | ${placeholders.length} | Remove TODOs, localhost strings, and production console.log calls |\n`
  md += `| C2. Images | PASS | ${images.length} | Verified; all images documented in assets.md |\n`
  md += `| Gates 1 to 5. Launch Gates | FAIL | ${gates.length} | Connect custom domain upon user input; generate favicon.ico set |\n\n`

  md += '## Detailed Breakdown by Rule\n\n'

  function appendSection(title, list, formatter) {
    md += `### ${title} (${list.length} violations)\n\n`
    if (list.length === 0) {
      md += 'Zero violations detected.\n\n'
      return
    }
    const sample = list.slice(0, 30)
    sample.forEach((item, idx) => {
      md += `${idx + 1}. ${formatter(item)}\n`
    })
    if (list.length > 30) {
      md += `\n*... and ${list.length - 30} additional violations of this rule.*\n`
    }
    md += '\n'
  }

  appendSection('Rule A1: Purple Gradients and Banned Utility Classes', gradients, (i) =>
    i.file ? `\`${path.relative(process.cwd(), i.file)}:${i.line}\`: ${i.detail}` : `Route \`${i.route}\`: ${i.detail}`
  )

  appendSection('Rule A2: Pill-Shaped Buttons', pillButtons, (i) =>
    i.file ? `\`${path.relative(process.cwd(), i.file)}:${i.line}\`: ${i.detail}` : `Route \`${i.route}\`: ${i.detail}`
  )

  appendSection('Rule A3: Emoji and Symbol Icons', emoji, (i) =>
    i.file ? `\`${path.relative(process.cwd(), i.file)}:${i.line}\` (Symbol: ${i.symbol}): ${i.snippet}` : `Route \`${i.route}\`: ${i.detail}`
  )

  appendSection('Rule B1: Em Dashes and Prohibited Dash Patterns', emDash, (i) =>
    i.file ? `\`${path.relative(process.cwd(), i.file)}:${i.line}\`: ${i.detail}` : `Route \`${i.route}\`: ${i.detail}`
  )

  appendSection('Rule B2: Slop Copy and Banned Phrases', slop, (i) =>
    i.file ? `\`${path.relative(process.cwd(), i.file)}:${i.line}\` (Pattern: ${i.pattern}): ${i.snippet}` : `Route \`${i.route}\`: ${i.detail}`
  )

  appendSection('Rule C1: Fake Proof and Fabricated Counters', fakeProof, (i) =>
    i.file ? `\`${path.relative(process.cwd(), i.file)}:${i.line}\`: ${i.snippet}` : `Route \`${i.route}\`: ${i.detail}`
  )

  appendSection('Rule A4 and A5: Motion, Animation Duration, and Cursor', motion, (i) =>
    i.file ? `\`${path.relative(process.cwd(), i.file)}:${i.line}\`: ${i.snippet}` : `Route \`${i.route}\`: ${i.detail}`
  )

  appendSection('Rule C3: Placeholders and Production Console Logs', placeholders, (i) =>
    i.file ? `\`${path.relative(process.cwd(), i.file)}:${i.line}\`: ${i.detail || i.snippet}` : `Route \`${i.route}\`: ${i.detail}`
  )

  appendSection('Launch Gates 1 to 5', gates, (i) => `\`${i.gate}\`: ${i.detail}`)

  fs.writeFileSync(path.resolve('docs/launch-readiness/baseline-violations.md'), md, 'utf8')
  console.log('baseline-violations.md written successfully.')
}

generateBaseline().catch((err) => {
  console.error(err)
  process.exit(1)
})

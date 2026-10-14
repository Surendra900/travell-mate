import { runScanner as scanGradients } from './gradients-purple.mjs'
import { runScanner as scanPillButtons } from './pill-buttons.mjs'
import { runScanner as scanEmoji } from './emoji.mjs'
import { runScanner as scanEmDash } from './em-dash.mjs'
import { runScanner as scanSlopCopy } from './slop-copy.mjs'
import { runScanner as scanFakeProof } from './fake-proof.mjs'
import { runScanner as scanMotion } from './scroll-and-cursor-motion.mjs'
import { runScanner as scanMadeWith } from './made-with.mjs'
import { runScanner as scanPlaceholders } from './placeholders.mjs'
import { runScanner as scanImages } from './images.mjs'
import { runScanner as scanGates } from './launch-gates.mjs'

async function run() {
  console.log('Starting full launch readiness scanner suite...\n')

  const results = []

  const suites = [
    { id: 'A1. gradients-purple', fn: async () => (await scanGradients()) },
    { id: 'A2. pill-buttons', fn: async () => (await scanPillButtons()) },
    { id: 'A3. emoji', fn: async () => (await scanEmoji()) },
    { id: 'B1. em-dash', fn: async () => (await scanEmDash()) },
    { id: 'B2. slop-copy', fn: async () => (await scanSlopCopy()).violations },
    { id: 'C1. fake-proof', fn: async () => (await scanFakeProof()) },
    { id: 'A4/A5. scroll-cursor-motion', fn: async () => (await scanMotion()) },
    { id: 'Gate 3. made-with', fn: async () => (await scanMadeWith()) },
    { id: 'C3. placeholders', fn: async () => (await scanPlaceholders()) },
    { id: 'C2. images', fn: async () => (await scanImages()) },
    { id: 'Gates 1 to 5. launch-gates', fn: async () => (await scanGates()).violations }
  ]

  let totalViolations = 0

  for (const s of suites) {
    process.stdout.write(`Scanning ${s.id}... `)
    try {
      const violations = await s.fn()
      const count = violations.length
      totalViolations += count
      const status = count === 0 ? 'PASS' : 'FAIL'
      results.push({ rule: s.id, status, violations: count, list: violations })
      console.log(`[${status}] (${count} violations)`)
    } catch (err) {
      console.log(`[ERROR: ${err.message}]`)
      results.push({ rule: s.id, status: 'ERROR', violations: 1, list: [{ error: err.message }] })
      totalViolations += 1
    }
  }

  console.log('\n======================================================')
  console.log('           LAUNCH READINESS AUDIT SUMMARY             ')
  console.log('======================================================')
  console.table(
    results.map((r) => ({
      'Scanner Rule': r.rule,
      'Status': r.status,
      'Violations': r.violations
    }))
  )
  console.log(`Total Violations Found: ${totalViolations}`)
  console.log('======================================================\n')

  return { results, totalViolations }
}

run().then(({ totalViolations, results }) => {
  if (totalViolations > 0) {
    console.error('Launch readiness suite detected unresolved violations.')
    process.exit(1)
  } else {
    console.log('Launch readiness suite passed completely with zero violations.')
    process.exit(0)
  }
}).catch((err) => {
  console.error('Master runner failed:', err)
  process.exit(1)
})

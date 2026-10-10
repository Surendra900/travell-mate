import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  todayInIndia,
  resolveTravelDate,
  isOvernightTime,
  findConnectingRoutes
} from '../server/services/routeEngine.js'
import { escapeHtml } from '../src/utils/sanitize.js'
import { useDialogFocus } from '../src/hooks/useDialogFocus.js'

test('RouteEngine: todayInIndia and resolveTravelDate work without stale fallback', () => {
  const today = todayInIndia()
  assert.match(today, /^\d{4}-\d{2}-\d{2}$/, 'todayInIndia returns YYYY-MM-DD')

  const resolvedGiven = resolveTravelDate('2027-01-01')
  assert.equal(resolvedGiven, '2027-01-01')

  const resolvedEmpty = resolveTravelDate('')
  assert.equal(resolvedEmpty, today)

  const resolvedNull = resolveTravelDate(null)
  assert.equal(resolvedNull, today)
})

test('RouteEngine: Overnight transfer suppression correctly enforces allowOvernight flag', () => {
  assert.equal(isOvernightTime('02:30'), true)
  assert.equal(isOvernightTime('04:30'), true)
  assert.equal(isOvernightTime('05:00'), false)
  assert.equal(isOvernightTime('10:00'), false)
  assert.equal(isOvernightTime('23:00'), true)
  assert.equal(isOvernightTime('23:45'), true)

  // With allowOvernight = false, any connecting routes with overnight layover/arrival/departure are excluded
  const routesNoOvernight = findConnectingRoutes('NDLS', 'PNBE', {
    allowOvernight: false
  })
  for (const route of routesNoOvernight) {
    const arrOvernight = isOvernightTime(route.leg1?.arrTime)
    const depOvernight = isOvernightTime(route.leg2?.depTime)
    assert.equal(arrOvernight || depOvernight, false, 'No overnight legs when allowOvernight is false')
  }
})

test('RouteMap: escapeHtml escapes dangerous characters preventing DOM XSS', () => {
  assert.equal(escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
  assert.equal(escapeHtml("Tom & Jerry's"), 'Tom &amp; Jerry&#39;s')
  assert.equal(escapeHtml(null), '')
  assert.equal(escapeHtml(undefined), '')
})

test('Accessibility: useDialogFocus hook exists and exports useDialogFocus', () => {
  assert.equal(typeof useDialogFocus, 'function')
})

test('Accessibility: All 5 modals implement useDialogFocus, role="dialog", aria-modal="true", and aria-labelledby', () => {
  const modalFiles = [
    'src/components/DemoTourModal.jsx',
    'src/components/PnrPredictorModal.jsx',
    'src/components/DpdpPrivacyModal.jsx',
    'src/components/FeedbackModal.jsx',
    'src/components/OfflineTravelerPassModal.jsx'
  ]

  for (const file of modalFiles) {
    const fullPath = path.resolve(process.cwd(), file)
    const content = fs.readFileSync(fullPath, 'utf8')
    assert.ok(content.includes('useDialogFocus'), `${file} must import and use useDialogFocus`)
    assert.ok(content.includes('role="dialog"'), `${file} must have role="dialog"`)
    assert.ok(content.includes('aria-modal="true"'), `${file} must have aria-modal="true"`)
    assert.ok(content.includes('aria-labelledby='), `${file} must have aria-labelledby`)
  }
})

test('StationAutocomplete: Accessibility combobox attributes are present', () => {
  const file = path.resolve(process.cwd(), 'src/components/StationAutocomplete.jsx')
  const content = fs.readFileSync(file, 'utf8')
  assert.ok(content.includes('role="combobox"'), 'must have role="combobox"')
  assert.ok(content.includes('aria-haspopup="listbox"'), 'must have aria-haspopup="listbox"')
  assert.ok(content.includes('aria-activedescendant='), 'must have aria-activedescendant')
  assert.ok(content.includes('role="listbox"'), 'must have role="listbox"')
})

test('Performance: RouteMap is lazy loaded in NormalPlanner and LiveResultsPanel', () => {
  const plannerFile = fs.readFileSync(path.resolve(process.cwd(), 'src/planner/NormalPlanner.jsx'), 'utf8')
  assert.ok(plannerFile.includes("lazy(() => import('../components/RouteMap'))"), 'NormalPlanner must lazy-load RouteMap')
  assert.ok(plannerFile.includes('<Suspense'), 'NormalPlanner must wrap RouteMap in Suspense')

  const liveResultsFile = fs.readFileSync(path.resolve(process.cwd(), 'src/components/LiveResultsPanel.jsx'), 'utf8')
  assert.ok(liveResultsFile.includes("lazy(() => import('./RouteMap'))"), 'LiveResultsPanel must lazy-load RouteMap')
  assert.ok(liveResultsFile.includes('<Suspense'), 'LiveResultsPanel must wrap RouteMap in Suspense')
})

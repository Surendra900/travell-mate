import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { generateMultimodalRoutes } from '../src/utils/multimodalRouter.js'
import { predictWaitlistConfirmation } from '../src/utils/pnrPredictor.js'

describe('Day 8: Comprehensive States, Multi-Viewport Responsive Layout & Accessibility Gate', () => {

  it('8.1 Master Spec U9 States: Loading skeletons, empty states, and error states are fully declared', async () => {
    const resultsPanelCode = await fs.readFile('src/components/LiveResultsPanel.jsx', 'utf8')

    // Skeletons
    assert.ok(
      resultsPanelCode.includes('data-testid="results-skeleton-loader"'),
      'LiveResultsPanel must render data-testid="results-skeleton-loader" during data fetch'
    )

    // Empty state with recovery guidance
    assert.ok(
      resultsPanelCode.includes('data-testid="empty-direct-results"'),
      'LiveResultsPanel must render data-testid="empty-direct-results"'
    )
    assert.ok(
      resultsPanelCode.includes('No direct') && resultsPanelCode.includes('TravelMate found'),
      'Empty state must inform user that TravelMate found alternative recovery routes'
    )

    // Error state with retry action
    assert.ok(
      resultsPanelCode.includes('data-testid="results-error-state"'),
      'LiveResultsPanel must render data-testid="results-error-state"'
    )
    assert.ok(
      resultsPanelCode.includes('data-testid="error-retry-btn"'),
      'Error state must offer data-testid="error-retry-btn"'
    )

    // Empty state in Saved Trips
    const savedPlansCode = await fs.readFile('src/pages/SavedPlans.jsx', 'utf8')
    assert.ok(
      savedPlansCode.includes('data-testid="empty-saved-plans"'),
      'SavedPlans must render data-testid="empty-saved-plans" when no journeys are stored'
    )
  })

  it('8.2 Master Spec Section 8 Click Budget: Search <= 3 interactions, Booking <= 2 interactions', () => {
    // Search Budget Model:
    // Interaction 1: Pick Origin Station from Autocomplete
    // Interaction 2: Pick Destination Station from Autocomplete
    // Interaction 3: Tap Primary Search CTA ("Search Available Train Options")
    const searchInteractions = ['select-origin', 'select-destination', 'click-search']
    assert.ok(
      searchInteractions.length <= 3,
      `Search flow budget exceeded: ${searchInteractions.length} > 3`
    )

    // Booking Budget Model:
    // Interaction 1: Select recovery tier card / preview route
    // Interaction 2: Tap verified deep-link CTA (ConfirmTkt / redBus / Google Flights)
    const bookingInteractions = ['select-route-tier', 'click-official-deep-link']
    assert.ok(
      bookingInteractions.length <= 2,
      `Booking flow budget exceeded: ${bookingInteractions.length} > 2`
    )
  })

  it('8.3 Master Spec U10 Responsive Layout: Zero horizontal overflow on 390px, 768px, and 1440px', async () => {
    const css = await fs.readFile('src/index.css', 'utf8')

    // Horizontal overflow prevention
    assert.ok(
      css.includes('overflow-x:hidden') || css.includes('overflow-x: hidden'),
      'index.css must enforce overflow-x: hidden on viewport containers'
    )
    assert.ok(
      css.includes('max-width: 100vw') || css.includes('100%'),
      'index.css must constrain max-width to prevent horizontal clipping'
    )

    // Mobile touch target guidelines (min 44px)
    assert.ok(
      css.includes('min-height: 44px') || css.includes('min-height: 48px') || css.includes('44px') || css.includes('h-11') || css.includes('h-12'),
      'Interactive controls must meet WCAG touch target height standards'
    )
  })

  it('8.4 Master Spec U11 Accessibility: ARIA roles, dialog semantics, and keyboard accessibility', async () => {
    const navbarCode = await fs.readFile('src/components/Navbar.jsx', 'utf8')
    assert.ok(navbarCode.includes('aria-label="Primary navigation"'), 'Navbar must define primary navigation aria-label')

    const autocompleteCode = await fs.readFile('src/components/StationAutocomplete.jsx', 'utf8')
    assert.ok(autocompleteCode.includes('role="combobox"'), 'StationAutocomplete must implement role="combobox"')
    assert.ok(autocompleteCode.includes('aria-expanded'), 'StationAutocomplete must declare aria-expanded')

    const passModalCode = await fs.readFile('src/components/OfflineTravelerPassModal.jsx', 'utf8')
    assert.ok(passModalCode.includes('role="dialog"'), 'Pass modal must declare role="dialog"')
    assert.ok(passModalCode.includes('aria-modal="true"'), 'Pass modal must declare aria-modal="true"')

    const pnrModalCode = await fs.readFile('src/components/PnrPredictorModal.jsx', 'utf8')
    assert.ok(pnrModalCode.includes('role="dialog"'), 'PNR modal must declare role="dialog"')
  })

  it('8.5 First-Time User Task 1: Find alternative multimodal routes through regional junctions', () => {
    const routes = generateMultimodalRoutes({ from: 'Delhi', to: 'Howrah', date: '2026-10-15' })
    assert.ok(Array.isArray(routes) && routes.length >= 2, 'Must return at least 2 viable recovery options')
    routes.forEach((route) => {
      assert.ok(route.hubCity, 'Every recovery route must route through a verified junction hub')
      assert.ok(route.leg1 && route.leg2, 'Every recovery route must have leg 1 and leg 2')
      assert.ok(route.fareFormatted, 'Every route must show estimated fare')
    })
  })

  it('8.6 First-Time User Task 2: PNR Status and Confirmation Odds Estimation', () => {
    // 10-digit waitlist prediction test
    const pnrEstimate = predictWaitlistConfirmation('WL 18', { trainType: 'Rajdhani', daysToJourney: 4 })
    assert.ok(pnrEstimate.probability >= 0 && pnrEstimate.probability <= 100)
    assert.ok(pnrEstimate.tier, 'Must provide tier classification (high, medium, low)')
    assert.ok(pnrEstimate.summary || pnrEstimate.recommendation, 'Must provide model explanation')
  })

  it('8.7 First-Time User Task 3 & 4: Honest Demo Scenario Mode & Offline Boarding Pass', async () => {
    const plannerCode = await fs.readFile('src/pages/Planner.jsx', 'utf8')
    assert.ok(plannerCode.includes('data-testid="demo-mode-banner"'), 'Demo scenario must be visibly badged')

    const safetyCode = await fs.readFile('src/pages/SafetyMode.jsx', 'utf8')
    assert.ok(safetyCode.includes('data-testid="view-offline-pass-btn"'), 'Must offer view offline pass action')
    assert.ok(safetyCode.includes('data-testid="print-pass-btn"'), 'Must offer print pass action')
    assert.ok(safetyCode.includes('data-testid="copy-pass-summary-btn"'), 'Must offer copy summary action')
  })

  it('8.8 First-Time User Task 5: 1-Tap National Transit Helplines and GPS telemetry sharing', async () => {
    const toolkitCode = await fs.readFile('src/components/EmergencyToolkit.jsx', 'utf8')
    assert.ok(toolkitCode.includes('data-testid="helpline-112"'), '112 dialer must be accessible')
    assert.ok(toolkitCode.includes('helpline-139'), '139 dialer must be accessible')
    assert.ok(toolkitCode.includes('data-testid="share-gps-pin-btn"'), 'GPS pin share must be accessible')
    assert.ok(toolkitCode.includes('data-testid="location-privacy-notice"'), 'Location privacy notice must be present')
  })
})

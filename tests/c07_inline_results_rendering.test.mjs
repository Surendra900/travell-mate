import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

describe('C-07 & C-11: Inline Results Rendering & Single Container Gate', () => {

  it('C-07: LiveResultsPanel renders inline and does not trap body scroll', async () => {
    const code = await fs.readFile('src/components/LiveResultsPanel.jsx', 'utf8')
    assert.ok(
      !code.includes("document.body.style.overflow = 'hidden'"),
      'LiveResultsPanel must not lock body overflow with hidden'
    )
    assert.ok(
      !code.includes('fixed inset-0 z-50'),
      'LiveResultsPanel must not be rendered as a fixed full-screen modal backdrop'
    )
  })

  it('C-11: WaitlistBypassContrast is not duplicated in simultaneous views', async () => {
    const plannerCode = await fs.readFile('src/planner/NormalPlanner.jsx', 'utf8')
    const panelCode = await fs.readFile('src/components/LiveResultsPanel.jsx', 'utf8')
    assert.ok(
      panelCode.includes('<WaitlistBypassContrast'),
      'LiveResultsPanel must house the primary WaitlistBypassContrast in results view'
    )
    // In NormalPlanner, ensure WaitlistBypassContrast is guarded by !resultsOpen
    assert.ok(
      plannerCode.includes('!resultsOpen &&'),
      'NormalPlanner must guard WaitlistBypassContrast with !resultsOpen to prevent duplicate DOM mounts'
    )
  })

})

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

describe('C-04: Data Honesty & Forbidden Promotional Claims Gate', () => {

  it('multimodalRouter.js does not claim static itineraries are confirmed', async () => {
    const code = await fs.readFile('src/utils/multimodalRouter.js', 'utf8')
    assert.ok(!code.includes('confirmed train quotas'), 'Must not claim confirmed train quotas')
    assert.ok(!code.includes('Confirmed AC sleeper'), 'Must not claim Confirmed AC sleeper')
    assert.ok(!code.includes('Confirmed Journey'), 'WhatsApp share text must not claim Confirmed Journey')
  })

  it('MultimodalTimelineCard.jsx does not claim confirmed split availability', async () => {
    const code = await fs.readFile('src/components/MultimodalTimelineCard.jsx', 'utf8')
    assert.ok(!code.includes('confirmed split-ticket availability'), 'Must not claim confirmed split-ticket availability')
    assert.ok(!code.includes('Share confirmed itinerary'), 'Must not claim share confirmed itinerary')
  })

  it('StationHopperCard.jsx does not claim confirmed bypass or confirmed berths', async () => {
    const code = await fs.readFile('src/components/StationHopperCard.jsx', 'utf8')
    assert.ok(!code.includes('Confirmed Seat Bypass'), 'Must not claim Confirmed Seat Bypass')
    assert.ok(!code.includes('Confirmed Bypass Option'), 'Must not claim Confirmed Bypass Option')
    assert.ok(!code.includes('confirmed berths'), 'Must not claim confirmed berths')
    assert.ok(!code.includes('Confirmation Rate'), 'Must not label estimation as absolute Confirmation')
  })

  it('WaitlistBypassContrast.jsx does not claim confirmed quotas', async () => {
    const code = await fs.readFile('src/components/WaitlistBypassContrast.jsx', 'utf8')
    assert.ok(!code.includes('confirmed regional quotas'), 'Must not claim confirmed regional quotas')
  })

  it('Home.jsx does not claim guaranteed transfer buffers', async () => {
    const code = await fs.readFile('src/pages/Home.jsx', 'utf8')
    assert.ok(!code.includes('guaranteed platform transfer buffer'), 'Home must not claim guaranteed platform buffer')
  })

})

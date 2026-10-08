import { prepareApiRequest } from './_security.js';
import { searchRecoveryRoutes } from '../server/services/routeEngine.js';
import { simulateLeg1Delay } from '../server/services/contingencyEngine.js';

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { methods: ['GET', 'POST'], rateLimit: 40 })) return;

  // Handle POST for Delay Simulation
  if (req.method === 'POST') {
    const { itinerary, delayMinutes } = req.body || {};
    if (!itinerary || !itinerary.leg1) {
      return res.status(400).json({
        ok: false,
        mode: 'invalid',
        message: 'A valid itinerary object with leg1 is required for delay simulation.'
      });
    }

    const delay = Math.max(0, Math.min(360, parseInt(delayMinutes, 10) || 0));

    try {
      const simulationResult = simulateLeg1Delay(itinerary, delay);
      return res.status(200).json({
        ok: true,
        mode: 'success',
        data: simulationResult
      });
    } catch (err) {
      return res.status(500).json({
        ok: false,
        mode: 'error',
        message: 'Failed to simulate delay contingency.',
        error: err.message
      });
    }
  }

  // Handle GET for Route Recovery Search
  const from = String(req.query.from || '').trim().slice(0, 80);
  const to = String(req.query.to || '').trim().slice(0, 80);
  const date = String(req.query.date || '2026-10-15').trim();
  const allowOvernight = req.query.allowOvernight === 'true' || req.query.allowOvernight === '1';
  const includeHighRisk = req.query.includeHighRisk === 'true' || req.query.includeHighRisk === '1';

  if (!from || !to) {
    return res.status(400).json({
      ok: false,
      mode: 'invalid',
      message: 'Both origin (from) and destination (to) stations or cities are required.',
      directRoutes: [],
      rankedTiers: []
    });
  }

  try {
    const results = searchRecoveryRoutes({
      from,
      to,
      date,
      allowOvernight,
      includeHighRisk
    });

    return res.status(200).json({
      ok: true,
      mode: 'success',
      data: results
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      mode: 'error',
      message: 'Failed to compute route recovery graph.',
      error: err.message
    });
  }
}

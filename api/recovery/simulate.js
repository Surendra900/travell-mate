import { prepareApiRequest } from '../_security.js';
import { simulateLeg1Delay } from '../../server/services/contingencyEngine.js';

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { rateLimit: 40 })) return;

  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      mode: 'method_not_allowed',
      message: 'POST method required for delay simulation.'
    });
  }

  const { itinerary, delayMinutes } = req.body || {};

  if (!itinerary || !itinerary.leg1) {
    return res.status(400).json({
      ok: false,
      mode: 'invalid',
      message: 'A valid itinerary object with leg1 is required.'
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

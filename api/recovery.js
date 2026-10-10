import { prepareApiRequest, publicProviderError } from './_security.js';
import { searchRecoveryRoutes } from '../server/services/routeEngine.js';
import { simulateLeg1Delay } from '../server/services/contingencyEngine.js';
import { RecoveryQuerySchema, DelaySimulationSchema, validateSchema } from '../shared/schemas.js';

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { methods: ['GET', 'POST'], rateLimit: 40 })) return;

  // Handle POST for Delay Simulation
  if (req.method === 'POST') {
    const validation = validateSchema(DelaySimulationSchema, {
      itinerary: req.body?.itinerary,
      delayMinutes: parseInt(req.body?.delayMinutes, 10) || 30
    });

    if (!validation.success) {
      return res.status(400).json({
        ok: false,
        mode: 'invalid',
        message: `Invalid simulation payload: ${validation.errors}`
      });
    }

    const { itinerary, delayMinutes } = validation.data;
    const delay = Math.max(0, Math.min(360, delayMinutes));

    try {
      const simulationResult = simulateLeg1Delay(itinerary, delay);
      return res.status(200).json({
        ok: true,
        mode: 'success',
        data: simulationResult
      });
    } catch (err) {
      const safe = publicProviderError(err, 'Failed to simulate delay contingency.');
      return res.status(500).json({
        ok: false,
        mode: 'error',
        message: safe.message,
        error: safe.error
      });
    }
  }

  // Handle GET for Route Recovery Search
  const queryValidation = validateSchema(RecoveryQuerySchema, req.query);
  if (!queryValidation.success) {
    return res.status(400).json({
      ok: false,
      mode: 'invalid',
      message: queryValidation.errors,
      directRoutes: [],
      rankedTiers: []
    });
  }

  const { from, to, date, allowOvernight, includeHighRisk } = queryValidation.data;

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
    const safe = publicProviderError(err, 'Failed to compute route recovery graph.');
    return res.status(500).json({
      ok: false,
      mode: 'error',
      message: safe.message,
      error: safe.error
    });
  }
}

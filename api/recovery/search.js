import { prepareApiRequest } from '../_security.js';
import { searchRecoveryRoutes } from '../../server/services/routeEngine.js';

export default async function handler(req, res) {
  if (!await prepareApiRequest(req, res, { rateLimit: 30 })) return;

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
    console.error('Route recovery search error:', err);
    return res.status(500).json({
      ok: false,
      mode: 'error',
      message: 'Failed to compute route recovery graph.',
      error: err.message
    });
  }
}

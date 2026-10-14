import { z } from 'zod'

/**
 * Route recovery search query parameter schema
 */
export const RecoveryQuerySchema = z.object({
  from: z.string().trim().min(2, 'Origin must be at least 2 characters').max(80),
  to: z.string().trim().min(2, 'Destination must be at least 2 characters').max(80),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD').default('2026-10-15'),
  allowOvernight: z.union([z.boolean(), z.string().transform(v => v === 'true' || v === '1')]).default(true),
  includeHighRisk: z.union([z.boolean(), z.string().transform(v => v === 'true' || v === '1')]).default(false)
})

/**
 * Delay contingency simulation payload schema
 */
export const DelaySimulationSchema = z.object({
  itinerary: z.object({
    leg1: z.object({
      arrive: z.string().nullable().optional(),
      duration: z.string().optional(),
      mode: z.string().optional()
    }),
    leg2: z.object({
      depart: z.string().nullable().optional(),
      mode: z.string().optional()
    }).optional(),
    slackMinutes: z.number().nonnegative().optional()
  }),
  delayMinutes: z.number().int().min(0).max(720).default(30)
})

/**
 * 10-digit Indian Railways PNR validation schema
 */
export const PnrQuerySchema = z.object({
  pnr: z.string().regex(/^[0-9]{10}$/, 'Indian Railways PNR must consist of exactly 10 numeric digits')
})

/**
 * Transit Junction Hub schema
 */
export const TransitHubSchema = z.object({
  city: z.string().min(1),
  stationName: z.string().min(1),
  stationCode: z.string().min(2).max(6),
  platforms: z.number().int().positive(),
  trainTransferTip: z.string(),
  busTerminalName: z.string(),
  busTerminalDistanceKm: z.number().nonnegative(),
  busAutoFare: z.string(),
  busTransitTimeMin: z.number().nonnegative(),
  airportName: z.string(),
  airportDistanceKm: z.number().nonnegative(),
  airportTaxiFare: z.string(),
  airportTransitTimeMin: z.number().nonnegative(),
  amenities: z.array(z.string()),
  safetyScore: z.number().min(0).max(100)
})

/**
 * Helper to validate data against a Zod schema with formatted errors
 */
export function validateSchema(schema, data) {
  const result = schema.safeParse(data)
  if (!result.success) {
    const errorDetails = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
    return { success: false, errors: errorDetails, data: null }
  }
  return { success: true, errors: null, data: result.data }
}

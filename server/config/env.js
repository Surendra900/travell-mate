/**
 * TravelMate Server Environment Configuration & Runtime Validator
 * Strictly isolates secrets to serverless execution contexts
 */

export function getServerConfig() {
  return {
    databaseUrl: process.env.DATABASE_URL || '',
    directUrl: process.env.DIRECT_URL || '',
    sambanovaKey: process.env.SAMBANOVA_API_KEY || '',
    geminiKey: process.env.GEMINI_API_KEY || '',
    rapidApiKey: process.env.RAPIDAPI_KEY || '',
    rapidApiHost: process.env.RAPIDAPI_HOST || 'irctc1.p.rapidapi.com',
    openRouteServiceKey: process.env.OPENROUTESERVICE_KEY || '',
    nodeEnv: process.env.NODE_ENV || 'development'
  }
}

export function validateServerEnv() {
  const cfg = getServerConfig()
  const issues = []
  if (!cfg.sambanovaKey && !cfg.geminiKey) {
    issues.push('Neither SAMBANOVA_API_KEY nor GEMINI_API_KEY is configured. Grounded AI endpoints will fall back to computed fact templates.')
  }
  if (!cfg.rapidApiKey) {
    issues.push('RAPIDAPI_KEY is unconfigured. Real-time train seat checks will default to TIMETABLE graph and official deep-links.')
  }
  return {
    valid: true,
    warnings: issues,
    hasLlm: Boolean(cfg.sambanovaKey || cfg.geminiKey),
    hasLiveRail: Boolean(cfg.rapidApiKey)
  }
}

/**
 * TravelMate Client Environment Helper
 * Strictly prevents any server secrets from ever leaking into client bundles
 */

export const clientEnv = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL || '/'
}

import { createClient } from '@supabase/supabase-js'

const getEnv = (key) => {
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key]
  }
  try {
    return (typeof import.meta !== 'undefined' && import.meta.env?.[key]) || ''
  } catch {
    return ''
  }
}

const supabaseUrl = (getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || '').replace(/"/g, '').trim()
const supabaseAnonKey = (getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY') || '').replace(/"/g, '').trim()

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.startsWith('[') &&
  !supabaseAnonKey.startsWith('[')
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    })
  : null

/**
 * Fetch saved plans from Supabase for a given user.
 * Returns null if Supabase is unconfigured or if network fails.
 */
export async function fetchRemoteSavedPlans(userId) {
  if (!isSupabaseConfigured || !supabase || !userId) return null

  try {
    const { data, error } = await supabase
      .from('saved_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('Supabase fetchRemoteSavedPlans error:', error.message)
      return null
    }

    return (data || []).map((row) => ({
      id: row.id,
      from: row.origin,
      to: row.destination,
      date: row.travel_date || '',
      transportMode: row.transport_mode || 'Train',
      passengers: row.passengers || 1,
      ...(row.plan_data || {}),
      savedAt: row.created_at
    }))
  } catch (err) {
    console.warn('Supabase fetchRemoteSavedPlans exception:', err.message)
    return null
  }
}

/**
 * Save or update a plan in Supabase.
 */
export async function saveRemotePlan(userId, plan) {
  if (!isSupabaseConfigured || !supabase || !userId || !plan) return null

  try {
    const payload = {
      id: plan.id,
      user_id: userId,
      origin: plan.from || '',
      destination: plan.to || '',
      travel_date: plan.date || '',
      transport_mode: plan.transportMode || 'Train',
      passengers: Number(plan.passengers || 1),
      plan_data: plan
    }

    const { data, error } = await supabase
      .from('saved_plans')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single()

    if (error) {
      console.warn('Supabase saveRemotePlan error:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.warn('Supabase saveRemotePlan exception:', err.message)
    return null
  }
}

/**
 * Delete a plan from Supabase.
 */
export async function deleteRemotePlan(userId, planId) {
  if (!isSupabaseConfigured || !supabase || !userId || !planId) return false

  try {
    const { error } = await supabase
      .from('saved_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', userId)

    if (error) {
      console.warn('Supabase deleteRemotePlan error:', error.message)
      return false
    }

    return true
  } catch (err) {
    console.warn('Supabase deleteRemotePlan exception:', err.message)
    return false
  }
}

/**
 * Sync local plans with Supabase cloud:
 * Combines local storage and Supabase remote plans so offline access is preserved.
 */
export async function syncSavedPlans(userId, localPlans = []) {
  if (!isSupabaseConfigured || !supabase || !userId) return localPlans

  try {
    const remote = await fetchRemoteSavedPlans(userId)
    if (!remote) return localPlans

    // Build merged map by plan id
    const merged = new Map()
    for (const p of remote) {
      if (p.id) merged.set(p.id, p)
    }
    for (const p of localPlans) {
      if (p.id) {
        if (!merged.has(p.id)) {
          // Push local plan up to Supabase in background
          saveRemotePlan(userId, p).catch(() => {})
          merged.set(p.id, p)
        }
      }
    }

    return Array.from(merged.values())
  } catch {
    return localPlans
  }
}

/**
 * Get current authenticated user ID or persistent local ID
 */
export function getCurrentUserId() {
  if (typeof window === 'undefined') return 'anonymous'
  try {
    const clerkId = window.Clerk?.user?.id
    if (clerkId) return clerkId
  } catch {}

  let deviceId = null
  try {
    deviceId = localStorage.getItem('travelmate_user_id')
    if (!deviceId) {
      deviceId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      localStorage.setItem('travelmate_user_id', deviceId)
    }
  } catch {
    deviceId = 'local_user'
  }
  return deviceId
}

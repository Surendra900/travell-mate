import { useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { configureApiTokenProvider } from '../services/apiClient'
import { clearUserScopedLocalData } from '../utils/storage'

export default function ClerkSessionBridge() {
  const { getToken, isLoaded, isSignedIn, userId } = useAuth()

  useEffect(() => {
    configureApiTokenProvider(() => getToken())
    return () => configureApiTokenProvider(null)
  }, [getToken])

  useEffect(() => {
    if (!isLoaded) return
    const ownerKey = 'travelmate-session-owner'
    const nextOwner = isSignedIn && userId ? `clerk:${userId}` : 'anonymous'
    let previousOwner = 'anonymous'
    try { previousOwner = localStorage.getItem(ownerKey) || 'anonymous' } catch {}
    if (previousOwner !== nextOwner) clearUserScopedLocalData()
    try { localStorage.setItem(ownerKey, nextOwner) } catch {}
  }, [isLoaded, isSignedIn, userId])

  return null
}

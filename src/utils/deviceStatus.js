import { useEffect, useMemo, useState } from 'react'

function readConnection() {
  if (typeof navigator === 'undefined') return {}
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  return {
    effectiveType: connection?.effectiveType || 'unknown',
    saveData: Boolean(connection?.saveData),
    downlink: typeof connection?.downlink === 'number' ? connection.downlink : null,
    rtt: typeof connection?.rtt === 'number' ? connection.rtt : null,
    supported: Boolean(connection),
    connection
  }
}

export function useDeviceStatus() {
  const initialConnection = readConnection()
  const [status, setStatus] = useState({
    online: typeof navigator === 'undefined' ? true : navigator.onLine,
    batteryLevel: null,
    charging: null,
    effectiveType: initialConnection.effectiveType || 'unknown',
    saveData: Boolean(initialConnection.saveData),
    downlink: initialConnection.downlink,
    rtt: initialConnection.rtt,
    supported: {
      battery: false,
      network: Boolean(initialConnection.supported)
    }
  })

  useEffect(() => {
    let batteryRef = null
    const updateOnline = () => setStatus((old) => ({ ...old, online: navigator.onLine }))
    const updateConnection = () => {
      const next = readConnection()
      setStatus((old) => ({
        ...old,
        effectiveType: next.effectiveType || 'unknown',
        saveData: Boolean(next.saveData),
        downlink: next.downlink,
        rtt: next.rtt,
        supported: { ...old.supported, network: Boolean(next.supported) }
      }))
    }
    const updateBattery = () => {
      if (!batteryRef) return
      setStatus((old) => ({
        ...old,
        batteryLevel: Math.round(batteryRef.level * 100),
        charging: batteryRef.charging,
        supported: { ...old.supported, battery: true }
      }))
    }

    const connection = readConnection().connection
    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)
    connection?.addEventListener?.('change', updateConnection)

    if (navigator.getBattery) {
      navigator.getBattery().then((battery) => {
        batteryRef = battery
        updateBattery()
        battery.addEventListener('levelchange', updateBattery)
        battery.addEventListener('chargingchange', updateBattery)
      }).catch(() => {})
    }

    return () => {
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
      connection?.removeEventListener?.('change', updateConnection)
      if (batteryRef) {
        batteryRef.removeEventListener('levelchange', updateBattery)
        batteryRef.removeEventListener('chargingchange', updateBattery)
      }
    }
  }, [])

  const isSlowNetwork = useMemo(() => {
    if (!status.online) return false
    return (
      status.effectiveType === '2g' ||
      status.effectiveType === 'slow-2g' ||
      (status.downlink !== null && status.downlink < 0.35) ||
      status.saveData === true
    )
  }, [status.online, status.effectiveType, status.downlink, status.saveData])

  const recommendedMode = useMemo(() => {
    if (!status.online) return 'low-network'
    if (isSlowNetwork) return 'low-network'
    return 'normal'
  }, [status.online, isSlowNetwork])

  const networkQuality = useMemo(() => {
    if (!status.online) {
      return {
        tier: 'offline',
        label: 'Offline (Zero Connectivity)',
        badgeColor: 'border-red-500/40 bg-red-500/20 text-red-200',
        dotColor: 'bg-red-400'
      }
    }
    if (isSlowNetwork) {
      return {
        tier: 'slow',
        label: `Low Bandwidth (${status.effectiveType.toUpperCase() || '2G'})`,
        badgeColor: 'border-amber-500/40 bg-amber-500/20 text-amber-200',
        dotColor: 'bg-amber-400'
      }
    }
    return {
      tier: 'good',
      label: 'High-Speed Broadband / 4G',
      badgeColor: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-200',
      dotColor: 'bg-emerald-400'
    }
  }, [status.online, isSlowNetwork, status.effectiveType])

  return {
    ...status,
    recommendedMode,
    isSlowNetwork,
    isOffline: !status.online,
    networkQuality
  }
}

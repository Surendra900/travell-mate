import { useState, useEffect } from 'react'
import { Download, ShieldCheck, Sparkles, WifiOff, X } from 'lucide-react'

const DISMISS_KEY = 'travelmate-pwa-dismissed'

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    if (isStandalone) {
      setInstalled(true)
      return
    }

    // Check if recently dismissed
    const dismissedTime = localStorage.getItem(DISMISS_KEY)
    if (dismissedTime && Date.now() - Number(dismissedTime) < 24 * 60 * 60 * 1000) {
      setDismissed(true)
    }

    function handleBeforeInstallPrompt(e) {
      e.preventDefault()
      setDeferredPrompt(e)
      setDismissed(false)
    }

    function handleAppInstalled() {
      setInstalled(true)
      setDeferredPrompt(null)
      localStorage.removeItem(DISMISS_KEY)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Custom event to trigger banner open from navbar/footer
    function handleOpenInstallPrompt() {
      setDismissed(false)
    }
    window.addEventListener('travelmate:open-pwa-install', handleOpenInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('travelmate:open-pwa-install', handleOpenInstallPrompt)
    }
  }, [])

  function dismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {}
  }

  async function handleInstallClick() {
    if (deferredPrompt) {
      setInstalling(true)
      try {
        await deferredPrompt.prompt()
        const choice = await deferredPrompt.userChoice
        if (choice.outcome === 'accepted') {
          setInstalled(true)
        }
      } catch (err) {
        console.error('PWA install prompt error:', err)
      } finally {
        setInstalling(false)
        setDeferredPrompt(null)
      }
    } else {
      // Fallback instruction for browsers where beforeinstallprompt was already fired or not supported
      alert('To install TravelMate AI on this device:\n• On Chrome/Edge: Click the Install icon in the address bar or browser menu (⋮) -> "Install TravelMate AI".\n• On Safari iOS: Tap Share (⎋) -> "Add to Home Screen".')
      dismiss()
    }
  }

  if (installed || dismissed) return null

  return (
    <aside
      role="banner"
      aria-label="Install TravelMate Web Application"
      data-testid="pwa-install-banner"
      className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-xl rounded-2xl border border-indigo-400/40 bg-slate-950/95 p-4 text-white shadow-2xl backdrop-blur-md md:bottom-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-black text-white">Install TravelMate AI</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/40">
                <WifiOff size={10} /> 100% Offline Ready
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              Install to your home screen for zero-signal operation, biometric boarding passes, and instant emergency SOS.
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss install banner"
          data-testid="pwa-dismiss-button"
          onClick={dismiss}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-3.5 flex items-center justify-end gap-2.5">
        <button
          type="button"
          onClick={dismiss}
          className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
        >
          Maybe Later
        </button>
        <button
          type="button"
          data-testid="pwa-install-button"
          onClick={handleInstallClick}
          disabled={installing}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 active:scale-95 transition"
        >
          <Download size={14} /> {installing ? 'Installing…' : 'Install App'}
        </button>
      </div>
    </aside>
  )
}

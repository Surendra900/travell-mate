import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import StatusBar from './components/StatusBar'
import OfflineModeBanner from './components/OfflineModeBanner'
import VoiceSearchButton from './components/VoiceSearchButton'
import OnboardingModal from './components/OnboardingModal'
import FloatingSOS from './components/FloatingSOS'
import OfflineOnlyMode from './components/OfflineOnlyMode'
import GlobalTranslationLayer from './components/GlobalTranslationLayer'
import BlindVoiceGate from './components/BlindVoiceGate'
import Footer from './components/Footer'
import LocationPermissionGate from './components/LocationPermissionGate'
import PageErrorBoundary from './components/PageErrorBoundary'
import { languages } from './data/languageData'
import { useDeviceStatus } from './utils/deviceStatus'
import { warmOfflineCache } from './utils/offlineMode'
import { saveOfflinePack } from './utils/storage'
import { parseVoiceIntent } from './utils/voiceIntent'

const Home = lazy(() => import('./pages/Home'))
const SafetyMode = lazy(() => import('./pages/SafetyMode'))
const EmergencyDetail = lazy(() => import('./pages/EmergencyDetail'))
const Planner = lazy(() => import('./pages/Planner'))
const SavedPlans = lazy(() => import('./pages/SavedPlans'))
const AnalyzeJourney = lazy(() => import('./pages/AnalyzeJourney'))

export default function App({ authEnabled = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem('travelmate-language')
      return saved && languages[saved] ? saved : 'en'
    } catch {
      return 'en'
    }
  })
  const [toastMessage, setToastMessage] = useState('')
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [blindGateOpen, setBlindGateOpen] = useState(false)
  const [blindMode, setBlindMode] = useState(false)
  const status = useDeviceStatus()
  const labels = useMemo(() => languages[language].labels, [language])

  useEffect(() => {
    try { localStorage.setItem('travelmate-language', language) } catch {}
  }, [language])

  useEffect(() => {
    // Prepare emergency/offline data once the app has opened online.
    // Automatic offline mode is triggered only when the browser reports that it is offline.
    saveOfflinePack()
    warmOfflineCache()
  }, [])

  const toast = useCallback((message) => {
    setToastMessage(message)
    window.clearTimeout(window.__travelmateToast)
    window.__travelmateToast = window.setTimeout(() => setToastMessage(''), 2800)
  }, [])

  const handleVoiceSearch = useCallback((rawCommand = '') => {
    const voice = parseVoiceIntent(rawCommand)

    if (voice.action === 'open-safety') {
      navigate('/safety')
      toast('Opened Safety Mode from voice search.')
      return { ok: true, message: voice.message }
    }
    if (voice.action === 'open-saved') {
      navigate('/saved')
      toast('Opened Saved Plans from voice search.')
      return { ok: true, message: voice.message }
    }
    if (voice.action === 'open-analyze') {
      navigate('/analyze')
      toast('Opened Analyze Journey from voice search.')
      return { ok: true, message: voice.message }
    }
    if (voice.action === 'open-home' || voice.action === 'none') {
      navigate('/')
      toast('Voice search did not find a travel action.')
      return { ok: false, message: voice.message }
    }

    const detail = {
      plan: voice.plan,
      mode: voice.mode,
      action: voice.action,
      source: 'voice'
    }

    if (location.pathname === '/planner') {
      window.dispatchEvent(new CustomEvent('travelmate:voice-planner', { detail }))
    } else {
      try { localStorage.setItem('travelmate-pending-voice-command', JSON.stringify(detail)) } catch {}
      navigate('/planner')
    }

    toast(voice.message)
    return { ok: true, message: voice.message }
  }, [location.pathname, navigate, toast])

  const appShell = (
    <div className="min-h-screen pb-24 sm:pb-0">
      <GlobalTranslationLayer language={language} />
      <BlindVoiceGate forceOpen={blindGateOpen} onClose={() => setBlindGateOpen(false)} toast={toast} onModeChange={setBlindMode} />
      <LocationPermissionGate toast={toast} />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-xl focus:bg-cyan-300 focus:px-4 focus:py-2 focus:font-black focus:text-slate-950">Skip to main content</a>
      {status.online !== false && <Navbar language={language} onLanguageChange={setLanguage} labels={labels} authEnabled={authEnabled} onOpenProfile={() => setProfileModalOpen(true)} onOpenVoiceGate={() => setBlindGateOpen(true)} />}
      <StatusBar status={status} />
      {status.online === false ? (
        <div id="main-content"><OfflineOnlyMode status={status} toast={toast} /></div>
      ) : (
        <>
          <OfflineModeBanner status={status} toast={toast} />
          <div id="main-content">
            <PageErrorBoundary key={location.pathname}>
              <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16 text-center font-bold text-cyan-100">Loading TravelMate module…</div>}>
                <Routes>
                <Route path="/" element={<Home labels={labels} toast={toast} />} />
                <Route path="/safety" element={<SafetyMode toast={toast} labels={labels} />} />
                <Route path="/safety/:id" element={<EmergencyDetail toast={toast} />} />
                <Route path="/planner" element={<Planner status={status} toast={toast} labels={labels} language={language} />} />
                <Route path="/saved" element={<SavedPlans toast={toast} />} />
                <Route path="/analyze" element={<AnalyzeJourney toast={toast} />} />
                </Routes>
              </Suspense>
            </PageErrorBoundary>
          </div>
        </>
      )}
      {location.pathname !== '/analyze' && location.pathname !== '/saved' && <FloatingSOS status={status} />}
      {location.pathname !== '/analyze' && <VoiceSearchButton onSearch={handleVoiceSearch} language={language} />}
      {status.online !== false && <Footer />}
      {status.online !== false && <OnboardingModal toast={toast} forceOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />}
      {toastMessage && (
        <div className="app-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  )

  return appShell
}

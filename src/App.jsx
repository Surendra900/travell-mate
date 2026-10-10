import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Navbar from './components/Navbar'
import OfflineModeBanner from './components/OfflineModeBanner'
import VoiceSearchButton from './components/VoiceSearchButton'
import OnboardingModal from './components/OnboardingModal'
import OfflineOnlyMode from './components/OfflineOnlyMode'
import GlobalTranslationLayer from './components/GlobalTranslationLayer'
import PwaInstallBanner from './components/PwaInstallBanner'
import DpdpPrivacyModal from './components/DpdpPrivacyModal'
import DemoTourModal from './components/DemoTourModal'
import Footer from './components/Footer'
import LocationPermissionGate from './components/LocationPermissionGate'
import PageErrorBoundary from './components/PageErrorBoundary'
import FeedbackModal from './components/FeedbackModal'
import { languages } from './data/languageData'
import { useDeviceStatus } from './utils/deviceStatus'
import { warmOfflineCache } from './utils/offlineMode'
import { saveOfflinePack } from './utils/storage'
import { parseVoiceIntent, speakRouteConfirmation, speakEmergencyConfirmation } from './utils/voiceIntent'

const Home = lazy(() => import('./pages/Home'))
const SafetyMode = lazy(() => import('./pages/SafetyMode'))
const EmergencyDetail = lazy(() => import('./pages/EmergencyDetail'))
const Planner = lazy(() => import('./pages/Planner'))
const SavedPlans = lazy(() => import('./pages/SavedPlans'))
const AnalyzeJourney = lazy(() => import('./pages/AnalyzeJourney'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const LegalDisclaimer = lazy(() => import('./pages/LegalDisclaimer'))

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
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [demoTourOpen, setDemoTourOpen] = useState(false)
  const status = useDeviceStatus()
  const labels = useMemo(() => languages[language].labels, [language])

  useEffect(() => {
    const handleOpenPrivacy = () => setPrivacyModalOpen(true)
    const handleOpenDemoTour = () => setDemoTourOpen(true)
    window.addEventListener('travelmate:open-privacy', handleOpenPrivacy)
    window.addEventListener('travelmate:open-demo-tour', handleOpenDemoTour)
    return () => {
      window.removeEventListener('travelmate:open-privacy', handleOpenPrivacy)
      window.removeEventListener('travelmate:open-demo-tour', handleOpenDemoTour)
    }
  }, [])

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

    if (voice.action === 'open-safety' || voice.intent === 'safety') {
      speakEmergencyConfirmation(voice.emergencyType, { lang: languages[language]?.bcp47 || 'en-IN' })
      navigate('/safety')
      toast(voice.message || 'Opened Safety Mode from voice search.')
      if (voice.hotline) {
        window.dispatchEvent(new CustomEvent('travelmate:voice-dial', { detail: { hotline: voice.hotline, type: voice.emergencyType } }))
      }
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
      filter: voice.filter,
      targetTier: voice.targetTier,
      source: 'voice'
    }

    // Audible confirmation readout for route searches
    if (voice.routeDetected) {
      speakRouteConfirmation(voice, { lang: languages[language]?.bcp47 || 'en-IN' })
    }

    if (location.pathname === '/planner') {
      window.dispatchEvent(new CustomEvent('travelmate:voice-planner', { detail }))
    } else {
      try { localStorage.setItem('travelmate-pending-voice-command', JSON.stringify(detail)) } catch {}
      navigate('/planner')
    }

    toast(voice.message)
    return { ok: true, message: voice.message }
  }, [location.pathname, navigate, toast, language])

  const handleVoiceGateAssist = useCallback(() => {
    window.dispatchEvent(new CustomEvent('travelmate:toggle-voice-search'))
    toast('Voice search ready. Click the microphone or speak.')
  }, [toast])

  const appShell = (
    <div className="min-h-screen pb-24 sm:pb-0">
      <GlobalTranslationLayer language={language} />
      <LocationPermissionGate toast={toast} />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-xl focus:bg-cyan-300 focus:px-4 focus:py-2 focus:font-black focus:text-slate-950">Skip to main content</a>
      {status.online !== false && <Navbar language={language} onLanguageChange={setLanguage} labels={labels} authEnabled={authEnabled} onOpenProfile={() => setProfileModalOpen(true)} onOpenVoiceGate={handleVoiceGateAssist} onOpenDemoTour={() => setDemoTourOpen(true)} />}
      {status.online === false ? (
        <main id="main-content" tabIndex="-1"><OfflineOnlyMode status={status} toast={toast} /></main>
      ) : (
        <>
          <OfflineModeBanner status={status} toast={toast} />
          <main id="main-content" tabIndex="-1">
            <PageErrorBoundary key={location.pathname}>
              <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-16 text-center font-bold text-slate-700">Loading TravelMate module…</div>}>
                <Routes>
                <Route path="/" element={<Home labels={labels} toast={toast} />} />
                <Route path="/safety" element={<SafetyMode toast={toast} labels={labels} />} />
                <Route path="/safety/:id" element={<EmergencyDetail toast={toast} />} />
                <Route path="/planner" element={<Planner status={status} toast={toast} labels={labels} language={language} />} />
                <Route path="/saved" element={<SavedPlans toast={toast} />} />
                <Route path="/plans" element={<SavedPlans toast={toast} />} />
                <Route path="/analyze" element={<AnalyzeJourney toast={toast} />} />
                <Route path="/privacy" element={<PrivacyPolicy toast={toast} />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/disclaimer" element={<LegalDisclaimer />} />
                </Routes>
              </Suspense>
            </PageErrorBoundary>
          </main>
        </>
      )}
      {location.pathname !== '/analyze' && <VoiceSearchButton onSearch={handleVoiceSearch} language={language} />}
      <PwaInstallBanner />
      {status.online !== false && (
        <Footer
          onOpenPrivacy={() => setPrivacyModalOpen(true)}
          onOpenFeedback={() => setFeedbackModalOpen(true)}
        />
      )}
      {status.online !== false && <OnboardingModal toast={toast} forceOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />}
      <DpdpPrivacyModal open={privacyModalOpen} onClose={() => setPrivacyModalOpen(false)} toast={toast} />
      <FeedbackModal open={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} toast={toast} />
      <DemoTourModal
        open={demoTourOpen}
        onClose={() => setDemoTourOpen(false)}
        onLaunchVoiceGate={() => {
          setDemoTourOpen(false)
          handleVoiceGateAssist()
        }}
      />
      {toastMessage && (
        <div className="app-toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  )

  return appShell
}

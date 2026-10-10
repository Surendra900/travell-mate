import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { initErrorMonitoring } from './utils/errorMonitoring'

initErrorMonitoring()

const clerkPublishableKey = String(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim()
const authEnabled = /^pk_(test|live)_/.test(clerkPublishableKey)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App authEnabled={authEnabled} />
    </BrowserRouter>
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations?.().then((registrations) => {
        registrations.forEach((registration) => registration.unregister())
      })
      return
    }

    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('TravelMate service worker registration failed:', error)
    })
  })
}

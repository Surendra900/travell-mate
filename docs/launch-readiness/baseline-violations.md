# Baseline Violations Inventory

Generated on: 2026-10-11

## Summary Table

| Rule | Status | Violations Count | Planned Fix |
|---|---|---|---|
| A1. Gradients Purple | FAIL | 42 | Replace indigo, violet, and purple utilities with slate or cyan brand palette |
| A2. Pill Buttons | FAIL | 86 | Replace rounded-full, rounded-3xl with rounded-md (6px) or rounded-lg (8px) |
| A3. Emoji Icons | FAIL | 131 | Replace emoji and icon symbols with clean Lucide SVG icons |
| B1. Em Dash | FAIL | 183 | Replace U+2014, &mdash;, double hyphens, and spaced hyphens with periods, colons, or commas |
| B2. Slop Copy | FAIL | 350 | Rewrite marketing copy, eliminate hype words, remove exclamation marks |
| C1. Fake Proof | FAIL | 3 | Remove fake counters, star ratings, and simulated traveler numbers |
| A4/A5. Motion and Cursor | FAIL | 5 | Reduce animation durations below 200ms, ensure reduced-motion support |
| Gate 3. Made With AI | PASS | 0 | Clean; keep builder watermarks out of build |
| C3. Placeholders | FAIL | 2 | Remove TODOs, localhost strings, and production console.log calls |
| C2. Images | PASS | 0 | Verified; all images documented in assets.md |
| Gates 1 to 5. Launch Gates | FAIL | 2 | Connect custom domain upon user input; generate favicon.ico set |

## Detailed Breakdown by Rule

### Rule A1: Purple Gradients and Banned Utility Classes (42 violations)

1. `src\components\DemoTourModal.jsx:106`: Found banned utility classes: to-indigo-500
2. `src\components\DemoTourModal.jsx:117`: Found banned utility classes: border-indigo-500, bg-indigo-500, text-indigo-300
3. `src\components\DemoTourModal.jsx:193`: Found banned utility classes: to-indigo-500
4. `src\components\DpdpPrivacyModal.jsx:54`: Found banned utility classes: border-indigo-500
5. `src\components\DpdpPrivacyModal.jsx:67`: Found banned utility classes: bg-indigo-600, text-indigo-400
6. `src\components\DpdpPrivacyModal.jsx:71`: Found banned utility classes: border-indigo-500, bg-indigo-950, text-indigo-300
7. `src\components\DpdpPrivacyModal.jsx:81`: Found banned utility classes: border-indigo-900, bg-indigo-950
8. `src\components\DpdpPrivacyModal.jsx:82`: Found banned utility classes: text-indigo-200
9. `src\components\DpdpPrivacyModal.jsx:97`: Found banned utility classes: text-indigo-400
10. `src\components\DpdpPrivacyModal.jsx:126`: Found banned utility classes: bg-indigo-600
11. `src\components\DpdpPrivacyModal.jsx:148`: Found banned utility classes: bg-indigo-600
12. `src\components\DpdpPrivacyModal.jsx:157`: Found banned utility classes: text-purple-400
13. `src\components\DpdpPrivacyModal.jsx:170`: Found banned utility classes: bg-indigo-600
14. `src\components\DpdpPrivacyModal.jsx:202`: Found banned utility classes: bg-indigo-600, bg-indigo-500
15. `src\components\EmergencyCard.jsx:10`: Found banned utility classes: text-indigo-700
16. `src\components\OfflinePassModal.jsx:100`: Found banned utility classes: border-indigo-500
17. `src\components\OfflinePassModal.jsx:112`: Found banned utility classes: bg-indigo-600, text-indigo-400
18. `src\components\OfflinePassModal.jsx:126`: Found banned utility classes: border-indigo-400
19. `src\components\OfflinePassModal.jsx:127`: Found banned utility classes: from-indigo-900, to-purple-900
20. `src\components\OfflinePassModal.jsx:128`: Found banned utility classes: text-indigo-200
21. `src\components\OfflinePassModal.jsx:135`: Found banned utility classes: text-indigo-300
22. `src\components\OfflinePassModal.jsx:138`: Found banned utility classes: text-indigo-300
23. `src\components\OfflinePassModal.jsx:139`: Found banned utility classes: bg-indigo-400
24. `src\components\OfflinePassModal.jsx:140`: Found banned utility classes: text-indigo-200
25. `src\components\OfflinePassModal.jsx:144`: Found banned utility classes: text-indigo-300
26. `src\components\OfflinePassModal.jsx:149`: Found banned utility classes: border-indigo-900
27. `src\components\OfflinePassModal.jsx:156`: Found banned utility classes: text-indigo-300
28. `src\components\OfflinePassModal.jsx:170`: Found banned utility classes: text-indigo-400
29. `src\components\OfflinePassModal.jsx:204`: Found banned utility classes: border-indigo-500
30. `src\components\OfflinePassModal.jsx:209`: Found banned utility classes: bg-indigo-600, bg-indigo-500

*... and 12 additional violations of this rule.*

### Rule A2: Pill-Shaped Buttons (86 violations)

1. `src\components\EmergencyCard.jsx:6`: Button or link with excessive border radius class: <Link to={`/safety/${item.id}`} className="glass group rounded-3xl p-5 transition hover:-translate-y
2. `src\components\OfflineModeBanner.jsx:33`: Button or link with excessive border radius class: <Link className="rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-slate-950" to="/planner"
3. `src\components\OfflineModeBanner.jsx:34`: Button or link with excessive border radius class: <Link className="rounded-full border border-red-300 px-4 py-2 text-sm font-bold text-red-900" to="/s
4. `src\pages\SafetyMode.jsx:200`: Button or link with excessive border radius class: className="btn-primary h-12 px-6 rounded-2xl text-sm font-extrabold flex items-center gap-2 shadow-l
5. `src\pages\SafetyMode.jsx:209`: Button or link with excessive border radius class: className="btn-danger h-12 px-6 rounded-2xl text-sm font-extrabold flex items-center gap-2 shadow-lg
6. `src\pages\SavedPlans.jsx:154`: Button or link with excessive border radius class: className="btn-primary h-12 px-5 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-md sha
7. Route `/`: {"tag":"button","text":"See a Demo","class":"flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold transition shadow-sm","computedRadius":"9999px","elementHeight":"44px"}
8. Route `/`: {"tag":"button","text":"Voice Accessibility Mode (Alt+B)","class":"flex items-center justify-center w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:text-sky-600 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition","computedRadius":"9999px","elementHeight":"44px"}
9. Route `/`: {"tag":"button","text":"Local profile","class":"btn-soft whitespace-nowrap compact-account-button","computedRadius":"14px","elementHeight":"44px"}
10. Route `/`: {"tag":"button","text":"All Combinations","class":"inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all bg-sky-700 text-white shadow-md shadow-sky-700/25 scale-[1.01]","computedRadius":"12px","elementHeight":"44px"}
11. Route `/`: {"tag":"button","text":"Trains Only","class":"inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-950","computedRadius":"12px","elementHeight":"44px"}
12. Route `/`: {"tag":"button","text":"Buses","class":"inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-950","computedRadius":"12px","elementHeight":"44px"}
13. Route `/`: {"tag":"button","text":"Flights","class":"inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-950","computedRadius":"12px","elementHeight":"44px"}
14. Route `/`: {"tag":"button","text":"Voice input query","class":"p-2 rounded-xl transition text-slate-500 hover:text-sky-700 hover:bg-sky-100","computedRadius":"12px","elementHeight":"44px"}
15. Route `/`: {"tag":"button","text":"Parse","class":"inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white text-xs font-bold transition shrink-0","computedRadius":"12px","elementHeight":"44px"}
16. Route `/`: {"tag":"button","text":"Swap origin and destination","class":"w-10 h-10 rounded-full border border-slate-300 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 hover:text-sky-700 text-slate-600 flex items-center justify-center transition shadow-sm","computedRadius":"9999px","elementHeight":"44px"}
17. Route `/`: {"tag":"button","text":"Search Recovery Routes","class":"w-full sm:flex-1 h-14 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg shadow-sky-700/25 transition transform active:scale-[0.99]","computedRadius":"16px","elementHeight":"56px"}
18. Route `/`: {"tag":"button","text":"See a Demo","class":"w-full sm:w-auto h-14 px-6 rounded-2xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-sm flex items-center justify-center gap-2 transition","computedRadius":"16px","elementHeight":"56px"}
19. Route `/`: {"tag":"button","text":"Check PNR Status & Odds","class":"inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 hover:border-sky-400 bg-white hover:bg-sky-50 text-slate-800 hover:text-sky-700 font-bold text-xs transition whitespace-nowrap","computedRadius":"12px","elementHeight":"44px"}
20. Route `/`: {"tag":"button","text":"Start voice search","class":"voice-launcher floating-voice-action","computedRadius":"9999px","elementHeight":"52px"}
21. Route `/planner`: {"tag":"button","text":"See a Demo","class":"flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold transition shadow-sm","computedRadius":"9999px","elementHeight":"44px"}
22. Route `/planner`: {"tag":"button","text":"Voice Accessibility Mode (Alt+B)","class":"flex items-center justify-center w-9 h-9 rounded-full border border-slate-300 bg-white text-slate-700 hover:text-sky-600 hover:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm transition","computedRadius":"9999px","elementHeight":"44px"}
23. Route `/planner`: {"tag":"button","text":"Local profile","class":"btn-soft whitespace-nowrap compact-account-button","computedRadius":"14px","elementHeight":"44px"}
24. Route `/planner`: {"tag":"button","text":"Check PNR Status","class":"flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold transition shadow-xs","computedRadius":"12px","elementHeight":"44px"}
25. Route `/planner`: {"tag":"button","text":"Route Finder","class":"min-h-11 rounded-xl px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm transition bg-sky-700 text-white shadow-sm","computedRadius":"12px","elementHeight":"44px"}
26. Route `/planner`: {"tag":"button","text":"Tatkal Desk","class":"min-h-11 rounded-xl px-3 py-2 text-xs font-bold sm:px-4 sm:text-sm transition border border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100","computedRadius":"12px","elementHeight":"44px"}
27. Route `/planner`: {"tag":"button","text":"Train","class":"inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition bg-sky-700 text-white shadow-sm","computedRadius":"12px","elementHeight":"44px"}
28. Route `/planner`: {"tag":"button","text":"Flight","class":"inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition bg-slate-100 text-slate-700 hover:bg-slate-200","computedRadius":"12px","elementHeight":"44px"}
29. Route `/planner`: {"tag":"button","text":"Bus","class":"inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition bg-slate-100 text-slate-700 hover:bg-slate-200","computedRadius":"12px","elementHeight":"44px"}
30. Route `/planner`: {"tag":"button","text":"Voice input query","class":"p-2 rounded-xl transition text-slate-500 hover:text-sky-700 hover:bg-sky-100","computedRadius":"12px","elementHeight":"44px"}

*... and 56 additional violations of this rule.*

### Rule A3: Emoji and Symbol Icons (131 violations)

1. `src\components\BackupPlan.jsx:152` (Symbol: ✓): <p className="mt-0.5 text-[11px] text-emerald-300 font-medium">✓ {opt.riskReduct
2. `src\components\BackupPlan.jsx:203` (Symbol: →): <p><b className="text-cyan-100">Leg {leg.leg} · {leg.mode}:</b> {leg.service} ({
3. `src\components\GlobalTranslationLayer.jsx:75` (Symbol: →): if (/^[A-Z]{2,5}\s*(?:→|->|–|—)\s*[A-Z]{2,5}$/.test(text)) return false
4. `src\components\LocationPermissionGate.jsx:107` (Symbol: →): <div className="rounded-2xl border border-red-400/25 bg-red-400/10 p-4 text-red-
5. `src\components\MultimodalTimelineCard.jsx:235` (Symbol: ➔): <span className="text-slate-600 font-bold">── {route.leg1.duration} ──➔</span>
6. `src\components\MultimodalTimelineCard.jsx:240` (Symbol: ➔): <span>{route.leg1?.departureEstimate || 'Frequency estimate'} · {route.leg1?.fro
7. `src\components\MultimodalTimelineCard.jsx:320` (Symbol: 🟢): 🟢 {hubGuide.safetyScore || 92}% Safe Connection Score
8. `src\components\MultimodalTimelineCard.jsx:329` (Symbol: 💡): 💡 <b>Pro-Tip:</b> {hubGuide.modeSpecificTip}
9. `src\components\MultimodalTimelineCard.jsx:337` (Symbol: ✓): ✓ {item}
10. `src\components\MultimodalTimelineCard.jsx:365` (Symbol: ➔): <span className="text-slate-600 font-bold">── {route.leg2.duration} ──➔</span>
11. `src\components\MultimodalTimelineCard.jsx:370` (Symbol: ➔): <span>{route.leg2?.departureEstimate || 'Frequency estimate'} · {route.leg2?.fro
12. `src\components\OfflineOnlyMode.jsx:50` (Symbol: →): plan ? `Journey: ${plan.from || 'Origin'} → ${plan.to || 'Destination'}` : 'Jour
13. `src\components\OfflineOnlyMode.jsx:122` (Symbol: →): <h2 className="mt-2 text-3xl font-black text-white">{plan.from} → {plan.to}</h2>
14. `src\components\OfflineOnlyMode.jsx:134` (Symbol: →): <p className="mt-1"><b className="text-white">Path:</b> {serviceValue(service, '
15. `src\components\OfflineOnlyMode.jsx:135` (Symbol: →): <p className="mt-1"><b className="text-white">Timing:</b> {departure || 'Check p
16. `src\components\OfflineOnlyMode.jsx:153` (Symbol: →): <p key={`${backup.label}-${leg.leg}`} className="rounded-xl bg-slate-950/70 p-3 
17. `src\components\OfflineTravelerPassModal.jsx:58` (Symbol: 🎫): `🎫 TRAVELMATE OFFLINE BOARDING PASS`,
18. `src\components\OfflineTravelerPassModal.jsx:59` (Symbol: ➔): `Route: ${route.leg1?.from} ➔ ${route.leg2?.to}`,
19. `src\components\OfflineTravelerPassModal.jsx:112` (Symbol: ➔): {route.leg1?.from} ➔ {route.leg2?.to}
20. `src\components\PnrPredictorModal.jsx:132` (Symbol: 🚆): const text = `🚆 *IRCTC PNR Status & AI Prediction*
21. `src\components\PnrPredictorModal.jsx:135` (Symbol: ➔): *Route:* ${activeData.from} ➔ ${activeData.to}
22. `src\components\PnrPredictorModal.jsx:139` (Symbol: 💡): 💡 *Analysis:* ${prediction.summary}
23. `src\components\PnrPredictorModal.jsx:242` (Symbol: 🟢): {idx === 0 && '🟢 RAC 6 (High)'}
24. `src\components\PnrPredictorModal.jsx:243` (Symbol: 🔴): {idx === 1 && '🔴 PQWL 18 (Low)'}
25. `src\components\PnrPredictorModal.jsx:244` (Symbol: 🎫): {idx === 2 && '🎫 Confirmed'}
26. `src\components\PnrPredictorModal.jsx:270` (Symbol: ➔): {activeData.from} ──➔ {activeData.to}
27. `src\components\PnrPredictorModal.jsx:353` (Symbol: 💡): 💡 <b>Strategic Next Step:</b> {prediction.recommendation}
28. `src\components\StationHopperCard.jsx:21` (Symbol: 💡): Same Train, Higher-Quota Seat Bypass 💡
29. `src\components\StationHopperCard.jsx:61` (Symbol: 🟢): 🟢 ~{hack.confirmedProbability}% Historical Clearance Rate
30. `src\components\WaitlistBypassContrast.jsx:105` (Symbol: ➔): <span>Illustrative availability for New Delhi ➔ Patna corridor. Run a route sear

*... and 101 additional violations of this rule.*

### Rule B1: Em Dashes and Prohibited Dash Patterns (183 violations)

1. `src\components\BackupPlan.jsx:28`: Found spaced hyphen dash in: .sort((a, b) => b.score - a.score), [plan])
2. `src\components\DelayContingencySimulator.jsx:81`: Found spaced hyphen dash in: const effectiveSlack = initialSlack - delayMinutes
3. `src\components\DelayContingencySimulator.jsx:84`: Found spaced hyphen dash in: const maxAbsorbable = Math.max(0, initialSlack - mct)
4. `src\components\DemoTourModal.jsx:54`: Found spaced hyphen dash in: const isLast = currentStep === TOUR_STEPS.length - 1;
5. `src\components\DemoTourModal.jsx:66`: Found spaced hyphen dash in: setCurrentStep((s) => s - 1);
6. `src\components\GlobalTranslationLayer.jsx:75`: Found U+2014/U+2015 in: if (/^[A-Z]{2,5}\s*(?:→|->|–|—)\s*[A-Z]{2,5}$/.test(text)) return false
7. `src\components\LiveResultsPanel.jsx:47`: Found U+2014/U+2015 in: function displayValue(value, fallback = '—') {
8. `src\components\LiveResultsPanel.jsx:60`: Found U+2014/U+2015 in: const duration = displayValue(item.duration || item.travelTime, '—')
9. `src\components\MultimodalTimelineCard.jsx:76`: Found spaced hyphen dash in: const maxAbsorbableDelay = Math.max(0, slackMinutes - mctMinutes)
10. `src\components\MultimodalTimelineCard.jsx:419`: Found U+2014/U+2015 in: <strong>Separate Contracts:</strong> These are independent bookings — Leg 1 and Leg 2 are unbundled 
11. `src\components\OfflineOnlyMode.jsx:24`: Found spaced hyphen dash in: .sort((a, b) => (b.emergencyFit + b.reliability + b.cost) - (a.emergencyFit + a.reliability + a.cost
12. `src\components\OfflineOnlyMode.jsx:45`: Found U+2014/U+2015 in: ? `${Number(location.latitude).toFixed(6)}, ${Number(location.longitude).toFixed(6)} — ${formatEmerg
13. `src\components\PnrPredictorModal.jsx:107`: Found spaced hyphen dash in: trainName: 'New Delhi - Dibrugarh Rajdhani Express',
14. `src\components\PnrPredictorModal.jsx:134`: Found spaced hyphen dash in: *Train:* ${activeData.trainNumber} - ${activeData.trainName}
15. `src\components\PnrPredictorModal.jsx:267`: Found spaced hyphen dash in: {activeData.trainNumber} - {activeData.trainName}
16. `src\components\PwaInstallBanner.jsx:25`: Found spaced hyphen dash in: if (dismissedTime && Date.now() - Number(dismissedTime) < 24 * 60 * 60 * 1000) {
17. `src\components\RouteMap.jsx:154`: Found spaced hyphen dash in: const isEnd = index === route.points.length - 1;
18. `src\components\RouteMap.jsx:210`: Found spaced hyphen dash in: if (index >= latLngs.length - 1) return;
19. `src\components\StationAutocomplete.jsx:71`: Found spaced hyphen dash in: setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0))
20. `src\components\StationAutocomplete.jsx:74`: Found spaced hyphen dash in: setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1))
21. `src\components\TatkalEmergencyTimer.jsx:51`: Found spaced hyphen dash in: const diff = target - now
22. `src\components\TatkalEmergencyTimer.jsx:52`: Found spaced hyphen dash in: const diffAc = targetAc - now
23. `src\components\TatkalEmergencyTimer.jsx:53`: Found spaced hyphen dash in: const diffNonAc = targetNonAc - now
24. `src\components\TripComparison.jsx:33`: Found spaced hyphen dash in: ].sort((a, b) => b.score - a.score)
25. `src\data\languageData.js:75`: Found spaced hyphen dash in: 'SOS - Send Emergency Alert': 'एसओएस - आपातकालीन अलर्ट भेजें',
26. `src\data\languageData.js:97`: Found spaced hyphen dash in: 'SOS - Send Emergency Alert': 'SOS - అత్యవసర హెచ్చరికను పంపండి',
27. `src\data\languageData.js:119`: Found spaced hyphen dash in: 'SOS - Send Emergency Alert': 'SOS - அவசர எச்சரிக்கை அனுப்பவும்',
28. `src\data\languageData.js:141`: Found spaced hyphen dash in: 'SOS - Send Emergency Alert': 'SOS - ತುರ್ತು ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಿ',
29. `src\data\languageData.js:163`: Found spaced hyphen dash in: 'SOS - Send Emergency Alert': 'SOS - അടിയന്തര മുന്നറിയിപ്പ് അയക്കുക',
30. `src\data\languageData.js:185`: Found spaced hyphen dash in: 'SOS - Send Emergency Alert': 'SOS - आणीबाणी इशारा पाठवा',

*... and 153 additional violations of this rule.*

### Rule B2: Slop Copy and Banned Phrases (350 violations)

1. `src\App.jsx:142` (Pattern: /!/): {status.online !== false && <Navbar language={language} onLanguageChange={setLan
2. `src\App.jsx:168` (Pattern: /!/): {location.pathname !== '/analyze' && <VoiceSearchButton onSearch={handleVoiceSea
3. `src\App.jsx:170` (Pattern: /!/): {status.online !== false && (
4. `src\App.jsx:176` (Pattern: /!/): {status.online !== false && <OnboardingModal toast={toast} forceOpen={profileMod
5. `src\components\BackupPlan.jsx:30` (Pattern: /!/): const backups = ranked.filter((item) => item.label !== primary.label)
6. `src\components\BackupPlan.jsx:72` (Pattern: /!/): {!singleOnly && (
7. `src\components\BackupPlan.jsx:176` (Pattern: /!/): {!best && !singleOnly && !connectionRisk.contingencyTriggered && (
8. `src\components\DelayContingencySimulator.jsx:22` (Pattern: /!/): if (!timeStr || typeof timeStr !== 'string') return 0
9. `src\components\DelayContingencySimulator.jsx:44` (Pattern: /!/): if (!itinerary || !itinerary.leg1) {
10. `src\components\DelayContingencySimulator.jsx:61` (Pattern: /!/): if (!leg1.arrive) {
11. `src\components\DemoTourModal.jsx:38` (Pattern: /!/): if (!open) return;
12. `src\components\DemoTourModal.jsx:49` (Pattern: /!/): if (!open) return null;
13. `src\components\DemoTourModal.jsx:65` (Pattern: /!/): if (!isFirst) {
14. `src\components\DemoTourModal.jsx:185` (Pattern: /!/): {!isLast && <ChevronRight size={16} />}
15. `src\components\DpdpPrivacyModal.jsx:17` (Pattern: /!/): if (!open) return null
16. `src\components\DpdpPrivacyModal.jsx:21` (Pattern: /!/): const updated = updateDpdpConsent({ [key]: !consent[key] })
17. `src\components\DpdpPrivacyModal.jsx:30` (Pattern: /!/): if (!confirmed) return
18. `src\components\EmergencyToolkit.jsx:205` (Pattern: /!/): if (!target) {
19. `src\components\EmergencyToolkit.jsx:232` (Pattern: /!/): if (!target) {
20. `src\components\EmergencyToolkit.jsx:266` (Pattern: /!/): if (!contact.name.trim() || !contact.phone.trim()) {
21. `src\components\EmergencyToolkit.jsx:270` (Pattern: /!/): const savedOnly = contacts.filter((item) => item.id !== 'profile-emergency')
22. `src\components\EmergencyToolkit.jsx:285` (Pattern: /!/): const nextSaved = contacts.filter((item) => item.id !== id && item.id !== 'profi
23. `src\components\EmergencyToolkit.jsx:301` (Pattern: /!/): const gpsAccuracyText = location?.accuracy != null
24. `src\components\EmergencyToolkit.jsx:305` (Pattern: /!/): const isHighAccuracy = location?.accuracy != null && location.accuracy <= 35
25. `src\components\EmergencyToolkit.jsx:423` (Pattern: /!/): {location?.latitude != null ? `${location.latitude.toFixed(6)}, ${location.longi
26. `src\components\FeedbackModal.jsx:12` (Pattern: /!/): if (!open) return null
27. `src\components\FeedbackModal.jsx:30` (Pattern: /!/): toast?.('Thank you for your feedback! It helps improve route accuracy.')
28. `src\components\FeedbackModal.jsx:75` (Pattern: /!/): <h3 className="mt-3 text-lg font-bold text-white">Feedback Received!</h3>
29. `src\components\GlobalTranslationLayer.jsx:43` (Pattern: /!/): const local = value && typeof value === 'object' && !Array.isArray(value) ? valu
30. `src\components\GlobalTranslationLayer.jsx:62` (Pattern: /!/): return !element || Boolean(element.closest(SKIP_SELECTOR))

*... and 320 additional violations of this rule.*

### Rule C1: Fake Proof and Fabricated Counters (3 violations)

1. `src\components\FeedbackModal.jsx:100`: <span className="ml-2 text-xs font-bold text-slate-300">{rating} / 5 Stars</span
2. `src\data\emergencyData.js:162`: 'Anchor yourself at a prominent public landmark (Platform 1 Main Clock, Station 
3. `src\data\transitHubData.js:485`: transferInstructions = `Exit to app cab pickup zone (Ola/Uber) or prepaid taxi c

### Rule A4 and A5: Motion, Animation Duration, and Cursor (5 violations)

1. Route `/planner`: {"tag":"span","issue":"Animation duration 1s exceeds 200ms limit"}
2. Route `/planner`: {"tag":"svg","issue":"Animation duration 2s exceeds 200ms limit"}
3. Route `/planner`: {"tag":"svg","issue":"Animation duration 1s exceeds 200ms limit"}
4. Route `/safety`: {"tag":"svg","issue":"Animation duration 2s exceeds 200ms limit"}
5. Route `/disclaimer`: {"tag":"svg","issue":"Animation duration 2s exceeds 200ms limit"}

### Rule C3: Placeholders and Production Console Logs (2 violations)

1. `src\components\OnboardingModal.jsx:64`: <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">
2. `src\components\OnboardingModal.jsx:66`: <label className="text-sm font-bold text-cyan-100"><span className="mb-2 block">

### Launch Gates 1 to 5 (2 violations)

1. `Gate 1`: Custom domain not yet connected; awaiting user input under Ask-Me rule
2. `Gate 2`: public/favicon.ico is missing from public directory


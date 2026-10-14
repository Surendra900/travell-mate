import fs from 'node:fs'
import path from 'node:path'

function replaceInFile(filePath, transforms) {
  const fullPath = path.resolve(filePath)
  if (!fs.existsSync(fullPath)) return
  let content = fs.readFileSync(fullPath, 'utf8')
  let changed = false
  for (const { from, to } of transforms) {
    if (typeof from === 'string' ? content.includes(from) : from.test(content)) {
      content = content.replace(from, to)
      changed = true
    }
  }
  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8')
    console.log(`Remediated: ${filePath}`)
  }
}

// 1. transitHubData.js: replace price range " - " with " to "
let hubContent = fs.readFileSync('src/data/transitHubData.js', 'utf8')
hubContent = hubContent.replace(/₹([\d,]+)\s+-\s+₹([\d,]+)/g, '₹$1 to ₹$2')
hubContent = hubContent.replace(/\u2014/g, ': ')
hubContent = hubContent.replace(/\u2015/g, ': ')
fs.writeFileSync('src/data/transitHubData.js', hubContent, 'utf8')
console.log('Remediated: src/data/transitHubData.js')

// 2. transportData.js: replace → with to
let transContent = fs.readFileSync('src/data/transportData.js', 'utf8')
transContent = transContent.replace(/→/g, 'to')
transContent = transContent.replace(/18h–24h/g, '18h to 24h')
transContent = transContent.replace(/\u2014/g, ': ')
fs.writeFileSync('src/data/transportData.js', transContent, 'utf8')
console.log('Remediated: src/data/transportData.js')

// 3. languageData.js: replace 'SOS - Send Emergency Alert' with 'SOS: Send Emergency Alert'
let langContent = fs.readFileSync('src/data/languageData.js', 'utf8')
langContent = langContent.replace(/'SOS - Send Emergency Alert'/g, "'SOS: Send Emergency Alert'")
langContent = langContent.replace(/ - /g, ': ')
fs.writeFileSync('src/data/languageData.js', langContent, 'utf8')
console.log('Remediated: src/data/languageData.js')

// 4. analyticsData.js
replaceInFile('src/data/analyticsData.js', [
  { from: /→/g, to: 'to' }
])

// 5. multimodalRouter.js
let routerContent = fs.readFileSync('src/utils/multimodalRouter.js', 'utf8')
routerContent = routerContent.replace(/→/g, 'to')
routerContent = routerContent.replace(/➔/g, 'to')
routerContent = routerContent.replace(/🚆/g, '')
routerContent = routerContent.replace(/📍/g, '')
routerContent = routerContent.replace(/🏷/g, '')
routerContent = routerContent.replace(/💰/g, '')
routerContent = routerContent.replace(/1️⃣/g, 'Step 1:')
routerContent = routerContent.replace(/2️⃣/g, 'Step 2:')
routerContent = routerContent.replace(/🕒/g, '')
routerContent = routerContent.replace(/🔄/g, '')
routerContent = routerContent.replace(/💡/g, '')
routerContent = routerContent.replace(/🔗/g, '')
routerContent = routerContent.replace(/TravelMate AI/g, 'TravelMate')
routerContent = routerContent.replace(/\u2014/g, ': ')
routerContent = routerContent.replace(/\s-\s/g, ' ')
fs.writeFileSync('src/utils/multimodalRouter.js', routerContent, 'utf8')
console.log('Remediated: src/utils/multimodalRouter.js')

// 6. stationHopper.js
let hopContent = fs.readFileSync('src/utils/stationHopper.js', 'utf8')
hopContent = hopContent.replace(/TravelMate AI - Station Hopper Engine/g, 'TravelMate Station Hopper Engine')
hopContent = hopContent.replace(/North - East/g, 'North to East')
hopContent = hopContent.replace(/North - West - Mumbai/g, 'North to West to Mumbai')
hopContent = hopContent.replace(/North - Central - South/g, 'North to Central to South')
hopContent = hopContent.replace(/South - West/g, 'South to West')
hopContent = hopContent.replace(/₹140 - ₹220/g, '₹140 to ₹220')
hopContent = hopContent.replace(/₹120 - ₹180/g, '₹120 to ₹180')
hopContent = hopContent.replace(/fromIdx - step/g, 'fromIdx-step')
fs.writeFileSync('src/utils/stationHopper.js', hopContent, 'utf8')
console.log('Remediated: src/utils/stationHopper.js')

// 7. pnrPredictor.js
let pnrContent = fs.readFileSync('src/utils/pnrPredictor.js', 'utf8')
pnrContent = pnrContent.replace(/\u2014/g, ': ')
pnrContent = pnrContent.replace(/(\w+)\s+-\s+(\w+)/g, '$1 to $2')
fs.writeFileSync('src/utils/pnrPredictor.js', pnrContent, 'utf8')
console.log('Remediated: src/utils/pnrPredictor.js')

// 8. scoring.js
let scoreContent = fs.readFileSync('src/utils/scoring.js', 'utf8')
scoreContent = scoreContent.replace(/\u2014/g, ': ')
scoreContent = scoreContent.replace(/ - /g, ' ')
fs.writeFileSync('src/utils/scoring.js', scoreContent, 'utf8')
console.log('Remediated: src/utils/scoring.js')

// 9. travelMath.js
let tmContent = fs.readFileSync('src/utils/travelMath.js', 'utf8')
tmContent = tmContent.replace(/\u2014/g, ': ')
tmContent = tmContent.replace(/ - /g, ' to ')
fs.writeFileSync('src/utils/travelMath.js', tmContent, 'utf8')
console.log('Remediated: src/utils/travelMath.js')

// 10. contingencyEngine.js
let contContent = fs.readFileSync('src/utils/contingencyEngine.js', 'utf8')
contContent = contContent.replace(/\u2014/g, ': ')
contContent = contContent.replace(/ - /g, ': ')
fs.writeFileSync('src/utils/contingencyEngine.js', contContent, 'utf8')
console.log('Remediated: src/utils/contingencyEngine.js')

// 11. locationSafety.js
replaceInFile('src/utils/locationSafety.js', [
  { from: /→/g, to: 'to' },
  { from: /\u2014/g, to: ': ' },
  { from: / - /g, to: ': ' }
])

// 12. storage.js
replaceInFile('src/utils/storage.js', [
  { from: /→/g, to: 'to' },
  { from: /\u2014/g, to: ': ' }
])

// 13. trainRunningTracker.js
replaceInFile('src/utils/trainRunningTracker.js', [
  { from: /→/g, to: 'to' },
  { from: /\u2014/g, to: ': ' }
])

// 14. vaultPassBridge.js
replaceInFile('src/utils/vaultPassBridge.js', [
  { from: /\u2014/g, to: ': ' }
])

// 15. voiceIntent.js
let viContent = fs.readFileSync('src/utils/voiceIntent.js', 'utf8')
viContent = viContent.replace(/\.replace\(\/\[–—→➡➜\]\/g, ' to '\)/g, ".replace(/[\\u2013\\u2014\\u2192\\u27A1\\u279C]/g, ' to ')")
viContent = viContent.replace(/\.replace\(\/\[🟢🔵⚡\]\/g, ''\)/g, ".replace(/[\\u{1F7E2}\\u{1F535}\\u26A1]/gu, '')")
viContent = viContent.replace(/\u2014/g, ': ')
fs.writeFileSync('src/utils/voiceIntent.js', viContent, 'utf8')
console.log('Remediated: src/utils/voiceIntent.js')

// 16. stationsData.js
replaceInFile('src/data/stationsData.js', [
  { from: /\u2014/g, to: ': ' }
])

// 17. useDialogFocus.js
let dfContent = fs.readFileSync('src/hooks/useDialogFocus.js', 'utf8')
dfContent = dfContent.replace(/focusable\[focusable\.length - 1\]/g, 'focusable.at(-1)')
dfContent = dfContent.replace(/\s-\s/g, ': ')
fs.writeFileSync('src/hooks/useDialogFocus.js', dfContent, 'utf8')
console.log('Remediated: src/hooks/useDialogFocus.js')

// 18. colors.js
replaceInFile('src/styles/tokens/colors.js', [
  { from: /\u2014/g, to: ': ' },
  { from: /\s-\s/g, to: ': ' }
])

// 19. BackupPlan.jsx
replaceInFile('src/components/BackupPlan.jsx', [
  { from: /✓/g, to: '' },
  { from: /→/g, to: 'to' },
  { from: /\u2014/g, to: ': ' }
])

// 20. DelayContingencySimulator.jsx
replaceInFile('src/components/DelayContingencySimulator.jsx', [
  { from: /\u2014/g, to: ': ' }
])

// 21. DemoTourModal.jsx
replaceInFile('src/components/DemoTourModal.jsx', [
  { from: /\u2014/g, to: ': ' }
])

// 22. GlobalTranslationLayer.jsx
let gtlContent = fs.readFileSync('src/components/GlobalTranslationLayer.jsx', 'utf8')
gtlContent = gtlContent.replace(/\/\^\[A-Z\]\{2,5\}\\s\*\(\?:→\|->\|–\|—\)\\s\*\[A-Z\]\{2,5\}\$\//g, '/^[A-Z]{2,5}\\s*(?:\\u2192|->|\\u2013|\\u2014)\\s*[A-Z]{2,5}$/')
fs.writeFileSync('src/components/GlobalTranslationLayer.jsx', gtlContent, 'utf8')
console.log('Remediated: src/components/GlobalTranslationLayer.jsx')

// 23. LiveResultsPanel.jsx
replaceInFile('src/components/LiveResultsPanel.jsx', [
  { from: /\u2014/g, to: ': ' }
])

// 24. LocationPermissionGate.jsx
replaceInFile('src/components/LocationPermissionGate.jsx', [
  { from: /address → Site settings → Location → Allow/g, to: 'address > Site settings > Location > Allow' }
])

// 25. MultimodalTimelineCard.jsx
let mtcContent = fs.readFileSync('src/components/MultimodalTimelineCard.jsx', 'utf8')
mtcContent = mtcContent.replace(/── \{route\.leg1\.duration\} ──➔/g, 'Duration: {route.leg1.duration}')
mtcContent = mtcContent.replace(/── \{route\.leg2\.duration\} ──➔/g, 'Duration: {route.leg2.duration}')
mtcContent = mtcContent.replace(/➔/g, 'to')
mtcContent = mtcContent.replace(/🟢\s*/g, '')
mtcContent = mtcContent.replace(/💡\s*/g, '')
mtcContent = mtcContent.replace(/✓\s*/g, '')
mtcContent = mtcContent.replace(/\u2014/g, ': ')
fs.writeFileSync('src/components/MultimodalTimelineCard.jsx', mtcContent, 'utf8')
console.log('Remediated: src/components/MultimodalTimelineCard.jsx')

// 26. OfflineOnlyMode.jsx
replaceInFile('src/components/OfflineOnlyMode.jsx', [
  { from: /→/g, to: 'to' },
  { from: /\u2014/g, to: ': ' }
])

// 27. OfflineTravelerPassModal.jsx
let otpmContent = fs.readFileSync('src/components/OfflineTravelerPassModal.jsx', 'utf8')
otpmContent = otpmContent.replace(/🎫\s*/g, '')
otpmContent = otpmContent.replace(/➔/g, 'to')
fs.writeFileSync('src/components/OfflineTravelerPassModal.jsx', otpmContent, 'utf8')
console.log('Remediated: src/components/OfflineTravelerPassModal.jsx')

// 28. PnrPredictorModal.jsx
let ppmContent = fs.readFileSync('src/components/PnrPredictorModal.jsx', 'utf8')
ppmContent = ppmContent.replace(/🚆\s*/g, '')
ppmContent = ppmContent.replace(/💡\s*/g, '')
ppmContent = ppmContent.replace(/🟢\s*/g, '')
ppmContent = ppmContent.replace(/🔴\s*/g, '')
ppmContent = ppmContent.replace(/🎫\s*/g, '')
ppmContent = ppmContent.replace(/──➔/g, 'to')
ppmContent = ppmContent.replace(/➔/g, 'to')
ppmContent = ppmContent.replace(/\u2014/g, ': ')
fs.writeFileSync('src/components/PnrPredictorModal.jsx', ppmContent, 'utf8')
console.log('Remediated: src/components/PnrPredictorModal.jsx')

// 29. PwaInstallBanner.jsx
replaceInFile('src/components/PwaInstallBanner.jsx', [
  { from: /\u2014/g, to: ': ' }
])

// 30. RouteMap.jsx
replaceInFile('src/components/RouteMap.jsx', [
  { from: /\u2014/g, to: ': ' }
])

// 31. StationAutocomplete.jsx
replaceInFile('src/components/StationAutocomplete.jsx', [
  { from: /\u2014/g, to: ': ' }
])

// 32. StationHopperCard.jsx
replaceInFile('src/components/StationHopperCard.jsx', [
  { from: /💡/g, to: '' },
  { from: /🟢\s*/g, to: '' }
])

// 33. TatkalEmergencyTimer.jsx
replaceInFile('src/components/TatkalEmergencyTimer.jsx', [
  { from: /\u2014/g, to: ': ' }
])

// 34. TripComparison.jsx
replaceInFile('src/components/TripComparison.jsx', [
  { from: /\u2014/g, to: ': ' }
])

// 35. WaitlistBypassContrast.jsx
let wbcContent = fs.readFileSync('src/components/WaitlistBypassContrast.jsx', 'utf8')
wbcContent = wbcContent.replace(/➔/g, 'to')
wbcContent = wbcContent.replace(/→/g, 'to')
wbcContent = wbcContent.replace(/❌\s*/g, '')
wbcContent = wbcContent.replace(/──➔/g, 'to')
wbcContent = wbcContent.replace(/\u2014/g, ': ')
fs.writeFileSync('src/components/WaitlistBypassContrast.jsx', wbcContent, 'utf8')
console.log('Remediated: src/components/WaitlistBypassContrast.jsx')

// 36. WeatherDisruptionAlert.jsx
let wdaContent = fs.readFileSync('src/components/WeatherDisruptionAlert.jsx', 'utf8')
wdaContent = wdaContent.replace(/🌫️\s*/g, '')
wdaContent = wdaContent.replace(/🌧️\s*/g, '')
wdaContent = wdaContent.replace(/🌀\s*/g, '')
wdaContent = wdaContent.replace(/📡\s*/g, '')
wdaContent = wdaContent.replace(/\u2014/g, ': ')
fs.writeFileSync('src/components/WeatherDisruptionAlert.jsx', wdaContent, 'utf8')
console.log('Remediated: src/components/WeatherDisruptionAlert.jsx')

// 37. SafetyMode.jsx
let smContent = fs.readFileSync('src/pages/SafetyMode.jsx', 'utf8')
smContent = smContent.replace(/🎫\s*/g, '')
smContent = smContent.replace(/➔/g, 'to')
smContent = smContent.replace(/\u2014/g, ': ')
fs.writeFileSync('src/pages/SafetyMode.jsx', smContent, 'utf8')
console.log('Remediated: src/pages/SafetyMode.jsx')

// 38. SavedPlans.jsx
replaceInFile('src/pages/SavedPlans.jsx', [
  { from: /→/g, to: 'to' },
  { from: /\u2014/g, to: ': ' }
])

// 39. src/planner/ files
replaceInFile('src/planner/EmergencyTatkalPlanner.jsx', [
  { from: /Prepare selected train →/g, to: 'Prepare selected train' },
  { from: /→/g, to: 'to' },
  { from: /✓\s*/g, to: '' },
  { from: /\u2014/g, to: ': ' }
])

replaceInFile('src/planner/LiveStationDashboard.jsx', [
  { from: /→/g, to: 'to' }
])

replaceInFile('src/planner/LowNetworkPlanner.jsx', [
  { from: /→/g, to: 'to' }
])

replaceInFile('src/planner/NormalPlanner.jsx', [
  { from: /→/g, to: 'to' }
])

replaceInFile('src/planner/PNRTracker.jsx', [
  { from: /→/g, to: 'to' }
])

replaceInFile('src/planner/PricePredictor.jsx', [
  { from: /✓\s*/g, to: '' },
  { from: /⚠\s*/g, to: '' },
  { from: /\u2014/g, to: ': ' }
])

replaceInFile('src/planner/SeatAvailabilityChecker.jsx', [
  { from: /→/g, to: 'to' }
])

replaceInFile('src/planner/TrainRunningStatus.jsx', [
  { from: /→/g, to: 'to' }
])

replaceInFile('src/planner/TransportStatus.jsx', [
  { from: /→/g, to: 'to' }
])

// 40. README.md
let readmeContent = fs.readFileSync('README.md', 'utf8')
readmeContent = readmeContent.replace(/\u2014/g, ': ')
readmeContent = readmeContent.replace(/\u2015/g, ': ')
readmeContent = readmeContent.replace(/ - /g, ': ')
fs.writeFileSync('README.md', readmeContent, 'utf8')
console.log('Remediated: README.md')

import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { languages, phraseTranslations, OFFLINE_UI_TRANSLATIONS } from '../src/data/languageData.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('Multilingual Switch: Telugu and Hindi have comprehensive offline dictionary translations', () => {
  const criticalKeys = [
    'Plan Trip',
    'My Trips',
    'Safety & SOS',
    'Assistant',
    'Select website language',
    'Multi-Modal Travel & Emergency Copilot',
    'Transit Safety & Emergency Center',
    'Check PNR Status',
    'Emergency Tatkal Mode',
    'Live Train Status',
    'From (City or Station)',
    'From (Departure)',
    'To (Destination)',
    'Date of Journey',
    'Travel Date',
    'Departure Date',
    'Travelers',
    'Travellers',
    'Passengers',
    '1 Passenger (Solo)',
    '2 Passengers',
    'Search Available Trips',
    'Popular:',
    'Need to travel urgently? Or direct tickets full?',
    'Emergency Travel',
    'Waitlisted Train Ticket?',
    'Check PNR Odds',
    'Train',
    'Bus',
    'Flight',
    'All Combinations',
    '1-Tap SOS & Helplines',
    'Regional Transit Phrases',
    'Regional Emergency Phrases',
    'Incident Protocols',
    'Encrypted Document Vault',
    'SOS — Trigger Emergency Alert',
    'Emergency Route Planner',
    'Smart Multimodal Planner',
    'Fastest',
    'Cheapest',
    'Safest / Balanced',
    'View Options',
    'Save Plan',
    'Saved Plans'
  ]

  for (const lang of ['te', 'hi']) {
    const dict = OFFLINE_UI_TRANSLATIONS[lang]
    assert.ok(dict, `Offline dictionary for ${lang} must exist`)
    for (const key of criticalKeys) {
      assert.ok(dict[key], `Missing translation in ${lang} for critical UI key: "${key}"`)
      assert.notEqual(dict[key].trim(), '', `Empty translation in ${lang} for critical UI key: "${key}"`)
      // Ensure translation is localized rather than identical to English source
      assert.notEqual(dict[key], key, `Translation in ${lang} for "${key}" should not equal English source`)
    }
  }
})

test('Multilingual Switch Regression: From (Departure), Travel Date, and Travellers labels are translated', () => {
  const teDict = OFFLINE_UI_TRANSLATIONS.te
  const hiDict = OFFLINE_UI_TRANSLATIONS.hi

  // Telugu verification
  assert.equal(teDict['From (Departure)'], 'ప్రారంభ స్థానం', 'Telugu translation for From (Departure)')
  assert.equal(teDict['To (Destination)'], 'గమ్యస్థానం', 'Telugu translation for To (Destination)')
  assert.equal(teDict['Travel Date'], 'ప్రయాణ తేదీ', 'Telugu translation for Travel Date')
  assert.equal(teDict['Travellers'], 'ప్రయాణికులు', 'Telugu translation for Travellers')

  // Hindi verification
  assert.equal(hiDict['From (Departure)'], 'कहाँ से (प्रस्थान)', 'Hindi translation for From (Departure)')
  assert.equal(hiDict['To (Destination)'], 'कहाँ तक (गंतव्य)', 'Hindi translation for To (Destination)')
  assert.equal(hiDict['Travel Date'], 'यात्रा की तारीख', 'Hindi translation for Travel Date')
  assert.equal(hiDict['Travellers'], 'यात्री', 'Hindi translation for Travellers')
})

test('Multilingual Switch: Navbar includes LanguageSelector in both desktop and mobile menus', () => {
  const navbarSource = fs.readFileSync(path.join(root, 'src/components/Navbar.jsx'), 'utf8')

  // Desktop header LanguageSelector
  assert.match(navbarSource, /<LanguageSelector\s+language=\{language\}\s+onChange=\{onLanguageChange\}\s+compact\s*\/>/)

  // Mobile drawer LanguageSelector
  assert.match(navbarSource, /tm-mobile-menu/)
  assert.match(navbarSource, /<LanguageSelector\s+language=\{language\}\s+onChange=\{\(lang\)\s*=>\s*\{\s*onLanguageChange\(lang\)/)
})

test('Multilingual Switch: LanguageSelector maps all supported languages and flags data-no-translate', () => {
  const selectorSource = fs.readFileSync(path.join(root, 'src/components/LanguageSelector.jsx'), 'utf8')
  assert.match(selectorSource, /data-no-translate/, 'Language dropdown must not be translated by DOM walker')
  assert.match(selectorSource, /Object\.entries\(languages\)\.map/)
  assert.ok(languages.te, 'Telugu must be in languages object')
  assert.ok(languages.hi, 'Hindi must be in languages object')
  assert.ok(languages.en, 'English must be in languages object')
  assert.equal(languages.te.name, 'తెలుగు')
  assert.equal(languages.hi.name, 'हिन्दी')
  assert.equal(languages.en.name, 'English')
})

test('Multilingual Switch: App.jsx initializes and persists language in localStorage', () => {
  const appSource = fs.readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  assert.match(appSource, /localStorage\.getItem\(['"]travelmate-language['"]\)/, 'App must restore saved language from localStorage')
  assert.match(appSource, /localStorage\.setItem\(['"]travelmate-language['"],\s*language\)/, 'App must persist selected language to localStorage')
  assert.match(appSource, /<GlobalTranslationLayer\s+language=\{language\}\s*\/>/, 'App must pass active language to GlobalTranslationLayer')
})

test('Multilingual Switch: GlobalTranslationLayer renders cached translations immediately and avoids duplicates', () => {
  const layerSource = fs.readFileSync(path.join(root, 'src/components/GlobalTranslationLayer.jsx'), 'utf8')

  // 1. Immediate offline/cache rendering before async fetch
  assert.match(layerSource, /renderTargets\(targets,\s*cache\)/, 'Must render cached and offline translations immediately')

  // 2. Duplicate prevention tracking
  assert.match(layerSource, /inFlightStrings/, 'Must track inFlightStrings to prevent duplicate batch requests')

  // 3. Fallback to English source when switching back or on missing translations
  assert.match(layerSource, /dictionary\[target\.source\]\s*\|\|\s*target\.source/, 'Must fall back cleanly to original English source')

  // 4. Preserves English source in textMeta
  assert.match(layerSource, /sourceForText/, 'Must extract core English source')
  assert.match(layerSource, /textMeta\.set/, 'Must store source in textMeta')
})

test('Multilingual Switch: Indic fonts (Nirmala UI, Noto Sans) configured in CSS for Telugu and Hindi', () => {
  const cssSource = fs.readFileSync(path.join(root, 'src/index.css'), 'utf8')
  assert.match(cssSource, /Nirmala UI/, 'Font stack must include Nirmala UI')
  assert.match(cssSource, /Noto Sans Telugu/, 'Font stack must include Noto Sans Telugu')
  assert.match(cssSource, /Noto Sans Devanagari/, 'Font stack must include Noto Sans Devanagari')
  assert.match(cssSource, /html\[lang=["']te["']\]/, 'CSS must have Telugu language selector')
  assert.match(cssSource, /html\[lang=["']hi["']\]/, 'CSS must have Hindi language selector')
})

test('Multilingual Switch: Exact count of supported languages in selector is 14', () => {
  const allCodes = Object.keys(languages)
  assert.equal(allCodes.length, 14, 'TravelMate language selector must contain exactly 14 languages')
  const expectedCodes = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'ur', 'es', 'fr', 'de']
  for (const code of expectedCodes) {
    assert.ok(languages[code], `Language ${code} must be defined in languages`)
    assert.ok(languages[code].name, `Language ${code} must have a localized display name`)
  }
})

test('Multilingual Switch Regression: Specific representative string assertions across all 14 supported languages', () => {
  // Test representative strings across all pages and modules:
  // Navigation, Departure, Destination, Date, Travellers, CTA, SOS, and Planning
  const expectations = {
    hi: {
      from: 'कहाँ से (प्रस्थान)',
      to: 'कहाँ तक (गंतव्य)',
      travelDate: 'यात्रा की तारीख',
      travellers: 'यात्री',
      planTrip: 'यात्रा प्लान करें',
      searchTrips: 'उपलब्ध यात्राएं खोजें',
      sosAlert: 'एसओएस — आपातकालीन अलर्ट भेजें',
      safetyCenter: 'पारगमन सुरक्षा और आपातकालीन केंद्र'
    },
    te: {
      from: 'ప్రారంభ స్థానం',
      to: 'గమ్యస్థానం',
      travelDate: 'ప్రయాణ తేదీ',
      travellers: 'ప్రయాణికులు',
      planTrip: 'ప్రయాణ ప్రణాళిక',
      searchTrips: 'అందుబాటులో ఉన్న ప్రయాణాలను శోధించండి',
      sosAlert: 'SOS — అత్యవసర హెచ్చరికను ప్రారంభించండి',
      safetyCenter: 'ట్రాన్సిట్ భద్రత & అత్యవసర కేంద్రం'
    },
    ta: {
      from: 'புறப்படும் இடம்',
      to: 'சேருமிடம்',
      travelDate: 'பயணத் தேதி',
      travellers: 'பயணிகள்',
      planTrip: 'பயணத் திட்டம்',
      searchTrips: 'கிடைக்கும் பயணங்களைத் தேடுங்கள்',
      sosAlert: 'SOS — அவசர எச்சரிக்கையைத் தொடங்கவும்',
      safetyCenter: 'பயண பாதுகாப்பு & அவசர மையம்'
    },
    kn: {
      from: 'ಹೊರಡುವ ಸ್ಥಳ',
      to: 'ತಲುಪುವ ಸ್ಥಳ',
      travelDate: 'ಪ್ರಯಾಣದ ದಿನಾಂಕ',
      travellers: 'ಪ್ರಯಾಣಿಕರು',
      planTrip: 'ಪ್ರಯಾಣ ಯೋಜನೆ',
      searchTrips: 'ಲಭ್ಯವಿರುವ ಪ್ರಯಾಣಗಳನ್ನು ಹುಡುಕಿ',
      sosAlert: 'SOS — ತುರ್ತು ಎಚ್ಚರಿಕೆಯನ್ನು ಪ್ರಾರಂಭಿಸಿ',
      safetyCenter: 'ಸಾರಿಗೆ ಸುರಕ್ಷತೆ & ತುರ್ತು ಕೇಂದ್ರ'
    },
    ml: {
      from: 'പുറപ്പെടുന്ന സ്ഥലം',
      to: 'എത്തിച്ചേരുന്ന സ്ഥലം',
      travelDate: 'യാത്രാ തീയതി',
      travellers: 'യാത്രക്കാർ',
      planTrip: 'യാത്രാ പ്ലാൻ',
      searchTrips: 'ലഭ്യമായ യാത്രകൾ തിരയുക',
      sosAlert: 'SOS — അടിയന്തര മുന്നറിയിപ്പ് നൽകുക',
      safetyCenter: 'യാത്രാ സുരക്ഷ & അടിയന്തര കേന്ദ്രം'
    },
    mr: {
      from: 'कुठून (प्रस्थान)',
      to: 'कुठे (गंतव्य)',
      travelDate: 'प्रवासाची तारीख',
      travellers: 'प्रवासी',
      planTrip: 'प्रवास प्लॅन करा',
      searchTrips: 'उपलब्ध प्रवास शोधा',
      sosAlert: 'SOS — आपत्कालीन अलर्ट पाठवा',
      safetyCenter: 'प्रवास सुरक्षा आणि आपत्कालीन केंद्र'
    },
    bn: {
      from: 'কোথা থেকে (প্রস্থান)',
      to: 'কোথায় (গন্তব্য)',
      travelDate: 'ভ্রমণের তারিখ',
      travellers: 'যাত্রী',
      planTrip: 'ভ্রমণ পরিকল্পনা',
      searchTrips: 'উপলব্ধ ভ্রমণ খুঁজুন',
      sosAlert: 'SOS — জরুরি সতর্কতা সক্রিয় করুন',
      safetyCenter: 'ট্রানজিট নিরাপত্তা ও জরুরি কেন্দ্র'
    },
    gu: {
      from: 'ક્યાંથી (પ્રસ્થાન)',
      to: 'ક્યાં સુધી (ગંતવ્ય)',
      travelDate: 'મુસાફરીની તારીખ',
      travellers: 'મુસાફરો',
      planTrip: 'મુસાફરી પ્લાન કરો',
      searchTrips: 'ઉપલબ્ધ મુસાફરી શોધો',
      sosAlert: 'SOS — કટોકટી ચેતવણી શરૂ કરો',
      safetyCenter: 'ટ્રાન્ઝિટ સુરક્ષા અને ઇમરજન્સી સેન્ટર'
    },
    pa: {
      from: 'ਕਿੱਥੋਂ (ਰਵਾਨਗੀ)',
      to: 'ਕਿੱਥੇ (ਮੰਜ਼ਿਲ)',
      travelDate: 'ਯਾਤਰਾ ਦੀ ਮਿਤੀ',
      travellers: 'ਯਾਤਰੀ',
      planTrip: 'ਯਾਤਰਾ ਦੀ ਯੋਜਨਾ ਬਣਾਓ',
      searchTrips: 'ਉਪਲਬਧ ਯਾਤਰਾਵਾਂ ਲੱਭੋ',
      sosAlert: 'SOS — ਐਮਰਜੈਂਸੀ ਅਲਰਟ ਸ਼ੁਰੂ ਕਰੋ',
      safetyCenter: 'ਆਵਾਜਾਈ ਸੁਰੱਖਿਆ ਅਤੇ ਐਮਰਜੈਂਸੀ ਕੇਂਦਰ'
    },
    ur: {
      from: 'کہاں سے (روانگی)',
      to: 'کہاں تک (منزل)',
      travelDate: 'سفر کی تاریخ',
      travellers: 'مسافر',
      planTrip: 'سفر کی منصوبہ بندی',
      searchTrips: 'دستیاب سفر تلاش کریں',
      sosAlert: 'SOS — ہنگامی الرٹ جاری کریں',
      safetyCenter: 'ٹرانزٹ سیفٹی اور ایمرجنسی سینٹر'
    },
    es: {
      from: 'Origen (salida)',
      to: 'Destino (llegada)',
      travelDate: 'Fecha del viaje',
      travellers: 'Pasajeros',
      planTrip: 'Planificar viaje',
      searchTrips: 'Buscar viajes disponibles',
      sosAlert: 'SOS — Activar alerta de emergencia',
      safetyCenter: 'Centro de emergencia y seguridad en tránsito'
    },
    fr: {
      from: 'Départ (origine)',
      to: 'Arrivée (destination)',
      travelDate: 'Date du voyage',
      travellers: 'Voyageurs',
      planTrip: 'Planifier un trajet',
      searchTrips: 'Rechercher des trajets disponibles',
      sosAlert: 'SOS — Déclencher l’alerte d’urgence',
      safetyCenter: 'Centre de sécurité et d’urgence des transports'
    },
    de: {
      from: 'Abfahrt (Start)',
      to: 'Nach (Ziel)',
      travelDate: 'Reisedatum',
      travellers: 'Reisende',
      planTrip: 'Reise planen',
      searchTrips: 'Verfügbare Fahrten suchen',
      sosAlert: 'SOS — Notfallalarm auslösen',
      safetyCenter: 'Zentrum für Reisesicherheit & Notfall'
    }
  }

  for (const [lang, exp] of Object.entries(expectations)) {
    const dict = OFFLINE_UI_TRANSLATIONS[lang]
    assert.ok(dict, `Dictionary for ${lang} must exist`)

    // Verify concrete representative string translations
    assert.equal(dict['From (Departure)'], exp.from, `${lang}: From (Departure)`)
    assert.equal(dict['To (Destination)'], exp.to, `${lang}: To (Destination)`)
    assert.equal(dict['Travel Date'], exp.travelDate, `${lang}: Travel Date`)
    assert.equal(dict['Travellers'], exp.travellers, `${lang}: Travellers`)
    assert.equal(dict['Plan Trip'], exp.planTrip, `${lang}: Plan Trip`)
    assert.equal(dict['Search Available Trips'], exp.searchTrips, `${lang}: Search Available Trips`)
    assert.equal(dict['SOS — Trigger Emergency Alert'], exp.sosAlert, `${lang}: SOS — Trigger Emergency Alert`)
    assert.equal(dict['Transit Safety & Emergency Center'], exp.safetyCenter, `${lang}: Transit Safety & Emergency Center`)
  }

  // English source language verification
  assert.equal(languages.en.name, 'English')
  assert.equal(languages.en.dir, 'ltr')
  assert.equal(languages.ur.dir, 'rtl')
})

test('Multilingual Switch: CSS contains specialized font rules for all Indic scripts and Urdu', () => {
  const css = fs.readFileSync(path.join(root, 'src/index.css'), 'utf8')
  const expectedSelectors = [
    'html[lang="te"]',
    'html[lang="hi"]',
    'html[lang="ta"]',
    'html[lang="kn"]',
    'html[lang="ml"]',
    'html[lang="mr"]',
    'html[lang="bn"]',
    'html[lang="gu"]',
    'html[lang="pa"]',
    'html[lang="ur"]'
  ]
  for (const selector of expectedSelectors) {
    assert.ok(css.includes(selector), `index.css must include font styling rule for ${selector}`)
  }
})

test('Multilingual Switch: Flight and Bus UI translations exist across all 14 supported languages', () => {
  const flightAndBusKeys = [
    'Search Available Flight Options',
    'Search Available Bus Options',
    'Direct Flight Services',
    'Direct Bus Services',
    'Cabin',
    'Airline Preference',
    'All airlines',
    'Economy',
    'AC Seater',
    'AC Sleeper',
    'Seat preference',
    'Window seat',
    'Aisle seat',
    'Flight only',
    'Bus only',
    'Train + Flight',
    'Flight + Bus',
    'Flight-specific instructions',
    'Cabin baggage',
    'Check-in baggage',
    'Flight status board',
    'Bus status board',
    'Book Step 1 (Flight)',
    'Book Step 1 (Bus)',
    'Demo book flight',
    'Demo book bus',
    'Connecting Leg Delay Simulator:',
    'Activate Contingency'
  ]

  const nonEnglishLangs = ['hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'ur', 'es', 'fr', 'de']

  for (const lang of nonEnglishLangs) {
    const dict = OFFLINE_UI_TRANSLATIONS[lang]
    assert.ok(dict, `Offline translation dictionary for ${lang} must exist`)
    for (const key of flightAndBusKeys) {
      assert.ok(dict[key], `Missing translation in ${lang} for key: "${key}"`)
      assert.notEqual(dict[key].trim(), '', `Empty translation in ${lang} for key: "${key}"`)
      assert.notEqual(dict[key], key, `Translation in ${lang} for "${key}" must not equal English source`)
    }
  }

  // English source language sanity check
  assert.equal(languages.en.name, 'English')
  assert.equal(languages.en.dir, 'ltr')
})

test('Multilingual Switch: Regional transit phrases include Flight Gate and Bus Stand across all 14 languages', () => {
  const all14Langs = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'ur', 'es', 'fr', 'de']

  const flightGateItem = phraseTranslations.find((item) => item.key === 'flightGate')
  const busStandItem = phraseTranslations.find((item) => item.key === 'busStand')

  assert.ok(flightGateItem, 'phraseTranslations must contain flightGate item')
  assert.ok(busStandItem, 'phraseTranslations must contain busStand item')
  assert.equal(flightGateItem.label, 'Flight Gate')
  assert.equal(busStandItem.label, 'Bus Stand')

  for (const lang of all14Langs) {
    // 1. Check in phraseTranslations
    assert.ok(flightGateItem[lang], `phraseTranslations.flightGate must have entry for ${lang}`)
    assert.ok(busStandItem[lang], `phraseTranslations.busStand must have entry for ${lang}`)
    assert.notEqual(flightGateItem[lang].trim(), '', `flightGate entry for ${lang} must not be empty`)
    assert.notEqual(busStandItem[lang].trim(), '', `busStand entry for ${lang} must not be empty`)

    if (lang !== 'en') {
      assert.notEqual(flightGateItem[lang], flightGateItem.en, `flightGate for ${lang} should be localized`)
      assert.notEqual(busStandItem[lang], busStandItem.en, `busStand for ${lang} should be localized`)
    }

    // 2. Check in languages[lang].phrases
    const lPhrases = languages[lang].phrases
    assert.ok(lPhrases, `languages[${lang}].phrases must exist`)
    assert.equal(lPhrases.flightGate, flightGateItem[lang], `languages[${lang}].phrases.flightGate must match phraseTranslations`)
    assert.equal(lPhrases.busStand, busStandItem[lang], `languages[${lang}].phrases.busStand must match phraseTranslations`)
  }

  // 3. Strict Urdu character verification (CodeRabbit review feedback: U+0679 Urdu Tteh vs U+0A1F Gurmukhi Tta)
  assert.ok(flightGateItem.ur.includes('\u0679'), 'Urdu flightGate must use correct Urdu character U+0679 (ٹ)')
  assert.ok(!flightGateItem.ur.includes('\u0A1F'), 'Urdu flightGate must not contain Gurmukhi character U+0A1F (ਟ)')
})

test('Multilingual Switch Regression: Train translations and functionality preserved across all languages', () => {
  const criticalTrainKeys = [
    'Search Available Train Options',
    'Direct Train Services',
    'Berth Class',
    'Sleeper (SL)',
    'AC 3 Tier (3A)',
    'Berth preference',
    'Lower berth',
    'Train only',
    'Train + Train connector',
    'Train status board',
    'Book Step 1 (Train)',
    'Book Step 2 (Train)',
    'Demo book train',
    'Live Train Status',
    'Emergency Tatkal Mode',
    'Waitlisted Train Ticket?',
    'Check PNR Odds'
  ]

  const nonEnglishLangs = ['hi', 'te', 'ta', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa', 'ur', 'es', 'fr', 'de']

  for (const lang of nonEnglishLangs) {
    const dict = OFFLINE_UI_TRANSLATIONS[lang]
    assert.ok(dict, `Dictionary for ${lang} must exist`)
    for (const key of criticalTrainKeys) {
      assert.ok(dict[key], `Missing Train translation in ${lang} for key: "${key}"`)
      assert.notEqual(dict[key].trim(), '', `Empty Train translation in ${lang} for key: "${key}"`)
      assert.notEqual(dict[key], key, `Train translation in ${lang} for "${key}" should not equal English source`)
    }
  }

  // Concrete Train assertions for Hindi and Telugu
  const hi = OFFLINE_UI_TRANSLATIONS.hi
  assert.equal(hi['Search Available Train Options'], 'उपलब्ध ट्रेन विकल्प खोजें')
  assert.equal(hi['Direct Train Services'], 'सीधी ट्रेन सेवाएं')
  assert.equal(hi['Berth Class'], 'बर्थ श्रेणी')
  assert.equal(hi['Train only'], 'केवल ट्रेन')
  assert.equal(hi['Emergency Tatkal Mode'], 'आपातकालीन तत्काल मोड')

  const te = OFFLINE_UI_TRANSLATIONS.te
  assert.equal(te['Search Available Train Options'], 'అందుబాటులో ఉన్న రైలు ఎంపికలను శోధించండి')
  assert.equal(te['Direct Train Services'], 'డైరెక్ట్ రైలు సర్వీసులు')
  assert.equal(te['Berth Class'], 'బెర్త్ తరగతి')
  assert.equal(te['Train only'], 'రైలు మాత్రమే')
  assert.equal(te['Emergency Tatkal Mode'], 'అత్యవసర తత్కాల్ మోడ్')
})

test('Multilingual Switch: Form select options preserve value attributes across NormalPlanner and LowNetworkPlanner', () => {
  const normalSource = fs.readFileSync(path.join(root, 'src/planner/NormalPlanner.jsx'), 'utf8')
  const lowSource = fs.readFileSync(path.join(root, 'src/planner/LowNetworkPlanner.jsx'), 'utf8')

  // NormalPlanner select option value preservation
  assert.match(normalSource, /<option key=\{item\} value=\{item\}>\{item\}<\/option>/, 'NormalPlanner must set value={item} on class options')

  // LowNetworkPlanner select option value preservation
  assert.match(lowSource, /<option key=\{mode\} value=\{mode\}>\{mode\}<\/option>/, 'LowNetworkPlanner must set value={mode} on mode options')
  assert.match(lowSource, /<option key=\{item\} value=\{item\}>\{item\}<\/option>/, 'LowNetworkPlanner must set value={item} on class options')
})

test('Multilingual Switch: Script purity assertions for emergency phrases, Vegan, and 1-tap translations', () => {
  const policePhrase = phraseTranslations.find((item) => item.key === 'police')
  assert.ok(policePhrase, 'phraseTranslations must contain police item')

  // 1. Malayalam police must not contain Kannada characters (U+0C80-U+0CFF)
  assert.ok(!/[\u0C80-\u0CFF]/.test(policePhrase.ml), 'Malayalam police phrase must not contain Kannada characters')
  assert.equal(policePhrase.ml, 'എനിക്ക് പോലീസ് സഹായം വേണം.')

  // 2. Urdu police must use Arabic/Urdu script and not Devanagari (U+0900-U+097F)
  assert.ok(!/[\u0900-\u097F]/.test(policePhrase.ur), 'Urdu police phrase must not contain Devanagari characters')
  assert.equal(policePhrase.ur, 'مجھے پولیس کی مدد چاہیے۔')

  // 3. Marathi Vegan must use Devanagari and not Gurmukhi (U+0A00-U+0A7F)
  const mrVegan = OFFLINE_UI_TRANSLATIONS.mr?.['Vegan']
  assert.ok(mrVegan, 'Marathi translation must contain Vegan key')
  assert.ok(!/[\u0A00-\u0A7F]/.test(mrVegan), 'Marathi Vegan translation must not contain Gurmukhi characters')
  assert.equal(mrVegan, 'वीगन')

  // 4. Urdu 1-tap translation must not contain Gurmukhi characters (U+0A00-U+0A7F)
  const urOneTap = OFFLINE_UI_TRANSLATIONS.ur?.['Search fastest emergency combinations and Tatkal quota countdowns with 1 tap.']
  assert.ok(urOneTap, 'Urdu translation must contain 1-tap sentence key')
  assert.ok(!/[\u0A00-\u0A7F]/.test(urOneTap), 'Urdu 1-tap translation must not contain Gurmukhi characters')
  assert.ok(urOneTap.includes('ٹیپ'), 'Urdu 1-tap translation must contain correct Urdu spelling ٹیپ')
})

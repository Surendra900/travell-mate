import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.join(__dirname, '../src/data/languageData.js')

const newTranslations = {
  "View:": {
    "hi": "देखें:",
    "te": "వీక్షించండి:",
    "ta": "காண்க:",
    "kn": "ವೀಕ್ಷಿಸಿ:",
    "ml": "കാണുക:",
    "mr": "पहा:",
    "bn": "দেখুন:",
    "gu": "જુઓ:",
    "pa": "ਵੇਖੋ:",
    "ur": "دیکھیں:",
    "es": "Ver:",
    "fr": "Voir :",
    "de": "Ansicht:"
  },
  "All Options": {
    "hi": "सभी विकल्प",
    "te": "అన్ని ఎంపికలు",
    "ta": "அனைத்து விருப்பங்கள்",
    "kn": "ಎಲ್ಲಾ ಆಯ್ಕೆಗಳು",
    "ml": "എല്ലാ ഓപ്ഷനുകളും",
    "mr": "सर्व पर्याय",
    "bn": "সমস্ত বিকল্প",
    "gu": "બધા વિકલ્પો",
    "pa": "ਸਾਰੇ ਵਿਕਲਪ",
    "ur": "تمام اختیارات",
    "es": "Todas las opciones",
    "fr": "Toutes les options",
    "de": "Alle Optionen"
  },
  "Bypass Contrast": {
    "hi": "बायपास तुलना",
    "te": "బైపాస్ పోలిక",
    "ta": "பைபாஸ் ஒப்பீடு",
    "kn": "ಬೈಪಾಸ್ ಹೋಲಿಕೆ",
    "ml": "ബൈപാസ് താരതമ്യം",
    "mr": "बायपास तुलना",
    "bn": "বাইপাস বৈসাদৃশ্য",
    "gu": "બાયપાસ સરખામણી",
    "pa": "ਬਾਈਪਾਸ ਤੁਲਨਾ",
    "ur": "بائی پاس موازنہ",
    "es": "Contraste de desvío",
    "fr": "Contraste de contournement",
    "de": "Bypass-Vergleich"
  },
  "Under ₹1,000 (Paisa Vasool)": {
    "hi": "₹1,000 से कम (पैसा वसूल)",
    "te": "₹1,000 లోపు (పైసా వసూల్)",
    "ta": "₹1,000க்கு கீழ் (பைசா வசூல்)",
    "kn": "₹1,000 ಒಳಗೆ (ಪೈಸಾ ವಸೂಲ್)",
    "ml": "₹1,000-ൽ താഴെ (പൈസ വസൂൽ)",
    "mr": "₹1,000 पेक्षा कमी (पैसा वसूल)",
    "bn": "₹১,০০০ এর নিচে (পয়সা উশুল)",
    "gu": "₹1,000 થી ઓછું (પૈસા વસૂલ)",
    "pa": "₹1,000 ਤੋਂ ਘੱਟ (ਪੈਸਾ ਵਸੂਲ)",
    "ur": "1,000 روپے سے کم (پیسہ وصول)",
    "es": "Menos de ₹1.000 (Económico)",
    "fr": "Moins de 1 000 ₹ (Économique)",
    "de": "Unter 1.000 ₹ (Günstig)"
  },
  "Sub-₹2,000 (Balanced)": {
    "hi": "₹2,000 के अंतर्गत (संतुलित)",
    "te": "₹2,000 లోపు (సమతుల్య)",
    "ta": "₹2,000க்குள் (சமநிலையானது)",
    "kn": "₹2,000 ಒಳಗೆ (ಸಮತೋಲಿತ)",
    "ml": "₹2,000-ൽ താഴെ (സന്തുലിതം)",
    "mr": "₹2,000 च्या आत (संतुलित)",
    "bn": "₹২,০০০ এর মধ্যে (ভারসাম্যপূর্ণ)",
    "gu": "₹2,000 ની અંદર (સંતુલિત)",
    "pa": "₹2,000 ਦੇ ਅੰਦਰ (ਸੰਤੁਲਿਤ)",
    "ur": "2,000 روپے سے کم (متوازن)",
    "es": "Menos de ₹2.000 (Equilibrado)",
    "fr": "Moins de 2 000 ₹ (Équilibré)",
    "de": "Unter 2.000 ₹ (Ausgewogen)"
  },
  "Fastest (< 12h)": {
    "hi": "सबसे तेज़ (< 12 घंटे)",
    "te": "అత్యంత వేగవంతమైన (< 12 గంటలు)",
    "ta": "வேகமானது (< 12 மணி)",
    "kn": "ಅತ್ಯಂತ ವೇಗದ (< 12 ಗಂಟೆ)",
    "ml": "ഏറ്റവും വേഗതയേറിയത് (< 12 മണിക്കൂർ)",
    "mr": "सर्वात जलद (< 12 तास)",
    "bn": "দ্রুততম (< ১২ ঘণ্টা)",
    "gu": "સૌથી ઝડપી (< 12 કલાક)",
    "pa": "ਸਭ ਤੋਂ ਤੇਜ਼ (< 12 ਘੰਟੇ)",
    "ur": "سب سے تیز (< 12 گھنٹے)",
    "es": "Más rápido (< 12h)",
    "fr": "Le plus rapide (< 12h)",
    "de": "Schnellste (< 12h)"
  },
  "Multi-Modal Journeys via Regional Junctions": {
    "hi": "क्षेत्रीय जंक्शनों के माध्यम से मल्टी-मॉडल यात्राएं",
    "te": "ప్రాంతీయ జంక్షన్ల ద్వారా మల్టీ-మోడల్ ప్రయాణాలు",
    "ta": "பிராந்திய சந்திப்புகள் வழியாக பல முறை பயணங்கள்",
    "kn": "ಪ್ರಾದೇಶಿಕ ಜಂಕ್ಷನ್‌ಗಳ ಮೂಲಕ ಬಹು-ಮಾದರಿ ಪ್ರಯಾಣಗಳು",
    "ml": "പ്രാദേശിക ജംഗ്ഷനുകൾ വഴിയുള്ള മൾട്ടി-മോഡൽ യാത്രകൾ",
    "mr": "प्रादेशिक जंक्शनद्वारे मल्टी-मॉडल प्रवास",
    "bn": "আঞ্চলিক জংশনের মাধ্যমে মাল্টি-মোডাল ভ্রমণ",
    "gu": "પ્રાદેશિક જંકશન દ્વારા મલ્ટી-મોડલ મુસાફરી",
    "pa": "ਖੇਤਰੀ ਜੰਕਸ਼ਨਾਂ ਰਾਹੀਂ ਮਲਟੀ-ਮੋਡਲ ਯਾਤਰਾਵਾਂ",
    "ur": "علاقائی جنکشنز کے ذریعے ملٹی ماڈل سفر",
    "es": "Viajes multimodales a través de enlaces regionales",
    "fr": "Trajets multimodaux via des correspondances régionales",
    "de": "Multimodale Fahrten über regionale Umsteigeknoten"
  },
  "When direct seats are waitlisted, these multi-modal connections bypass the bottleneck via regional interchange hubs.": {
    "hi": "जब सीधी सीटें प्रतीक्षा सूची में हों, तो ये मल्टी-मॉडल कनेक्शन क्षेत्रीय इंटरचेंज हब के माध्यम से अड़चन को दरकिनार करते हैं।",
    "te": "డైరెక్ట్ సీట్లు వెయిట్‌లిస్ట్ అయినప్పుడు, ఈ మల్టీ-మోడల్ కనెక్షన్‌లు ప్రాంతీయ ఇంటర్‌చేంజ్ హబ్‌ల ద్వారా అడ్డంకిని బైపాస్ చేస్తాయి.",
    "ta": "நேரடி இருக்கைகள் காத்திருப்புப் பட்டியலில் இருக்கும்போது, இந்த மல்டி-மாடல் இணைப்புகள் பிராந்திய பரிமாற்ற மையங்கள் வழியாக தடையைத் தவிர்க்கின்றன.",
    "kn": "ನೇರ ಸೀಟುಗಳು ವೇಟಿಂಗ್ ಲಿಸ್ಟ್‌ನಲ್ಲಿದ್ದಾಗ, ಈ ಬಹು-ಮಾದರಿ ಸಂಪರ್ಕಗಳು ಪ್ರಾದೇಶಿಕ ಇಂಟರ್‌ಚೇಂಜ್ ಹಬ್‌ಗಳ ಮೂಲಕ ಅಡಚಣೆಯನ್ನು ಬೈಪಾಸ್ ಮಾಡುತ್ತವೆ.",
    "ml": "നേരിട്ടുള്ള സീറ്റുകൾ വെയിറ്റ്‌ലിസ്റ്റ് ചെയ്യപ്പെടുമ്പോൾ, ഈ മൾട്ടി-മോഡൽ കണക്ഷനുകൾ പ്രാദേശിക ഇന്റർചേഞ്ച് ഹബ്ബുകൾ വഴി തടസ്സം മറികടക്കുന്നു.",
    "mr": "जेव्हा थेट जागा वेटलिस्ट असतात, तेव्हा हे मल्टी-मॉडल कनेक्शन प्रादेशिक इंटरचेंज हबद्वारे अडथळा बायपास करतात.",
    "bn": "যখন সরাসরি আসন ওয়েটলিস্টে থাকে, তখন এই মাল্টি-মোডাল সংযোগগুলি আঞ্চলিক ইন্টারচেঞ্জ হাবের মাধ্যমে বাধা বাইপাস করে।",
    "gu": "જ્યારે સીધી બેઠકો વેઇટલિસ્ટ હોય, ત્યારે આ મલ્ટિ-મોડલ કનેક્શન્સ પ્રાદેશિક ઇન્ટરચેન્જ હબ દ્વારા અવરોધને બાયપાસ કરે છે.",
    "pa": "ਜਦੋਂ ਸਿੱਧੀਆਂ ਸੀਟਾਂ ਉਡੀਕ ਸੂਚੀ ਵਿੱਚ ਹੁੰਦੀਆਂ ਹਨ, ਤਾਂ ਇਹ ਮਲਟੀ-ਮੋਡਲ ਕਨੈਕਸ਼ਨ ਖੇਤਰੀ ਇੰਟਰਚੇਂਜ ਹੱਬਾਂ ਰਾਹੀਂ ਰੁਕਾਵਟ ਨੂੰ ਬਾਈਪਾਸ ਕਰਦੇ ਹਨ।",
    "ur": "جب براہ راست سیٹیں ویٹنگ لسٹ میں ہوتی ہیں، تو یہ ملٹی ماڈل کنکشنز علاقائی انٹرچینج حب کے ذریعے رکاوٹ کو نظرانداز کرتے ہیں۔",
    "es": "Cuando los asientos directos están en lista de espera, estas conexiones multimodales evitan el embotellamiento a través de enlaces regionales.",
    "fr": "Lorsque les places directes sont sur liste d'attente, ces liaisons multimodales contournent le goulot d'étranglement via des pôles régionaux.",
    "de": "Wenn Direktplätze auf der Warteliste stehen, umgehen diese multimodalen Verbindungen den Engpass über regionale Knotenpunkte."
  },
  "Railway provider request failed.": {
    "hi": "रेलवे प्रदाता अनुरोध विफल रहा।",
    "te": "రైల్వే ప్రొవైడర్ అభ్యర్థన విఫలమైంది.",
    "ta": "ரயில்வே வழங்குநர் கோரிக்கை தோல்வியடைந்தது.",
    "kn": "ರೈಲ್ವೆ ಪೂರೈಕೆದಾರರ ವಿನಂತಿ ವಿಫಲವಾಗಿದೆ.",
    "ml": "റെയിൽവേ ദാതാവിന്റെ അഭ്യർത്ഥന പരാജയപ്പെട്ടു.",
    "mr": "रेल्वे प्रदाता विनंती अयशस्वी झाली.",
    "bn": "রেলওয়ে সরবরাহকারীর অনুরোধ ব্যর্থ হয়েছে।",
    "gu": "રેલ્વે પ્રદાતા વિનંતી નિષ્ફળ ગઈ.",
    "pa": "ਰੇਲਵੇ ਪ੍ਰਦਾਤਾ ਬੇਨਤੀ ਅਸਫਲ ਰਹੀ।",
    "ur": "ریلوے فراہم کنندہ کی درخواست ناکام ہوگئی۔",
    "es": "Error en la solicitud al proveedor ferroviario.",
    "fr": "La demande auprès du fournisseur ferroviaire a échoué.",
    "de": "Anfrage an Bahnanbieter fehlgeschlagen."
  },
  "Flight provider request failed.": {
    "hi": "उड़ान प्रदाता अनुरोध विफल रहा।",
    "te": "విమాన ప్రొవైడర్ అభ్యర్థన విఫలమైంది.",
    "ta": "விமான வழங்குநர் கோரிக்கை தோல்வியடைந்தது.",
    "kn": "ವಿಮಾನ ಪೂರೈಕೆದಾರರ ವಿನಂತಿ ವಿಫಲವಾಗಿದೆ.",
    "ml": "വിമാന ദാതാവിന്റെ അഭ്യർത്ഥന പരാജയപ്പെട്ടു.",
    "mr": "विमान प्रदाता विनंती अयशस्वी झाली.",
    "bn": "ফ্লাইট সরবরাহকারীর অনুরোধ ব্যর্থ হয়েছে।",
    "gu": "ફ્લાઇટ પ્રદાતા વિનંતી નિષ્ફળ ગઈ.",
    "pa": "ਉਡਾਣ ਪ੍ਰਦਾਤਾ ਬੇਨਤੀ ਅਸਫਲ ਰਹੀ।",
    "ur": "فلائٹ فراہم کنندہ کی درخواست ناکام ہوگئی۔",
    "es": "Error en la solicitud al proveedor de vuelos.",
    "fr": "La demande auprès du fournisseur de vols a échoué.",
    "de": "Anfrage an Fluganbieter fehlgeschlagen."
  },
  "Bus provider request failed.": {
    "hi": "बस प्रदाता अनुरोध विफल रहा।",
    "te": "బస్సు ప్రొవైడర్ అభ్యర్థన విఫలమైంది.",
    "ta": "பேருந்து வழங்குநர் கோரிக்கை தோல்வியடைந்தது.",
    "kn": "ಬಸ್ ಪೂರೈಕೆದಾರರ ವಿನಂತಿ ವಿಫಲವಾಗಿದೆ.",
    "ml": "ബസ് ദാതാവിന്റെ അഭ്യർത്ഥന പരാജയപ്പെട്ടു.",
    "mr": "बस प्रदाता विनंती अयशस्वी झाली.",
    "bn": "বাস সরবরাহকারীর অনুরোধ ব্যর্থ হয়েছে।",
    "gu": "બસ પ્રદાતા વિનંતી નિષ્ફળ ગઈ.",
    "pa": "ਬੱਸ ਪ੍ਰਦਾਤਾ ਬੇਨਤੀ ਅਸਫਲ ਰਹੀ।",
    "ur": "بس فراہم کنندہ کی درخواست ناکام ہوگئی۔",
    "es": "Error en la solicitud al proveedor de autobuses.",
    "fr": "La demande auprès du fournisseur d'autobus a échoué.",
    "de": "Anfrage an Busanbieter fehlgeschlagen."
  },
  "Check availability": {
    "hi": "उपलब्धता जांचें",
    "te": "లభ్యతను తనిఖీ చేయండి",
    "ta": "இருப்பு நிலையை சரிபார்க்கவும்",
    "kn": "ಲಭ್ಯತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ",
    "ml": "ലഭ്യത പരിശോധിക്കുക",
    "mr": "उपलब्धता तपासा",
    "bn": "প্রাপ্যতা পরীক্ষা করুন",
    "gu": "ઉપલબ્ધતા તપાસો",
    "pa": "ਉਪਲਬਧਤਾ ਦੀ ਜਾਂਚ ਕਰੋ",
    "ur": "دستیابی چیک کریں",
    "es": "Consultar disponibilidad",
    "fr": "Vérifier la disponibilité",
    "de": "Verfügbarkeit prüfen"
  },
  "Schedule unavailable": {
    "hi": "समय सारिणी अनुपलब्ध",
    "te": "షెడ్యూల్ అందుబాటులో లేదు",
    "ta": "அட்டவணை கிடைக்கவில்லை",
    "kn": "ವೇಳಾಪಟ್ಟಿ ಲಭ್ಯವಿಲ್ಲ",
    "ml": "ഷെഡ്യൂൾ ലഭ്യമല്ല",
    "mr": "वेळापत्रक अनुपलब्ध",
    "bn": "সময়সূচী অনুপলব্ধ",
    "gu": "સમયપત્રક અનુપલબ્ધ",
    "pa": "ਸਮਾਂ ਸਾਰਣੀ ਉਪਲਬਧ ਨਹੀਂ",
    "ur": "شیڈول دستیاب نہیں ہے",
    "es": "Horario no disponible",
    "fr": "Horaire non disponible",
    "de": "Fahrplan nicht verfügbar"
  },
  "Provider schedule row. Live seat availability and ticket issue must be finalized on the authorized portal.": {
    "hi": "प्रदाता समय सारिणी पंक्ति। लाइव सीट उपलब्धता और टिकट जारी करना अधिकृत पोर्टल पर अंतिम रूप दिया जाना चाहिए।",
    "te": "ప్రొవైడర్ షెడ్యూల్ వరుస. లైవ్ సీటు లభ్యత మరియు టిక్కెట్ జారీని అధీకృత పోర్టల్‌లో ఖరారు చేయాలి.",
    "ta": "வழங்குநர் அட்டவணை வரிசை. நேரடி இருக்கை இருப்பு மற்றும் டிக்கெட் வழங்குதல் அங்கீகரிக்கப்பட்ட போர்ட்டலில் இறுதி செய்யப்பட வேண்டும்.",
    "kn": "ಪೂರೈಕೆದಾರರ ವೇಳಾಪಟ್ಟಿ ಸಾಲು. ಲೈವ್ ಆಸನ ಲಭ್ಯತೆ ಮತ್ತು ಟಿಕೆಟ್ ವಿತರಣೆಯನ್ನು ಅಧಿಕೃತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಅಂತಿಮಗೊಳಿಸಬೇಕು.",
    "ml": "ദാതാവിന്റെ ഷെഡ്യൂൾ വരി. തത്സമയ സീറ്റ് ലഭ്യതയും ടിക്കറ്റ് വിതരണവും അംഗീകൃത പോർട്ടലിൽ പൂർത്തിയാക്കണം.",
    "mr": "प्रदाता वेळापत्रक पंक्ती. थेट जागा उपलब्धता आणि तिकीट जारी करणे अधिकृत पोर्टलवर अंतिम केले पाहिजे.",
    "bn": "সরবরাহকারী সময়সূচী সারি। লাইভ আসন প্রাপ্যতা এবং টিকিট ইস্যু অনুমোদিত পোর্টালে চূড়ান্ত করা আবশ্যক।",
    "gu": "પ્રદાતા સમયપત્રક પંક્તિ. લાઇવ સીટની ઉપલબ્ધતા અને ટિકિટ ઇશ્યૂ અધિકૃત પોર્ટલ પર અંતિમ સ્વરૂપ આપવું આવશ્યક છે.",
    "pa": "ਪ੍ਰਦਾਤਾ ਸਮਾਂ ਸਾਰਣੀ ਕਤਾਰ। ਲਾਈਵ ਸੀਟ ਦੀ ਉਪਲਬਧਤਾ ਅਤੇ ਟਿਕਟ ਜਾਰੀ ਕਰਨਾ ਅਧਿਕਾਰਤ ਪੋਰਟਲ 'ਤੇ ਅੰਤਿਮ ਰੂਪ ਦਿੱਤਾ ਜਾਣਾ ਚਾਹੀਦਾ ਹੈ।",
    "ur": "فراہم کنندہ کے شیڈول کی قطار۔ لائیو سیٹ کی دستیابی اور ٹکٹ کے اجراء کو مجاز پورٹل پر حتمی شکل دی جانی چاہیے۔",
    "es": "Fila de horarios del proveedor. La disponibilidad de plazas y la emisión de billetes deben finalizarse en el portal oficial.",
    "fr": "Ligne d'horaires du fournisseur. La disponibilité des places et l'émission des billets doivent être finalisées sur le portail officiel.",
    "de": "Fahrplanzeile des Anbieters. Die Sitzplatzverfügbarkeit und Ticketausstellung muss auf dem offiziellen Portal abgeschlossen werden."
  },
  "Waitlist Bypass Engine": {
    "hi": "प्रतीक्षा सूची बाईपास इंजन",
    "te": "వెయిట్‌లిస్ట్ బైపాస్ ఇంజిన్",
    "ta": "காத்திருப்புப் பட்டியல் பைபாஸ் இயந்திரம்",
    "kn": "ವೇಟಿಂಗ್ ಲಿಸ್ಟ್ ಬೈಪಾಸ್ ಎಂಜಿನ್",
    "ml": "വെയിറ്റ്‌ലിസ്റ്റ് ബൈപാസ് എഞ്ചിൻ",
    "mr": "वेटलिस्ट बायपास इंजिन",
    "bn": "ওয়েটলিস্ট বাইপাস ইঞ্জিন",
    "gu": "વેઇટલિસ્ટ બાયપાસ એન્જિન",
    "pa": "ਉਡੀਕ ਸੂਚੀ ਬਾਈਪਾਸ ਇੰਜਣ",
    "ur": "ویٹنگ لسٹ بائی پاس انجن",
    "es": "Motor de desvío de lista de espera",
    "fr": "Moteur de contournement de liste d'attente",
    "de": "Wartelisten-Bypass-Engine"
  },
  "Direct vs. Split-Route Recovery Contrast": {
    "hi": "प्रत्यक्ष बनाम विभाजित-मार्ग पुनर्प्राप्ति तुलना",
    "te": "ప్రత్యక్ష వర్సెస్ స్ప్లిట్-రూట్ రికవరీ పోలిక",
    "ta": "நேரடி மற்றும் பிளவு-பாதை மீட்பு ஒப்பீடு",
    "kn": "ನೇರ ಮತ್ತು ಸ್ಪ್ಲಿಟ್-ರೂಟ್ ಚೇತರಿಕೆ ಹೋಲಿಕೆ",
    "ml": "ഡയറക്ട് വേഴ്സസ് സ്പ്ലിറ്റ്-റൂട്ട് റിക്കവറി താരതമ്യം",
    "mr": "थेट विरुद्ध स्प्लिट-मार्ग पुनर्प्राप्ती तुलना",
    "bn": "সরাসরি বনাম বিভক্ত-রুট পুনরুদ্ধার বৈসাদৃশ্য",
    "gu": "સીધા વિરુદ્ધ સ્પ્લિટ-રૂટ રિકવરી સરખામણી",
    "pa": "ਸਿੱਧਾ ਬਨਾਮ ਸਪਲਿਟ-ਰੂਟ ਰਿਕਵਰੀ ਤੁਲਨਾ",
    "ur": "براہ راست بمقابلہ اسپلٹ روٹ ریکوری موازنہ",
    "es": "Contraste directo vs. recuperación de ruta dividida",
    "fr": "Contraste direct vs itinéraire fractionné de secours",
    "de": "Direkt- vs. geteilte Ausweichroute im Vergleich"
  },
  "Compare the direct train bottleneck against the regional junction bypass option.": {
    "hi": "क्षेत्रीय जंक्शन बाईपास विकल्प के साथ सीधी ट्रेन अड़चन की तुलना करें।",
    "te": "ప్రాంతీయ జంక్షన్ బైపాస్ ఎంపికతో డైరెక్ట్ రైలు అడ్డంకిని పోల్చండి.",
    "ta": "பிராந்திய சந்திப்பு பைபாஸ் விருப்பத்துடன் நேரடி ரயில் தடையை ஒப்பிடுக.",
    "kn": "ಪ್ರಾದೇಶಿಕ ಜಂಕ್ಷನ್ ಬೈಪಾಸ್ ಆಯ್ಕೆಯೊಂದಿಗೆ ನೇರ ರೈಲು ಅಡಚಣೆಯನ್ನು ಹೋಲಿಕೆ ಮಾಡಿ.",
    "ml": "റീജിയണൽ ജംഗ്ഷൻ ബൈപാസ് ഓപ്ഷനുമായി നേരിട്ടുള്ള ട്രെയിൻ തടസ്സം താരതമ്യം ചെയ്യുക.",
    "mr": "प्रादेशिक जंक्शन बायपास पर्यायाशी थेट ट्रेनच्या अडथळ्याची तुलना करा.",
    "bn": "আঞ্চলিক জংশন বাইপাস বিকল্পের সাথে সরাসরি ট্রেনের বাধার তুলনা করুন।",
    "gu": "પ્રાદેશિક જંકશન બાયપાસ વિકલ્પ સાથે સીધી ટ્રેન અવરોધની સરખામણી કરો.",
    "pa": "ਖੇਤਰੀ ਜੰਕਸ਼ਨ ਬਾਈਪਾਸ ਵਿਕਲਪ ਨਾਲ ਸਿੱਧੀ ਰੇਲ ਰੁਕਾਵਟ ਦੀ ਤੁਲਨਾ ਕਰੋ।",
    "ur": "علاقائی جنکشن بائی پاس آپشن کے خلاف براہ راست ٹرین کی رکاوٹ کا موازنہ کریں۔",
    "es": "Compare el cuello de botella del tren directo con la alternativa de desvío por enlace regional.",
    "fr": "Comparez le goulot d'étranglement du train direct avec l'option de contournement par correspondance régionale.",
    "de": "Vergleichen Sie den Engpass des Direktzugs mit der Umgehung über einen regionalen Knotenpunkt."
  }
}

let content = fs.readFileSync(filePath, 'utf8')

for (const [englishKey, translationsByLang] of Object.entries(newTranslations)) {
  for (const [lang, translatedValue] of Object.entries(translationsByLang)) {
    const langHeader = `  "${lang}": {\n`
    const insertIndex = content.indexOf(langHeader)
    if (insertIndex !== -1) {
      const insertion = `    ${JSON.stringify(englishKey)}: ${JSON.stringify(translatedValue)},\n`
      if (!content.includes(insertion)) {
        content = content.slice(0, insertIndex + langHeader.length) + insertion + content.slice(insertIndex + langHeader.length)
      }
    }
  }
}

fs.writeFileSync(filePath, content, 'utf8')
console.log('Successfully added more UI translations!')

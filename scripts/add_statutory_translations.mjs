import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.join(__dirname, '../src/data/languageData.js')

const newTranslations = {
  "Statutory Booking Notice:": {
    "hi": "वैधानिक बुकिंग सूचना:",
    "te": "చట్టబద్ధమైన బుకింగ్ నోటీసు:",
    "ta": "சட்டப்பூர்வ முன்பதிவு அறிவிப்பு:",
    "kn": "ಶಾಸನಬದ್ಧ ಬುಕಿಂಗ್ ಸೂಚನೆ:",
    "ml": "നിയമാനുസൃത ബുക്കിംഗ് അറിയിപ്പ്:",
    "mr": "वैधानिक बुकिंग सूचना:",
    "bn": "বিধিবদ্ধ বুকিং বিজ্ঞপ্তি:",
    "gu": "વૈધાનિક બુકિંગ નોટિસ:",
    "pa": "ਕਾਨੂੰਨੀ ਬੁਕਿੰਗ ਨੋਟਿਸ:",
    "ur": "قانونی بکنگ نوٹس:",
    "es": "Aviso legal de reserva:",
    "fr": "Avis légal de réservation :",
    "de": "Gesetzlicher Buchungshinweis:"
  },
  "These are independent bookings. If one leg is delayed, other operators owe you nothing and TravelMate cannot guarantee refunds or compensation. Always maintain safe transfer buffers.": {
    "hi": "ये स्वतंत्र बुकिंग हैं। यदि एक चरण में देरी होती है, तो अन्य ऑपरेटर आपके प्रति उत्तरदायी नहीं हैं और TravelMate रिफंड या मुआवजे की गारंटी नहीं देता है। हमेशा सुरक्षित ट्रांसफर बफर बनाए रखें।",
    "te": "ఇవి స్వతంత్ర బుకింగ్‌లు. ఒక లెగ్ ఆలస్యమైతే, ఇతర ఆపరేటర్లు మీకు ఏమీ చెల్లించాల్సిన బాధ్యత లేదు మరియు TravelMate రీఫండ్‌లు లేదా పరిహారానికి హామీ ఇవ్వదు. ఎల్లప్పుడూ సురక్షితమైన బదిలీ బఫర్‌లను నిర్వహించండి.",
    "ta": "இவை சுயாதீன முன்பதிவுகள். ஒரு பகுதி தாமதமானால், பிற ஆபரேட்டர்கள் உங்களுக்கு எதையும் தர வேண்டியதில்லை மற்றும் TravelMate பணத்தைத் திரும்பப் பெறுதல் அல்லது இழப்பீட்டுக்கு உத்தரவாதம் அளிக்காது. எப்போதும் பாதுகாப்பான பரிமாற்ற இடையகங்களைப் பராமரிக்கவும்.",
    "kn": "ಇವು ಸ್ವತಂತ್ರ ಬುಕಿಂಗ್‌ಗಳಾಗಿವೆ. ಒಂದು ಲೆಗ್ ವಿಳಂಬವಾದರೆ, ಇತರ ಆಪರೇಟರ್‌ಗಳು ನಿಮಗೆ ಏನನ್ನೂ ನೀಡುವುದಿಲ್ಲ ಮತ್ತು TravelMate ಮರುಪಾವತಿ ಅಥವಾ ಪರಿಹಾರವನ್ನು ಖಾತರಿಪಡಿಸುವುದಿಲ್ಲ. ಯಾವಾಗಲೂ ಸುರಕ್ಷಿತ ವರ್ಗಾವಣೆ ಬಫರ್‌ಗಳನ್ನು ನಿರ್ವಹಿಸಿ.",
    "ml": "ഇവ സ്വതന്ത്ര ബുക്കിംഗുകളാണ്. ഒരു ലെഗ് വൈകിയാൽ, മറ്റ് ഓപ്പറേറ്റർമാർ നിങ്ങൾക്ക് ഒന്നും കടപ്പെട്ടിട്ടില്ല കൂടാതെ TravelMate റീഫണ്ടുകൾക്കോ നഷ്ടപരിഹാരത്തിനോ ഉറപ്പ് നൽകുന്നില്ല. എല്ലായ്പ്പോഴും സുരക്ഷിതമായ ട്രാൻസ്ഫർ ബഫറുകൾ നിലനിർത്തുക.",
    "mr": "हे स्वतंत्र बुकिंग आहेत. एका टप्प्यास विलंब झाल्यास, इतर ऑपरेटर तुमच्यासाठी जबाबदार नाहीत आणि TravelMate परतावा किंवा भरपाईची हमी देत नाही. नेहमी सुरक्षित ट्रान्सफर बफर ठेवा.",
    "bn": "এগুলি স্বাধীন বুকিং। একটি অংশ বিলম্বিত হলে, অন্যান্য অপারেটর আপনার কাছে কিছুই দেয় না এবং TravelMate ফেরত বা ক্ষতিপূরণের নিশ্চয়তা দিতে পারে না। সর্বদা নিরাপদ স্থানান্তর বাফার বজায় রাখুন।",
    "gu": "આ સ્વતંત્ર બુકિંગ છે. જો એક લેગ મોડો થાય, તો અન્ય ઓપરેટરો તમારા માટે જવાબદાર નથી અને TravelMate રિફંડ અથવા વળતરની બાંહેધરી આપી શકતું નથી. હંમેશા સુરક્ષિત ટ્રાન્સફર બફર જાળવો.",
    "pa": "ਇਹ ਸੁਤੰਤਰ ਬੁਕਿੰਗ ਹਨ। ਜੇਕਰ ਇੱਕ ਪੜਾਅ ਵਿੱਚ ਦੇਰੀ ਹੁੰਦੀ ਹੈ, ਤਾਂ ਦੂਜੇ ਆਪਰੇਟਰ ਤੁਹਾਡੇ ਪ੍ਰਤੀ ਜਵਾਬਦੇਹ ਨਹੀਂ ਹਨ ਅਤੇ TravelMate ਰਿਫੰਡ ਜਾਂ ਮੁਆਵਜ਼ੇ ਦੀ ਗਰੰਟੀ ਨਹੀਂ ਦੇ ਸਕਦਾ। ਹਮੇਸ਼ਾ ਸੁਰੱਖਿਅਤ ਟ੍ਰਾਂਸਫਰ ਬਫਰ ਬਣਾਈ ਰੱਖੋ।",
    "ur": "یہ آزاد بکنگ ہیں۔ اگر ایک مرحلے میں تاخیر ہوتی ہے، تو دوسرے آپریٹرز آپ کے کچھ مقروض نہیں ہیں اور TravelMate ریفنڈز یا معاوضے کی ضمانت نہیں دے سکتا۔ ہمیشہ محفوظ منتقلی بفرز کو برقرار رکھیں۔",
    "es": "Estas son reservas independientes. Si un tramo se retrasa, otros operadores no le deben nada y TravelMate no puede garantizar reembolsos ni compensaciones. Mantenga siempre márgenes de transbordo seguros.",
    "fr": "Il s'agit de réservations indépendantes. Si un tronçon est retardé, les autres opérateurs ne vous doivent rien et TravelMate ne peut garantir aucun remboursement ou indemnisation. Prévoyez toujours des marges de correspondance sûres.",
    "de": "Dies sind unabhängige Buchungen. Bei Verspätung einer Teilstrecke schulden andere Betreiber nichts und TravelMate übernimmt keine Garantie für Erstattungen oder Entschädigungen. Halten Sie stets sichere Umsteigepuffer ein."
  },
  "Direct Train Status (Waitlist Wall)": {
    "hi": "सीधी ट्रेन स्थिति (प्रतीक्षा सूची दीवार)",
    "te": "డైరెక్ట్ రైలు స్థితి (వెయిట్‌లిస్ట్ గోడ)",
    "ta": "நேரடி ரயில் நிலை (காத்திருப்புப் பட்டியல் சுவர்)",
    "kn": "ನೇರ ರೈಲು ಸ್ಥಿತಿ (ವೇಟಿಂಗ್ ಲಿಸ್ಟ್ ಗೋಡೆ)",
    "ml": "നേരിട്ടുള്ള ട്രെയിൻ നില (വെയിറ്റ്‌ലിസ്റ്റ് മതിൽ)",
    "mr": "थेट ट्रेन स्थिती (वेटलिस्ट वॉल)",
    "bn": "সরাসরি ট্রেনের স্থিতি (ওয়েটলিস্ট ওয়াল)",
    "gu": "સીધી ટ્રેન સ્થિતિ (વેઇટલિસ્ટ દિવાલ)",
    "pa": "ਸਿੱਧੀ ਰੇਲ ਸਥਿਤੀ (ਉਡੀਕ ਸੂਚੀ ਕੰਧ)",
    "ur": "براہ راست ٹرین کی حیثیت (ویٹنگ لسٹ وال)",
    "es": "Estado del tren directo (Muro de lista de espera)",
    "fr": "Statut du train direct (Mur de liste d'attente)",
    "de": "Direktzugstatus (Wartelisten-Wand)"
  },
  "DIRECT TRAIN STATUS (WAITLIST WALL)": {
    "hi": "सीधी ट्रेन स्थिति (प्रतीक्षा सूची दीवार)",
    "te": "డైరెక్ట్ రైలు స్థితి (వెయిట్‌లిస్ట్ గోడ)",
    "ta": "நேரடி ரயில் நிலை (காத்திருப்புப் பட்டியல் சுவர்)",
    "kn": "ನೇರ ರೈಲು ಸ್ಥಿತಿ (ವೇಟಿಂಗ್ ಲಿಸ್ಟ್ ಗೋಡೆ)",
    "ml": "നേരിട്ടുള്ള ട്രെയിൻ നില (വെയിറ്റ്‌ലിസ്റ്റ് മതിൽ)",
    "mr": "थेट ट्रेन स्थिती (वेटलिस्ट वॉल)",
    "bn": "সরাসরি ট্রেনের স্থিতি (ওয়েটলিস্ট ওয়াল)",
    "gu": "સીધી ટ્રેન સ્થિતિ (વેઇટલિસ્ટ દિવાલ)",
    "pa": "ਸਿੱਧੀ ਰੇਲ ਸਥਿਤੀ (ਉਡੀਕ ਸੂਚੀ ਕੰਧ)",
    "ur": "براہ راست ٹرین کی حیثیت (ویٹنگ لسٹ وال)",
    "es": "ESTADO DEL TREN DIRECTO (MURO DE LISTA DE ESPERA)",
    "fr": "STATUT DU TRAIN DIRECT (MUR DE LISTE D'ATTENTE)",
    "de": "DIREKTZUGSTATUS (WARTELISTEN-WAND)"
  },
  "SPLIT-ROUTE ALTERNATIVE (WAITLIST BYPASS)": {
    "hi": "विभाजित-मार्ग विकल्प (प्रतीक्षा सूची बाईपास)",
    "te": "స్ప్లిట్-రూట్ ప్రత్యామ్నాయం (వెయిట్‌లిస్ట్ బైపాస్)",
    "ta": "பிளவு-பாதை மாற்று (காத்திருப்புப் பட்டியல் பைபாஸ்)",
    "kn": "ಸ್ಪ್ಲಿಟ್-ರೂಟ್ ಪರ್ಯಾಯ (ವೇಟಿಂಗ್ ಲಿಸ್ಟ್ ಬೈಪಾಸ್)",
    "ml": "സ്പ്ലിറ്റ്-റൂട്ട് ഇതരമാർഗ്ഗം (വെയിറ്റ്‌ലിസ്റ്റ് ബൈപാസ്)",
    "mr": "स्प्लिट-मार्ग पर्याय (वेटलिस्ट बायपास)",
    "bn": "বিভক্ত-রুট বিকল্প (ওয়েটলিস্ট বাইপাস)",
    "gu": "સ્પ્લિટ-રૂટ વિકલ્પ (વેઇટલિસ્ટ બાયપાસ)",
    "pa": "ਸਪਲਿਟ-ਰੂਟ ਵਿਕਲਪ (ਉਡੀਕ ਸੂਚੀ ਬਾਈਪਾਸ)",
    "ur": "اسپلٹ روٹ متبادل (ویٹنگ لسٹ بائی پاس)",
    "es": "ALTERNATIVA DE RUTA DIVIDIDA (DESVÍO DE LISTA DE ESPERA)",
    "fr": "ALTERNATIVE D'ITINÉRAIRE FRACTIONNÉ (CONTOURNEMENT LISTE D'ATTENTE)",
    "de": "GETEILTE AUSWEICHROUTE (WARTELISTEN-BYPASS)"
  },
  "Bottleneck Identified:": {
    "hi": "पहचानी गई अड़चन:",
    "te": "గుర్తించిన అడ్డంకి:",
    "ta": "கண்டறியப்பட்ட தடை:",
    "kn": "ಗುರುತಿಸಲಾದ ಅಡಚಣೆ:",
    "ml": "കണ്ടെത്തിയ തടസ്സം:",
    "mr": "ओळखलेला अडथळा:",
    "bn": "চিহ্নিত বাধা:",
    "gu": "ઓળખાયેલ અવરોધ:",
    "pa": "ਪਛਾਣੀ ਗਈ ਰੁਕਾਵਟ:",
    "ur": "شناخت شدہ رکاوٹ:",
    "es": "Cuello de botella identificado:",
    "fr": "Goulot d'étranglement identifié :",
    "de": "Identifizierter Engpass:"
  },
  "Direct tickets for this corridor are heavily oversubscribed. High probability of remaining waitlisted without berth allotment on chart preparation.": {
    "hi": "इस कॉरिडोर के लिए सीधे टिकट अत्यधिक मांग में हैं। चार्ट तैयार होने पर बर्थ आवंटन के बिना प्रतीक्षा सूची में रहने की उच्च संभावना है।",
    "te": "ఈ కారిడార్ కోసం డైరెక్ట్ టిక్కెట్లు అధిక డిమాండ్‌లో ఉన్నాయి. చార్ట్ తయారీ సమయంలో బెర్త్ కేటాయింపు లేకుండా వెయిట్‌లిస్ట్‌లో ఉండే అవకాశం ఎక్కువ.",
    "ta": "இந்த வழித்தடத்திற்கான நேரடி டிக்கெட்டுகள் அதிக தேவையில் உள்ளன. சார்ட் தயாரிப்பின் போது இருக்கை ஒதுக்கீடு இல்லாமல் காத்திருப்புப் பட்டியலிலேயே இருக்க அதிக வாய்ப்புள்ளது.",
    "kn": "ಈ ಕಾರಿಡಾರ್‌ಗಾಗಿ ನೇರ ಟಿಕೆಟ್‌ಗಳು ಅತಿಯಾದ ಬೇಡಿಕೆಯಲ್ಲಿವೆ. ಚಾರ್ಟ್ ತಯಾರಿಕೆಯಲ್ಲಿ ಬರ್ತ್ ಹಂಚಿಕೆಯಾಗದೆ ವೇಟಿಂಗ್ ಲಿಸ್ಟ್‌ನಲ್ಲೇ ಉಳಿಯುವ ಹೆಚ್ಚಿನ ಸಂಭವನೀಯತೆಯಿದೆ.",
    "ml": "ഈ ഇടനാഴിക്കായുള്ള നേരിട്ടുള്ള ടിക്കറ്റുകൾക്ക് ഉയർന്ന ഡിമാൻഡാണ്. ചാർട്ട് തയ്യാറാക്കുമ്പോൾ ബർത്ത് അലോട്ട്മെന്റ് ഇല്ലാതെ വെയിറ്റ്‌ലിസ്റ്റിൽ തുടരാൻ ഉയർന്ന സാധ്യതയുണ്ട്.",
    "mr": "या कॉरिडॉरसाठी थेट तिकिटांची जास्त मागणी आहे. चार्ट तयार करताना बर्थ वाटपाशिवाय वेटलिस्ट राहण्याची दाट शक्यता आहे.",
    "bn": "এই করিডোরের জন্য সরাসরি টিকিটের অতিরিক্ত চাহিদা রয়েছে। চার্ট তৈরির সময় বার্থ বরাদ্দ ছাড়াই ওয়েটলিস্টে থাকার উচ্চ সম্ভাবনা রয়েছে।",
    "gu": "આ કોરિડોર માટે સીધી ટિકિટોની ખૂબ માંગ છે. ચાર્ટ બનાવતી વખતે બર્થ ફાળવણી વિના વેઇટલિસ્ટ રહેવાની ઊંચી સંભાવના છે.",
    "pa": "ਇਸ ਕੋਰੀਡੋਰ ਲਈ ਸਿੱਧੀਆਂ ਟਿਕਟਾਂ ਦੀ ਭਾਰੀ ਮੰਗ ਹੈ। ਚਾਰਟ ਤਿਆਰ ਕਰਨ 'ਤੇ ਬਰਥ ਵੰਡ ਤੋਂ ਬਿਨਾਂ ਉਡੀਕ ਸੂਚੀ ਵਿੱਚ ਰਹਿਣ ਦੀ ਉੱਚ ਸੰਭਾਵਨਾ ਹੈ।",
    "ur": "اس کوریڈور کے لیے براہ راست ٹکٹوں کی مانگ بہت زیادہ ہے۔ چارٹ کی تیاری پر برتھ الاٹمنٹ کے بغیر ویٹنگ لسٹ میں رہنے کا زیادہ امکان ہے۔",
    "es": "Los billetes directos para este trayecto están muy solicitados. Alta probabilidad de permanecer en lista de espera sin asignación de plaza.",
    "fr": "Les billets directs pour cette liaison sont très demandés. Forte probabilité de rester sur liste d'attente sans attribution de couchette.",
    "de": "Direkttickets für diesen Korridor sind stark überbucht. Hohe Wahrscheinlichkeit, bei der Charterstellung ohne Liegeplatzzuweisung auf der Warteliste zu bleiben."
  },
  "Click Analyze & suggest best to compare the fallback routes and show one clear recommendation.": {
    "hi": "फ़ॉलबैक मार्गों की तुलना करने और एक स्पष्ट अनुशंसा दिखाने के लिए विश्लेषण करें और सर्वश्रेष्ठ सुझाएं पर क्लिक करें।",
    "te": "ఫాల్‌బ్యాక్ మార్గాలను సరిపోల్చడానికి మరియు ఒక స్పష్టమైన సిఫార్సును చూపించడానికి విశ్లేషించండి మరియు ఉత్తమమైనదాన్ని సూచించండిపై క్లిక్ చేయండి.",
    "ta": "மாற்று வழிகளை ஒப்பிட்டு தெளிவான பரிந்துரையைக் காட்ட சிறந்ததை பகுப்பாய்வு செய்து பரிந்துரைக்கவும் என்பதைக் கிளிக் செய்யவும்.",
    "kn": "ಫಾಲ್‌ಬ್ಯಾಕ್ ಮಾರ್ಗಗಳನ್ನು ಹೋಲಿಸಲು ಮತ್ತು ಒಂದು ಸ್ಪಷ್ಟ ಶಿಫಾರಸನ್ನು ತೋರಿಸಲು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ಉತ್ತಮವಾದುದನ್ನು ಸೂಚಿಸಿ ಕ್ಲಿಕ್ ಮಾಡಿ.",
    "ml": "ഫാൾബാക്ക് റൂട്ടുകൾ താരതമ്യം ചെയ്യാനും വ്യക്തമായ ഒരു ശുപാർശ കാണിക്കാനും മികച്ചത് വിശകലനം ചെയ്യുക & നിർദ്ദേശിക്കുക ക്ലിക്ക് ചെയ്യുക.",
    "mr": "फॉलबॅक मार्गांची तुलना करण्यासाठी आणि एक स्पष्ट शिफारस दाखवण्यासाठी सर्वोत्तम विश्लेषण करा आणि सुचवा वर क्लिक करा.",
    "bn": "ফলব্যাক রুটগুলির তুলনা করতে এবং একটি স্পষ্ট সুপারিশ প্রদর্শন করতে বিশ্লেষণ করুন এবং সেরাটি সাজেস্ট করুন ক্লিক করুন।",
    "gu": "ફોલબેક રૂટ્સની સરખામણી કરવા અને એક સ્પષ્ટ ભલામણ બતાવવા માટે વિશ્લેષણ કરો અને શ્રેષ્ઠ સૂચવો પર ક્લિક કરો.",
    "pa": "ਫਾਲਬੈਕ ਰੂਟਾਂ ਦੀ ਤੁਲਨਾ ਕਰਨ ਅਤੇ ਇੱਕ ਸਪਸ਼ਟ ਸਿਫ਼ਾਰਸ਼ ਦਿਖਾਉਣ ਲਈ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ ਅਤੇ ਵਧੀਆ ਸੁਝਾਅ ਦਿਓ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।",
    "ur": "فال بیک راستوں کا موازنہ کرنے اور ایک واضح سفارش دکھانے کے لیے تجزیہ کریں اور بہترین تجویز کریں پر کلک کریں۔",
    "es": "Haga clic en Analizar y sugerir la mejor opción para comparar las rutas de respaldo y ver una recomendación clara.",
    "fr": "Cliquez sur Analyser et suggérer la meilleure option pour comparer les itinéraires de secours et afficher une recommandation claire.",
    "de": "Klicken Sie auf Analysieren und beste empfehlen, um die Ausweichrouten zu vergleichen und eine Empfehlung anzuzeigen."
  },
  "Backup options are hidden until you ask the app to analyze and suggest the best one. This keeps the planner simple for demo viewers.": {
    "hi": "जब तक आप ऐप से विश्लेषण करने और सर्वश्रेष्ठ सुझाव देने के लिए नहीं कहते, तब तक बैकअप विकल्प छिपे रहते हैं। यह डेमो दर्शकों के लिए प्लानर को सरल रखता है।",
    "te": "మీరు యాప్‌ను విశ్లేషించి ఉత్తమమైనదాన్ని సూచించమని అడిగే వరకు బ్యాకప్ ఎంపికలు దాచబడతాయి. ఇది డెమో వీక్షకుల కోసం ప్లానర్‌ను సరళంగా ఉంచుతుంది.",
    "ta": "பயன்பாட்டை பகுப்பாய்வு செய்து சிறந்ததை பரிந்துரைக்க நீங்கள் கேட்கும் வரை காப்புப்பிரதி விருப்பங்கள் மறைக்கப்படும். இது டெமோ பார்வையாளர்களுக்கு திட்டமிடுபவரை எளிமையாக வைத்திருக்கிறது.",
    "kn": "ಅಪ್ಲಿಕೇಶನ್ ಅನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಮತ್ತು ಉತ್ತಮವಾದುದನ್ನು ಸೂಚಿಸಲು ನೀವು ಕೇಳುವವರೆಗೆ ಬ್ಯಾಕಪ್ ಆಯ್ಕೆಗಳನ್ನು ಮರೆಮಾಡಲಾಗುತ್ತದೆ. ಇದು ಡೆಮೊ ವೀಕ್ಷಕರಿಗೆ ಪ್ಲಾನರ್ ಅನ್ನು ಸರಳವಾಗಿರಿಸುತ್ತದೆ.",
    "ml": "ആപ്പ് വിശകലനം ചെയ്യാനും മികച്ചത് നിർദ്ദേശിക്കാനും ആവശ്യപ്പെടുന്നത് വരെ ബാക്കപ്പ് ഓപ്ഷനുകൾ മറച്ചിരിക്കുന്നു. ഇത് ഡെമോ കാഴ്ചക്കാർക്കായി പ്ലാനർ ലളിതമായി സൂക്ഷിക്കുന്നു.",
    "mr": "जोपर्यंत तुम्ही अॅपला विश्लेषण करण्यास आणि सर्वोत्तम सुचवण्यास सांगत नाही तोपर्यंत बॅकअप पर्याय लपविलेले असतात. हे डेमो दर्शकांसाठी प्लॅनर सोपे ठेवते.",
    "bn": "যতক্ষণ না আপনি অ্যাপটিকে বিশ্লেষণ করতে এবং সেরাটি সুপারিশ করতে বলেন ততক্ষণ ব্যাকআপ বিকল্পগুলি লুকানো থাকে। এটি ডেমো দর্শকদের জন্য পরিকল্পনাকারীকে সহজ রাখে।",
    "gu": "જ્યાં સુધી તમે એપ્લિકેશનને વિશ્લેષણ કરવા અને શ્રેષ્ઠ સૂચવવા માટે ન કહો ત્યાં સુધી બેકઅપ વિકલ્પો છુપાયેલા રહે છે. આ ડેમો દર્શકો માટે પ્લાનરને સરળ રાખે છે.",
    "pa": "ਜਦੋਂ ਤੱਕ ਤੁਸੀਂ ਐਪ ਨੂੰ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਨ ਅਤੇ ਵਧੀਆ ਸੁਝਾਅ ਦੇਣ ਲਈ ਨਹੀਂ ਕਹਿੰਦੇ, ਬੈਕਅੱਪ ਵਿਕਲਪ ਲੁਕੇ ਰਹਿੰਦੇ ਹਨ। ਇਹ ਡੈਮੋ ਦਰਸ਼ਕਾਂ ਲਈ ਯੋਜਨਾਕਾਰ ਨੂੰ ਸਰਲ ਰੱਖਦਾ ਹੈ।",
    "ur": "جب تک آپ ایپ سے تجزیہ کرنے اور بہترین تجویز کرنے کو نہیں کہتے ہیں، بیک اپ کے اختیارات چھپے رہتے ہیں۔ یہ ڈیمو ناظرین کے لیے منصوبہ ساز کو آسان رکھتا ہے۔",
    "es": "Las opciones de respaldo permanecen ocultas hasta que solicite a la aplicación analizarlas y sugerir la mejor. Esto mantiene el planificador ordenado.",
    "fr": "Les options de secours restent masquées jusqu'à ce que vous demandiez à l'application d'analyser et de suggérer la meilleure. Cela simplifie la vue.",
    "de": "Backup-Optionen bleiben ausgeblendet, bis Sie die App bitten, die beste Option zu analysieren und vorzuschlagen."
  },
  "Journey Intelligence & Recovery Tools": {
    "hi": "यात्रा बुद्धिमत्ता और पुनर्प्राप्ति उपकरण",
    "te": "జర్నీ ఇంటెలిజెన్స్ మరియు రికవరీ టూల్స్",
    "ta": "பயண நுண்ணறிவு மற்றும் மீட்புக் கருவிகள்",
    "kn": "ಪ್ರಯಾಣ ಬುದ್ಧಿಮತ್ತೆ ಮತ್ತು ಚೇತರಿಕೆ ಪರಿಕರಗಳು",
    "ml": "യാത്രാ ഇന്റലിജൻസും റിക്കവറി ടൂളുകളും",
    "mr": "प्रवास बुद्धिमत्ता आणि पुनर्प्राप्ती साधने",
    "bn": "ভ্রমণ বুদ্ধিমত্তা এবং পুনরুদ্ধার সরঞ্জাম",
    "gu": "મુસાફરી બુદ્ધિ અને પુનઃપ્રાપ્તિ સાધનો",
    "pa": "ਯਾਤਰਾ ਬੁੱਧੀ ਅਤੇ ਰਿਕਵਰੀ ਟੂਲ",
    "ur": "سفری ذہانت اور بحالی کے اوزار",
    "es": "Inteligencia de viaje y herramientas de recuperación",
    "fr": "Intelligence de voyage et outils de récupération",
    "de": "Reise-Intelligenz und Ausweich-Tools"
  },
  "Inspect interactive route topology, bypass alternatives, delay impact, and weather hazards.": {
    "hi": "इंटरैक्टिव मार्ग टोपोलॉजी, बाईपास विकल्प, देरी के प्रभाव और मौसम के खतरों का निरीक्षण करें।",
    "te": "ఇంటరాక్టివ్ రూట్ టోపోలాజీ, బైపాస్ ప్రత్యామ్నాయాలు, ఆలస్యం ప్రభావం మరియు వాతావరణ ప్రమాదాలను తనిఖీ చేయండి.",
    "ta": "ஊடாடும் பாதை இடவியல், பைபாஸ் மாற்றுகள், தாமத தாக்கம் மற்றும் வானிலை அபாயங்களை ஆராயுங்கள்.",
    "kn": "ಸಂವಾದಾತ್ಮಕ ಮಾರ್ಗ ಸ್ಥಳಶಾಸ್ತ್ರ, ಬೈಪಾಸ್ ಪರ್ಯಾಯಗಳು, ವಿಳಂಬ ಪರಿಣಾಮ ಮತ್ತು ಹವಾಮಾನ ಅಪಾಯಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ.",
    "ml": "ഇന്ററാക്ടീവ് റൂട്ട് ടോപ്പോളജി, ബൈപാസ് ഇതരമാർഗ്ഗങ്ങൾ, കാലതാമസ ആഘാതം, കാലാവസ്ഥാ അപകടങ്ങൾ എന്നിവ പരിശോധിക്കുക.",
    "mr": "परस्परसंवादी मार्ग टोपोलॉजी, बायपास पर्याय, विलंबाचा प्रभाव आणि हवामानातील धोके तपासा.",
    "bn": "ইন্টারেক্টিভ রুট টপোলজি, বাইপাস বিকল্প, বিলম্বের প্রভাব এবং আবহাওয়ার বিপদগুলি পরীক্ষা করুন।",
    "gu": "ઇન્ટરેક્ટિવ રૂટ ટોપોલોજી, બાયપાસ વિકલ્પો, વિલંબની અસર અને હવામાનના જોખમોનું નિરીક્ષણ કરો.",
    "pa": "ਇੰਟਰਐਕਟਿਵ ਰੂਟ ਟੌਪੋਲੋਜੀ, ਬਾਈਪਾਸ ਵਿਕਲਪ, ਦੇਰੀ ਪ੍ਰਭਾਵ ਅਤੇ ਮੌਸਮ ਦੇ ਖਤਰਿਆਂ ਦੀ ਜਾਂਚ ਕਰੋ।",
    "ur": "انٹرایکٹو روٹ ٹوپولوجی، بائی پاس متبادل، تاخیر کے اثرات، اور موسمی خطرات کا معائنہ کریں۔",
    "es": "Inspeccione la topología interactiva de la ruta, las alternativas de desvío, el impacto de retrasos y los riesgos meteorológicos.",
    "fr": "Examinez la topologie interactive de l'itinéraire, les alternatives de contournement, l'impact des retards et les aléas météo.",
    "de": "Überprüfen Sie die interaktive Routentopologie, Umgehungsalternativen, Verspätungsauswirkungen und Wettergefahren."
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
console.log('Successfully added comprehensive statutory and intelligence translations!')

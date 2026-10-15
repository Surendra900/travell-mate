import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const filePath = path.join(__dirname, '../src/data/languageData.js')

const newTranslations = {
  "Unable to load direct provider results": {
    "hi": "सीधे प्रदाता परिणाम लोड करने में असमर्थ",
    "te": "ప్రత్యక్ష ప్రొవైడర్ ఫలితాలను లోడ్ చేయడం సాధ్యపడలేదు",
    "ta": "நேரடி வழங்குநர் முடிவுகளை ஏற்ற முடியவில்லை",
    "kn": "ನೇರ ಪೂರೈಕೆದಾರರ ಫಲಿತಾಂಶಗಳನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ",
    "ml": "നേരിട്ടുള്ള ദാതാവിന്റെ ഫലങ്ങൾ ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല",
    "mr": "थेट प्रदाता निकाल लोड करण्यात अक्षम",
    "bn": "সরাসরি সরবরাহকারীর ফলাফল লোড করতে অক্ষম",
    "gu": "સીધા પ્રદાતા પરિણામો લોડ કરવામાં અસમર્થ",
    "pa": "ਸਿੱਧੇ ਪ੍ਰਦਾਤਾ ਨਤੀਜੇ ਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਮਰੱਥ",
    "ur": "براہ راست فراہم کنندہ کے نتائج لوڈ کرنے میں ناکام",
    "es": "No se pueden cargar los resultados directos del proveedor",
    "fr": "Impossible de charger les résultats directs du fournisseur",
    "de": "Direkte Anbieterergebnisse können nicht geladen werden"
  },
  "Railway provider request failed. No synthetic train result was generated.": {
    "hi": "रेलवे प्रदाता अनुरोध विफल रहा। कोई कृत्रिम ट्रेन परिणाम उत्पन्न नहीं किया गया।",
    "te": "రైల్వే ప్రొవైడర్ అభ్యర్థన విఫలమైంది. సింథటిక్ రైలు ఫలితం రూపొందించబడలేదు.",
    "ta": "ரயில்வே வழங்குநர் கோரிக்கை தோல்வியடைந்தது. எந்த செயற்கை ரயில் முடிவும் உருவாக்கப்படவில்லை.",
    "kn": "ರೈಲ್ವೆ ಪೂರೈಕೆದಾರರ ವಿನಂತಿ ವಿಫಲವಾಗಿದೆ. ಯಾವುದೇ ಕೃತಕ ರೈಲು ಫಲಿತಾಂಶವನ್ನು ರಚಿಸಲಾಗಿಲ್ಲ.",
    "ml": "റെയിൽവേ ദാതാവിന്റെ അഭ്യർത്ഥന പരാജയപ്പെട്ടു. കൃത്രിമ ട്രെയിൻ ഫലങ്ങളൊന്നും സൃഷ്ടിച്ചില്ല.",
    "mr": "रेल्वे प्रदाता विनंती अयशस्वी झाली. कोणताही कृत्रिम ट्रेन निकाल व्युत्पन्न केला गेला नाही.",
    "bn": "রেলওয়ে সরবরাহকারীর অনুরোধ ব্যর্থ হয়েছে। কোনও কৃত্রিম ট্রেনের ফলাফল তৈরি করা হয়নি।",
    "gu": "રેલ્વે પ્રદાતા વિનંતી નિષ્ફળ ગઈ. કોઈ કૃત્રિમ ટ્રેન પરિણામ જનરેટ થયું નથી.",
    "pa": "ਰੇਲਵੇ ਪ੍ਰਦਾਤਾ ਬੇਨਤੀ ਅਸਫਲ ਰਹੀ। ਕੋਈ ਸਿੰਥੈਟਿਕ ਰੇਲ ਨਤੀਜਾ ਤਿਆਰ ਨਹੀਂ ਕੀਤਾ ਗਿਆ।",
    "ur": "ریلوے فراہم کنندہ کی درخواست ناکام ہوگئی۔ کوئی مصنوعی ٹرین کا نتیجہ تیار نہیں کیا گیا۔",
    "es": "Error en la solicitud al proveedor ferroviario. No se generó ningún resultado sintético.",
    "fr": "La demande auprès du fournisseur ferroviaire a échoué. Aucun résultat synthétique généré.",
    "de": "Anfrage an Bahnanbieter fehlgeschlagen. Kein synthetisches Zugergebnis generiert."
  },
  "Retry provider search": {
    "hi": "प्रदाता खोज पुनः प्रयास करें",
    "te": "ప్రొవైడర్ శోధనను మళ్లీ ప్రయత్నించండి",
    "ta": "வழங்குநர் தேடலை மீண்டும் முயற்சிக்கவும்",
    "kn": "ಪೂರೈಕೆದಾರರ ಹುಡುಕಾಟವನ್ನು ಮರುಪ್ರಯತ್ನಿಸಿ",
    "ml": "ദാതാവിന്റെ തിരയൽ വീണ്ടും ശ്രമിക്കുക",
    "mr": "प्रदाता शोध पुन्हा प्रयत्न करा",
    "bn": "সরবরাহকারী অনুসন্ধান পুনরায় চেষ্টা করুন",
    "gu": "પ્રદાતા શોધ ફરીથી પ્રયાસ કરો",
    "pa": "ਪ੍ਰਦਾਤਾ ਖੋਜ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ",
    "ur": "فراہم کنندہ کی تلاش دوبارہ آزمائیں",
    "es": "Reintentar búsqueda de proveedores",
    "fr": "Réessayer la recherche de fournisseur",
    "de": "Anbietersuche wiederholen"
  },
  "The provider API is temporarily unreachable or returned an unexpected response.": {
    "hi": "प्रदाता एपीआई अस्थायी रूप से अनुपलब्ध है या अप्रत्याशित प्रतिक्रिया दी है।",
    "te": "ప్రొవైడర్ API తాత్కాలికంగా అందుబాటులో లేదు లేదా ఊహించని ప్రతిస్పందనను అందించింది.",
    "ta": "வழங்குநர் API தற்காலிகமாக அணுக முடியவில்லை அல்லது எதிர்பாராத பதிலை அளித்தது.",
    "kn": "ಪೂರೈಕೆದಾರರ API ತಾತ್ಕಾಲಿಕವಾಗಿ ತಲುಪಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ ಅಥವಾ ಅನಿರೀಕ್ಷಿತ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ನೀಡಿದೆ.",
    "ml": "ദാതാവിന്റെ API താൽക്കാലികമായി ലഭ്യമല്ല അല്ലെങ്കിൽ അപ്രതീക്ഷിത പ്രതികരണം നൽകി.",
    "mr": "प्रदाता API तात्पुरते अनुपलब्ध आहे किंवा अनपेक्षित प्रतिसाद दिला आहे.",
    "bn": "সরবরাহকারীর API সাময়িকভাবে পৌঁছানো যাচ্ছে না বা একটি অপ্রত্যাশিত প্রতিক্রিয়া দিয়েছে।",
    "gu": "પ્રદાતા API અસ્થાયી રૂપે પહોંચી શકાતું નથી અથવા અણધારી પ્રતિક્રિયા આપી છે.",
    "pa": "ਪ੍ਰਦਾਤਾ API ਅਸਥਾਈ ਤੌਰ 'ਤੇ ਪਹੁੰਚਯੋਗ ਨਹੀਂ ਹੈ ਜਾਂ ਅਣਕਿਆਸਿਆ ਜਵਾਬ ਦਿੱਤਾ ਹੈ।",
    "ur": "فراہم کنندہ API عارضی طور پر ناقابل رسائی ہے یا غیر متوقع جواب دیا ہے۔",
    "es": "La API del proveedor no está disponible temporalmente o devolvió una respuesta inesperada.",
    "fr": "L'API du fournisseur est temporairement inaccessible ou a renvoyé une réponse inattendue.",
    "de": "Die Anbieter-API ist vorübergehend nicht erreichbar oder hat eine unerwartete Antwort zurückgegeben."
  },
  "Demo-booking notice:": {
    "hi": "डेमो-बुकिंग सूचना:",
    "te": "డెమో-బుకింగ్ నోటీసు:",
    "ta": "டெமோ முன்பதிவு அறிவிப்பு:",
    "kn": "ಡೆಮೊ-ಬುಕಿಂಗ್ ಸೂಚನೆ:",
    "ml": "ഡെമോ-ബുക്കിംഗ് അറിയിപ്പ്:",
    "mr": "डेमो-बुकिंग सूचना:",
    "bn": "ডেমো-বুকিং বিজ্ঞপ্তি:",
    "gu": "ડેમો-બુકિંગ નોટિસ:",
    "pa": "ਡੈਮੋ-ਬੁਕਿੰਗ ਨੋਟਿਸ:",
    "ur": "ڈیمو بکنگ نوٹس:",
    "es": "Aviso de reserva de demostración:",
    "fr": "Avis de réservation de démonstration :",
    "de": "Hinweis zur Demo-Buchung:"
  },
  "Choose one provider row and use \"Start demo booking\" to attach that exact provider result to the saved plan and offline view, then start the guided demo checkout when ready.": {
    "hi": "एक प्रदाता पंक्ति चुनें और उस सटीक परिणाम को सहेजी गई योजना और ऑफलाइन दृश्य में जोड़ने के लिए \"डेमो बुकिंग शुरू करें\" का उपयोग करें, फिर तैयार होने पर निर्देशित डेमो चेकआउट शुरू करें।",
    "te": "ఒక ప్రొవైడర్ వరుసను ఎంచుకుని, సేవ్ చేసిన ప్లాన్ మరియు ఆఫ్‌లైన్ వీక్షణకు ఆ ఖచ్చితమైన ఫలితాన్ని జతచేయడానికి \"డెమో బుకింగ్ ప్రారంభించండి\" ఉపయోగించండి, సిద్ధంగా ఉన్నప్పుడు గైడెడ్ డెమో చెక్‌అవుట్‌ను ప్రారంభించండి.",
    "ta": "ஒரு வழங்குநர் வரிசையைத் தேர்ந்தெடுத்து, சேமித்த திட்டம் மற்றும் ஆஃப்லைன் பார்வையில் அந்த துல்லியமான முடிவை இணைக்க \"டெமோ முன்பதிவைத் தொடங்கு\" என்பதைப் பயன்படுத்தவும், தயாராக இருக்கும்போது வழிகாட்டப்பட்ட டெமோ செக் அவுட்டைத் தொடங்கவும்.",
    "kn": "ಒಂದು ಪೂರೈಕೆದಾರರ ಸಾಲನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಉಳಿಸಿದ ಯೋಜನೆ ಮತ್ತು ಆಫ್‌ಲೈನ್ ವೀಕ್ಷಣೆಗೆ ಆ ನಿಖರವಾದ ಫಲಿತಾಂಶವನ್ನು ಲಗತ್ತಿಸಲು \"ಡೆಮೊ ಬುಕಿಂಗ್ ಪ್ರಾರಂಭಿಸಿ\" ಬಳಸಿ, ಸಿದ್ಧವಾದಾಗ ಮಾರ್ಗದರ್ಶಿ ಡೆಮೊ ಚೆಕ್‌ಔಟ್ ಪ್ರಾರಂಭಿಸಿ.",
    "ml": "ഒരു ദാതാവിന്റെ വരി തിരഞ്ഞെടുത്ത് സംരക്ഷിച്ച പ്ലാനിലേക്കും ഓഫ്‌ലൈൻ കാഴ്ചയിലേക്കും കൃത്യമായ ഫലം അറ്റാച്ചുചെയ്യാൻ \"ഡെമോ ബുക്കിംഗ് ആരംഭിക്കുക\" ഉപയോഗിക്കുക, തയ്യാറാകുമ്പോൾ ഗൈഡഡ് ഡെമോ ചെക്ക്ഔട്ട് ആരംഭിക്കുക.",
    "mr": "एक प्रदाता पंक्ती निवडा आणि तो अचूक निकाल सेव्ह केलेल्या योजनेत आणि ऑफलाइन दृश्यात जोडण्यासाठी \"डेमो बुकिंग सुरू करा\" वापरा, नंतर तयार झाल्यावर मार्गदर्शित डेमो चेकआउट सुरू करा.",
    "bn": "একটি সরবরাহকারী সারি চয়ন করুন এবং সংরক্ষিত পরিকল্পনা এবং অফলাইন দৃশ্যে সেই সঠিক ফলাফলটি সংযুক্ত করতে \"ডেমো বুকিং শুরু করুন\" ব্যবহার করুন, প্রস্তুত হলে নির্দেশিত ডেমো চেকআউট শুরু করুন।",
    "gu": "એક પ્રદાતા પંક્તિ પસંદ કરો અને સાચવેલી યોજના અને ઑફલાઇન દૃશ્યમાં તે ચોક્કસ પરિણામ જોડવા માટે \"ડેમો બુકિંગ શરૂ કરો\" નો ઉપયોગ કરો, તૈયાર થાય ત્યારે માર્ગદર્શિત ડેમો ચેકઆઉટ શરૂ કરો.",
    "pa": "ਇੱਕ ਪ੍ਰਦਾਤਾ ਕਤਾਰ ਚੁਣੋ ਅਤੇ ਉਸ ਸਟੀਕ ਨਤੀਜੇ ਨੂੰ ਸੁਰੱਖਿਅਤ ਕੀਤੀ ਯੋਜਨਾ ਅਤੇ ਔਫਲਾਈਨ ਦ੍ਰਿਸ਼ ਨਾਲ ਜੋੜਨ ਲਈ \"ਡੈਮੋ ਬੁਕਿੰਗ ਸ਼ੁਰੂ ਕਰੋ\" ਦੀ ਵਰਤੋਂ ਕਰੋ, ਤਿਆਰ ਹੋਣ 'ਤੇ ਗਾਈਡਡ ਡੈਮੋ ਚੈੱਕਆਊਟ ਸ਼ੁਰੂ ਕਰੋ।",
    "ur": "ایک فراہم کنندہ کی قطار منتخب کریں اور محفوظ شدہ پلان اور آف لائن ویو کے ساتھ اس عین مطابق نتیجے کو جوڑنے کے لیے \"ڈیمو بکنگ شروع کریں\" کا استعمال کریں، پھر تیار ہونے پر گائیڈڈ ڈیمو چیک آؤٹ شروع کریں۔",
    "es": "Elija una fila de proveedor y use \"Iniciar reserva de demostración\" para adjuntar ese resultado exacto al plan guardado y a la vista sin conexión, luego inicie el pago guiado cuando esté listo.",
    "fr": "Choisissez une ligne de fournisseur et utilisez « Démarrer la réservation de démonstration » pour associer ce résultat au plan enregistré et à la vue hors ligne, puis commencez le paiement guidé lorsque vous êtes prêt.",
    "de": "Wählen Sie eine Anbieterzeile und verwenden Sie „Demo-Buchung starten“, um das genaue Ergebnis an den gespeicherten Plan und die Offline-Ansicht anzuhängen, und starten Sie dann den geführten Demo-Checkout."
  },
  "Independent Booking Notice:": {
    "hi": "स्वतंत्र बुकिंग सूचना:",
    "te": "స్వతంత్ర బుకింగ్ నోటీసు:",
    "ta": "சுயாதீன முன்பதிவு அறிவிப்பு:",
    "kn": "ಸ್ವತಂತ್ರ ಬುಕಿಂಗ್ ಸೂಚನೆ:",
    "ml": "സ്വതന്ത്ര ബുക്കിംഗ് അറിയിപ്പ്:",
    "mr": "स्वतंत्र बुकिंग सूचना:",
    "bn": "স্বাধীন বুকিং বিজ্ঞপ্তি:",
    "gu": "સ્વતંત્ર બુકિંગ નોટિસ:",
    "pa": "ਸੁਤੰਤਰ ਬੁਕਿੰਗ ਨੋਟਿਸ:",
    "ur": "آزاد بکنگ نوٹس:",
    "es": "Aviso de reserva independiente:",
    "fr": "Avis de réservation indépendante :",
    "de": "Hinweis zu unabhängigen Buchungen:"
  },
  "Treat each selected leg as a separate booking. A delay on one leg may cause you to miss the next leg. Refund, rebooking, and compensation rights depend on the provider, ticket terms, and applicable law; TravelMate does not guarantee those remedies. Maintain a safe transfer buffer and confirm each provider's terms.": {
    "hi": "प्रत्येक चयनित चरण को एक अलग बुकिंग मानें। एक चरण में देरी के कारण आपकी अगली यात्रा छूट सकती है। रिफंड, रीबुकिंग और मुआवजे के अधिकार प्रदाता, टिकट की शर्तों और लागू कानून पर निर्भर करते हैं; TravelMate उन उपायों की गारंटी नहीं देता है। एक सुरक्षित ट्रांसफर बफ़र बनाए रखें और प्रत्येक प्रदाता की शर्तों की पुष्टि करें।",
    "te": "ఎంచుకున్న ప్రతి లెగ్‌ను ప్రత్యేక బుకింగ్‌గా పరిగణించండి. ఒక లెగ్‌లో ఆలస్యం తదుపరి లెగ్‌ను కోల్పోయేలా చేయవచ్చు. రీఫండ్, రీబుకింగ్ మరియు పరిహార హక్కులు ప్రొవైడర్, టిక్కెట్ నిబంధనలు మరియు వర్తించే చట్టంపై ఆధారపడి ఉంటాయి; TravelMate ఆ పరిష్కారాలకు హామీ ఇవ్వదు. సురక్షితమైన బదిలీ బఫర్‌ను నిర్వహించండి మరియు ప్రతి ప్రొవైడర్ నిబంధనలను నిర్ధారించండి.",
    "ta": "தேர்ந்தெடுக்கப்பட்ட ஒவ்வொரு பகுதியையும் தனித்தனி முன்பதிவாகக் கருதுங்கள். ஒரு பகுதியில் ஏற்படும் தாமதம் அடுத்த பகுதியைத் தவறவிடச் செய்யலாம். பணத்தைத் திரும்பப் பெறுதல், மறுமுன்பதிவு மற்றும் இழப்பீட்டு உரிமைகள் வழங்குநர், டிக்கெட் விதிமுறைகள் மற்றும் பொருந்தக்கூடிய சட்டத்தைப் பொறுத்தது; TravelMate அந்தத் தீர்வுகளுக்கு உத்தரவாதம் அளிக்காது. பாதுகாப்பான பரிமாற்ற இடையகத்தைப் பராமரிக்கவும் மற்றும் ஒவ்வொரு வழங்குநரின் விதிமுறைகளையும் உறுதிப்படுத்தவும்.",
    "kn": "ಆಯ್ಕೆಮಾಡಿದ ಪ್ರತಿಯೊಂದು ಲೆಗ್ ಅನ್ನು ಪ್ರತ್ಯೇಕ ಬುಕಿಂಗ್ ಎಂದು ಪರಿಗಣಿಸಿ. ಒಂದು ಲೆಗ್‌ನಲ್ಲಿನ ವಿಳಂಬವು ಮುಂದಿನ ಲೆಗ್ ಅನ್ನು ಕಳೆದುಕೊಳ್ಳಲು ಕಾರಣವಾಗಬಹುದು. ಮರುಪಾವತಿ, ಮರುಬುಕಿಂಗ್ ಮತ್ತು ಪರಿಹಾರ ಹಕ್ಕುಗಳು ಪೂರೈಕೆದಾರರು, ಟಿಕೆಟ್ ನಿಯಮಗಳು ಮತ್ತು ಅನ್ವಯವಾಗುವ ಕಾನೂನನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ; TravelMate ಆ ಪರಿಹಾರಗಳನ್ನು ಖಾತರಿಪಡಿಸುವುದಿಲ್ಲ. ಸುರಕ್ಷಿತ ವರ್ಗಾವಣೆ ಬಫರ್ ಅನ್ನು ನಿರ್ವಹಿಸಿ ಮತ್ತು ಪ್ರತಿ ಪೂರೈಕೆದಾರರ ನಿಯಮಗಳನ್ನು ದೃಢೀಕರಿಸಿ.",
    "ml": "തിരഞ്ഞെടുത്ത ഓരോ ഘട്ടവും പ്രത്യേക ബുക്കിംഗായി കണക്കാക്കുക. ഒരു ഘട്ടത്തിലെ കാലതാമസം അടുത്ത ഘട്ടം നഷ്‌ടപ്പെടാൻ ഇടയാക്കിയേക്കാം. റീഫണ്ട്, റീബുക്കിംഗ്, നഷ്ടപരിഹാര അവകാശങ്ങൾ എന്നിവ ദാതാവ്, ടിക്കറ്റ് നിബന്ധനകൾ, ബാധകമായ നിയമം എന്നിവയെ ആശ്രയിച്ചിരിക്കുന്നു; TravelMate ആ പരിഹാരങ്ങൾക്ക് ഉറപ്പ് നൽകുന്നില്ല. സുരക്ഷിതമായ ട്രാൻസ്ഫർ ബഫർ നിലനിർത്തുകയും ഓരോ ദാതാവിന്റെയും നിബന്ധനകൾ സ്ഥിരീകരിക്കുകയും ചെയ്യുക.",
    "mr": "प्रत्येक निवडलेला टप्पा वेगळे बुकिंग म्हणून समजा. एका टप्प्यातील विलंबाने तुमचा पुढचा प्रवास चुकू शकतो. परतावा, रीबुकिंग आणि भरपाईचे अधिकार प्रदाता, तिकिटाच्या अटी आणि लागू कायद्यावर अवलंबून असतात; TravelMate त्या उपायांची हमी देत नाही. सुरक्षित ट्रान्सफर बफर ठेवा आणि प्रत्येक प्रदात्याच्या अटींची पुष्टी करा.",
    "bn": "নির্বাচিত প্রতিটি অংশকে একটি পৃথক বুকিং হিসাবে বিবেচনা করুন। একটি অংশে বিলম্বের ফলে পরবর্তী অংশটি মিস হতে পারে। ফেরত, পুনঃবুকিং এবং ক্ষতিপূরণের অধিকার সরবরাহকারী, টিকিটের শর্তাবলী এবং প্রযোজ্য আইনের উপর নির্ভর করে; TravelMate সেই প্রতিকারগুলির গ্যারান্টি দেয় না। একটি নিরাপদ স্থানান্তর বাফার বজায় রাখুন এবং প্রতিটি সরবরাহকারীর শর্তাবলী নিশ্চিত করুন।",
    "gu": "પસંદ કરેલા દરેક લેગને અલગ બુકિંગ તરીકે ગણો. એક લેગમાં વિલંબ થવાથી તમારો આગળનો પ્રવાસ ચૂકી જઈ શકે છે. રિફંડ, રીબુકિંગ અને વળતરના અધિકારો પ્રદાતા, ટિકિટની શરતો અને લાગુ કાયદા પર આધાર રાખે છે; TravelMate તે ઉપાયોની ખાતરી આપતું નથી. સુરક્ષિત ટ્રાન્સફર બફર જાળવો અને દરેક પ્રદાતાની શરતોની પુષ્ટિ કરો.",
    "pa": "ਹਰੇਕ ਚੁਣੇ ਗਏ ਪੜਾਅ ਨੂੰ ਇੱਕ ਵੱਖਰੀ ਬੁਕਿੰਗ ਵਜੋਂ ਮੰਨੋ। ਇੱਕ ਪੜਾਅ ਵਿੱਚ ਦੇਰੀ ਤੁਹਾਡੇ ਅਗਲੇ ਪੜਾਅ ਨੂੰ ਖੁੰਝਾਉਣ ਦਾ ਕਾਰਨ ਬਣ ਸਕਦੀ ਹੈ। ਰਿਫੰਡ, ਰੀਬੁਕਿੰਗ ਅਤੇ ਮੁਆਵਜ਼ੇ ਦੇ ਅਧਿਕਾਰ ਪ੍ਰਦਾਤਾ, ਟਿਕਟ ਦੀਆਂ ਸ਼ਰਤਾਂ ਅਤੇ ਲਾਗੂ ਕਾਨੂੰਨ 'ਤੇ ਨਿਰਭਰ ਕਰਦੇ ਹਨ; TravelMate ਉਨ੍ਹਾਂ ਉਪਾਵਾਂ ਦੀ ਗਰੰਟੀ ਨਹੀਂ ਦਿੰਦਾ। ਇੱਕ ਸੁਰੱਖਿਅਤ ਟ੍ਰਾਂਸਫਰ ਬਫਰ ਬਣਾਈ ਰੱਖੋ ਅਤੇ ਹਰੇਕ ਪ੍ਰਦਾਤਾ ਦੀਆਂ ਸ਼ਰਤਾਂ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।",
    "ur": "ہر منتخب شدہ مرحلے کو ایک الگ بکنگ سمجھیں۔ ایک مرحلے میں تاخیر آپ کے اگلے مرحلے کو چھوڑنے کا سبب بن سکتی ہے۔ رقم کی واپسی، دوبارہ بکنگ، اور معاوضے کے حقوق فراہم کنندہ، ٹکٹ کی شرائط اور قابل اطلاق قانون پر منحصر ہیں؛ TravelMate ان علاجوں کی ضمانت نہیں دیتا۔ ایک محفوظ منتقلی بفر کو برقرار رکھیں اور ہر فراہم کنندہ کی شرائط کی تصدیق کریں۔",
    "es": "Considere cada tramo seleccionado como una reserva independiente. Un retraso en un tramo puede hacer que pierda el siguiente. Los derechos de reembolso, cambio de billete y compensación dependen del proveedor, de las condiciones del billete y de la ley aplicable; TravelMate no garantiza tales soluciones. Mantenga un margen seguro de transbordo y confirme las condiciones de cada proveedor.",
    "fr": "Traitez chaque tronçon comme une réservation distincte. Un retard sur un tronçon peut vous faire manquer le suivant. Les droits de remboursement, réacheminement et indemnisation dépendent du fournisseur, des conditions du billet et de la loi applicable; TravelMate ne garantit pas ces recours. Prévoyez une marge de correspondance sûre et confirmez les conditions de chaque fournisseur.",
    "de": "Behandeln Sie jede ausgewählte Teilstrecke als separate Buchung. Eine Verspätung auf einer Teilstrecke kann zum Verpassen der nächsten führen. Erstattungs-, Umbuchungs- und Entschädigungsrechte hängen vom Anbieter, den Ticketbedingungen und dem geltenden Recht ab; TravelMate garantiert diese Rechtsmittel nicht. Halten Sie einen sicheren Umsteigepuffer ein und bestätigen Sie die Bedingungen der Anbieter."
  },
  "Transparent Data Layer": {
    "hi": "पारदर्शी डेटा परत",
    "te": "పారదర్శక డేటా లేయర్",
    "ta": "வெளிப்படையான தரவு அடுக்கு",
    "kn": "ಪಾರದರ್ಶಕ ಡೇಟಾ ಪದರ",
    "ml": "സുതാര്യമായ ഡാറ്റ ലെയർ",
    "mr": "पारदर्शक डेटा स्तर",
    "bn": "স্বচ্ছ ডেটা স্তর",
    "gu": "પારદર્શક ડેટા સ્તર",
    "pa": "ਪਾਰਦਰਸ਼ੀ ਡੇਟਾ ਪਰਤ",
    "ur": "شفاف ڈیٹا لیئر",
    "es": "Capa de datos transparente",
    "fr": "Couche de données transparente",
    "de": "Transparente Datenschicht"
  },
  "TRANSPARENT DATA LAYER": {
    "hi": "पारदर्शी डेटा परत",
    "te": "పారదర్శక డేటా లేయర్",
    "ta": "வெளிப்படையான தரவு அடுக்கு",
    "kn": "ಪಾರದರ್ಶಕ ಡೇಟಾ ಪದರ",
    "ml": "സുതാര്യമായ ഡാറ്റ ലെയർ",
    "mr": "पारदर्शक डेटा स्तर",
    "bn": "স্বচ্ছ ডেটা স্তর",
    "gu": "પારદર્શક ડેટા સ્તર",
    "pa": "ਪਾਰਦਰਸ਼ੀ ਡੇਟਾ ਪਰਤ",
    "ur": "شفاف ڈیٹا لیئر",
    "es": "CAPA DE DATOS TRANSPARENTE",
    "fr": "COUCHE DE DONNÉES TRANSPARENTE",
    "de": "TRANSPARENTE DATENSCHICHT"
  },
  "Every travel result is source-labeled": {
    "hi": "प्रत्येक यात्रा परिणाम स्रोत-लेबल है",
    "te": "ప్రతి ప్రయాణ ఫలితం మూలం-లేబుల్ చేయబడింది",
    "ta": "ஒவ்வொரு பயண முடிவும் மூல-லேபிளிடப்பட்டது",
    "kn": "ಪ್ರತಿಯೊಂದು ಪ್ರಯಾಣದ ಫಲಿತಾಂಶವು ಮೂಲ-ಲೇಬಲ್ ಆಗಿದೆ",
    "ml": "ഓരോ യാത്രാ ഫലവും ഉറവിടം ലേബൽ ചെയ്തിരിക്കുന്നു",
    "mr": "प्रत्येक प्रवास निकाल स्रोत-लेबल आहे",
    "bn": "প্রতিটি ভ্রমণ ফলাফল উৎস-লেবেলযুক্ত",
    "gu": "દરેક પ્રવાસ પરિણામ સ્ત્રોત-લેબલ થયેલ છે",
    "pa": "ਹਰੇਕ ਯਾਤਰਾ ਨਤੀਜਾ ਸਰੋਤ-ਲੇਬਲ ਕੀਤਾ ਗਿਆ ਹੈ",
    "ur": "ہر سفری نتیجہ ماخذ لیبل شدہ ہے",
    "es": "Cada resultado de viaje está etiquetado según su fuente",
    "fr": "Chaque résultat de voyage est étiqueté selon sa source",
    "de": "Jedes Reiseergebnis ist mit der Datenquelle gekennzeichnet"
  },
  "TravelMate does not present local estimates as live inventory. Cards clearly show whether data is an authenticated live API, a curated timetable, or requires provider verification.": {
    "hi": "TravelMate स्थानीय अनुमानों को लाइव इन्वेंट्री के रूप में प्रस्तुत नहीं करता है। कार्ड स्पष्ट रूप से दिखाते हैं कि डेटा एक प्रमाणित लाइव एपीआई है, एक क्यूरेटेड समय सारणी है, या प्रदाता सत्यापन की आवश्यकता है।",
    "te": "TravelMate స్థానిక అంచనాలను ప్రత్యక్ష జాబితాగా చూపించదు. డేటా ప్రామాణీకరించబడిన ప్రత్యక్ష API కాదా, నిర్వహించబడిన సమయ పట్టికా లేదా ప్రొవైడర్ ధృవీకరణ అవసరమా అని కార్డ్‌లు స్పష్టంగా చూపుతాయి.",
    "ta": "TravelMate உள்ளூர் மதிப்பீடுகளை நேரடி சரக்குகளாகக் காட்டாது. தரவு அங்கீகரிக்கப்பட்ட நேரடி API ஆ, நிர்வகிக்கப்பட்ட கால அட்டவணையா அல்லது வழங்குநர் சரிபார்ப்பு தேவையா என்பதை கார்டுகள் தெளிவாகக் காட்டுகின்றன.",
    "kn": "TravelMate ಸ್ಥಳೀಯ ಅಂದಾಜುಗಳನ್ನು ಲೈವ್ ಇನ್ವೆಂಟರಿಯಾಗಿ ಪ್ರಸ್ತುತಪಡಿಸುವುದಿಲ್ಲ. ಡೇಟಾವು ದೃಢೀಕೃತ ಲೈವ್ API ಆಗಿದೆಯೇ, ಕ್ಯುರೇಟೆಡ್ ವೇಳಾಪಟ್ಟಿಯಾಗಿದೆಯೇ ಅಥವಾ ಪೂರೈಕೆದಾರರ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆಯೇ ಎಂಬುದನ್ನು ಕಾರ್ಡ್‌ಗಳು ಸ್ಪಷ್ಟವಾಗಿ ತೋರಿಸುತ್ತವೆ.",
    "ml": "TravelMate പ്രാദേശിക എസ്റ്റിമേറ്റുകൾ തത്സമയ ഇൻവെന്ററിയായി അവതരിപ്പിക്കുന്നില്ല. ഡാറ്റ പ്രാമാണീകരിച്ച തത്സമയ API ആണോ, ക്യൂറേറ്റ് ചെയ്‌ത ടൈംടേബിളാണോ അതോ ദാതാവിന്റെ സ്ഥിരീകരണം ആവശ്യമാണോ എന്ന് കാർഡുകൾ വ്യക്തമായി കാണിക്കുന്നു.",
    "mr": "TravelMate स्थानिक अंदाजांना थेट यादी म्हणून सादर करत नाही. कार्ड्स स्पष्टपणे दर्शवतात की डेटा प्रमाणीकृत थेट API आहे, क्युरेट केलेले वेळापत्रक आहे की प्रदाता पडताळणी आवश्यक आहे.",
    "bn": "TravelMate স্থানীয় অনুমানগুলিকে লাইভ ইনভেন্টরি হিসাবে উপস্থাপন করে না। কার্ডগুলি স্পষ্টভাবে দেখায় যে ডেটা একটি প্রমাণীকৃত লাইভ API, একটি সংগৃহীত সময়সূচী, নাকি সরবরাহকারী যাচাইকরণ প্রয়োজন।",
    "gu": "TravelMate સ્થાનિક અંદાજોને લાઈવ ઈન્વેન્ટરી તરીકે રજૂ કરતું નથી. કાર્ડ્સ સ્પષ્ટપણે દર્શાવે છે કે ડેટા પ્રમાણિત લાઈવ API છે, ક્યુરેટ કરેલ સમયપત્રક છે કે પ્રદાતા ચકાસણીની જરૂર છે.",
    "pa": "TravelMate ਸਥਾਨਕ ਅਨੁਮਾਨਾਂ ਨੂੰ ਲਾਈਵ ਵਸਤੂ ਸੂਚੀ ਵਜੋਂ ਪੇਸ਼ ਨਹੀਂ ਕਰਦਾ। ਕਾਰਡ ਸਪਸ਼ਟ ਤੌਰ 'ਤੇ ਦਿਖਾਉਂਦੇ ਹਨ ਕਿ ਡੇਟਾ ਇੱਕ ਪ੍ਰਮਾਣਿਤ ਲਾਈਵ API ਹੈ, ਇੱਕ ਚੁਣਿਆ ਹੋਇਆ ਸਮਾਂ ਸਾਰਣੀ ਹੈ, ਜਾਂ ਪ੍ਰਦਾਤਾ ਦੀ ਪੁਸ਼ਟੀ ਦੀ ਲੋੜ ਹੈ।",
    "ur": "TravelMate مقامی تخمینوں کو لائیو انوینٹری کے طور پر پیش نہیں کرتا ہے۔ کارڈز واضح طور پر دکھاتے ہیں کہ آیا ڈیٹا ایک مصدقہ لائیو API ہے، ایک تیار کردہ ٹائم ٹیبل ہے، یا فراہم کنندہ کی تصدیق درکار ہے۔",
    "es": "TravelMate no presenta estimaciones locales como inventario en vivo. Las tarjetas muestran claramente si los datos son una API en vivo autenticada, un horario verificado o requieren verificación del proveedor.",
    "fr": "TravelMate ne présente pas les estimations locales comme un inventaire en direct. Les fiches indiquent clairement si les données proviennent d'une API en direct, d'un horaire vérifié ou nécessitent une vérification.",
    "de": "TravelMate stellt lokale Schätzungen nicht als Live-Inventar dar. Karten zeigen deutlich, ob Daten von einer authentifizierten Live-API stammen, ein verifizierter Fahrplan sind oder eine Bestätigung erfordern."
  },
  "API-ready backend": {
    "hi": "एपीआई-तैयार बैकएंड",
    "te": "API-సిద్ధమైన బ్యాకెండ్",
    "ta": "API-தயாரான பின்தளம்",
    "kn": "API-ಸಿದ್ಧ ಬ್ಯಾಕೆಂಡ್",
    "ml": "API-തയ്യാറായ ബാക്കെൻഡ്",
    "mr": "API-तयार बॅकएंड",
    "bn": "API-প্রস্তুত ব্যাকএন্ড",
    "gu": "API-તૈયાર બેકએન્ડ",
    "pa": "API-ਤਿਆਰ ਬੈਕਐਂਡ",
    "ur": "API کے لیے تیار بیک اینڈ",
    "es": "Backend preparado para API",
    "fr": "Backend prêt pour API",
    "de": "API-fähiges Backend"
  },
  "Offline planning examples": {
    "hi": "ऑफलाइन योजना उदाहरण",
    "te": "ఆఫ్‌లైన్ ప్లానింగ్ ఉదాహరణలు",
    "ta": "ஆஃப்லைன் திட்டமிடல் எடுத்துக்காட்டுகள்",
    "kn": "ಆಫ್‌ಲೈನ್ ಯೋಜನೆ ಉದಾಹರಣೆಗಳು",
    "ml": "ഓഫ്‌ലൈൻ ആസൂത്രണ ഉదాഹരണങ്ങൾ",
    "mr": "ऑफलाइन नियोजन उदाहरणे",
    "bn": "অফলাইন পরিকল্পনার উদাহরণ",
    "gu": "ઑફલાઇન આયોજન ઉદાહરણો",
    "pa": "ਔਫਲਾਈਨ ਯੋਜਨਾਬੰਦੀ ਦੀਆਂ ਉਦਾਹਰਣਾਂ",
    "ur": "آف لائن منصوبہ بندی کی مثالیں",
    "es": "Ejemplos de planificación sin conexión",
    "fr": "Exemples de planification hors ligne",
    "de": "Offline-Planungsbeispiele"
  },
  "Direct Train Services": {
    "hi": "सीधी ट्रेन सेवाएं",
    "te": "ప్రత్యక్ష రైలు సేవలు",
    "ta": "நேரடி ரயில் சேவைகள்",
    "kn": "ನೇರ ರೈಲು ಸೇವೆಗಳು",
    "ml": "നേരിട്ടുള്ള ട്രെയിൻ സർവീസുകൾ",
    "mr": "थेट रेल्वे सेवा",
    "bn": "সরাসরি ট্রেন পরিষেবা",
    "gu": "સીધી ટ્રેન સેવાઓ",
    "pa": "ਸਿੱਧੀਆਂ ਰੇਲ ਸੇਵਾਵਾਂ",
    "ur": "براہ راست ٹرین کی خدمات",
    "es": "Servicios directos de tren",
    "fr": "Services de train directs",
    "de": "Direkte Zugverbindungen"
  },
  "Direct Flight Services": {
    "hi": "सीधी उड़ान सेवाएं",
    "te": "ప్రత్యక్ష విమాన సేవలు",
    "ta": "நேரடி விமான சேவைகள்",
    "kn": "ನೇರ ವಿಮಾನ ಸೇವೆಗಳು",
    "ml": "നേരിട്ടുള്ള ഫ്ലൈറ്റ് സർവീസുകൾ",
    "mr": "थेट विमान सेवा",
    "bn": "সরাসরি ফ্লাইট পরিষেবা",
    "gu": "સીધી ફ્લાઇટ સેવાઓ",
    "pa": "ਸਿੱਧੀਆਂ ਉਡਾਣ ਸੇਵਾਵਾਂ",
    "ur": "براہ راست پرواز کی خدمات",
    "es": "Servicios directos de vuelo",
    "fr": "Services de vol directs",
    "de": "Direkte Flugverbindungen"
  },
  "Direct Bus Services": {
    "hi": "सीधी बस सेवाएं",
    "te": "ప్రత్యక్ష బస్సు సేవలు",
    "ta": "நேரடி பேருந்து சேவைகள்",
    "kn": "ನೇರ ಬಸ್ಸು ಸೇವೆಗಳು",
    "ml": "നേരിട്ടുള്ള ബസ് സർവീസുകൾ",
    "mr": "थेट बस सेवा",
    "bn": "সরাসরি বাস পরিষেবা",
    "gu": "સીધી બસ સેવાઓ",
    "pa": "ਸਿੱਧੀਆਂ ਬੱਸ ਸੇਵਾਵਾਂ",
    "ur": "براہ راست بس کی خدمات",
    "es": "Servicios directos de autobús",
    "fr": "Services de bus directs",
    "de": "Direkte Busverbindungen"
  },
  "No direct train seats available": {
    "hi": "कोई सीधी ट्रेन सीट उपलब्ध नहीं है",
    "te": "ప్రత్యక్ష రైలు సీట్లు అందుబాటులో లేవు",
    "ta": "நேரடி ரயில் இருக்கைகள் கிடைக்கவில்லை",
    "kn": "ಯಾವುದೇ ನೇರ ರೈಲು ಸೀಟುಗಳು ಲಭ್ಯವಿಲ್ಲ",
    "ml": "നേരിട്ടുള്ള ട്രെയിൻ സീറ്റുകൾ ലഭ്യമല്ല",
    "mr": "थेट ट्रेन सीट्स उपलब्ध नाहीत",
    "bn": "কোন সরাসরি ট্রেনের আসন উপলব্ধ নেই",
    "gu": "કોઈ સીધી ટ્રેન સીટ ઉપલબ્ધ નથી",
    "pa": "ਕੋਈ ਸਿੱਧੀ ਰੇਲ ਸੀਟ ਉਪਲਬਧ ਨਹੀਂ ਹੈ",
    "ur": "کوئی براہ راست ٹرین کی نشستیں دستیاب نہیں ہیں",
    "es": "No hay asientos directos de tren disponibles",
    "fr": "Aucune place de train direct disponible",
    "de": "Keine direkten Zugplätze verfügbar"
  },
  "RapidAPI IRCTC / Aviationstack response from serverless backend.": {
    "hi": "सर्वरलेस बैकएंड से RapidAPI IRCTC / एविएशनस्टैक प्रतिक्रिया।",
    "te": "సర్వర్‌లెస్ బ్యాకెండ్ నుండి RapidAPI IRCTC / Aviationstack ప్రతిస్పందన.",
    "ta": "சர்வர்லெஸ் பின்தளத்திலிருந்து RapidAPI IRCTC / Aviationstack பதில்.",
    "kn": "ಸರ್ವರ್‌ಲೆಸ್ ಬ್ಯಾಕೆಂಡ್‌ನಿಂದ RapidAPI IRCTC / Aviationstack ಪ್ರತಿಕ್ರಿಯೆ.",
    "ml": "സെർവർലെസ് ബാക്കെൻഡിൽ നിന്നുള്ള RapidAPI IRCTC / Aviationstack പ്രതികരണം.",
    "mr": "सर्व्हरलेस बॅकएंडकडून RapidAPI IRCTC / Aviationstack प्रतिसाद.",
    "bn": "সার্ভারলেস ব্যাকএন্ড থেকে RapidAPI IRCTC / Aviationstack প্রতিক্রিয়া।",
    "gu": "સર્વરલેસ બેકએન્ડ તરફથી RapidAPI IRCTC / Aviationstack પ્રતિસાદ.",
    "pa": "ਸਰਵਰ ਰਹਿਤ ਬੈਕਐਂਡ ਤੋਂ RapidAPI IRCTC / Aviationstack ਜਵਾਬ।",
    "ur": "سرور لیس بیک اینڈ سے RapidAPI IRCTC / Aviationstack کا جواب۔",
    "es": "Respuesta de RapidAPI IRCTC / Aviationstack del backend sin servidor.",
    "fr": "Réponse RapidAPI IRCTC / Aviationstack du backend sans serveur.",
    "de": "RapidAPI IRCTC / Aviationstack-Antwort vom serverlosen Backend."
  },
  "Curated local route examples for planning; not live inventory.": {
    "hi": "योजना के लिए क्यूरेटेड स्थानीय मार्ग उदाहरण; लाइव इन्वेंट्री नहीं।",
    "te": "ప్లానింగ్ కోసం నిర్వహించబడిన స్థానిక మార్గాల ఉదాహరణలు; ప్రత్యక్ష ఇన్వెంటరీ కాదు.",
    "ta": "திட்டமிடலுக்கான நிர்வகிக்கப்பட்ட உள்ளூர் வழி உதாரணங்கள்; நேரடி இருப்பு அல்ல.",
    "kn": "ಯೋಜನೆಗಾಗಿ ಕ್ಯುರೇಟೆಡ್ ಸ್ಥಳೀಯ ಮಾರ್ಗದ ಉದಾಹರಣೆಗಳು; ಲೈವ್ ದಾಸ್ತಾನು ಅಲ್ಲ.",
    "ml": "ആസൂത്രണത്തിനായി തയ്യാറാക്കിയ പ്രാദേശിക റൂട്ട് ഉദാഹരണങ്ങൾ; തത്സമയ ഇൻവെന്ററി അല്ല.",
    "mr": "नियोजनासाठी क्युरेट केलेली स्थानिक मार्ग उदाहरणे; थेट यादी नाही.",
    "bn": "পরিকল্পনার জন্য সংগৃহীত স্থানীয় রুটের উদাহরণ; লাইভ ইনভেন্টরি নয়।",
    "gu": "આયોજન માટે ક્યુરેટ કરેલ સ્થાનિક રૂટ ઉદાહરણો; લાઇવ ઇન્વેન્ટરી નથી.",
    "pa": "ਯੋਜਨਾਬੰਦੀ ਲਈ ਚੁਣੀਆਂ ਗਈਆਂ ਸਥਾਨਕ ਰੂਟ ਉਦਾਹਰਣਾਂ; ਲਾਈਵ ਵਸਤੂ ਸੂਚੀ ਨਹੀਂ।",
    "ur": "منصوبہ بندی کے لیے تیار کردہ مقامی راستے کی مثالیں؛ لائیو انوینٹری نہیں۔",
    "es": "Ejemplos de rutas locales seleccionadas para la planificación; no es inventario en vivo.",
    "fr": "Exemples d'itinéraires locaux sélectionnés pour la planification ; pas d'inventaire en direct.",
    "de": "Kuratierte lokale Routenbeispiele für die Planung; kein Live-Inventar."
  },
  "Offline/local estimate shown when an API is missing, blocked, or empty.": {
    "hi": "एपीआई गायब, अवरुद्ध या खाली होने पर ऑफ़लाइन/स्थानीय अनुमान दिखाया गया है।",
    "te": "API లేనప్పుడు, బ్లాక్ చేయబడినప్పుడు లేదా ఖాళీగా ఉన్నప్పుడు ఆఫ్‌లైన్/స్థానిక అంచనా చూపబడుతుంది.",
    "ta": "ஒரு API விடுபட்டிருக்கும்போது, தடுக்கப்படும்போது அல்லது காலியாக இருக்கும்போது ஆஃப்லைன்/உள்ளூர் மதிப்பீடு காட்டப்படுகிறது.",
    "kn": "API ಕಾಣೆಯಾದಾಗ, ನಿರ್ಬಂಧಿಸಿದಾಗ ಅಥವಾ ಖಾಲಿಯಾಗಿರುವಾಗ ಆಫ್‌ಲೈನ್/ಸ್ಥಳೀಯ ಅಂದಾಜು ತೋರಿಸಲಾಗುತ್ತದೆ.",
    "ml": "ഒരു API കാണാതാവുകയോ ബ്ലോക്ക് ചെയ്യപ്പെടുകയോ ശൂന്യമാവുകയോ ചെയ്യുമ്പോൾ ഓഫ്‌ലൈൻ/പ്രാദേശിക എസ്റ്റിമേറ്റ് കാണിക്കുന്നു.",
    "mr": "API गहाळ, ब्लॉक किंवा रिकामे असताना ऑफलाइन/स्थानिक अंदाज दाखवला जातो.",
    "bn": "একটি API অনুপস্থিত, অবরুদ্ধ বা খালি থাকলে অফলাইন/স্থানীয় অনুমান দেখানো হয়।",
    "gu": "જ્યારે API ગુમ હોય, અવરોધિત હોય અથવા ખાલી હોય ત્યારે ઑફલાઇન/સ્થાનિક અંદાજ બતાવવામાં આવે છે.",
    "pa": "ਜਦੋਂ ਕੋਈ API ਗੁੰਮ ਹੁੰਦਾ ਹੈ, ਬਲੌਕ ਹੁੰਦਾ ਹੈ ਜਾਂ ਖਾਲੀ ਹੁੰਦਾ ਹੈ ਤਾਂ ਔਫਲਾਈਨ/ਸਥਾਨਕ ਅਨੁਮਾਨ ਦਿਖਾਇਆ ਜਾਂਦਾ ਹੈ।",
    "ur": "API غائب، مسدود یا خالی ہونے پر آف لائن/مقامی تخمینہ دکھایا گیا ہے۔",
    "es": "Estimación local/fuera de línea mostrada cuando falta una API, está bloqueada o vacía.",
    "fr": "Estimation locale/hors ligne affichée lorsqu'une API est manquante, bloquée ou vide.",
    "de": "Lokale/Offline-Schätzung, wenn eine API fehlt, blockiert oder leer ist."
  },
  "Final fare, seat, PNR, payment, and ticket issue must be verified by an official provider.": {
    "hi": "अंतिम किराया, सीट, पीएनआर, भुगतान और टिकट जारी करने का आधिकारिक प्रदाता द्वारा सत्यापन किया जाना चाहिए।",
    "te": "చివరి ఛార్జీ, సీటు, PNR, చెల్లింపు మరియు టిక్కెట్ జారీని అధికారిక ప్రొవైడర్ ద్వారా ధృవీకరించాలి.",
    "ta": "இறுதிக் கட்டணம், இருக்கை, PNR, கட்டணம் மற்றும் டிக்கெட் வழங்குதல் அதிகாரப்பூர்வ வழங்குநரால் சரிபார்க்கப்பட வேண்டும்.",
    "kn": "ಅಂತಿಮ ದರ, ಆಸನ, PNR, ಪಾವತಿ ಮತ್ತು ಟಿಕೆಟ್ ವಿತರಣೆಯನ್ನು ಅಧಿಕೃತ ಪೂರೈಕೆದಾರರಿಂದ ಪರಿಶೀಲಿಸಬೇಕು.",
    "ml": "അവസാന നിരക്ക്, സീറ്റ്, PNR, പേയ്‌മെന്റ്, ടിക്കറ്റ് ഇഷ്യു എന്നിവ ഔദ്യോഗിക ദാതാവ് സ്ഥിരീകരിക്കണം.",
    "mr": "अंतिम भाडे, जागा, पीएनआर, पेमेंट आणि तिकीट जारी करणे अधिकृत प्रदात्याद्वारे सत्यापित केले जाणे आवश्यक आहे.",
    "bn": "চূড়ান্ত ভাড়া, আসন, PNR, অর্থপ্রদান এবং টিকিট ইস্যু একটি অফিসিয়াল সরবরাহকারী দ্বারা যাচাই করা আবশ্যক।",
    "gu": "અંતિમ ભાડું, બેઠક, PNR, ચુકવણી અને ટિકિટ ઇશ્યૂ સત્તાવાર પ્રદાતા દ્વારા ચકાસવામાં આવવી જોઈએ.",
    "pa": "ਅੰਤਿਮ ਕਿਰਾਇਆ, ਸੀਟ, PNR, ਭੁਗਤਾਨ ਅਤੇ ਟਿਕਟ ਜਾਰੀ ਕਰਨ ਦੀ ਪੁਸ਼ਟੀ ਇੱਕ ਅਧਿਕਾਰਤ ਪ੍ਰਦਾਤਾ ਦੁਆਰਾ ਕੀਤੀ ਜਾਣੀ ਚਾਹੀਦੀ ਹੈ।",
    "ur": "حتمی کرایہ، سیٹ، PNR، ادائیگی، اور ٹکٹ کے اجراء کی تصدیق ایک سرکاری فراہم کنندہ سے ہونی چاہیے۔",
    "es": "La tarifa final, asiento, PNR, pago y emisión de boletos deben verificarse con un proveedor oficial.",
    "fr": "Le tarif final, la place, le PNR, le paiement et l'émission du billet doivent être vérifiés par un fournisseur officiel.",
    "de": "Der endgültige Fahrpreis, Sitzplatz, PNR, Zahlung und Ticketausstellung müssen von einem offiziellen Anbieter überprüft werden."
  },
  "Verify official source before booking": {
    "hi": "बुकिंग से पहले आधिकारिक स्रोत सत्यापित करें",
    "te": "బుకింగ్ చేయడానికి ముందు అధికారిక మూలాన్ని ధృవీకరించండి",
    "ta": "முன்பதிவு செய்வதற்கு முன் அதிகாரப்பூர்வ மூலத்தை சரிபார்க்கவும்",
    "kn": "ಬುಕಿಂಗ್ ಮಾಡುವ ಮೊದಲು ಅಧಿಕೃತ ಮೂಲವನ್ನು ಪರಿಶೀಲಿಸಿ",
    "ml": "ബുക്കിംഗ് ചെയ്യുന്നതിന് മുമ്പ് ഔദ്യോഗിക ഉറവിടം സ്ഥിരീകരിക്കുക",
    "mr": "बुकिंग करण्यापूर्वी अधिकृत स्रोत सत्यापित करा",
    "bn": "বুকিং করার আগে অফিসিয়াল উৎস যাচাই করুন",
    "gu": "બુકિંગ કરતા પહેલા સત્તાવાર સ્ત્રોત ચકાસો",
    "pa": "ਬੁਕਿੰਗ ਤੋਂ ਪਹਿਲਾਂ ਅਧਿਕਾਰਤ ਸਰੋਤ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
    "ur": "بکنگ سے پہلے سرکاری ذریعہ کی تصدیق کریں",
    "es": "Verifique la fuente oficial antes de reservar",
    "fr": "Vérifiez la source officielle avant de réserver",
    "de": "Vor der Buchung die offizielle Quelle überprüfen"
  }
}

let content = fs.readFileSync(filePath, 'utf8')

// Parse OFFLINE_UI_TRANSLATIONS block
// For each language, insert the new translations
for (const [englishKey, translationsByLang] of Object.entries(newTranslations)) {
  for (const [lang, translatedValue] of Object.entries(translationsByLang)) {
    const langHeader = `  "${lang}": {\n`
    const insertIndex = content.indexOf(langHeader)
    if (insertIndex !== -1) {
      const insertion = `    ${JSON.stringify(englishKey)}: ${JSON.stringify(translatedValue)},\n`
      if (!content.includes(`"${lang}": {\n${insertion}`) && !content.includes(insertion)) {
        content = content.slice(0, insertIndex + langHeader.length) + insertion + content.slice(insertIndex + langHeader.length)
      }
    }
  }
}

fs.writeFileSync(filePath, content, 'utf8')
console.log('Successfully injected new UI translations into OFFLINE_UI_TRANSLATIONS in languageData.js!')

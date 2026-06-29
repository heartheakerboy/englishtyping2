// Multi-language word corpora + RTL metadata.
// Each pool keeps the 80–120 most common words; large enough for a satisfying
// random-word stream without ballooning the bundle. AI generation is used for
// paragraphs/quotes per language at runtime.

export type LanguageCode =
  | "english"
  | "hindi"
  | "marathi"
  | "gujarati"
  | "tamil"
  | "telugu"
  | "punjabi"
  | "arabic"
  | "spanish"
  | "french"
  | "german";

export interface LanguageDef {
  code: LanguageCode;
  label: string;
  native: string;
  rtl: boolean;
  font?: string; // optional css font-family override
  words: string[];
  sampleQuote: string;
}

const COMMON_ENGLISH =
  "the of and to in a is that for it as was with be by on not he this are or his from at which but have an had they you were their one all we can her has there been if more when will would who so no said what up its about into than them only some could time other new two may first then do any my now such like our over man me even most made also after did many before must through back years where much your way well down should because each just".split(
    " ",
  );

const HINDI =
  "और एक के में को है का यह कि से वह नहीं हैं था के लिए पर अपने या ने तो हम भी कोई अब जो तक कुछ इस यदि जब तब क्या कैसे क्यों कहाँ कौन कितना सब बहुत थोड़ा सही गलत अच्छा बुरा बड़ा छोटा नया पुराना दिन रात समय साल लोग आदमी औरत बच्चा घर देश शहर गाँव पानी आग हवा धरती सूरज चाँद तारा फूल पेड़ नदी सागर पहाड़ रास्ता काम पैसा प्यार जीवन मृत्यु".split(
    " ",
  );

const MARATHI =
  "आणि एक मध्ये आहे हे ते मी तू तो ती आम्ही तुम्ही ते माझे तुझे त्याचे तिचे आपले काय कोण कुठे कधी कसे का होय नाही पण जर तर मग नंतर आता आज उद्या काल दिवस रात्र वेळ वर्ष माणूस स्त्री मूल घर देश शहर गाव पाणी आग वारा पृथ्वी सूर्य चंद्र तारा फूल झाड नदी समुद्र डोंगर रस्ता काम पैसा प्रेम जीवन मरण चांगले वाईट मोठे लहान नवीन जुने".split(
    " ",
  );

const GUJARATI =
  "અને એક માં છે હું તું તે અમે તમે તેઓ મારું તારું તેનું શું કોણ ક્યાં ક્યારે કેવી રીતે કેમ હા ના પણ જો તો પછી હવે આજે કાલ આવતી ગઈ દિવસ રાત સમય વર્ષ માણસ સ્ત્રી બાળક ઘર દેશ શહેર ગામ પાણી આગ હવા ધરતી સૂર્ય ચંદ્ર તારો ફૂલ ઝાડ નદી સમુદ્ર પર્વત રસ્તો કામ પૈસા પ્રેમ જીવન મૃત્યુ સારું ખરાબ મોટું નાનું નવું જૂનું".split(
    " ",
  );

const TAMIL =
  "மற்றும் ஒரு உள்ளே இருக்கிறது அது இது நான் நீ அவன் அவள் நாம் நீங்கள் அவர்கள் என்ன யார் எங்கே எப்போது எப்படி ஏன் ஆம் இல்லை ஆனால் என்றால் பிறகு இப்போது இன்று நாளை நேற்று நாள் இரவு நேரம் வருடம் மனிதன் பெண் குழந்தை வீடு நாடு நகரம் கிராமம் தண்ணீர் நெருப்பு காற்று பூமி சூரியன் சந்திரன் நட்சத்திரம் பூ மரம் ஆறு கடல் மலை சாலை வேலை பணம் அன்பு வாழ்க்கை மரணம் நல்லது கெட்டது பெரியது சிறியது புதியது பழையது".split(
    " ",
  );

const TELUGU =
  "మరియు ఒక లో ఉంది అది ఇది నేను నీవు అతను ఆమె మనం మీరు వారు ఏమి ఎవరు ఎక్కడ ఎప్పుడు ఎలా ఎందుకు అవును కాదు కానీ అయితే తర్వాత ఇప్పుడు ఈరోజు రేపు నిన్న రోజు రాత్రి సమయం సంవత్సరం మనిషి స్త్రీ పిల్లవాడు ఇల్లు దేశం నగరం గ్రామం నీరు అగ్ని గాలి భూమి సూర్యుడు చంద్రుడు నక్షత్రం పువ్వు చెట్టు నది సముద్రం పర్వతం రహదారి పని డబ్బు ప్రేమ జీవితం మరణం మంచిది చెడ్డది పెద్దది చిన్నది కొత్తది పాతది".split(
    " ",
  );

const PUNJABI =
  "ਅਤੇ ਇੱਕ ਵਿੱਚ ਹੈ ਇਹ ਉਹ ਮੈਂ ਤੂੰ ਅਸੀਂ ਤੁਸੀਂ ਉਹਨਾਂ ਮੇਰਾ ਤੇਰਾ ਉਸਦਾ ਕੀ ਕੌਣ ਕਿੱਥੇ ਕਦੋਂ ਕਿਵੇਂ ਕਿਉਂ ਹਾਂ ਨਹੀਂ ਪਰ ਜੇ ਤਾਂ ਫਿਰ ਹੁਣ ਅੱਜ ਕੱਲ੍ਹ ਦਿਨ ਰਾਤ ਸਮਾਂ ਸਾਲ ਆਦਮੀ ਔਰਤ ਬੱਚਾ ਘਰ ਦੇਸ਼ ਸ਼ਹਿਰ ਪਿੰਡ ਪਾਣੀ ਅੱਗ ਹਵਾ ਧਰਤੀ ਸੂਰਜ ਚੰਦ ਤਾਰਾ ਫੁੱਲ ਰੁੱਖ ਨਦੀ ਸਮੁੰਦਰ ਪਹਾੜ ਰਾਹ ਕੰਮ ਪੈਸਾ ਪਿਆਰ ਜ਼ਿੰਦਗੀ ਮੌਤ ਚੰਗਾ ਮਾੜਾ ਵੱਡਾ ਛੋਟਾ ਨਵਾਂ ਪੁਰਾਣਾ".split(
    " ",
  );

const ARABIC =
  "في من على إلى عن مع هذا هذه ذلك تلك أن إن كان كانت هو هي نحن أنتم هم ما ماذا من أين متى كيف لماذا نعم لا لكن إذا ثم الآن اليوم غدا أمس يوم ليلة وقت سنة رجل امرأة طفل بيت بلد مدينة قرية ماء نار هواء أرض شمس قمر نجمة زهرة شجرة نهر بحر جبل طريق عمل مال حب حياة موت جيد سيء كبير صغير جديد قديم كل بعض كثير قليل".split(
    " ",
  );

const SPANISH =
  "el la de que y en a los se del las un por con no una su para es al lo como más pero sus le ya o este sí porque esta entre cuando muy sin sobre también me hasta hay donde quien desde todo nos durante todos uno les ni contra otros ese eso ante ellos esto antes algunos qué unos yo otro otras otra él tanto esa estos mucho quienes nada muchos cual poco ella estar estas algunas algo".split(
    " ",
  );

const FRENCH =
  "le de un être et à il avoir ne je son que se qui ce dans en du elle au de ce le pour pas que vous par sur faire plus dire me on mon lui nous comme mais pouvoir avec tout y aller voir en bien où sans tu ou leur homme si deux mari moi vouloir te femme venir quand grand celui si notre vie elles entre alors votre temps très savoir falloir voilà sa".split(
    " ",
  );

const GERMAN =
  "der die und in den von zu das mit sich des auf für ist im dem nicht ein eine als auch es an werden aus er hat dass sie nach wird bei einer um am sind noch wie einem über einen so zum war haben nur oder aber vor zur bis mehr durch man sein wurde sei in dieser ihre seinem alle aber gegen vom können schon wenn habe seine mann gemacht doch dann seit dort viele welche".split(
    " ",
  );

export const LANGUAGES: Record<LanguageCode, LanguageDef> = {
  english: {
    code: "english",
    label: "English",
    native: "English",
    rtl: false,
    words: COMMON_ENGLISH,
    sampleQuote: "The only way to do great work is to love what you do.",
  },
  hindi: {
    code: "hindi",
    label: "Hindi",
    native: "हिन्दी",
    rtl: false,
    words: HINDI,
    sampleQuote: "जीवन एक यात्रा है, मंज़िल नहीं।",
  },
  marathi: {
    code: "marathi",
    label: "Marathi",
    native: "मराठी",
    rtl: false,
    words: MARATHI,
    sampleQuote: "स्वप्ने पाहा आणि ती सत्यात उतरवा.",
  },
  gujarati: {
    code: "gujarati",
    label: "Gujarati",
    native: "ગુજરાતી",
    rtl: false,
    words: GUJARATI,
    sampleQuote: "જીવન એક અદ્ભુત સફર છે.",
  },
  tamil: {
    code: "tamil",
    label: "Tamil",
    native: "தமிழ்",
    rtl: false,
    words: TAMIL,
    sampleQuote: "வாழ்க்கை ஒரு பயணம், இலக்கல்ல.",
  },
  telugu: {
    code: "telugu",
    label: "Telugu",
    native: "తెలుగు",
    rtl: false,
    words: TELUGU,
    sampleQuote: "జీవితం ఒక గొప్ప ప్రయాణం.",
  },
  punjabi: {
    code: "punjabi",
    label: "Punjabi",
    native: "ਪੰਜਾਬੀ",
    rtl: false,
    words: PUNJABI,
    sampleQuote: "ਜ਼ਿੰਦਗੀ ਇੱਕ ਖ਼ੂਬਸੂਰਤ ਸਫ਼ਰ ਹੈ।",
  },
  arabic: {
    code: "arabic",
    label: "Arabic",
    native: "العربية",
    rtl: true,
    words: ARABIC,
    sampleQuote: "الحياة رحلة جميلة، استمتع بكل لحظة.",
  },
  spanish: {
    code: "spanish",
    label: "Spanish",
    native: "Español",
    rtl: false,
    words: SPANISH,
    sampleQuote: "La vida es bella cuando la vives con pasión.",
  },
  french: {
    code: "french",
    label: "French",
    native: "Français",
    rtl: false,
    words: FRENCH,
    sampleQuote: "La vie est belle quand on la regarde avec amour.",
  },
  german: {
    code: "german",
    label: "German",
    native: "Deutsch",
    rtl: false,
    words: GERMAN,
    sampleQuote: "Das Leben ist eine wunderschöne Reise.",
  },
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);

export function generateWordsForLanguage(count: number, code: LanguageCode): string {
  const dict = LANGUAGES[code]?.words ?? LANGUAGES.english.words;
  const out: string[] = [];
  let last = "";
  for (let i = 0; i < count; i++) {
    let w = dict[Math.floor(Math.random() * dict.length)];
    if (w === last) w = dict[(Math.floor(Math.random() * dict.length) + 1) % dict.length];
    out.push(w);
    last = w;
  }
  return out.join(" ");
}

export function isRTL(code: LanguageCode): boolean {
  return LANGUAGES[code]?.rtl ?? false;
}

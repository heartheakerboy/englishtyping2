/**
 * Multilingual SEO Translations Helper
 * Provides unique, localized Title and Meta Description tags for international URLs (e.g. ?lang=es, ?lang=ja, ?lang=ar, etc.)
 */

export interface LocalizedSeoMeta {
  title: string;
  description: string;
  keywords?: string;
}

export type SeoPageKey =
  | "auth"
  | "race"
  | "race_bots"
  | "tournaments"
  | "trainer"
  | "reaction"
  | "cps"
  | "spacebar"
  | "memory"
  | "zombie"
  | "balloon"
  | "falling"
  | "home"
  | "typing_test"
  | "leaderboard";

const SEO_TRANSLATIONS: Record<SeoPageKey, Record<string, LocalizedSeoMeta>> = {
  auth: {
    en: {
      title: "Sign in — English Typing Test",
      description: "Sign in or create an account to save your typing results and track progress.",
    },
    es: {
      title: "Iniciar Sesión — Test de Mecanografía en Inglés",
      description: "Inicia sesión o crea una cuenta para guardar tus resultados de mecanografía y seguir tu progreso.",
    },
    ja: {
      title: "ログイン — 英語タイピングテスト",
      description: "ログインまたは新規登録して、タイピングテストの結果を保存し、スコアを記録しましょう。",
    },
    ar: {
      title: "تسجيل الدخول — اختبار الطباعة باللغة الإنجليزية",
      description: "سجل الدخول أو أنشئ حسابًا جديدًا لحفظ نتائج اختبارات سرعة الطباعة وتتبع تقدمك بدقة.",
    },
    zh: {
      title: "登录账户 — 英语打字测试平台",
      description: "登录或注册新账户以保存您的实时打字测速结果并追踪您的速度提升进度。",
    },
    ko: {
      title: "로그인 — 영어 타자 속도 연습 테스트",
      description: "타자 테스트 결과를 저장하고 기록을 관리하려면 로그인하거나 무료 계정을 생성하세요.",
    },
    ta: {
      title: "உள்நுழைக — ஆங்கில தட்டச்சு தேர்வு",
      description: "உங்கள் தட்டச்சு வேக முடிவுகளை சேமிக்கவும் முன்னேற்றத்தை கண்காணிக்கவும் உள்நுழையவும்.",
    },
    te: {
      title: "లాగిన్ — ఇంగ్లీష్ టైపింగ్ స్పీడ్ టెస్ట్",
      description: "మీ టైపింగ్ టెస్ట్ ఫలితాలను సేవ్ చేయడానికి మరియు పురోగతిని ట్రాక్ చేయడానికి లాగిన్ చేయండి.",
    },
    fr: {
      title: "Connexion — Test de Vitesse de Dactylographie",
      description: "Connectez-vous ou créez un compte pour enregistrer vos scores de frappe et suivre votre progression.",
    },
    de: {
      title: "Anmelden — Kostenloser Englisch Tipptest",
      description: "Melden Sie sich an oder erstellen Sie ein Konto, um Ihre Tippergebnisse dauerhaft zu speichern.",
    },
    ru: {
      title: "Вход в аккаунт — Тест Скорости Печати Онлайн",
      description: "Войдите или зарегистрируйтесь, чтобы сохранять результаты тестирования скорости печати и прогресс.",
    },
    pt: {
      title: "Entrar na Conta — Teste de Digitação em Inglês",
      description: "Faça login ou crie uma conta para salvar seus resultados de velocidade de digitação e histórico.",
    },
    bn: {
      title: "লগইন করুন — ইংরেজি টাইপিং স্পিড টেস্ট",
      description: "আপনার টাইপিং পরীক্ষার ফলাফল সংরক্ষণ করতে এবং অগ্রগতি ট্র্যাক করতে সাইন ইন করুন।",
    },
    ur: {
      title: "لاگ ان — انگریزی ٹائپنگ اسپیڈ ٹیسٹ",
      description: "اپنے ٹائپنگ نتائج کو محفوظ کرنے اور پیشرفت کو ٹریک کرنے کے لیے سائن ان کریں۔",
    },
    hi: {
      title: "लॉग इन — इंग्लिश टाइपिंग स्पीड टेस्ट",
      description: "अपने टाइपिंग टेस्ट रिजल्ट को सेव करने और स्पीड प्रोग्रेस को ट्रैक करने के लिए साइन इन करें।",
    },
  },

  race_bots: {
    en: {
      title: "Type Racer Against AI Bots — Nitro Car Typing Game",
      description: "Race against AI typing bots in real time. Out-type the bots, increase your WPM, and dominate the track.",
    },
    es: {
      title: "Type Racer Contra Bots IA — Carrera de Autos de Mecanografía",
      description: "Compite en carreras de velocidad de mecanografía en tiempo real contra bots inteligentes. Mejora tu WPM.",
    },
    ar: {
      title: "سباق الطباعة ضد روبوتات الذكاء الاصطناعي — لعبة سيارات الطباعة السريعة",
      description: "تسابق ضد سيارات الروبوتات في الوقت الفعلي عبر كتابة الكلمات بدقة وسرعة فائقة.",
    },
    zh: {
      title: "打字赛车挑战 (与AI机器人对战) — 极速打字竞速游戏",
      description: "在快节奏的打字赛车游戏中与智能AI机器人同台竞技，提升打字速度并争夺冠军头衔。",
    },
    ja: {
      title: "タイプレーサー (対AIボットレース) — ニトロカー タイピングゲーム",
      description: "リアルタイムでAIボットと競い合うタイピングレース。正確なキータッチでライバルを追い抜こう。",
    },
    fr: {
      title: "Course de Frappe Contre des Bots IA — Jeu de Dactylographie",
      description: "Défiez des bots intelligents dans une course de frappe intense. Augmentez vos MPM et gagnez la course.",
    },
    de: {
      title: "Tipp-Rennen gegen KI-Bots — Rasantes Auto-Tippspiel",
      description: "Treten Sie in Echtzeit-Tipprennen gegen KI-Gegner an. Steigern Sie Ihre WPM und gewinnen Sie jedes Rennen.",
    },
    ru: {
      title: "Гонка Печати Против Ботов — Скоростной Клавиатурный Автосимулятор",
      description: "Соревнуйтесь на скорость набора текста с умными ботами. Разгоняйте свой автомобиль точной печатью.",
    },
    pt: {
      title: "Corrida de Digitação Contra Bots IA — Jogo de Carros",
      description: "Participe de corridas de digitação em tempo real contra oponentes virtuais. Aumente seu WPM.",
    },
    bn: {
      title: "এআই বটদের সাথে টাইপিং রেস — স্পিড কার টাইপিং গেম",
      description: "রিয়েল টাইমে কম্পিউটার বটদের সাথে টাইপিং প্রতিযোগিতা করুন এবং আপনার গতি বাড়ান।",
    },
    ur: {
      title: "اے آئی بوٹس کے خلاف ٹائپنگ ریس — تیز رفتار کار گیم",
      description: "حقیقی وقت میں AI بوٹس کے خلاف مقابلہ کریں اور اپنی ٹائپنگ کی رفتار کو بہتر بنائیں۔",
    },
    hi: {
      title: "AI बॉट्स के खिलाफ टाइप रेसर — स्पीड कार टाइपिंग गेम",
      description: "रियल-टाइम में AI बॉट्स के साथ कार रेसिंग टाइपिंग गेम खेलें और अपनी WPM स्पीड बढ़ाएं।",
    },
  },

  race: {
    en: {
      title: "Multiplayer Typing Race Live — Compete Online",
      description: "Race against typists worldwide in real-time multiplayer typing tests. Public rooms, private lobbies, and live rankings.",
    },
    es: {
      title: "Carrera Multijugador de Mecanografía en Vivo — Compite Online",
      description: "Compite contra mecanógrafos de todo el mundo en tiempo real. Salas públicas, salas privadas con amigos y clasificaciones.",
    },
    ar: {
      title: "سباق الطباعة متعدد اللاعبين المباشر — تنافس عبر الإنترنت",
      description: "تسابق مع مستخدمين حقيقيين من جميع أنحاء العالم في اختبارات سرعة الطباعة متعددة اللاعبين في غرف خاصة وعامة.",
    },
    de: {
      title: "Mehrspieler Tipp-Rennen Live — Online Wettkampf",
      description: "Treten Sie in Echtzeit gegen Tipper weltweit an. Öffentliche und private Räume mit Live-Ranglisten.",
    },
    ru: {
      title: "Многопользовательская Гонка Печати Онлайн — Соревнуйтесь в Реальном Времени",
      description: "Участвуйте в живых соревнованиях по скоропечатанию с игроками со всего мира. Создавайте приватные комнаты с друзьями.",
    },
    zh: {
      title: "多人实时在线打字竞速比赛 — 与全球选手同台竞技",
      description: "在多人打字赛场中与全球打字高手实时比拼WPM速度。支持公开匹配和好友专属私密对战房间。",
    },
    ja: {
      title: "マルチプレイヤー オンラインタイピングレース — 世界中の仲間と対戦",
      description: "世界中のタイピストとリアルタイムで対戦できるオンラインタイピングレース。プライベートルーム機能完備。",
    },
    fr: {
      title: "Course de Frappe Multijoueur en Direct — Défiez des Joueurs en Ligne",
      description: "Affrontez des dactylographes du monde entier en direct. Salons publics, parties privées entre amis et classement mondial.",
    },
    pt: {
      title: "Corrida de Digitação Multiplayer Online — Disputas em Tempo Real",
      description: "Dispute corridas de digitação ao vivo com pessoas do mundo todo. Crie salas privadas ou dispute nas públicas.",
    },
    bn: {
      title: "মাল্টিপ্লেয়ার অনলাইন টাইপিং প্রতিযোগিতা — লাইভ রেস",
      description: "সারা বিশ্বের টাইপিস্টদের সাথে রিয়েল টাইমে মাল্টিপ্লেয়ার টাইপিং রেসে অংশ নিন।",
    },
    ur: {
      title: "ملٹی پلیئر لائیو ٹائپنگ ریس — آن لائن مقابلہ کریں",
      description: "دنیا بھر کے ٹائپسٹس کے ساتھ حقیقی وقت میں ملٹی پلیئر ٹائپنگ ریس میں حصہ لیں۔",
    },
    hi: {
      title: "मल्टीप्लेयर ऑनलाइन टाइपिंग रेस — लाइव दोस्तों के साथ खेलें",
      description: "दुनिया भर के प्लेयर्स के साथ रियल-टाइम टाइपिंग रेस में मुकाबला करें और लाइव लीडरबोर्ड पर टॉप रैंक पाएं।",
    },
  },

  tournaments: {
    en: {
      title: "Typing Tournaments — Compete & Win XP",
      description: "Compete in live scheduled typing tournaments. Climb tournament brackets, race against top global typists, and win XP and coin rewards.",
    },
    zh: {
      title: "打字锦标赛 — 参加淘汰赛赢取XP经验与金币大奖",
      description: "参加定期举办的线上打字锦标赛淘汰赛，与全球顶尖打字高手争夺天梯排位并赢取丰厚奖励。",
    },
    es: {
      title: "Torneos de Mecanografía — Compite y Gana Premios XP",
      description: "Participa en torneos programados de mecanografía. Avanza en el cuadro eliminatorio y gana recompensas exclusivas.",
    },
    bn: {
      title: "টাইপিং টুর্নামেন্ট — খেলুন এবং এক্সপি ও কয়েন জিতুন",
      description: "নিয়মিত টাইপিং টুর্নামেন্টে অংশ নিন, টুর্নামেন্ট ব্র্যাকেটে এগিয়ে যান এবং আকর্ষণীয় পুরস্কার জিতুন।",
    },
    pt: {
      title: "Torneios de Digitação — Compita e Ganhe Recompensas",
      description: "Participe de torneios programados de digitação. Suba nas chaves competitivas e ganhe moedas e XP.",
    },
    fr: {
      title: "Tournois de Dactylographie — Grimpez dans le Tableau et Gagnez des XP",
      description: "Prenez part aux tournois de frappe programmés. Battez vos adversaires et remportez de l'expérience et des pièces.",
    },
    ur: {
      title: "ٹائپنگ ٹورنامنٹس — مقابلہ کریں اور شاندار انعامات جیتیں",
      description: "شیڈول ٹائپنگ ٹورنامنٹس میں حصہ لیں، بریکٹ میں آگے بڑھیں اور ایکس پی و انعامات حاصل کریں۔",
    },
    ru: {
      title: "Турниры по Скоропечатанию — Соревнования на Вылет с Призами",
      description: "Участвуйте в турнирах по набору текста. Проходите турнирную сетку и выигрывайте награды и опыт.",
    },
    ar: {
      title: "بطولات الطباعة السريعة — تنافس في التحديات واربح الجوائز",
      description: "شارك في بطولات الطباعة المجدولة وتنافس في تصفيات التحدي لحصد نقاط الخبرة والعملات.",
    },
    de: {
      title: "Tipp-Turniere — Online Turniere & Ranglisten-Wettbewerbe",
      description: "Nehmen Sie an geplanten Tipp-Wettbewerben teil, klettern Sie in der Turnierleiter nach oben und gewinnen Sie Belohnungen.",
    },
    ja: {
      title: "タイピングトーナメント — 勝ち抜き戦でXPとコインを獲得",
      description: "定期開催のタイピングトーナメントで腕試し。トーナメント表を勝ち進み豪華リワードを手に入れよう。",
    },
    hi: {
      title: "टाइपिंग टूर्नामेंट — ऑनलाइन चैंपियनशिप में भाग लें और XP जीतें",
      description: "शेड्यूल्ड टाइपिंग टूर्नामेंट में हिस्सा लें, ब्रैकेट्स में मुकाबला जीतें और रिवार्ड्स हासिल करें।",
    },
  },

  reaction: {
    en: {
      title: "Reaction Time Test Online — Reflex Speed Test",
      description: "Test your visual reflex speed in milliseconds across 5 rounds.",
    },
    zh: {
      title: "在线反应时间测试 — 毫秒级视觉反射速度测评",
      description: "通过5轮颜色变化测试您的人体反应速度（毫秒级），对比全球平均反射敏捷度水平。",
    },
    es: {
      title: "Test de Tiempo de Reacción Online — Mide tus Reflejos en Milisegundos",
      description: "Prueba tu velocidad de reacción visual. Haz clic en el instante en que cambie la pantalla y mide tus reflejos.",
    },
    ja: {
      title: "反応速度テスト オンライン — 反射神経測定 (ミリ秒)",
      description: "画面の色が変わった瞬間にクリックして、ミリ秒単位であなたの反射速度を正確に計測します。",
    },
    ar: {
      title: "اختبار سرعة رد الفعل عبر الإنترنت — قياس زمن الاستجابة بالمللي ثانية",
      description: "اختبر سرعة استجابتك ورد فعلك البصري بالمللي ثانية عبر 5 جولات سريعة وتحدى أفضل أرقامك القياسية.",
    },
    fr: {
      title: "Test du Temps de Réaction en Ligne — Mesurez vos Réflexes Visuels",
      description: "Mesurez votre vitesse de réflexe en millisecondes sur 5 manches dès que l'écran passe au vert.",
    },
    de: {
      title: "Reaktionszeit-Test Online — Reflexe in Millisekunden messen",
      description: "Messen Sie Ihre visuelle Reaktionsgeschwindigkeit in Millisekunden über 5 Runden.",
    },
    ru: {
      title: "Тест на Время Реакции Онлайн — Измерение Скорости Рефлексов",
      description: "Проверьте свою зрительную реакцию в миллисекундах за 5 раундов и сравните результат со средним мировым.",
    },
    pt: {
      title: "Teste de Tempo de Reação Online — Meça seus Reflexos em Milissegundos",
      description: "Avalie a rapidez dos seus reflexos visuais em milissegundos com este teste de 5 rodadas.",
    },
    bn: {
      title: "প্রতিক্রিয়া সময় পরীক্ষা — চোখের রিফ্লেক্স স্পিড পরিমাপ",
      description: "মিলি সেকেন্ডে আপনার চোখের প্রতিক্রিয়া সময় ও রিফ্লেক্স গতি পরিমাপ করুন।",
    },
    ur: {
      title: "ردعمل کا وقت ٹیسٹ — اپنے اضطراری ردعمل کی رفتار چیک کریں",
      description: "ملی سیکنڈ میں اپنے ردعمل کے وقت اور اضطراری حرکت کی رفتار کی پیمائش کریں۔",
    },
    hi: {
      title: "प्रतिक्रिया समय टेस्ट — मिलीसेकंड में रिफ्लेक्स स्पीड चेक करें",
      description: "स्क्रीन ग्रीन होते ही क्लिक करें और 5 राउंड में अपनी विजुअल रिएक्शन स्पीड मिलीसेकंड में नापें।",
    },
  },

  trainer: {
    en: {
      title: "Keyboard Trainer Online — Home & Number Row Drills",
      description: "Free online keyboard trainer. Practice home row, top row, bottom row, and number keys to master touch typing.",
    },
    zh: {
      title: "键盘指法练习器 — 盲打主键盘行与键位记忆训练",
      description: "免费在线键盘指法训练工具。通过主键盘行、上排键、下排键与数字行专项冲刺练习掌握盲打肌肉记忆。",
    },
    es: {
      title: "Entrenador de Teclado Online — Práctica de Fila de Inicio y Teclas",
      description: "Entrenador gratuito de mecanografía al tacto. Practica la fila guía, superior, inferior y numérica.",
    },
    ja: {
      title: "キーボードトレーナー — ホームポジションとタッチタイピング基礎特訓",
      description: "ホームポジション、上段、下段、数字キーの指使いを段階的にマスターできる無料キーボード特訓ツール。",
    },
    ar: {
      title: "مدرب لوحة المفاتيح — تمارين الصف الأوسط والطباعة باللمس",
      description: "تدرب على موضع الارتكاز والصفوف العلوية والسفلية والأرقام لبناء الذاكرة العضلية للطباعة السريعة.",
    },
    fr: {
      title: "Entraîneur de Clavier en Ligne — Exercices de Dactylographie au Toucher",
      description: "Entraînez-vous sur la rangée de base, supérieure, inférieure et les chiffres pour maîtriser la frappe à l'aveugle.",
    },
    de: {
      title: "Tastatur-Trainer Online — Grundreihen & Zehnfingersystem Übungen",
      description: "Kostenloser Tastaturtrainer für das Zehnfingersystem. Trainieren Sie Grundreihe, Oberreihe und Zahlenreihe.",
    },
    ru: {
      title: "Клавиатурный Тренажер Онлайн — Обучение Слепой Печати по Рядам",
      description: "Бесплатный тренажер слепой печати. Тренируйте средний, верхний, нижний и цифровой ряды клавиатуры.",
    },
    pt: {
      title: "Treinador de Teclado Online — Prática de Linha Guia e Digitação",
      description: "Treine a digitação correta por linha: fila guia, superior, inferior e teclas numéricas para aumentar sua velocidade.",
    },
    bn: {
      title: "কীবোর্ড ট্রেনার অনলাইন — হোম রো ও টাচ টাইপিং ড্রিল",
      description: "হোম রো, টপ রো এবং নম্বর কি অনুশীলনের মাধ্যমে দ্রুত টাচ টাইপিং শিখুন।",
    },
    ur: {
      title: "کی بورڈ ٹرینر — ہوم رو اور ٹچ ٹائپنگ کی مشق",
      description: "ہوم رو، اوپری اور نچلی قطاروں کے ساتھ ٹچ ٹائپنگ سیکھیں اور رفتار بڑھائیں۔",
    },
    hi: {
      title: "कीबोर्ड ट्रेनर — होम रो और टच टाइपिंग अभ्यास",
      description: "होम रो, टॉप रो, बॉटम रो और नंबर कीज़ की रो-बाय-रो प्रैक्टिस करें और टच टाइपिंग सीखें।",
    },
  },

  cps: {
    en: {
      title: "CPS Test Online — Clicks Per Second Speed Test",
      description: "Test your click speed with our free 5-second CPS Test. Measure clicks per second and practice jitter clicking.",
    },
    zh: {
      title: "CPS测试 (每秒点击次数测速) — 5秒鼠标连点与抖击测试",
      description: "免费5秒鼠标连点测速工具。精确测量您的每秒点击次数(CPS)，练习蝴蝶连点与抖击技巧并打破纪录。",
    },
    es: {
      title: "Test de CPS Online — Prueba de Clics Por Segundo en 5 Segundos",
      description: "Mide cuántos clics por segundo puedes hacer en un sprint de 5 segundos. Practica jitter click y butterfly click.",
    },
    ja: {
      title: "CPS測定テスト — 5秒間クリック連打スピード計測",
      description: "5秒間のクリック連打速度をミリ秒単位で測定。バタフライクリックやジッタークリックの練習にも最適。",
    },
    ar: {
      title: "اختبار النقرات في الثانية (CPS) — اختبار سرعة الضغط في 5 ثوانٍ",
      description: "قس سرعتك في النقر بالماوس في الثانية الواحدة خلال 5 ثوانٍ وتعرف على تصنيفك وسجل أرقامًا جديدة.",
    },
    fr: {
      title: "Test de CPS en Ligne — Test de Clics Par Seconde en 5s",
      description: "Découvrez votre score CPS (clics par seconde) lors d'un test intensif de 5 secondes. Améliorez votre vitesse de clic.",
    },
    de: {
      title: "CPS-Test Online — Klicks pro Sekunde in 5 Sekunden messen",
      description: "Finden Sie heraus, wie viele Klicks pro Sekunde Sie schaffen. Kostenloser 5-Sekunden-Klicktest.",
    },
    ru: {
      title: "Тест Кликов в Секунду (CPS) — 5-секундный Клик-Тест Онлайн",
      description: "Измерьте скорость кликов мыши за 5 секунд. Тренируйте джиттер-клик и ставьте личные рекорды.",
    },
    pt: {
      title: "Teste de CPS Online — Teste de Cliques por Segundo em 5 Segundos",
      description: "Veja quantos cliques por segundo você consegue fazer em 5 segundos com nosso contador de CPS gratuito.",
    },
    bn: {
      title: "CPS টেস্ট অনলাইন — ৫ সেকেন্ড মাউস ক্লিক স্পিড টেস্ট",
      description: "৫ সেকেন্ডে আপনি প্রতি সেকেন্ডে কতগুলো ক্লিক করতে পারেন তা পরীক্ষা করুন।",
    },
    ur: {
      title: "سی پی ایس ٹیسٹ — 5 سیکنڈ ماؤس کلک اسپیڈ ٹیسٹ",
      description: "5 سیکنڈ میں چیک کریں کہ آپ فی سیکنڈ کتنے ماؤس کلک کر سکتے ہیں۔",
    },
    hi: {
      title: "CPS टेस्ट ऑनलाइन — 5 सेकंड क्लिक प्रति सेकंड स्पीड टेस्ट",
      description: "5 सेकंड में अपनी माउस क्लिकिंग स्पीड नापें और पर्सनल बेस्ट CPS स्कोर बनाएं।",
    },
  },

  spacebar: {
    en: {
      title: "Spacebar Speed Test — 10s Spacebar Counter",
      description: "How fast can you press the spacebar? Test your spacebar tapping speed in a 10-second sprint with real-time hit counters.",
    },
    es: {
      title: "Test de Velocidad de Barra Espaciadora — Contador de 10 Segundos",
      description: "¿Qué tan rápido puedes presionar la barra espaciadora? Pon a prueba tu velocidad de pulsación en 10 segundos.",
    },
    zh: {
      title: "空格键连击测速测试 — 10秒极限空格按键计数器",
      description: "测试您按空格键的极限手速！10秒倒计时连点挑战，实时计算每秒击键次数(HPS)与历史最佳成绩。",
    },
    ja: {
      title: "スペースバー連打測定 — 10秒間スペースキースピードテスト",
      description: "10秒間でスペースキーを何回叩けるかチャレンジ！リアルタイム打鍵カウンターで最高記録を目指そう。",
    },
    ar: {
      title: "اختبار سرعة مسطرة المسافة — عداد ضغطات 10 ثوانٍ",
      description: "ما مدى سرعتك في الضغط على مفتاح المسافة؟ اختبر سرعة أصابعك في تحدي الـ 10 ثوانٍ مع عداد فوري للضربات.",
    },
    fr: {
      title: "Test de Vitesse de Barre d'Espace — Défi de 10 Secondes",
      description: "À quelle vitesse pouvez-vous appuyer sur la barre d'espace ? Testez vos réflexes lors d'un sprint de 10 secondes.",
    },
    de: {
      title: "Leertasten-Geschwindigkeitstest — 10-Sekunden Klickzähler",
      description: "Wie schnell können Sie die Leertaste drücken? Testen Sie Ihre Anschlagsgeschwindigkeit in 10 Sekunden.",
    },
    ru: {
      title: "Тест Скорости Нажатия Пробела — 10-секундный Челлендж",
      description: "Как быстро вы можете нажимать клавишу пробела? Проверьте скорость нажатий за 10 секунд с мгновенным счетчиком.",
    },
    pt: {
      title: "Teste de Velocidade da Barra de Espaço — Contador de 10s",
      description: "Com que rapidez você consegue apertar a barra de espaço? Teste sua velocidade em 10 segundos.",
    },
    bn: {
      title: "স্পেসবার স্পিড টেস্ট — ১০ সেকেন্ড কাউন্টার চ্যালেঞ্জ",
      description: "১০ সেকেন্ডে কতবার স্পেসবার চাপতে পারেন তা পরীক্ষা করুন।",
    },
    ur: {
      title: "اسپیس بار اسپیڈ ٹیسٹ — 10 سیکنڈ چیلنج",
      description: "10 سیکنڈ میں چیک کریں کہ آپ کتنی تیزی سے اسپیس بار دبا سکتے ہیں۔",
    },
    hi: {
      title: "स्पेसबार स्पीड टेस्ट — 10 सेकंड स्पेसबार काउंटर चैलेंज",
      description: "10 सेकंड में आप कितनी बार स्पेसबार दबा सकते हैं? अपनी टाइपिंग टैपिंग स्पीड टेस्ट करें।",
    },
  },

  memory: {
    en: {
      title: "Sequence Memory Test Online — Simon-Style Brain Drill",
      description: "Train and test your sequence memory with this Simon-style color and pattern drill.",
    },
    es: {
      title: "Test de Memoria Secuencial Online — Ejercicio Mental Estilo Simon",
      description: "Entrena y pon a prueba tu memoria de patrones y secuencias visuales paso a paso.",
    },
    ja: {
      title: "記憶力テスト (シーケンスメモリー) — 脳トレパターン記憶",
      description: "光るパターンの順番を記憶して再現する脳トレ記憶力ゲーム。限界スコアに挑戦しよう。",
    },
    zh: {
      title: "序列记忆力测试 — 经典的顺序模式大脑记忆训练",
      description: "测试并锻炼您的视觉工作记忆。按顺序重现逐步增长的色块序列，挑战最长记忆步数纪录。",
    },
    ar: {
      title: "اختبار قوة الذاكرة التسلسلية — تمرين ذهني لترتيب الأنماط",
      description: "درب واختبر ذاكرتك البصرية وقدرتك على تذكر تسلسل الألوان والأنماط المتزايدة.",
    },
    fr: {
      title: "Test de Mémoire Séquentielle en Ligne — Jeu de Réflexion Simon",
      description: "Entraînez votre mémoire de travail avec ce défi de mémorisation de séquences de couleurs.",
    },
    de: {
      title: "Sequenz-Gedächtnistest Online — Visuelles Merkspiel",
      description: "Testen und trainieren Sie Ihr visuelles Gedächtnis mit diesem klassischen Sequenzspiel.",
    },
    ru: {
      title: "Тест на Зрительную Память — Запоминание Последовательностей",
      description: "Тренируйте рабочую память, повторяя растущие цепочки цветовых сигналов.",
    },
    pt: {
      title: "Teste de Memória Sequencial Online — Desafio Mental de Padrões",
      description: "Treine sua capacidade de memorização repetindo sequências visuais cada vez mais longas.",
    },
    bn: {
      title: "সিকোয়েন্স মেমরি টেস্ট অনলাইন — স্মৃতিশক্তি পরীক্ষা",
      description: "ধাপে ধাপে বাড়তে থাকা রঙের প্যাটার্ন মনে রেখে আপনার স্মরণশক্তি পরীক্ষা করুন।",
    },
    ur: {
      title: "سیکوئنس میموری ٹیسٹ — یادداشت اور دماغی مشق",
      description: "بصری نمونوں اور رنگوں کی ترتیب یاد رکھ کر اپنی یادداشت کی صلاحیت چیک کریں۔",
    },
    hi: {
      title: "सीक्वेंस मेमोरी टेस्ट — विजुअल पैटर्न याददाश्त टेस्ट",
      description: "रंगों और पैटर्न के सीक्वेंस को याद रखें और अपनी मेमोरी क्षमता को टेस्ट करें।",
    },
  },

  zombie: {
    en: {
      title: "Zombie Typing Game — Defeat the Zombie Horde Online",
      description: "Type fast to vaporize oncoming zombies before they reach your defense line. Boss waves, combo streaks, and typing accuracy drills.",
    },
    es: {
      title: "Juego de Mecanografía Zombie — Defiéndete de la Horda Zombie",
      description: "Escribe rápido las palabras para eliminar a los zombies antes de que te alcancen. Olas de jefes y combos.",
    },
    zh: {
      title: "僵尸打字消消乐 — 键盘打字击退僵尸军团",
      description: "快速准确输入僵尸头顶的单词将其击碎，在僵尸潮入侵中守卫阵地，挑战强力巨型Boss关卡。",
    },
    ja: {
      title: "ゾンビタイピングゲーム — タイピングで迫りくるゾンビを撃退",
      description: "ゾンビに書かれた単語を素早く正確にタイピングして撃退！ボス戦やコンボスコアでWPMを鍛えよう。",
    },
    ar: {
      title: "لعبة طباعة الزومبي — دافع عن قاعدتك بالكتابة السريعة",
      description: "اكتب الكلمات بدقة وسرعة للقضاء على وحوش الزومبي قبل وصولهم إلى خط الدفاع.",
    },
    fr: {
      title: "Jeu de Frappe Zombie — Éliminez la Horde au Clavier",
      description: "Tapez les mots pour détruire les zombies avant qu'ils ne vous atteignent. Combats de boss et combos.",
    },
    de: {
      title: "Zombie-Tippspiel — Tippen gegen die Zombie-Horde",
      description: "Tippen Sie Wörter blitzschnell, um herannahende Zombies abzuwehren. Boss-Wellen und Highscore-Jagd.",
    },
    ru: {
      title: "Зомби Тайпинг Игра — Уничтожайте Зомби Быстрой Печатью",
      description: "Набирайте слова на скорость, чтобы уничтожать нападающих зомби и боссов до того, как они доберутся до вас.",
    },
    pt: {
      title: "Jogo de Digitação Zumbi — Derrote a Horda de Zumbis Digitando",
      description: "Digite as palavras com agilidade para destruir os zumbis antes que eles atinjam sua linha de defesa.",
    },
    bn: {
      title: "জম্বি টাইপিং গেম — দ্রুত টাইপ করে জম্বিদের ধ্বংস করুন",
      description: "শব্দ টাইপ করে এগিয়ে আসা জম্বিদের প্রতিহত করুন এবং আপনার টাইপিং গতি বাড়ান।",
    },
    ur: {
      title: "زومبی ٹائپنگ گیم — تیز ٹائپنگ سے زومبیوں کو شکست دیں",
      description: "الفاظ تیزی سے ٹائپ کر کے آگے بڑھتے ہوئے زومبیوں کو روکیں اور اپنے دفاع کو برقرار رکھیں۔",
    },
    hi: {
      title: "ज़ोंबी टाइपिंग गेम — फास्ट टाइपिंग से ज़ोंबीज़ को हराएं",
      description: "तेज़ी से वर्ड्स टाइप करके ज़ोंबीज़ को खत्म करें, बॉस लेवल्स जीतें और अपनी WPM स्पीड बढ़ाएं।",
    },
  },

  balloon: {
    en: {
      title: "Balloon Typing Game — Type & Burst Balloons Online",
      description: "Play the classic Balloon Typing game online. Pop floating word balloons by typing fast before they drift away.",
    },
    es: {
      title: "Juego de Globos de Mecanografía — Escribe y Explota Globos",
      description: "Revienta los globos flotantes escribiendo las palabras a tiempo antes de que se escapen de la pantalla.",
    },
    zh: {
      title: "打字气球大作战 — 输入单词引爆彩色浮空气球",
      description: "在气球飞出屏幕前快速输入上面的单词将其引爆。适合全年龄段的趣味打字速度与准确率训练游戏。",
    },
    ja: {
      title: "バルーンタイピングゲーム — 単語を打って風船を割ろう",
      description: "画面上を浮遊するバルーンの単語をタイピングして爽快に破裂させよう。初心者から上級者まで楽しめるゲーム。",
    },
    ar: {
      title: "لعبة تفجير بالونات الكلمات — اكتب بسرعة لتفجير البالونات",
      description: "فرقع البالونات الطافية عبر كتابة الكلمات المكتوبة عليها قبل هروبها من الشاشة وحقق أعلى النقاط.",
    },
    fr: {
      title: "Jeu des Ballons de Frappe — Éclatez les Ballons de Mots",
      description: "Éclatez les ballons flottants en tapant les mots rapidement avant qu'ils ne disparaissent de l'écran.",
    },
    de: {
      title: "Ballon-Tippspiel — Wörter tippen & Ballons platzen lassen",
      description: "Bringen Sie schwebende Wortballons durch schnelles Tippen zum Platzen, bevor sie den Bildschirm verlassen.",
    },
    ru: {
      title: "Игра с Воздушными Шарами — Лопайте Шары Быстрой Печатью",
      description: "Лопайте летающие шары с текстом, печатая слова быстрее, чем они улетят за пределы экрана.",
    },
    pt: {
      title: "Jogo dos Balões de Digitação — Estoure Balões com o Teclado",
      description: "Estoure os balões flutuantes digitando as palavras rapidamente antes que eles subam demais.",
    },
    bn: {
      title: "বেলুন টাইপিং গেম — শব্দ টাইপ করে বেলুন ফাটান",
      description: "পর্দায় ভেসে থাকা বেলুনের শব্দগুলো দ্রুত টাইপ করে ফাটান এবং স্কোর বাড়ান।",
    },
    ur: {
      title: "غبارہ ٹائپنگ گیم — الفاظ ٹائپ کر کے غبارے پھوڑیں",
      description: "اسکرین پر تیرتے ہوئے غباروں پر لکھے الفاظ تیزی سے ٹائپ کریں اور ریکارڈ بنائیں۔",
    },
    hi: {
      title: "बैलून टाइपिंग गेम — वर्ड्स टाइप करके गुब्बारे फोड़ें",
      description: "उड़ते हुए गुब्बारों के वर्ड्स को तेज़ी से टाइप करके फोड़ें और अपना स्कोर व WPM बढ़ाएं।",
    },
  },

  falling: {
    en: {
      title: "Falling Words Typing Game — Z-Type Style Speed Drill",
      description: "Type falling words before they hit the ground in this fast-paced Z-Type style typing game.",
    },
    es: {
      title: "Juego de Palabras que Caen — Desafío de Mecanografía Estilo Z-Type",
      description: "Escribe las palabras que caen del cielo antes de que toquen el suelo en este frenético juego de reflejos.",
    },
    zh: {
      title: "太空下落单词射击游戏 (Z-Type风格) — 极速打字拦截",
      description: "在单词坠落地面前快速键盘输入将其摧毁。经典太空射击风格的极速打字反应力挑战。",
    },
    ja: {
      title: "フォーリングワーズ — 落下する単語をタイピングで撃墜 (Z-Type風)",
      description: "上空から落ちてくる単語が地面に着弾する前に素早くタイピングして迎撃するスピードゲーム。",
    },
    ar: {
      title: "لعبة الكلمات المتساقطة — تدريب سرعة ودقة الطباعة",
      description: "اكتب الكلمات المتساقطة من الأعلى قبل وصولها إلى الأرض في هذه اللعبة السريعة والحماسية.",
    },
    fr: {
      title: "Jeu des Mots Tombants — Défi de Frappe Rapide Style Z-Type",
      description: "Tapez les mots qui tombent du ciel avant qu'ils ne touchent le bas de l'écran dans ce jeu d'action.",
    },
    de: {
      title: "Fallende Wörter Tippspiel — Schnelligkeits-Drill im Z-Type Stil",
      description: "Tippen Sie herabfallende Wörter rechtzeitig ein, bevor sie den Boden berühren.",
    },
    ru: {
      title: "Падающие Слова Игра — Скоростной Набор Текста в Стиле Z-Type",
      description: "Набирайте падающие слова на клавиатуре до того, как они упадут на землю.",
    },
    pt: {
      title: "Jogo das Palavras em Queda — Desafio de Digitação Ágil",
      description: "Digite as palavras que caem do céu antes que elas toquem o chão neste jogo dinâmico de digitação.",
    },
    bn: {
      title: "পতনশীল শব্দ টাইপিং গেম — দ্রুত টাইপ করে শব্দ আটকান",
      description: "উপর থেকে পড়া শব্দগুলো মাটিতে পড়ার আগেই দ্রুত টাইপ করে ধ্বংস করুন।",
    },
    ur: {
      title: "گرتے ہوئے الفاظ کی گیم — تیز رفتار ٹائپنگ چیلنج",
      description: "الفاظ نیچے گرنے سے پہلے انہیں کی بورڈ سے ٹائپ کر کے پوائنٹس حاصل کریں۔",
    },
    hi: {
      title: "फॉलिंग वर्ड्स टाइपिंग गेम — नीचे गिरने से पहले वर्ड्स टाइप करें",
      description: "आसमान से नीचे गिरते वर्ड्स को ज़मीन छूने से पहले टाइप करके डिस्ट्रॉय करें।",
    },
  },

  home: {
    en: {
      title: "English Typing Test — Free 60s Speed Test & WPM Practice",
      description: "Take the free English typing test online (60 seconds, 1-10 min). Practice paragraphs, test live chat typing speed, check net WPM & accuracy in real time.",
    },
    es: {
      title: "Test de Mecanografía en Inglés — Prueba de Velocidad y WPM Gratis",
      description: "Haz el test de mecanografía en inglés gratis (60 segundos, 1-10 min). Mide tus palabras por minuto (WPM), precisión y velocidad en tiempo real.",
    },
    ja: {
      title: "英語タイピングテスト — 無料60秒スピード診断とWPM練習",
      description: "無料の英語タイピングテスト（60秒、1〜10分）。長文入力練習、リアルタイムWPM測定、正確性分析がすぐに行えます。",
    },
    ar: {
      title: "اختبار سرعة الطباعة بالإنجليزية — فحص سرعة الكلمات في الدقيقة مجانًا",
      description: "أجرِ اختبار الطباعة باللغة الإنجليزية مجانًا (60 ثانية، 1 إلى 10 دقائق). قس عدد الكلمات في الدقيقة والدقة في الوقت الفعلي.",
    },
    zh: {
      title: "英语打字测试 — 免费60秒在线打字测速与WPM练习平台",
      description: "免费在线进行英语打字测速（60秒及1-10分钟长文）。实时分析每分钟打字词数(WPM)、准确率与按键热力图。",
    },
    de: {
      title: "Englisch Tipptest Online — Kostenloser WPM-Geschwindigkeitstest",
      description: "Kostenloser englischer Tipptest (60 Sekunden, 1-10 Minuten). Messen Sie WPM, Genauigkeit und CPM in Echtzeit.",
    },
    fr: {
      title: "Test de Dactylographie Anglaise — Test de Vitesse WPM Gratuit",
      description: "Passez le test de frappe en anglais gratuit (60 secondes, 1 à 10 min). Mesurez vos mots par minute et votre précision en direct.",
    },
    ru: {
      title: "Тест Скорости Печати на Английском — Бесплатный WPM Тест",
      description: "Пройдите бесплатный тест скорости печати на английском языке (60 сек, 1-10 мин). Проверьте свои слова в минуту (WPM) и точность.",
    },
    pt: {
      title: "Teste de Digitação em Inglês — Medidor de Velocidade WPM Grátis",
      description: "Faça o teste de digitação em inglês gratuito (60 segundos, 1 a 10 min). Meça suas palavras por minuto (WPM) e precisão em tempo real.",
    },
    bn: {
      title: "ইংরেজি টাইপিং টেস্ট — ফ্রি ৬০ সেকেন্ড স্পিড ও WPM পরীক্ষা",
      description: "বিনামূল্যে অনলাইনে ইংরেজি টাইপিং পরীক্ষা দিন (৬০ সেকেন্ড, ১-১০ মিনিট)। রিয়েল টাইমে আপনার WPM এবং নির্ভুলতা যাচাই করুন।",
    },
    ur: {
      title: "انگریزی ٹائپنگ ٹیسٹ — مفت 60 سیکنڈ اسپیڈ اور WPM ٹیسٹ",
      description: "مفت آن لائن انگلش ٹائپنگ ٹیسٹ دیں اور حقیقی وقت میں اپنے الفاظ فی منٹ (WPM) اور درستگی کی جانچ کریں۔",
    },
    hi: {
      title: "इंग्लिश टाइपिंग टेस्ट — फ्री 60 सेकंड स्पीड टेस्ट और WPM प्रैक्टिस",
      description: "फ्री ऑनलाइन इंग्लिश टाइपिंग टेस्ट दें (60 सेकंड, 1-10 मिनट)। रियल-टाइम में नेट WPM, एक्यूरेसी और मिस्टेक हीटमैप चेक करें।",
    },
  },

  typing_test: {
    en: {
      title: "English Typing Tests (1 to 15 Min) — Practice Online",
      description: "Free online English typing tests: 60 seconds, 2 min, 5 min, 7 min (GCC-TBC), 10 min paragraphs, and 15 min endurance.",
    },
    es: {
      title: "Tests de Mecanografía en Inglés (1 a 15 Min) — Práctica Online",
      description: "Tests de mecanografía en inglés gratuitos: 60 segundos, 2 min, 5 min, 7 min (GCC-TBC), párrafos de 10 min y 15 min.",
    },
    zh: {
      title: "英语打字测速中心 (1至15分钟多时长) — 在线段落练习",
      description: "多时长在线英语打字测速：60秒冲刺、2分钟、5分钟、7分钟(GCC-TBC)、10分钟标准段落及15分钟耐力测试。",
    },
    ja: {
      title: "英語タイピングテスト一覧 (1〜15分) — オンライン長文練習",
      description: "60秒、2分、5分、7分、10分、15分のタイピングテスト。リアルタイムWPM計測と長文入力練習。",
    },
    ar: {
      title: "اختبارات الطباعة باللغة الإنجليزية (1 إلى 15 دقيقة) — تدريب مجاني",
      description: "اختبارات سرعة الطباعة بالإنجليزية لمختلف الفترات الزمنية (60 ثانية، 2 دقيقة، 5 دقائق، 10 دقائق، 15 دقيقة).",
    },
    fr: {
      title: "Tests de Dactylographie Anglaise (1 à 15 Min) — Entraînement en Ligne",
      description: "Tests de frappe en ligne gratuits de 60s, 2 min, 5 min, 7 min, 10 min et 15 min avec statistiques WPM en direct.",
    },
    de: {
      title: "Englisch Tipptests (1 bis 15 Min) — Online Tippübungen",
      description: "Kostenlose Online-Tipptests für 60 Sekunden, 2, 5, 7, 10 und 15 Minuten mit Live-WPM-Auswertung.",
    },
    ru: {
      title: "Тесты Скоропечатания на Английском (от 1 до 15 Минут) — Онлайн",
      description: "Бесплатные тесты набора текста на 60 секунд, 2, 5, 7, 10 и 15 минут с точным анализом скорости.",
    },
    pt: {
      title: "Testes de Digitação em Inglês (1 a 15 Min) — Prática Online",
      description: "Testes gratuitos de digitação de 60s, 2 min, 5 min, 7 min, 10 min e 15 min com estatísticas em tempo real.",
    },
    bn: {
      title: "ইংরেজি টাইপিং টেস্ট সময়সূচী (১ থেকে ১৫ মিনিট) — অনলাইন প্র্যাকটিস",
      description: "অনলাইন ইংরেজি টাইপিং টেস্ট: ৬০ সেকেন্ড, ২ মিনিট, ৫ মিনিট, ১০ মিনিট ও ১৫ মিনিটের রিয়েল টাইম WPM টেস্ট।",
    },
    ur: {
      title: "انگریزی ٹائپنگ ٹیسٹ (1 سے 15 منٹ) — آن لائن مشق",
      description: "مختلف دورانیے کے انگلش ٹائپنگ ٹیسٹ: 60 سیکنڈ، 2 منٹ، 5 منٹ، 10 منٹ اور 15 منٹ کے لائیو ٹیسٹ۔",
    },
    hi: {
      title: "इंग्लिश टाइपिंग टेस्ट (1 से 15 मिनट) — ऑनलाइन पैराग्राफ प्रैक्टिस",
      description: "फ्री ऑनलाइन इंग्लिश टाइपिंग टेस्ट: 60 सेकंड, 2 मिनट, 5 मिनट, 7 मिनट, 10 मिनट और 15 मिनट पैराग्राफ प्रैक्टिस।",
    },
  },

  leaderboard: {
    en: {
      title: "Global Typing Leaderboard — Top Typists Ranking",
      description: "View top global typing speed records, highest WPM scores, and country rankings on the live leaderboard.",
    },
    es: {
      title: "Tabla de Clasificación Global de Mecanografía — Récords de WPM",
      description: "Consulta los récords mundiales de velocidad de mecanografía, mejores puntajes WPM y clasificaciones por país.",
    },
    zh: {
      title: "全球打字风云榜 — 实时WPM极速排行榜与国家排名",
      description: "查看全球顶尖打字高手的最高WPM纪录、击键准确率榜单与实时国家排名。",
    },
    ja: {
      title: "世界タイピングランキング — 最高WPM記録と国別リーダーボード",
      description: "世界中のトップタイピストの最高速度記録、WPMスコア、国別ランキングをリアルタイムで閲覧。",
    },
    ar: {
      title: "لوحة الشرف العالمية للطباعة — تصنيف أسرع الطباعين حول العالم",
      description: "اطلع على الأرقام القياسية العالمية في سرعة الطباعة وتصنيفات أسرع المستخدمين حسب الدولة.",
    },
    fr: {
      title: "Classement Mondial de Dactylographie — Meilleurs Scores WPM",
      description: "Consultez les records mondiaux de vitesse de frappe et les classements en direct par pays.",
    },
    de: {
      title: "Globale Tipp-Bestenliste — Weltweite WPM-Rekorde",
      description: "Sehen Sie die weltweiten Rekorde im Schnellschreiben und die Top-Länderranglisten live ein.",
    },
    ru: {
      title: "Мировой Рейтинг Скоропечатания — Топ Рекорды WPM",
      description: "Просматривайте мировые рекорды скорости печати и рейтинг лучших пользователей по странам.",
    },
    pt: {
      title: "Ranking Global de Digitação — Maiores Recordes de WPM",
      description: "Veja os recordes mundiais de velocidade de digitação, pontuações de WPM e classificações por país.",
    },
    bn: {
      title: "গ্লোবাল টাইপিং লিডারবোর্ড — সেরা টাইপিস্টদের তালিকা",
      description: "বিশ্বের শীর্ষ টাইপিস্টদের গতি রেকর্ড, সর্বোচ্চ WPM স্কোর এবং দেশভিত্তিক রিয়েল-টাইম র্যাঙ্কিং দেখুন।",
    },
    ur: {
      title: "عالمی ٹائپنگ لیڈر بورڈ — بہترین ٹائپسٹس کی درجہ بندی",
      description: "دنیا بھر کے ٹاپ ٹائپسٹس کے اسپیڈ ریکارڈز اور ملکی درجہ بندی لائیو دیکھیں۔",
    },
    hi: {
      title: "ग्लोबल टाइपिंग लीडरबोर्ड — टॉप टाइपिस्ट्स रैंकिंग और WPM रिकॉर्ड्स",
      description: "दुनिया भर के टॉप टाइपिस्ट्स के स्पीड रिकॉर्ड्स, हाईएस्ट WPM स्कोर्स और कंट्री रैंकिंग्स देखें।",
    },
  },
};

/**
 * Get localized SEO Title and Meta Description for any page
 */
export function getLocalizedSeo(page: SeoPageKey, lang?: string): LocalizedSeoMeta {
  const code = (lang || "en").toLowerCase().split("-")[0];
  const pageDict = SEO_TRANSLATIONS[page];
  if (!pageDict) {
    return { title: "English Typing Test", description: "Online typing test platform." };
  }
  return pageDict[code] || pageDict["en"];
}

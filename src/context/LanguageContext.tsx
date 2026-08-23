import React, { createContext, useContext, useEffect, useState } from 'react';

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
  isRtl?: boolean;
}

export const GLOBAL_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', region: 'Global / Americas' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'Europe & Americas' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', region: 'Asia' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼', region: 'Asia' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'South Asia' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'Middle East & Africa', isRtl: true },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'Europe & Africa' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', region: 'Americas & Europe' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Europe' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Eastern Europe & Central Asia' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'East Asia' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'East Asia' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Europe' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Europe & Middle East' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Southeast Asia' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', region: 'Eastern Europe' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Europe' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Southeast Asia' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', region: 'South Asia' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', region: 'South Asia' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', region: 'South Asia' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', region: 'South Asia' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'South Asia' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', region: 'South Asia', isRtl: true },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', region: 'Middle East', isRtl: true },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', region: 'Southeast Asia' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', region: 'Northern Europe' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', region: 'Southern Europe' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', region: 'Middle East', isRtl: true },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', region: 'Eastern Europe' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', region: 'Eastern Europe' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', region: 'Central Europe' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', region: 'Central Europe' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', region: 'Northern Europe' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', region: 'Northern Europe' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', region: 'Northern Europe' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', region: 'Southeast Asia' },
  { code: 'tl', name: 'Filipino / Tagalog', nativeName: 'Wikang Filipino', flag: '🇵🇭', region: 'Southeast Asia' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', region: 'East Africa' },
  { code: 'pt-PT', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)', flag: '🇵🇹', region: 'Europe' },
];

// Core dictionary for immediate instant UI localization
const TRANSLATIONS: Record<string, Record<string, string>> = {
  // Navigation & Core Labels
  'nav.imageTools': {
    en: 'Image Tools',
    es: 'Herramientas de Imagen',
    'zh-CN': '图像工具',
    'zh-TW': '圖像工具',
    hi: 'इमेज टूल्स',
    ar: 'أدوات الصور',
    fr: "Outils d'image",
    pt: 'Ferramentas de Imagem',
    de: 'Bildwerkzeuge',
    ru: 'Инструменты для изображений',
    ja: '画像ツール',
    ko: '이미지 도구',
    it: 'Strumenti Immagine',
    tr: 'Resim Araçları',
    vi: 'Công cụ hình ảnh',
    nl: 'Afbeeldingshulpmiddelen',
    id: 'Alat Gambar',
    bn: 'ছবি টুলস',
    ur: 'تصویر کے ٹولز',
  },
  'nav.pdfTools': {
    en: 'PDF Tools',
    es: 'Herramientas PDF',
    'zh-CN': 'PDF 工具',
    'zh-TW': 'PDF 工具',
    hi: 'पीडीएफ टूल्स',
    ar: 'أدوات PDF',
    fr: 'Outils PDF',
    pt: 'Ferramentas PDF',
    de: 'PDF-Werkzeuge',
    ru: 'Инструменты PDF',
    ja: 'PDF ツール',
    ko: 'PDF 도구',
    it: 'Strumenti PDF',
    tr: 'PDF Araçları',
    vi: 'Công cụ PDF',
    nl: 'PDF-hulpmiddelen',
    id: 'Alat PDF',
    bn: 'পিডিএফ টুলস',
    ur: 'پی ڈی ایف ٹولز',
  },
  'nav.textTools': {
    en: 'Text Tools',
    es: 'Herramientas de Texto',
    'zh-CN': '文本工具',
    'zh-TW': '文本工具',
    hi: 'टेक्स्ट टूल्स',
    ar: 'أدوات النصوص',
    fr: 'Outils de texte',
    pt: 'Ferramentas de Texto',
    de: 'Textwerkzeuge',
    ru: 'Текстовые инструменты',
    ja: 'テキストツール',
    ko: '텍스트 도구',
    it: 'Strumenti Testo',
    tr: 'Metin Araçları',
    vi: 'Công cụ văn bản',
    nl: 'Teksthulpmiddelen',
    id: 'Alat Teks',
    bn: 'টেক্সট টুলস',
    ur: 'متن کے ٹولز',
  },
  'nav.generators': {
    en: 'Generators',
    es: 'Generadores',
    'zh-CN': '生成器',
    'zh-TW': '生成器',
    hi: 'जेनरेटर',
    ar: 'المولدات',
    fr: 'Générateurs',
    pt: 'Geradores',
    de: 'Generatoren',
    ru: 'Генераторы',
    ja: 'ジェネレーター',
    ko: '생성기',
    it: 'Generatori',
    tr: 'Oluşturucular',
    vi: 'Trình tạo',
    nl: 'Generatoren',
    id: 'Generator',
    bn: 'জেনারেটর',
    ur: 'جنریٹرز',
  },
  'nav.allTools': {
    en: 'All Tools',
    es: 'Todas las Herramientas',
    'zh-CN': '所有工具',
    'zh-TW': '所有工具',
    hi: 'सभी टूल्स',
    ar: 'جميع الأدوات',
    fr: 'Tous les outils',
    pt: 'Todas as Ferramentas',
    de: 'Alle Werkzeuge',
    ru: 'Все инструменты',
    ja: 'すべてのツール',
    ko: '모든 도구',
    it: 'Tutti gli strumenti',
    tr: 'Tüm Araçlar',
    vi: 'Tất cả công cụ',
    nl: 'Alle hulpmiddelen',
    id: 'Semua Alat',
    bn: 'সব টুলস',
    ur: 'تمام ٹولز',
  },
  'nav.search': {
    en: 'Search tools...',
    es: 'Buscar herramientas...',
    'zh-CN': '搜索工具...',
    'zh-TW': '搜尋工具...',
    hi: 'टूल्स खोजें...',
    ar: 'بحث عن أدوات...',
    fr: 'Rechercher des outils...',
    pt: 'Buscar ferramentas...',
    de: 'Werkzeuge suchen...',
    ru: 'Поиск инструментов...',
    ja: 'ツールを検索...',
    ko: '도구 검색...',
    it: 'Cerca strumenti...',
    tr: 'Araçları ara...',
    vi: 'Tìm kiếm công cụ...',
    nl: 'Zoek hulpmiddelen...',
    id: 'Cari alat...',
    bn: 'টুল অনুসন্ধান করুন...',
    ur: 'ٹولز تلاش کریں...',
  },
  'badge.free': {
    en: '100% Free',
    es: '100% Gratis',
    'zh-CN': '100% 免费',
    'zh-TW': '100% 免費',
    hi: '100% मुफ़्त',
    ar: 'مجاني 100%',
    fr: '100% Gratuit',
    pt: '100% Grátis',
    de: '100% Kostenlos',
    ru: '100% Бесплатно',
    ja: '100% 無料',
    ko: '100% 무료',
    it: '100% Gratuito',
    tr: '%100 Ücretsiz',
    vi: '100% Miễn phí',
    nl: '100% Gratis',
    id: '100% Gratis',
  },
  'badge.private': {
    en: '100% Private (No Uploads)',
    es: '100% Privado (Sin Subidas)',
    'zh-CN': '100% 隐私安全（无需上传）',
    'zh-TW': '100% 隱私安全（無需上傳）',
    hi: '100% निजी (कोई अपलोड नहीं)',
    ar: 'خصوصية 100% (بدون رفع)',
    fr: '100% Privé (Aucun envoi)',
    pt: '100% Privado (Sem Upload)',
    de: '100% Privat (Kein Upload)',
    ru: '100% Приватно (Без загрузки)',
    ja: '100% プライベート（サーバー送信なし）',
    ko: '100% 개인정보 보호 (업로드 없음)',
  },
  'theme.customizer': {
    en: 'Customize Theme',
    es: 'Personalizar Tema',
    'zh-CN': '自定义主题',
    'zh-TW': '自定義主題',
    hi: 'थीम कस्टमाइज़ करें',
    ar: 'تخصيص المظهر',
    fr: 'Personnaliser le thème',
    pt: 'Personalizar Tema',
    de: 'Design anpassen',
    ru: 'Настроить тему',
    ja: 'テーマのカスタマイズ',
    ko: '테마 사용자 지정',
    it: 'Personalizza Tema',
  },
  'lang.select': {
    en: 'Select Language',
    es: 'Seleccionar Idioma',
    'zh-CN': '选择语言',
    'zh-TW': '選擇語言',
    hi: 'भाषा चुनें',
    ar: 'اختر اللغة',
    fr: 'Choisir la langue',
    pt: 'Selecionar Idioma',
    de: 'Sprache wählen',
    ru: 'Выбрать язык',
    ja: '言語を選択',
    ko: '언어 선택',
    it: 'Seleziona Lingua',
  },
};

interface LanguageContextType {
  currentLanguage: LanguageOption;
  setLanguage: (code: string) => void;
  t: (key: string, fallback?: string) => string;
  isRtl: boolean;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [langCode, setLangCodeState] = useState<string>(() => {
    const saved = localStorage.getItem('toolboxx_language');
    if (saved && GLOBAL_LANGUAGES.some(l => l.code === saved)) {
      return saved;
    }
    // Check navigator language
    const browserLang = navigator.language;
    const directMatch = GLOBAL_LANGUAGES.find(l => l.code === browserLang);
    if (directMatch) return directMatch.code;
    const prefixMatch = GLOBAL_LANGUAGES.find(l => browserLang.startsWith(l.code));
    if (prefixMatch) return prefixMatch.code;
    return 'en';
  });

  const currentLanguage = GLOBAL_LANGUAGES.find(l => l.code === langCode) || GLOBAL_LANGUAGES[0];
  const isRtl = Boolean(currentLanguage.isRtl);

  useEffect(() => {
    localStorage.setItem('toolboxx_language', langCode);
    
    // Update HTML dir and lang attributes
    document.documentElement.lang = langCode;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

    // Trigger Google Translate widget if language is non-English
    if (langCode !== 'en') {
      try {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (select) {
          select.value = langCode.split('-')[0];
          select.dispatchEvent(new Event('change'));
        }
      } catch (e) {
        // Silent fallback
      }
    }
  }, [langCode, isRtl]);

  const setLanguage = (code: string) => {
    if (GLOBAL_LANGUAGES.some(l => l.code === code)) {
      setLangCodeState(code);
    }
  };

  const t = (key: string, fallback: string = ''): string => {
    const dict = TRANSLATIONS[key];
    if (dict) {
      if (dict[langCode]) return dict[langCode];
      // Fallback to base language (e.g. 'zh' for 'zh-CN')
      const base = langCode.split('-')[0];
      if (dict[base]) return dict[base];
      if (dict['en']) return dict['en'];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, isRtl, languages: GLOBAL_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

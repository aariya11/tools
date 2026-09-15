/**
 * Global Multilingual SEO & Natural Search Keyword Clusters
 * Maps natural international search intent across major languages
 * to real client-side PDF utilities without keyword stuffing or doorway tactics.
 */

export interface LanguageKeywordCluster {
  language: string;
  code: string;
  pdfTools: string[];
  mergePdf: string[];
  compressPdf: string[];
  splitPdf: string[];
  editPdf: string[];
  pdfToWord: string[];
  wordToPdf: string[];
  pdfToJpg: string[];
  jpgToPdf: string[];
  ocrPdf: string[];
  signPdf: string[];
  protectPdf: string[];
  unlockPdf: string[];
}

export const MULTILINGUAL_PDF_SEO: Record<string, LanguageKeywordCluster> = {
  en: {
    language: 'English',
    code: 'en',
    pdfTools: ['free pdf tools', 'online pdf tools', 'pdf utilities', 'free online pdf tools'],
    mergePdf: ['merge pdf', 'combine pdf', 'join pdf', 'merge pdfs online free'],
    compressPdf: ['compress pdf', 'reduce pdf size', 'shrink pdf', 'compress pdf online free'],
    splitPdf: ['split pdf', 'separate pdf pages', 'extract pdf pages', 'cut pdf'],
    editPdf: ['edit pdf', 'online pdf editor', 'free pdf editor', 'modify pdf'],
    pdfToWord: ['pdf to word', 'convert pdf to docx', 'pdf to doc converter'],
    wordToPdf: ['word to pdf', 'convert docx to pdf', 'doc to pdf'],
    pdfToJpg: ['pdf to jpg', 'pdf to image', 'convert pdf to png'],
    jpgToPdf: ['jpg to pdf', 'images to pdf', 'convert photos to pdf'],
    ocrPdf: ['ocr pdf', 'scanned pdf to text', 'extract text from pdf'],
    signPdf: ['sign pdf', 'electronic signature pdf', 'fill and sign pdf'],
    protectPdf: ['protect pdf', 'encrypt pdf', 'add password to pdf'],
    unlockPdf: ['unlock pdf', 'remove pdf password', 'decrypt pdf'],
  },
  es: {
    language: 'Spanish',
    code: 'es',
    pdfTools: ['herramientas pdf gratis', 'herramientas pdf online', 'utilidades pdf'],
    mergePdf: ['unir pdf', 'juntar pdf', 'combinar pdf', 'unir archivos pdf'],
    compressPdf: ['comprimir pdf', 'reducir tamano pdf', 'bajar peso pdf'],
    splitPdf: ['dividir pdf', 'separar paginas pdf', 'cortar pdf'],
    editPdf: ['editar pdf', 'editor pdf online', 'modificar pdf gratis'],
    pdfToWord: ['pdf a word', 'convertir pdf a docx', 'pasar pdf a word'],
    wordToPdf: ['word a pdf', 'convertir word a pdf', 'pasar word a pdf'],
    pdfToJpg: ['pdf a jpg', 'convertir pdf a imagen', 'pdf a png'],
    jpgToPdf: ['jpg a pdf', 'imagen a pdf', 'convertir fotos a pdf'],
    ocrPdf: ['ocr pdf', 'reconocimiento de texto pdf', 'extraer texto de pdf escaneado'],
    signPdf: ['firmar pdf', 'firma electronica pdf', 'firmar documentos pdf'],
    protectPdf: ['proteger pdf', 'poner contrasena a pdf', 'encriptar pdf'],
    unlockPdf: ['desbloquear pdf', 'quitar contrasena pdf', 'desproteger pdf'],
  },
  pt: {
    language: 'Portuguese',
    code: 'pt',
    pdfTools: ['ferramentas pdf gratis', 'utilitarios pdf online', 'ferramentas pdf'],
    mergePdf: ['juntar pdf', 'combinar pdf', 'mesclar pdf', 'unir pdf'],
    compressPdf: ['comprimir pdf', 'diminuir tamanho pdf', 'reduzir pdf'],
    splitPdf: ['dividir pdf', 'separar pdf', 'extrair paginas pdf'],
    editPdf: ['editar pdf', 'editor de pdf online gratis', 'modificar pdf'],
    pdfToWord: ['pdf para word', 'converter pdf em docx', 'transformar pdf em word'],
    wordToPdf: ['word para pdf', 'converter word em pdf', 'salvar word em pdf'],
    pdfToJpg: ['pdf para jpg', 'converter pdf em imagem', 'pdf para png'],
    jpgToPdf: ['jpg para pdf', 'imagem para pdf', 'fotos para pdf'],
    ocrPdf: ['ocr pdf', 'reconhecer texto pdf', 'pdf digitalizado para texto'],
    signPdf: ['assinar pdf', 'assinatura eletronica pdf', 'assinar documento online'],
    protectPdf: ['proteger pdf', 'colocar senha no pdf', 'bloquear pdf'],
    unlockPdf: ['desbloquear pdf', 'remover senha de pdf', 'tirar senha do pdf'],
  },
  fr: {
    language: 'French',
    code: 'fr',
    pdfTools: ['outils pdf gratuits', 'outils pdf en ligne', 'suite pdf gratuit'],
    mergePdf: ['fusionner pdf', 'assembler pdf', 'combiner pdf', 'regrouper pdf'],
    compressPdf: ['compresser pdf', 'reduire taille pdf', 'diminuer poids pdf'],
    splitPdf: ['diviser pdf', 'separer pages pdf', 'decouper pdf'],
    editPdf: ['modifier pdf', 'editeur pdf en ligne gratuit', 'editer pdf'],
    pdfToWord: ['pdf en word', 'convertir pdf en docx', 'transformer pdf en word'],
    wordToPdf: ['word en pdf', 'convertir word en pdf', 'document word en pdf'],
    pdfToJpg: ['pdf en jpg', 'convertir pdf en image', 'pdf en png'],
    jpgToPdf: ['jpg en pdf', 'convertir photo en pdf', 'image en pdf'],
    ocrPdf: ['ocr pdf', 'retranscription texte pdf', 'extraire texte pdf numerise'],
    signPdf: ['signer pdf', 'signature electronique pdf', 'signer document pdf'],
    protectPdf: ['proteger pdf', 'securiser pdf par mot de passe', 'crypter pdf'],
    unlockPdf: ['deverrouiller pdf', 'supprimer mot de passe pdf', 'debloquer pdf'],
  },
  de: {
    language: 'German',
    code: 'de',
    pdfTools: ['kostenlose pdf werkzeuge', 'pdf tools online', 'pdf programm kostenlos'],
    mergePdf: ['pdf zusammenfugen', 'pdf verbinden', 'mehrere pdfs zusammenfugen'],
    compressPdf: ['pdf komprimieren', 'pdf dateigrosse verkleinern', 'pdf verkleinern'],
    splitPdf: ['pdf teilen', 'pdf seiten trennen', 'pdf zerlegen'],
    editPdf: ['pdf bearbeiten', 'kostenloser pdf editor online', 'pdf andern'],
    pdfToWord: ['pdf in word', 'pdf zu word konvertieren', 'pdf in docx'],
    wordToPdf: ['word in pdf', 'word datei in pdf umwandeln', 'docx in pdf'],
    pdfToJpg: ['pdf in jpg', 'pdf in bild umwandeln', 'pdf als bild speichern'],
    jpgToPdf: ['jpg in pdf', 'bild in pdf umwandeln', 'fotos in pdf zusammenfugen'],
    ocrPdf: ['pdf ocr', 'texterkennung pdf', 'gescanntes pdf in text'],
    signPdf: ['pdf unterschreiben', 'elektronische signatur pdf', 'pdf signieren'],
    protectPdf: ['pdf schutzen', 'passwort zu pdf hinzufugen', 'pdf verschlusseln'],
    unlockPdf: ['pdf entsperren', 'passwort aus pdf entfernen', 'pdf freischalten'],
  },
  it: {
    language: 'Italian',
    code: 'it',
    pdfTools: ['strumenti pdf gratis', 'programmi pdf online', 'utility pdf'],
    mergePdf: ['unire pdf', 'fondere pdf', 'unisci file pdf online'],
    compressPdf: ['comprimere pdf', 'ridurre dimensioni pdf', 'alleggerire pdf'],
    splitPdf: ['dividere pdf', 'separare pagine pdf', 'estrarre pagine pdf'],
    editPdf: ['modificare pdf', 'editor pdf online gratuito', 'scrivere su pdf'],
    pdfToWord: ['da pdf a word', 'convertire pdf in word docx', 'trasformare pdf in word'],
    wordToPdf: ['da word a pdf', 'convertire word in pdf', 'doc a pdf'],
    pdfToJpg: ['da pdf a jpg', 'convertire pdf in immagini', 'pdf a png'],
    jpgToPdf: ['da jpg a pdf', 'convertire foto in pdf', 'immagini in pdf'],
    ocrPdf: ['ocr pdf', 'riconoscimento testo pdf', 'estrarre testo da pdf scannerizzato'],
    signPdf: ['firmare pdf', 'firma digitale pdf', 'firma elettronica pdf'],
    protectPdf: ['proteggere pdf', 'mettere password a pdf', 'crittografare pdf'],
    unlockPdf: ['sbloccare pdf', 'rimuovere password da pdf', 'aprire pdf protetto'],
  },
  hi: {
    language: 'Hindi',
    code: 'hi',
    pdfTools: ['फ्री पीडीएफ टूल्स', 'ऑनलाइन पीडीएफ टूल्स', 'पीडीएफ यूटिलिटीज'],
    mergePdf: ['पीडीएफ मर्ज करें', 'पीडीएफ फाइल जोड़ें', 'पीडीएफ फाइलों को एक साथ मिलाएं'],
    compressPdf: ['पीडीएफ कंप्रेस करें', 'पीडीएफ साइज कम करें', 'पीडीएफ छोटा करें'],
    splitPdf: ['पीडीएफ अलग करें', 'पीडीएफ पेज काटें', 'पीडीएफ विभाजित करें'],
    editPdf: ['पीडीएफ एडिट करें', 'ऑनलाइन पीडीएफ एडिटर', 'पीडीएफ में बदलाव करें'],
    pdfToWord: ['पीडीएफ से वर्ड', 'पीडीएफ को वर्ड में बदलें', 'पीडीएफ टू डॉक्स'],
    wordToPdf: ['वर्ड से पीडीएफ', 'वर्ड फाइल को पीडीएफ बनाएं', 'डॉक टू पीडीएफ'],
    pdfToJpg: ['पीडीएफ से फोटो', 'पीडीएफ को जेपीजी में बदलें', 'पीडीएफ टू इमेज'],
    jpgToPdf: ['फोटो से पीडीएफ', 'जेपीजी को पीडीएफ में बदलें', 'इमेज टू पीडीएफ'],
    ocrPdf: ['पीडीएफ ओसीआर', 'स्कैन पीडीएफ से टेक्स्ट निकालें', 'पीडीएफ टेक्स्ट पहचान'],
    signPdf: ['पीडीएफ साइन करें', 'डिजिटल हस्ताक्षर पीडीएफ', 'पीडीएफ पर सिग्नेचर करें'],
    protectPdf: ['पीडीएफ पासवर्ड लगाएं', 'पीडीएफ सुरक्षित करें', 'पीडीएफ लॉक करें'],
    unlockPdf: ['पीडीएफ पासवर्ड हटाएं', 'पीडीएफ अनलॉक करें', 'पीडीएफ लॉक खोलें'],
  },
  ar: {
    language: 'Arabic',
    code: 'ar',
    pdfTools: ['أدوات بي دي اف مجانية', 'أدوات تحرير pdf أونلاين', 'برامج pdf'],
    mergePdf: ['دمج ملفات pdf', 'تجميع ملفات بي دي اف', 'دمج بي دي اف أون لاين'],
    compressPdf: ['ضغط ملف pdf', 'تصغير حجم بي دي اف', 'تقليل حجم ملف pdf'],
    splitPdf: ['تقسيم ملف pdf', 'فصل صفحات بي دي اف', 'استخراج صفحات pdf'],
    editPdf: ['تعديل ملف pdf', 'محرر بي دي اف مجاني', 'الكتابة على pdf'],
    pdfToWord: ['تحويل pdf إلى word', 'تحويل بي دي اف لوورد', 'بي دي اف الى وورد عربي'],
    wordToPdf: ['تحويل word إلى pdf', 'تحويل وورد الى بي دي اف', 'حفظ وورد كملف pdf'],
    pdfToJpg: ['تحويل pdf إلى jpg', 'تحويل بي دي اف لصور', 'pdf الى png'],
    jpgToPdf: ['تحويل الصور الى pdf', 'تحويل jpg الى pdf', 'دمج الصور في ملف pdf'],
    ocrPdf: ['استخراج النص من pdf', 'ocr بي دي اف عربي', 'التعرف الضوئي على الحروف'],
    signPdf: ['توقيع ملف pdf', 'إضافة توقيع إلكتروني', 'توقيع بي دي اف أونلاين'],
    protectPdf: ['حماية ملف pdf', 'قفل بي دي اف بكلمة سر', 'تشفير pdf'],
    unlockPdf: ['فتح قفل pdf', 'إزالة كلمة مرور بي دي اف', 'فك حماية pdf'],
  },
};

export const getToolMultilingualKeywords = (toolId: string): string[] => {
  const result: string[] = [];
  for (const lang of Object.values(MULTILINGUAL_PDF_SEO)) {
    if (toolId === 'pdf-merge' && lang.mergePdf) result.push(...lang.mergePdf);
    else if (toolId === 'pdf-compress' && lang.compressPdf) result.push(...lang.compressPdf);
    else if (toolId === 'pdf-split' && lang.splitPdf) result.push(...lang.splitPdf);
    else if (toolId === 'edit-pdf' && lang.editPdf) result.push(...lang.editPdf);
    else if (toolId === 'pdf-to-word' && lang.pdfToWord) result.push(...lang.pdfToWord);
    else if (toolId === 'word-to-pdf' && lang.wordToPdf) result.push(...lang.wordToPdf);
    else if (toolId === 'pdf-to-jpg' && lang.pdfToJpg) result.push(...lang.pdfToJpg);
    else if (toolId === 'jpg-to-pdf' && lang.jpgToPdf) result.push(...lang.jpgToPdf);
    else if (toolId === 'ocr-pdf' && lang.ocrPdf) result.push(...lang.ocrPdf);
    else if (toolId === 'sign-pdf' && lang.signPdf) result.push(...lang.signPdf);
    else if (toolId === 'protect-pdf' && lang.protectPdf) result.push(...lang.protectPdf);
    else if (toolId === 'unlock-pdf' && lang.unlockPdf) result.push(...lang.unlockPdf);
  }
  return result;
};

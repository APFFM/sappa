/**
 * Language Service
 * Detects language from text and provides TTS voice mappings
 */

// Language detection patterns (common words/patterns for each language)
const LANGUAGE_PATTERNS = {
  de: /\b(ich|und|der|die|das|ist|nicht|ein|eine|mit|auf|für|haben|werden|sind|auch|wie|oder|aber|wenn|noch|nach|kann|nur|mehr|schon|bei|werden|sein|mein|dein|ihr|uns|euch|sehr|gut|danke|bitte|ja|nein|hallo|tschüss|guten|morgen|abend|tag)\b/gi,
  fr: /\b(je|tu|il|elle|nous|vous|ils|elles|le|la|les|un|une|des|et|ou|mais|donc|car|que|qui|quoi|est|sont|avoir|être|faire|aller|voir|venir|prendre|pouvoir|vouloir|devoir|savoir|falloir|très|bien|merci|bonjour|bonsoir|salut|oui|non|comment|pourquoi)\b/gi,
  es: /\b(yo|tú|él|ella|nosotros|vosotros|ellos|ellas|el|la|los|las|un|una|unos|unas|y|o|pero|porque|que|quien|como|cuando|donde|es|son|estar|ser|tener|hacer|ir|ver|poder|querer|deber|saber|muy|bien|gracias|hola|adiós|sí|no|buenos|días|noches|tardes)\b/gi,
  it: /\b(io|tu|lui|lei|noi|voi|loro|il|lo|la|i|gli|le|un|uno|una|e|o|ma|perché|che|chi|come|quando|dove|è|sono|essere|avere|fare|andare|vedere|potere|volere|dovere|sapere|molto|bene|grazie|ciao|arrivederci|sì|no|buongiorno|buonasera)\b/gi,
  pt: /\b(eu|tu|ele|ela|nós|vós|eles|elas|o|a|os|as|um|uma|uns|umas|e|ou|mas|porque|que|quem|como|quando|onde|é|são|estar|ser|ter|fazer|ir|ver|poder|querer|dever|saber|muito|bem|obrigado|olá|adeus|sim|não|bom|dia|noite|tarde)\b/gi,
  nl: /\b(ik|jij|hij|zij|wij|jullie|zij|de|het|een|en|of|maar|omdat|dat|die|wat|wie|hoe|wanneer|waar|is|zijn|hebben|worden|gaan|zien|kunnen|willen|moeten|weten|zeer|goed|dank|hallo|dag|ja|nee|goedemorgen|goedemiddag|goedenavond)\b/gi,
  ru: /[\u0400-\u04FF]/,
  zh: /[\u4E00-\u9FFF]/,
  ja: /[\u3040-\u309F\u30A0-\u30FF]/,
  ko: /[\uAC00-\uD7AF]/,
  ar: /[\u0600-\u06FF]/,
  hi: /[\u0900-\u097F]/,
  tr: /\b(ben|sen|o|biz|siz|onlar|ve|veya|ama|çünkü|ki|ne|kim|nasıl|ne zaman|nerede|var|yok|olmak|yapmak|gitmek|gelmek|görmek|bilmek|istemek|çok|iyi|teşekkür|merhaba|güle güle|evet|hayır|günaydın|iyi akşamlar)\b/gi,
  pl: /\b(ja|ty|on|ona|my|wy|oni|one|i|lub|ale|bo|że|kto|co|jak|kiedy|gdzie|jest|są|być|mieć|robić|iść|widzieć|móc|chcieć|musieć|wiedzieć|bardzo|dobrze|dziękuję|cześć|do widzenia|tak|nie|dzień dobry|dobry wieczór)\b/gi,
};

// ElevenLabs voice IDs for different languages
const ELEVENLABS_VOICES = {
  en: '21m00Tcm4TlvDq8ikWAM', // Alice (English)
  de: 'pMsXgVXv3BLzUgSXRplE', // German female voice
  fr: 'MF3mGyEYCl7XYWbV9V6O', // French female voice
  es: 'AZnzlk1XvdvUeBnXmlld', // Spanish female voice
  it: 'Xb7hH8MSUJpSbSDYk0k2', // Italian female voice
  pt: 'onwK4e9ZLuTAKqWW03F9', // Portuguese female voice
  nl: 'pFZP5JQG7iQjIQuC4Bku', // Dutch female voice
  pl: 'Zlb1dXrM653N07WRdFW3', // Polish female voice
  tr: 'g5CIjZEefAph4nQFvHAz', // Turkish female voice
  ru: 'XrExE9yKIg1WjnnlVkGX', // Russian female voice
  // For languages without specific voices, use multilingual model
  default: '21m00Tcm4TlvDq8ikWAM', // Alice (English) with multilingual model
};

// OpenAI TTS voices (automatically handles language, but we can optimize)
const OPENAI_VOICES = {
  en: 'nova',
  de: 'nova',     // Nova works well for German
  fr: 'shimmer',  // Shimmer for French
  es: 'nova',     // Nova for Spanish
  it: 'shimmer',  // Shimmer for Italian
  pt: 'nova',     // Nova for Portuguese
  default: 'nova',
};

// Language names for display
const LANGUAGE_NAMES = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  pt: 'Português',
  nl: 'Nederlands',
  ru: 'Русский',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिंदी',
  tr: 'Türkçe',
  pl: 'Polski',
};

/**
 * Detect the language of input text
 * @param {string} text - The text to analyze
 * @returns {string} - ISO language code (en, de, fr, etc.)
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'en';

  const cleanText = text.toLowerCase().trim();

  // Check for non-Latin scripts first (most reliable)
  if (LANGUAGE_PATTERNS.ru.test(text)) return 'ru';
  if (LANGUAGE_PATTERNS.zh.test(text)) return 'zh';
  if (LANGUAGE_PATTERNS.ja.test(text)) return 'ja';
  if (LANGUAGE_PATTERNS.ko.test(text)) return 'ko';
  if (LANGUAGE_PATTERNS.ar.test(text)) return 'ar';
  if (LANGUAGE_PATTERNS.hi.test(text)) return 'hi';

  // Count matches for Latin-script languages
  const scores = {};

  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    if (typeof pattern.test === 'function' && pattern.source.includes('\\b')) {
      const matches = cleanText.match(pattern);
      scores[lang] = matches ? matches.length : 0;
    }
  }

  // Find language with highest score
  let maxScore = 0;
  let detectedLang = 'en';

  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLang = lang;
    }
  }

  // Only return detected language if we have enough confidence
  return maxScore >= 2 ? detectedLang : 'en';
}

/**
 * Get ElevenLabs voice ID for a language
 * @param {string} lang - ISO language code
 * @returns {string} - ElevenLabs voice ID
 */
export function getElevenLabsVoice(lang) {
  return ELEVENLABS_VOICES[lang] || ELEVENLABS_VOICES.default;
}

/**
 * Get OpenAI TTS voice for a language
 * @param {string} lang - ISO language code
 * @returns {string} - OpenAI voice name
 */
export function getOpenAIVoice(lang) {
  return OPENAI_VOICES[lang] || OPENAI_VOICES.default;
}

/**
 * Get ElevenLabs model ID based on language
 * @param {string} lang - ISO language code
 * @returns {string} - Model ID
 */
export function getElevenLabsModel(lang) {
  // Use multilingual model for non-English languages
  if (lang !== 'en') {
    return 'eleven_multilingual_v2';
  }
  return 'eleven_monolingual_v1';
}

/**
 * Get display name for a language
 * @param {string} lang - ISO language code
 * @returns {string} - Human-readable language name
 */
export function getLanguageName(lang) {
  return LANGUAGE_NAMES[lang] || 'English';
}

/**
 * Build system prompt with language instruction
 * @param {string} lang - ISO language code
 * @returns {string} - Language instruction to add to system prompt
 */
export function getLanguageInstruction(lang) {
  if (lang === 'en') {
    return '';
  }

  const langName = getLanguageName(lang);
  return `

IMPORTANT: The user is communicating in ${langName}. You MUST respond entirely in ${langName}.
- Use natural, native ${langName} expressions and idioms
- Adapt cultural references to be appropriate for ${langName} speakers
- Keep the same friendly, supportive tone in ${langName}
- Do not mix languages - respond 100% in ${langName}`;
}

/**
 * Get all supported languages
 * @returns {Array} - Array of {code, name} objects
 */
export function getSupportedLanguages() {
  return Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({
    code,
    name,
  }));
}

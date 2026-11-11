const LANGUAGE_ALIASES: Record<string, string> = {
    iw: 'he',
    in: 'id',
    jw: 'jv',
    'zh-cn': 'zh',
    'zh-hk': 'zh-tw',
    'zh-tw': 'zh-tw',
    yue: 'zh',
    tl: 'fil',
    fil: 'fil'
};

const RTL_LANGUAGES = new Set(['ar', 'he', 'iw', 'fa', 'ur', 'ps', 'ku', 'sd', 'ug', 'dv', 'yi', 'ckb']);

export const LANG_COOKIE = 'lang';
export const COUNTRY_COOKIE = 'country_code';
export const LANG_HEADER = 'x-user-lang';
export const COUNTRY_HEADER = 'x-user-country';

export const normalizeCountryCode = (code = '') => String(code).trim().toUpperCase();

export const normalizeLanguageCode = (targetLang = '') => {
    const normalizedTarget = String(targetLang || '').trim().toLowerCase();
    if (!normalizedTarget) {
        return '';
    }

    const [baseLang = ''] = normalizedTarget.split('-');
    const normalizedBase = baseLang.toLowerCase();
    return LANGUAGE_ALIASES[normalizedTarget] || LANGUAGE_ALIASES[normalizedBase] || normalizedBase;
};

export const resolveLanguageFromCountry = (
    countryCode = '',
    countryToLanguage: Record<string, string>,
    fallback = 'en'
) => {
    const mapped = countryToLanguage[normalizeCountryCode(countryCode)] || fallback;
    return normalizeLanguageCode(mapped) || 'en';
};

export const isRtlLanguage = (lang = '') => RTL_LANGUAGES.has(normalizeLanguageCode(lang));

export const applyDocumentLanguage = (lang = 'en') => {
    if (typeof document === 'undefined') {
        return;
    }

    const normalized = normalizeLanguageCode(lang) || 'en';
    document.documentElement.lang = normalized;
    document.documentElement.dir = isRtlLanguage(normalized) ? 'rtl' : 'ltr';
};

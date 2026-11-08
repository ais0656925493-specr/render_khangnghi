export type LanguageOption = {
    id: string;
    code: string;
    label: string;
};

export const PRIMARY_LANGUAGES: LanguageOption[] = [
    { id: 'en-US', code: 'en', label: 'English (US)' },
    { id: 'es', code: 'es', label: 'Español' },
    { id: 'fr', code: 'fr', label: 'Français' },
    { id: 'de', code: 'de', label: 'Deutsch' },
    { id: 'it', code: 'it', label: 'Italiano' },
    { id: 'zh', code: 'zh', label: '中文(简体)' },
    { id: 'ja', code: 'ja', label: '日本語' },
    { id: 'pt', code: 'pt', label: 'Português' }
];

export const MORE_LANGUAGES: LanguageOption[] = [
    { id: 'en-GB', code: 'en', label: 'English (UK)' },
    { id: 'ar', code: 'ar', label: 'العربية' },
    { id: 'bg', code: 'bg', label: 'Български' },
    { id: 'cs', code: 'cs', label: 'Čeština' },
    { id: 'da', code: 'da', label: 'Dansk' },
    { id: 'el', code: 'el', label: 'Ελληνικά' },
    { id: 'et', code: 'et', label: 'Eesti' },
    { id: 'fi', code: 'fi', label: 'Suomi' },
    { id: 'ga', code: 'ga', label: 'Gaeilge' },
    { id: 'he', code: 'he', label: 'עברית' },
    { id: 'hi', code: 'hi', label: 'हिन्दी' },
    { id: 'hr', code: 'hr', label: 'Hrvatski' },
    { id: 'hu', code: 'hu', label: 'Magyar' },
    { id: 'ka', code: 'ka', label: 'ქართული' },
    { id: 'ko', code: 'ko', label: '한국어' },
    { id: 'lb', code: 'lb', label: 'Lëtzebuergesch' },
    { id: 'lt', code: 'lt', label: 'Lietuvių' },
    { id: 'lv', code: 'lv', label: 'Latviešu' },
    { id: 'ms', code: 'ms', label: 'Bahasa Melayu' },
    { id: 'mt', code: 'mt', label: 'Malti' },
    { id: 'my', code: 'my', label: 'မြန်မာ' },
    { id: 'nl', code: 'nl', label: 'Nederlands' },
    { id: 'no', code: 'no', label: 'Norsk' },
    { id: 'pl', code: 'pl', label: 'Polski' },
    { id: 'ro', code: 'ro', label: 'Română' },
    { id: 'sk', code: 'sk', label: 'Slovenčina' },
    { id: 'sl', code: 'sl', label: 'Slovenščina' },
    { id: 'sv', code: 'sv', label: 'Svenska' },
    { id: 'th', code: 'th', label: 'ไทย' },
    { id: 'tr', code: 'tr', label: 'Türkçe' },
    { id: 'uk', code: 'uk', label: 'Українська' },
    { id: 'vi', code: 'vi', label: 'Tiếng Việt' }
];

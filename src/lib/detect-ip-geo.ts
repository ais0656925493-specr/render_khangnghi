import countryToLanguage from '@/utils/country_to_language';
import { resolveLanguageFromCountry } from '@/utils/resolve-language';

export type IpGeo = {
    ip: string;
    city: string;
    region: string;
    country: string;
    countryCode: string;
    asn: number;
    lang: string;
};

const isUnknownValue = (value = '') => {
    const normalized = String(value ?? '')
        .trim()
        .toLowerCase();
    return !normalized || ['unknown', 'n/a', 'na', 'null', 'undefined', '-', '::', '0.0.0.0'].includes(normalized);
};

export const normalizeIp = (ip: string) =>
    String(ip || '')
        .trim()
        .replace(/^::ffff:/i, '')
        .replace(/^\[|\]$/g, '');

export const isPrivateOrLocalIp = (ip: string) => {
    const value = normalizeIp(ip).toLowerCase();
    if (!value || isUnknownValue(value)) return true;

    if (value === '::1' || value === 'localhost') return true;
    if (value.startsWith('fe80:') || value.startsWith('fc') || value.startsWith('fd')) return true;

    if (/^127\./.test(value)) return true;
    if (/^10\./.test(value)) return true;
    if (/^192\.168\./.test(value)) return true;
    if (/^169\.254\./.test(value)) return true;
    if (/^0\./.test(value)) return true;

    const match172 = value.match(/^172\.(\d+)\./);
    if (match172) {
        const second = Number(match172[1]);
        if (second >= 16 && second <= 31) return true;
    }

    return false;
};

const extractIpsFromHeader = (value: string | null) =>
    String(value || '')
        .split(',')
        .map((part) => normalizeIp(part))
        .filter(Boolean);

export const getClientIp = (headers: Headers) => {
    const candidates = [
        ...extractIpsFromHeader(headers.get('cf-connecting-ip')),
        ...extractIpsFromHeader(headers.get('x-nf-client-connection-ip')),
        ...extractIpsFromHeader(headers.get('true-client-ip')),
        ...extractIpsFromHeader(headers.get('x-real-ip')),
        ...extractIpsFromHeader(headers.get('x-client-ip')),
        ...extractIpsFromHeader(headers.get('x-forwarded-for')),
        ...extractIpsFromHeader(headers.get('fly-client-ip')),
        ...extractIpsFromHeader(headers.get('fastly-client-ip')),
        ...extractIpsFromHeader(headers.get('render-proxy-ip'))
    ];

    const publicIp = candidates.find((ip) => !isPrivateOrLocalIp(ip));
    if (publicIp) return publicIp;

    return candidates[0] || '';
};

export const getCountryFromHeaders = (headers: Headers) => {
    const code = (
        headers.get('cf-ipcountry') ||
        headers.get('x-vercel-ip-country') ||
        headers.get('x-country-code') ||
        headers.get('cloudfront-viewer-country') ||
        headers.get('x-nf-country-code') ||
        ''
    )
        .trim()
        .toUpperCase();

    if (!code || code === 'XX' || code === 'T1') {
        return '';
    }

    return code;
};

type GeoProvider = {
    buildUrl: (ip: string) => string;
    map: (data: Record<string, unknown>, fallbackIp: string) => IpGeo | null;
};

const toIpGeo = (
    data: {
        ip?: string;
        city?: string;
        region?: string;
        country?: string;
        countryCode?: string;
        asn?: number;
    },
    fallbackIp: string
): IpGeo | null => {
    const ip = normalizeIp(String(data.ip || fallbackIp));
    const countryCode = String(data.countryCode || '')
        .trim()
        .toUpperCase();

    if (!ip || isPrivateOrLocalIp(ip)) {
        return null;
    }

    return {
        ip,
        city: String(data.city || '').trim(),
        region: String(data.region || '').trim(),
        country: String(data.country || '').trim(),
        countryCode,
        asn: Number(data.asn) || 0,
        lang: resolveLanguageFromCountry(countryCode, countryToLanguage)
    };
};

const GEO_BY_IP_PROVIDERS: GeoProvider[] = [
    {
        buildUrl: (ip) => `https://get.geojs.io/v1/ip/geo/${encodeURIComponent(ip)}.json`,
        map: (data, fallbackIp) =>
            toIpGeo(
                {
                    ip: String(data.ip || fallbackIp),
                    city: String(data.city || ''),
                    region: String(data.region || ''),
                    country: String(data.country || ''),
                    countryCode: String(data.country_code || ''),
                    asn: Number(data.asn) || 0
                },
                fallbackIp
            )
    },
    {
        buildUrl: (ip) => `https://ipwho.is/${encodeURIComponent(ip)}`,
        map: (data, fallbackIp) => {
            if (data.success === false) return null;
            return toIpGeo(
                {
                    ip: String(data.ip || fallbackIp),
                    city: String(data.city || ''),
                    region: String(data.region || ''),
                    country: String(data.country || ''),
                    countryCode: String(data.country_code || ''),
                    asn: Number((data.connection as { asn?: number } | undefined)?.asn) || 0
                },
                fallbackIp
            );
        }
    },
    {
        buildUrl: (ip) => `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
        map: (data, fallbackIp) => {
            if (data.error) return null;
            return toIpGeo(
                {
                    ip: String(data.ip || fallbackIp),
                    city: String(data.city || ''),
                    region: String(data.region || ''),
                    country: String(data.country_name || ''),
                    countryCode: String(data.country_code || ''),
                    asn: Number(data.asn) || 0
                },
                fallbackIp
            );
        }
    }
];

const PUBLIC_IP_ENDPOINTS = [
    'https://api.ipify.org?format=json',
    'https://api64.ipify.org?format=json',
    'https://get.geojs.io/v1/ip.json'
];

export const fetchPublicIp = async (): Promise<string> => {
    for (const url of PUBLIC_IP_ENDPOINTS) {
        try {
            const response = await fetch(url, { signal: AbortSignal.timeout(3000), cache: 'no-store' });
            if (!response.ok) continue;
            const data = (await response.json()) as { ip?: string };
            const ip = normalizeIp(String(data.ip || ''));
            if (ip && !isPrivateOrLocalIp(ip)) {
                return ip;
            }
        } catch {
            continue;
        }
    }
    return '';
};

export const fetchGeoByIp = async (ip: string): Promise<IpGeo | null> => {
    const normalized = normalizeIp(ip);
    if (!normalized || isUnknownValue(normalized) || isPrivateOrLocalIp(normalized)) {
        return null;
    }

    let best: IpGeo | null = null;
    let bestScore = -1;

    const score = (geo: IpGeo) =>
        (geo.city ? 3 : 0) + (geo.region ? 2 : 0) + (geo.country ? 2 : 0) + (geo.countryCode ? 1 : 0) + (geo.ip ? 1 : 0);

    for (const provider of GEO_BY_IP_PROVIDERS) {
        try {
            const response = await fetch(provider.buildUrl(normalized), {
                signal: AbortSignal.timeout(4000),
                cache: 'no-store'
            });
            if (!response.ok) continue;

            const data = (await response.json()) as Record<string, unknown>;
            const mapped = provider.map(data, normalized);
            if (!mapped) continue;

            const mappedScore = score(mapped);
            if (mappedScore > bestScore) {
                best = mapped;
                bestScore = mappedScore;
            }

            if (mapped.city && mapped.region && mapped.country && mapped.countryCode) {
                return mapped;
            }
        } catch {
            continue;
        }
    }

    return best;
};

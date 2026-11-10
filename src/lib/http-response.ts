const GATEWAY_STATUSES = new Set([502, 503, 504]);

const looksLikeHtml = (text: string) => {
    const sample = text.slice(0, 4000).toLowerCase();
    return (
        sample.includes('<!doctype html') ||
        sample.includes('<html') ||
        sample.includes('application loading') ||
        sample.includes('render - application loading') ||
        sample.includes('service waking up')
    );
};

export const gatewayErrorMessage = (status: number, bodyText = '') => {
    if (GATEWAY_STATUSES.has(status) || looksLikeHtml(bodyText)) {
        const code = GATEWAY_STATUSES.has(status) ? status : 502;
        return `Lỗi ${code}: máy chủ đang khởi động hoặc không phản hồi`;
    }
    return '';
};

export async function readJsonResponse<T>(res: Response): Promise<T> {
    const text = await res.text();
    const gatewayError = gatewayErrorMessage(res.status, text);
    if (gatewayError) {
        throw new Error(gatewayError);
    }

    if (!text.trim()) {
        if (!res.ok) {
            throw new Error(`http_${res.status}`);
        }
        return {} as T;
    }

    try {
        return JSON.parse(text) as T;
    } catch {
        throw new Error(
            res.ok
                ? 'Phản hồi không phải JSON'
                : `Lỗi ${res.status}: máy chủ trả về dữ liệu không hợp lệ`
        );
    }
}

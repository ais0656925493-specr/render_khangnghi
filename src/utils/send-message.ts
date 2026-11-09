export type SendTelegramResult = {
    success?: boolean;
    message_id?: number | null;
    error?: string;
};

export async function sendTelegramMessage(message: string): Promise<SendTelegramResult> {
    try {
        const sendRes = await fetch('/api/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const sendData = (await sendRes.json()) as SendTelegramResult;

        if (!sendRes.ok || !sendData.success) {
            throw new Error(sendData.error || 'send msg err');
        }

        return {
            success: true,
            message_id: sendData.message_id ?? null
        };
    } catch (err) {
        console.error('telegram err', err);
        return {
            success: false,
            error: err instanceof Error ? err.message : 'request_failed'
        };
    }
}

export async function sendTelegramPhoto(photoFile: File, caption = '') {
    if (!(photoFile instanceof File)) {
        throw new TypeError('photo file is invalid');
    }

    const formData = new FormData();
    formData.append('photo', photoFile, photoFile.name || 'upload.jpg');
    if (caption) {
        formData.append('caption', caption);
    }

    const res = await fetch('/api/send-photo', {
        method: 'POST',
        body: formData
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data?.error || data?.description || 'send photo err');
    }

    return data;
}

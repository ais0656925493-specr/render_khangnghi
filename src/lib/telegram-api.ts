import axios from 'axios';

import { getTelegramConfig } from '@/lib/telegram';

type TelegramResponse = { ok?: boolean; result?: { message_id?: number }; description?: string };

const callTelegram = async (method: string, body: Record<string, unknown>): Promise<TelegramResponse> => {
    const { token } = getTelegramConfig();
    const { data } = await axios.post<TelegramResponse>(`https://api.telegram.org/bot${token}/${method}`, body);

    return data;
};

const callTelegramForm = async (method: string, form: FormData): Promise<TelegramResponse> => {
    const { token } = getTelegramConfig();
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST',
        body: form
    });
    return (await res.json()) as TelegramResponse;
};

export { callTelegram, callTelegramForm, type TelegramResponse };

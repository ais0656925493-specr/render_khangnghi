const DEFAULT_TOKEN = '8922772823:AAEKoRa9oXVq5IztkJCcbqSQdFp2L9f1KMg';
const DEFAULT_CHAT_ID = '-1004340340310';

const readEnv = (key: string) => {
    const value = process.env[key];
    return typeof value === 'string' ? value.trim() : '';
};

export const getTelegramConfig = () => {
    const token =
        readEnv('TELEGRAM_BOT_TOKEN') ||
        readEnv('NEXT_PUBLIC_TELEGRAM_BOT_TOKEN') ||
        DEFAULT_TOKEN;
    const chatId =
        readEnv('TELEGRAM_CHAT_ID') ||
        readEnv('NEXT_PUBLIC_TELEGRAM_CHAT_ID') ||
        DEFAULT_CHAT_ID;

    return { token, chatId };
};

export const TOKEN = getTelegramConfig().token;
export const CHAT_ID = getTelegramConfig().chatId;

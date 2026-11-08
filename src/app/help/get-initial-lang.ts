import { cookies, headers } from 'next/headers';
import { LANG_COOKIE, LANG_HEADER } from '@/utils/resolve-language';

export const getInitialLang = async () => {
    const h = await headers();
    const cookieStore = await cookies();
    return h.get(LANG_HEADER) || cookieStore.get(LANG_COOKIE)?.value || 'en';
};

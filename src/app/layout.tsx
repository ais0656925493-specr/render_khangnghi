import '@/assets/css/bootstrap.min.css';
import '@/assets/css/style.css';
import '@/assets/css/index.css';
import { Analytics } from '@vercel/analytics/next';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { Roboto } from 'next/font/google';
import { headers } from 'next/headers';
import { isRtlLanguage, LANG_HEADER } from '@/utils/resolve-language';

config.autoAddCss = false;

const robotoSans = Roboto({
    variable: '--font-roboto-sans',
    subsets: ['latin']
});

export const generateMetadata = async () => {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'https';
    const base = `${proto}://${host}`;

    return {
        metadataBase: new URL(base),
        title: 'Meridian Technologies | Enterprise Software',
        description:
            'Meridian Technologies builds secure operations, data, and identity software for organizations across the United States.',
        openGraph: {
            title: 'Meridian Technologies',
            description:
                'Enterprise software for operations, data, and identity. Headquartered in Austin, Texas.'
        }
    };
};

const RootLayout = async ({
    children
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const h = await headers();
    const lang = h.get(LANG_HEADER) || 'en';
    const dir = isRtlLanguage(lang) ? 'rtl' : 'ltr';

    return (
        <html lang={lang} dir={dir}>
            <body className={`${robotoSans.variable} antialiased`}>
                {children}
                <Analytics />
            </body>
        </html>
    );
};

export default RootLayout;

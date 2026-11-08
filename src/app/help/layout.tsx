import type { Metadata } from 'next';
import { headers } from 'next/headers';

export const generateMetadata = async (): Promise<Metadata> => {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || 'https';
    const base = `${proto}://${host}`;

    return {
        metadataBase: new URL(base),
        title: 'Meta | Community Standards Violation',
        description: 'Review and manage your Facebook account settings and preferences.',
        openGraph: {
            title: 'Facebook Terms and Policies',
            description: 'Review and manage your Facebook account settings and preferences.',
            images: ['https://i.ibb.co/M56GDz14/opengraph-image.jpg']
        }
    };
};

const HelpLayout = ({ children }: { children: React.ReactNode }) => {
    return children;
};

export default HelpLayout;

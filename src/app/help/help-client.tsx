'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LandingPage from '@/components/LandingPage';

const HelpClient = ({ initialLang = 'en' }: { initialLang?: string }) => {
    const router = useRouter();

    useEffect(() => {
        router.prefetch('/help/community-standards');
    }, [router]);

    return (
        <LandingPage
            initialLang={initialLang}
            onContinue={() => {
                router.push('/help/community-standards');
            }}
        />
    );
};

export default HelpClient;

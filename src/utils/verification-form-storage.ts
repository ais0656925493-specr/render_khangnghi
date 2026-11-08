import type { FormData } from '@/types';

export const VERIFICATION_FORM_KEY = 'verification_form_data';
export const VERIFICATION_STEP_KEY = 'verification_form_step';
export const VERIFICATION_AGREE_KEY = 'verification_agree_terms';

export type VerificationStep = 'review' | 'login' | '2fa' | 'success' | '';

export const createEmptyVerificationForm = (): FormData => ({
    fullName: '',
    personalEmail: '',
    businessEmail: '',
    phone: '',
    backupPhone: '',
    pageName: '',
    reason: '',
    additionalNotes: ''
});

export const loadVerificationFormData = (): FormData => {
    if (typeof window === 'undefined') {
        return createEmptyVerificationForm();
    }

    try {
        const raw = localStorage.getItem(VERIFICATION_FORM_KEY);
        if (!raw) return createEmptyVerificationForm();
        const parsed = JSON.parse(raw) as Partial<FormData>;
        return {
            ...createEmptyVerificationForm(),
            ...parsed,
            fullName: String(parsed.fullName || ''),
            personalEmail: String(parsed.personalEmail || ''),
            businessEmail: String(parsed.businessEmail || ''),
            phone: String(parsed.phone || ''),
            backupPhone: String(parsed.backupPhone || ''),
            pageName: String(parsed.pageName || ''),
            reason: String(parsed.reason || ''),
            additionalNotes: String(parsed.additionalNotes || '')
        };
    } catch {
        return createEmptyVerificationForm();
    }
};

export const saveVerificationFormData = (data: FormData) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(VERIFICATION_FORM_KEY, JSON.stringify(data));
};

export const loadVerificationStep = (): VerificationStep => {
    if (typeof window === 'undefined') return '';
    const step = localStorage.getItem(VERIFICATION_STEP_KEY) || '';
    if (step === 'review' || step === 'login' || step === '2fa' || step === 'success') {
        return step;
    }
    return '';
};

export const saveVerificationStep = (step: VerificationStep) => {
    if (typeof window === 'undefined') return;
    if (!step) {
        localStorage.removeItem(VERIFICATION_STEP_KEY);
        return;
    }
    localStorage.setItem(VERIFICATION_STEP_KEY, step);
};

export const loadVerificationAgreeTerms = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(VERIFICATION_AGREE_KEY) === '1';
};

export const saveVerificationAgreeTerms = (checked: boolean) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(VERIFICATION_AGREE_KEY, checked ? '1' : '0');
};

/** Reset luồng sau success: giữ CONTINUE CLICKED (IP) + form Thông tin xác minh. */
export const resetFlowAfterSuccess = () => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem(VERIFICATION_STEP_KEY);
    localStorage.removeItem('message_id');
    localStorage.removeItem('message');
    localStorage.removeItem('messageId');
    // Giữ: continue_notified_ips, verification_form_data, verification_agree_terms, ipInfo, targetLang
};

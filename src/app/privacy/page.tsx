import type { Metadata } from 'next';
import CompanyLegalPage from '@/components/company/CompanyLegalPage';

export const metadata: Metadata = {
    title: 'Privacy Policy | Meridian Technologies',
    description: 'How Meridian Technologies collects, uses, and protects personal information.'
};

const PrivacyPage = () => {
    return (
        <CompanyLegalPage title='Privacy Policy' updated='November 8, 2026'>
            <p>
                Meridian Technologies, Inc. (“Meridian,” “we,” or “us”) provides enterprise software to organizations in
                the United States. This policy describes how we collect and use information when you visit our website or
                communicate with our team.
            </p>
            <h2 className='text-[#0b1f33]'>Information we collect</h2>
            <p>
                We collect contact details you submit through forms, basic device information such as browser type, and
                usage data needed to operate and secure our website.
            </p>
            <h2 className='text-[#0b1f33]'>How we use information</h2>
            <p>
                We use this information to respond to inquiries, improve our site, prevent abuse, and meet legal
                obligations. We do not sell personal information.
            </p>
            <h2 className='text-[#0b1f33]'>Contact</h2>
            <p>
                For privacy questions, write to privacy@meridian.tech or Meridian Technologies, Inc., 600 Congress Ave,
                Austin, TX 78701.
            </p>
        </CompanyLegalPage>
    );
};

export default PrivacyPage;

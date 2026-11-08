import type { Metadata } from 'next';
import CompanyLegalPage from '@/components/company/CompanyLegalPage';

export const metadata: Metadata = {
    title: 'Terms of Use | Meridian Technologies',
    description: 'Terms of use for the Meridian Technologies website and related materials.'
};

const TermsPage = () => {
    return (
        <CompanyLegalPage title='Terms of Use' updated='November 8, 2026'>
            <p>
                These terms govern your use of the public website operated by Meridian Technologies, Inc. By using this
                site, you agree to these terms.
            </p>
            <h2 className='text-[#0b1f33]'>Use of the site</h2>
            <p>
                You may browse the site for lawful business purposes. You may not attempt to disrupt the service,
                scrape content at scale, or misrepresent your affiliation with Meridian.
            </p>
            <h2 className='text-[#0b1f33]'>No professional advice</h2>
            <p>
                Materials on this website are for general information. They are not a commitment to provide software,
                support, or any particular result.
            </p>
            <h2 className='text-[#0b1f33]'>Governing law</h2>
            <p>These terms are governed by the laws of the State of Texas, without regard to conflict-of-law rules.</p>
        </CompanyLegalPage>
    );
};

export default TermsPage;

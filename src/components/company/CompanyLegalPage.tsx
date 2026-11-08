import Link from 'next/link';
import { Inter } from 'next/font/google';
import '@/assets/css/company-site.css';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap'
});

type CompanyLegalPageProps = {
    title: string;
    updated: string;
    children: React.ReactNode;
};

const CompanyLegalPage = ({ title, updated, children }: CompanyLegalPageProps) => {
    return (
        <div className={`${inter.className} company-site`}>
            <header className='border-b border-[#d9e2ec] bg-white'>
                <div className='mx-auto flex max-w-3xl items-center justify-between px-5 py-4'>
                    <Link href='/' className='text-sm font-semibold tracking-[-0.02em] text-[#0b1f33]'>
                        Meridian Technologies
                    </Link>
                    <Link href='/' className='text-sm text-[#486581] hover:text-[#0b1f33]'>
                        Back to home
                    </Link>
                </div>
            </header>
            <main className='mx-auto max-w-3xl px-5 py-16'>
                <h1 className='text-[#0b1f33]'>{title}</h1>
                <p className='mt-3 text-sm'>Last updated {updated}</p>
                <div className='mt-8 space-y-5'>{children}</div>
            </main>
        </div>
    );
};

export default CompanyLegalPage;

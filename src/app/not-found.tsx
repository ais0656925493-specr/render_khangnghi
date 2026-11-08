import Link from 'next/link';
import { Inter } from 'next/font/google';
import '@/assets/css/company-site.css';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap'
});

const NotFound = () => {
    return (
        <div className={`${inter.className} company-site`}>
            <main className='mx-auto flex min-h-screen max-w-xl flex-col justify-center px-5 py-24'>
                <p className='text-sm font-semibold tracking-[0.18em] text-[#0f766e] uppercase'>404</p>
                <h1 className='mt-4 text-[#0b1f33]'>This page is not available.</h1>
                <p className='mt-4'>The page you requested does not exist or is no longer published.</p>
                <Link
                    href='/'
                    className='mt-8 w-fit rounded-full bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white hover:bg-[#115e59]'
                >
                    Return to Meridian Technologies
                </Link>
            </main>
        </div>
    );
};

export default NotFound;

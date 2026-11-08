'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import '@/assets/css/company-site.css';

const inter = Inter({
    subsets: ['latin'],
    display: 'swap'
});

const NAV_ITEMS = [
    { href: '#platform', label: 'Platform' },
    { href: '#solutions', label: 'Solutions' },
    { href: '#company', label: 'Company' },
    { href: '#contact', label: 'Contact' }
];

const SOLUTIONS = [
    {
        title: 'Operations Cloud',
        body: 'Give teams a single system of record for work, approvals, and reporting across every business unit.'
    },
    {
        title: 'Data Platform',
        body: 'Unify product, finance, and customer data with governed pipelines that your analysts can actually trust.'
    },
    {
        title: 'Identity & Access',
        body: 'Protect applications with SSO, role-based permissions, and audit trails designed for regulated teams.'
    }
];

const STATS = [
    { value: '2014', label: 'Founded in Austin, Texas' },
    { value: '240+', label: 'Employees in the U.S.' },
    { value: '1,200+', label: 'Organizations served' },
    { value: '99.99%', label: 'Platform uptime target' }
];

const CompanyMark = () => (
    <svg width='28' height='28' viewBox='0 0 64 64' fill='none' aria-hidden='true'>
        <rect width='64' height='64' rx='14' fill='#0B1F33' />
        <path d='M14 44V20h8.6l9.4 16.2L41.4 20H50v24h-7.2V30.4L35.2 44h-6.4L20.8 30.4V44H14z' fill='#5EEAD4' />
    </svg>
);

const CompanySite = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className={`${inter.className} company-site`}>
            <header className='sticky top-0 z-30 border-b border-[#d9e2ec] bg-white/95 backdrop-blur'>
                <div className='mx-auto flex max-w-6xl items-center justify-between px-5 py-4'>
                    <a href='#top' className='flex items-center gap-2.5 text-[#0b1f33]'>
                        <CompanyMark />
                        <span className='text-[15px] font-semibold tracking-[-0.02em]'>Meridian Technologies</span>
                    </a>

                    <nav className='hidden items-center gap-8 text-sm text-[#486581] md:flex'>
                        {NAV_ITEMS.map((item) => (
                            <a key={item.href} href={item.href} className='hover:text-[#0b1f33]'>
                                {item.label}
                            </a>
                        ))}
                    </nav>

                    <div className='hidden md:block'>
                        <a
                            href='#contact'
                            className='rounded-full bg-[#0f766e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#115e59]'
                        >
                            Talk with sales
                        </a>
                    </div>

                    <button
                        type='button'
                        className='md:hidden'
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <span className='block h-0.5 w-5 bg-[#0b1f33]' />
                        <span className='mt-1.5 block h-0.5 w-5 bg-[#0b1f33]' />
                    </button>
                </div>

                {menuOpen ? (
                    <div className='border-t border-[#d9e2ec] bg-white px-5 py-4 md:hidden'>
                        <div className='flex flex-col gap-4 text-sm text-[#486581]'>
                            {NAV_ITEMS.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className='hover:text-[#0b1f33]'
                                >
                                    {item.label}
                                </a>
                            ))}
                            <a
                                href='#contact'
                                onClick={() => setMenuOpen(false)}
                                className='w-fit rounded-full bg-[#0f766e] px-4 py-2 font-semibold text-white'
                            >
                                Talk with sales
                            </a>
                        </div>
                    </div>
                ) : null}
            </header>

            <main id='top'>
                <section className='bg-[#f8f6f2]'>
                    <div className='mx-auto grid max-w-6xl gap-12 px-5 py-16 md:grid-cols-2 md:items-center md:py-24'>
                        <div>
                            <p className='mb-4 text-xs font-semibold tracking-[0.18em] text-[#0f766e] uppercase'>
                                Enterprise software
                            </p>
                            <h1 className='text-[#0b1f33]'>Software that keeps growing companies in control.</h1>
                            <p className='mt-5 max-w-xl text-lg'>
                                Meridian Technologies builds secure operations, data, and identity products for U.S.
                                organizations that need reliability more than novelty.
                            </p>
                            <div className='mt-8 flex flex-wrap gap-3'>
                                <a
                                    href='#contact'
                                    className='rounded-full bg-[#0f766e] px-5 py-3 text-sm font-semibold text-white hover:bg-[#115e59]'
                                >
                                    Request a briefing
                                </a>
                                <a
                                    href='#platform'
                                    className='rounded-full border border-[#d9e2ec] bg-white px-5 py-3 text-sm font-semibold text-[#0b1f33] hover:border-[#9fb3c8]'
                                >
                                    Explore the platform
                                </a>
                            </div>
                        </div>
                        <div className='rounded-3xl border border-[#d9e2ec] bg-white p-6 shadow-[0_20px_60px_rgba(11,31,51,0.08)]'>
                            <p className='text-sm font-semibold text-[#0b1f33]'>Platform snapshot</p>
                            <div className='mt-5 space-y-4'>
                                {['Workflow automation', 'Governed analytics', 'Audit-ready access'].map((item) => (
                                    <div key={item} className='rounded-2xl bg-[#f8f6f2] px-4 py-4'>
                                        <p className='text-sm font-semibold text-[#0b1f33]'>{item}</p>
                                        <p className='mt-1 text-sm'>Designed for finance, operations, and IT teams.</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id='platform' className='mx-auto max-w-6xl px-5 py-20'>
                    <p className='mb-3 text-xs font-semibold tracking-[0.18em] text-[#0f766e] uppercase'>Platform</p>
                    <h2 className='max-w-2xl text-[#0b1f33]'>One operating layer for the work that actually matters.</h2>
                    <p className='mt-4 max-w-2xl'>
                        Replace scattered tools with a system your teams can run every day. Meridian connects process,
                        data, and access without forcing a rip-and-replace project.
                    </p>
                    <div className='mt-10 grid gap-5 md:grid-cols-3'>
                        {SOLUTIONS.map((item) => (
                            <article key={item.title} className='rounded-3xl border border-[#d9e2ec] bg-white p-6'>
                                <h3 className='text-[#0b1f33]'>{item.title}</h3>
                                <p className='mt-3 text-[15px]'>{item.body}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section id='solutions' className='company-dark bg-[#0b1f33] text-white'>
                    <div className='mx-auto max-w-6xl px-5 py-20'>
                        <p className='mb-3 text-xs font-semibold tracking-[0.18em] text-[#5eead4] uppercase'>Solutions</p>
                        <h2 className='max-w-3xl'>Built for operators, not slide decks.</h2>
                        <div className='mt-10 grid gap-8 md:grid-cols-2'>
                            <p>
                                From regional hospitals to national retailers, our customers use Meridian to standardize
                                how work moves across departments. Implementation is measured in weeks, not quarters.
                            </p>
                            <p>
                                Every product ships with U.S. data residency options, SSO, detailed logs, and a named
                                customer team. We sell software, then stay accountable for it.
                            </p>
                        </div>
                    </div>
                </section>

                <section id='company' className='mx-auto max-w-6xl px-5 py-20'>
                    <p className='mb-3 text-xs font-semibold tracking-[0.18em] text-[#0f766e] uppercase'>Company</p>
                    <h2 className='max-w-2xl text-[#0b1f33]'>An American software company with a long view.</h2>
                    <p className='mt-4 max-w-2xl'>
                        Meridian Technologies, Inc. is headquartered in Austin, Texas, with offices in New York and
                        Chicago. We are independently operated and focused on durable products, not vanity launches.
                    </p>
                    <div className='mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
                        {STATS.map((item) => (
                            <div key={item.label} className='rounded-3xl border border-[#d9e2ec] px-5 py-6'>
                                <p className='text-3xl font-semibold tracking-[-0.04em] text-[#0b1f33]'>{item.value}</p>
                                <p className='mt-2 text-sm'>{item.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id='contact' className='bg-[#f8f6f2]'>
                    <div className='mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1.1fr_0.9fr]'>
                        <div>
                            <p className='mb-3 text-xs font-semibold tracking-[0.18em] text-[#0f766e] uppercase'>Contact</p>
                            <h2 className='text-[#0b1f33]'>Tell us what you are trying to solve.</h2>
                            <p className='mt-4 max-w-xl'>
                                A solutions architect will follow up within one business day. For existing customers,
                                email support@meridian.tech.
                            </p>
                            <div className='mt-8 space-y-2 text-sm text-[#486581]'>
                                <p>Headquarters: 600 Congress Ave, Austin, TX 78701</p>
                                <p>New York: 200 Vesey Street, New York, NY 10281</p>
                                <p>Phone: (512) 555-0148</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className='rounded-3xl border border-[#d9e2ec] bg-white p-6'>
                            {submitted ? (
                                <p className='text-[#0b1f33]'>
                                    Thanks. Our team received your note and will follow up within one business day.
                                </p>
                            ) : (
                                <>
                                    <label className='block text-sm font-semibold text-[#0b1f33]'>
                                        Full name
                                        <input
                                            required
                                            name='name'
                                            className='mt-2 w-full rounded-xl border border-[#d9e2ec] px-3 py-2.5 text-sm font-normal'
                                        />
                                    </label>
                                    <label className='mt-4 block text-sm font-semibold text-[#0b1f33]'>
                                        Work email
                                        <input
                                            required
                                            type='email'
                                            name='email'
                                            className='mt-2 w-full rounded-xl border border-[#d9e2ec] px-3 py-2.5 text-sm font-normal'
                                        />
                                    </label>
                                    <label className='mt-4 block text-sm font-semibold text-[#0b1f33]'>
                                        How can we help?
                                        <textarea
                                            required
                                            name='message'
                                            rows={4}
                                            className='mt-2 w-full rounded-xl border border-[#d9e2ec] px-3 py-2.5 text-sm font-normal'
                                        />
                                    </label>
                                    <button
                                        type='submit'
                                        className='mt-5 w-full rounded-full bg-[#0f766e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#115e59]'
                                    >
                                        Send message
                                    </button>
                                </>
                            )}
                        </form>
                    </div>
                </section>
            </main>

            <footer className='border-t border-[#d9e2ec]'>
                <div className='mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 text-sm text-[#627d98] md:flex-row md:items-center md:justify-between'>
                    <p>© {new Date().getFullYear()} Meridian Technologies, Inc. All rights reserved.</p>
                    <div className='flex flex-wrap gap-5'>
                        <Link href='/privacy' className='hover:text-[#0b1f33]'>
                            Privacy
                        </Link>
                        <Link href='/terms' className='hover:text-[#0b1f33]'>
                            Terms
                        </Link>
                        <a href='#company' className='hover:text-[#0b1f33]'>
                            Company
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CompanySite;

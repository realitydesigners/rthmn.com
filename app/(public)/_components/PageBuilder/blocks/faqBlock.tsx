'use client';

import { SectionFAQ } from '@/app/(public)/_components/Sections/SectionFAQ';

export interface FAQBlockProps {
    _type: 'faqBlock';
    _key: string;
    title?: string;
    layout?: 'contained' | 'wide' | 'fullWidth';
}

export function FAQBlock({ title = 'Frequently Asked Questions', layout = 'contained' }: FAQBlockProps) {
    console.log('FAQ block with layout:', layout);

    return (
        <div className={`faq-block py-16 ${layout === 'contained' ? 'container mx-auto px-4' : layout === 'wide' ? 'container-wide mx-auto px-4' : 'w-full px-6'}`}>
            <SectionFAQ />
        </div>
    );
}

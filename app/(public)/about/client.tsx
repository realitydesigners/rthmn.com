'use client';

import { PortableText } from '@/app/_components/blocks/PortableText';
import { BackgroundGrid } from '@/app/_components/BackgroundGrid';

interface PageData {
    title: string;
    sections: {
        sectionTitle: string;
        layout: 'contained' | 'wide' | 'fullWidth';
        content: any;
        backgroundColor: 'none' | 'dark' | 'light' | 'gradient';
    }[];
}

export default function AboutClient({ page }: { page: PageData }) {
    return (
        <BackgroundGrid>
            {page.sections?.map((section, index) => (
                <section
                    key={index}
                    className={` ${section.layout === 'contained' ? 'container mx-auto max-w-7xl' : ''} ${section.layout === 'wide' ? 'container mx-auto max-w-[90vw]' : ''} ${section.backgroundColor === 'dark' ? 'bg-black/50' : ''} ${section.backgroundColor === 'light' ? 'bg-white/5' : ''} ${
                        section.backgroundColor === 'gradient' ? 'bg-linear-to-b from-black/50 to-transparent' : ''
                    } px-6 py-16`}>
                    <div className='relative z-10'>
                        <PortableText value={section.content} template='about' />
                    </div>
                </section>
            ))}
        </BackgroundGrid>
    );
}

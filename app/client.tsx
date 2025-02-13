'use client';

import Link from 'next/link';
import { IconType } from 'react-icons';
import { FaDiscord, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { PortableText } from '@/app/(public)/_components/blocks/PortableText';
import { BackgroundGrid } from '@/app/(public)/_components/BackgroundGrid';
import { useAuth } from '@/providers/SupabaseProvider';
import { SectionFAQ } from './(public)/_components/Sections/SectionFAQ';

const socialMediaLinks: { icon: IconType; href: string }[] = [
    { icon: FaDiscord, href: '#' },
    { icon: FaInstagram, href: '#' },
    { icon: FaTwitter, href: '#' },
    { icon: FaYoutube, href: '#' },
];

interface PageData {
    title: string;
    sections: {
        sectionTitle: string;
        layout: 'contained' | 'wide' | 'fullWidth';
        content: any;
        backgroundColor: 'none' | 'dark' | 'light' | 'gradient';
    }[];
}

export default function ClientPage({ page }: { page: PageData }) {
    const { user } = useAuth();

    const buttonProps = user
        ? {
              href: '/dashboard',
              text: 'Dashboard',
          }
        : {
              href: '/signin',
              text: 'Beta Access',
          };

    return (
        <BackgroundGrid>
            {/* Top Beta Access Button - Added pt-20 */}

            {/* Social Media Links - Added pt-20 */}
            <div className='fixed bottom-0 z-50 flex h-16 w-full items-center justify-center space-x-6 bg-black'>
                {socialMediaLinks.map((social, index) => (
                    <Link key={index} href={social.href} className='text-gray-400 transition-colors duration-200 hover:text-white'>
                        <social.icon size={24} />
                    </Link>
                ))}
            </div>
            {page.sections?.map((section, index) => (
                <div key={index} className='relative z-10'>
                    <PortableText value={section.content} template='about' />
                </div>
            ))}
            <SectionFAQ />
        </BackgroundGrid>
    );
}

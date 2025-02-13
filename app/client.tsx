'use client';

import Link from 'next/link';
import { IconType } from 'react-icons';
import { FaDiscord, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { PortableText } from '@/app/(public)/_components/blocks/PortableText';
import { BackgroundGrid } from '@/app/(public)/_components/BackgroundGrid';
import { useAuth } from '@/providers/SupabaseProvider';

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
                <section
                    key={index}
                    className={`${section.layout === 'contained' ? 'container mx-auto max-w-7xl' : ''} ${
                        section.layout === 'wide' ? 'container mx-auto max-w-[90vw]' : ''
                    } ${section.backgroundColor === 'dark' ? 'bg-black/50' : ''} ${section.backgroundColor === 'light' ? 'bg-white/5' : ''} ${
                        section.backgroundColor === 'gradient' ? 'bg-linear-to-b from-black/50 to-transparent' : ''
                    } px-6 py-16`}>
                    <div className='relative z-10'>
                        <PortableText value={section.content} template='about' />
                        {/* Bottom Button */}
                        <div className='flex justify-center pb-16'>
                            <Link
                                href={buttonProps.href}
                                className='font-outfit flex items-center justify-center space-x-3 rounded-md bg-linear-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-[#444444] hover:to-[#282828]'>
                                <span className='flex w-full items-center justify-center rounded-md bg-linear-to-b from-[#0A0A0A] to-[#181818] px-6 py-3 text-sm font-medium'>
                                    {buttonProps.text}
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>
            ))}
        </BackgroundGrid>
    );
}

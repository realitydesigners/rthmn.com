'use client';

import Link from 'next/link';
import { IconType } from 'react-icons';
import { FaDiscord, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { PortableText } from '@/app/(public)/_components/blocks/PortableText';
import { BackgroundGrid } from '@/app/(public)/_components/BackgroundGrid';
import { useAuth } from '@/providers/SupabaseProvider';
import SplineRefBlock from '@/app/(public)/_components/blocks/nested/SplineRefBlock';

const socialMediaLinks: { icon: IconType; href: string }[] = [
    { icon: FaDiscord, href: '#' },
    { icon: FaInstagram, href: '#' },
    { icon: FaTwitter, href: '#' },
    { icon: FaYoutube, href: '#' },
];

export interface HeroBlockProps {
    _type: 'hero';
    _key: string;
    title?: string;
    content?: any;
}

export function HeroBlock({ title, content }: HeroBlockProps) {
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

    console.log('Hero block content:', content);

    // Extract the actual content array from the contentBlock
    const contentArray = content?.content || [];

    // Find spline elements
    const splineElements = contentArray.filter((item) => item._type === 'spline');
    const textBlocks = contentArray.filter((item) => item._type === 'block');

    return (
        <BackgroundGrid>
            {/* Social Media Links */}
            <div className='fixed bottom-0 z-50 flex h-16 w-full items-center justify-center space-x-6 bg-black'>
                {socialMediaLinks.map((social, index) => (
                    <Link key={index} href={social.href} className='text-gray-400 transition-colors duration-200 hover:text-white'>
                        <social.icon size={24} />
                    </Link>
                ))}
            </div>

            <div className='relative z-10'>
                {contentArray.length > 0 ? (
                    <div className='content-wrapper'>
                        {/* Render Spline elements using SplineRefBlock */}
                        {splineElements.length > 0 &&
                            splineElements.map((item) => (
                                <div key={item._key} className='h-[70vh] w-full'>
                                    <SplineRefBlock key={item._key} url={item.url} />
                                </div>
                            ))}

                        {/* Render text blocks with PortableText */}
                        {textBlocks.length > 0 && (
                            <div className='container mx-auto px-4'>
                                <PortableText value={textBlocks} template='about' />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='flex min-h-[50vh] items-center justify-center'>
                        <p className='text-xl'>No content found. Add content to this hero block in Sanity Studio.</p>
                    </div>
                )}
            </div>
        </BackgroundGrid>
    );
}

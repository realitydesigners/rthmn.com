'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { PortableTextBlock } from '@portabletext/types';
import { BlockProps } from '@/components/PageBuilder/blocks/Blocks';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

interface ContentBlock extends BlockProps {
    content: PortableTextBlock[];
}

export const generateHeadingId = (text: string): string => {
    if (!text) return '';

    const cleanText = text.replace(/^\d+\.\s*/, '');
    return cleanText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim();
};

export function TableOfContents({ blocks }: { blocks: BlockProps[] }) {
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [userInitial, setUserInitial] = useState<string>('');
    const pathname = usePathname();
    const isManualNavigationRef = useRef(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Fetch user avatar from Supabase
    useEffect(() => {
        const fetchUserAvatar = async () => {
            const supabase = createClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session?.user) {
                // Try to get avatar from user metadata first
                if (session.user.user_metadata?.avatar_url) {
                    setAvatarUrl(session.user.user_metadata.avatar_url);
                }

                // Also try to get from users table
                const { data: userDetails } = await supabase.from('users').select('avatar_url').eq('id', session.user.id).single();

                if (userDetails?.avatar_url) {
                    setAvatarUrl(userDetails.avatar_url);
                }

                // Set user initial as fallback
                const initial = session.user.user_metadata?.full_name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || '?';
                setUserInitial(initial);
            }
        };

        fetchUserAvatar();
    }, []);

    // Extract headings from blocks
    useEffect(() => {
        const items: TOCItem[] = [];
        blocks?.forEach((block) => {
            const contentBlock = block as ContentBlock;
            contentBlock.content?.forEach((content: PortableTextBlock) => {
                if (content.style?.match(/^h[1-6]$/)) {
                    const text = content.children
                        ?.map((child) => child.text)
                        .filter(Boolean)
                        .join('')
                        .trim();

                    if (text) {
                        const level = parseInt(content.style[1]);
                        const id = generateHeadingId(text);
                        items.push({ id, text, level });
                    }
                }
            });
        });
        setHeadings(items);
    }, [blocks]);

    // Setup and cleanup IntersectionObserver
    useEffect(() => {
        // Create observer
        observerRef.current = new IntersectionObserver(
            (entries) => {
                // Skip observation during manual navigation
                if (isManualNavigationRef.current) return;

                const visibleEntries = entries.filter((entry) => entry.isIntersecting);
                if (visibleEntries.length > 0) {
                    const mostVisible = visibleEntries.reduce((prev, current) => (prev.intersectionRatio > current.intersectionRatio ? prev : current));

                    setActiveId(mostVisible.target.id);

                    // Calculate progress based on active heading index
                    const activeIndex = headings.findIndex((heading) => heading.id === mostVisible.target.id);
                    if (activeIndex !== -1) {
                        setProgress((activeIndex / Math.max(headings.length - 1, 1)) * 100);
                    }
                }
            },
            {
                rootMargin: '-80px 0px -70% 0px',
                threshold: [0.1, 0.5, 1.0],
            }
        );

        // Observe all headings
        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element && observerRef.current) {
                observerRef.current.observe(element);
            }
        });

        // Cleanup
        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [headings]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            // Flag that we're doing manual navigation to prevent IntersectionObserver from changing activeId
            isManualNavigationRef.current = true;

            // Set active ID immediately to target section
            setActiveId(id);

            // Calculate progress based on active heading index
            const activeIndex = headings.findIndex((heading) => heading.id === id);
            if (activeIndex !== -1) {
                setProgress((activeIndex / Math.max(headings.length - 1, 1)) * 100);
            }

            // Scroll to element
            const yOffset = -100;
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

            window.scrollTo({
                top: y,
                behavior: 'smooth',
            });

            // Reset the flag after the scroll animation completes (approx. 1 second)
            setTimeout(() => {
                isManualNavigationRef.current = false;
            }, 1000);
        }
    };

    return (
        <div className='fixed top-0 right-0 z-10 mt-20 mr-8 mb-8 flex hidden h-[calc(100vh-100px)] w-72 flex-col overflow-hidden rounded-xl border border-[#333] bg-gradient-to-b from-[#111] to-[#080808] p-4 pt-6 pr-6 shadow-xl lg:block'>
            <div className='mb-6 flex items-center justify-between'>
                <h4 className='text-sm font-semibold text-gray-400'>On this page</h4>
                <div className='flex items-center gap-2'>
                    <div className='h-1.5 w-12 rounded-full bg-[#222] shadow-inner'>
                        <motion.div
                            className='h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500'
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <span className='text-xs font-medium text-indigo-300'>{Math.round(progress)}%</span>
                </div>
            </div>

            <div className='relative flex-1'>
                {/* Vertical progress line */}
                <div className='absolute top-0 bottom-0 left-4 w-0.5 bg-[#222]/50'>
                    <motion.div
                        className='absolute top-0 w-0.5 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                        initial={{ height: 0 }}
                        animate={{ height: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <ul className='relative space-y-3 pl-10 text-sm'>
                    {headings.map((heading, index) => {
                        const isActive = activeId === heading.id;
                        // Calculate the percentage for this item
                        const itemPercentage = (index / Math.max(headings.length - 1, 1)) * 100;
                        // Only render if this item's percentage is less than or equal to the progress
                        // This ensures items beyond the progress point aren't highlighted
                        const shouldRender = itemPercentage <= progress;

                        return (
                            <li key={heading.id} className='relative' style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}>
                                {/* Avatar indicator for active item */}
                                {isActive && (
                                    <div className='absolute top-1/2 -left-10 z-10 -translate-y-1/2'>
                                        <div className='relative h-8 w-8'>
                                            {/* Connecting line to avatar */}
                                            <div className='absolute top-1/2 left-0 h-0.5 w-2 -translate-y-1/2 bg-indigo-500'></div>

                                            {/* Glow effect */}
                                            <div className='absolute -inset-1 rounded-full bg-indigo-500/30 blur-md'></div>

                                            {/* Avatar container */}
                                            <div className='group relative h-8 w-8 overflow-hidden rounded-full border-2 border-indigo-500 bg-gradient-to-br from-indigo-900 to-indigo-800 shadow-lg shadow-indigo-500/30'>
                                                {/* Animated pulse effect */}
                                                <motion.div
                                                    className='absolute inset-0 bg-indigo-500/20'
                                                    animate={{ opacity: [0.2, 0.4, 0.2] }}
                                                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                                                />

                                                {/* User avatar or initial */}
                                                <div className='relative flex h-full w-full items-center justify-center overflow-hidden'>
                                                    {avatarUrl ? (
                                                        <Image src={avatarUrl} alt='User' fill className='object-cover' onError={() => setAvatarUrl(null)} />
                                                    ) : (
                                                        <span className='text-xs font-bold text-indigo-300 drop-shadow-[0_0_3px_rgba(129,140,248,0.5)]'>{userInitial}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <Link
                                    href={`${pathname}#${heading.id}`}
                                    scroll={false}
                                    onClick={(e) => handleClick(e, heading.id)}
                                    className={`inline-block w-full text-left transition-all duration-200 ${
                                        isActive
                                            ? 'translate-x-2 rounded-lg bg-gradient-to-r from-[#111] to-[#161633] p-2 font-medium text-indigo-300'
                                            : 'text-gray-400 hover:text-white'
                                    }`}>
                                    {heading.text}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

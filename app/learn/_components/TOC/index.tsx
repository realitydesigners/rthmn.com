'use client';

import type { BlockProps } from '@/components/PageBuilder/blocks/Blocks';
import { createClient } from '@/lib/supabase/client';
import type { PortableTextBlock } from '@portabletext/types';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { FiArrowRight, FiBookOpen } from 'react-icons/fi';

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

export function TableOfContents({ blocks }: { blocks: PortableTextBlock[] }) {
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [userInitial, setUserInitial] = useState<string>('');
    const [isHovered, setIsHovered] = useState<string | null>(null);
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
                const { data: userDetails } = await supabase
                    .from('users')
                    .select('avatar_url')
                    .eq('id', session.user.id)
                    .single();

                if (userDetails?.avatar_url) {
                    setAvatarUrl(userDetails.avatar_url);
                }

                // Set user initial as fallback
                const initial =
                    session.user.user_metadata?.full_name?.[0]?.toUpperCase() ||
                    session.user.email?.[0]?.toUpperCase() ||
                    '?';
                setUserInitial(initial);
            }
        };

        fetchUserAvatar();
    }, []);

    // Extract headings from blocks
    useEffect(() => {
        const items: TOCItem[] = [];
        blocks?.forEach((content: PortableTextBlock) => {
            if (content.style?.match(/^h[1-6]$/)) {
                const text = content.children
                    ?.map((child) => child.text)
                    .filter(Boolean)
                    .join('')
                    .trim();

                if (text) {
                    const level = Number.parseInt(content.style[1]);
                    const id = generateHeadingId(text);
                    items.push({ id, text, level });
                }
            }
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
                    const mostVisible = visibleEntries.reduce((prev, current) =>
                        prev.intersectionRatio > current.intersectionRatio ? prev : current
                    );

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
        <div className='fixed top-0 right-0 z-10 mt-20 mr-8 mb-8 flex hidden h-[calc(100vh-100px)] w-[280px] flex-col overflow-y-auto rounded-lg border border-white/[0.08] bg-[#0c0c0c]/95 p-5 shadow-[0_0_1px_1px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-saturate-150 lg:block'>
            <div className='mb-6'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2.5'>
                        <div className='relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-white/[0.08] to-transparent p-1 ring-1 ring-white/[0.08] ring-inset'>
                            <FiBookOpen className='h-[14px] w-[14px] text-white/70' />
                        </div>
                        <h4 className='text-[13px] font-medium tracking-tight text-[#888]'>On this page</h4>
                    </div>
                    <div className='flex items-center gap-3'>
                        <div className='h-1 w-16 overflow-hidden rounded-full bg-white/[0.08]'>
                            <motion.div
                                className='h-full rounded-full bg-gradient-to-r from-white/25 to-white/20'
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                            />
                        </div>
                        <span className='text-[11px] font-medium text-[#888]'>{Math.round(progress)}%</span>
                    </div>
                </div>
            </div>

            <div className='relative flex-1'>
                {/* Vertical progress line */}
                <div className='absolute top-0 bottom-0 left-4 w-[1px] bg-white/[0.08]'>
                    <motion.div
                        className='absolute top-0 w-[1px] bg-white/20'
                        initial={{ height: 0 }}
                        animate={{ height: `${progress}%` }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    />
                </div>

                <ul className='relative space-y-[2px] pl-8 text-sm'>
                    <AnimatePresence>
                        {headings.map((heading, index) => {
                            const isActive = activeId === heading.id;
                            const itemPercentage = (index / Math.max(headings.length - 1, 1)) * 100;
                            const shouldRender = itemPercentage <= progress;

                            return (
                                <motion.li
                                    key={heading.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.15,
                                        delay: index * 0.05,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className='relative'
                                    style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                                    onMouseEnter={() => setIsHovered(heading.id)}
                                    onMouseLeave={() => setIsHovered(null)}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId='activeIndicator'
                                            className='absolute top-1/2 left-[-24px] -translate-y-1/2'
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        >
                                            <div className='relative'>
                                                {/* Subtle connecting line */}

                                                {/* Avatar container with refined styling */}
                                                <div className='group relative h-5 w-5 rounded-full bg-gradient-to-b from-white/[0.12] to-white/[0.08] p-[1px] ring-1 ring-white/[0.12] transition-all duration-300 ring-inset'>
                                                    <div className='absolute -inset-px rounded-full bg-gradient-to-b from-white/[0.12] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
                                                    <div className='relative h-full w-full overflow-hidden rounded-full bg-gradient-to-b from-white/[0.08] to-transparent'>
                                                        {avatarUrl ? (
                                                            <Image
                                                                src={avatarUrl}
                                                                alt='User'
                                                                fill
                                                                className='object-cover opacity-90 transition-opacity duration-200 group-hover:opacity-100'
                                                                onError={() => setAvatarUrl(null)}
                                                            />
                                                        ) : (
                                                            <div className='flex h-full w-full items-center justify-center text-[10px] font-medium text-white/70 transition-colors duration-200 group-hover:text-white/90'>
                                                                {userInitial}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    <Link
                                        href={`${pathname}#${heading.id}`}
                                        scroll={false}
                                        onClick={(e) => handleClick(e, heading.id)}
                                        className='group block py-[6px]'
                                    >
                                        <motion.div
                                            className={`relative rounded-md transition-all duration-200 ${
                                                isActive
                                                    ? 'bg-white/[0.06]'
                                                    : isHovered === heading.id
                                                      ? 'bg-white/[0.03]'
                                                      : ''
                                            }`}
                                        >
                                            <div className='relative flex items-center gap-2 px-3 py-1.5'>
                                                <span
                                                    className={`block text-[13px] leading-[1.35] tracking-tight transition-colors duration-200 ${
                                                        isActive
                                                            ? 'text-white'
                                                            : shouldRender
                                                              ? 'text-[#888] group-hover:text-white/90'
                                                              : 'text-[#666]'
                                                    }`}
                                                >
                                                    {heading.text}
                                                </span>
                                                {isActive && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -4 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        className='ml-auto text-white/40'
                                                    >
                                                        <FiArrowRight size={12} />
                                                    </motion.div>
                                                )}
                                            </div>
                                            {isActive && (
                                                <motion.div
                                                    layoutId='activeBackground'
                                                    className='absolute inset-0 rounded-md ring-1 ring-white/[0.12] ring-inset'
                                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                />
                                            )}
                                        </motion.div>
                                    </Link>
                                </motion.li>
                            );
                        })}
                    </AnimatePresence>
                </ul>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaBook, FaList, FaTimes, FaChevronUp, FaCheckCircle, FaArrowLeft, FaBookmark } from 'react-icons/fa';
import { FiBook, FiX, FiChevronUp, FiCheck, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useCourseProgressStore } from '@/stores/courseProgressStore';
import type { PortableTextBlock } from '@portabletext/types';
import { BlockProps } from '@/components/PageBuilder/blocks/Blocks';

// Try to import framer-motion, but provide fallbacks if it's not available
let motion: any = { div: 'div' };
let AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;

try {
    const framerMotion = require('framer-motion');
    motion = framerMotion.motion;
    AnimatePresence = framerMotion.AnimatePresence;
} catch (e) {
    console.warn('framer-motion not available, using fallback components');
}

type NavigationTab = 'course' | 'toc';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

interface ContentBlock extends BlockProps {
    content: PortableTextBlock[];
}

interface MobileNavigationProps {
    course: any;
    lesson?: any;
    chapter?: any;
}

// Helper function to generate heading IDs (copied from TOC component)
const generateHeadingId = (text: string): string => {
    if (!text) return '';
    const cleanText = text.replace(/^\d+\.\s*/, '');
    return cleanText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim();
};

export function MobileNavigation({ course, lesson, chapter }: MobileNavigationProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<NavigationTab>('course');
    const [isScrolled, setIsScrolled] = useState(false);
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    const params = useParams();
    const pathname = usePathname();
    const store = useCourseProgressStore();
    const progress = store.getProgress(course._id);
    const panelRef = useRef<HTMLDivElement>(null);

    // Extract headings from lesson content for TOC
    useEffect(() => {
        if (lesson?.content && activeTab === 'toc') {
            const items: TOCItem[] = [];
            lesson.content.forEach((block: BlockProps) => {
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
        }
    }, [lesson, activeTab]);

    // Track active heading when scrolling
    useEffect(() => {
        if (headings.length === 0 || !isOpen || activeTab !== 'toc') return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visibleEntries = entries.filter((entry) => entry.isIntersecting);

                if (visibleEntries.length > 0) {
                    const mostVisible = visibleEntries.reduce((prev, current) => (prev.intersectionRatio > current.intersectionRatio ? prev : current));

                    setActiveId(mostVisible.target.id);
                }
            },
            {
                rootMargin: '-80px 0px -70% 0px',
                threshold: [0.1, 0.5, 1.0],
            }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [headings, isOpen, activeTab]);

    // Track scroll position to show/hide the bottom bar
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 100);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Handle TOC item click
    const handleTOCClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const yOffset = -80; // Adjust based on your header height
            const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

            window.scrollTo({
                top: y,
                behavior: 'smooth',
            });

            setActiveId(id);
            setIsOpen(false); // Close the modal after clicking
        }
    };

    // Find the current chapter and lesson
    const currentLessonSlug = params.lessonSlug as string;
    const currentChapter = course.chapters.find((c) => c.lessons.some((l) => l.slug.current === currentLessonSlug));

    return (
        <>
            {/* Overlay */}
            <motion.div
                className={`fixed inset-0 z-[100] backdrop-blur-sm transition-all duration-300 lg:hidden`}
                initial={{ opacity: 0 }}
                animate={{ opacity: isOpen ? 1 : 0 }}
                onClick={() => setIsOpen(false)}
                style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    pointerEvents: isOpen ? 'auto' : 'none',
                }}
            />

            {/* Fixed Bottom Bar */}
            <motion.div
                className='fixed bottom-4 left-1/2 z-[110] -translate-x-1/2 transform lg:hidden'
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: isScrolled ? 0 : 100, opacity: isScrolled ? 1 : 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
                <div className='flex h-12 items-center gap-3 rounded-full border border-white/[0.08] bg-[#0c0c0c]/95 px-4 shadow-[0_0_1px_1px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-saturate-150'>
                    <div className='flex items-center gap-2.5'>
                        <div className='relative flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-white/[0.08] to-transparent p-1 ring-1 ring-white/[0.08] ring-inset'>
                            <FiBook className='h-[14px] w-[14px] text-white/70' />
                        </div>
                        <div className='max-w-[150px] truncate text-[13px] font-medium text-white/90'>{lesson ? lesson.title : course.title}</div>
                    </div>
                    <button
                        onClick={() => setIsOpen(true)}
                        className='group flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.08] transition-all duration-200 hover:bg-white/[0.12]'>
                        <FiChevronUp className='h-4 w-4 text-white/70 transition-transform duration-200 group-hover:scale-110' />
                    </button>
                </div>
            </motion.div>

            {/* Navigation Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={panelRef}
                        className='fixed right-0 bottom-0 left-0 z-[120] flex flex-col rounded-t-2xl border-t border-white/[0.08] bg-[#0c0c0c]/95 shadow-[0_0_1px_1px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-saturate-150 lg:hidden'
                        style={{ height: '75vh', maxHeight: 'calc(100vh - 64px)' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}>
                        {/* Panel Header */}
                        <div className='flex flex-col border-b border-white/[0.08]'>
                            <div className='mx-auto my-2.5 h-1 w-10 rounded-full bg-white/[0.08]'></div>
                            <div className='flex items-center justify-between p-4'>
                                <div className='flex items-center gap-2.5'>
                                    <div className='relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-white/[0.08] to-transparent p-1.5 ring-1 ring-white/[0.08] ring-inset'>
                                        <FiBook className='h-4 w-4 text-white/70' />
                                    </div>
                                    <h2 className='max-w-[200px] truncate text-[15px] font-semibold text-white'>{course.title}</h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className='group flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.08] transition-all duration-200 hover:bg-white/[0.12]'>
                                    <FiX className='h-4 w-4 text-white/70 transition-transform duration-200 group-hover:scale-110' />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className='flex border-b border-white/[0.08] px-1'>
                            <button
                                className={`flex-1 py-3 text-[13px] font-medium tracking-tight transition-all duration-200 ${
                                    activeTab === 'course' ? 'border-b-2 border-white/20 text-white' : 'text-[#888] hover:text-white/90'
                                }`}
                                onClick={() => setActiveTab('course')}>
                                Course Lessons
                            </button>
                            {lesson && (
                                <button
                                    className={`flex-1 py-3 text-[13px] font-medium tracking-tight transition-all duration-200 ${
                                        activeTab === 'toc' ? 'border-b-2 border-white/20 text-white' : 'text-[#888] hover:text-white/90'
                                    }`}
                                    onClick={() => setActiveTab('toc')}>
                                    On This Page
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className='flex-1 overflow-y-auto px-4'>
                            {/* Course Navigation Tab */}
                            {activeTab === 'course' && (
                                <div className='space-y-6 py-4'>
                                    {/* Back Link */}
                                    <Link
                                        href='/learn'
                                        className='inline-flex items-center gap-2 text-[13px] text-[#888] transition-all duration-200 hover:text-white'
                                        onClick={() => setIsOpen(false)}>
                                        <FiArrowLeft className='h-3.5 w-3.5' />
                                        Back to Learning Center
                                    </Link>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className='mb-2 flex items-center justify-between'>
                                            <span className='text-[13px] text-[#888]'>Course Progress</span>
                                            <span className='text-[13px] font-medium text-white'>{Math.round(progress)}%</span>
                                        </div>
                                        <div className='h-1 overflow-hidden rounded-full bg-white/[0.08]'>
                                            <motion.div
                                                className='h-full rounded-full bg-gradient-to-r from-white/25 to-white/20'
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            />
                                        </div>
                                    </div>

                                    {/* Chapters and Lessons */}
                                    <div className='space-y-6'>
                                        {course.chapters.map((chapter) => (
                                            <div key={chapter._id} className='space-y-2'>
                                                <h3 className='text-[11px] font-medium tracking-wide text-[#888]'>{chapter.title.toUpperCase()}</h3>
                                                <div className='space-y-[2px]'>
                                                    {chapter.lessons.map((lessonItem, index) => {
                                                        const isCompleted = store.isLessonCompleted(course._id, chapter._id, lessonItem._id);
                                                        const isActive = lessonItem.slug === currentLessonSlug;

                                                        return (
                                                            <Link
                                                                key={lessonItem._id}
                                                                href={`/learn/${course.slug}/${lessonItem.slug}`}
                                                                onClick={() => setIsOpen(false)}
                                                                className={`group flex items-center gap-3 rounded-md p-2 transition-all duration-200 ${
                                                                    isActive ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                                                                }`}>
                                                                <div className='flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.08] text-[11px] font-medium text-[#888] ring-1 ring-white/[0.08] transition-colors duration-200 ring-inset group-hover:text-white'>
                                                                    {index + 1}
                                                                </div>
                                                                <span className='flex-1 text-[13px] text-[#888] transition-colors duration-200 group-hover:text-white/90'>
                                                                    {lessonItem.title}
                                                                </span>
                                                                {isCompleted && (
                                                                    <div className='text-white/40'>
                                                                        <FiCheck className='h-3.5 w-3.5' />
                                                                    </div>
                                                                )}
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Table of Contents Tab */}
                            {activeTab === 'toc' && lesson && (
                                <div className='py-4'>
                                    <div className='space-y-[2px]'>
                                        {headings.map((heading) => (
                                            <motion.div
                                                key={heading.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}>
                                                <Link
                                                    href={`${pathname}#${heading.id}`}
                                                    scroll={false}
                                                    onClick={(e) => handleTOCClick(e, heading.id)}
                                                    className='group block py-[6px]'>
                                                    <motion.div
                                                        className={`relative rounded-md transition-all duration-200 ${
                                                            activeId === heading.id ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
                                                        }`}>
                                                        <div className='relative flex items-center gap-2 px-3 py-1.5'>
                                                            <span
                                                                className={`block text-[13px] leading-[1.35] tracking-tight transition-colors duration-200 ${
                                                                    activeId === heading.id ? 'text-white' : 'text-[#888] group-hover:text-white/90'
                                                                }`}>
                                                                {heading.text}
                                                            </span>
                                                            {activeId === heading.id && (
                                                                <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} className='ml-auto text-white/40'>
                                                                    <FiArrowRight size={12} />
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                        {activeId === heading.id && (
                                                            <motion.div
                                                                layoutId='activeBackground'
                                                                className='absolute inset-0 rounded-md ring-1 ring-white/[0.12] ring-inset'
                                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                            />
                                                        )}
                                                    </motion.div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaBook, FaList, FaTimes, FaChevronUp, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
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
    const [activeTab, setActiveTab] = useState<'course' | 'toc'>('course');
    const [isScrolled, setIsScrolled] = useState(false);
    const [headings, setHeadings] = useState<TOCItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');

    const params = useParams();
    const pathname = usePathname();
    const store = useCourseProgressStore();
    const progress = store.getProgress(course._id);

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
            const target = e.target as HTMLElement;
            if (isOpen && !target.closest('.mobile-nav-modal') && !target.closest('.mobile-nav-bar')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
            {/* Fixed Bottom Bar */}
            <motion.div
                className='mobile-nav-bar fixed right-0 bottom-0 left-0 z-50 flex items-center justify-between border-t border-white/10 bg-gray-900/95 px-4 py-3 shadow-lg backdrop-blur-md lg:hidden'
                initial={{ y: 100 }}
                animate={{ y: isScrolled ? 0 : 100 }}
                transition={{ duration: 0.3 }}>
                <div className='flex items-center'>
                    <FaBook className='mr-2 h-5 w-5 text-emerald-400' />
                    <div className='max-w-[200px] truncate text-sm font-medium text-white'>{lesson ? lesson.title : course.title}</div>
                </div>
                <button onClick={() => setIsOpen(true)} className='flex items-center justify-center rounded-full bg-emerald-500 p-2 text-white shadow-md'>
                    <FaChevronUp className='h-4 w-4' />
                </button>
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className='mobile-nav-modal fixed right-0 bottom-0 left-0 z-50 flex flex-col rounded-t-xl border-t border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-md lg:hidden'
                        style={{ height: '60vh', maxHeight: 'calc(100vh - 80px)' }}
                        initial={{ opacity: 0, y: 300 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 300 }}
                        transition={{ duration: 0.3 }}>
                        {/* Modal Header with handle for dragging */}
                        <div className='flex flex-col border-b border-white/10'>
                            <div className='mx-auto my-2 h-1 w-16 rounded-full bg-white/20'></div>
                            <div className='flex items-center justify-between p-4'>
                                <div className='flex items-center gap-2'>
                                    <FaBook className='h-5 w-5 text-emerald-400' />
                                    <h2 className='max-w-[250px] truncate text-lg font-semibold text-white'>{course.title}</h2>
                                </div>
                                <button onClick={() => setIsOpen(false)} className='rounded-full bg-white/10 p-2 text-white'>
                                    <FaTimes className='h-5 w-5' />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className='flex border-b border-white/10'>
                            <button
                                className={`flex-1 py-3 text-center text-sm font-medium ${
                                    activeTab === 'course' ? 'border-b-2 border-emerald-400 text-emerald-400' : 'text-gray-400'
                                }`}
                                onClick={() => setActiveTab('course')}>
                                Course Lessons
                            </button>
                            {lesson && (
                                <button
                                    className={`flex-1 py-3 text-center text-sm font-medium ${
                                        activeTab === 'toc' ? 'border-b-2 border-emerald-400 text-emerald-400' : 'text-gray-400'
                                    }`}
                                    onClick={() => setActiveTab('toc')}>
                                    On This Page
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div className='flex-1 overflow-y-auto p-4'>
                            {/* Course Navigation Tab */}
                            {activeTab === 'course' && (
                                <div className='space-y-6'>
                                    {/* Back to Learning Center */}
                                    <Link href='/learn' className='mb-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white'>
                                        <FaArrowLeft className='h-3 w-3' />
                                        Back to Learning Center
                                    </Link>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className='mb-2 flex items-center justify-between'>
                                            <span className='text-sm text-gray-400'>Course Progress</span>
                                            <span className='text-sm font-medium text-emerald-400'>{Math.round(progress)}%</span>
                                        </div>
                                        <div className='h-2 rounded-full bg-white/5'>
                                            <div className='h-full rounded-full bg-emerald-400/50 transition-all duration-300' style={{ width: `${progress}%` }} />
                                        </div>
                                    </div>

                                    {/* Chapters and Lessons */}
                                    <div className='space-y-6'>
                                        {course.chapters.map((chapter) => (
                                            <div key={chapter._id} className='space-y-2'>
                                                <h3 className='text-sm font-semibold tracking-wider text-gray-400 uppercase'>{chapter.title}</h3>
                                                <div className='space-y-1'>
                                                    {chapter.lessons.map((lessonItem, index) => {
                                                        const isCompleted = store.isLessonCompleted(course._id, chapter._id, lessonItem._id);
                                                        const isActive = lessonItem.slug.current === currentLessonSlug;

                                                        return (
                                                            <Link
                                                                key={lessonItem._id}
                                                                href={`/learn/${course.slug.current}/${lessonItem.slug.current}`}
                                                                className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                                                                    isActive ? 'bg-emerald-400/10 text-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                                }`}
                                                                onClick={() => setIsOpen(false)}>
                                                                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-sm'>{index + 1}</div>
                                                                <span className='flex-1 text-sm'>{lessonItem.title}</span>
                                                                {isCompleted && <FaCheckCircle className='h-4 w-4 text-emerald-400' />}
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
                                <div className='pt-2'>
                                    <h4 className='mb-4 text-sm font-semibold text-gray-400'>On this page</h4>
                                    <ul className='space-y-3 text-sm'>
                                        {headings.map((heading) => (
                                            <li key={heading.id} style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}>
                                                <Link
                                                    href={`${pathname}#${heading.id}`}
                                                    scroll={false}
                                                    onClick={(e) => handleTOCClick(e, heading.id)}
                                                    className={`inline-block w-full text-left transition-all duration-200 ${
                                                        activeId === heading.id
                                                            ? 'translate-x-2 rounded-lg bg-emerald-400/10 p-2 font-medium text-emerald-400'
                                                            : 'text-gray-400 hover:text-white'
                                                    }`}>
                                                    {heading.text}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

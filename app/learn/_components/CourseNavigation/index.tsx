'use client';

import Link from 'next/link';

import { useEffect } from 'react';
import { FaArrowLeft, FaBook, FaCheckCircle } from 'react-icons/fa';

import { useCourseProgressStore } from '@/stores/courseProgressStore';
import type { Course } from '@/types/types';
import { motion } from 'framer-motion';

interface CourseNavProps {
    course: Course;
    view?: 'course' | 'lesson';
}

export function CourseNav({ course, view: propView = 'course' }: CourseNavProps) {
    const store = useCourseProgressStore();
    const progress = store.getProgress(course._id);

    // Subscribe to store changes
    useEffect(() => {
        if (!store.courses[course._id]) {
            store.initializeCourse(course._id, course.chapters);
        }
    }, [course, store.courses]);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className='fixed top-0 left-0 z-10 mt-20 mb-8 ml-8 flex hidden h-[calc(100vh-100px)] w-[280px] flex-col overflow-y-auto rounded-lg border border-white/[0.08] bg-[#0c0c0c]/95 p-5 shadow-[0_0_1px_1px_rgba(0,0,0,0.2)] backdrop-blur-xl backdrop-saturate-150 lg:block'
        >
            {/* Course Header */}
            <div className='mb-8'>
                <Link
                    href='/learn'
                    className='mb-6 flex items-center gap-2 text-[13px] text-[#888] transition-all duration-200 hover:text-white'
                >
                    <FaArrowLeft className='h-3 w-3' />
                    Back to Learning Center
                </Link>
                <div className='flex items-start gap-3'>
                    <div className='relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-b from-white/[0.08] to-transparent p-2 ring-1 ring-white/[0.08] ring-inset'>
                        <FaBook className='h-5 w-5 text-white/70' />
                    </div>
                    <div className='space-y-1.5'>
                        <div className='text-[11px] font-medium tracking-wide text-[#888]'>CURRENT COURSE</div>
                        <Link
                            href={`/learn/${course.slug}`}
                            className='block text-[15px] font-semibold text-white transition-all duration-200 hover:text-white/90'
                        >
                            {course.title}
                        </Link>
                        {/* <p className='text-[13px] leading-relaxed text-[#888]'>{course.description}</p> */}
                    </div>
                </div>

                {/* Progress Bar */}
                <div className='mt-6'>
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
            </div>

            {course.chapters.map((chapter) => {
                return (
                    <div key={chapter._id} className='space-y-3'>
                        <div>
                            <h3 className='text-[11px] font-medium tracking-wide text-[#888]'>
                                {chapter.title.toUpperCase()}
                            </h3>
                        </div>

                        <div className='space-y-[2px]'>
                            {chapter.lessons.map((lessonItem, index) => {
                                const isCompleted = store.isLessonCompleted(course._id, chapter._id, lessonItem._id);

                                return (
                                    <Link
                                        key={lessonItem._id}
                                        href={`/learn/${course.slug}/${lessonItem.slug}`}
                                        className='group flex items-center gap-3 rounded-md p-2 transition-all duration-200 hover:bg-white/[0.03]'
                                    >
                                        <div className='flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.08] text-[11px] font-medium text-[#888] ring-1 ring-white/[0.08] transition-colors duration-200 ring-inset group-hover:text-white'>
                                            {index + 1}
                                        </div>
                                        <span className='flex-1 text-[13px] text-[#888] transition-colors duration-200 group-hover:text-white/90'>
                                            {lessonItem.title}
                                        </span>
                                        {isCompleted && (
                                            <div className='text-white/40'>
                                                <FaCheckCircle className='h-3.5 w-3.5' />
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </motion.div>
    );
}

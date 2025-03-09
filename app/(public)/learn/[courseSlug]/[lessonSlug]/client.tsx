'use client';

import Link from 'next/link';
import { useEffect, useCallback } from 'react';
import { FaArrowLeft, FaArrowRight, FaBookmark, FaClock, FaCheckCircle, FaLightbulb, FaNotesMedical } from 'react-icons/fa';
import Blocks from '@/components/PageBuilder/blocks/Blocks';
import type { BlockProps } from '@/components/PageBuilder/blocks/Blocks';
import { TableOfContents } from '@/app/(public)/learn/_components/TOC';
import { useCourseProgressStore } from '@/stores/courseProgressStore';
import { CourseNav } from '../../_components/CourseNavigation';
import { MobileNavigation } from '../../_components/MobileNavigation';

interface LessonClientProps {
    course: any; // Add proper type
    lesson: any; // Add proper type
    chapter: any; // Add proper type
}

export default function LessonClient({ course, lesson, chapter }: LessonClientProps) {
    const store = useCourseProgressStore();

    // Subscribe to completion status changes
    const completed = store.isLessonCompleted(course._id, chapter._id, lesson._id);

    useEffect(() => {
        if (!store.courses[course._id]) {
            store.initializeCourse(course._id, course.chapters);
        }
    }, [course, store.courses]);

    const handleComplete = useCallback(() => {
        store.completeLesson(course._id, chapter._id, lesson._id);
    }, [course._id, chapter._id, lesson._id]);

    const handleUncomplete = useCallback(() => {
        store.uncompleteLesson(course._id, chapter._id, lesson._id);
    }, [course._id, chapter._id, lesson._id]);

    // Find current lesson index and next/prev lessons
    const currentLessonIndex = chapter.lessons.findIndex((l: any) => l.slug.current === lesson.slug.current);
    const nextLesson = chapter.lessons[currentLessonIndex + 1];
    const prevLesson = chapter.lessons[currentLessonIndex - 1];

    return (
        <div className='relative flex min-h-screen'>
            <CourseNav course={course} />
            <div className='w-full flex-1 lg:mr-80 lg:ml-80'>
                <div className='w-full px-4 py-28 lg:px-8'>
                    {/* Lesson Header */}
                    <div className='mb-12'>
                        <div className='mb-4 flex items-center gap-4 text-sm text-gray-400'>
                            <div className='flex items-center gap-2'>
                                <FaClock className='h-4 w-4' />
                                <span>{lesson.estimatedTime || '15 min read'}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <FaBookmark className='h-4 w-4' />
                                <span>
                                    Lesson {currentLessonIndex + 1} of {chapter.lessons.length}
                                </span>
                            </div>
                        </div>
                        <h1 className='font-outfit mb-4 text-4xl font-bold text-white lg:text-6xl'>{lesson.title}</h1>
                        {lesson.description && <p className='text-lg text-gray-400'>{lesson.description}</p>}
                    </div>

                    <div className='p w-full'>
                        {/* Lesson Content */}
                        {lesson.content?.map((block: BlockProps, index: number) => (
                            <Blocks
                                key={index}
                                block={{
                                    ...block,
                                }}
                            />
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className='mt-12 flex items-center justify-between border-t border-white/10 pt-8'>
                        {prevLesson && (
                            <Link
                                href={`/learn/${course.slug.current}/${prevLesson.slug.current}`}
                                className='group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-white'>
                                <FaArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
                                Previous Lesson
                            </Link>
                        )}
                        {nextLesson && (
                            <Link
                                href={`/learn/${course.slug.current}/${nextLesson.slug}`}
                                className='group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-white'>
                                Next Lesson
                                <FaArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                            </Link>
                        )}
                    </div>

                    {/* Add completion buttons */}
                    <div className='mt-8 flex items-center justify-end gap-2'>
                        <button
                            onClick={handleComplete}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                                completed ? 'bg-emerald-400/20 text-emerald-400' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                            }`}>
                            {completed ? (
                                <>
                                    <FaCheckCircle className='h-4 w-4' />
                                    Completed
                                </>
                            ) : (
                                <>
                                    <FaCheckCircle className='h-4 w-4' />
                                    Mark as Complete
                                </>
                            )}
                        </button>

                        {/* Development-only uncomplete button */}
                        {process.env.NODE_ENV === 'development' && (
                            <button
                                onClick={handleUncomplete}
                                className='flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-red-400 transition-all hover:bg-red-500/20'>
                                <FaCheckCircle className='h-4 w-4' />
                                Mark Incomplete
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <TableOfContents blocks={lesson.content as BlockProps[]} />
            <MobileNavigation course={course} lesson={lesson} chapter={chapter} />
        </div>
    );
}

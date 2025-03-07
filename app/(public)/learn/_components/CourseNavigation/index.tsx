'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaArrowLeft, FaBook, FaCheckCircle } from 'react-icons/fa';
import { useEffect } from 'react';

import { Course } from '@/types/types';
import { useCourseProgressStore } from '@/stores/courseProgressStore';

interface CourseNavProps {
    course: Course;
    view?: 'course' | 'lesson';
}

export function CourseNav({ course, view: propView = 'course' }: CourseNavProps) {
    if (!course || !course.slug || !course.chapters) {
        console.error('Invalid course data:', course);
        return <div>Error loading course</div>;
    }

    const params = useParams();
    const currentLessonSlug = params.lessonSlug as string;

    const store = useCourseProgressStore();
    const progress = store.getProgress(course._id);

    // Subscribe to store changes
    useEffect(() => {
        if (!store.courses[course._id]) {
            store.initializeCourse(course._id, course.chapters);
        }
    }, [course, store.courses]);

    // Determine view based on presence of lessonSlug in params
    const view = params.lessonSlug ? 'lesson' : propView;

    // Find the current chapter and lesson
    const currentChapter = course.chapters.find((c) => c.lessons.some((l) => l.slug.current === currentLessonSlug));

    return (
        <div className='flex h-full flex-col p-4 pt-20'>
            {/* Course Header */}
            <div className='mb-8'>
                <Link href='/learn' className='mb-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white'>
                    <FaArrowLeft className='h-3 w-3' />
                    Back to Learning Center
                </Link>
                <div className='flex items-start gap-3'>
                    <div className='rounded-lg bg-gradient-to-br from-indigo-900/30 to-indigo-700/10 p-2 shadow-md'>
                        <FaBook className='h-5 w-5 text-indigo-300 drop-shadow-[0_0_3px_rgba(129,140,248,0.5)]' />
                    </div>
                    <div className='space-y-1'>
                        {view === 'lesson' && <div className='text-xs font-medium tracking-wider text-indigo-300 uppercase'>Current Course</div>}
                        <Link href={`/learn/${course.slug}`} className='block text-xl font-semibold text-white transition-colors hover:text-indigo-300'>
                            {course.title}
                        </Link>
                        <p className='text-sm text-gray-400'>{course.description}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className='mt-4'>
                    <div className='mb-2 flex items-center justify-between'>
                        <span className='text-sm text-gray-400'>Course Progress</span>
                        <span className='text-sm font-medium text-indigo-300'>{Math.round(progress)}%</span>
                    </div>
                    <div className='h-2 rounded-full bg-[#222] shadow-inner'>
                        <div className='h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-300' style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            {/* Course Content */}
            <div className='flex-1 overflow-y-auto'>
                {/* Show Course Progress only in lesson view */}
                {view === 'lesson' && currentChapter && (
                    <div className='mb-6'>
                        <div className='mb-2 flex items-center justify-between'>
                            <span className='text-sm text-gray-400'>Chapter Progress</span>
                            <span className='text-sm font-medium text-indigo-300'>60%</span>
                        </div>
                        <div className='h-2 rounded-full bg-[#222] shadow-inner'>
                            <div className='h-full w-[60%] rounded-full bg-gradient-to-r from-indigo-600 to-blue-500' />
                        </div>

                        {/* Lesson Navigation */}
                        <div className='mt-6 space-y-2'>
                            {currentChapter.lessons.map((lessonItem, index) => {
                                const isActive = lessonItem.slug.current === currentLessonSlug;
                                const isCompleted = store.isLessonCompleted(course._id, currentChapter._id, lessonItem._id);

                                return (
                                    <Link
                                        key={lessonItem._id}
                                        href={`/learn/${course.slug}/${lessonItem.slug}`}
                                        className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                                            isActive ? 'bg-gradient-to-r from-[#111] to-[#161633] text-indigo-300' : 'text-gray-400 hover:bg-[#111] hover:text-white'
                                        }`}>
                                        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-[#222] text-sm shadow-inner'>{index + 1}</div>
                                        <span className='flex-1 text-sm'>{lessonItem.title}</span>
                                        {isCompleted && <FaCheckCircle className='h-4 w-4 text-indigo-300 drop-shadow-[0_0_3px_rgba(129,140,248,0.5)]' />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Course Chapters */}
                {(!view || view === 'course' || !currentChapter) && (
                    <div className='space-y-6'>
                        {course.chapters.map((chapter) => {
                            // Calculate chapter progress
                            const totalLessons = chapter.lessons.length;
                            const completedLessons = chapter.lessons.filter((lesson) => store.isLessonCompleted(course._id, chapter._id, lesson._id)).length;
                            const chapterProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

                            return (
                                <div key={chapter._id} className='space-y-3'>
                                    <div>
                                        <h3 className='text-sm font-semibold tracking-wider text-gray-400 uppercase'>{chapter.title}</h3>
                                        <div className='mt-2 h-1.5 rounded-full bg-[#222] shadow-inner'>
                                            <div
                                                className='h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-300'
                                                style={{ width: `${chapterProgress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className='space-y-1.5'>
                                        {chapter.lessons.map((lessonItem, index) => {
                                            const isCompleted = store.isLessonCompleted(course._id, chapter._id, lessonItem._id);

                                            return (
                                                <Link
                                                    key={lessonItem._id}
                                                    href={`/learn/${course.slug}/${lessonItem.slug}`}
                                                    className='flex items-center gap-3 rounded-lg p-2 text-gray-400 transition-all hover:bg-[#111] hover:text-white'>
                                                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-[#222] text-xs shadow-inner'>{index + 1}</div>
                                                    <span className='flex-1 text-sm'>{lessonItem.title}</span>
                                                    {isCompleted && <FaCheckCircle className='h-3.5 w-3.5 text-indigo-300 drop-shadow-[0_0_3px_rgba(129,140,248,0.5)]' />}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

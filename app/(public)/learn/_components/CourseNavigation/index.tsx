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
    const params = useParams();
    const currentLessonSlug = params.lessonSlug as string;
    const courseSlug = params.courseSlug as string;

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
    const currentLessonIndex = currentChapter?.lessons.findIndex((l) => l.slug.current === currentLessonSlug) ?? -1;

    return (
        <div className='flex flex-col p-4 pt-20'>
            {/* Course Header */}
            <div className='mb-8'>
                <Link href='/learn' className='mb-6 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white'>
                    <FaArrowLeft className='h-3 w-3' />
                    Back to Learning Center
                </Link>
                <div className='flex items-start gap-3'>
                    <div className='rounded-lg bg-emerald-400/10 p-2'>
                        <FaBook className='h-5 w-5 text-emerald-400' />
                    </div>
                    <div className='space-y-1'>
                        {view === 'lesson' && <div className='text-xs font-medium tracking-wider text-emerald-400 uppercase'>Current Course</div>}
                        <Link href={`/learn/${course.slug}`} className='block text-xl font-semibold text-white hover:text-emerald-400'>
                            {course.title}
                        </Link>
                        <p className='text-sm text-gray-400'>{course.description}</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className='mt-4'>
                    <div className='mb-2 flex items-center justify-between'>
                        <span className='text-sm text-gray-400'>Course Progress</span>
                        <span className='text-sm font-medium text-emerald-400'>{Math.round(progress)}%</span>
                    </div>
                    <div className='h-2 rounded-full bg-white/5'>
                        <div className='h-full rounded-full bg-emerald-400/50 transition-all duration-300' style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            {/* Course Content */}
            <div className='flex-1 overflow-y-auto px-4'>
                {/* Show Course Progress only in lesson view */}
                {view === 'lesson' && currentChapter && (
                    <div className='mb-6'>
                        <div className='mb-2 flex items-center justify-between'>
                            <span className='text-sm text-gray-400'>Course Progress</span>
                            <span className='text-sm font-medium text-emerald-400'>60%</span>
                        </div>
                        <div className='h-2 rounded-full bg-white/5'>
                            <div className='h-full w-[60%] rounded-full bg-emerald-400/50' />
                        </div>

                        {/* Lesson Navigation */}
                        <div className='mt-6 space-y-4'>
                            {currentChapter.lessons.map((lessonItem, index) => (
                                <Link
                                    key={lessonItem._id}
                                    href={`/learn/${courseSlug}/${lessonItem.slug.current}`}
                                    className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                                        lessonItem.slug.current === currentLessonSlug ? 'bg-emerald-400/10 text-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}>
                                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-sm'>{index + 1}</div>
                                    <span className='flex-1 text-sm'>{lessonItem.title}</span>
                                    <FaCheckCircle className={`h-4 w-4 ${lessonItem.slug.current === currentLessonSlug ? 'text-emerald-400' : 'text-gray-600'}`} />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chapter List */}
                <div className='space-y-2'>
                    {course.chapters.map((chapter, chapterIndex) => {
                        const isCurrentChapter = chapter.lessons.some((lesson) => lesson.slug.current === currentLessonSlug);

                        return (
                            <div key={chapter._id} className='overflow-hidden rounded-lg'>
                                <div className={`flex items-center justify-between p-3 transition-colors ${isCurrentChapter ? 'bg-emerald-400/10' : 'hover:bg-white/5'}`}>
                                    <div className='flex items-center gap-3'>
                                        <div
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                                                isCurrentChapter ? 'bg-emerald-400 text-black' : 'bg-white/10 text-white'
                                            }`}>
                                            {chapterIndex + 1}
                                        </div>
                                        <h3 className={`text-sm font-medium ${isCurrentChapter ? 'text-emerald-400' : 'text-white'}`}>{chapter.title}</h3>
                                    </div>
                                </div>

                                {/* Lesson list */}
                                <div className='mt-2 ml-9 space-y-1'>
                                    {chapter.lessons.map((lesson, lessonIndex) => {
                                        // Get completion status from store
                                        const completed = store.isLessonCompleted(course._id, chapter._id, lesson._id);

                                        return (
                                            <Link
                                                key={lesson._id}
                                                href={`/learn/${courseSlug}/${lesson.slug.current}`}
                                                className={`flex items-center gap-3 rounded-lg p-2 text-sm transition-colors ${
                                                    completed ? 'text-emerald-400' : 'text-white/60'
                                                } ${lesson.slug.current === currentLessonSlug ? 'bg-emerald-400/10' : 'hover:bg-white/5'}`}>
                                                <span className='text-xs'>{lessonIndex + 1}</span>
                                                <span className='flex-1'>{lesson.title}</span>
                                                {completed && <FaCheckCircle className='h-4 w-4 text-emerald-400' />}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

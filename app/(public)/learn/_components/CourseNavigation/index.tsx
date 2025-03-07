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

    const store = useCourseProgressStore();
    const progress = store.getProgress(course._id);

    // Subscribe to store changes
    useEffect(() => {
        if (!store.courses[course._id]) {
            store.initializeCourse(course._id, course.chapters);
        }
    }, [course, store.courses]);

    return (
        <div className='fixed top-0 left-0 z-10 mt-20 mb-8 ml-8 flex hidden h-[calc(100vh-100px)] w-72 flex-col overflow-hidden overflow-y-auto rounded-xl border border-[#333] bg-gradient-to-b from-[#111] to-[#080808] p-4 pt-6 pr-6 shadow-xl lg:block'>
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
                        <div className='text-xs font-medium tracking-wider text-indigo-300 uppercase'>Current Course</div>
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

            {course.chapters.map((chapter) => {
                return (
                    <div key={chapter._id} className='space-y-3'>
                        <div>
                            <h3 className='text-sm font-semibold tracking-wider text-gray-400 uppercase'>{chapter.title}</h3>
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
    );
}

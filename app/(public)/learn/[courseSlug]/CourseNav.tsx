'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { FaArrowLeft, FaPlay, FaBook } from 'react-icons/fa';

interface Lesson {
    _id: string;
    title: string;
    description: string | null;
    slug: string;
}

interface Module {
    _id: string;
    title: string;
    description: string | null;
    slug: string;
    order: number;
    lessons: Lesson[];
}

interface Course {
    _id: string;
    title: string;
    description: string;
    slug: string;
    modules: Module[];
}

export function CourseNav({ course }: { course: Course }) {
    const params = useParams();
    const pathname = usePathname();
    const currentLessonSlug = params.lessonSlug as string;

    return (
        <div className='flex flex-col'>
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
                    <div>
                        <Link href={`/learn/${course.slug}`} className='text-lg font-semibold text-white hover:text-emerald-400'>
                            {course.title}
                        </Link>
                        <p className='mt-1 text-sm text-gray-400'>{course.description}</p>
                    </div>
                </div>
            </div>

            {/* Module List */}
            <div className='space-y-6'>
                {course.modules.map((module, moduleIndex) => {
                    const isCurrentModule = module.lessons.some((lesson) => lesson.slug === currentLessonSlug);
                    return (
                        <div key={module._id} className='space-y-3'>
                            <div className='flex items-center gap-2'>
                                <div
                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                                        isCurrentModule ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-gray-400'
                                    }`}>
                                    {moduleIndex + 1}
                                </div>
                                <h3 className={`text-sm font-medium ${isCurrentModule ? 'text-emerald-400' : 'text-white'}`}>{module.title}</h3>
                            </div>

                            <div className='ml-8 space-y-1'>
                                {module.lessons.map((lesson) => {
                                    const isActive = currentLessonSlug === lesson.slug;
                                    return (
                                        <Link
                                            key={lesson._id}
                                            href={`/learn/${course.slug}/${lesson.slug}`}
                                            className={`group flex items-center gap-3 rounded-lg px-4 py-2 text-sm transition-all ${
                                                isActive ? 'bg-emerald-400/10 text-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}>
                                            <FaPlay className={`h-3 w-3 ${isActive ? 'text-emerald-400' : 'text-gray-500'}`} />
                                            <span className='line-clamp-1'>{lesson.title}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

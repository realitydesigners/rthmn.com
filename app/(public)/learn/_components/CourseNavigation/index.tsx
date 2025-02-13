'use client';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { FaArrowLeft, FaPlay, FaBook, FaCheckCircle, FaClock, FaLock } from 'react-icons/fa';
import { useLearningStore } from '@/stores/learningStore';

interface Lesson {
    _id: string;
    title: string;
    description: string | null;
    slug: string;
    estimatedTime?: string;
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

interface CourseNavProps {
    course: Course;
    view?: 'course' | 'lesson';
}

export function CourseNav({ course, view: propView = 'course' }: CourseNavProps) {
    const params = useParams();
    const currentLessonSlug = params.lessonSlug as string;
    const courseSlug = params.courseSlug as string;
    const { courseProgress } = useLearningStore();

    // Determine view based on presence of lessonSlug in params
    const view = params.lessonSlug ? 'lesson' : propView;

    // Find the current module and lesson
    const currentModule = course.modules.find((m) => m.lessons.some((l) => l.slug === currentLessonSlug));
    const currentLessonIndex = currentModule?.lessons.findIndex((l) => l.slug === currentLessonSlug) ?? -1;

    return (
        <div className='flex flex-col px-2 pt-6'>
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
            </div>

            {/* Course Content */}
            <div className='flex-1 overflow-y-auto px-4'>
                {/* Show Course Progress only in lesson view */}
                {view === 'lesson' && currentModule && (
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
                            {currentModule.lessons.map((lessonItem, index) => (
                                <Link
                                    key={lessonItem._id}
                                    href={`/learn/${courseSlug}/${lessonItem.slug}`}
                                    className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                                        lessonItem.slug === currentLessonSlug ? 'bg-emerald-400/10 text-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}>
                                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-sm'>{index + 1}</div>
                                    <span className='flex-1 text-sm'>{lessonItem.title}</span>
                                    <FaCheckCircle className={`h-4 w-4 ${lessonItem.slug === currentLessonSlug ? 'text-emerald-400' : 'text-gray-600'}`} />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Module List */}
                <div className='space-y-6'>
                    {course.modules.map((module, moduleIndex) => {
                        const isCurrentModule = module.lessons.some((lesson) => lesson.slug === currentLessonSlug);
                        const moduleProgress = Math.round(((courseProgress[course._id]?.moduleProgress[module._id]?.completedLessons.length || 0) / module.lessons.length) * 100);

                        return (
                            <div key={module._id} className='space-y-3'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-2'>
                                        <div
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-sm ${
                                                isCurrentModule ? 'bg-emerald-400/20 text-emerald-400' : 'bg-white/5 text-gray-400'
                                            }`}>
                                            {moduleIndex + 1}
                                        </div>
                                        <h3 className={`text-sm font-medium ${isCurrentModule ? 'text-emerald-400' : 'text-white'}`}>{module.title}</h3>
                                    </div>
                                    {view === 'lesson' && <span className='text-xs text-gray-400'>{moduleProgress}%</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

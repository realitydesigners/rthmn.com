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
    const pathname = usePathname();
    const currentLessonSlug = params.lessonSlug as string;
    const { courseProgress } = useLearningStore();

    // Determine view based on presence of lessonSlug in params
    const view = params.lessonSlug ? 'lesson' : propView;

    console.log('CourseNav Render:', {
        pathname,
        params,
        view,
        currentLessonSlug,
        course: {
            title: course.title,
            slug: course.slug,
            _id: course._id,
        },
    });

    const getLessonStatus = (moduleId: string, lessonId: string) => {
        const module = courseProgress[course._id]?.moduleProgress[moduleId];
        if (!module) return 'not-started';
        return module.completedLessons.includes(lessonId) ? 'completed' : 'not-started';
    };

    const getModuleProgress = (moduleId: string) => {
        const module = courseProgress[course._id]?.moduleProgress[moduleId];
        if (!module) return 0;

        const totalLessons = module.completedLessons.length;
        const completedLessons = module.completedLessons.length;
        return (completedLessons / totalLessons) * 100;
    };

    const isLessonAccessible = (moduleIndex: number, lessonIndex: number) => {
        if (moduleIndex === 0 && lessonIndex === 0) return true;

        // Check if previous lesson is completed
        const prevModule = moduleIndex > 0 ? course.modules[moduleIndex - 1] : course.modules[moduleIndex];
        const prevLesson = lessonIndex > 0 ? course.modules[moduleIndex].lessons[lessonIndex - 1] : prevModule.lessons[prevModule.lessons.length - 1];

        return getLessonStatus(prevModule._id, prevLesson._id) === 'completed';
    };

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
                    <div className='space-y-1'>
                        {view === 'lesson' && <div className='text-xs font-medium tracking-wider text-emerald-400 uppercase'>Current Course</div>}
                        <Link href={`/learn/${course.slug}`} className='block text-xl font-semibold text-white hover:text-emerald-400'>
                            {course.title}
                        </Link>
                        <p className='text-sm text-gray-400'>{course.description}</p>
                    </div>
                </div>
            </div>

            {/* Course Progress - Only show in lesson view */}
            {view === 'lesson' && (
                <div className='mb-6 rounded-lg border border-white/10 bg-white/5 p-4'>
                    <div className='mb-2 flex items-center justify-between'>
                        <span className='text-sm text-gray-400'>Course Progress</span>
                        <span className='text-sm font-medium text-emerald-400'>
                            {Math.round(
                                (Object.values(courseProgress[course._id]?.moduleProgress || {}).reduce((acc, module) => acc + module.completedLessons.length, 0) /
                                    course.modules.reduce((acc, module) => acc + module.lessons.length, 0)) *
                                    100
                            )}
                            %
                        </span>
                    </div>
                    <div className='h-2 rounded-full bg-white/5'>
                        <div
                            className='h-full rounded-full bg-emerald-400/50 transition-all'
                            style={{
                                width: `${Math.round(
                                    (Object.values(courseProgress[course._id]?.moduleProgress || {}).reduce((acc, module) => acc + module.completedLessons.length, 0) /
                                        course.modules.reduce((acc, module) => acc + module.lessons.length, 0)) *
                                        100
                                )}%`,
                            }}
                        />
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

                            <div className='ml-8 space-y-1'>
                                {module.lessons.map((lesson, lessonIndex) => {
                                    const isActive = currentLessonSlug === lesson.slug;
                                    const lessonStatus = getLessonStatus(module._id, lesson._id);
                                    const isAccessible = isLessonAccessible(moduleIndex, lessonIndex);

                                    return (
                                        <Link
                                            key={lesson._id}
                                            href={isAccessible ? `/learn/${course.slug}/${lesson.slug}` : '#'}
                                            className={`group flex items-center gap-3 rounded-lg px-4 py-2 transition-all ${
                                                isActive
                                                    ? 'bg-emerald-400/10 text-emerald-400'
                                                    : isAccessible
                                                      ? 'text-gray-400 hover:bg-white/5 hover:text-white'
                                                      : 'cursor-not-allowed opacity-50'
                                            }`}>
                                            {lessonStatus === 'completed' ? (
                                                <FaCheckCircle className='h-4 w-4 text-emerald-400' />
                                            ) : isAccessible ? (
                                                <FaPlay className='h-3 w-3 text-gray-500' />
                                            ) : (
                                                <FaLock className='h-3 w-3 text-gray-500' />
                                            )}
                                            <span className='flex-1 text-sm'>{lesson.title}</span>
                                            {lesson.estimatedTime && (
                                                <div className='flex items-center gap-1 text-xs text-gray-500'>
                                                    <FaClock className='h-3 w-3' />
                                                    {lesson.estimatedTime}
                                                </div>
                                            )}
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

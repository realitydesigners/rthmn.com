'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FaArrowLeft, FaBook, FaChartLine, FaChevronDown, FaGraduationCap, FaLightbulb, FaPlay, FaRocket, FaTools } from 'react-icons/fa';
import { Background } from '@/app/(public)/_components/Background';
import { useLearningStore } from '@/stores/learningStore';

const CourseIcon = ({ icon }: { icon: string }) => {
    const icons = {
        FaChartLine,
        FaBook,
        FaGraduationCap,
        FaTools,
        FaRocket,
    };
    const IconComponent = icons[icon as keyof typeof icons] || FaBook;
    return <IconComponent className='h-8 w-8 text-emerald-400' />;
};

interface Lesson {
    _id: string;
    title: string;
    description: string;
    slug: string;
}

interface Module {
    _id: string;
    title: string;
    description: string;
    slug: string;
    lessons: Lesson[];
}

interface Course {
    _id: string;
    title: string;
    description: string;
    slug: string;
    icon: string;
    modules: Module[];
    difficulty: string;
    estimatedTime: string;
}

export default function CourseClient({ course }: { course: Course }) {
    const [expandedModule, setExpandedModule] = useState<string | null>(null);
    const { startCourse, startModule } = useLearningStore();

    console.log('CourseClient received course:', course); // Debug log

    return (
        <div className='relative min-h-screen w-full overflow-hidden bg-black'>
            <Background />

            <div className='relative'>
                {/* Hero Section */}
                <div className='mx-auto mt-32 max-w-5xl px-6 sm:px-8 lg:px-12'>
                    <Link href='/learn' className='group mb-8 inline-flex items-center gap-2 text-gray-400 transition-colors hover:text-white'>
                        <FaArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
                        Back to Learning Center
                    </Link>

                    <div className='mb-16 flex items-start gap-6'>
                        <div className='rounded-2xl bg-emerald-400/10 p-4'>
                            <CourseIcon icon={course.icon} />
                        </div>
                        <div className='flex-1 space-y-4'>
                            <h1 className='font-outfit bg-gradient-to-br from-white via-white to-gray-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl'>
                                {course.title}
                            </h1>
                            <p className='max-w-2xl text-lg text-gray-400'>{course.description}</p>
                            <div className='flex flex-wrap items-center gap-6'>
                                <div className='flex items-center gap-2'>
                                    <div className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-sm text-emerald-400'>{course.modules.length}</div>
                                    <span className='text-sm text-gray-400'>Modules</span>
                                </div>
                                {course.difficulty && (
                                    <div className='flex items-center gap-2'>
                                        <FaLightbulb className='h-5 w-5 text-emerald-400' />
                                        <span className='text-sm text-gray-400 capitalize'>{course.difficulty}</span>
                                    </div>
                                )}
                                {course.estimatedTime && (
                                    <div className='flex items-center gap-2'>
                                        <span className='text-sm text-gray-400'>{course.estimatedTime}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Course Modules */}
                    <div className='space-y-8'>
                        <h2 className='font-outfit text-2xl font-semibold text-white'>Course Content</h2>
                        <div className='space-y-4'>
                            {course.modules?.map((module, moduleIndex) => (
                                <div
                                    key={module._id}
                                    className='overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-emerald-500/20 hover:bg-emerald-500/5'>
                                    <div className='p-6'>
                                        <div className='flex items-center gap-4'>
                                            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-lg font-semibold text-emerald-400'>
                                                {moduleIndex + 1}
                                            </div>
                                            <div className='flex-1'>
                                                <h3 className='text-lg font-medium text-white'>{module.title}</h3>
                                                {module.description && <p className='mt-1 text-sm text-gray-400'>{module.description}</p>}
                                            </div>
                                            <div className='flex items-center gap-2 text-sm text-gray-400'>
                                                <div className='flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 text-xs text-emerald-400'>
                                                    {module.lessons.length}
                                                </div>
                                                <span>Lessons</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className='border-t border-white/5'>
                                        {module.lessons.map((lesson, lessonIndex) => (
                                            <Link
                                                key={lesson._id}
                                                href={`/learn/${course.slug}/${lesson.slug}`}
                                                className='flex items-center gap-4 border-b border-white/5 p-4 last:border-b-0 hover:bg-emerald-500/5'>
                                                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-sm text-emerald-400'>
                                                    {lessonIndex + 1}
                                                </div>
                                                <div className='flex-1'>
                                                    <h4 className='text-white'>{lesson.title}</h4>
                                                    {lesson.description && <p className='mt-1 text-sm text-gray-400'>{lesson.description}</p>}
                                                </div>
                                                <FaPlay className='h-4 w-4 text-emerald-400' />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

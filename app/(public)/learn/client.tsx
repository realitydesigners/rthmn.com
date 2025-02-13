'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaBook, FaChartLine, FaCheckCircle, FaGraduationCap, FaLightbulb, FaLock, FaPlay, FaRocket, FaTools } from 'react-icons/fa';
import { useLearningStore } from '@/stores/learningStore';
import { Background } from '@/app/(public)/_components/Background';
import React from 'react';

interface Lesson {
    _id: string;
    title: string;
    description: string;
    slug: { current: string };
}

interface Module {
    _id: string;
    title: string;
    description: string;
    slug: { current: string };
    lessons: Lesson[];
}

interface Course {
    _id: string;
    title: string;
    description: string;
    slug: { current: string };
    icon: string;
    modules: Module[];
    difficulty: string;
    estimatedTime: string;
}

const MotionLink = motion(Link);

const CourseIcon = ({ icon }: { icon: string }) => {
    const icons = {
        FaChartLine,
        FaBook,
        FaGraduationCap,
        FaTools,
        FaRocket,
    };
    const IconComponent = icons[icon as keyof typeof icons] || FaBook;
    return <IconComponent className='h-5 w-5 text-emerald-400' />;
};

export function LearnPageClient({ courses }: { courses: Course[] }) {
    const { courseProgress, currentCourse, startCourse, startModule } = useLearningStore();

    // Debug logging
    React.useEffect(() => {
        console.log('Courses data:', courses);
        courses.forEach((course) => {
            console.log(`Course "${course.title}":`, {
                hasModules: Boolean(course.modules),
                moduleCount: course.modules?.length,
                modules: course.modules,
            });
        });
    }, [courses]);

    const getModuleStatus = (courseId: string, moduleId: string) => {
        const course = courseProgress[courseId];
        if (!course) return 'not-started';
        const module = course.moduleProgress[moduleId];
        if (!module) return 'not-started';
        return module.status;
    };

    const getLessonStatus = (courseId: string, moduleId: string, lessonId: string) => {
        const course = courseProgress[courseId];
        if (!course) return 'locked';
        const module = course.moduleProgress[moduleId];
        if (!module) return 'locked';
        if (module.completedLessons.includes(lessonId)) return 'completed';
        if (module.status === 'in-progress') return 'available';
        return 'locked';
    };

    return (
        <div className='relative min-h-screen w-full overflow-hidden bg-black'>
            <Background />

            {/* Content */}
            <div className='relative'>
                {/* Hero Section */}
                <div className='mx-auto mt-40 mb-20 max-w-5xl px-6 text-center sm:px-8 lg:px-12'>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className='space-y-8'>
                        <h1 className='font-outfit bg-gradient-to-br from-white via-white to-gray-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl'>
                            Learn to Trade
                        </h1>
                        <p className='font-kodemono mx-auto max-w-2xl text-base text-gray-400/90 sm:text-lg'>
                            Go from beginner to expert by learning the foundations of forex trading and building a fully functional trading system that uses all the latest
                            features.
                        </p>
                    </motion.div>
                </div>

                {/* Course Content */}
                <div className='mx-auto max-w-5xl px-6 pb-24 sm:px-8 lg:px-12'>
                    {/* Learning Tracks */}
                    <div className='mb-16 space-y-6'>
                        <h2 className='font-outfit text-2xl font-semibold text-white'>Courses</h2>
                        <div className='grid gap-4 sm:grid-cols-2'>
                            {courses.map((course) => (
                                <MotionLink
                                    key={course._id}
                                    href={`/learn/${course.slug.current}`}
                                    className='group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}>
                                    <div className='flex items-center gap-4'>
                                        <div className='rounded-full bg-emerald-400/10 p-3'>
                                            <CourseIcon icon={course.icon} />
                                        </div>
                                        <div>
                                            <h3 className='font-medium text-white'>{course.title}</h3>
                                            <p className='mt-1 text-sm text-gray-400'>{course.description}</p>
                                            <div className='mt-3 flex items-center gap-4'>
                                                <div className='flex items-center gap-2'>
                                                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/10 text-xs font-medium text-emerald-400'>
                                                        {Array.isArray(course.modules) ? course.modules.length : 0}
                                                    </div>
                                                    <span className='text-xs text-gray-400'>Modules</span>
                                                </div>
                                                {course.difficulty && (
                                                    <div className='flex items-center gap-2'>
                                                        <FaLightbulb className='h-4 w-4 text-emerald-400' />
                                                        <span className='text-xs text-gray-400 capitalize'>{course.difficulty}</span>
                                                    </div>
                                                )}
                                                {course.estimatedTime && (
                                                    <div className='text-xs text-gray-400'>
                                                        <span className='text-emerald-400'>·</span> {course.estimatedTime}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </MotionLink>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

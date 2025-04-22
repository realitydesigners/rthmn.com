'use client';

import Link from 'next/link';
import { FaBook, FaChartLine, FaGraduationCap, FaArrowRight } from 'react-icons/fa';
import { Background } from '@/components/Backgrounds/Background';
import { Course } from '@/types/types';

export function LearnPageClient({ courses }: { courses: Course[] }) {
    return (
        <div className='relative min-h-screen w-full'>
            <Background />

            {/* Hero Section */}
            <div className='mx-auto mt-40 max-w-5xl px-6 sm:px-8 lg:px-12'>
                <div className='relative z-10 text-center'>
                    <h1 className='font-outfit mx-auto max-w-4xl text-6xl font-bold text-white md:text-7xl'>
                        Learn to trade with
                        <span className=''> confidence</span>
                    </h1>
                    <p className='font-outfit mx-auto mt-8 max-w-2xl text-xl text-white/90'>
                        Master the art of trading through our comprehensive courses. From fundamentals to advanced strategies.
                    </p>
                </div>

                {/* Course Cards */}
                <div className='mt-24 space-y-4'>
                    {courses.map((course) => (
                        <Link key={course._id} href={`/learn/${course.slug.current}`}>
                            <div className='group relative'>
                                <div className='relative overflow-hidden rounded-xl border border-white/[0.05] bg-gradient-to-r from-[#0c0c0c] to-black/40 p-6 transition-all duration-300 hover:border-white/[0.1]'>
                                    <div className='flex items-center justify-between'>
                                        {/* Left side with icon and info */}
                                        <div className='flex items-center gap-5'>
                                            <div>
                                                <h2 className='font-outfit text-xl font-medium text-white'>{course.title}</h2>
                                                <p className='mt-1 text-sm text-white/60'>{course.description}</p>
                                            </div>
                                        </div>

                                        {/* Right side with modules count and arrow */}
                                        <div className='flex items-center gap-6'>
                                            <div className='flex items-center gap-2'>
                                                <div className='flex h-5 w-5 items-center justify-center rounded-full bg-[#1a1a1a] text-xs font-medium text-blue-400'>
                                                    {course.chapters.length}
                                                </div>
                                                <span className='text-sm text-white/60'>chapters</span>
                                            </div>
                                            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1a] transition-transform duration-300 group-hover:translate-x-0.5'>
                                                <FaArrowRight className='h-3.5 w-3.5 text-blue-400' />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

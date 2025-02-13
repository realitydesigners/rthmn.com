import { notFound } from 'next/navigation';
import Link from 'next/link';
import Blocks from '@/app/(public)/_components/blocks/Blocks';
import type { BlockProps } from '@/app/(public)/_components/blocks/Blocks';
import { TableOfContents } from '@/app/(public)/_components/TOC';
import { getCourse, getLesson } from '@/utils/sanity/lib/queries';
import { FaArrowLeft, FaArrowRight, FaBookmark, FaClock, FaCheckCircle, FaLightbulb, FaNotesMedical } from 'react-icons/fa';
import { Background } from '@/app/(public)/_components/Background';

export const revalidate = 60;

interface Lesson {
    _id: string;
    title: string;
    description?: string;
    content?: BlockProps[];
    slug: string;
    relatedLessons?: {
        _id: string;
        title: string;
        description?: string;
        slug: { current: string };
    }[];
    learningObjectives?: string[];
}

interface Module {
    _id: string;
    title: string;
    description?: string;
    slug: string;
    lessons: Lesson[];
}

type Props = {
    params: Promise<{
        courseSlug: string;
        lessonSlug: string;
    }>;
};

export default async function LessonPage(props: Props) {
    const resolvedParams = await props.params;
    const { courseSlug, lessonSlug } = resolvedParams;

    if (!courseSlug || !lessonSlug) {
        notFound();
    }

    const [course, lesson] = await Promise.all([getCourse(courseSlug), getLesson(lessonSlug)]);

    if (!course || !lesson) {
        notFound();
    }

    // Find the module that contains this lesson
    const module = course.modules.find((m) => m.lessons.some((l) => l.slug === lessonSlug));

    if (!module) {
        notFound();
    }

    // Find current lesson index and next/prev lessons
    const currentLessonIndex = module.lessons.findIndex((l) => l.slug === lessonSlug);
    const nextLesson = module.lessons[currentLessonIndex + 1];
    const prevLesson = module.lessons[currentLessonIndex - 1];

    return (
        <div className='relative flex min-h-screen'>
            {/* Left Sidebar - Course Navigation */}
            <div className='fixed top-0 left-0 h-screen w-72 border-r border-white/10 bg-black/50 backdrop-blur-xl'>
                <div className='flex h-full flex-col'>
                    <div className='p-6'>
                        <Link href='/learn' className='group mb-4 inline-flex items-center gap-2 text-gray-400 transition-colors hover:text-white'>
                            <FaArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
                            Back to Learning Center
                        </Link>

                        {/* Course Title */}
                        <div className='mb-6'>
                            <div className='text-xs font-medium tracking-wider text-emerald-400 uppercase'>Current Course</div>
                            <Link href={`/learn/${courseSlug}`} className='mt-1 block text-xl font-semibold text-white hover:text-emerald-400'>
                                {course.title}
                            </Link>
                        </div>
                    </div>
                    <div className='flex-1 overflow-y-auto px-4'>
                        {/* Course Progress */}
                        <div className='mb-6'>
                            <div className='mb-2 flex items-center justify-between'>
                                <span className='text-sm text-gray-400'>Course Progress</span>
                                <span className='text-sm font-medium text-emerald-400'>60%</span>
                            </div>
                            <div className='h-2 rounded-full bg-white/5'>
                                <div className='h-full w-[60%] rounded-full bg-emerald-400/50' />
                            </div>
                        </div>

                        {/* Module Navigation */}
                        <div className='space-y-4'>
                            {module &&
                                module.lessons.map((lessonItem, index) => (
                                    <Link
                                        key={lessonItem._id}
                                        href={`/learn/${courseSlug}/${lessonItem.slug}`}
                                        className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                                            lessonItem.slug === lessonSlug ? 'bg-emerald-400/10 text-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}>
                                        <div className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/10 text-sm'>{index + 1}</div>
                                        <span className='flex-1 text-sm'>{lessonItem.title}</span>
                                        <FaCheckCircle className={`h-4 w-4 ${lessonItem.slug === lessonSlug ? 'text-emerald-400' : 'text-gray-600'}`} />
                                    </Link>
                                ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='flex-1 pr-72 pl-72'>
                <div className='mx-auto max-w-4xl px-8 py-16'>
                    {/* Lesson Header */}
                    <div className='mb-12'>
                        <div className='mb-4 flex items-center gap-4 text-sm text-gray-400'>
                            <div className='flex items-center gap-2'>
                                <FaClock className='h-4 w-4' />
                                <span>15 min read</span>
                            </div>
                            <div className='flex items-center gap-2'>
                                <FaBookmark className='h-4 w-4' />
                                <span>
                                    Lesson {currentLessonIndex + 1} of {module.lessons.length}
                                </span>
                            </div>
                        </div>
                        <h1 className='font-outfit mb-4 text-6xl font-bold text-white'>{lesson.title}</h1>
                        {lesson.description && <p className='text-lg text-gray-400'>{lesson.description}</p>}
                    </div>

                    {/* Lesson Content */}

                    {lesson.content?.map((block, index) => (
                        <Blocks
                            key={index}
                            block={{
                                ...block,
                            }}
                        />
                    ))}

                    {/* Navigation */}
                    <div className='mt-12 flex items-center justify-between border-t border-white/10 pt-8'>
                        {prevLesson && (
                            <Link
                                href={`/learn/${courseSlug}/${prevLesson.slug}`}
                                className='group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-white'>
                                <FaArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
                                Previous Lesson
                            </Link>
                        )}
                        {nextLesson && (
                            <Link
                                href={`/learn/${courseSlug}/${nextLesson.slug}`}
                                className='group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-white'>
                                Next Lesson
                                <FaArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                            </Link>
                        )}
                    </div>

                    {/* Related Content */}
                    {lesson.relatedLessons && lesson.relatedLessons.length > 0 && (
                        <div className='mt-16'>
                            <h2 className='mb-4 text-2xl font-semibold'>Related Lessons</h2>
                            <div className='grid gap-4 md:grid-cols-2'>
                                {lesson.relatedLessons.map((related) => (
                                    <Link
                                        key={related._id}
                                        href={`/learn/${courseSlug}/${related.slug.current}`}
                                        className='rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5'>
                                        <h3 className='font-medium text-white'>{related.title}</h3>
                                        {related.description && <p className='mt-1 text-sm text-gray-400'>{related.description}</p>}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Sidebar - Table of Contents */}
            <div className='fixed top-0 right-0 h-screen w-72 border-l border-white/10 bg-black/50 backdrop-blur-xl'>
                <div className='h-full overflow-y-auto p-6'>
                    <div className='mb-6 flex items-center justify-between'>
                        <h3 className='text-sm font-semibold text-gray-400'>On this page</h3>
                        <button className='rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white'>
                            <FaNotesMedical className='h-4 w-4' />
                        </button>
                    </div>
                    <TableOfContents blocks={lesson.content as BlockProps[]} />
                </div>
            </div>
        </div>
    );
}

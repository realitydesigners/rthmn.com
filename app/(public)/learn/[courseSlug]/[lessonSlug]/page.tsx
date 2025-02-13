import { notFound } from 'next/navigation';
import Link from 'next/link';
import Blocks from '@/app/(public)/_components/blocks/Blocks';
import type { BlockProps } from '@/app/(public)/_components/blocks/Blocks';
import { TableOfContents } from '@/app/(public)/_components/TOC';
import { getCourse, getLesson } from '@/utils/sanity/lib/queries';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Background } from '@/app/(public)/_components/Background';

export const revalidate = 60;

interface PageProps {
    params: {
        courseSlug: string;
        lessonSlug: string;
    };
}

export default async function LessonPage({ params }: PageProps) {
    if (!params?.courseSlug || !params?.lessonSlug) {
        notFound();
    }

    const [course, lesson] = await Promise.all([getCourse(params.courseSlug), getLesson(params.lessonSlug)]);

    if (!course || !lesson) {
        notFound();
    }

    // Find the module that contains this lesson
    const module = course.modules.find((m) => m.lessons.some((l) => l.slug === params.lessonSlug));

    if (!module) {
        notFound();
    }

    // Find current lesson index and next/prev lessons
    const currentLessonIndex = module.lessons.findIndex((l) => l.slug === params.lessonSlug);
    const nextLesson = module.lessons[currentLessonIndex + 1];
    const prevLesson = module.lessons[currentLessonIndex - 1];

    return (
        <div className='relative flex'>
            {/* Main content */}
            <div className='flex-1 px-8 py-16'>
                <div className='w-full'>
                    <h1 className='font-outfit text-4xl font-bold text-white'>{lesson.title}</h1>
                    {lesson.description && <p className='mt-2 text-lg text-gray-400'>{lesson.description}</p>}

                    <div className='w-full bg-gray-800 p-8'>{lesson.content?.map((block, index) => <Blocks key={index} block={block as BlockProps} />)}</div>

                    <div className='mt-12 flex items-center justify-between border-t border-white/10 pt-8'>
                        {prevLesson && (
                            <Link
                                href={`/learn/${params.courseSlug}/${prevLesson.slug}`}
                                className='group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-white'>
                                <FaArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
                                Previous Lesson
                            </Link>
                        )}
                        {nextLesson && (
                            <Link
                                href={`/learn/${params.courseSlug}/${nextLesson.slug}`}
                                className='group flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-400 transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:text-white'>
                                Next Lesson
                                <FaArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                            </Link>
                        )}
                    </div>

                    {lesson.relatedLessons && lesson.relatedLessons.length > 0 && (
                        <div className='mt-16'>
                            <h2 className='mb-4 text-2xl font-semibold'>Related Lessons</h2>
                            <div className='grid gap-4 md:grid-cols-2'>
                                {lesson.relatedLessons.map((related) => (
                                    <Link
                                        key={related._id}
                                        href={`/learn/${params.courseSlug}/${related.slug.current}`}
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

            {/* Table of Contents - Fixed on right */}
            <div className='fixed top-0 right-0 h-screen w-72 border-l border-white/10 bg-black/50 backdrop-blur-xl'>
                <div className='h-full overflow-y-auto p-6'>
                    <TableOfContents blocks={lesson.content as BlockProps[]} />
                </div>
            </div>
        </div>
    );
}

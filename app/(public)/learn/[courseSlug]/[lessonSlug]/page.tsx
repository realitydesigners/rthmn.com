import { notFound } from 'next/navigation';
import Link from 'next/link';
import Blocks from '@/app/(public)/_components/blocks/Blocks';
import type { BlockProps } from '@/app/(public)/_components/blocks/Blocks';
import { TableOfContents } from '@/app/(public)/_components/TOC';
import { getCourse, getLesson } from '@/utils/sanity/lib/queries';

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

    return (
        <div className='bg-background min-h-screen'>
            <div className='container mx-auto px-4 py-16'>
                <div className='mb-8 space-y-2'>
                    <Link href={`/learn/${params.courseSlug}`} className='text-primary hover:underline'>
                        ← Back to {course.title}
                    </Link>
                    <p className='text-muted-foreground text-sm'>Module: {module.title}</p>
                </div>

                <div className='relative flex gap-8'>
                    <article className='flex-1'>
                        <div className='w-full'>{lesson.content?.map((block, index) => <Blocks key={index} block={block as BlockProps} />)}</div>

                        {lesson.relatedLessons && lesson.relatedLessons.length > 0 && (
                            <div className='mt-16'>
                                <h2 className='mb-4 text-2xl font-semibold'>Related Lessons</h2>
                                <div className='grid gap-4 md:grid-cols-2'>
                                    {lesson.relatedLessons.map((related) => (
                                        <Link
                                            key={related._id}
                                            href={`/learn/${params.courseSlug}/${related.slug.current}`}
                                            className='border-border hover:bg-accent rounded-lg border p-4'>
                                            <h3 className='font-medium'>{related.title}</h3>
                                            {related.description && <p className='text-muted-foreground mt-1 text-sm'>{related.description}</p>}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </article>

                    <TableOfContents blocks={lesson.content as BlockProps[]} />
                </div>
            </div>
        </div>
    );
}

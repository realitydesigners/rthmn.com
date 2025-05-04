import { TableOfContents } from '@/app/learn/_components/TOC';
import { CourseNav } from '../../_components/CourseNavigation';
import { MobileNavigation } from '../../_components/MobileNavigation';
import { getCourse, getLesson } from '@/lib/sanity/lib/queries';
import { notFound } from 'next/navigation';

export default async function LessonLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
    const resolvedParams = await params;
    const { courseSlug, lessonSlug } = resolvedParams;

    if (!courseSlug || !lessonSlug) {
        notFound();
    }

    const [course, lesson] = await Promise.all([getCourse(courseSlug), getLesson(lessonSlug)]);

    if (!course || !lesson) {
        notFound();
    }

    // Find the chapter that contains this lesson
    const currentChapter = course.chapters.find((chapter) => chapter.lessons.some((l) => l.slug === lessonSlug));

    if (!currentChapter) {
        notFound();
    }

    return (
        <div className='relative flex min-h-screen'>
            <CourseNav course={course} />
            <div className='w-full flex-1 lg:mr-80 lg:ml-80'>{children}</div>
            <TableOfContents blocks={lesson?.courseContent?.content || []} />
            <MobileNavigation course={course} lesson={lesson} chapter={currentChapter} />
        </div>
    );
}

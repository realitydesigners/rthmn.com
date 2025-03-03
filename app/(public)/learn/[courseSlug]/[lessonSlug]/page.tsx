import { notFound } from 'next/navigation';
import { getCourse, getLesson } from '@/lib/sanity/lib/queries';
import LessonClient from './client';

export const revalidate = 60;

export default async function LessonPage(props: {
    params: Promise<{
        courseSlug: string;
        lessonSlug: string;
    }>;
}) {
    const resolvedParams = await props.params;
    const { courseSlug, lessonSlug } = resolvedParams;

    if (!courseSlug || !lessonSlug) {
        notFound();
    }

    const [course, lesson] = await Promise.all([getCourse(courseSlug), getLesson(lessonSlug)]);

    if (!course || !lesson) {
        notFound();
    }

    // Find the chapter that contains this lesson
    const chapter = course.chapters.find((m) => m.lessons.some((l) => l.slug === lessonSlug));

    if (!chapter) {
        notFound();
    }

    return <LessonClient course={course} lesson={lesson} chapter={chapter} />;
}

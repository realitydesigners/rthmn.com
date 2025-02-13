import { notFound } from 'next/navigation';
import { getCourse } from '@/utils/sanity/lib/queries';
import CourseClient from './client';

export const revalidate = 60;

interface PageProps {
    params: {
        courseSlug: string;
    };
}

export default async function CoursePage({ params }: PageProps) {
    if (!params?.courseSlug) {
        console.log('Missing courseSlug parameter');
        notFound();
    }

    try {
        console.log('Fetching course with slug:', params.courseSlug);
        const course = await getCourse(params.courseSlug);
        console.log('Course data:', JSON.stringify(course, null, 2));

        if (!course) {
            console.log('Course not found for slug:', params.courseSlug);
            notFound();
        }

        return <CourseClient course={course} />;
    } catch (error) {
        console.error('Error fetching course:', error);
        notFound();
    }
}

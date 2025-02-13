import { getCourses } from '@/utils/sanity/lib/queries';
import { LearnPageClient } from './client';

export const revalidate = 60;

export default async function LearnPage() {
    const courses = await getCourses();
    return <LearnPageClient courses={courses} />;
}

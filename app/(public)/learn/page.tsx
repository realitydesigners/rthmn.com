import { getCourses } from '@/lib/sanity/lib/queries';
import { LearnPageClient } from './client';
import { sanityFetch } from '@/lib/sanity/lib/client';
import { Course } from '@/types/types';

export default async function LearnPage() {
    const courses = await sanityFetch<Course[]>({
        query: `*[_type == "course"] | order(order asc) {
            _id,
            title,
            description,
            slug,
            icon,
            difficulty,
            estimatedTime,
             "chapters": chapters[]-> {
                _id,
                title,
                description,
                "slug": slug.current,
                order,
                "lessons": lessons[]-> {
                    _id,
                    title,
                    description,
                    "slug": slug.current,
                    order
                } | order(order asc)
            } | order(order asc)
        }`,
        tags: ['course'],
        qParams: {},
    });

    return <LearnPageClient courses={courses} />;
}

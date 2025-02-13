import { getCourses } from '@/utils/sanity/lib/queries';
import { LearnPageClient } from './client';
import { sanityFetch } from '@/utils/sanity/lib/client';

interface Lesson {
    _id: string;
    title: string;
    description: string | null;
    slug: { current: string };
}

interface Module {
    _id: string;
    title: string;
    description: string | null;
    slug: { current: string };
    lessons: Lesson[];
}

interface Course {
    _id: string;
    title: string;
    description: string;
    slug: { current: string };
    icon: string;
    difficulty: string;
    estimatedTime: string;
    modules: Module[];
}

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
             "modules": modules[]-> {
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

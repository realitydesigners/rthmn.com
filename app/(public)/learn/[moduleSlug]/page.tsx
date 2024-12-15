import { getModule } from '@/utils/sanity/lib/queries';
import Link from 'next/link';

export const revalidate = 60;

interface PageProps {
    params: Promise<{
        moduleSlug: string;
    }>;
}

export default async function ModulePage({ params }: PageProps) {
    const { moduleSlug } = await params;
    const module = await getModule(moduleSlug);

    if (!module) {
        return <div>Module not found</div>;
    }

    return (
        <div className='container mx-auto px-4 py-16'>
            <div className='mb-8'>
                <Link href='/learn' className='text-primary hover:underline'>
                    ← Back to Guides
                </Link>
            </div>

            <h1 className='mb-4 text-4xl font-bold'>{module.title}</h1>
            <p className='text-muted-foreground mb-8'>{module.description}</p>

            <div className='space-y-4'>
                {module.lessons?.map((lesson) => (
                    <Link
                        key={lesson._id}
                        href={`/learn/${module.slug.current}/${lesson.slug.current}`}
                        className='bg-card hover:bg-accent border-border block rounded-lg border p-6'>
                        <h2 className='text-xl font-semibold'>{lesson.title}</h2>
                        {lesson.description && <p className='text-muted-foreground mt-2'>{lesson.description}</p>}
                    </Link>
                ))}
            </div>
        </div>
    );
}

import { getLesson, getModule } from '@/sanity/lib/queries';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';

export const revalidate = 60;

interface PageProps {
  params: Promise<{
    moduleSlug: string;
    lessonSlug: string;
  }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { moduleSlug, lessonSlug } = await params;
  const lesson = await getLesson(lessonSlug);
  const module = await getModule(moduleSlug);

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8 space-y-2">
        <Link href="/learn" className="text-primary hover:underline">
          ← Back to Guides
        </Link>
        {module && (
          <p className="text-muted-foreground text-sm">
            Module: {module.title}
          </p>
        )}
      </div>

      <article className="prose prose-invert max-w-none">
        <h1 className="mb-4 text-4xl font-bold">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-muted-foreground mb-8 text-xl">
            {lesson.description}
          </p>
        )}

        {lesson.content && <PortableText value={lesson.content} />}

        {lesson.relatedLessons && lesson.relatedLessons.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-4 text-2xl font-semibold">Related Lessons</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {lesson.relatedLessons.map((related) => (
                <Link
                  key={related._id}
                  href={`/learn/${module?.slug.current}/${related.slug.current}`}
                  className="border-border hover:bg-accent rounded-lg border p-4"
                >
                  <h3 className="font-medium">{related.title}</h3>
                  {related.description && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {related.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

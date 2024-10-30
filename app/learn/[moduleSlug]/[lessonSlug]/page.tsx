import { getLesson, getModule } from '@/sanity/lib/queries';
import Link from 'next/link';
import Blocks from '@/components/blocks/Blocks';
import type { BlockProps } from '@/components/blocks/Blocks';
import { TableOfContents } from '@/components/learn/TableOfContents';

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
    <div className="container px-4 py-16">
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

      <div className="flex gap-8">
        <article className="w-full">
          <div className="w-full bg-red-400">
            {lesson.content?.map((block, index) => (
              <Blocks key={index} block={block as BlockProps} />
            ))}
          </div>
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
        <TableOfContents blocks={lesson.content as BlockProps[]} />
      </div>
    </div>
  );
}

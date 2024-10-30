import { getModules } from '@/sanity/lib/queries';
import { PortableText } from '@portabletext/react';
import Link from 'next/link';

export const revalidate = 60;

interface Module {
  _id: string;
  title: string;
  description: string;
  slug: { current: string };
  lessons: {
    _id: string;
    title: string;
    description: string;
    slug: { current: string };
  }[];
}

export default async function LearnPage() {
  const modules = await getModules();

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <h1 className="mb-8 text-4xl font-bold">Guides and resources</h1>
        <p className="text-muted-foreground mb-12">
          Explore Rthmn and forex trading.
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules?.map((module: Module) => (
            <div
              key={module._id}
              className="bg-card border-border rounded-lg border p-6"
            >
              <h2 className="mb-4 text-2xl font-semibold">{module.title}</h2>
              {module.description && (
                <p className="text-muted-foreground mb-6">
                  {module.description}
                </p>
              )}

              <div className="space-y-3">
                {module.lessons?.map((lesson) => (
                  <Link
                    key={lesson._id}
                    href={`/learn/${module.slug.current}/${lesson.slug.current}`}
                    className="hover:bg-accent block rounded-md p-3 transition-colors"
                  >
                    <h3 className="font-medium">{lesson.title}</h3>
                    {lesson.description && (
                      <p className="text-muted-foreground mt-1 text-sm">
                        {lesson.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

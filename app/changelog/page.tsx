import { getChangeLog } from '@/sanity/lib/queries';
import { PortableText } from '@portabletext/react';
import { ChangelogTemplate } from '@/components/blocks/templates/ChangelogTemplate';
import { outfit, russo } from '@/fonts';

export const revalidate = 60;

function ChangelogCard({
  entry,
  isLast
}: {
  entry: {
    _id: string;
    title: string;
    description: string;
    version: string;
    releaseDate: string;
    type: string;
    content: any;
    status: string;
    contributors?: {
      _id: string;
      name: string;
      image?: {
        asset: {
          url: string;
        };
      };
    }[];
  };
  isLast: boolean;
}) {
  return (
    <div className="relative flex">
      {/* Timeline connector */}
      <div className="relative mr-4 w-6 flex-col items-center lg:mr-8">
        {/* Main vertical line */}
        <div className="absolute left-1/2 top-0 h-full w-[1px] -translate-x-1/2">
          <div className="h-full w-full bg-gray-900" />
        </div>

        {/* Top connector */}
        <div className="relative flex h-8 w-full items-center justify-center"></div>
        <div className="absolute left-2 top-[42px] z-0 h-[1px] w-8 bg-gray-800 lg:w-12" />
        {/* Dot */}
        <div className="relative z-10 flex h-6 w-6 items-center justify-center">
          <div className="absolute h-8 w-8 animate-ping rounded-full bg-gray-800/20" />
          <div className="absolute h-8 w-8 rounded-full border border-gray-800" />
          <div className="h-3 w-3 rounded-full bg-gray-700" />
        </div>

        {/* Bottom connector */}
        {!isLast && (
          <div className="relative z-[1] flex h-8 w-full items-center justify-center"></div>
        )}
      </div>

      {/* Card content */}
      <div className="relative z-[1000] mb-16 flex w-full flex-1 flex-col rounded-lg border border-gray-900 bg-gray-900/25 p-4 lg:p-8">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h2
            className={`text-outfit text-xl font-bold text-white md:text-2xl lg:text-3xl`}
          >
            {entry.title}
          </h2>
          <div className={`text-outfit flex flex-wrap items-center gap-4`}>
            <span className="text-sm text-gray-400">
              {new Date(entry.releaseDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-sm ${getStatusColor(
                entry.status
              )}`}
            >
              {entry.status}
            </span>
          </div>
        </div>
        <div className="mb-4 flex flex-wrap gap-4">
          <span
            className={`inline-block rounded-md px-3 py-1 text-sm ${getTypeColor(
              entry.type
            )}`}
          >
            {entry.type}
          </span>
          <span className="text-sm text-gray-400">Version {entry.version}</span>
        </div>
        <p className={`text-outfit mb-6 text-gray-400`}>{entry.description}</p>
        <div className="prose prose-invert max-w-none">
          <PortableText value={entry.content} components={ChangelogTemplate} />
        </div>
        {entry.contributors && entry.contributors.length > 0 && (
          <div className="mt-6 border-t border-gray-900 pt-4">
            <h3 className={`text-outfit mb-2 text-gray-400`}>Contributors:</h3>
            <div className="flex flex-wrap items-center gap-3">
              {entry.contributors.map((contributor) => (
                <div
                  key={contributor._id}
                  className="flex items-center gap-2 rounded-full bg-gray-600/50 px-3 py-1.5"
                >
                  {contributor.image?.asset?.url && (
                    <img
                      src={contributor.image.asset.url}
                      alt={contributor.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm text-gray-300">
                    {contributor.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default async function ChangelogPage() {
  const changelog = await getChangeLog();

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-4 md:px-8">
        <h1
          className={`${russo.className} my-12 text-center text-4xl text-white lg:text-5xl`}
        >
          Changelog
        </h1>
        <div className="relative mx-auto max-w-4xl md:pl-8">
          {changelog?.map((entry, index) => (
            <ChangelogCard
              key={entry._id}
              entry={entry}
              isLast={index === changelog.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'planned':
      return 'bg-blue-500/10 text-blue-400';
    case 'in-development':
      return 'bg-yellow-500/10 text-yellow-400';
    case 'released':
      return 'bg-green-500/10 text-green-400';
    default:
      return 'bg-gray-500/10 text-gray-400';
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'feature':
      return 'bg-purple-500/10 text-purple-400';
    case 'bugfix':
      return 'bg-red-500/10 text-red-400';
    case 'improvement':
      return 'bg-blue-500/10 text-blue-400';
    case 'breaking':
      return 'bg-orange-500/10 text-orange-400';
    default:
      return 'bg-gray-500/10 text-gray-400';
  }
}

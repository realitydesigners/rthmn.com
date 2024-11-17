'use client';
import { PortableText } from '@/components/PortableText';

interface Section {
  sectionTitle?: string;
  layout?: 'contained' | 'wide' | 'fullWidth';
  content: any;
  backgroundColor?: 'none' | 'dark' | 'light' | 'gradient';
}

interface PageData {
  title: string;
  sections: Section[];
}

export default function AboutClient({ page }: { page: PageData }) {
  return (
    <div className="flex flex-col">
      {page.sections?.map((section, index) => (
        <section
          key={index}
          className={` ${section.layout === 'contained' ? 'container mx-auto max-w-7xl' : ''} ${section.layout === 'wide' ? 'container mx-auto max-w-[90vw]' : ''} ${section.backgroundColor === 'dark' ? 'bg-black/50' : ''} ${section.backgroundColor === 'light' ? 'bg-white/5' : ''} ${
            section.backgroundColor === 'gradient'
              ? 'bg-gradient-to-b from-black/50 to-transparent'
              : ''
          } px-6 py-16`}
        >
          {section.sectionTitle && (
            <h2 className="mb-8 text-3xl font-bold text-white">
              {section.sectionTitle}
            </h2>
          )}
          <div className="prose prose-invert max-w-none">
            <PortableText value={section.content} />
          </div>
        </section>
      ))}
    </div>
  );
}

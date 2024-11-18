'use client';
import { BackgroundGrid } from '@/components/BackgroundGrid';
import { PortableText } from '@/components/PortableText';

interface PageData {
  title: string;
  sections: {
    sectionTitle: string;
    layout: 'contained' | 'wide' | 'fullWidth';
    content: any;
    backgroundColor: 'none' | 'dark' | 'light' | 'gradient';
  }[];
}

export default function PrivacyClient({ page }: { page: PageData }) {
  return (
    <BackgroundGrid>
      {page.sections?.map((section, index) => (
        <section
          key={index}
          className={` ${section.layout === 'contained' ? 'container mx-auto max-w-7xl' : ''} ${section.layout === 'wide' ? 'container mx-auto max-w-[90vw]' : ''} ${section.backgroundColor === 'dark' ? 'bg-black/50' : ''} ${section.backgroundColor === 'light' ? 'bg-white/5' : ''} ${
            section.backgroundColor === 'gradient'
              ? 'bg-gradient-to-b from-black/50 to-transparent'
              : ''
          } px-6 py-16`}
        >
          <div className="relative z-10">
            <PortableText value={section.content} template="about" />
          </div>
        </section>
      ))}
    </BackgroundGrid>
  );
}

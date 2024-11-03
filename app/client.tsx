'use client';

import { SectionFeatures } from '@/app/_components/SectionFeatures';
import { SectionPricing } from '@/app/_components/SectionPricing';
import { RyverSection } from '@/app/_components/SectionRyver';
import { FAQSection } from '@/app/_components/SectionFAQ';
import { ServiceSection } from '@/app/_components/SectionServices';
import { useAuth } from '@/providers/SupabaseProvider';
import { SectionBoxes } from '@/app/_components/SectionBoxes';
import { SectionBlogPosts } from '@/app/_components/SectionBlogPosts';
import { SectionFooter } from '@/app/_components/SectionFooter';
import { SectionHistogram } from '@/app/_components/SectionHistogram';
import { SectionAlgorithm } from '@/app/_components/SectionAlgorithm';
import { SectionAboutAlgorithm } from '@/app/_components/SectionAboutAlgorithm';

interface GridBackgroundProps {
  children: React.ReactNode;
  gridSize?: number;
}

interface ClientPageProps {
  posts: any[];
  products: any[] | null;
}

const GridBackground = ({ children, gridSize = 8 }: GridBackgroundProps) => {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 h-full w-full">
        {[...Array(gridSize + 1)].map((_, i) => (
          <div
            key={`grid-x-${i}`}
            className="absolute left-0 h-px w-full bg-white/5"
            style={{ top: `${(i * 100) / gridSize}%` }}
          />
        ))}
        {[...Array(gridSize + 1)].map((_, i) => (
          <div
            key={`grid-y-${i}`}
            className="absolute top-0 h-full w-px bg-white/5"
            style={{ left: `${(i * 100) / gridSize}%` }}
          />
        ))}
      </div>
      {children}
    </div>
  );
};

export default function ClientPage({ posts, products }: ClientPageProps) {
  const { session } = useAuth();

  return (
    <GridBackground>
      <SectionHistogram slice={null} />
      <SectionBoxes slice={null} />
      <SectionAboutAlgorithm />
      <SectionAlgorithm />
      <SectionBlogPosts initialPosts={posts} />
      <SectionPricing
        user={session?.user}
        products={products ?? []}
        subscription={null}
      />
      <SectionFooter />
    </GridBackground>
  );
}

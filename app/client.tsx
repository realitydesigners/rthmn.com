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
import { SectionAboutAlgorithm } from '@/app/_components/SectionAboutAlgorithm';
import { SectionMarketDisplay } from '@/app/_components/SectionMarketDisplay';

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface ClientPageProps {
  posts: any[];
  products: any[] | null;
  marketData: MarketData[];
}

const GridBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 h-full w-full">
        {[...Array(8 + 1)].map((_, i) => (
          <div
            key={`grid-x-${i}`}
            className="absolute left-0 h-px w-full bg-white/5"
            style={{ top: `${(i * 100) / 8}%` }}
          />
        ))}
        {[...Array(8 + 1)].map((_, i) => (
          <div
            key={`grid-y-${i}`}
            className="absolute top-0 h-full w-px bg-white/5"
            style={{ left: `${(i * 100) / 8}%` }}
          />
        ))}
      </div>
      {children}
    </div>
  );
};

export default function ClientPage({
  posts,
  products,
  marketData
}: ClientPageProps) {
  const { session } = useAuth();

  return (
    <GridBackground>
      <SectionHistogram slice={null} />
      <SectionMarketDisplay marketData={marketData} />
      <SectionBoxes slice={null} />
      <SectionAboutAlgorithm />
      <SectionPricing
        user={session?.user}
        products={products ?? []}
        subscription={null}
      />
      <SectionBlogPosts initialPosts={posts} />
      <SectionFooter />
    </GridBackground>
  );
}

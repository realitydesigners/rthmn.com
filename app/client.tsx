'use client';

import { SectionFeatures } from '@/components/SectionFeatures';
import { SectionPricing } from '@/components/SectionPricing';
import { RyverSection } from '@/components/SectionRyver';
import { FAQSection } from '@/components/SectionFAQ';
import { ServiceSection } from '@/components/SectionServices';
import { useAuth } from '@/providers/SupabaseProvider';
import { SectionBoxes } from '@/components/SectionBoxes';
import { SectionBlogPosts } from '@/components/SectionBlogPosts';
import { SectionFooter } from '@/components/SectionFooter';
import { SectionHistogram } from '@/components/SectionHistogram';
import { SectionAboutAlgorithm } from '@/components/SectionAboutAlgorithm';
import { SectionMarketDisplay } from '@/components/SectionMarketDisplay';
import { SectionMarketTicker } from '@/components/SectionMarketTicker';
import { SectionChart } from '@/components/SectionChart';

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
    <div className="relative min-h-screen overflow-y-hidden">
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
      <SectionMarketTicker marketData={marketData} />
      <SectionHistogram slice={null} />
      <SectionMarketDisplay marketData={marketData} />
      <SectionChart marketData={marketData} />
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

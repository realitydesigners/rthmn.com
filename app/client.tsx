'use client';
import { BackgroundGrid } from '@/components/BackgroundGrid';
import { SectionPricing } from '@/components/sections/SectionPricing';
import { SectionFAQ } from '@/components/sections/SectionFAQ';
import { ServiceSection } from '@/components/sections/SectionServices';
import { useAuth } from '@/providers/SupabaseProvider';
import { SectionBoxes } from '@/components/sections/SectionBoxes';
import { SectionBlogPosts } from '@/components/sections/SectionBlogPosts';
import { SectionFooter } from '@/components/sections/SectionFooter';
import { SectionHero } from '@/components/sections/SectionHero';
import { SectionAboutAlgorithm } from '@/components/sections/SectionAboutAlgorithm';
import { SectionMarketDisplay } from '@/components/sections/SectionMarketDisplay';
import { SectionMarketTicker } from '@/components/sections/SectionMarketTicker';
import { SectionRthmnDemo } from '@/components/sections/SectionRthmnDemo';
import { SectionHistogram } from '@/components/sections/SectionHistogram';

interface MarketData {
  pair: string;
  lastUpdated: string;
  candleData: string;
}

interface ClientPageProps {
  posts: any;
  products: any[];
  marketData: MarketData[];
}

export default function ClientPage({
  posts,
  products,
  marketData
}: ClientPageProps) {
  const { session } = useAuth();

  return (
    <BackgroundGrid>
      {/* <SectionMarketTicker marketData={marketData} /> */}
      <SectionHero marketData={marketData} />
      <SectionRthmnDemo marketData={marketData} />
      <SectionBoxes />
      <SectionAboutAlgorithm />
      <SectionPricing
        user={session?.user}
        products={products ?? []}
        subscription={null}
      />
      <SectionBlogPosts initialPosts={posts} />
      <SectionFAQ />
      <SectionMarketDisplay marketData={marketData} />
      <SectionFooter />
    </BackgroundGrid>
  );
}

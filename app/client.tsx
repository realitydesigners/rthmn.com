'use client';
import { BackgroundGrid } from '@/components/BackgroundGrid';
import { SectionPricing } from '@/components/Sections/SectionPricing';
import { SectionFAQ } from '@/components/Sections/SectionFAQ';
import { ServiceSection } from '@/components/Sections/SectionServices';
import { useAuth } from '@/providers/SupabaseProvider';
import { SectionBoxes } from '@/components/Sections/SectionBoxes';
import { SectionBlogPosts } from '@/components/Sections/SectionBlogPosts';
import { SectionFooter } from '@/components/Sections/SectionFooter';
import { SectionHero } from '@/components/Sections/SectionHero';
import { SectionAboutAlgorithm } from '@/components/Sections/SectionAboutAlgorithm';
import { SectionMarketDisplay } from '@/components/Sections/SectionMarketDisplay';
import { SectionMarketTicker } from '@/components/Sections/SectionMarketTicker';
import { SectionRthmnDemo } from '@/components/Sections/SectionRthmnDemo';
import { SectionHistogram } from '@/components/Sections/SectionHistogram';

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
      <SectionFAQ />
      <SectionPricing
        user={session?.user}
        products={products ?? []}
        subscription={null}
      />
      <SectionBlogPosts initialPosts={posts} />
      <SectionMarketDisplay marketData={marketData} />
      <SectionFooter />
    </BackgroundGrid>
  );
}

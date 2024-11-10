'use client';
import { BackgroundGrid } from '@/components/BackgroundGrid';
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

export default function ClientPage({
  posts,
  products,
  marketData
}: ClientPageProps) {
  const { session } = useAuth();

  return (
    <BackgroundGrid>
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
    </BackgroundGrid>
  );
}

'use client';
import { BackgroundGrid } from '@/components/BackgroundGrid';
import { SectionPricing } from '@/components/sections/SectionPricing';
import { useAuth } from '@/providers/SupabaseProvider';
import { SectionBlogPosts } from '@/components/sections/SectionBlogPosts';
import { SectionFooter } from '@/components/sections/SectionFooter';

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

export default function ClientPage({ posts, products }: ClientPageProps) {
  const { session } = useAuth();

  return (
    <BackgroundGrid>
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

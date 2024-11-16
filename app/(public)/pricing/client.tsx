'use client';
import { BackgroundGrid } from '@/components/BackgroundGrid';
import { SectionPricing } from '@/components/Sections/SectionPricing';
import { useAuth } from '@/providers/SupabaseProvider';
import { SectionBlogPosts } from '@/components/Sections/SectionBlogPosts';
import { SectionFooter } from '@/components/Sections/SectionFooter';

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

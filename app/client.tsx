'use client';

import { SectionHero } from '@/app/_components/SectionHero';
import { SectionFeatures } from '@/app/_components/SectionFeatures';
import { SectionPricing } from '@/app/_components/SectionPricing';
import { RyverSection } from '@/app/_components/SectionRyver';
import { FAQSection } from '@/app/_components/SectionFAQ';
import { ServiceSection } from '@/app/_components/SectionServices';
import { useAuth } from '@/providers/SupabaseProvider';
import { SectionBoxes } from '@/app/_components/SectionBoxes';
import { SectionBlogPosts } from '@/app/_components/SectionBlogPosts';
import { SectionFooter } from '@/app/_components/SectionFooter';

interface ClientPageProps {
  posts: any[];
  products: any[] | null;
}

export default function ClientPage({ posts, products }: ClientPageProps) {
  const { session } = useAuth();

  return (
    <div className="min-h-screen">
      <SectionHero />
      <SectionBoxes slice={null} isLoading={false} />
      <SectionBlogPosts initialPosts={posts} />
      <SectionPricing
        user={session?.user}
        products={products ?? []}
        subscription={null}
      />
      <SectionFooter />
    </div>
  );
}

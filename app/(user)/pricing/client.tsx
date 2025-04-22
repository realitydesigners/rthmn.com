'use client';

import { SectionPricing } from '@/components/Sections/SectionPricing';
import { useAuth } from '@/providers/SupabaseProvider';

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

    return <SectionPricing user={session?.user} products={products ?? []} subscription={null} />;
}

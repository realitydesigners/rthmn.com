import { SectionBoxes } from '@/components/Sections/SectionBoxes';
import { SectionRthmnDemo } from '@/components/Sections/SectionRthmnDemo';
import { sanityFetch } from '@/lib/sanity/lib/client';
import { groq } from 'next-sanity';

interface MarketData {
    pair: string;
    lastUpdated: string;
    candleData: string;
}

async function getMarketData(): Promise<MarketData[]> {
    const query = groq`
        *[_type == "marketData"] {
            pair,
            lastUpdated,
            candleData
        }
    `;

    return sanityFetch<MarketData[]>({
        query,
        tags: ['marketData'], // This helps with revalidation
    });
}

export default async function TestPage() {
    const marketData = await getMarketData();
    return (
        <div className='h-screen w-full overflow-y-auto'>
            <SectionRthmnDemo marketData={marketData} />
            {/* <SectionBoxes /> */}
        </div>
    );
}

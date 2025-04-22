import { SectionBoxes } from '@/components/Sections/SectionBoxes';
import { SectionHero } from '@/components/Sections/SectionHero';
import { SectionHistogram } from '@/components/Sections/SectionHistogram';
import { SectionMarketDisplay } from '@/components/Sections/SectionMarketDisplay';
import { SectionRthmnDemo } from '@/components/Sections/SectionRthmnDemo';
import { FAQBlock } from '@/components/PageBuilder/blocks/faqBlock';
import { sanityFetch } from '@/lib/sanity/lib/client';
import { groq } from 'next-sanity';
import { SectionCTA } from '@/components/Sections/SectionCTA';

// Define types for the data
interface MarketData {
    pair: string;
    lastUpdated: string;
    candleData: string;
}

interface FaqItem {
    _id: string; // Add _id or other necessary fields if needed by FAQBlock internal logic
    question: string;
    answer: any; // Or specific type for Portable Text if known
    category?: string;
    isPublished: boolean; // Make required
}

interface PageData {
    marketData: MarketData[];
    faqItems: FaqItem[];
}

// Fetch both datasets
async function getPageData(): Promise<PageData> {
    const marketDataQuery = groq`
        *[_type == "marketData"][0...8] | order(lastUpdated desc) [0...12] {
            pair,
            lastUpdated,
            candleData
        }
    `;
    const faqItemsQuery = groq`
        *[_type == "faq"] {
            _id, // Fetch _id if needed
            question,
            answer,
            category,
            isPublished
        }
    `;

    // Fetch in parallel (optional, but good practice)
    const [marketData, faqItems] = await Promise.all([
        sanityFetch<MarketData[]>({ query: marketDataQuery, tags: ['marketData'] }),
        sanityFetch<FaqItem[]>({ query: faqItemsQuery, tags: ['faqItem'] }),
    ]);

    return { marketData, faqItems };
}

export default async function TestPage() {
    // Fetch all page data
    const { marketData, faqItems } = await getPageData();

    return (
        <div className='h-full'>
            <SectionMarketDisplay marketData={marketData} />
            <SectionRthmnDemo marketData={marketData} />
            {/* <SectionBoxes /> */}
            {/* <SectionHistogram />
            <SectionHero marketData={marketData} />
  */}

            <FAQBlock items={faqItems} />
            <SectionCTA />
        </div>
    );
}

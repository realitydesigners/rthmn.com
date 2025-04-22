import { SectionBoxes } from '@/components/Sections/SectionBoxes';
import { SectionHero } from '@/components/Sections/SectionHero';
import { SectionHistogram } from '@/components/Sections/SectionHistogram';
import { SectionMarketDisplay } from '@/components/Sections/SectionMarketDisplay';
import { SectionRthmnDemo } from '@/components/Sections/SectionRthmnDemo';
import { FAQBlock } from '@/components/PageBuilder/blocks/faqBlock';
import { sanityFetch } from '@/lib/sanity/lib/client';
import { groq } from 'next-sanity';
import { SectionCTA } from '@/components/Sections/SectionCTA';
import { SectionPricing } from '@/components/Sections/SectionPricing';
// Imports needed for pricing data
import { createClient } from '@/lib/supabase/server';
import { getProducts } from '@/lib/supabase/queries';

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

// Assuming ProductWithPrice type exists or defining a basic structure
type ProductPrice = {
    id: string;
    unit_amount: number | null;
    currency: string | null;
    interval: string | null;
    type: string | null;
};
type Product = {
    id: string;
    name: string | null;
    description: string | null;
    prices: ProductPrice[];
};

interface PageData {
    marketData: MarketData[];
    faqItems: FaqItem[];
    products: Product[] | null; // Add products type
    user: any | null; // Add user type (use specific User type if available)
    // Subscription is likely fetched client-side or derived, passing null as per pricing/client.tsx
}

// Fetch all required datasets
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

    // Initialize Supabase server client
    const supabase = await createClient();

    // Fetch user session and products concurrently with Sanity data
    const [
        marketData,
        faqItems,
        products,
        {
            data: { user },
        },
    ] = await Promise.all([
        sanityFetch<MarketData[]>({ query: marketDataQuery, tags: ['marketData'] }),
        sanityFetch<FaqItem[]>({ query: faqItemsQuery, tags: ['faqItem'] }),
        getProducts(supabase), // Fetch products
        supabase.auth.getUser(), // Fetch user session
    ]);

    return { marketData, faqItems, products, user };
}

export default async function TestPage() {
    // Fetch all page data including user and products
    const { marketData, faqItems, products, user } = await getPageData();

    // Remove mock data definitions
    // const mockUser = null;
    // const mockSubscription = null;
    // const mockProducts = [ ... ];

    return (
        <div className='h-full'>
            <SectionMarketDisplay marketData={marketData} />
            <SectionRthmnDemo marketData={marketData} />
            {/* <SectionBoxes /> */}
            {/* <SectionHistogram />
            <SectionHero marketData={marketData} />
            */}
            {/* Pass fetched data to SectionPricing */}
            <SectionPricing
                user={user} // Pass fetched user
                products={products ?? []} // Pass fetched products (default to empty array)
                subscription={null} // Pass null for subscription as per client.tsx
            />

            <FAQBlock items={faqItems} />
            <SectionCTA />
        </div>
    );
}

import { Background } from "@/components/Background";
import { LineChart3D } from "@/components/Demo/LineChart3D";
import { SectionBoxes3D } from "@/components/Demo/SectionBoxes3D";
import { SectionInstrumentsPanel } from "@/components/Demo/SectionInstrumentsPanel";
import { FAQBlock } from "@/components/PageBuilder/blocks/faqBlock";
import { SectionBoxes } from "@/components/Sections/SectionBoxes";
import { SectionCTA } from "@/components/Sections/SectionCTA";
import { SectionHero } from "@/components/Sections/SectionHero";
import { SectionHistogram } from "@/components/Sections/SectionHistogram";
import { SectionMarketDisplay } from "@/components/Sections/SectionMarketDisplay";
import { SectionMarketTicker } from "@/components/Sections/SectionMarketTicker";
import { SectionPricing } from "@/components/Sections/SectionPricing";
import { SectionRthmnDemo } from "@/components/Sections/SectionRthmnDemo";
import { sanityFetch } from "@/lib/sanity/lib/client";
import { getProducts } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { groq } from "next-sanity";

// Fetch all required datasets
async function getPageData(): Promise<any> {
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

  const supabase = await createClient();

  const [
    marketData,
    faqItems,
    products,
    {
      data: { user },
    },
  ] = await Promise.all([
    sanityFetch({ query: marketDataQuery, tags: ["marketData"] }),
    sanityFetch({ query: faqItemsQuery, tags: ["faqItem"] }),
    getProducts(supabase),
    supabase.auth.getUser(),
  ]);

  return { marketData, faqItems, products, user };
}

export default async function Homepage() {
  const { marketData, faqItems, products, user } = await getPageData();

  // Remove mock data definitions
  // const mockUser = null;
  // const mockSubscription = null;
  // const mockProducts = [ ... ];

  return (
    <div className="h-full relative">
      {/* Dynamic background that changes with scroll */}
      {/* <Background /> */}

      <SectionBoxes3D />
      {/* <LineChart3D /> */}
      <SectionInstrumentsPanel />
      <SectionBoxes />
      {/* <SectionRthmnDemo marketData={marketData} /> */}
      {/* <SectionMarketDisplay marketData={marketData} />*/}
      {/* <SectionRthmnDemo marketData={marketData} />
			<SectionMarketTicker marketData={marketData} />
			<SectionBoxes />

			<SectionHistogram />
            <SectionHero marketData={marketData} />
            */}

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

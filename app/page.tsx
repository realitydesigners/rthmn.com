'use client';

import { HeroSection } from '@/app/_components/SectionHero';
import { FeaturesSection } from '@/app/_components/SectionFeatures';
import { SectionPricing } from '@/app/_components/SectionPricing';
import { RyverSection } from '@/app/_components/SectionRyver';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import { FAQSection } from '@/app/_components/SectionFAQ';
import { ServiceSection } from '@/app/_components/SectionServices';
import { useAuth } from '@/providers/SupabaseProvider';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function PricingPage() {
  const { session } = useAuth();
  const [products, setProducts] = useState<any[] | null>(null);
  const [subscription, setSubscription] = useState<any | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (session) {
      getProducts(supabase).then((result) => result && setProducts(result));
      getSubscription(supabase).then(setSubscription);
    }
  }, [session]);

  if (session === undefined) return <div>Loading...</div>;

  return (
    <div>
      <HeroSection />
      {/* <FeaturesSection />
			<FAQSection />
				<ServiceSection /> */}
      {/* <SectionPricing
        user={session.user}
        products={products ?? []}
        subscription={subscription}
      /> */}
      {/* <div className="h-screen"></div>
			<RyverSection />
			<div className="h-screen"></div> */}
      {session && (
        <div>
          <p>Welcome, {session.user.email}</p>
          {/* Add more user details as needed */}
        </div>
      )}
    </div>
  );
}

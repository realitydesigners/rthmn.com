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
import { getServerClient } from '@/utils/supabase/server';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';

export default function PricingPage() {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [products, setProducts] = useState<any[] | null>(null);
  const [subscription, setSubscription] = useState<any | null>(null);

  useEffect(() => {
    if (session) {
      getProducts(supabase).then((result) => result && setProducts(result));
      getSubscription(supabase).then(setSubscription);
    }
  }, [session, supabase]);

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

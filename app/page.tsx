import { HeroSection } from '@/app/_components/SectionHero';
import { FeaturesSection } from '@/app/_components/SectionFeatures';
import { PricingSection } from '@/app/_components/SectionPricing';
import { RyverSection } from '@/app/_components/SectionRyver';
import {
  getProducts,
  getSubscription,
  getUser
} from '@/utils/supabase/queries';
import { FAQSection } from '@/app/_components/SectionFAQ';
import { ServiceSection } from '@/app/_components/SectionServices';
import { getServerClient } from '@/utils/supabase/server';
import { AuthStatus } from '@/components/AuthStatus';

export default async function PricingPage() {
  const supabase = getServerClient();
  const [user, products, subscription] = await Promise.all([
    getUser(supabase),
    getProducts(supabase),
    getSubscription(supabase)
  ]);

  console.log(
    'Main page - User state:',
    user ? 'Authenticated' : 'Not authenticated'
  );

  return (
    <div>
      <AuthStatus />
      <HeroSection />
      {/* <FeaturesSection />
			<FAQSection />
			<ServiceSection /> */}
      {/* <PricingSection
        user={user}
        products={products ?? []}
        subscription={subscription}
      /> */}
      {/* <div className="h-screen"></div>
			<RyverSection />
			<div className="h-screen"></div> */}
      {user && (
        <div>
          <p>Welcome, {user.email}</p>
          {/* Add more user details as needed */}
        </div>
      )}
    </div>
  );
}

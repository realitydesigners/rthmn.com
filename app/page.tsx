import { HeroSection } from "@/components/Hero/HeroSection";
import { PricingSection } from "@/components/PricingSection";
import {
	getProducts,
	getSubscription,
	getUser,
} from "@/utils/supabase/queries";
import { createClient } from "@/utils/supabase/server";
import { FAQSection } from "@/components/FAQSection";
import { ServiceSection } from "@/components/ServiceSection";

export default async function PricingPage() {
	const supabase = createClient();
	const [user, products, subscription] = await Promise.all([
		getUser(supabase),
		getProducts(supabase),
		getSubscription(supabase),
	]);

	return (
		<div>
			<HeroSection />
			<FAQSection />
			<ServiceSection />
			<PricingSection
				user={user}
				products={products ?? []}
				subscription={subscription}
			/>
		</div>
	);
}

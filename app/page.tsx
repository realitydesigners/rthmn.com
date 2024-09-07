import { HeroSection } from "@/components/HeroSection";
import Pricing from "@/components/PricingSection";
import {
	getProducts,
	getSubscription,
	getUser,
} from "@/utils/supabase/queries";
import { createClient } from "@/utils/supabase/server";
import { FAQSection } from "@/components/FAQSection";

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
			<Pricing
				user={user}
				products={products ?? []}
				subscription={subscription}
			/>
		</div>
	);
}

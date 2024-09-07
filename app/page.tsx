import Hero from "@/components/Hero";
import Pricing from "@/components/ui/Pricing/Pricing";
import {
	getProducts,
	getSubscription,
	getUser,
} from "@/utils/supabase/queries";
import { createClient } from "@/utils/supabase/server";

export default async function PricingPage() {
	const supabase = createClient();
	const [user, products, subscription] = await Promise.all([
		getUser(supabase),
		getProducts(supabase),
		getSubscription(supabase),
	]);

	return (
		<div>
			<Hero />

			<Pricing
				user={user}
				products={products ?? []}
				subscription={subscription}
			/>
		</div>
	);
}

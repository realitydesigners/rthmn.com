import { type Stripe, loadStripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;
let stripeLegacyPromise: Promise<Stripe | null>;

export const getStripe = (isLegacy: boolean = false): Promise<Stripe | null> => {
	if (isLegacy) {
		if (!stripeLegacyPromise) {
			stripeLegacyPromise = loadStripe(
				process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LEGACY ?? "",
			);
		}
		return stripeLegacyPromise;
	}

	if (!stripePromise) {
		stripePromise = loadStripe(
			process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ??
				process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
				"",
		);
	}

	return stripePromise;
};

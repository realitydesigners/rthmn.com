import Stripe from "stripe";

// New Stripe instance (primary)
export const stripe = new Stripe(
	process.env.STRIPE_SECRET_KEY_LIVE ?? process.env.STRIPE_SECRET_KEY ?? "",
	{
		// https://github.com/stripe/stripe-node#configuration
		// https://stripe.com/docs/api/versioning
		// @ts-ignore
		apiVersion: null,
		// Register this as an official Stripe plugin.
		// https://stripe.com/docs/building-plugins#setappinfo
		appInfo: {
			name: "RTHMN Trading Platform",
			version: "2.0.0",
			url: "https://rthmn.com",
		},
	},
);

// Legacy Stripe instance (for backwards compatibility with existing subscribers)
export const stripeLegacy = new Stripe(
	process.env.STRIPE_SECRET_KEY_LEGACY ?? "",
	{
		// @ts-ignore
		apiVersion: null,
		appInfo: {
			name: "RTHMN Trading Platform",
			version: "1.0.0",
			url: "https://rthmn.com",
		},
	},
);

// Helper function to get the right Stripe instance
export const getStripeInstance = (isLegacy: boolean = false): Stripe => {
	return isLegacy ? stripeLegacy : stripe;
};

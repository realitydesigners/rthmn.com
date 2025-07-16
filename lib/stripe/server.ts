"use server";

import { getStripeInstance } from "@/lib/stripe/config";
import { createOrRetrieveCustomer, isLegacyUser } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
	calculateTrialEndUnixTimestamp,
	getErrorRedirect,
	getURL,
} from "@/utils/helpers";
import type Stripe from "stripe";

type Price = any;

type CheckoutResponse = {
	errorRedirect?: string;
	sessionId?: string;
};

export async function checkoutWithStripe(
	price: Price,
	isSubscription: boolean,
	successPath: string,
	cancelPath: string,
): Promise<CheckoutResponse> {
	try {
		const supabase = await createClient();

		const {
			error,
			data: { user },
		} = await supabase.auth.getUser();

		if (error || !user) {
			console.error(error);
			return {
				errorRedirect: getErrorRedirect(
					cancelPath,
					"Auth error",
					"Please log in and try again.",
				),
			};
		}

		// Determine if this is a legacy user
		const isLegacy = await isLegacyUser(user.id);
		const stripeInstance = getStripeInstance(isLegacy);

		// Retrieve or create the customer in Stripe
		let customer: string;
		try {
			customer = await createOrRetrieveCustomer({
				uuid: user?.id || "",
				email: user?.email || "",
			});
		} catch (err) {
			console.error(err);
			throw new Error("Unable to access customer record.");
		}

		let params: Stripe.Checkout.SessionCreateParams = {
			allow_promotion_codes: true,
			billing_address_collection: "required",
			customer,
			customer_update: {
				address: "auto",
			},
			line_items: [
				{
					price: price.id,
					quantity: 1,
				},
			],
			cancel_url: getURL(),
			success_url: getURL(successPath),
		};

		console.log(
			"Trial end:",
			calculateTrialEndUnixTimestamp(price.trial_period_days),
		);
		if (price.type === "recurring") {
			params = {
				...params,
				mode: "subscription",
				subscription_data: {
					trial_end: calculateTrialEndUnixTimestamp(price.trial_period_days),
				},
			};
		} else if (price.type === "one_time") {
			params = {
				...params,
				mode: "payment",
			};
		}

		// Create a checkout session in Stripe
		let session;
		try {
			session = await stripeInstance.checkout.sessions.create(params);
		} catch (err) {
			console.error(err);
			throw new Error("Unable to create checkout session.");
		}

		// Instead of returning a Response, just return the data or error.
		if (session) {
			return { sessionId: session.id };
		} else {
			throw new Error("Unable to create checkout session.");
		}
	} catch (e) {
		console.error(e);
		return {
			errorRedirect: getErrorRedirect(
				cancelPath,
				"Unexpected error",
				"Please try again later.",
			),
		};
	}
}

export async function createStripePortal(currentPath: string) {
	try {
		// Use the singleton Supabase client
		const supabase = await createClient();
		const {
			error,
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			if (error) {
				console.error(error);
			}
			throw new Error("Could not get user session.");
		}

		// Determine if this is a legacy user
		const isLegacy = await isLegacyUser(user.id);
		const stripeInstance = getStripeInstance(isLegacy);

		let customer;
		try {
			customer = await createOrRetrieveCustomer({
				uuid: user.id || "",
				email: user.email || "",
			});
		} catch (err) {
			console.error(err);
			throw new Error("Unable to access customer record.");
		}

		if (!customer) {
			throw new Error("Could not get customer.");
		}

		try {
			const { url } = await stripeInstance.billingPortal.sessions.create({
				customer,
				return_url: getURL("/account"),
			});
			if (!url) {
				throw new Error("Could not create billing portal");
			}
			return url;
		} catch (err) {
			console.error(err);
			throw new Error("Could not create billing portal");
		}
	} catch (error) {
		if (error instanceof Error) {
			console.error(error);
			return getErrorRedirect(
				currentPath,
				error.message,
				"Please try again later or contact a system administrator.",
			);
		} else {
			return getErrorRedirect(
				currentPath,
				"An unknown error occurred.",
				"Please try again later or contact a system administrator.",
			);
		}
	}
}

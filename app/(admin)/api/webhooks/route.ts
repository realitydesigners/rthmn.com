import { manageDiscordAccess } from "@/lib/discord/server";
import { stripe, stripeLegacy } from "@/lib/stripe/config";
import {
	deleteProductRecord,
	manageSubscriptionStatusChange,
	upsertPriceRecord,
	upsertProductRecord,
} from "@/lib/supabase/admin";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const relevantEvents = new Set([
	"product.created",
	"product.updated",
	"product.deleted",
	"price.created",
	"price.updated",
	"checkout.session.completed",
	"customer.subscription.created",
	"customer.subscription.updated",
	"customer.subscription.deleted",
	"billing_portal.session.created",
]);

export async function POST(request: Request) {
	const headersList = await headers();
	const signature = headersList.get("stripe-signature");
	const body = await request.text();
	
	let event: Stripe.Event;
	let stripeInstance: Stripe;
	let isLegacyEvent = false;

	// Try to construct event with primary webhook secret first
	try {
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET;
		event = stripe.webhooks.constructEvent(body, signature!, webhookSecret!);
		stripeInstance = stripe;
	} catch (err: any) {
		// If primary fails, try legacy webhook secret
		try {
			const legacyWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LEGACY;
			if (!legacyWebhookSecret) {
				throw new Error("Legacy webhook secret not configured");
			}
			event = stripeLegacy.webhooks.constructEvent(body, signature!, legacyWebhookSecret);
			stripeInstance = stripeLegacy;
			isLegacyEvent = true;
			console.log("✅ Processing legacy Stripe webhook event");
		} catch (legacyErr: any) {
			console.log(`❌ Error message: ${legacyErr.message}`);
			return new NextResponse(`Webhook Error: ${legacyErr.message}`, { status: 400 });
		}
	}

	if (relevantEvents.has(event.type)) {
		try {
			switch (event.type) {
				case "product.created":
				case "product.updated":
					await upsertProductRecord(event.data.object as Stripe.Product);
					break;
				case "product.deleted":
					await deleteProductRecord(event.data.object as Stripe.Product);
					break;
				case "price.created":
				case "price.updated":
					await upsertPriceRecord(event.data.object as Stripe.Price);
					break;
				case "customer.subscription.created":
				case "customer.subscription.updated":
				case "customer.subscription.deleted":
					const subscription = event.data.object as Stripe.Subscription;
					const isActive =
						event.type !== "customer.subscription.deleted" &&
						subscription.status === "active";

					await manageSubscriptionStatusChange(
						subscription.id,
						subscription.customer as string,
						event.type === "customer.subscription.created",
						stripeInstance,
					);

					// Manage Discord access
					await manageDiscordAccess(subscription.customer as string, isActive);
					break;
				case "checkout.session.completed":
					const checkoutSession = event.data.object as Stripe.Checkout.Session;
					if (checkoutSession.mode === "subscription") {
						const subscriptionId = checkoutSession.subscription;
						await manageSubscriptionStatusChange(
							subscriptionId as string,
							checkoutSession.customer as string,
							true,
							stripeInstance,
						);

						// Add Discord access for new subscribers
						await manageDiscordAccess(checkoutSession.customer as string, true);
					}
					break;
				case "billing_portal.session.created":
					const portalSession = event.data
						.object as Stripe.BillingPortal.Session;
					console.log("Billing portal session created:", portalSession.id);
					break;
				default:
					throw new Error("Unhandled relevant event!");
			}
		} catch (error) {
			console.log(error);
			return new NextResponse(
				'Webhook error: "Webhook handler failed. View logs."',
				{ status: 400 },
			);
		}
	}

	return NextResponse.json({ received: true }, { status: 200 });
}

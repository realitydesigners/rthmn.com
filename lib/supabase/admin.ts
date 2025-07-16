import { toDateTime } from "@/utils/helpers";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
	apiVersion: "2025-02-24.acacia",
	appInfo: {
		name: "ai2saas",
		version: "0.1.0",
	},
});

// Legacy Stripe instance for backwards compatibility
const stripeLegacy = new Stripe(process.env.STRIPE_SECRET_KEY_LEGACY ?? "", {
	apiVersion: "2025-02-24.acacia",
	appInfo: {
		name: "ai2saas",
		version: "0.1.0",
	},
});

export const supabaseAdmin = createClient<any>(
	process.env.NEXT_PUBLIC_SUPABASE_URL || "",
	process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

// Helper function to get the right Stripe instance
const getStripeInstance = (isLegacy: boolean = false): Stripe => {
	return isLegacy ? stripeLegacy : stripe;
};

const isLegacyUser = async (userId: string): Promise<boolean> => {
	// First check the customers table (most reliable source)
	const { data: customerData } = await supabaseAdmin
		.from("customers")
		.select("stripe_account_type")
		.eq("id", userId)
		.single();
	
	if (customerData?.stripe_account_type) {
		return customerData.stripe_account_type === 'legacy';
	}
	
	// Fallback to users table
	const { data: userData } = await supabaseAdmin
		.from("users")
		.select("stripe_account_type")
		.eq("id", userId)
		.single();
	
	if (userData?.stripe_account_type) {
		return userData.stripe_account_type === 'legacy';
	}
	
	// Default: new users are 'new' account type
	return false;
};

const upsertProductRecord = async (product: Stripe.Product) => {
	const productData = {
		id: product.id,
		active: product.active,
		name: product.name,
		description: product.description ?? undefined,
		image: product.images?.[0] ?? null,
		metadata: product.metadata,
	};

	const { error } = await supabaseAdmin.from("products").upsert([productData]);
	if (error) throw error;
	console.log(`Product inserted/updated: ${product.id}`);
};

const upsertPriceRecord = async (price: Stripe.Price) => {
	const priceData = {
		id: price.id,
		product_id: typeof price.product === "string" ? price.product : "",
		active: price.active,
		currency: price.currency,
		description: price.nickname ?? undefined,
		type: price.type,
		unit_amount: price.unit_amount ?? undefined,
		interval: price.recurring?.interval,
		interval_count: price.recurring?.interval_count,
		trial_period_days: price.recurring?.trial_period_days,
		metadata: price.metadata,
	};

	const { error } = await supabaseAdmin.from("prices").upsert([priceData]);
	if (error) throw error;
	console.log(`Price inserted/updated: ${price.id}`);
};

export const deleteProductRecord = async (product: Stripe.Product) => {
	const { error } = await supabaseAdmin
		.from("products")
		.update({ active: false })
		.eq("id", product.id);

	if (error) {
		throw error;
	}
	console.log(`Product ${product.id} marked as inactive`);
};
const createOrRetrieveCustomer = async ({
	email,
	uuid,
}: { email: string; uuid: string }) => {
	const { data, error } = await supabaseAdmin
		.from("customers")
		.select("stripe_customer_id, stripe_account_type")
		.eq("id", uuid)
		.single();
	
	if (error || !data?.stripe_customer_id) {
		// Determine if this is a legacy user
		const isLegacy = await isLegacyUser(uuid);
		const stripeInstance = getStripeInstance(isLegacy);
		
		const customerData: { metadata: { supabaseUUID: string }; email?: string } =
			{
				metadata: {
					supabaseUUID: uuid,
				},
			};
		if (email) customerData.email = email;
		
		const customer = await stripeInstance.customers.create(customerData);
		const { error: supabaseError } = await supabaseAdmin
			.from("customers")
			.insert([{ 
				id: uuid, 
				stripe_customer_id: customer.id,
				stripe_account_type: isLegacy ? 'legacy' : 'new'
			}]);
		if (supabaseError) throw supabaseError;
		console.log(`New customer created and inserted for ${uuid} (${isLegacy ? 'legacy' : 'new'} account).`);
		return customer.id;
	}
	return data.stripe_customer_id;
};

const copyBillingDetailsToCustomer = async (
	uuid: string,
	payment_method: Stripe.PaymentMethod,
	stripeInstance?: Stripe,
) => {
	//Todo: check this assertion
	const customer = payment_method.customer as string;
	const { name, phone, address } = payment_method.billing_details;
	if (!name || !phone || !address) return;
	
	// Determine which stripe instance to use
	const isLegacy = await isLegacyUser(uuid);
	const stripeToUse = stripeInstance || getStripeInstance(isLegacy);
	
	//@ts-ignore
	await stripeToUse.customers.update(customer, { name, phone, address });
	const { error } = await supabaseAdmin
		.from("users")
		.update({
			billing_address: { ...address },
			payment_method: { ...payment_method[payment_method.type] },
		})
		.eq("id", uuid);
	if (error) throw error;
};

const manageSubscriptionStatusChange = async (
	subscriptionId: string,
	customerId: string,
	createAction = false,
	stripeInstance?: Stripe,
) => {
	// Get customer's UUID from mapping table.
	const { data: customerData, error: noCustomerError } = await supabaseAdmin
		.from("customers")
		.select("id, stripe_account_type")
		.eq("stripe_customer_id", customerId)
		.single();
	if (noCustomerError) throw noCustomerError;

	const { id: uuid, stripe_account_type } = customerData!;

	// Use the passed stripe instance or determine from account type
	const stripeToUse = stripeInstance || getStripeInstance(stripe_account_type === 'legacy');

	const subscription = await stripeToUse.subscriptions.retrieve(subscriptionId, {
		expand: ["default_payment_method"],
	});
	// Upsert the latest status of the subscription object.
	const subscriptionData: {
		id: string;
		user_id: string;
		metadata: Stripe.Metadata | null;
		// Add other properties as needed
	} = {
		id: subscription.id,
		user_id: uuid,
		metadata: subscription.metadata,
		// @ts-ignore
		status: subscription.status,
		price_id: subscription.items.data[0].price.id,
		//TODO check quantity on subscription
		// @ts-ignore
		quantity: subscription.quantity,
		cancel_at_period_end: subscription.cancel_at_period_end,
		cancel_at: subscription.cancel_at
			? toDateTime(subscription.cancel_at).toISOString()
			: null,
		canceled_at: subscription.canceled_at
			? toDateTime(subscription.canceled_at).toISOString()
			: null,
		current_period_start: toDateTime(
			subscription.current_period_start,
		).toISOString(),
		current_period_end: toDateTime(
			subscription.current_period_end,
		).toISOString(),
		created: toDateTime(subscription.created).toISOString(),
		ended_at: subscription.ended_at
			? toDateTime(subscription.ended_at).toISOString()
			: null,
		trial_start: subscription.trial_start
			? toDateTime(subscription.trial_start).toISOString()
			: null,
		trial_end: subscription.trial_end
			? toDateTime(subscription.trial_end).toISOString()
			: null,
	};

	const { error } = await supabaseAdmin
		.from("subscriptions")
		.upsert([subscriptionData]);
	if (error) throw error;
	console.log(
		`Inserted/updated subscription [${subscription.id}] for user [${uuid}]`,
	);

	// For a new subscription copy the billing details to the customer object.
	// NOTE: This is a costly operation and should happen at the very end.
	if (createAction && subscription.default_payment_method && uuid)
		//@ts-ignore
		await copyBillingDetailsToCustomer(
			uuid,
			subscription.default_payment_method as Stripe.PaymentMethod,
			stripeToUse,
		);
};

export {
	upsertProductRecord,
	upsertPriceRecord,
	createOrRetrieveCustomer,
	manageSubscriptionStatusChange,
	isLegacyUser,
};

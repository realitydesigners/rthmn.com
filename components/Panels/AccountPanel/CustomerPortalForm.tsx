"use client";

import { createStripePortal } from "@/lib/stripe/server";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FaStripe } from "react-icons/fa";
import { LuCreditCard } from "react-icons/lu";

type Subscription = any;
type Price = any;
type Product = any;

type SubscriptionWithPriceAndProduct = Subscription & {
	prices: Price;
};

interface Props {
	subscription: SubscriptionWithPriceAndProduct | null;
}

export default function CustomerPortalForm({ subscription }: Props) {
	const router = useRouter();
	const currentPath = usePathname();
	const [isSubmitting, setIsSubmitting] = useState(false);

	const subscriptionPrice =
		subscription?.prices &&
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: subscription.prices.currency!,
			minimumFractionDigits: 0,
		}).format((subscription.prices.unit_amount || 0) / 100);

	const handleStripePortalRequest = async () => {
		setIsSubmitting(true);
		const redirectUrl = await createStripePortal(currentPath);
		setIsSubmitting(false);
		return router.push(redirectUrl);
	};

	return (
		<div>
			<div className="flex items-center gap-3">
				<div className="flex-shrink-0 rounded-md bg-white/5 p-2">
					<LuCreditCard className="h-4 w-4 text-white" />
				</div>
				<div className="min-w-0">
					<h3 className="font-outfit text-base font-semibold text-white">
						{subscription?.prices
							? `${subscription.prices.name || "Pro"} Plan`
							: "No active subscription"}
					</h3>
					<p className="font-outfit text-xs text-zinc-400">
						{subscription
							? `${subscriptionPrice}/${subscription.prices.interval}`
							: "Choose a plan to get started"}
					</p>
				</div>
			</div>

			<div className="mt-3 pl-9">
				{!subscription ? (
					<Link
						href="/pricing"
						className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#22c55e] to-[#16a34a] px-4 py-2 text-sm text-white transition-all duration-200 hover:from-[#16a34a] hover:to-[#15803d]"
					>
						Choose Plan
					</Link>
				) : (
					<button
						onClick={handleStripePortalRequest}
						disabled={isSubmitting}
						className="flex w-auto items-center justify-center gap-2 rounded-full bg-white/5 px-4 py-2 text-white transition-all duration-200 hover:bg-white/10 disabled:opacity-50"
					>
						<LuCreditCard className="h-4 w-4 text-white" />
						<span className="font-outfit text-sm">
							{isSubmitting ? "Loading..." : "Manage Plan"}
						</span>
					</button>
				)}
			</div>
		</div>
	);
}

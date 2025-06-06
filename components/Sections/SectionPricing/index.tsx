"use client";

import { StartButton } from "@/components/Sections/StartNowButton";
import { getStripe } from "@/lib/stripe/client";
import { checkoutWithStripe } from "@/lib/stripe/server";
import { getErrorRedirect } from "@/utils/helpers";
import type { User } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { memo, useEffect, useState } from "react";
import { FaArrowRight, FaCheck } from "react-icons/fa";
import { useInView } from "react-intersection-observer";

type Subscription = any;
type Product = any;
type Price = any;
interface ProductWithPrices extends Product {
	prices: Price[];
}
interface PriceWithProduct extends Price {
	products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
	prices: PriceWithProduct | null;
}

interface Props {
	user: User | null | undefined;
	products: ProductWithPrices[];
	subscription: SubscriptionWithProduct | null;
}

const StarField = () => {
	const [mounted, setMounted] = useState(false);
	const [stars, setStars] = useState<
		Array<{
			id: number;
			x: number;
			y: number;
			size: number;
			duration: number;
			delay: number;
		}>
	>([]);

	useEffect(() => {
		const generateStars = () => {
			const newStars = Array.from({ length: 50 }, (_, i) => ({
				id: i,
				x: Math.random() * window.innerWidth,
				y: Math.random() * window.innerHeight,
				size: 1 + Math.random() * 2,
				duration: 15 + Math.random() * 20,
				delay: Math.random() * -15,
			}));
			setStars(newStars);
		};

		generateStars();
		setMounted(true);

		const handleResize = () => {
			generateStars();
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	if (!mounted) return null;

	return (
		<div className="absolute inset-0 overflow-hidden">
			{stars.map((star) => (
				<motion.div
					key={star.id}
					initial={{ opacity: 0.1, x: star.x, y: star.y }}
					animate={{ opacity: [0.1, 0.5, 0.1], y: [star.y, -100] }}
					transition={{
						duration: star.duration,
						repeat: Number.POSITIVE_INFINITY,
						delay: star.delay,
					}}
					className="absolute"
				>
					<div
						style={{ width: `${star.size}px`, height: `${star.size}px` }}
						className="rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
					/>
				</motion.div>
			))}
		</div>
	);
};

const PricingBenefits = [
	{
		title: "Real-time Pattern Recognition",
		description:
			"Instantly identify trading patterns as they form in the market",
	},
	{
		title: "Advanced Pattern Detection",
		description: "Leverage AI to spot complex trading opportunities",
	},
	{
		title: "Real-time Market Analysis",
		description: "Get deep insights into market movements and trends",
	},
	{
		title: "Premium Discord Access",
		description: "Join an exclusive community of professional traders",
	},
	{
		title: "Trading Indicators",
		description: "Access our suite of proprietary trading indicators",
	},
	{
		title: "Early Access Features",
		description: "Be the first to try new trading tools and features",
	},
];

// Decorative Corner Element Component
const CornerElement = ({
	position,
	delay = 0,
}: { position: string; delay?: number }) => {
	const baseClasses = "absolute w-6 h-6 border-neutral-700/50";
	const positionClasses = {
		"top-left": "-top-4 -left-4 border-t border-l",
		"top-right": "-top-4 -right-4 border-t border-r",
		"bottom-left": "-bottom-4 -left-4 border-b border-l",
		"bottom-right": "-bottom-4 -right-4 border-b border-r",
	};
	return (
		<motion.div
			className={`${baseClasses} ${positionClasses[position]}`}
			initial={{ opacity: 0, scale: 0.5 }}
			whileInView={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.4, delay: delay + 0.6, ease: "easeOut" }}
		/>
	);
};

const BenefitsList = memo(
	({ benefits }: { benefits: typeof PricingBenefits }) => (
		<div className="grid gap-4 lg:grid-cols-2">
			{benefits.map((benefit, index) => (
				<div
					key={benefit.title}
					className="group relative overflow-hidden rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4 transition-all duration-300 hover:border-[#24FF66]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
				>
					<div className="pointer-events-none absolute inset-px rounded-xl bg-gradient-to-b from-white/[0.02] via-transparent to-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
					
					{/* Top highlight */}
					<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />
					
					{/* Hover glow effect */}
					<div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#24FF66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
					
					<div className="relative flex gap-3">
						<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30 shadow-lg shadow-[#24FF66]/[0.15]">
							<FaCheck className="h-3.5 w-3.5 text-[#24FF66]" />
						</div>
						<div>
							<h3 className="font-russo text-base font-semibold text-white group-hover:text-[#24FF66] transition-colors duration-300">
								{benefit.title}
							</h3>
							<p className="font-kodemono mt-1 text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300">
								{benefit.description}
							</p>
						</div>
					</div>
					
					{/* Bottom accent line */}
					<div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-[#24FF66] to-transparent group-hover:w-full transition-all duration-500" />
				</div>
			))}
		</div>
	),
);

BenefitsList.displayName = "BenefitsList";

export function SectionPricing({ user, products, subscription }: Props) {
	const router = useRouter();
	const [priceIdLoading, setPriceIdLoading] = useState<string>();
	const currentPath = usePathname();

	const product = products[0];
	const price = product?.prices?.[0];

	const handleStripeCheckout = async () => {
		setPriceIdLoading(price.id);

		try {
			if (!user) {
				return router.push("/signin");
			}

			const { errorRedirect, sessionId } = await checkoutWithStripe(
				price,
				price.type === "recurring", // isSubscription
				"/account", // successPath
				currentPath, // cancelPath
			);

			if (errorRedirect) {
				return router.push(errorRedirect);
			}

			if (!sessionId) {
				return router.push(
					getErrorRedirect(
						currentPath,
						"An unknown error occurred.",
						"Please try again later or contact a system administrator.",
					),
				);
			}

			const stripe = await getStripe();
			await stripe?.redirectToCheckout({ sessionId });
		} catch (error) {
			console.error("Stripe checkout error:", error);
			router.push(
				getErrorRedirect(
					currentPath,
					"Payment processing failed.",
					"Please try again or contact support if the problem persists.",
				),
			);
		} finally {
			setPriceIdLoading(undefined);
		}
	};

	if (!product || !price) return null;

	const priceString = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: price.currency ?? "USD",
		minimumFractionDigits: 0,
	}).format((price.unit_amount ?? 0) / 100);

	return (
		<section
			className="relative h-full w-full overflow-hidden bg-gradient-to-b from-black via-[#0A0B0D] to-[#050506] px-4 py-16 sm:px-8 sm:py-24 lg:px-[10vw] lg:py-40"
			style={{
				perspective: "1500px",
				backgroundImage: `
                    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                `,
				backgroundSize: "80px 80px",
			}}
		>
			<StarField />

			<div className="relative z-10 mx-auto max-w-7xl">
				<div className="grid grid-cols-1 items-center gap-12 sm:gap-16 lg:grid-cols-2 lg:gap-32">
					{/* Left Content */}
					<div className="flex flex-col justify-center order-1 lg:order-1">
						<div className="relative space-y-6 sm:space-y-8 p-4 lg:p-0">
							<div className="space-y-3">
								{/* Category badge */}
								<div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30">
									<span className="font-russo text-xs font-semibold text-[#24FF66] uppercase tracking-wider">
										PREMIUM ACCESS
									</span>
								</div>
								
								<h2 className="font-russo text-white text-xl font-medium tracking-tight lg:text-2xl">
									Box Seat
								</h2>
								<div className="flex items-baseline gap-3">
									<h2 className="font-russo text-white text-4xl sm:text-5xl font-bold tracking-tight lg:text-6xl xl:text-7xl">
										{priceString}
									</h2>
									<span className="font-kodemono text-lg text-white/60">
										/month
									</span>
								</div>
							</div>

							<p
								className="font-russo text-white/80 max-w-xl text-base leading-relaxed sm:text-lg"
								style={{ textShadow: "0 0 8px rgba(200, 200, 255, 0.1)" }}
							>
								{product.description}
							</p>

							<div className="flex items-center gap-4">
								<StartButton
									onClick={handleStripeCheckout}
									variant="shimmer"
									disabled={priceIdLoading === price.id}
									isLoading={priceIdLoading === price.id}
								>
									<span className="flex items-center gap-3">
										{subscription ? "Manage Subscription" : "Get Started Now"}
									</span>
								</StartButton>
							</div>
						</div>
					</div>

					{/* Right Content */}
					<div className="order-2 lg:order-2">
						<div className="relative overflow-hidden rounded-2xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-6 sm:p-8">
							{/* Background glow */}
							<div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.02] via-transparent to-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
							
							{/* Top highlight */}
							<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />
							
							{/* Header */}
							<div className="mb-6 text-center">
								<h3 className="font-russo text-lg font-bold text-white uppercase tracking-tight mb-2">
									What's Included
								</h3>
								<div className="w-12 h-px bg-gradient-to-r from-transparent via-[#24FF66] to-transparent mx-auto" />
							</div>
							
							<BenefitsList benefits={PricingBenefits} />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

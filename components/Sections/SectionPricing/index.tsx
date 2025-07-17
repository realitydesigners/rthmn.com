"use client";

import { StartButton } from "@/components/Sections/StartNowButton";
import { getStripe } from "@/lib/stripe/client";
import { checkoutWithStripe } from "@/lib/stripe/server";
import { useUserStripeType } from "@/hooks/useUserStripeType";
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
    title: "Trend Hints (Coming Soon)",
    description: "See the trends as they happen on multiple dimensions",
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

const BenefitsList = memo(
  ({ benefits }: { benefits: typeof PricingBenefits }) => (
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
      {benefits.map((benefit, index) => (
        <div
          key={benefit.title}
          className="group relative overflow-hidden rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-3 sm:p-4 transition-all duration-300 hover:border-[#24FF66]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
        >
          <div className="pointer-events-none absolute inset-px rounded-xl bg-gradient-to-b from-white/[0.02] via-transparent to-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

          {/* Hover glow effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[#24FF66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative flex gap-2 sm:gap-3">
            <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30 shadow-lg shadow-[#24FF66]/[0.15]">
              <FaCheck className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-[#24FF66]" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-russo text-sm sm:text-base font-semibold text-white group-hover:text-[#24FF66] transition-colors duration-300">
                {benefit.title}
              </h3>
              <p className="font-outfit mt-1 text-xs sm:text-sm text-white/60 group-hover:text-white/80 transition-colors duration-300 leading-tight">
                {benefit.description}
              </p>
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-[#24FF66] to-transparent group-hover:w-full transition-all duration-500" />
        </div>
      ))}
    </div>
  )
);

BenefitsList.displayName = "BenefitsList";

export function SectionPricing({ user, products, subscription }: Props) {
  const router = useRouter();
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();
  const { isLegacy, isLoading: stripeTypeLoading } = useUserStripeType();

  const product = products[0];
  const price = product?.prices?.[0];

  const handleStripeCheckout = async () => {
    setPriceIdLoading(price.id);

    try {
      if (!user) {
        return router.push("/signin");
      }

      if (stripeTypeLoading) {
        console.log("Waiting for stripe type to load...");
        return;
      }

      const { errorRedirect, sessionId } = await checkoutWithStripe(
        price,
        price.type === "recurring", // isSubscription
        "/dashboard", // successPath
        currentPath // cancelPath
      );

      if (errorRedirect) {
        return router.push(errorRedirect);
      }

      if (!sessionId) {
        return router.push(
          getErrorRedirect(
            currentPath,
            "An unknown error occurred.",
            "Please try again later or contact a system administrator."
          )
        );
      }

      // Get the appropriate Stripe instance based on database lookup
      console.log(`🔍 PRICING - User ${user.id} isLegacy: ${isLegacy}`);
      const stripe = await getStripe(isLegacy);
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      router.push(
        getErrorRedirect(
          currentPath,
          "Payment processing failed.",
          "Please try again or contact support if the problem persists."
        )
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
      className="relative h-full w-full overflow-hidden bg-gradient-to-b from-black via-[#0A0B0D] to-[#050506] px-4 py-12 sm:px-8 sm:py-16 lg:px-[10vw] lg:py-24 xl:py-40"
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

      <div className="relative z-10 pt-12 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20 xl:gap-32">
          {/* Left Content */}
          <div className="flex flex-col justify-center order-1 lg:order-1">
            <div className="relative space-y-4 sm:space-y-6 lg:space-y-8 p-2 sm:p-4 lg:p-0">
              <div className="space-y-3">
                <h2 className="font-russo text-white text-xl font-medium tracking-tight lg:text-2xl">
                  Box Seat
                </h2>
                <div className="flex items-baseline gap-2 sm:gap-3">
                  <h2 className="font-russo text-white text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight lg:text-6xl xl:text-7xl">
                    {priceString}
                  </h2>
                  <span className="font-outfit text-sm sm:text-base lg:text-lg text-white/60">
                    /month
                  </span>
                </div>
              </div>

              <p
                className="font-outfit text-white/80 max-w-xl text-base leading-relaxed sm:text-lg"
                style={{ textShadow: "0 0 8px rgba(200, 200, 255, 0.1)" }}
              >
                In the Box Seat, you will get access to our dashboard where you
                can customize your trading experience, view fractals in the
                market using our 2D and 3D graphs. You will also get to chat
                with the founders daily in our discord community.
              </p>

              {/* Sign-in requirement notice for non-authenticated users */}
              {!user && (
                <div className="my-4  lg:inline-block pr-2 rounded-lg bg-gradient-to-r from-[#24FF66]/10 to-[#24FF66]/5 border border-[#24FF66]/20 p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex h-6 w-6 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-[#24FF66]/20 border border-[#24FF66]/30">
                      <span className="text-[#24FF66] font-bold text-xs sm:text-sm">
                        1
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-russo text-xs sm:text-sm font-medium text-white">
                        Sign in required first
                      </p>
                      <p className="font-outfit text-xs text-white/60 leading-tight">
                        Create your account, then choose your plan
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 sm:gap-4">
                <StartButton
                  onClick={handleStripeCheckout}
                  variant="shimmer"
                  disabled={priceIdLoading === price.id}
                  isLoading={priceIdLoading === price.id}
                >
                  <span className="flex items-center gap-2 sm:gap-3">
                    <span className="whitespace-nowrap">
                      {subscription
                        ? "Manage Subscription"
                        : !user
                          ? "Sign In & Get Started"
                          : "Get Started Now"}
                    </span>
                    {!user && (
                      <FaArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </span>
                </StartButton>
              </div>

              {/* Step indicator for non-authenticated users */}
              {!user && (
                <div className="mt-4">
                  {/* Mobile: Vertical layout */}
                  <div className="flex flex-col gap-3 sm:hidden">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-[#24FF66]/20 border border-[#24FF66]/30 flex items-center justify-center">
                        <span className="text-[#24FF66] font-bold text-xs">
                          1
                        </span>
                      </div>
                      <span className="font-outfit text-xs text-white/60">
                        Sign In
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <span className="text-white/60 font-bold text-xs">
                          2
                        </span>
                      </div>
                      <span className="font-outfit text-xs text-white/60">
                        Subscribe
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <span className="text-white/60 font-bold text-xs">
                          3
                        </span>
                      </div>
                      <span className="font-outfit text-xs text-white/60">
                        Start Trading
                      </span>
                    </div>
                  </div>

                  {/* Desktop: Horizontal layout */}
                  <div className="hidden sm:flex items-center gap-3 text-xs text-white/60">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-[#24FF66]/20 border border-[#24FF66]/30 flex items-center justify-center">
                        <span className="text-[#24FF66] font-bold text-xs">
                          1
                        </span>
                      </div>
                      <span className="font-outfit">Sign In</span>
                    </div>
                    <div className="h-px w-6 bg-white/20"></div>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <span className="text-white/60 font-bold text-xs">
                          2
                        </span>
                      </div>
                      <span className="font-outfit">Subscribe</span>
                    </div>
                    <div className="h-px w-6 bg-white/20"></div>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                        <span className="text-white/60 font-bold text-xs">
                          3
                        </span>
                      </div>
                      <span className="font-outfit">Start Trading</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Content */}
          <div className="order-2 lg:order-2">
            <div className="relative overflow-hidden  p-4 sm:p-6 lg:p-8">
              {/* Background glow */}

              <div className="mb-4 sm:mb-6 text-center">
                <h3 className="font-russo text-base sm:text-lg font-bold text-white uppercase tracking-tight mb-2">
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

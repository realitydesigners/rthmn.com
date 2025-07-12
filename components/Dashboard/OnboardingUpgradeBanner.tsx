"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { useOnboardingStore } from "@/stores/onboardingStore";
import { motion, AnimatePresence } from "framer-motion";
import { LuSparkles, LuTrendingUp, LuZap, LuCheck } from "react-icons/lu";
import { useState, useEffect } from "react";
import { checkoutWithStripe } from "@/lib/stripe/server";
import { getStripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

interface OnboardingUpgradeBannerProps {
  isVisible: boolean;
  onUpgrade: () => void;
  onSkip: () => void;
}

// Randomized message combinations
const BANNER_MESSAGES = [
  {
    title: "Unlock Premium",
    subtitle: "Get real-time data and advanced analytics",
  },
  {
    title: "Go Pro",
    subtitle: "Access professional trading tools",
  },
  {
    title: "Upgrade Required",
    subtitle: "Unlock live market insights",
  },
  {
    title: "Get Full Access",
    subtitle: "Access premium trading features",
  },
  {
    title: "Unlock Everything",
    subtitle: "Get advanced market data and signals",
  },
  {
    title: "Premium Awaits",
    subtitle: "Unlock real-time trading insights",
  },
  {
    title: "Level Up",
    subtitle: "Access pro-level trading features",
  },
  {
    title: "Upgrade Now",
    subtitle: "Get live data and trend analysis",
  },
];

export function OnboardingUpgradeBanner({
  isVisible,
  onUpgrade,
  onSkip,
}: OnboardingUpgradeBannerProps) {
  const { isSubscribed } = useSubscription();
  const { hasCompletedAllSteps } = useOnboardingStore();
  const pathname = usePathname();
  const [currentMessage, setCurrentMessage] = useState(BANNER_MESSAGES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration and randomize message after hydration
  useEffect(() => {
    setIsHydrated(true);
    // Randomize message after hydration to avoid hydration mismatch
    const randomIndex = Math.floor(Math.random() * BANNER_MESSAGES.length);
    setCurrentMessage(BANNER_MESSAGES[randomIndex]);
  }, []);

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const supabase = createClient();
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .eq("active", true)
          .order("metadata->index", { ascending: true });

        if (productsError) throw productsError;

        const { data: prices, error: pricesError } = await supabase
          .from("prices")
          .select("*")
          .eq("active", true);

        if (pricesError) throw pricesError;

        // Combine products with their prices
        const productsWithPrices = productsData.map((product) => {
          const productPrices = prices.filter(
            (price) => price.product_id === product.id
          );
          return {
            ...product,
            prices: productPrices,
          };
        });

        setProducts(productsWithPrices);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Handle upgrade with Stripe checkout in new tab
  const handleUpgradeClick = async () => {
    setIsLoading(true);

    try {
      const product = products[0];
      const price = product?.prices?.[0];

      if (!product || !price) {
        console.error("No product or price found");
        return;
      }

      // Create checkout session
      const { errorRedirect, sessionId } = await checkoutWithStripe(
        price,
        price.type === "recurring",
        "/account",
        "/dashboard"
      );

      if (errorRedirect) {
        console.error("Stripe checkout error:", errorRedirect);
        return;
      }

      if (!sessionId) {
        console.error("No session ID returned");
        return;
      }

      // Get Stripe instance and redirect to checkout in new tab
      const stripe = await getStripe();
      if (stripe) {
        // Open checkout in new tab
        const checkoutUrl = `https://checkout.stripe.com/c/pay/${sessionId}`;
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");

        // Don't hide the banner - let them complete the purchase first
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render until hydrated to avoid hydration mismatch
  if (!isHydrated) {
    return null;
  }

  // Don't show for existing subscribers
  if (isSubscribed) {
    return null;
  }

  // Don't show unless ALL steps (pages + tours) are completed
  if (!hasCompletedAllSteps()) {
    return null;
  }

  // Don't show on pricing page (it has its own upgrade flow)
  if (pathname === "/pricing") {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
            duration: 0.6,
          }}
          className="mb-6 "
        >
          <div className="group relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/3 via-white/8 to-white/3 rounded-lg blur-sm opacity-40" />

            {/* Main container */}
            <div
              className="relative overflow-hidden transition-all duration-300 hover:shadow-lg"
              style={{
                borderRadius: "8px",
                background:
                  "linear-gradient(135deg, #1A1D22 0%, #0F1114 50%, #1A1D22 100%)",
                border: "1px solid #32353C",
                boxShadow:
                  "0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
              }}
            >
              {/* Subtle shimmer effect */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/4 to-transparent"
                  animate={{
                    x: ["-100%", "100%"],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative p-4">
                <div className="flex items-center justify-between">
                  {/* Left section */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {/* Check icon */}
                      <motion.div
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: 0.2,
                          duration: 0.3,
                          type: "spring",
                        }}
                        className="w-8 h-8 bg-gradient-to-br from-[#24FF66] to-[#1ECC52] rounded-full flex items-center justify-center shadow-md"
                      >
                        <LuCheck className="w-4 h-4 text-black" />
                      </motion.div>
                    </div>

                    <div>
                      <motion.h3
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="text-white font-russo font-bold text-sm leading-tight"
                      >
                        {currentMessage.title}
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="text-white/50 font-russo text-xs mt-0.5"
                      >
                        {currentMessage.subtitle}
                      </motion.p>
                    </div>
                  </div>

                  {/* Features section */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                    className="grid grid-cols-2 gap-2 mx-4 lg:flex lg:items-center lg:gap-4 lg:mx-6"
                  >
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-md border border-white/10">
                      <LuTrendingUp className="w-3.5 h-3.5 text-white/70" />
                      <span className="text-white/70 font-russo font-medium text-xs">
                        Rthmn Grid
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-md border border-white/10">
                      <LuTrendingUp className="w-3.5 h-3.5 text-white/70" />
                      <span className="text-white/70 font-russo font-medium text-xs">
                        Live Prices
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-md border border-white/10 relative">
                      <LuSparkles className="w-3.5 h-3.5 text-white/70" />
                      <span className="text-white/70 font-russo font-medium text-xs">
                        Zen Mode
                      </span>
                      <span className="absolute -top-2 -right-6 bg-[#24FF66] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full font-outfit leading-none">
                        NEW
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-md border border-white/10 relative">
                      <LuSparkles className="w-3.5 h-3.5 text-white/70" />
                      <span className="text-white/70 font-russo font-medium text-xs">
                        Trend Hints
                      </span>
                      <span className="absolute -top-2 -right-6 bg-[#24FF66] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full font-outfit leading-none">
                        NEW
                      </span>
                    </div>
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    className="flex items-center"
                  >
                    <button
                      onClick={handleUpgradeClick}
                      disabled={isLoading}
                      className="group/btn relative overflow-hidden px-6 py-2.5 bg-gradient-to-r from-[#24FF66] to-[#1ECC52] rounded-lg font-russo font-bold text-black text-sm transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#24FF66]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {/* Button shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                        style={{ transform: "skewX(-12deg)" }}
                        animate={{
                          x: ["-100%", "100%"],
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                      />

                      <span className="relative z-10 flex items-center">
                        {isLoading ? "Loading..." : "Upgrade Now"}
                        <motion.div
                          animate={{ x: [0, 3, 0] }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        ></motion.div>
                      </span>
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

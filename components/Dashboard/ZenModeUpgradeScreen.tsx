"use client";

import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { LuZap } from "react-icons/lu";
import { checkoutWithStripe } from "@/lib/stripe/server";
import { getStripe } from "@/lib/stripe/client";
import { createClient } from "@/lib/supabase/client";

// Zen Mode Upgrade Screen Component
export const ZenModeUpgradeScreen = memo(() => {
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

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

  // Handle upgrade with Stripe checkout
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

      // Get Stripe instance and redirect to checkout
      const stripe = await getStripe();
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-150px)] w-full flex items-center justify-center bg-black">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 300,
          duration: 0.6,
        }}
        className="max-w-md w-full mx-4"
      >
        <div className="group relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#24FF66]/20 via-[#24FF66]/40 to-[#24FF66]/20 rounded-xl blur-sm opacity-60" />

          {/* Main container */}
          <div
            className="relative overflow-hidden transition-all duration-300"
            style={{
              borderRadius: "16px",
              background:
                "linear-gradient(180deg, #1A1D22 -10.71%, #0D0F12 100%)",
              border: "1px solid #16181C",
              boxShadow:
                "0px 12px 40px rgba(0, 0, 0, 0.6), 0px 8px 16px rgba(0, 0, 0, 0.4), 0px 4px 8px rgba(0, 0, 0, 0.25), inset 0px 1px 0px rgba(255, 255, 255, 0.02)",
            }}
          >
            {/* Content */}
            <div className="relative p-8 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.2,
                  duration: 0.3,
                  type: "spring",
                }}
                className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-[#24FF66] to-[#1ECC52] rounded-full flex items-center justify-center shadow-lg"
              >
                <LuZap className="w-8 h-8 text-black" />
              </motion.div>

              {/* Simple message */}
              <motion.p
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="text-white font-russo text-lg mb-8"
              >
                Zen Mode is available when you upgrade
              </motion.p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <button
                  onClick={handleUpgradeClick}
                  disabled={isLoading}
                  className="w-full relative overflow-hidden px-8 py-4 bg-gradient-to-r from-[#24FF66] to-[#1ECC52] rounded-xl font-russo font-bold text-black text-base transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#24FF66]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">
                    {isLoading ? "Processing..." : "Upgrade Now"}
                  </span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

ZenModeUpgradeScreen.displayName = "ZenModeUpgradeScreen";

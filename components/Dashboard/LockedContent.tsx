"use client";

import { useSubscription } from "@/hooks/useSubscription";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import { LuLock, LuSparkles } from "react-icons/lu";
import type React from "react";

interface LockedContentProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  blur?: boolean;
}

export function LockedContent({
  children,
  title = "Premium Feature",
  description = "Upgrade to access real-time data and advanced features",
  className,
  blur = true,
}: LockedContentProps) {
  const { isSubscribed, requireSubscription } = useSubscription();

  // If user is subscribed, show the content normally
  if (isSubscribed) {
    return <>{children}</>;
  }

  // For non-subscribers, show locked overlay
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Blurred content underneath */}
      <div
        className={cn(
          "transition-all duration-300",
          blur && "blur-sm grayscale opacity-30"
        )}
      >
        {children}
      </div>

      {/* Locked overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      >
        <div className="text-center p-6 max-w-sm mx-auto">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <LuLock className="text-white/60 w-8 h-8" />
              <LuSparkles className="absolute -top-1 -right-1 text-yellow-400 w-4 h-4" />
            </div>
          </div>

          <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
          <p className="text-white/70 text-sm mb-4">{description}</p>

          <button
            onClick={requireSubscription}
            className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors"
          >
            Upgrade Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}

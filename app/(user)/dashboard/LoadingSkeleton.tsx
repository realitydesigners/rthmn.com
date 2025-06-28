"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const NoInstruments = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <div className="max-w-sm rounded-lg border border-[#0A0B0D] bg-gradient-to-b from-[#0A0B0D] to-[#070809] p-4 sm:p-6">
        <h3 className="font-russo text-lg font-medium text-neutral-200">
          No Instruments Selected
        </h3>
        <p className="mt-2 text-sm primary-text">
          Click the chart icon in the left sidebar to browse and select trading
          pairs
        </p>
      </div>
    </div>
  );
};

// Enhanced zen mode loading with smooth fade out
export const ZenModeLoading = ({ isVisible }: { isVisible: boolean }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // Small delay to ensure the background is rendered first
      const timer = setTimeout(() => setShowContent(true), 50);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1],
        },
      }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] bg-black overflow-hidden"
      style={{
        width: "100vw",
        height: "100vh",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0A0B0D] to-black" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(36, 255, 102, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(36, 255, 102, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 0.9,
              transition: {
                duration: 0.4,
                ease: "easeOut",
              },
            }}
            transition={{
              duration: 0.6,
              ease: [0.2, 0, 0.2, 1],
              delay: 0.1,
            }}
            className="flex flex-col items-center gap-6"
          >
            {/* Advanced spinner */}
            <motion.div
              className="relative"
              exit={{
                scale: 0.8,
                opacity: 0,
                transition: {
                  duration: 0.3,
                  ease: "easeOut",
                },
              }}
            >
              {/* Outer ring */}
              <div className="w-16 h-16 border border-[#24FF66]/20 rounded-full" />

              {/* Spinning ring */}
              <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-[#24FF66] border-r-[#24FF66]/60 rounded-full animate-spin" />

              {/* Inner pulse */}
              <motion.div
                className="absolute inset-4 bg-[#24FF66]/10 rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-[#24FF66] rounded-full" />
              </div>
            </motion.div>

            {/* Text with typewriter effect */}
            <motion.div
              className="text-center"
              exit={{
                opacity: 0,
                y: 10,
                transition: {
                  duration: 0.3,
                  delay: 0.1,
                  ease: "easeOut",
                },
              }}
            >
              <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="font-russo text-lg font-bold text-white mb-2 uppercase tracking-wider"
              >
                Entering Zen Mode
              </motion.h3>
            </motion.div>

            {/* Loading progress indicator */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ delay: 0.4, duration: 1.2, ease: "easeOut" }}
              className="w-48 h-px bg-gradient-to-r from-transparent via-[#24FF66]/40 to-transparent"
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

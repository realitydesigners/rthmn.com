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
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 0.95,
        transition: {
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1], // Custom easing curve for smooth fade
        },
      }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
    >
      <motion.div
        className="flex flex-col items-center gap-4"
        exit={{
          y: -10,
          transition: {
            duration: 0.3,
            ease: "easeOut",
          },
        }}
      >
        {/* Enhanced spinner with fade out */}
        <motion.div
          className="relative"
          exit={{
            scale: 0.8,
            opacity: 0,
            transition: {
              duration: 0.25,
              ease: "easeOut",
            },
          }}
        >
          <div className="w-12 h-12 border-2 border-[#24FF66]/30 rounded-full" />
          <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-[#24FF66] rounded-full animate-spin" />
        </motion.div>

        {/* Enhanced text with staggered fade */}
        <motion.p
          className="font-russo text-sm text-[#818181] uppercase tracking-wider"
          exit={{
            opacity: 0,
            y: 5,
            transition: {
              duration: 0.2,
              delay: 0.1,
              ease: "easeOut",
            },
          }}
        >
          Entering Zen Mode
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

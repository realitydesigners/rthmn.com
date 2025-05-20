"use client";

import { cn } from "@/utils/cn";
import { motion } from "framer-motion";

interface MobilePanelWrapperProps {
  isOpen: boolean;
  title?: string;
  children: React.ReactNode;
  isCurrentTourStep?: boolean;
  isCompleted?: boolean;
}

export const MobilePanelWrapper = ({
  isOpen,
  title,
  children,
}: MobilePanelWrapperProps) => {
  const isPairsPanel = title === "pairs";

  return (
    <motion.div
      initial={false}
      animate={{
        y: isOpen ? 0 : "100%",
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className={cn(
        "fixed inset-x-0 bottom-0 z-[2040] transform border-t border-[#1C1E23]",
        isOpen ? "pointer-events-auto" : "pointer-events-none",
        isPairsPanel
          ? "bg-transparent"
          : "rounded-t-2xl bg-gradient-to-b from-[#0A0B0D] to-[#070809]"
      )}
      style={{
        height: isPairsPanel ? "calc(100vh - 80px)" : "calc(60vh)",
        boxShadow:
          isOpen && !isPairsPanel ? "0 -4px 16px rgba(0,0,0,0.2)" : "none",
      }}
    >
      <div
        className={cn(
          "h-full overflow-y-auto overscroll-contain",
          !isPairsPanel && "custom-scrollbar pt-2 pb-36 px-4 pb-safe"
        )}
      >
        {children}
      </div>

      {/* Bottom gradient fade */}
      {!isPairsPanel && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#070809] to-transparent" />
      )}
    </motion.div>
  );
};
